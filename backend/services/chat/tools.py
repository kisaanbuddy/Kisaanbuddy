"""Sandboxed tool dispatcher for the KrishiAI assistant.

Each tool calls the SAME internal service the HTTP routes use, so the
assistant shares the exact fallback chain, cache, and data shape as the
rest of the site. No subprocess, no outbound HTTP to our own API.

Tools are strictly READ-ONLY (except `post_job` which is a write) and
constrained to parameters the model declared in prompts.TOOL_SCHEMAS.
Extra/unknown keys are ignored.

Every tool returns a small JSON-serialisable dict. Errors never raise -
they return {"error": "..."} so the model can recover gracefully.
"""
from __future__ import annotations

import logging
from typing import Any, Awaitable, Callable, Dict, Optional

log = logging.getLogger(__name__)


# ============================================================================
# Weather / Forecast
# ============================================================================
async def _tool_get_weather(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    city: Optional[str] = None,
) -> Dict[str, Any]:
    try:
        from services.weather_service import orchestrator

        if lat is not None and lon is not None:
            data = await orchestrator.get_current(lat=lat, lon=lon)
        elif city:
            data = await orchestrator.get_current_by_city(city)
        else:
            return {"error": "Need either lat/lon or city."}
        return {
            "location": data.get("location"),
            "temperature_c": data.get("temperature_c"),
            "feels_like_c": data.get("feels_like_c"),
            "humidity_pct": data.get("humidity_pct"),
            "wind_kph": data.get("wind_kph"),
            "condition": data.get("condition"),
            "rain_mm": data.get("rain_mm"),
        }
    except Exception as e:
        log.warning("tool get_weather failed: %s", e)
        return {"error": f"Weather service unavailable: {e}"}


async def _tool_get_forecast(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    city: Optional[str] = None,
    days: int = 5,
) -> Dict[str, Any]:
    try:
        from services.weather_service import orchestrator

        days = max(1, min(7, int(days or 5)))
        if lat is not None and lon is not None:
            data = await orchestrator.get_forecast(lat=lat, lon=lon, days=days)
        elif city:
            data = await orchestrator.get_forecast_by_city(city, days=days)
        else:
            return {"error": "Need either lat/lon or city."}
        # Compact: keep daily summary only — keeps response small for the model.
        daily = data.get("daily") or []
        return {
            "location": data.get("location"),
            "daily": [
                {
                    "date": d.get("date"),
                    "min_c": d.get("min_c"),
                    "max_c": d.get("max_c"),
                    "rain_mm": d.get("rain_mm"),
                    "condition": d.get("condition"),
                }
                for d in daily[:days]
            ],
        }
    except Exception as e:
        log.warning("tool get_forecast failed: %s", e)
        return {"error": f"Forecast service unavailable: {e}"}


# ============================================================================
# Crop recommendation (ML)
# ============================================================================
async def _tool_recommend_crop(
    N: float,
    P: float,
    K: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
) -> Dict[str, Any]:
    try:
        from services.providers.ml_provider import predict_crop

        result = predict_crop(
            N=N, P=P, K=K,
            temperature=temperature, humidity=humidity, ph=ph, rainfall=rainfall,
        )
        return result
    except Exception as e:
        log.warning("tool recommend_crop failed: %s", e)
        return {"error": f"Crop recommender unavailable: {e}"}


# ============================================================================
# Schemes
# ============================================================================
async def _tool_list_schemes(
    state: Optional[str] = None,
    category: Optional[str] = None,
) -> Dict[str, Any]:
    try:
        from services.providers.schemes_provider import list_schemes

        schemes = list_schemes(state=state, category=category)
        return {
            "count": len(schemes),
            "schemes": [
                {
                    "name": s.get("name"),
                    "category": s.get("category"),
                    "state": s.get("state"),
                    "summary": s.get("summary"),
                    "url": s.get("url"),
                }
                for s in schemes[:25]
            ],
        }
    except Exception as e:
        log.warning("tool list_schemes failed: %s", e)
        return {"error": f"Schemes unavailable: {e}"}


# ============================================================================
# Mandi prices
# ============================================================================
async def _tool_get_mandi_prices(
    crop: Optional[str] = None,
    state: Optional[str] = None,
    market: Optional[str] = None,
) -> Dict[str, Any]:
    try:
        from services.providers.mandi_provider import get_prices

        crops = get_prices(crop=crop, state=state, market=market)
        return {
            "count": len(crops),
            "crops": [
                {
                    "name": c.get("name"),
                    "market": c.get("market"),
                    "state": c.get("state"),
                    "price": c.get("price"),
                    "unit": c.get("unit"),
                    "category": c.get("category"),
                    "trend": c.get("trend"),
                    "change_percent": c.get("change_percent"),
                    "min_price": c.get("min_price"),
                    "max_price": c.get("max_price"),
                }
                for c in crops
            ],
        }
    except Exception as e:
        log.warning("tool get_mandi_prices failed: %s", e)
        return {"error": f"Mandi service unavailable: {e}"}


