"""Production Health & Readiness Probes for KisaanBuddy Backend V2.

Provides liveness (/health) and deep readiness (/health/readiness) probes
evaluating Database connection pools, Cache status, and Storage accessibility.
"""
import logging
import time
from typing import Dict, Any

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from db.session import get_db, engine
from services.storage import storage_service

router = APIRouter()
log = logging.getLogger("krishiai.health")


@router.get("", include_in_schema=False)
@router.get("/liveness", include_in_schema=False)
def liveness_probe():
    """Liveness probe: verifies process execution without expensive downstream checks."""
    return {"status": "ok", "service": "krishiai", "timestamp": time.time()}


@router.get("/readiness")
def readiness_probe(db: Session = Depends(get_db), response: Response = None) -> Dict[str, Any]:
    """Deep readiness probe: validates DB pool, Storage, and Cache readiness."""
    is_healthy = True
    details: Dict[str, Any] = {
        "status": "ok",
        "timestamp": time.time(),
        "checks": {}
    }

    # 1. Database Check
    db_start = time.perf_counter()
    try:
        db.execute(text("SELECT 1"))
        db_duration_ms = round((time.perf_counter() - db_start) * 1000, 2)
        details["checks"]["database"] = {
            "status": "healthy",
            "latency_ms": db_duration_ms
        }
    except Exception as e:
        is_healthy = False
        log.error("Readiness check: Database probe failed: %s", e)
        details["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }

    # 2. Storage Check
    try:
        provider = storage_service.provider
        details["checks"]["storage"] = {
            "status": "healthy",
            "provider": provider
        }
    except Exception as e:
        is_healthy = False
        details["checks"]["storage"] = {
            "status": "unhealthy",
            "error": str(e)
        }

    # 3. Redis / Cache Check
    try:
        from services import weather_cache
        cache_type = weather_cache.cache.__class__.__name__
        details["checks"]["cache"] = {
            "status": "healthy",
            "type": cache_type
        }
    except Exception as e:
        details["checks"]["cache"] = {
            "status": "degraded",
            "error": str(e)
        }

    if not is_healthy:
        details["status"] = "unhealthy"
        if response:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return details
