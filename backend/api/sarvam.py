"""Compatibility Router forwarding legacy `/api/sarvam/*` endpoints to Gemini, IndicTrans2, and local audio engines."""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from services import sarvam_service
from services.chat import stt_service, tts_service
from services.chat.gemini_service import GeminiError, extract_soil_report_with_gemini
from services.translation.service import translation_service

log = logging.getLogger(__name__)
router = APIRouter()


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
    speaker: Optional[str] = Field("priya", max_length=50, description="Voice speaker name")


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


@router.post("/translate", response_model=TranslateResponse)
async def translate_endpoint(body: TranslateRequest):
    """Translate text dynamically using the AI4Bharat IndicTrans2 engine."""
    try:
        res = await translation_service.translate(
            text=body.text,
            target_language=body.target_lang,
            source_language=body.source_lang or "en-IN",
        )
        return TranslateResponse(
            translated_text=res["translated_text"],
            target_lang=body.target_lang,
            source_lang=body.source_lang or "en-IN",
        )
    except Exception as e:
        log.exception("Translation error in compatibility route: %s", e)
        raise HTTPException(status_code=500, detail="Translation failed.") from e


@router.post("/translate-batch", response_model=TranslateBatchResponse)
async def translate_batch_endpoint(body: TranslateBatchRequest):
    """Translate multiple phrases in parallel using IndicTrans2."""
    try:
        res = await translation_service.translate_batch(
            texts=body.texts,
            target_language=body.target_lang,
            source_language=body.source_lang or "en-IN",
        )
        return TranslateBatchResponse(
            translations=res["translations"],
            target_lang=body.target_lang,
        )
    except Exception as e:
        log.exception("Batch translation failed in compatibility route: %s", e)
        raise HTTPException(status_code=500, detail="Batch translation failed.") from e


@router.post("/tts")
async def tts_endpoint(body: SarvamTTSRequest):
    """Synthesize speech using Neural Edge TTS / standard TTS."""
    try:
        lang_code = (body.language or "hi").split("-")[0]
        res = await tts_service.synthesize(text=body.text, language=lang_code)
        if hasattr(res, "browser"):
            return JSONResponse(res.model_dump())
        return Response(
            content=res.audio,
            media_type=res.mime,
            headers={
                "Cache-Control": "public, max-age=86400",
                "X-TTS-Provider": res.provider,
            },
        )
    except Exception as e:
        log.warning("TTS generation error: %s", e)
        raise HTTPException(status_code=503, detail="TTS service temporarily unavailable.") from e


@router.post("/stt")
async def stt_endpoint(
    audio: UploadFile = File(..., description="Audio recording file (wav/mp3/m4a/webm)"),
    language: Optional[str] = Form("hi"),
):
    """Transcribe spoken audio with Google Speech Recognition / Gemini Audio."""
    try:
        contents = await audio.read()
        res = await stt_service.transcribe(
            audio_bytes=contents,
            filename=audio.filename or "recording.wav",
            content_type=audio.content_type or "audio/wav",
            language=language or "hi",
        )
        return {
            "transcript": res.transcript,
            "language_code": res.language,
            "provider": res.provider,
        }
    except Exception as e:
        log.warning("STT transcription error: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


async def _handle_soil_extraction(file: UploadFile) -> SoilReportExtractionResponse:
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded soil report file is empty.")
    if len(file_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 15 MB).")
    try:
        parsed = await extract_soil_report_with_gemini(
            file_bytes=file_bytes,
            filename=file.filename or "soil_report.pdf",
            content_type=file.content_type or "application/pdf",
        )
        return SoilReportExtractionResponse(**parsed)
    except GeminiError as e:
        raise HTTPException(status_code=e.status_code, detail=e.user_message) from e


@router.post("/extract-soil-report", response_model=SoilReportExtractionResponse)
async def extract_soil_report_endpoint(
    file: UploadFile = File(..., description="Soil Health Card document (PNG, JPEG, WebP, PDF)"),
):
    """Extract authentic chemical metrics from a Soil Health Card document using Google Gemini."""
    return await _handle_soil_extraction(file)


@router.post("/ocr-soil", response_model=SoilReportExtractionResponse)
async def ocr_soil_endpoint(
    file: UploadFile = File(..., description="Soil Health Card image (PNG, JPEG, WebP, PDF)"),
):
    """Alias for Soil Health Card extraction using Google Gemini (never returns fabricated values)."""
    return await _handle_soil_extraction(file)


@router.get("/health")
async def sarvam_health_check():
    """Returns engine health."""
    is_ok = await translation_service.provider.is_healthy()
    h = await sarvam_service.check_health()
    return {
        "status": "healthy" if is_ok else "degraded",
        "engine": "indictrans2",
        "llm": h.get("model"),
        "stt": True,
        "tts": True,
        "doc_ai": h.get("doc_ai", False),
    }
