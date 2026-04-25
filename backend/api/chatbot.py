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

    if not body.stream:
        try:
            reply = await orchestrator.chat_once(body)
            return reply.model_dump(mode="json")
        except ChatError as e:
            raise HTTPException(status_code=503, detail=str(e)) from e

    async def event_source():
        try:
            async for evt in orchestrator.stream_chat(body):
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


def _fallback_reply(msg: str) -> str:
    """Smart offline fallback — answers common queries using local data when OpenAI is unavailable."""
    m = (msg or "").lower().strip()

    # --- Greetings ---
    if any(x in m for x in ("hello", "hi", "namaste", "namaskar", "नमस्ते", "नमस्कार", "हेलो")):
        return (
            "नमस्ते किसान भाई! 🙏 मैं KrishiAI हूं — आपका कृषि सहायक।\n\n"
            "आप मुझसे पूछ सकते हैं:\n"
            "• मंडी भाव (जैसे: गेहूं का भाव क्या है?)\n"
            "• सरकारी योजनाएं (PM-KISAN, PMFBY)\n"
            "• फसल सलाह, कीट प्रबंधन\n"
            "• मौसम आधारित खेती\n\n"
            "बताइए, कैसे मदद करूं?"
        )

    # --- Mandi / Price queries ---
    mandi_keywords = ("mandi", "price", "rate", "bhav", "भाव", "मंडी", "दाम", "रेट", "कीमत", "बेचना", "sell", "buy", "खरीद")
    if any(x in m for x in mandi_keywords):
        try:
            from api.mandi import MANDI_CROPS_DB
            # Try to find a specific crop
            matched = []
            crop_names_map = {
                "wheat": "Wheat", "गेहूं": "Wheat", "gehun": "Wheat",
                "rice": "Rice", "चावल": "Rice", "chawal": "Rice", "paddy": "Rice", "धान": "Rice",
                "soybean": "Soybean", "सोयाबीन": "Soybean",
                "cotton": "Cotton", "कपास": "Cotton", "kapas": "Cotton",
                "mustard": "Mustard", "सरसों": "Mustard", "sarson": "Mustard",
                "chana": "Chana", "चना": "Chana", "gram": "Chana",
                "tur": "Tur", "arhar": "Tur", "तूर": "Tur", "अरहर": "Tur", "dal": "Tur", "दाल": "Tur",
                "onion": "Onion", "प्याज": "Onion", "pyaj": "Onion",
                "potato": "Potato", "आलू": "Potato", "aloo": "Potato",
                "sugarcane": "Sugarcane", "गन्ना": "Sugarcane", "ganna": "Sugarcane",
                "maize": "Maize", "मक्का": "Maize", "makka": "Maize",
                "groundnut": "Groundnut", "मूंगफली": "Groundnut", "moongfali": "Groundnut",
            }
            for keyword, crop_key in crop_names_map.items():
                if keyword in m:
                    matched = [c for c in MANDI_CROPS_DB if crop_key.lower() in c["name"].lower()]
                    break

            if matched:
                crop = matched[0]
                trend_emoji = "📈" if crop["trend"] == "up" else "📉" if crop["trend"] == "down" else "➡️"
                return (
                    f"🌾 **{crop['name']}** — मंडी भाव\n\n"
                    f"💰 मॉडल प्राइस: **₹{crop['price']:,}** / {crop['unit']}\n"
                    f"📊 रेंज: ₹{crop['min_price']:,} — ₹{crop['max_price']:,}\n"
                    f"{trend_emoji} ट्रेंड: {crop['trend']} ({'+' if crop['change_percent'] > 0 else ''}{crop['change_percent']}%)\n"
                    f"📍 मंडी: {crop['mandi']}, {crop['state']}\n"
                    f"🚛 आवक: {crop['arrival_tonnes']:,} टन\n\n"
                    f"💡 सुझाव: बेचने से पहले enam.gov.in पर लाइव भाव जरूर चेक करें।"
                )
            else:
                # Show all prices summary
                lines = ["🏪 **आज के प्रमुख मंडी भाव (₹/क्विंटल):**\n"]
                for c in MANDI_CROPS_DB:
                    trend_emoji = "📈" if c["trend"] == "up" else "📉" if c["trend"] == "down" else "➡️"
                    lines.append(f"{trend_emoji} {c['name']}: **₹{c['price']:,}** ({c['mandi']})")
                lines.append("\n💡 किसी भी फसल का विस्तृत भाव जानने के लिए उसका नाम पूछें।")
                return "\n".join(lines)
        except Exception:
            pass

    # --- Government schemes ---
    scheme_keywords = ("scheme", "yojana", "योजना", "pm kisan", "pmfby", "subsidy", "सब्सिडी", "किसान", "बीमा", "insurance", "kcc", "credit card", "solar", "kusum")
    if any(x in m for x in scheme_keywords):
        try:
            from api.schemes import MOCK_SCHEMES_DB
            lines = ["🏛️ **प्रमुख सरकारी कृषि योजनाएं:**\n"]
            for s in MOCK_SCHEMES_DB[:5]:
                lines.append(f"✅ **{s['name']}**\n   {s['description'][:100]}...")
            lines.append("\n💡 अधिक जानकारी के लिए अपने नजदीकी CSC या कृषि विभाग से संपर्क करें।")
            return "\n".join(lines)
        except Exception:
            pass

    # --- Weather ---
    weather_keywords = ("weather", "mausam", "मौसम", "barish", "बारिश", "rain", "temperature", "तापमान", "forecast")
    if any(x in m for x in weather_keywords):
        return (
            "🌤️ मौसम जानकारी के लिए:\n\n"
            "1. Dashboard पर जाएं — वहां आपके लोकेशन का लाइव मौसम दिखेगा\n"
            "2. Weather पेज पर 7-दिन का forecast देख सकते हैं\n\n"
            "💡 खेती का सुझाव:\n"
            "• बारिश की संभावना > 60% हो तो सिंचाई टालें\n"
            "• तापमान > 38°C हो तो सुबह/शाम सिंचाई करें\n"
            "• आर्द्रता > 80% — फंगल रोगों की निगरानी रखें"
        )

    # --- Crop advice ---
    crop_keywords = ("crop", "fasal", "फसल", "sowing", "बुआई", "harvest", "कटाई", "fertilizer", "खाद", "urea", "dap", "irrigation", "सिंचाई", "seed", "बीज", "kharif", "rabi", "zaid", "खरीफ", "रबी")
    if any(x in m for x in crop_keywords):
        return (
            "🌾 **फसल सीजन गाइड:**\n\n"
            "**खरीफ (जून-जुलाई बुआई, सितंबर-अक्टूबर कटाई):**\n"
            "धान, मक्का, बाजरा, ज्वार, तूर, सोयाबीन, कपास, मूंगफली\n\n"
            "**रबी (अक्टूबर-नवंबर बुआई, मार्च-अप्रैल कटाई):**\n"
            "गेहूं, चना, मसूर, सरसों, जौ, मटर\n\n"
            "**जायद (मार्च-जून, सिंचाई जरूरी):**\n"
            "तरबूज, खरबूजा, खीरा, मूंग, उड़द\n\n"
            "💡 **खाद की मात्रा (गेहूं/एकड़):**\n"
            "• बुआई पर: 50 kg DAP + 25 kg MOP\n"
            "• पहली सिंचाई (21 दिन): 50 kg यूरिया\n"
            "• दूसरी सिंचाई: 25 kg यूरिया\n\n"
            "अपनी फसल का नाम बताएं, मैं विस्तृत सलाह दूंगा।"
        )

    # --- Pest / disease ---
    pest_keywords = ("pest", "keet", "कीट", "disease", "rog", "रोग", "bimari", "बीमारी", "spray", "दवाई", "fungus", "फफूंद", "insect", "kida", "कीड़ा")
    if any(x in m for x in pest_keywords):
        return (
            "🐛 **कीट एवं रोग प्रबंधन — सामान्य सुझाव:**\n\n"
            "1. **पहले जैविक उपाय अपनाएं:**\n"
            "   • नीम तेल 5 ml/लीटर पानी में मिलाकर छिड़काव\n"
            "   • ट्राइकोडर्मा से बीज उपचार (4 g/kg बीज)\n"
            "   • फेरोमोन ट्रैप 8/एकड़ लगाएं\n\n"
            "2. **रासायनिक दवाई (अंतिम विकल्प):**\n"
            "   • हमेशा लेबल पर लिखी मात्रा ही डालें\n"
            "   • सुबह या शाम छिड़काव करें\n"
            "   • मास्क, दस्ताने, पूरी बाहें पहनें\n"
            "   • हवा की दिशा में कभी स्प्रे न करें\n\n"
            "💡 अपनी फसल और लक्षण बताएं — मैं सटीक उपचार बताऊंगा।"
        )

    # --- Default ---
    return (
        "🌱 नमस्ते! मैं KrishiAI हूं — आपका AI कृषि सहायक।\n\n"
        "आप मुझसे पूछ सकते हैं:\n"
        "• 🏪 मंडी भाव — \"गेहूं का भाव बताओ\"\n"
        "• 🏛️ सरकारी योजनाएं — \"PM KISAN के बारे में बताओ\"\n"
        "• 🌾 फसल सलाह — \"रबी में क्या बोएं?\"\n"
        "• 🐛 कीट प्रबंधन — \"कपास में कीड़ा लगा है\"\n"
        "• 🌤️ मौसम — \"आज का मौसम कैसा है?\"\n\n"
        "कृपया अपना सवाल हिंदी या English में पूछें!"
    )

