"""Chat + voice-assistant routes.

Public surface:
  POST /api/chat/                 (legacy: {message} -> {reply}) — kept intact
  POST /api/chat/message          body: AssistantRequest, SSE stream by default
  POST /api/chat/stt              multipart file="audio" -> STTResult
  POST /api/chat/tts              body: TTSRequest -> audio/* or JSON browser hint
  POST /api/chat/session          create a session
  GET  /api/chat/session/{id}     fetch history
  DELETE /api/chat/session/{id}   delete / reset
  GET  /api/chat/health           provider + memory status
"""
from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, Response, StreamingResponse
from pydantic import BaseModel, Field

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    _HAS_SLOWAPI = True
except ImportError:
    _HAS_SLOWAPI = False

from core.config import settings
from schemas.chatbot import (
    AssistantHealth,
    AssistantProvider,
    AssistantRequest,
    SessionCreateRequest,
    SessionState,
    STTResult,
    TTSRequest,
)
from services.chat import stt_service, tts_service
from services.chat.chat_service import ChatError, get_orchestrator, health_info
from services.chat.memory import sessions
from services.chat.farmer_context import build_farmer_context

log = logging.getLogger(__name__)
router = APIRouter()


# --- rate limiting (no-op if slowapi missing) ---
if _HAS_SLOWAPI:
    limiter = Limiter(key_func=get_remote_address, default_limits=[])
else:
    limiter = None

_CHAT_LIMIT = f"{settings.CHAT_RATE_LIMIT_PER_MINUTE}/minute"


def _rate_limit(spec: str):
    def wrap(fn):
        if limiter is None:
            return fn
        return limiter.limit(spec)(fn)
    return wrap


# --- LEGACY (keeps existing /chatbot page working) ---
class _LegacyChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


@router.post("/")
@_rate_limit(_CHAT_LIMIT)
async def legacy_chat(request: Request, body: _LegacyChatRequest):
    """Thin wrapper around the new orchestrator so the old /chatbot page
    shares the upgraded brain without any frontend changes."""
    try:
        reply = await get_orchestrator().chat_once(
            AssistantRequest(message=body.message, stream=False)
        )
        return {
            "reply": reply.content,
            "language": reply.language,
            "session_id": reply.session_id,
        }
    except ChatError as e:
        log.warning("Legacy chat failed: %s", e)
        return {"reply": _fallback_reply(body.message), "language": "en"}


# --- /message (SSE streaming) ---
@router.post("/message")
@_rate_limit(_CHAT_LIMIT)
async def assistant_message(request: Request, body: AssistantRequest):
    orchestrator = get_orchestrator()
    # Cookie-authenticated users receive only a compact, server-built summary
    # of their own saved farm records. Anonymous chat remains available.
    farmer_context = build_farmer_context(request)

    if not body.stream:
        try:
            reply = await orchestrator.chat_once(body, farmer_context=farmer_context)
            return reply.model_dump(mode="json")
        except ChatError as e:
            raise HTTPException(status_code=503, detail=str(e)) from e

    async def event_source():
        try:
            async for evt in orchestrator.stream_chat(body, farmer_context=farmer_context):
                data = json.dumps(evt.get("data", {}), ensure_ascii=False)
                name = evt.get("event", "message")
                yield f"event: {name}\ndata: {data}\n\n"
        except Exception as e:
            log.exception("SSE stream crashed")
            err = json.dumps({"message": str(e)})
            yield f"event: error\ndata: {err}\n\n"

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# --- /stt ---
@router.post("/stt", response_model=STTResult)
@_rate_limit(_CHAT_LIMIT)
async def stt_endpoint(
    request: Request,
    audio: UploadFile = File(..., description="audio/webm, audio/wav, audio/mp4, audio/mpeg"),
    language: Optional[str] = Form(None, description="hint: en, hi, kn (optional)"),
):
    data = await audio.read()
    try:
        result = await stt_service.transcribe(
            data,
            filename=audio.filename or "audio.webm",
            content_type=audio.content_type or "audio/webm",
            language=language,
        )
    except stt_service.STTError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    return result


