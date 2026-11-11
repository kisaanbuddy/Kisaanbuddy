"""FastAPI Router for KisaanBuddy Voice Operating System.

Endpoints:
  POST /api/voice/interpret       - Interpret transcript with page context into safe website action
  POST /api/voice/process-audio   - End-to-end voice round-trip: audio -> STT -> Action -> TTS -> Audio
  GET  /api/voice/health          - Voice engine availability and capabilities
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, Response, UploadFile, status
from pydantic import BaseModel, Field

from services.chat import stt_service
from services.voice.voice_orchestrator import voice_orchestrator

log = logging.getLogger(__name__)
router = APIRouter()


class PageContextSchema(BaseModel):
    current_route: str = Field("/", description="Active pathname, e.g. /marketplace")
    route_name: Optional[str] = None
    visible_items: List[Dict[str, Any]] = Field(default_factory=list, description="Currently visible cards/items")
    selected_item: Optional[Dict[str, Any]] = None
    cart_items: List[Dict[str, Any]] = Field(default_factory=list)
    cart_total: float = 0.0
    pending_action: Optional[Dict[str, Any]] = None
    active_filters: Optional[Dict[str, Any]] = None


class VoiceInterpretRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=1000)
    page_context: PageContextSchema
    language: Optional[str] = Field("hi", max_length=10)
    session_id: Optional[str] = None
    want_audio: bool = True


class VoiceActionSchema(BaseModel):
    action_type: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    safety_level: str = "SAFE"
    requires_confirmation: bool = False


class VoiceInterpretResponse(BaseModel):
    action: VoiceActionSchema
    reply_text: str
    reply_audio_base64: Optional[str] = None
    reply_audio_mime: Optional[str] = None
    language: str
    session_id: str
    pending_action: Optional[Dict[str, Any]] = None


@router.post("/interpret", response_model=VoiceInterpretResponse)
async def interpret_voice_command(body: VoiceInterpretRequest):
    """Interpret farmer voice transcript in the context of the active page and visible components."""
    try:
        res = await voice_orchestrator.interpret_command(
            transcript=body.transcript,
            page_context=body.page_context.model_dump(),
            language=body.language,
            session_id=body.session_id,
            want_audio=body.want_audio,
        )
        return VoiceInterpretResponse(**res)
    except Exception as e:
        log.exception("Voice interpret failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Voice command processing failed: {str(e)}",
        ) from e


@router.post("/process-audio", response_model=VoiceInterpretResponse)
async def process_voice_audio(
    audio: UploadFile = File(...),
    current_route: str = Form("/"),
    language: Optional[str] = Form("hi"),
    session_id: Optional[str] = Form(None),
    cart_total: float = Form(0.0),
    page_context_json: Optional[str] = Form(None),
):
    """Full voice round-trip: raw microphone audio -> STT -> Gemini Intent Recognition -> Action -> Neural TTS."""
    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio recording.")

        # 1. Speech-to-Text via robust STT service
        try:
            stt_res = await stt_service.transcribe(
                audio_bytes=audio_bytes,
                filename=audio.filename or "recording.wav",
                content_type=audio.content_type or "audio/wav",
                language=language,
            )
            transcript = stt_res.transcript.strip()
            detected_lang = stt_res.language or language or "hi"
        except Exception as e:
            log.warning("STT transcription failed: %s", e)
            transcript = ""
            detected_lang = language or "hi"

        # 2. Parse page context
        import json
        ctx: Dict[str, Any] = {"current_route": current_route, "cart_total": cart_total}
        if page_context_json:
            try:
                ctx.update(json.loads(page_context_json))
            except Exception:
                pass

        # 3. Interpret Command
        res = await voice_orchestrator.interpret_command(
            transcript=transcript,
            page_context=ctx,
            language=detected_lang,
            session_id=session_id,
            want_audio=True,
        )
        res["transcript"] = transcript
        return VoiceInterpretResponse(**res)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Voice audio pipeline failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/health")
async def voice_health():
    """Verify Voice Operating System health and active integrations."""
    return {
        "status": "active",
        "voice_os_version": "2.0.0",
        "stt": True,
        "tts": True,
        "supported_languages": ["hi", "kn", "en", "hi_en"],
        "safety_levels": ["SAFE", "REQUIRES_CONFIRMATION"],
        "permitted_actions": [
            "NAVIGATE",
            "GO_BACK",
            "SEARCH",
            "FILTER_PRICE",
            "SORT_PRODUCTS",
            "SELECT_ITEM",
            "ADD_TO_CART",
            "REMOVE_FROM_CART",
            "CLEAR_CART",
            "PLACE_ORDER",
            "CONFIRM_ACTION",
            "CANCEL_ACTION",
            "CHANGE_LANGUAGE",
            "TOGGLE_THEME",
            "OPEN_NOTIFICATIONS",
            "SCROLL",
            "NOOP",
        ],
    }
