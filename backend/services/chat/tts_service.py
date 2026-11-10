"""Text-to-Speech service for KisaanBuddy.

Provider chain:
  1. Sarvam.ai (bulbul:v3 / bulbul:v4-flash) — best for Indian regional languages
  2. Edge Neural TTS (Indian neural voices) — reliable, realistic Indian accent audio
  3. Google Cloud TTS — WaveNet / Neural2 voices
  4. OpenAI TTS — English fallback
  5. Browser hint (window.speechSynthesis) — last resort if all server audio fails

Returns raw bytes + MIME type so the API layer can stream/send directly to the client.
"""
from __future__ import annotations

import asyncio
import base64
import logging
import re
from typing import Optional, Tuple

import httpx

from core.config import settings
from schemas.chatbot import TTSBrowserHint

log = logging.getLogger(__name__)

# Locale choices are a routing hint, not proof of a provider voice's quality.
_BCP47 = {
    "en": "en-IN", "hi": "hi-IN", "hi_en": "hi-IN", "kn": "kn-IN", "bn": "bn-IN", "mr": "mr-IN",
    "te": "te-IN", "ta": "ta-IN", "gu": "gu-IN", "pa": "pa-IN", "bho": "hi-IN", "mai": "hi-IN",
}
_SARVAM_LANG = _BCP47
_GOOGLE_LANG = _BCP47
_GOOGLE_VOICE = {"hi": "hi-IN-Neural2-A", "kn": "kn-IN-Standard-A", "en": "en-IN-Neural2-A"}

# High-fidelity Indian neural voices for realistic, authentic conversational delivery
_EDGE_NEURAL_VOICES = {
    "hi": "hi-IN-SwaraNeural",
    "hi_en": "hi-IN-MadhurNeural",
    "kn": "kn-IN-SapnaNeural",
    "en": "en-IN-NeerjaNeural",
    "bn": "bn-IN-TanishaaNeural",
    "mr": "mr-IN-AarohiNeural",
    "te": "te-IN-ShrutiNeural",
    "ta": "ta-IN-PallaviNeural",
    "gu": "gu-IN-DhwaniNeural",
    "pa": "pa-IN-OjasNeural",
    "ml": "ml-IN-SobhanaNeural",
    "bho": "hi-IN-SwaraNeural",
    "mai": "hi-IN-SwaraNeural",
}

_SARVAM_PROFILE = {
    "en": ("bulbul:v4-flash", "aparna_en_companion"),
    "hi": ("bulbul:v4-flash", "aparna_hi_customer"),
    "hi_en": ("bulbul:v4-flash", "simran_enhi_customer"),
    "kn": ("bulbul:v3", "ishita"),
}
_SARVAM_DEFAULT_PROFILE = ("bulbul:v3", "priya")
_SARVAM_V3_SPEAKER = {"en": "ishita", "hi": "priya", "hi_en": "priya", "kn": "ishita"}


class TTSError(Exception):
    pass


class TTSResult:
    __slots__ = ("audio", "mime", "provider")

    def __init__(self, audio: bytes, mime: str, provider: str) -> None:
        self.audio = audio
        self.mime = mime
        self.provider = provider


