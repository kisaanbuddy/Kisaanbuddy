"""FastAPI Router for KisaanBuddy Multilingual Translation Engine.

Primary engine: AI4Bharat IndicTrans2
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from services.translation.cache import translation_cache
from services.translation.language_router import (
    INDICTRANS2_LANGUAGES,
    INDICTRANS2_TO_SHORT,
    LanguageRouter,
)
from services.translation.service import translation_service

log = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class TranslateRequest(BaseModel):
    text: Optional[str] = Field(None, max_length=10000, description="Single text string to translate")
    texts: Optional[List[str]] = Field(None, max_length=100, description="Optional batch list of strings")
    source_language: Optional[str] = Field("eng_Latn", description="Source language code (FLORES-200, BCP-47, or ISO)")
    target_language: str = Field(..., description="Target language code (e.g. hin_Deva, kan_Knda, hi, kn)")
    use_cache: Optional[bool] = Field(True, description="Whether to check and update translation cache")
    protect_glossary: Optional[bool] = Field(True, description="Whether to protect brands, tractor models and specs")


class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    provider: Optional[str] = "indictrans2"
    cached: Optional[bool] = False


class BatchTranslateRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=200, description="List of strings to translate")
    source_language: Optional[str] = Field("eng_Latn", description="Source language code")
    target_language: str = Field(..., description="Target language code")
    use_cache: Optional[bool] = True
    protect_glossary: Optional[bool] = True


class BatchTranslateResponse(BaseModel):
    translations: List[str]
    source_language: str
    target_language: str
    provider: Optional[str] = "indictrans2"


class StructuredTranslateRequest(BaseModel):
    data: Any = Field(..., description="JSON object or array to recursively translate")
    source_language: Optional[str] = Field("eng_Latn", description="Source language code")
    target_language: str = Field(..., description="Target language code")
    keys_to_translate: Optional[List[str]] = Field(
        None,
        description="Optional list of specific dictionary keys to translate (e.g. ['name', 'description'])",
    )


class LanguageInfo(BaseModel):
    code: str
    short_code: str
    name: str


class TranslationHealthResponse(BaseModel):
    status: str
    provider: str
    healthy: bool
    cache_stats: Dict[str, Any]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("", response_model=Union[TranslateResponse, BatchTranslateResponse])
@router.post("/", response_model=Union[TranslateResponse, BatchTranslateResponse])
async def translate_endpoint(body: TranslateRequest):
    """Translate single string or batch.

    Example request:
    {
      "text": "Wheat requires adequate irrigation.",
      "source_language": "eng_Latn",
      "target_language": "hin_Deva"
    }

    Example response:
    {
      "translated_text": "गेहूँ को पर्याप्त सिंचाई की आवश्यकता होती है।",
      "source_language": "eng_Latn",
      "target_language": "hin_Deva"
    }
    """
    try:
        # Check if batch texts were supplied in main translate endpoint
        if body.texts is not None and len(body.texts) > 0:
            result = await translation_service.translate_batch(
                texts=body.texts,
                target_language=body.target_language,
                source_language=body.source_language or "eng_Latn",
                use_cache=body.use_cache if body.use_cache is not None else True,
                protect_glossary=body.protect_glossary if body.protect_glossary is not None else True,
            )
            return BatchTranslateResponse(
                translations=result["translations"],
                source_language=result["source_language"],
                target_language=result["target_language"],
                provider=result.get("provider", "indictrans2"),
            )

        if not body.text:
            raise HTTPException(status_code=400, detail="Field 'text' or 'texts' is required")

        result = await translation_service.translate(
            text=body.text,
            target_language=body.target_language,
            source_language=body.source_language or "eng_Latn",
            use_cache=body.use_cache if body.use_cache is not None else True,
            protect_glossary=body.protect_glossary if body.protect_glossary is not None else True,
        )

        return TranslateResponse(
            translated_text=result["translated_text"],
            source_language=result["source_language"],
            target_language=result["target_language"],
            provider=result.get("provider", "indictrans2"),
            cached=result.get("cached", False),
        )
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Translation endpoint error: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed across all configured providers: {e}",
        ) from e


@router.post("/batch", response_model=BatchTranslateResponse)
async def translate_batch_endpoint(body: BatchTranslateRequest):
    """Dedicated batch translation endpoint for dynamic lists, Mandi data, and weather feeds."""
    try:
        result = await translation_service.translate_batch(
            texts=body.texts,
            target_language=body.target_language,
            source_language=body.source_language or "eng_Latn",
            use_cache=body.use_cache if body.use_cache is not None else True,
            protect_glossary=body.protect_glossary if body.protect_glossary is not None else True,
        )
        return BatchTranslateResponse(
            translations=result["translations"],
            source_language=result["source_language"],
            target_language=result["target_language"],
            provider=result.get("provider", "indictrans2"),
        )
    except Exception as e:
        log.exception("Batch translation endpoint error: %s", e)
        raise HTTPException(status_code=500, detail=f"Batch translation failed: {e}") from e


@router.post("/structured")
async def translate_structured_endpoint(body: StructuredTranslateRequest):
    """Translates dynamic nested JSON structures while strictly preserving IDs, keys, numbers, and URLs."""
    try:
        translated_data = await translation_service.translate_structured(
            data=body.data,
            target_language=body.target_language,
            source_language=body.source_language or "eng_Latn",
            keys_to_translate=body.keys_to_translate,
        )
        return {
            "data": translated_data,
            "source_language": body.source_language or "eng_Latn",
            "target_language": body.target_language,
        }
    except Exception as e:
        log.exception("Structured translation endpoint error: %s", e)
        raise HTTPException(status_code=500, detail=f"Structured translation failed: {e}") from e


@router.get("/languages", response_model=List[LanguageInfo])
def list_languages_endpoint():
    """Returns all 22 official Indian languages supported by IndicTrans2 with their FLORES-200 and ISO codes."""
    languages: List[LanguageInfo] = []
    for flores_code, name in INDICTRANS2_LANGUAGES.items():
        short_code = INDICTRANS2_TO_SHORT.get(flores_code, flores_code.split("_")[0])
        languages.append(LanguageInfo(code=flores_code, short_code=short_code, name=name))
    return languages


@router.get("/health", response_model=TranslationHealthResponse)
async def health_check_endpoint():
    """Health check inspects IndicTrans2 engine status and cache statistics."""
    is_ok = await translation_service.provider.is_healthy()
    return TranslationHealthResponse(
        status="ok" if is_ok else "degraded",
        provider=translation_service.provider.name,
        healthy=is_ok,
        cache_stats=translation_cache.get_stats(),
    )