# --- /tts ---
@router.post("/tts")
@_rate_limit(_CHAT_LIMIT)
async def tts_endpoint(request: Request, body: TTSRequest):
    if body.prefer_browser:
        return JSONResponse({
            "browser": True,
            "language": body.language,
            "voice_suggestion": {"hi": "hi-IN", "kn": "kn-IN", "en": "en-IN"}.get(
                body.language, "en-IN"
            ),
        })

    try:
        out = await tts_service.synthesize(body.text, body.language)
    except tts_service.TTSError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    if hasattr(out, "browser"):
        return JSONResponse(out.model_dump())

    return Response(
        content=out.audio,
        media_type=out.mime,
        headers={"X-TTS-Provider": out.provider},
    )


# --- /session ---
@router.post("/session", response_model=SessionState)
async def create_session(body: SessionCreateRequest):
    return await sessions.create(language=body.language, location=body.location)


@router.get("/session/{session_id}", response_model=SessionState)
async def get_session(session_id: str):
    s = await sessions.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return s


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    await sessions.delete(session_id)
    return {"ok": True}


# --- /health ---
@router.get("/health", response_model=AssistantHealth)
async def assistant_health():
    h = health_info()
    tts_h = tts_service.health()
    providers = [
        AssistantProvider(name=h["model"], role="llm", configured=h["llm_configured"]),
        AssistantProvider(name="openai-whisper-1", role="stt", configured=stt_service.is_configured()),
        AssistantProvider(name="sarvam-bulbul", role="tts", configured=tts_h["sarvam"]),
        AssistantProvider(name="google-tts", role="tts", configured=tts_h["google"]),
        AssistantProvider(name="openai-tts-1", role="tts", configured=tts_h["openai"]),
    ]
    return AssistantHealth(
        providers=providers,
        memory_backend=h["memory_backend"],
        tools_enabled=h["tools_enabled"],
        rate_limit=f"{settings.CHAT_RATE_LIMIT_PER_MINUTE}/minute",
    )


