"""Text-to-Speech service.

Provider chain:
  1. Sarvam.ai  — best for Hindi + Kannada (if SARVAM_API_KEY is set).
  2. Google Cloud TTS  — WaveNet voices for hi-IN, kn-IN (if creds set).
  3. OpenAI TTS  — strong English, passable other langs (if OPENAI_API_KEY).
  4. Browser fallback  — if none configured, return TTSBrowserHint so the
     frontend uses window.speechSynthesis (free, works offline).

This module never blocks startup; all provider SDKs are imported lazily.
Each provider returns raw bytes + MIME type. The API layer streams them
back to the client.
"""
from __future__ import annotations

import base64
import logging
from typing import Optional, Tuple

import httpx

from core.config import settings
from schemas.chatbot import TTSBrowserHint

log = logging.getLogger(__name__)

# Map our 3-lang codes to each provider's locale code.
_SARVAM_LANG = {"hi": "hi-IN", "kn": "kn-IN", "en": "en-IN"}
_GOOGLE_LANG = {"hi": "hi-IN", "kn": "kn-IN", "en": "en-IN"}
_GOOGLE_VOICE = {"hi": "hi-IN-Neural2-A", "kn": "kn-IN-Standard-A", "en": "en-IN-Neural2-A"}


class TTSError(Exception):
    pass


class TTSResult:
    __slots__ = ("audio", "mime", "provider")

    def __init__(self, audio: bytes, mime: str, provider: str) -> None:
        self.audio = audio
        self.mime = mime
        self.provider = provider


# ---------------------------------------------------------------------------
# Sarvam.ai — Indian-languages-first
# ---------------------------------------------------------------------------
async def _sarvam_tts(text: str, lang: str) -> TTSResult:
    key = settings.SARVAM_API_KEY
    if not key:
        raise TTSError("SARVAM_API_KEY not set")

    target = _SARVAM_LANG.get(lang, "en-IN")
    url = "https://api.sarvam.ai/text-to-speech"
    headers = {"api-subscription-key": key, "Content-Type": "application/json"}
    body = {
        "inputs": [text[:2000]],
        "target_language_code": target,
        "speaker": "meera",
        "pitch": 0,
        "pace": 1.0,
        "loudness": 1.2,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": "bulbul:v1",
    }
    async with httpx.AsyncClient(timeout=settings.API_TIMEOUT * 6) as client:
        r = await client.post(url, json=body, headers=headers)
    if r.status_code >= 400:
        raise TTSError(f"Sarvam TTS {r.status_code}: {r.text[:200]}")
    data = r.json()
    audios = data.get("audios", [])
    if not audios:
        raise TTSError("Sarvam returned empty audio")
    wav = base64.b64decode(audios[0])
    return TTSResult(wav, "audio/wav", "sarvam-bulbul")


# ---------------------------------------------------------------------------
# Google Cloud TTS — WaveNet / Neural2 voices
# ---------------------------------------------------------------------------
async def _google_tts(text: str, lang: str) -> TTSResult:
    # google-cloud-texttospeech is sync; run in threadpool.
    try:
        from google.cloud import texttospeech  # type: ignore
    except Exception as e:
        raise TTSError(f"google-cloud-texttospeech not installed: {e}") from e

    if not settings.GOOGLE_APPLICATION_CREDENTIALS:
        raise TTSError("GOOGLE_APPLICATION_CREDENTIALS not set")

    import asyncio

    def _run() -> bytes:
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=text[:3000])
        voice = texttospeech.VoiceSelectionParams(
            language_code=_GOOGLE_LANG.get(lang, "en-IN"),
            name=_GOOGLE_VOICE.get(lang, _GOOGLE_VOICE["en"]),
        )
        audio_cfg = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        resp = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_cfg)
        return resp.audio_content

    audio = await asyncio.to_thread(_run)
    return TTSResult(audio, "audio/mpeg", "google-tts")


# ---------------------------------------------------------------------------
# OpenAI TTS — fallback
# ---------------------------------------------------------------------------
async def _openai_tts(text: str, lang: str) -> TTSResult:
    key = settings.GEMINI_API_KEY or settings.OPENAI_API_KEY
    if not key:
        raise TTSError("GEMINI_API_KEY or OPENAI_API_KEY not set")
    try:
        from openai import AsyncOpenAI  # type: ignore
    except Exception as e:
        raise TTSError(f"openai SDK not installed: {e}") from e

    client = AsyncOpenAI(api_key=key, timeout=settings.API_TIMEOUT * 6)
    resp = await client.audio.speech.create(
        model="tts-1",
        voice="alloy",  # neutral, works acceptably across langs
        input=text[:4000],
        response_format="mp3",
    )
    audio = await resp.aread() if hasattr(resp, "aread") else resp.read()
    return TTSResult(audio, "audio/mpeg", "openai-tts-1")


# ---------------------------------------------------------------------------
# Public facade
# ---------------------------------------------------------------------------
async def synthesize(text: str, language: str = "en") -> TTSResult | TTSBrowserHint:
    """Try configured providers in order. Returns a browser hint if none work."""
    text = (text or "").strip()
    if not text:
        raise TTSError("Empty text")

    providers = _configured_providers()
    errors: list[str] = []
    for name, fn in providers:
        try:
            return await fn(text, language)
        except TTSError as e:
            errors.append(f"{name}: {e}")
            continue
        except Exception as e:
            log.exception("TTS provider %s raised", name)
            errors.append(f"{name}: {e}")
            continue

    if errors:
        log.info("All server TTS providers failed or absent: %s", " | ".join(errors))

    return TTSBrowserHint(
        browser=True,
        language=language,  # type: ignore[arg-type]
        voice_suggestion={"hi": "hi-IN", "kn": "kn-IN", "en": "en-IN"}.get(language, "en-IN"),
    )


def _configured_providers() -> list[Tuple[str, callable]]:  # type: ignore[type-arg]
    out: list[Tuple[str, callable]] = []
    if settings.SARVAM_API_KEY:
        out.append(("sarvam", _sarvam_tts))
    if settings.GOOGLE_APPLICATION_CREDENTIALS:
        out.append(("google", _google_tts))
    if (settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 20) or (settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 20):
        out.append(("openai", _openai_tts))
    return out


def health() -> dict:
    return {
        "sarvam": bool(settings.SARVAM_API_KEY),
        "google": bool(settings.GOOGLE_APPLICATION_CREDENTIALS),
        "openai": bool((settings.GEMINI_API_KEY or settings.OPENAI_API_KEY) and len(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY) > 20),
    }
