"""Speech-to-Text service.

Primary: OpenAI Whisper (`whisper-1`) — 99-language support, excellent on
Hindi and Kannada, and great at code-mixed Hinglish/Kanglish audio.

Fallback: if the OPENAI_API_KEY is missing or the call fails, we return
an error. The frontend already does its own Web Speech API pass, so the
user still gets a transcript — this endpoint is the *upgrade* path for
when the browser's STT isn't trusted.

Design choices:
  * Language hint is OPTIONAL. Whisper auto-detects well, and forcing a
    language on mixed speech hurts accuracy.
  * 25 MB size limit enforced up-front (OpenAI's hard limit).
  * The audio bytes never touch disk — we stream directly to the API.
"""
from __future__ import annotations

import io
import logging
from typing import Optional

import httpx
from core.config import settings
from schemas.chatbot import STTResult

log = logging.getLogger(__name__)

MAX_BYTES = 25 * 1024 * 1024  # 25 MB — hard limit


class STTError(Exception):
    pass


async def _sarvam_stt(
    audio_bytes: bytes,
    filename: str = "audio.wav",
    language: Optional[str] = None,
) -> STTResult:
    key = settings.SARVAM_API_KEY
    if not key or len(key) < 20:
        raise STTError("SARVAM_API_KEY not configured.")

    url = "https://api.sarvam.ai/speech-to-text"
    headers = {"api-subscription-key": key}
    data: dict[str, str] = {
        "model": "saaras:v4",
        "mode": "transcribe",
    }
    lang_map = {
        "hi": "hi-IN", "kn": "kn-IN", "en": "en-IN", "bn": "bn-IN",
        "te": "te-IN", "ta": "ta-IN", "mr": "mr-IN", "gu": "gu-IN", "pa": "pa-IN",
    }
    if language and language in lang_map:
        data["language_code"] = lang_map[language]
    else:
        data["language_code"] = "unknown"

    files = {"file": (filename or "audio.wav", audio_bytes, "audio/wav")}

    async with httpx.AsyncClient(timeout=settings.API_TIMEOUT * 6) as client:
        r = await client.post(url, headers=headers, data=data, files=files)
        if r.status_code >= 400 and "model" in r.text.lower():
            data["model"] = "saaras:v3"
            r = await client.post(url, headers=headers, data=data, files=files)

    if r.status_code >= 400:
        raise STTError(f"Sarvam STT failed with {r.status_code}: {r.text[:200]}")

    result_json = r.json()
    transcript = result_json.get("transcript", "")
    detected = result_json.get("language_code", "") or language or "en"
    return STTResult(
        transcript=transcript.strip(),
        language=_normalise_lang(detected),
        confidence=None,
        provider="sarvam-saaras",
    )


async def transcribe(
    audio_bytes: bytes,
    filename: str = "audio.webm",
    content_type: str = "audio/webm",
    language: Optional[str] = None,
) -> STTResult:
    """Transcribe audio to text. `language` is an ISO hint (en/hi/kn), may be None."""
    if not audio_bytes:
        raise STTError("Empty audio payload.")
    if len(audio_bytes) > MAX_BYTES:
        raise STTError(f"Audio too large ({len(audio_bytes)} bytes); max is 25 MB.")

    if settings.SARVAM_API_KEY:
        try:
            return await _sarvam_stt(audio_bytes, filename=filename, language=language)
        except Exception as e:
            log.warning("Sarvam STT failed, falling back to Whisper: %s", e)
            if not (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY):
                raise

    key = settings.GEMINI_API_KEY or settings.OPENAI_API_KEY
    if not key or len(key) < 20:
        raise STTError("No STT provider configured (set SARVAM_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY).")

    try:
        # Lazy import so the app boots even when openai isn't installed.
        from openai import AsyncOpenAI  # type: ignore
    except Exception as e:
        raise STTError(f"openai SDK not installed: {e}") from e

    client = AsyncOpenAI(api_key=key, timeout=settings.API_TIMEOUT * 6)  # STT can take a few seconds

    # OpenAI SDK accepts a file-like object. We wrap bytes with a tuple so it
    # uses the correct mime/type.
    fileobj = io.BytesIO(audio_bytes)
    fileobj.name = filename  # SDK inspects .name for the MIME guess

    kwargs = {"model": "whisper-1", "file": fileobj, "response_format": "verbose_json"}
    # Whisper accepts ISO language hints. Keep the hint optional for genuinely
    # mixed speech, but pass a farmer's explicit regional-language choice.
    if language in ("en", "hi", "kn", "bn", "mr", "te", "ta", "gu", "pa"):
        kwargs["language"] = language

    try:
        resp = await client.audio.transcriptions.create(**kwargs)
    except Exception as e:
        log.warning("Whisper call failed: %s", e)
        raise STTError(f"Whisper call failed: {e}") from e

    # `resp` is a Transcription object; attributes vary by SDK version.
    text = getattr(resp, "text", "") or ""
    detected_lang = getattr(resp, "language", None) or language or "en"

    # Normalise to the assistant's supported preference set.
    detected_lang = _normalise_lang(detected_lang)

    return STTResult(
        transcript=text.strip(),
        language=detected_lang,  # type: ignore[arg-type]
        confidence=None,
        provider="openai-whisper-1",
    )


def _normalise_lang(code: str) -> str:
    c = (code or "").lower().split("-")[0]
    if c in ("hi", "kn", "bn", "mr", "te", "ta", "gu", "pa"):
        return c
    return "en"


def is_configured() -> bool:
    key = settings.SARVAM_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY
    return bool(key and len(key) > 20)
