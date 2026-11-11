"""Chat + voice-assistant routes powered by Google Gemini.

Public surface:
  POST /api/chat/                 (legacy: {message} -> {reply}) — kept intact
  POST /api/chat/message          body: AssistantRequest, SSE stream by default
  POST /api/chat/stt              multipart file="audio" -> STTResult
  POST /api/chat/tts              body: TTSRequest -> audio/* or JSON browser hint
  POST /api/chat/session          create a session
  GET  /api/chat/session/{id}     fetch history
  DELETE /api/chat/session/{id}   delete / reset
  GET  /api/chat/health           provider + memory status (no secrets)
  GET  /api/chat/usage            admin-only token usage & logs
"""
from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import JSONResponse, Response, StreamingResponse
from pydantic import BaseModel, Field

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    _HAS_SLOWAPI = True
except ImportError:
    _HAS_SLOWAPI = False

from api.auth import require_admin
from core.config import settings
from db.models import User
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
from services.chat.farmer_context import build_farmer_context, get_optional_user_id
from services.chat.gemini_service import (
    GeminiBadRequestError,
    is_gemini_configured,
    prepare_crop_image,
    redact_secrets,
    usage_tracker,
)
from services.chat.memory import sessions

log = logging.getLogger(__name__)
router = APIRouter()


# --- rate limiting (no-op if slowapi missing) ---
if _HAS_SLOWAPI:
    limiter = Limiter(key_func=get_remote_address, default_limits=[])
else:
    limiter = None

_CHAT_LIMIT = f"{settings.CHAT_RATE_LIMIT_PER_MINUTE}/minute"
_VISION_LIMIT = f"{settings.CHAT_VISION_RATE_LIMIT_PER_MINUTE}/minute"


def _rate_limit(spec: str):
    def wrap(fn):
        if limiter is None:
            return fn
        return limiter.limit(spec)(fn)
    return wrap


# --- LEGACY (keeps older callers working) ---
class _LegacyChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


@router.post("/")
@_rate_limit(_CHAT_LIMIT)
async def legacy_chat(request: Request, body: _LegacyChatRequest):
    """Thin wrapper around the Gemini orchestrator for legacy callers."""
    user_id = get_optional_user_id(request)
    farmer_context = build_farmer_context(request)
    try:
        reply = await get_orchestrator().chat_once(
            AssistantRequest(message=body.message, stream=False),
            farmer_context=farmer_context,
            user_id=user_id,
        )
        return {
            "reply": reply.content,
            "language": reply.language,
            "session_id": reply.session_id,
            "provider": reply.provider,
        }
    except ChatError as e:
        log.warning("Legacy chat failed (%s): %s", e.code, redact_secrets(str(e)))
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e


# --- /message (SSE streaming + non-stream JSON) ---
@router.post("/message")
@_rate_limit(_CHAT_LIMIT)
async def assistant_message(request: Request, body: AssistantRequest):
    orchestrator = get_orchestrator()
    user_id = get_optional_user_id(request)
    # Cookie-authenticated users receive only a compact, server-built summary
    # of their own saved farm records. Anonymous chat remains available.
    farmer_context = build_farmer_context(request)

    if not body.stream:
        if body.image_base64:
            try:
                prepare_crop_image(body.image_base64)
            except GeminiBadRequestError as e:
                raise HTTPException(status_code=e.status_code, detail=e.user_message) from e
        try:
            reply = await orchestrator.chat_once(
                body, farmer_context=farmer_context, user_id=user_id
            )
            return reply.model_dump(mode="json")
        except ChatError as e:
            raise HTTPException(status_code=e.status_code, detail=str(e)) from e

    async def event_source():
        try:
            async for evt in orchestrator.stream_chat(
                body, farmer_context=farmer_context, user_id=user_id
            ):
                data = json.dumps(evt.get("data", {}), ensure_ascii=False)
                name = evt.get("event", "message")
                yield f"event: {name}\ndata: {data}\n\n"
        except Exception as e:
            log.exception("SSE stream crashed: %s", redact_secrets(str(e)))
            err = json.dumps({"message": "Assistant streaming error. Please retry.", "code": "stream_error"})
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
_ALLOWED_AUDIO_MIME_PREFIXES = (
    "audio/",
    "application/octet-stream",
    "video/webm",  # some browsers label MediaRecorder webm as video/webm
)


