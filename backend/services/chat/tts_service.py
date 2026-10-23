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

# Locale choices are a routing hint, not proof of a provider voice's quality.
# Bhojpuri and Maithili intentionally use Hindi as a transparent fallback until
# dedicated voices pass the voice benchmark.
_BCP47 = {
    "en": "en-IN", "hi": "hi-IN", "hi_en": "hi-IN", "kn": "kn-IN", "bn": "bn-IN", "mr": "mr-IN",
    "te": "te-IN", "ta": "ta-IN", "gu": "gu-IN", "pa": "pa-IN", "bho": "hi-IN", "mai": "hi-IN",
}
_SARVAM_LANG = _BCP47
_GOOGLE_LANG = _BCP47
_GOOGLE_VOICE = {"hi": "hi-IN-Neural2-A", "kn": "kn-IN-Standard-A", "en": "en-IN-Neural2-A"}

# Bulbul v4 Flash is Sarvam's current neural model.  Kannada has a much
# smaller v4 persona roster, so use Sarvam's documented, production-tested
# Bulbul v3 speaker there instead of guessing an unsupported v4 speaker ID.
# Hinglish still uses Hindi text-normalisation; its v4 ``enhi`` speaker keeps
# English crop/product names natural in otherwise Roman-Hindi responses.
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


# ---------------------------------------------------------------------------
# Sarvam.ai — Indian-languages-first
# ---------------------------------------------------------------------------
async def _sarvam_tts(text: str, lang: str) -> TTSResult:
    key = settings.SARVAM_API_KEY
    if not key:
        raise TTSError("SARVAM_API_KEY not set")

    # ``auto`` can reach this endpoint from text clients.  Resolve it from
    # the text instead of accidentally speaking every unknown reply as Hindi.
    if lang == "auto":
        from services.chat.language_detect import detect_language
        lang = detect_language(text)
    target = _SARVAM_LANG.get(lang, "en-IN")
    model, speaker = _SARVAM_PROFILE.get(lang, _SARVAM_DEFAULT_PROFILE)
    url = "https://api.sarvam.ai/text-to-speech"
    headers = {"api-subscription-key": key, "Content-Type": "application/json"}
    body = {
        "text": text[:2500],
        # Sarvam Bulbul REST uses ``language_code``. It controls Indic text
        # normalisation (numbers, crop names and abbreviations), not merely a
        # display label, so it must match the response language.
        "language_code": target,
        "speaker": speaker,
        # A slightly slower pace improves clarity for field use without adding
        # artificial pauses. Bulbul handles sentence prosody itself.
        "pace": 0.96,
        "speech_sample_rate": 24000,
        "output_audio_codec": "mp3",
        "model": model,
    }
    used_model = model
    async with httpx.AsyncClient(timeout=settings.API_TIMEOUT * 6) as client:
        r = await client.post(url, json=body, headers=headers)
        # A key can lag a model rollout. Preserve correct-language neural
        # speech by retrying Sarvam's stable profile, never an English voice.
        if r.status_code >= 400 and model == "bulbul:v4-flash":
            fallback = dict(body)
            fallback.update({
                "model": "bulbul:v3",
                "speaker": _SARVAM_V3_SPEAKER.get(lang, "priya"),
            })
            r = await client.post(url, json=fallback, headers=headers)
            used_model = "bulbul:v3"
    if r.status_code >= 400:
        raise TTSError(f"Sarvam TTS {r.status_code}: {r.text[:200]}")
    data = r.json()
    audios = data.get("audios", [])
    if not audios:
        raise TTSError("Sarvam returned empty audio")
    # Sarvam may split a long response into multiple base64 fragments. Joining
    # first prevents truncating the assistant's actual answer.
    audio = base64.b64decode("".join(audios))
    return TTSResult(audio, "audio/mpeg", f"sarvam-{used_model}")


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
        voice_args = {"language_code": _GOOGLE_LANG.get(lang, "en-IN")}
        # Let Google select its locale default when no named tested voice is
        # configured, rather than accidentally forcing an English voice.
        if lang in _GOOGLE_VOICE:
            voice_args["name"] = _GOOGLE_VOICE[lang]
        voice = texttospeech.VoiceSelectionParams(**voice_args)
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

    if language == "auto":
        from services.chat.language_detect import detect_language
        language = detect_language(text)
    providers = _configured_providers(language)
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
        voice_suggestion=_BCP47.get(language, "en-IN"),
    )


def _configured_providers(language: str) -> list[Tuple[str, callable]]:  # type: ignore[type-arg]
    out: list[Tuple[str, callable]] = []
    if settings.SARVAM_API_KEY:
        out.append(("sarvam", _sarvam_tts))
    if settings.GOOGLE_APPLICATION_CREDENTIALS:
        out.append(("google", _google_tts))
    # OpenAI's generic voice is an English-quality fallback only. Do not
    # substitute it for Hindi/Kannada/Hinglish where it can sound foreign.
    if language == "en" and ((settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 20) or (settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 20)):
        out.append(("openai", _openai_tts))
    return out


def health() -> dict:
    return {
        "sarvam": bool(settings.SARVAM_API_KEY),
        "google": bool(settings.GOOGLE_APPLICATION_CREDENTIALS),
        "openai": bool((settings.GEMINI_API_KEY or settings.OPENAI_API_KEY) and len(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY) > 20),
    }