def _clean_text_for_speech(text: str) -> str:
    """Strip markdown, asterisks, brackets, and URLs for natural spoken speech."""
    t = text or ""
    t = re.sub(r'[*#_~`>]', '', t)
    t = re.sub(r'https?://\S+', '', t)
    t = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', t)
    t = re.sub(r'•\s*', ', ', t)
    t = re.sub(r'[-–—]\s*', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


# ---------------------------------------------------------------------------
# 1. Indian Neural TTS (Edge TTS) — High-fidelity natural voice
# ---------------------------------------------------------------------------
async def _edge_tts(text: str, lang: str) -> TTSResult:
    try:
        import edge_tts
    except ImportError as e:
        raise TTSError(f"edge_tts not installed: {e}") from e

    if lang == "auto":
        from services.chat.language_detect import detect_language
        lang = detect_language(text)

    clean_text = _clean_text_for_speech(text)[:3000]
    if not clean_text:
        raise TTSError("Empty text for speech synthesis")

    voice = _EDGE_NEURAL_VOICES.get(lang, "hi-IN-SwaraNeural")

    for attempt in range(2):
        try:
            comm = edge_tts.Communicate(clean_text, voice)
            audio_data = b""
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            if audio_data:
                return TTSResult(audio_data, "audio/mpeg", f"neural-{voice}")
        except Exception as e:
            if attempt == 1:
                log.warning("Edge neural TTS failed: %s", e)
                raise TTSError(f"Neural TTS failed: {e}") from e
            await asyncio.sleep(0.3)

    raise TTSError("Edge neural TTS generated empty audio stream")


# ---------------------------------------------------------------------------
# 3. Google Cloud TTS — WaveNet / Neural2 voices
# ---------------------------------------------------------------------------
async def _google_tts(text: str, lang: str) -> TTSResult:
    try:
        from google.cloud import texttospeech  # type: ignore
    except Exception as e:
        raise TTSError(f"google-cloud-texttospeech not installed: {e}") from e

    if not settings.GOOGLE_APPLICATION_CREDENTIALS:
        raise TTSError("GOOGLE_APPLICATION_CREDENTIALS not set")

    clean_text = _clean_text_for_speech(text)[:3000]

    def _run() -> bytes:
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=clean_text)
        voice_args = {"language_code": _GOOGLE_LANG.get(lang, "en-IN")}
        if lang in _GOOGLE_VOICE:
            voice_args["name"] = _GOOGLE_VOICE[lang]
        voice = texttospeech.VoiceSelectionParams(**voice_args)
        audio_cfg = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        resp = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_cfg)
        return resp.audio_content

    audio = await asyncio.to_thread(_run)
    return TTSResult(audio, "audio/mpeg", "google-tts")


# ---------------------------------------------------------------------------
# 4. OpenAI TTS — English fallback
# ---------------------------------------------------------------------------
async def _openai_tts(text: str, lang: str) -> TTSResult:
    key = settings.GEMINI_API_KEY or settings.OPENAI_API_KEY
    if not key:
        raise TTSError("GEMINI_API_KEY or OPENAI_API_KEY not set")
    try:
        from openai import AsyncOpenAI  # type: ignore
    except Exception as e:
        raise TTSError(f"openai SDK not installed: {e}") from e

    clean_text = _clean_text_for_speech(text)[:4000]
    client = AsyncOpenAI(api_key=key, timeout=settings.API_TIMEOUT * 6)
    resp = await client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=clean_text,
        response_format="mp3",
    )
    audio = await resp.aread() if hasattr(resp, "aread") else resp.read()
    return TTSResult(audio, "audio/mpeg", "openai-tts-1")


# ---------------------------------------------------------------------------
# Public facade
# ---------------------------------------------------------------------------
async def synthesize(text: str, language: str = "en") -> TTSResult | TTSBrowserHint:
    """Try configured providers in priority order. Returns real AI audio whenever possible."""
    text = (text or "").strip()
    if not text:
        raise TTSError("Empty text")

    if language == "auto":
        from services.chat.language_detect import detect_language
        language = detect_language(text)

    providers = _configured_providers(language)
    errors: list[str] = []
    for name, fn in providers:
        try:
            res = await fn(text, language)
            return res
        except TTSError as e:
            errors.append(f"{name}: {e}")
            continue
        except Exception as e:
            log.exception("TTS provider %s raised", name)
            errors.append(f"{name}: {e}")
            continue

    if errors:
        log.info("Server TTS providers cascade exhausted: %s", " | ".join(errors))

    return TTSBrowserHint(
        browser=True,
        language=language,  # type: ignore[arg-type]
        voice_suggestion=_BCP47.get(language, "en-IN"),
    )


def _configured_providers(language: str) -> list[Tuple[str, callable]]:  # type: ignore[type-arg]
    out: list[Tuple[str, callable]] = []
    # 1. Indian Neural Edge TTS (High-quality Indian accent audio)
    try:
        import edge_tts  # type: ignore
        out.append(("edge-neural", _edge_tts))
    except ImportError:
        pass
    # 2. Google Cloud TTS
    if settings.GOOGLE_APPLICATION_CREDENTIALS:
        out.append(("google", _google_tts))
    # 3. OpenAI TTS (English fallback only)
    if language == "en" and ((settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 20) or (settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 20)):
        out.append(("openai", _openai_tts))
    return out


def health() -> dict:
    has_edge = False
    try:
        import edge_tts
        has_edge = True
    except ImportError:
        pass

    return {
        "edge_neural": has_edge,
        "google": bool(settings.GOOGLE_APPLICATION_CREDENTIALS),
        "openai": bool((settings.GEMINI_API_KEY or settings.OPENAI_API_KEY) and len(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY) > 20),
    }