# ============================================================================
# Worker Connect — job marketplace
# ============================================================================
async def _tool_post_job(
    work_type: str,
    district: str,
    state: str,
    workers_needed: int,
    wage_amount: int,
    contact_name: str,
    contact_phone: str,
    village: Optional[str] = None,
    work_type_detail: Optional[str] = None,
    wage_unit: str = "per_day",
    duration_days: int = 1,
    start_date: Optional[str] = None,
    notes: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> Dict[str, Any]:
    """Post a job on Worker Connect. Returns the created job summary."""
    try:
        from schemas.worker_connect import JobLocation, JobPostIn
        from services import jobs_service

        payload = JobPostIn(
            work_type=work_type,
            work_type_detail=work_type_detail,
            location=JobLocation(
                village=village, district=district, state=state, lat=lat, lon=lon,
            ),
            workers_needed=workers_needed,
            wage_amount=wage_amount,
            wage_unit=wage_unit,
            duration_days=duration_days,
            start_date=start_date,
            contact_name=contact_name,
            contact_phone=contact_phone,
            notes=notes,
        )
        job = jobs_service.create_job(payload)
        unit = job.wage_unit.replace("per_", "")
        return {
            "ok": True,
            "id": job.id,
            "summary": (
                f"{job.work_type.title()} | {job.location.label()} | "
                f"{job.workers_needed} workers | Rs{job.wage_amount}/{unit} | "
                f"{job.duration_days}d | call {job.contact_phone}"
            ),
        }
    except Exception as e:
        log.warning("tool post_job failed: %s", e)
        return {"error": f"Could not post job: {e}"}


async def _tool_search_jobs(
    state: Optional[str] = None,
    district: Optional[str] = None,
    work_type: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius_km: float = 50.0,
    min_wage: Optional[int] = None,
    limit: int = 10,
) -> Dict[str, Any]:
    """Search open jobs by location / skill / wage. Returns top matches."""
    try:
        from schemas.worker_connect import JobSearchQuery
        from services import jobs_service

        q = JobSearchQuery(
            state=state,
            district=district,
            work_type=work_type,
            lat=lat,
            lon=lon,
            radius_km=radius_km,
            min_wage=min_wage,
            limit=limit,
        )
        matches = jobs_service.search_jobs(q)
        return {
            "count": len(matches),
            "matches": [
                {
                    "id": m.job.id,
                    "work_type": m.job.work_type,
                    "location": m.job.location.label(),
                    "workers_needed": m.job.workers_needed,
                    "wage": f"Rs{m.job.wage_amount}/{m.job.wage_unit.replace('per_','')}",
                    "duration_days": m.job.duration_days,
                    "distance_km": m.distance_km,
                    "contact_name": m.job.contact_name,
                    "contact_phone": m.job.contact_phone,
                    "match_score": m.match_score,
                }
                for m in matches
            ],
        }
    except Exception as e:
        log.warning("tool search_jobs failed: %s", e)
        return {"error": f"Job search unavailable: {e}"}


async def _tool_suggest_wage(
    work_type: str,
    state: Optional[str] = None,
) -> Dict[str, Any]:
    """Suggest a fair daily wage range for a work type / state."""
    try:
        from services import jobs_service

        s = jobs_service.suggest_wage(work_type, state)
        return {
            "work_type": s.work_type,
            "state": s.state,
            "suggested_min": s.suggested_min,
            "suggested_max": s.suggested_max,
            "wage_unit": s.wage_unit,
            "note": s.note,
        }
    except Exception as e:
        log.warning("tool suggest_wage failed: %s", e)
        return {"error": f"Wage suggestion unavailable: {e}"}


# ============================================================================
# Registry + dispatcher
# ============================================================================
ToolFn = Callable[..., Awaitable[Dict[str, Any]]]

TOOLS: Dict[str, ToolFn] = {
    "get_weather": _tool_get_weather,
    "get_forecast": _tool_get_forecast,
    "recommend_crop": _tool_recommend_crop,
    "list_schemes": _tool_list_schemes,
    "get_mandi_prices": _tool_get_mandi_prices,
    "post_job": _tool_post_job,
    "search_jobs": _tool_search_jobs,
    "suggest_wage": _tool_suggest_wage,
}


async def run_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool by name. Never raises - returns {"error": ...} on failure."""
    fn = TOOLS.get(name)
    if not fn:
        return {"error": f"Unknown tool: {name}"}
    if not isinstance(arguments, dict):
        arguments = {}
    try:
        return await fn(**arguments)
    except TypeError as e:
        return {"error": f"Invalid arguments for {name}: {e}"}


def enabled_tools() -> list[str]:
    return list(TOOLS.keys())
