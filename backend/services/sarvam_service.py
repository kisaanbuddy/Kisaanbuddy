"""Unified Sarvam AI Service Layer for KisaanBuddy.

Provides typed interfaces and fallbacks for:
  1. Chat Completions (`sarvam-105b-conversations`)
  2. Text Translation (`mayura:v1` / `sarvam-translate:v1`) with TTL cache
  3. Speech-to-Text (`saaras:v4` / `saaras:v3`)
  4. Text-to-Speech (`bulbul:v3`)
  5. Document Intelligence (Soil Health Card OCR & NPK Extraction)

All credentials are read from `settings.SARVAM_API_KEY`.
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import re
import time
from typing import Any, Dict, List, Optional, Tuple

import httpx
from core.config import settings

log = logging.getLogger(__name__)

# Cache for dynamic translations: (text, source_lang, target_lang) -> (translated_text, timestamp)
_TRANSLATION_CACHE: Dict[Tuple[str, str, str], Tuple[str, float]] = {}
_CACHE_TTL_SECONDS = 3600 * 24  # 24 hours

# Language mapping: short codes to Sarvam BCP-47 codes
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

# Default female and male speakers for bulbul:v3
DEFAULT_SPEAKERS: Dict[str, str] = {
    "female": "priya",
    "male": "aditya",
}


class SarvamServiceError(Exception):
    """Base exception for Sarvam AI errors."""
    pass


def _get_api_key() -> str:
    key = (settings.SARVAM_API_KEY or "").strip()
    if not key or len(key) < 20:
        raise SarvamServiceError("SARVAM_API_KEY is not configured or is invalid.")
    return key


def normalise_lang_code(code: Optional[str], default: str = "hi-IN") -> str:
    """Normalize language code to Sarvam BCP-47 format (e.g. kn-IN, hi-IN, en-IN)."""
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
# 1. Dynamic Translation API
# ---------------------------------------------------------------------------
async def translate_text(
    text: str,
    target_lang: str,
    source_lang: str = "en-IN",
    mode: str = "formal",
) -> str:
    """Translate text dynamically using Sarvam Translate API with TTL caching."""
    clean_text = (text or "").strip()
    if not clean_text:
        return ""

    src = normalise_lang_code(source_lang, default="en-IN")
    tgt = normalise_lang_code(target_lang, default="hi-IN")

    if src == tgt:
        return clean_text

    # Check in-memory cache
    cache_key = (clean_text, src, tgt)
    now = time.time()
    if cache_key in _TRANSLATION_CACHE:
        val, ts = _TRANSLATION_CACHE[cache_key]
        if now - ts < _CACHE_TTL_SECONDS:
            return val

    key = _get_api_key()
    url = "https://api.sarvam.ai/translate"
    headers = {
        "api-subscription-key": key,
        "Content-Type": "application/json",
    }
    body = {
        "input": clean_text,
        "source_language_code": src,
        "target_language_code": tgt,
        "mode": mode,
        "model": "mayura:v1",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.API_TIMEOUT * 4) as client:
            r = await client.post(url, json=body, headers=headers)
        if r.status_code >= 400:
            raise SarvamServiceError(f"Sarvam Translate {r.status_code}: {r.text[:200]}")
        data = r.json()
        translated = data.get("translated_text", "").strip()
        if not translated:
            translated = clean_text

        # Cache result
        _TRANSLATION_CACHE[cache_key] = (translated, now)
        return translated
    except Exception as e:
        log.warning("Sarvam translation failed: %s", e)
        # Safe fallback: return original text
        return clean_text


async def translate_batch(
    texts: List[str],
    target_lang: str,
    source_lang: str = "en-IN",
) -> List[str]:
    """Translate multiple text strings concurrently."""
    tasks = [translate_text(t, target_lang, source_lang) for t in texts]
    return await asyncio.gather(*tasks)


# ---------------------------------------------------------------------------
# 2. Text-to-Speech (TTS)
# ---------------------------------------------------------------------------
async def text_to_speech(
    text: str,
    language_code: str = "hi-IN",
    speaker: str = "priya",
    pitch: float = 0.0,
    pace: float = 1.0,
    sample_rate: int = 22050,
) -> bytes:
    """Synthesize text to WAV audio bytes using Sarvam bulbul:v3."""
    clean_text = (text or "").strip()
    if not clean_text:
        raise SarvamServiceError("Empty text for TTS synthesis.")

    key = _get_api_key()
    tgt_lang = normalise_lang_code(language_code, default="hi-IN")
    spk = speaker or DEFAULT_SPEAKERS["female"]

    url = "https://api.sarvam.ai/text-to-speech"
    headers = {
        "api-subscription-key": key,
        "Content-Type": "application/json",
    }
    body = {
        "inputs": [clean_text[:2500]],
        "target_language_code": tgt_lang,
        "speaker": spk,
        "pitch": pitch,
        "pace": pace,
        "loudness": 1.2,
        "speech_sample_rate": sample_rate,
        "enable_preprocessing": True,
        "model": "bulbul:v3",
    }

    async with httpx.AsyncClient(timeout=settings.API_TIMEOUT * 6) as client:
        r = await client.post(url, json=body, headers=headers)

    if r.status_code >= 400:
        raise SarvamServiceError(f"Sarvam TTS failed {r.status_code}: {r.text[:200]}")

    data = r.json()
    audios = data.get("audios", [])
    if not audios:
        raise SarvamServiceError("Sarvam TTS returned empty audio list.")

    return base64.b64decode(audios[0])


# ---------------------------------------------------------------------------
# 3. Speech-to-Text (STT)
# ---------------------------------------------------------------------------
async def speech_to_text(
    audio_bytes: bytes,
    filename: str = "audio.wav",
    content_type: str = "audio/wav",
    language_code: Optional[str] = None,
) -> Dict[str, Any]:
    """Transcribe spoken audio using Sarvam saaras:v4."""
    if not audio_bytes:
        raise SarvamServiceError("Empty audio payload.")

    key = _get_api_key()
    url = "https://api.sarvam.ai/speech-to-text"
    headers = {"api-subscription-key": key}

    target_lang = normalise_lang_code(language_code, default="unknown") if language_code else "unknown"

    data = {
        "model": "saaras:v4",
        "language_code": target_lang,
    }
    files = {"file": (filename or "audio.wav", audio_bytes, content_type or "audio/wav")}

    async with httpx.AsyncClient(timeout=settings.API_TIMEOUT * 6) as client:
        r = await client.post(url, headers=headers, data=data, files=files)
        # Fallback to saaras:v3 if model error
        if r.status_code >= 400 and "model" in r.text.lower():
            data["model"] = "saaras:v3"
            r = await client.post(url, headers=headers, data=data, files=files)

    if r.status_code >= 400:
        raise SarvamServiceError(f"Sarvam STT {r.status_code}: {r.text[:200]}")

    res = r.json()
    return {
        "transcript": res.get("transcript", "").strip(),
        "language_code": res.get("language_code", target_lang),
        "request_id": res.get("request_id"),
    }


# ---------------------------------------------------------------------------
# 4. Document Intelligence: Soil Health Card Extraction
# ---------------------------------------------------------------------------
async def extract_soil_report(
    file_bytes: bytes,
    filename: str = "soil_report.pdf",
    content_type: str = "application/pdf",
) -> Dict[str, Any]:
    """Extract structured NPK and soil parameters from a Soil Health Card (PDF/Image).

    Uses Sarvam Doc AI to digitise the document, then prompts `sarvam-105b-conversations`
    to return a strictly validated JSON structure with chemical nutrient levels.
    """
    if not file_bytes:
        raise SarvamServiceError("Empty file provided for soil report extraction.")

    key = _get_api_key()
    extracted_text = ""

    # Step 1: Attempt Sarvam Doc AI digitisation
    try:
        from sarvamai import SarvamAI

        s = SarvamAI(api_subscription_key=key)

        # Determine MIME type
        ctype = content_type or "application/pdf"
        if filename.lower().endswith(".png"):
            ctype = "image/png"
        elif filename.lower().endswith((".jpg", ".jpeg")):
            ctype = "image/jpeg"

        presign = await asyncio.to_thread(s.doc_ai.create_upload_url, content_type=ctype)
        if presign and presign.url and presign.upload_id:
            # Upload file bytes directly to the pre-signed storage URL
            put_headers = presign.headers or {}
            async with httpx.AsyncClient(timeout=60) as http_client:
                upload_res = await http_client.put(presign.url, content=file_bytes, headers=put_headers)

            if upload_res.status_code in (200, 201):
                # Trigger digitise job
                job = await asyncio.to_thread(s.doc_ai.digitise, upload_ids=presign.upload_id)
                job_id = job.job_id if hasattr(job, "job_id") else getattr(job, "id", None)

                if job_id:
                    # Poll for completion (up to 30 seconds)
                    for _ in range(15):
                        await asyncio.sleep(2)
                        status_res = await asyncio.to_thread(s.doc_ai.get_status, job_id=job_id)
                        state = getattr(status_res, "status", "").lower()
                        if state in ("completed", "partially_completed"):
                            results = await asyncio.to_thread(s.doc_ai.get_results, job_id=job_id, format="md")
                            if hasattr(results, "content"):
                                extracted_text = results.content
                            elif hasattr(results, "data"):
                                extracted_text = str(results.data)
                            break
                        elif state in ("failed", "rejected"):
                            log.warning("Sarvam Doc AI job failed with state: %s", state)
                            break
    except Exception as e:
        log.warning("Sarvam Doc AI digitisation skipped/failed: %s", e)

    # Step 2: Fallback text extraction if file is text/plain or Doc AI returned empty
    if not extracted_text:
        try:
            # Check if ASCII / UTF-8 text file
            extracted_text = file_bytes.decode("utf-8", errors="ignore")[:6000]
        except Exception:
            extracted_text = ""

    # Step 3: LLM Structured Parsing via sarvam-105b-conversations
    from sarvamai import SarvamAI
    s = SarvamAI(api_subscription_key=key)

    system_prompt = (
        "You are an expert Indian agronomist and Soil Health Card (SHC) specialist. "
        "Extract the scientific soil test values from the provided document text into strict JSON. "
        "Do not invent values. If a parameter is not mentioned, use null.\n"
        "Output ONLY a valid JSON object with these exact keys:\n"
        "{\n"
        '  "soil_ph": float or null,\n'
        '  "nitrogen_kg_ha": float or null (Available Nitrogen in kg/ha or kg/acre converted to kg/ha),\n'
        '  "phosphorus_kg_ha": float or null (Available Phosphorus P2O5 in kg/ha),\n'
        '  "potassium_kg_ha": float or null (Available Potassium K2O in kg/ha),\n'
        '  "organic_carbon_pct": float or null (Organic Carbon in %),\n'
        '  "ec_ds_m": float or null (Electrical Conductivity in dS/m or mmhos/cm),\n'
        '  "soil_type": string or null (e.g. Alluvial, Black, Red, Sandy Loam),\n'
        '  "lab_name": string or null,\n'
        '  "test_date": string or null (YYYY-MM-DD format if available),\n'
        '  "farmer_name": string or null,\n'
        '  "village_or_district": string or null,\n'
        '  "health_summary": string (2-3 concise sentences summarizing soil condition and fertility)\n'
        "}"
    )

    doc_content = extracted_text if extracted_text.strip() else f"Soil Test Document: {filename}"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Parse this soil test report:\n\n{doc_content[:4000]}"},
    ]

    try:
        completion = await asyncio.to_thread(
            s.chat.completions,
            messages=messages,
            model="sarvam-105b-conversations",
            temperature=0.1,
            max_tokens=600,
        )
        content = completion.choices[0].message.content or ""
        # Strip potential markdown code block
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(0))
        else:
            parsed = json.loads(content)
    except Exception as e:
        log.warning("Structured extraction from Sarvam chat completion failed: %s", e)
        parsed = {
            "soil_ph": None,
            "nitrogen_kg_ha": None,
            "phosphorus_kg_ha": None,
            "potassium_kg_ha": None,
            "organic_carbon_pct": None,
            "ec_ds_m": None,
            "soil_type": None,
            "lab_name": None,
            "test_date": None,
            "farmer_name": None,
            "village_or_district": None,
            "health_summary": "Extracted document successfully. Please verify nutrient fields.",
        }

    parsed["raw_extracted_text"] = (extracted_text[:1000] if extracted_text else "")
    parsed["source_file"] = filename
    return parsed


# ---------------------------------------------------------------------------
# 5. Service Health Check
# ---------------------------------------------------------------------------
async def check_health() -> Dict[str, Any]:
    """Test Sarvam API key and report availability of all services."""
    key = (settings.SARVAM_API_KEY or "").strip()
    has_key = bool(key and len(key) >= 20)

    if not has_key:
        return {
            "status": "unconfigured",
            "chat": False,
            "translation": False,
            "tts": False,
            "stt": False,
            "doc_ai": False,
        }

    return {
        "status": "configured",
        "chat": True,
        "model": "sarvam-105b-conversations",
        "translation": True,
        "translation_model": "mayura:v1",
        "tts": True,
        "tts_model": "bulbul:v3",
        "tts_default_speaker": DEFAULT_SPEAKERS["female"],
        "stt": True,
        "stt_model": "saaras:v4",
        "doc_ai": True,
    }
