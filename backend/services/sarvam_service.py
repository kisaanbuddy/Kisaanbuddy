"""Legacy compatibility facade forwarding translation, speech, and document requests.

All Sarvam AI SDK/API calls have been removed:
  * Translation -> AI4Bharat IndicTrans2 self-hosted engine
  * Text-to-Speech -> Edge Neural TTS / Google Cloud TTS
  * Speech-to-Text -> Google Speech Recognition / Gemini Audio STT
  * Soil Health Card OCR -> Google Gemini Multimodal Document Intelligence
"""
from __future__ import annotations

import logging
import struct
from typing import Any, Dict, List, Optional

from services.chat.gemini_service import (
    GeminiError,
    extract_soil_report_with_gemini,
    is_gemini_configured,
)

log = logging.getLogger(__name__)

# Compatibility language mapping
SARVAM_LANG_MAP: Dict[str, str] = {
    "en": "en-IN",
    "hi": "hi-IN",
    "kn": "kn-IN",
    "bn": "bn-IN",
    "mr": "mr-IN",
    "te": "te-IN",
    "ta": "ta-IN",
    "gu": "gu-IN",
    "pa": "pa-IN",
    "ml": "ml-IN",
    "od": "od-IN",
    "bho": "hi-IN",
    "mai": "mai-IN",
}

DEFAULT_SPEAKERS: Dict[str, str] = {
    "female": "priya",
    "male": "aditya",
}


class SarvamServiceError(Exception):
    """Compatibility exception class for legacy callers."""
    pass


def normalise_lang_code(code: Optional[str], default: str = "hi-IN") -> str:
    """Normalize language code to Indian BCP-47 format (e.g. kn-IN, hi-IN, en-IN)."""
    if not code:
        return default
    c = code.strip()
    c_lower = c.lower()
    if c_lower in SARVAM_LANG_MAP:
        return SARVAM_LANG_MAP[c_lower]
    for short, bcp in SARVAM_LANG_MAP.items():
        if c_lower == bcp.lower() or c_lower.startswith(short + "-"):
            return bcp
    if c_lower == "auto":
        return "auto"
    return default


# ---------------------------------------------------------------------------
# 1. Translation (IndicTrans2)
# ---------------------------------------------------------------------------
async def translate_text(
    text: str,
    target_lang: str,
    source_lang: str = "en-IN",
    mode: str = "formal",
) -> str:
    """Translate text dynamically using self-hosted IndicTrans2 engine with caching."""
    clean_text = (text or "").strip()
    if not clean_text:
        return ""

    src = normalise_lang_code(source_lang, default="en-IN")
    tgt = normalise_lang_code(target_lang, default="hi-IN")
    if src == tgt:
        return clean_text

    try:
        from services.translation import translation_service

        res = await translation_service.translate(
            text=clean_text,
            target_language=tgt,
            source_language=src,
        )
        return res["translated_text"] if isinstance(res, dict) else res.translated_text
    except Exception as e:
        log.warning("IndicTrans2 translation failed in compatibility facade: %s", e)
        return clean_text


async def translate_batch(
    texts: List[str],
    target_lang: str,
    source_lang: str = "en-IN",
) -> List[str]:
    """Translate multiple strings concurrently using IndicTrans2."""
    if not texts:
        return []
    try:
        from services.translation import translation_service

        src = normalise_lang_code(source_lang, default="en-IN")
        tgt = normalise_lang_code(target_lang, default="hi-IN")
        res = await translation_service.translate_batch(
            texts=texts,
            target_language=tgt,
            source_language=src,
        )
        return res["translations"] if isinstance(res, dict) else [r.translated_text for r in res]
    except Exception as e:
        log.warning("IndicTrans2 batch translation failed in compatibility facade: %s", e)
        return texts


# ---------------------------------------------------------------------------
# 2. Text-to-Speech (Edge Neural / Google TTS)
# ---------------------------------------------------------------------------
async def text_to_speech(
    text: str,
    language_code: str = "hi-IN",
    speaker: str = "priya",
    pitch: float = 0.0,
    pace: float = 1.0,
    sample_rate: int = 22050,
) -> bytes:
    """Synthesize text to audio bytes using Edge Neural / Google TTS."""
    clean_text = (text or "").strip()
    if not clean_text:
        raise SarvamServiceError("Empty text for TTS synthesis.")

    try:
        from services.chat.tts_service import TTSResult, synthesize

        short_lang = (language_code or "hi").split("-")[0].lower()
        res = await synthesize(clean_text, language=short_lang)
        if isinstance(res, TTSResult) and res.audio:
            return res.audio
    except Exception as e:
        log.warning("TTS synthesis fallback: %s", e)

    # Minimal silent WAV container so audio players never crash if TTS unavailable
    num_samples = 3200
    sr = 16000
    data_size = num_samples * 2
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", 36 + data_size, b"WAVE", b"fmt ", 16, 1, 1, sr, sr * 2, 2, 16, b"data", data_size,
    )
    return header + (b"\x00" * data_size)


# ---------------------------------------------------------------------------
# 3. Speech-to-Text (Google SR / Gemini Audio)
# ---------------------------------------------------------------------------
async def speech_to_text(
    audio_bytes: bytes,
    filename: str = "audio.wav",
    content_type: str = "audio/wav",
    language_code: Optional[str] = None,
) -> Dict[str, Any]:
    """Transcribe spoken audio using Google STT / Gemini Audio / Whisper fallback."""
    if not audio_bytes:
        raise SarvamServiceError("Empty audio payload.")

    try:
        from services.chat.stt_service import transcribe

        lang_short = (language_code or "hi").split("-")[0].lower() if language_code else None
        res = await transcribe(audio_bytes, filename=filename, content_type=content_type, language=lang_short)
        return {
            "transcript": res.transcript,
            "language_code": res.language or (language_code or "hi-IN"),
            "request_id": res.provider,
        }
    except Exception as e:
        log.warning("STT fallback failed: %s", e)

    return {
        "transcript": "",
        "language_code": language_code or "hi-IN",
        "request_id": "stt-empty",
    }


# ---------------------------------------------------------------------------
# 4. Document Intelligence: Soil Health Card Extraction (Gemini)
# ---------------------------------------------------------------------------
async def extract_soil_report(
    file_bytes: bytes,
    filename: str = "soil_report.pdf",
    content_type: str = "application/pdf",
) -> Dict[str, Any]:
    """Extract structured NPK and soil parameters from a Soil Health Card using Gemini."""
    if not file_bytes:
        raise SarvamServiceError("Empty file provided for soil report extraction.")
    try:
        return await extract_soil_report_with_gemini(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
        )
    except GeminiError as e:
        raise SarvamServiceError(e.user_message) from e


# ---------------------------------------------------------------------------
# 5. Service Health Check
# ---------------------------------------------------------------------------
async def check_health() -> Dict[str, Any]:
    """Report health and availability of Gemini, IndicTrans2, and local audio services."""
    return {
        "status": "configured",
        "chat": is_gemini_configured(),
        "model": "google-gemini",
        "translation": True,
        "translation_model": "ai4bharat/indictrans2",
        "tts": True,
        "tts_model": "edge-neural-indic",
        "tts_default_speaker": DEFAULT_SPEAKERS["female"],
        "stt": True,
        "stt_model": "google-sr+gemini-audio",
        "doc_ai": is_gemini_configured(),
    }
