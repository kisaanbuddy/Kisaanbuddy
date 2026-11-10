"""FastAPI Standalone Microservice for AI4Bharat IndicTrans2.

Runs independently on port 8001 (or configured PORT).
Does not block or load heavy translation models into the main web process.
"""
from __future__ import annotations

import logging
import os
import sys
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import uvicorn

# Ensure package importability
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from engine import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] IndicTrans2Server: %(message)s")
log = logging.getLogger("indictrans2_server")

app = FastAPI(
    title="AI4Bharat IndicTrans2 Dedicated Inference Service",
    version="2.0.0",
    description="High-performance Indian language neural translation engine for KisaanBuddy",
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class SingleTranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Input text to translate")
    source_language: str = Field(..., description="FLORES-200 source code (e.g. eng_Latn, hin_Deva)")
    target_language: str = Field(..., description="FLORES-200 target code (e.g. hin_Deva, kan_Knda)")


class SingleTranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    engine: str = "indictrans2"


class BatchTranslateRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=100, description="List of strings to translate")
    source_language: str = Field(..., description="FLORES-200 source code")
    target_language: str = Field(..., description="FLORES-200 target code")


class BatchTranslateResponse(BaseModel):
    translations: List[str]
    source_language: str
    target_language: str
    engine: str = "indictrans2"


class WarmupRequest(BaseModel):
    direction: Optional[str] = Field("en-indic", description="Direction to load: 'en-indic', 'indic-en', 'indic-indic'")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health_endpoint():
    status_info = engine.get_status()
    return {
        "status": "healthy",
        "service": "AI4Bharat-IndicTrans2-Inference",
        **status_info,
    }


@app.post("/translate", response_model=SingleTranslateResponse)
def translate_endpoint(req: SingleTranslateRequest):
    try:
        translated = engine.translate(
            text=req.text,
            src_lang=req.source_language,
            tgt_lang=req.target_language,
        )
        return SingleTranslateResponse(
            translated_text=translated,
            source_language=req.source_language,
            target_language=req.target_language,
        )
    except Exception as e:
        log.exception("Error translating: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/translate/batch", response_model=BatchTranslateResponse)
def translate_batch_endpoint(req: BatchTranslateRequest):
    try:
        translations = engine.translate_batch(
            texts=req.texts,
            src_lang=req.source_language,
            tgt_lang=req.target_language,
        )
        return BatchTranslateResponse(
            translations=translations,
            source_language=req.source_language,
            target_language=req.target_language,
        )
    except Exception as e:
        log.exception("Error in batch translation: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/warmup")
def warmup_endpoint(req: WarmupRequest):
    try:
        engine.load_model(req.direction or "en-indic")
        return {"status": "warmed_up", "direction": req.direction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Warmup failed: {e}") from e


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8001"))
    host = os.getenv("HOST", "0.0.0.0")
    log.info("Starting IndicTrans2 Inference Server on %s:%d", host, port)
    uvicorn.run("server:app", host=host, port=port, log_level="info")
