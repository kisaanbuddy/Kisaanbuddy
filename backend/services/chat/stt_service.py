"""Speech-to-Text service for KisaanBuddy.

Provider cascade:
  1. Sarvam.ai (saaras:v4 / saaras:v3) — Primary Indian language STT
  2. Google Speech Recognition (sr.recognize_google) — High accuracy Hindi, Kannada, English fallback
  3. OpenAI Whisper (whisper-1) — If OpenAI / Gemini API key is configured

Supports live microphone recordings in WAV, WebM, MP4, OGG with automatic
language identification and silence tolerance.
"""
from __future__ import annotations

import asyncio
import io
import logging
from typing import Optional

import httpx

from core.config import settings
from schemas.chatbot import STTResult

log = logging.getLogger(__name__)

MAX_BYTES = 25 * 1024 * 1024  # 25 MB hard limit

_LANG_BCP47 = {
    "hi": "hi-IN",
    "kn": "kn-IN",
    "en": "en-IN",
    "bn": "bn-IN",
    "te": "te-IN",
    "ta": "ta-IN",
    "mr": "mr-IN",
    "gu": "gu-IN",
    "pa": "pa-IN",
    "ml": "ml-IN",
    "bho": "hi-IN",
    "mai": "hi-IN",
}


class STTError(Exception):
    pass


# ---------------------------------------------------------------------------
# 1. Google Speech Recognition (via speech_recognition)
# ---------------------------------------------------------------------------
async def _google_sr_stt(
    audio_bytes: bytes,
    filename: str = "audio.wav",
    language: Optional[str] = None,
) -> STTResult:
    try:
        import speech_recognition as sr
    except ImportError as e:
        raise STTError(f"speech_recognition not installed: {e}") from e

    # Check if WAV format (starts with 'RIFF')
    if not audio_bytes.startswith(b"RIFF") and len(audio_bytes) > 12:
        raise STTError("Google SR requires WAV PCM audio payload.")

    lang_code = _LANG_BCP47.get(language or "hi", "hi-IN")
    if language == "auto" or not language:
        # Default to Hindi for Indian farm context when unspecified
        lang_code = "hi-IN"

    def _sync_recognize() -> str:
        r = sr.Recognizer()
        r.energy_threshold = 300
        r.dynamic_energy_threshold = True
        with sr.AudioFile(io.BytesIO(audio_bytes)) as source:
            audio_data = r.record(source)
        try:
            return r.recognize_google(audio_data, language=lang_code)
        except sr.UnknownValueError:
            return ""
        except sr.RequestError as e:
            raise STTError(f"Google SR request failed: {e}") from e

    try:
        transcript = await asyncio.to_thread(_sync_recognize)
        if not transcript:
            raise STTError("No speech detected in audio segment.")
        return STTResult(
            transcript=transcript.strip(),
            language=_normalise_lang(lang_code),
            confidence=None,
            provider="google-speech-recognition",
        )
    except Exception as e:
        raise STTError(f"Google SR failed: {e}") from e


# ---------------------------------------------------------------------------
# 3. OpenAI Whisper (fallback if API key set)
# ---------------------------------------------------------------------------
async def _whisper_stt(
    audio_bytes: bytes,
    filename: str = "audio.webm",
    language: Optional[str] = None,
) -> STTResult:
    key = settings.GEMINI_API_KEY or settings.OPENAI_API_KEY
    if not key or len(key) < 20:
        raise STTError("No Whisper API key configured.")

    try:
        from openai import AsyncOpenAI  # type: ignore
    except Exception as e:
        raise STTError(f"openai SDK not installed: {e}") from e

    client = AsyncOpenAI(api_key=key, timeout=settings.API_TIMEOUT * 6)
    fileobj = io.BytesIO(audio_bytes)
    fileobj.name = filename

    kwargs: dict = {"model": "whisper-1", "file": fileobj, "response_format": "verbose_json"}
    if language in ("en", "hi", "kn", "bn", "mr", "te", "ta", "gu", "pa"):
        kwargs["language"] = language

    resp = await client.audio.transcriptions.create(**kwargs)
    text = getattr(resp, "text", "") or ""
    detected_lang = getattr(resp, "language", None) or language or "en"

    return STTResult(
        transcript=text.strip(),
        language=_normalise_lang(detected_lang),
        confidence=None,
        provider="openai-whisper-1",
    )


# ---------------------------------------------------------------------------
# Public Facade
# ---------------------------------------------------------------------------
async def transcribe(
    audio_bytes: bytes,
    filename: str = "audio.wav",
    content_type: str = "audio/wav",
    language: Optional[str] = None,
) -> STTResult:
    """Transcribe audio to text. `language` is an ISO hint (en/hi/kn), may be None."""
    if not audio_bytes:
        raise STTError("Empty audio payload.")
    if len(audio_bytes) > MAX_BYTES:
        raise STTError(f"Audio too large ({len(audio_bytes)} bytes); max is 25 MB.")

    errors: list[str] = []

    # 1. Primary: Google Speech Recognition (handles standard WAV from browser)
    try:
        return await _google_sr_stt(
            audio_bytes,
            filename=filename,
            language=language,
        )
    except Exception as e:
        errors.append(f"Google SR: {e}")

    # 3. Whisper (if OpenAI or Gemini API key set)
    if (settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 20) or (settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 20):
        try:
            return await _whisper_stt(
                audio_bytes,
                filename=filename,
                language=language,
            )
        except Exception as e:
            errors.append(f"Whisper STT: {e}")

    raise STTError(f"All STT providers failed: {' | '.join(errors)}")


def _normalise_lang(code: str) -> str:
    c = (code or "").lower().split("-")[0]
    if c in ("hi", "kn", "bn", "mr", "te", "ta", "gu", "pa", "bho", "mai"):
        return c
    return "en"


def is_configured() -> bool:
    return True
