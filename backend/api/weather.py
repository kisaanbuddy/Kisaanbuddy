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

import asyncio
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
from services.weather_intelligence import build_contextual_weather_intelligence
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
# AI AGRICULTURAL WEATHER ADVISORY (Powered by Google Gemini)
# ----------------------------------------------------------------------
@router.get("/ai-advisory")
@_rate_limit(_DEFAULT_LIMIT)
async def get_ai_weather_advisory(
    request: Request,
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180),
    q: Optional[str] = Query(None, min_length=1, max_length=100),
    crop: Optional[str] = Query(None, description="Optional target crop name"),
    language: Optional[str] = Query("hi", description="hi, kn, or en"),
):
    """Generate weather-grounded agricultural advisory using Google Gemini."""
    if q and (lat is None or lon is None):
        try:
            hits = await orchestrator.search(q, limit=1)
            if hits:
                lat, lon = hits[0].lat, hits[0].lon
        except Exception:
            pass

    if lat is None or lon is None:
        return JSONResponse(
            content={
                "available": False,
                "reason": "Location coordinates or city name required for weather advisory.",
                "location": q or None,
                "target_crop": crop or "General Crops",
            }
        )

    try:
        forecast_res = await orchestrator.get_forecast(lat, lon, days=5)
        fdata = forecast_res.payload if hasattr(forecast_res, "payload") else forecast_res
    except Exception as e:
        log.warning("Weather fetch failed in ai-advisory: %s", e)
        return JSONResponse(
            content={
                "available": False,
                "reason": "Live weather data is currently unavailable from meteorological providers.",
                "location": q or f"({lat:.2f}, {lon:.2f})",
                "target_crop": crop or "General Crops",
            }
        )

    from services.chat.gemini_service import is_gemini_configured, generate_with_retry, get_model_chain
    import json

    loc_name = fdata.get("location", {}).get("name") or q or f"({lat:.2f}, {lon:.2f})"
    daily_summary = [
        f"{d.get('date')}: Min {d.get('temp_min_c')}°C, Max {d.get('temp_max_c')}°C, RainProb {d.get('chance_of_rain', 0)}%, Wind {d.get('wind_kph', 0)} km/h, {d.get('condition')}"
        for d in (fdata.get("daily") or [])[:5]
    ]

    contextual = build_contextual_weather_intelligence(None, fdata, crop=crop)
    advisory_data = {
        "available": True,
        "location": loc_name,
        "target_crop": crop or "General Crops",
        "spray_window_safe": contextual["advisories"].get("spraying", {}).get("status") == "safe",
        "spray_recommendation": contextual["advisories"].get("spraying", {}).get("message"),
        "irrigation_action": contextual["advisories"].get("irrigation", {}).get("message"),
        "heat_frost_alert": "; ".join(a["message"] for a in contextual["alerts"]) or "No extreme weather alert.",
        "weekly_farm_actions": [
            contextual["advisories"].get("fertilizer", {}).get("message"),
            contextual["advisories"].get("disease", {}).get("message"),
        ],
        "advisory_summary": fdata.get("daily", [{}])[0].get("condition", "Forecast available."),
        "weather_source": fdata.get("provider", "Live Weather Engine"),
        "fetched_at": fdata.get("fetched_at"),
        "uncertainty_note": contextual.get("uncertainty_note"),
    }

    if is_gemini_configured():
        prompt = (
            f"You are an Indian agricultural weather specialist (IMD / Agromet style).\n"
            f"Location: {loc_name}\n"
            f"Target crop: {crop or 'Seasonal crops'}\n"
            f"Language: {language}\n"
            f"Forecast data: {json.dumps(daily_summary, ensure_ascii=False)}\n\n"
            "Generate actionable weather farming advisory. Return strict JSON with keys:\n"
            "{\n"
            '  "spray_window_safe": boolean (false if rain > 2mm or high wind forecast in next 24-48h),\n'
            '  "spray_recommendation": "Short practical spray timing advice in requested language",\n'
            '  "irrigation_action": "Specific irrigation advice (postpone if heavy rain forecast)",\n'
            '  "heat_frost_alert": "Extreme temperature / frost / hailstorm warnings or None",\n'
            '  "weekly_farm_actions": ["Action 1", "Action 2", "Action 3"],\n'
            '  "advisory_summary": "2-sentence warm, clear farmer briefing"\n'
            "}"
        )
        try:
            resp, model = await generate_with_retry(
                contents=prompt,
                feature="weather_advisory",
                models=get_model_chain(for_vision=False),
                temperature=0.2,
                max_output_tokens=600,
                response_mime_type="application/json",
            )
            raw = (getattr(resp, "text", "") or "").strip()
            parsed = json.loads(raw)
            advisory_data.update(parsed)
            advisory_data["ai_model"] = model
        except Exception as err:
            log.warning("Gemini weather advisory generation error: %s", err)

    return JSONResponse(content=advisory_data)


# ----------------------------------------------------------------------
# CONTEXTUAL AGRICULTURAL WEATHER INTELLIGENCE
# ----------------------------------------------------------------------
@router.get("/contextual")
@_rate_limit(_DEFAULT_LIMIT)
async def get_contextual_weather(
    request: Request,
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180),
    q: Optional[str] = Query(None, min_length=1, max_length=100),
    crop: Optional[str] = Query(None, max_length=80),
    activity: Optional[str] = Query(None, max_length=80),
):
    """Background weather intelligence for irrigation, spraying, fertilizer, disease, harvest & equipment."""
    if q and (lat is None or lon is None):
        try:
            hits = await orchestrator.search(q, limit=1)
            if hits:
                lat, lon = hits[0].lat, hits[0].lon
        except Exception as e:
            log.warning("Contextual weather location search failed for %r: %s", q, e)

    if lat is None or lon is None:
        return JSONResponse(
            content=build_contextual_weather_intelligence(None, None, crop=crop, activity=activity)
        )

    current_payload = None
    forecast_payload = None
    try:
        cur_res, fc_res = await asyncio.gather(
            orchestrator.get_current(lat, lon),
            orchestrator.get_forecast(lat, lon, days=3),
            return_exceptions=True,
        )
        if not isinstance(cur_res, Exception):
            current_payload = cur_res.payload
        if not isinstance(fc_res, Exception):
            forecast_payload = fc_res.payload
    except Exception as e:
        log.warning("Contextual weather fetch failed at (%s, %s): %s", lat, lon, e)

    intelligence = build_contextual_weather_intelligence(
        current_payload, forecast_payload, crop=crop, activity=activity
    )
    headers = {}
    if intelligence.get("provider"):
        headers["X-Weather-Provider"] = str(intelligence["provider"])
        headers["X-Weather-Cached"] = "true" if intelligence.get("cached") else "false"
    return JSONResponse(content=intelligence, headers=headers)


# ----------------------------------------------------------------------
# HEALTH / STATUS
# ----------------------------------------------------------------------
@router.get("/health", response_model=HealthResponse)
async def health():
    """Which providers are active, which cache backend, what rate limit."""
    return orchestrator.get_health()
