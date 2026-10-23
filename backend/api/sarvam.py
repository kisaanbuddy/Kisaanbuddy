"""FastAPI Router for Sarvam AI Services.

Provides dedicated endpoints for:
  - Dynamic translation (single & batch) with TTL caching
  - Text-to-Speech (TTS) via bulbul:v3
  - Speech-to-Text (STT) via saaras:v4
  - Soil Health Card Document Intelligence (NPK & chemical extraction)
  - Health & availability check
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, Response, UploadFile, status
from pydantic import BaseModel, Field

from services import sarvam_service

log = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate")
    target_lang: str = Field(..., min_length=2, max_length=10, description="Target language code (e.g. hi, kn, bn, en)")
    source_lang: Optional[str] = Field("en-IN", max_length=10, description="Source language code")
    mode: Optional[str] = Field("formal", max_length=20, description="formal or colloquial")


class TranslateResponse(BaseModel):
    translated_text: str
    target_lang: str
    source_lang: str


class TranslateBatchRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=50, description="List of strings to translate")
    target_lang: str = Field(..., min_length=2, max_length=10)
    source_lang: Optional[str] = Field("en-IN", max_length=10)


class TranslateBatchResponse(BaseModel):
    translations: List[str]
    target_lang: str


class SarvamTTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=3000, description="Text to convert to speech")
    language: Optional[str] = Field("hi-IN", max_length=10, description="Target language BCP-47 or ISO code")
    speaker: Optional[str] = Field("priya", max_length=50, description="bulbul:v3 speaker name (e.g. priya, aditya)")


class SoilReportExtractionResponse(BaseModel):
    soil_ph: Optional[float] = None
    nitrogen_kg_ha: Optional[float] = None
    phosphorus_kg_ha: Optional[float] = None
    potassium_kg_ha: Optional[float] = None
    organic_carbon_pct: Optional[float] = None
    ec_ds_m: Optional[float] = None
    soil_type: Optional[str] = None
    lab_name: Optional[str] = None
    test_date: Optional[str] = None
    farmer_name: Optional[str] = None
    village_or_district: Optional[str] = None
    health_summary: Optional[str] = None
    source_file: Optional[str] = None
    raw_extracted_text: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/translate", response_model=TranslateResponse)
async def translate_endpoint(body: TranslateRequest):
    """Translate text dynamically using Sarvam Translate (mayura:v1) with TTL caching."""
    try:
        translated = await sarvam_service.translate_text(
            text=body.text,
            target_lang=body.target_lang,
            source_lang=body.source_lang or "en-IN",
            mode=body.mode or "formal",
        )
        return TranslateResponse(
            translated_text=translated,
            target_lang=body.target_lang,
            source_lang=body.source_lang or "en-IN",
        )
    except sarvam_service.SarvamServiceError as e:
        log.warning("Sarvam translation route error: %s", e)
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        log.exception("Unexpected error in translation: %s", e)
        raise HTTPException(status_code=500, detail="Translation failed.") from e


@router.post("/translate-batch", response_model=TranslateBatchResponse)
async def translate_batch_endpoint(body: TranslateBatchRequest):
    """Translate multiple phrases in parallel."""
    try:
        translations = await sarvam_service.translate_batch(
            texts=body.texts,
            target_lang=body.target_lang,
            source_lang=body.source_lang or "en-IN",
        )
        return TranslateBatchResponse(
            translations=translations,
            target_lang=body.target_lang,
        )
    except sarvam_service.SarvamServiceError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        log.exception("Batch translation failed: %s", e)
        raise HTTPException(status_code=500, detail="Batch translation failed.") from e


@router.post("/tts")
async def tts_endpoint(body: SarvamTTSRequest):
    """Synthesize Indian-language speech with Sarvam bulbul:v3."""
    try:
        audio_bytes = await sarvam_service.text_to_speech(
            text=body.text,
            language_code=body.language or "hi-IN",
            speaker=body.speaker or "priya",
        )
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "X-TTS-Provider": "sarvam-bulbul-v3",
                "X-TTS-Speaker": body.speaker or "priya",
            },
        )
    except sarvam_service.SarvamServiceError as e:
        log.warning("Sarvam TTS error: %s", e)
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        log.exception("TTS synthesis failed: %s", e)
        raise HTTPException(status_code=500, detail="Audio synthesis failed.") from e


@router.post("/stt")
async def stt_endpoint(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
):
    """Transcribe spoken audio with Sarvam saaras:v4."""
    try:
        audio_bytes = await audio.read()
        res = await sarvam_service.speech_to_text(
            audio_bytes=audio_bytes,
            filename=audio.filename or "audio.wav",
            content_type=audio.content_type or "audio/wav",
            language_code=language,
        )
        return res
    except sarvam_service.SarvamServiceError as e:
        log.warning("Sarvam STT error: %s", e)
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        log.exception("Speech transcription failed: %s", e)
        raise HTTPException(status_code=500, detail="Transcription failed.") from e


@router.post("/extract-soil-report", response_model=SoilReportExtractionResponse)
async def extract_soil_report_endpoint(
    file: UploadFile = File(...),
):
    """Upload Soil Health Card document (PDF, PNG, JPG) and extract structured NPK data."""
    try:
        file_bytes = await file.read()
        if len(file_bytes) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 20 MB).")

        parsed = await sarvam_service.extract_soil_report(
            file_bytes=file_bytes,
            filename=file.filename or "soil_report.pdf",
            content_type=file.content_type or "application/pdf",
        )
        return SoilReportExtractionResponse(**parsed)
    except HTTPException:
        raise
    except sarvam_service.SarvamServiceError as e:
        log.warning("Sarvam soil report extraction error: %s", e)
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        log.exception("Document extraction failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to process document: {e}") from e


@router.get("/health")
async def health_endpoint():
    """Check configuration and health of all Sarvam AI integrations."""
    return await sarvam_service.check_health()