@router.post("/stt", response_model=STTResult)
@_rate_limit(_CHAT_LIMIT)
async def stt_endpoint(
    request: Request,
    audio: UploadFile = File(..., description="audio/webm, audio/wav, audio/mp4, audio/mpeg"),
    language: Optional[str] = Form(None, description="hint: en, hi, kn, etc. (optional)"),
):
    ctype = (audio.content_type or "audio/webm").lower().split(";")[0].strip()
    if ctype and not any(ctype.startswith(p) for p in _ALLOWED_AUDIO_MIME_PREFIXES):
        raise HTTPException(status_code=400, detail=f"Unsupported audio MIME type: {ctype}")

    data = await audio.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
    if len(data) > stt_service.MAX_BYTES:
        raise HTTPException(status_code=413, detail="Audio file exceeds 25 MB limit.")

    try:
        result = await stt_service.transcribe(
            data,
            filename=audio.filename or "audio.webm",
            content_type=ctype or "audio/webm",
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
        lang_for_voice = body.language if body.language != "auto" else "hi"
        return JSONResponse({
            "browser": True,
            "language": body.language,
            "voice_suggestion": {"hi": "hi-IN", "kn": "kn-IN", "en": "en-IN"}.get(
                lang_for_voice, "en-IN"
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
@_rate_limit(_CHAT_LIMIT)
async def create_session(request: Request, body: SessionCreateRequest):
    user_id = get_optional_user_id(request)
    return await sessions.create(language=body.language, location=body.location, user_id=user_id)


@router.get("/session/{session_id}", response_model=SessionState)
async def get_session(request: Request, session_id: str):
    s = await sessions.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    if s.user_id is not None:
        caller_id = get_optional_user_id(request)
        if caller_id != s.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this session")
    return s


@router.delete("/session/{session_id}")
async def delete_session(request: Request, session_id: str):
    s = await sessions.get(session_id)
    if s and s.user_id is not None:
        caller_id = get_optional_user_id(request)
        if caller_id != s.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this session")
    await sessions.delete(session_id)
    return {"ok": True}


# --- /health ---
@router.get("/health", response_model=AssistantHealth)
async def assistant_health():
    h = health_info()
    tts_h = tts_service.health()
    providers = [
        AssistantProvider(name=h["model"], role="llm", configured=h["llm_configured"]),
        AssistantProvider(name="google-speech-recognition", role="stt", configured=stt_service.is_configured()),
        AssistantProvider(name="gemini-audio-stt", role="stt", configured=is_gemini_configured()),
        AssistantProvider(name="edge-neural", role="tts", configured=tts_h.get("edge_neural", True)),
        AssistantProvider(name="google-tts", role="tts", configured=tts_h["google"]),
        AssistantProvider(name="openai-tts-1", role="tts", configured=tts_h["openai"]),
    ]
    return AssistantHealth(
        providers=providers,
        memory_backend=h["memory_backend"],
        tools_enabled=h["tools_enabled"],
        rate_limit=f"{settings.CHAT_RATE_LIMIT_PER_MINUTE}/minute",
    )


# --- /usage (admin-only token telemetry & usage logs) ---
@router.get("/usage")
async def gemini_usage_stats(
    recent_limit: int = Query(default=25, ge=1, le=200),
    _admin: User = Depends(require_admin),
):
    """Return aggregated Gemini API token usage, cache hit metrics, and recent call logs (Admin only)."""
    return {
        "provider": "google-genai",
        "primary_model": settings.GEMINI_MODEL,
        "vision_model": settings.GEMINI_VISION_MODEL,
        "configured": is_gemini_configured(),
        "metrics": usage_tracker.summary(recent_limit=recent_limit),
    }


def _fallback_reply(msg: str, lang: Optional[str] = None) -> str:
    """Offline agricultural guidance notice when live AI services are unavailable."""
    from services.chat.language_detect import resolve_language

    detected_lang = resolve_language(lang or "auto", msg)
    if detected_lang == "kn":
        return (
            "ಪ್ರಸ್ತುತ ಲೈವ್ AI ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. "
            "ತುರ್ತು ಕೃಷಿ ಸಲಹೆಗಾಗಿ ದಯವಿಟ್ಟು ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (1800-180-1551) ಅಥವಾ ಸಮೀಪದ KVK ಸಂಪರ್ಕಿಸಿ."
        )
    if detected_lang in ("hi", "hi_en"):
        return (
            "अभी लाइव AI सेवा अस्थायी रूप से उपलब्ध नहीं है। "
            "तत्काल सटीक कृषि मार्गदर्शन के लिए कृपया टोल-फ्री किसान कॉल सेंटर (1800-180-1551) या अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"
        )
    return (
        "Live AI advisory is temporarily unavailable. "
        "Please retry shortly or contact the toll-free Kisan Call Centre (1800-180-1551) or your nearest Krishi Vigyan Kendra (KVK)."
    )
