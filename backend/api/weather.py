"""Weather API routes.

Endpoints:
  GET  /api/weather/current?lat=&lon=         -> current weather (unified)
  GET  /api/weather/current?q=Delhi           -> current weather by city name
  GET  /api/weather/forecast?lat=&lon=&days=  -> hourly + daily forecast
  GET  /api/weather/search?q=luck             -> location autocomplete
  GET  /api/weather/geoip                     -> detect location from caller IP
  GET  /api/weather/health                    -> provider + cache status

All endpoints rate-limited per-IP via slowapi (configured in main.py).
All errors are JSON with {detail: "..."}.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    _HAS_SLOWAPI = True
except ImportError:
    _HAS_SLOWAPI = False

from core.config import settings
from schemas.weather import HealthResponse
from services.weather_service import orchestrator
from utils.geolocation import geolocate_ip, get_client_ip

log = logging.getLogger(__name__)

# slowapi Limiter is owned by main.py; we import the decorator-style limit
# from there at import time if available. To keep this file loose-coupled,
# we define decorators that the parent app can attach.
if _HAS_SLOWAPI:
    limiter = Limiter(key_func=get_remote_address, default_limits=[])
else:
    limiter = None

router = APIRouter()


def _rate_limit(spec: str):
    """Decorator that no-ops if slowapi isn't installed."""
    def wrap(fn):
        if limiter is None:
            return fn
        return limiter.limit(spec)(fn)
    return wrap


_DEFAULT_LIMIT = f"{settings.RATE_LIMIT_PER_MINUTE}/minute"


# ----------------------------------------------------------------------
# CURRENT WEATHER
# ----------------------------------------------------------------------
@router.get("/current")
@_rate_limit(_DEFAULT_LIMIT)
async def get_current(
    request: Request,
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180),
    q: Optional[str] = Query(None, min_length=1, max_length=100, description="City name"),
):
    """Current weather. Provide either `lat`+`lon` OR `q` (city name)."""
    if q and (lat is None or lon is None):
        # Resolve city -> coordinates via search, then fetch.
        try:
            hits = await orchestrator.search(q, limit=1)
        except Exception as e:  # noqa: BLE001 — surface as 502 with message
            log.exception("search failed for %r", q)
            raise HTTPException(status_code=502, detail=f"Location search failed: {e}")
        if not hits:
            raise HTTPException(status_code=404, detail=f"Location not found: {q}")
        lat, lon = hits[0].lat, hits[0].lon

    if lat is None or lon is None:
        raise HTTPException(status_code=400, detail="Provide lat+lon or q (city name)")

    try:
        result = await orchestrator.get_current(lat, lon)
    except HTTPException:
        raise  # Already well-formed
    except Exception as e:  # noqa: BLE001
        log.exception("get_current crashed at (%s,%s)", lat, lon)
        raise HTTPException(status_code=502, detail=f"Weather fetch failed: {e}")

    headers = {
        "X-Weather-Provider": result.provider,
        "X-Weather-Cached": "true" if result.from_cache else "false",
    }
    return JSONResponse(content=result.payload, headers=headers)


# ----------------------------------------------------------------------
# FORECAST (hourly + daily)
# ----------------------------------------------------------------------
@router.get("/forecast")
@_rate_limit(_DEFAULT_LIMIT)
async def get_forecast(
    request: Request,
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180),
    q: Optional[str] = Query(None, min_length=1, max_length=100),
    days: int = Query(5, ge=1, le=7),
):
    """Hourly (next 24h) + daily (next N days) forecast."""
    if q and (lat is None or lon is None):
        try:
            hits = await orchestrator.search(q, limit=1)
        except Exception as e:  # noqa: BLE001
            log.exception("search failed for %r", q)
            raise HTTPException(status_code=502, detail=f"Location search failed: {e}")
        if not hits:
            raise HTTPException(status_code=404, detail=f"Location not found: {q}")
        lat, lon = hits[0].lat, hits[0].lon

    if lat is None or lon is None:
        raise HTTPException(status_code=400, detail="Provide lat+lon or q (city name)")

    try:
        result = await orchestrator.get_forecast(lat, lon, days=days)
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        log.exception("get_forecast crashed at (%s,%s)", lat, lon)
        raise HTTPException(status_code=502, detail=f"Forecast fetch failed: {e}")

    headers = {
        "X-Weather-Provider": result.provider,
        "X-Weather-Cached": "true" if result.from_cache else "false",
    }
    return JSONResponse(content=result.payload, headers=headers)


# ----------------------------------------------------------------------
# LOCATION AUTOCOMPLETE
# ----------------------------------------------------------------------
@router.get("/search")
@_rate_limit(f"{settings.RATE_LIMIT_PER_MINUTE * 2}/minute")  # lenient — typed per keystroke
async def search_locations(
    request: Request,
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(5, ge=1, le=10),
):
    """Location autocomplete — returns matching cities from the active providers."""
    hits = await orchestrator.search(q, limit=limit)
    return {"results": [h.model_dump(mode="json") for h in hits], "query": q}


# ----------------------------------------------------------------------
# IP GEOLOCATION (fallback when browser geolocation is blocked)
# ----------------------------------------------------------------------
@router.get("/geoip")
@_rate_limit(_DEFAULT_LIMIT)
async def geoip(request: Request):
    """Returns the caller's approximate location from their IP."""
    ip = get_client_ip(request)
    info = await geolocate_ip(ip)
    if not info:
        # Fall back to a safe default so frontend has something to show.
        return {
            "ip": ip,
            "lat": 28.6139,
            "lon": 77.2090,
            "city": "Delhi",
            "country": "India",
            "fallback": True,
        }
    info["fallback"] = False
    return info


# ----------------------------------------------------------------------
# HEALTH / STATUS
# ----------------------------------------------------------------------
@router.get("/health", response_model=HealthResponse)
async def health():
    """Which providers are active, which cache backend, what rate limit."""
    return orchestrator.get_health()