def _fallback_reply(msg: str, lang: Optional[str] = None) -> str:
    """Intelligent agricultural offline engine — grounds answers in ICAR verified data and AGMARKNET."""
    m = (msg or "").strip().lower()
    
    # 1. Detect language
    from services.chat.language_detect import resolve_language
    detected_lang = resolve_language(lang or "auto", msg)

    # --- PADDY / RICE YELLOWING SPECIFIC DIAGNOSIS ---
    paddy_keywords = ("dhan", "धान", "paddy", "rice", "chawal", "चावल", "bhatta", "ಭತ್ತ")
    yellow_keywords = ("peele", "peela", "पीले", "पीला", "yellow", "chlorosis", "haladi", "ಹಳದಿ", "sukh", "सूख")
    if any(k in m for k in paddy_keywords) and any(y in m for y in yellow_keywords):
        if detected_lang == "kn":
            return (
                "ರೈತ ಮಿತ್ರರೇ, ಭತ್ತದ ಬೆಳೆ ಹಳದಿಯಾಗಲು ಮುಖ್ಯವಾಗಿ 3 ಕಾರಣಗಳಿರಬಹುದು:\n\n"
                "1. ಸತುವಿನ (Zinc) ಕೊರತೆ — ಖೈರಾ ರೋಗ: ಹೊಸ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಅಥವಾ ತುಕ್ಕು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.\n"
                "   • ಪರಿಹಾರ: ಎಕರೆಗೆ 5 ಕೆಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (21%) + 2.5 ಕೆಜಿ ಸುಣ್ಣವನ್ನು 200 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.\n\n"
                "2. ಸಾರಜನಕದ (Nitrogen) ಕೊರತೆ: ಹಳೆಯ ಕೆಳ ಎಲೆಗಳು ಮೊದಲು ಹಳದಿಯಾಗುತ್ತವೆ.\n"
                "   • ಪರಿಹಾರ: ಎಕರೆಗೆ 25-30 ಕೆಜಿ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.\n\n"
                "3. ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು (Stem Borer): ಗಿಡದ ಸುಳಿ ಒಣಗುತ್ತದೆ (Dead Heart).\n"
                "   • ಪರಿಹಾರ: ಬೇವಿನ ಎಣ್ಣೆ (Neem Oil) 5 ml/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ.\n\n"
                "💡 ನಿಖರ ತಪಾಸಣೆಗಾಗಿ ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕ್ರಾಪ್ ಡಾಕ್ಟರ್‌ನಲ್ಲಿ ಗಿಡದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."
            )
        elif detected_lang == "hi_en":
            return (
                "Kisan bhai, dhan ke paudhe peele padne ke mukhya 3 kaaran ho sakte hain:\n\n"
                "1. Zinc ki kami (Khaira Rog): Nayi pattiyon par katthai ya bhure dhabbe bante hain.\n"
                "   • Upaay: 5 kg Zinc Sulphate (21%) + 2.5 kg bujha hua choona 200 litre paani me milakar prati acre chhidkaav karein.\n\n"
                "2. Nitrogen ki kami: Neeche ki purani pattiyan pehle peeli padti hain.\n"
                "   • Upaay: 25-30 kg Urea prati acre top-dress karein.\n\n"
                "3. Tana Chhedak (Stem Borer): Bich ki goph sookh jaati hai.\n"
                "   • Upaay: Neem oil 5 ml/litre paani me milakar chhidkein.\n\n"
                "Aap batayein: Peela-pan nayi pattiyon par hai ya nichli pattiyon par? Ya KisaanBuddy Crop Doctor par photo upload karein."
            )
        elif detected_lang == "en":
            return (
                "Farmer friend, yellowing in paddy/rice plants typically occurs due to 3 primary reasons:\n\n"
                "1. Zinc Deficiency (Khaira Disease): Brown/bronze pigmentation on younger leaves.\n"
                "   • Remedy: Foliar spray of 5 kg Zinc Sulphate (21%) + 2.5 kg Slaked Lime per acre in 200 L water.\n\n"
                "2. Nitrogen Deficiency: General yellowing starting from bottom/older leaves upwards.\n"
                "   • Remedy: Top-dress 25-30 kg Urea per acre at active tillering.\n\n"
                "3. Yellow Stem Borer: Central shoot dries up (dead heart) during vegetative stage.\n"
                "   • Remedy: Spray Neem oil (NSKE 5%) or install pheromone traps @ 8/acre.\n\n"
                "Could you clarify if the yellowing is on lower or upper leaves? You can also upload a leaf photo to KisaanBuddy Crop Doctor."
            )
        else: # Hindi
            return (
                "किसान भाई, धान के पौधे पीले पड़ने के मुख्य रूप से 3 कारण होते हैं:\n\n"
                "1. जिंक की कमी (खैरा रोग): नई पत्तियों पर कत्थई या तांबे जैसे भूरे धब्बे बनते हैं और बढ़वार रुक जाती है।\n"
                "   • उपचार: 5 kg जिंक सल्फेट (21%) + 2.5 kg बुझा हुआ चूना 200 लीटर पानी में घोलकर प्रति एकड़ छिड़काव करें।\n\n"
                "2. नाइट्रोजन की कमी: पौधे की निचली पुरानी पत्तियां पहले नोक से पीली पड़कर सूखने लगती हैं।\n"
                "   • उपचार: 25 से 30 kg यूरिया प्रति एकड़ टॉप-ड्रेसिंग करें।\n\n"
                "3. तना छेदक (Stem Borer): पौधे की बीच की गोफ सूख जाती है जिसे 'डेड हार्ट' कहते हैं।\n"
                "   • उपचार: 5 ml नीम तेल प्रति लीटर पानी में मिलाकर छिड़काव करें।\n\n"
                "कृपया बताएं: पीलापन ऊपर की नई पत्तियों पर है या नीचे की पत्तियों पर? सटीक पहचान के लिए Crop Doctor पर फोटो अपलोड करें।"
            )

    # --- TOMATO SPECIFIC DISEASE ADVISORY ---
    tomato_keywords = ("tamatar", "tomato", "टमाटर", "ಟೊಮೆಟೊ")
    disease_words = ("bimari", "disease", "rog", "बीमारी", "रोग", "keeda", "keet", "कीट", "धब्बे", "spot", "curl", "blight", "ರೋಗ")
    if any(k in m for k in tomato_keywords) and any(d in m for d in disease_words):
        if detected_lang == "kn":
            return (
                "ರೈತ ಮಿತ್ರರೇ, ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ ಕಂಡುಬರುವ ಪ್ರಮುಖ ರೋಗಗಳು:\n\n"
                "1. ಅರ್ಲಿ ಬ್ಲೈಟ್ (Early Blight): ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ದುಂಡಗಿನ ಉಂಗುರದಂತಹ ಚುಕ್ಕೆಗಳು.\n"
                "   • ಪರಿಹಾರ: ಮ್ಯಾಂಕೋಜೆಬ್ 75 WP (Mancozeb) @ 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ.\n\n"
                "2. ಎಲೆ ಸುರುಟು ರೋಗ (Leaf Curl Virus): ಎಲೆಗಳು ಮೇಲ್ಮುಖವಾಗಿ ಸುರುಟಿಕೊಳ್ಳುತ್ತವೆ ಮತ್ತು ಬಿಳಿ ನೊಣ ಹರಡುತ್ತದೆ.\n"
                "   • ಪರಿಹಾರ: ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು (Yellow sticky traps) ಎಕರೆಗೆ 10-12 ಅಳವಡಿಸಿ, ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.\n\n"
                "3. ಬಾಡುವಿಕೆ (Bacterial/Fungal Wilt): ಗಿಡಗಳು ಹಸಿರಾಗಿರುವಾಗಲೇ ಇದ್ದಕ್ಕಿದ್ದಂತೆ ಬಾಡಿಹೋಗುತ್ತವೆ.\n"
                "   • ಪರಿಹಾರ: ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡಿ (Trichoderma viride) 2 ಕೆಜಿ/ಎಕರೆ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರದೊಂದಿಗೆ ಬುಡಕ್ಕೆ ಹಾಕಿ.\n\n"
                "💡 ಔಷಧಿ ಸಿಂಪಡಿಸಲು ಸ್ಪ್ರೇಯರ್ ಅಗತ್ಯವಿದ್ದರೆ ಕಿಸಾನ್‌ಬಡ್ಡಿ ಮಾರ್ಕೆಟ್‌ಪ್ಲೇಸ್‌ನಲ್ಲಿ ಲಭ್ಯವಿದೆ."
            )
        elif detected_lang == "hi_en":
            return (
                "Kisan bhai, tamatar me mukhya roop se ye 3 bimariyan lagti hain:\n\n"
                "1. Ageti Jhulsa (Early Blight): Pattiyon par concentric rings (chhalle-daar) bhure daag bante hain.\n"
                "   • Ilaj: Mancozeb 75 WP @ 2.5 gram prati litre paani me gholkar spray karein.\n\n"
                "2. Patti Marod Rog (Leaf Curl): Pattiyan upar ki taraf mud jaati hain jo whitefly se failta hai.\n"
                "   • Ilaj: Pila sticky trap (10/acre) lagayein aur Neem oil 5 ml/L spray karein.\n\n"
                "3. Uktha / Murjhana (Wilt): Paudha achanak murjha kar sukhne lagta hai.\n"
                "   • Ilaj: Trichoderma viride 2 kg/acre gobar ki khad me milakar jadon ke paas daalein.\n\n"
                "Spray karte samay mask aur dastane zaroor pehnein. Spray equipment ke liye KisaanBuddy Marketplace check karein."
            )
        elif detected_lang == "en":
            return (
                "Farmer friend, here is the diagnosis for common tomato diseases based on ICAR guidelines:\n\n"
                "1. Early Blight (Alternaria solani): Concentric 'target-board' dark brown rings on lower leaves with yellow halo.\n"
                "   • Treatment: Spray Mancozeb 75 WP @ 2.5 g/L of water. Repeat after 12 days if disease persists.\n\n"
                "2. Leaf Curl Virus: Stunted plants with leaves curling upwards, thickened and puckered, transmitted by whiteflies.\n"
                "   • Treatment: Install yellow sticky traps (10/acre) and spray Neem oil (1500 ppm) @ 5 ml/L.\n\n"
                "3. Late Blight (Phytophthora): Water-soaked dark lesions during cool, humid weather.\n"
                "   • Treatment: Spray Metalaxyl 8% + Mancozeb 64% WP @ 2 g/L.\n\n"
                "Safety Reminder: Wear PPE mask and gloves while spraying. Observe 15-day pre-harvest interval."
            )
        else: # Hindi
            return (
                "किसान भाई, टमाटर की फसल में मुख्य रूप से 3 प्रकार की बीमारियां लगती हैं:\n\n"
                "1. अगेती झुलसा (Early Blight): पत्तियों पर गोल छल्लेदार कत्थई-भूरे धब्बे बनते हैं और पत्तियां पीली पड़कर गिरती हैं।\n"
                "   • उपचार: मैंकोजेब 75% WP (Mancozeb) @ 2.5 ग्राम प्रति लीटर पानी में घोलकर छिड़काव करें।\n\n"
                "2. पत्ती मरोड़ रोग (Leaf Curl Virus): पत्तियां ऊपर की ओर मुड़कर छोटी और कड़ी हो जाती हैं, यह सफेद मक्खी से फैलता है।\n"
                "   • उपचार: 10 पीले चिपचिपे ट्रैप (Yellow Sticky Traps) प्रति एकड़ लगाएं और 5 ml नीम तेल/लीटर का छिड़काव करें।\n\n"
                "3. उकठा रोग (Wilt): पौधा अचानक हरा ही सूखने लगता है।\n"
                "   • उपचार: ट्राइकोडर्मा विरिडी (2 kg/एकड़) सड़ी गोबर की खाद में मिलाकर जड़ों में डालें।\n\n"
                "⚠️ सुरक्षा निर्देश: दवा छिड़कते समय मास्क और दस्ताने जरूर पहनें। फल तुड़ाई से 15 दिन पहले छिड़काव बंद करें।"
            )

    # --- GENERAL CROP DISEASE & PEST ADVISORY ---
    general_pest = ("pest", "keet", "कीट", "disease", "rog", "रोग", "bimari", "बीमारी", "spray", "दवाई", "fungus", "kida", "कीड़ा", "कीट", "blight", "rust")
    if any(x in m for x in general_pest):
        if detected_lang == "kn":
            return (
                "ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣೆಗೆ ಐಸಿಎಆರ್ ಅನುಮೋದಿತ ಸಲಹೆಗಳು:\n"
                "1. ಜೈವಿಕ ನಿಯಂತ್ರಣ: ಬೇವಿನ ಎಣ್ಣೆ (Neem Oil 5 ml/L) ಅಥವಾ ಟ್ರೈಕೋಡರ್ಮಾ ಬಳಸುವುದರಿಂದ ಆರಂಭಿಕ ರೋಗಗಳು ತಡೆಯಲ್ಪಡುತ್ತವೆ.\n"
                "2. ರಾಸಾಯನಿಕ ಬಳಕೆ: ಕೇವಲ ತೀವ್ರ ಹಂತದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣದಲ್ಲಿ ಮಾತ್ರ ಬಳಸಿ.\n"
                "3. ಸುರಕ್ಷತೆ: ಸಿಂಪರಣೆ ವೇಳೆ ಮುಖಗವಸು ಮತ್ತು ಕೈಗವಸು ಧರಿಸಿ, ಗಾಳಿಯ ವಿರುದ್ಧ ದಿಕ್ಕಿನಲ್ಲಿ ಸಿಂಪಡಿಸಬೇಡಿ.\n\n"
                "ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ರೋಗದ ಲಕ್ಷಣ ತಿಳಿಸಿ, ನಿಖರ ಔಷಧಿ ಮತ್ತು ಪ್ರಮಾಣ ಹೇಳುತ್ತೇವೆ."
            )
        elif detected_lang == "hi_en":
            return (
                "Keet aur Rog Prabandhan ke mukhya sujhav:\n"
                "1. Jaivik Upaay: Neem tel 5 ml/litre paani me milakar chhidkein ya Trichoderma se upchar karein.\n"
                "2. Rasayanik Dawa: Kewal aavashyakta hone par CIBRC approved dava hi nirdharit matra me lein.\n"
                "3. Suraksha: Mask aur gloves pehnein, subah ya shaam hi spray karein.\n\n"
                "Apni fasal aur lakshan batayein, hum nishchit upchar batayenge."
            )
        elif detected_lang == "en":
            return (
                "Integrated Pest & Disease Management Guidelines:\n"
                "1. Organic/Bio first: Use Neem oil (5 ml/L) or Trichoderma viride seed/soil treatment to suppress pathogens.\n"
                "2. Chemical control: Use only registered CIBRC formulations at exact prescribed dosages.\n"
                "3. Safety: Always wear protective mask, gloves, and full-sleeve clothing. Never spray against the wind.\n\n"
                "Please specify your crop and visible symptoms for an exact ICAR protocol."
            )
        else: # Hindi
            return (
                "कीट एवं रोग प्रबंधन — आईसीएआर (ICAR) प्रमाणित दिशा-निर्देश:\n\n"
                "1. पहले जैविक उपाय: नीम तेल (5 ml/लीटर) का छिड़काव करें या ट्राइकोडर्मा विरिडी से बीज व भूमि उपचार करें।\n"
                "2. फेरोमोन ट्रैप: कीटों की निगरानी के लिए 8 फेरोमोन ट्रैप प्रति एकड़ लगाएं।\n"
                "3. रासायनिक दवा: बीमारी अधिक होने पर ही केंद्रीय कीटनाशक बोर्ड (CIBRC) द्वारा अनुशंसित दवा का प्रयोग करें।\n"
                "⚠️ सुरक्षा: मास्क और दस्ताने पहनें, सुबह या शाम के समय शांत हवा में ही स्प्रे करें।\n\n"
                "कृपया अपनी फसल का नाम और लक्षण बताएं, मैं सटीक दवा और मात्रा बताऊंगा।"
            )

    # --- MANDI PRICES ---
    mandi_keywords = ("mandi", "price", "rate", "bhav", "भाव", "मंडी", "दाम", "रेट", "कीमत", "बेचना", "sell", "ಮಂಡಿ", "ದರ")
    if any(x in m for x in mandi_keywords):
        try:
            from db.session import SessionLocal
            from db.models import MarketPriceRecord
            from sqlalchemy import desc

            with SessionLocal() as db:
                crop_names_map = {
                    "wheat": "Wheat", "गेहूं": "Wheat", "gehun": "Wheat", "ಗೋಧಿ": "Wheat",
                    "rice": "Rice", "चावल": "Rice", "chawal": "Rice", "paddy": "Rice", "धान": "Rice", "ಭತ್ತ": "Rice",
                    "soybean": "Soybean", "सोयाबीन": "Soybean",
                    "cotton": "Cotton", "कपास": "Cotton", "kapas": "Cotton", "ಹತ್ತಿ": "Cotton",
                    "mustard": "Mustard", "सरसों": "Mustard", "sarson": "Mustard", "ಸಾಸಿವೆ": "Mustard",
                    "chana": "Chana", "चना": "Chana", "gram": "Chana", "ಕಡಲೆ": "Chana",
                    "tur": "Tur", "arhar": "Tur", "तूर": "Tur", "अरहर": "Tur", "ತೊಗರಿ": "Tur",
                    "onion": "Onion", "प्याज": "Onion", "pyaj": "Onion", "ಈರುಳ್ಳಿ": "Onion",
                    "potato": "Potato", "आलू": "Potato", "aloo": "Potato", "ಆಲೂಗಡ್ಡೆ": "Potato",
                    "tomato": "Tomato", "टमाटर": "Tomato", "tamatar": "Tomato", "ಟೊಮೆಟೊ": "Tomato",
                    "maize": "Maize", "मक्का": "Maize", "makka": "Maize", "ಮೆಕ್ಕೆಜೋಳ": "Maize",
                }

                target_crop = None
                for keyword, crop_key in crop_names_map.items():
                    if keyword in m:
                        target_crop = crop_key
                        break

                if target_crop:
                    rec = (
                        db.query(MarketPriceRecord)
                        .filter(MarketPriceRecord.commodity.ilike(f"%{target_crop}%"))
                        .order_by(desc(MarketPriceRecord.arrival_date))
                        .first()
                    )
                    if rec:
                        date_str = rec.arrival_date.isoformat() if rec.arrival_date else "हाल ही में"
                        if detected_lang == "kn":
                            return (
                                f"🌾 {rec.commodity} — ಅಧಿಕೃತ ಮಂಡಿ ದರ (AGMARKNET):\n"
                                f"• ಮಾಡಲ್ ದರ: ₹{int(rec.modal_price):,} / ಕ್ವಿಂಟಾಲ್\n"
                                f"• ಕನಿಷ್ಠ - ಗರಿಷ್ಠ: ₹{int(rec.min_price):,} - ₹{int(rec.max_price):,}\n"
                                f"• ಮಾರುಕಟ್ಟೆ: {rec.market_center}, {rec.state}\n"
                                f"• ದಿನಾಂಕ: {date_str}"
                            )
                        elif detected_lang in ("en", "hi_en"):
                            return (
                                f"🌾 {rec.commodity} — Mandi Price (AGMARKNET Official):\n"
                                f"• Modal Price: ₹{int(rec.modal_price):,} / quintal\n"
                                f"• Min - Max: ₹{int(rec.min_price):,} - ₹{int(rec.max_price):,}\n"
                                f"• Market: {rec.market_center}, {rec.state}\n"
                                f"• Date: {date_str}"
                            )
                        else:
                            return (
                                f"🌾 {rec.commodity} ({rec.variety or 'FAQ'}) — आधिकारिक मंडी भाव (AGMARKNET):\n\n"
                                f"💰 मॉडल भाव: ₹{int(rec.modal_price):,} प्रति क्विंटल\n"
                                f"📊 न्यूनतम - अधिकतम: ₹{int(rec.min_price):,} — ₹{int(rec.max_price):,}\n"
                                f"📍 मंडी केंद्र: {rec.market_center}, {rec.district or ''} ({rec.state})\n"
                                f"📅 तारीख: {date_str}\n\n"
                                f"💡 KisaanBuddy सलाह: मंडी ले जाने से पहले परिवहन खर्च घटाकर शुद्ध मुनाफा जरूर आंकें।"
                            )

                recent = (
                    db.query(MarketPriceRecord)
                    .order_by(desc(MarketPriceRecord.arrival_date))
                    .limit(5)
                    .all()
                )
                if recent:
                    lines = ["🏪 नवीनतम आधिकारिक मंडी भाव (AGMARKNET):\n"]
                    for r in recent:
                        lines.append(f"• {r.commodity}: ₹{int(r.modal_price):,}/क्विंटल ({r.market_center}, {r.state})")
                    lines.append("\n💡 किसी खास फसल का भाव जानने के लिए फसल का नाम पूछें (जैसे: 'गेहूं का भाव बताएं')।")
                    return "\n".join(lines)
        except Exception:
            pass

    # --- MARKETPLACE INQUIRIES ---
    market_keywords = ("tractor", "ट्रेक्टर", "ट्रैक्टर", "kiraya", "rent", "किराया", "sprayer", "marketplace", "kharid", "market", "ಖರೀದಿ", "ಬಾಡಿಗೆ")
    if any(x in m for x in market_keywords):
        try:
            from db.session import SessionLocal
            from db.models import EquipmentListing
            with SessionLocal() as db:
                eqs = db.query(EquipmentListing).filter(EquipmentListing.availability_status == "available").limit(3).all()
                if eqs:
                    lines = ["🚜 KisaanBuddy Marketplace — उपलब्ध वास्तविक उपकरण:\n"]
                    for e in eqs:
                        p = f"₹{int(e.price):,}/{e.price_unit}" if e.price else "वार्ता योग्य"
                        lines.append(f"• {e.title or e.model_name} ({e.listing_type.title()}): {p} | {e.district}, {e.state}")
                    lines.append("\n💡 संपर्क के लिए KisaanBuddy Marketplace पेज पर जाएं।")
                    return "\n".join(lines)
        except Exception:
            pass

    # --- GOVERNMENT SCHEMES ---
    scheme_keywords = ("scheme", "yojana", "योजना", "pm kisan", "pmfby", "subsidy", "सब्सिडी", "kcc", "ಯೋಜನೆ")
    if any(x in m for x in scheme_keywords):
        if detected_lang == "kn":
            return (
                "🏛️ ಪ್ರಮುಖ ಕೃಷಿ ಯೋಜನೆಗಳು:\n"
                "1. PM-KISAN: ಅರ್ಹ ರೈತರಿಗೆ ವಾರ್ಷಿಕ ₹6,000 (3 ಕಂತುಗಳಲ್ಲಿ ತಲಾ ₹2,000).\n"
                "2. PMFBY (ಬೆಳೆ ವಿಮೆ): ಮುಂಗಾರು ಬೆಳೆಗೆ 2%, ಹಿಂಗಾರು ಬೆಳೆಗೆ 1.5% ಪ್ರೀಮಿಯಂ.\n"
                "3. KCC (ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್): ಶೇ. 4 ಬಡ್ಡಿದರದಲ್ಲಿ ₹3 ಲಕ್ಷದವರೆಗೆ ಸಾಲ.\n"
                "4. ಪಿಎಂ ಕುಸುಮ್: ಸೋಲಾರ್ ಪಂಪ್‌ಸೆಟ್‌ಗಳಿಗೆ ಶೇ. 60 ಸಬ್ಸಿಡಿ."
            )
        elif detected_lang in ("en", "hi_en"):
            return (
                "🏛️ Key Government Agricultural Schemes:\n"
                "1. PM-KISAN: ₹6,000 per year in 3 installments of ₹2,000 directly to bank accounts.\n"
                "2. PMFBY (Crop Insurance): 2% premium for Kharif, 1.5% for Rabi crops.\n"
                "3. Kisan Credit Card (KCC): Up to ₹3 Lakh loan at effectively 4% interest rate on timely repayment.\n"
                "4. PM-KUSUM: Up to 60% subsidy on solar agriculture pumps."
            )
        else: # Hindi
            return (
                "🏛️ प्रमुख सरकारी कृषि योजनाएं:\n\n"
                "1. PM-KISAN (पीएम किसान): पात्र किसानों को ₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में) सीधे बैंक खाते में।\n"
                "2. PMFBY (फसल बीमा योजना): खरीफ फसल के लिए 2%, रबी के लिए 1.5% और बागवानी के लिए 5% प्रीमियम।\n"
                "3. KCC (किसान क्रेडिट कार्ड): समय पर चुकाने पर मात्र 4% प्रभावी ब्याज दर पर ₹3 लाख तक ऋण।\n"
                "4. PM-KUSUM (सोलर पंप योजना): सोलर सिंचाई पंप लगाने पर केंद्र व राज्य सरकार द्वारा 60% तक अनुदान।"
            )

    # --- GREETINGS & DEFAULT ---
    words = m.split()
    if any(x in words for x in ("hello", "hi", "hey")) or any(x in m for x in ("namaste", "namaskar", "नमस्ते", "नमस्कार", "हेलो", "ಪ್ರಣಾಮ", "ನಮಸ್ಕಾರ")):
        if detected_lang == "kn":
            return (
                "ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! 🙏 ನಾನು ಕಿಸಾನ್‌ಬಡ್ಡಿ ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್.\n\n"
                "ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು:\n"
                "• ಮಂಡಿ ದರ (ಉದಾ: ಗೋಧಿ ಅಥವಾ ಭತ್ತದ ದರ)\n"
                "• ಬೆಳೆ ರೋಗ ಮತ್ತು ಔಷಧೋಪಚಾರ\n"
                "• ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಯೋಜನೆಗಳು\n\n"
                "ಹೇಳಿ, ಇಂದು ನಿಮ್ಮ ಕೃಷಿಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
            )
        elif detected_lang in ("en", "hi_en"):
            return (
                "Namaste farmer! 🙏 I am KisaanBuddy — your trusted AI agricultural voice assistant.\n\n"
                "You can ask me about:\n"
                "• Live Mandi Prices (e.g., 'Wheat mandi price today')\n"
                "• Crop Disease Diagnosis & Remedies\n"
                "• Weather Forecast & Farming advisory\n"
                "• Equipment Rental on Marketplace\n\n"
                "How can I assist your farm today?"
            )
        else:
            return (
                "नमस्ते किसान भाई! 🙏 मैं KisaanBuddy हूं — आपका अपना कृषि वॉइस सहायक।\n\n"
                "आप मुझसे बोलकर पूछ सकते हैं:\n"
                "• 🌾 फसल रोग एवं उपचार (जैसे: 'धान के पौधे पीले पड़ रहे हैं')\n"
                "• 🏪 मंडी भाव (जैसे: 'गेहूं का आज का भाव बताएं')\n"
                "• 🚜 किराए पर ट्रैक्टर व उपकरण (KisaanBuddy Marketplace)\n"
                "• 🏛️ सरकारी योजनाएं (PM-KISAN, PMFBY, KCC)\n"
                "• 🌤️ मौसम आधारित कृषि सलाह\n\n"
                "बताइए, आज आपकी खेती में क्या मदद करूं?"
            )

    # General Fallback
    if detected_lang == "kn":
        return (
            "ನಮಸ್ಕಾರ! ಕೃಷಿ ಸಂಬಂಧಿತ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ — ಮಂಡಿ ದರ, ಬೆಳೆ ರೋಗ, ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು. ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ."
        )
    elif detected_lang in ("en", "hi_en"):
        return (
            "Hello! Please ask any farming question — crop diagnosis, fertilizer dosage, mandi rates, or government schemes. I am here to help."
        )
    else:
        return (
            "🌱 नमस्ते किसान भाई! आप खेती से जुड़ा कोई भी सवाल पूछ सकते हैं — जैसे फसल में कीट/रोग, खाद की मात्रा, मंडी भाव या मौसम। बताइए, किस फसल के बारे में जानकारी चाहिए?"
        )

