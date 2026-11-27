"""Contextual Agricultural Weather Intelligence.

Derives actionable, scientifically grounded farming advisories and alerts
from real weather observations and forecasts. Never fabricates weather data
when providers are unavailable.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def _is_rain_condition(condition: str) -> bool:
    c = (condition or "").lower()
    return any(k in c for k in ("rain", "drizzle", "shower", "thunder", "storm"))


def build_contextual_weather_intelligence(
    current_payload: Optional[Dict[str, Any]],
    forecast_payload: Optional[Dict[str, Any]],
    crop: Optional[str] = None,
    activity: Optional[str] = None,
) -> Dict[str, Any]:
    """Compute contextual agricultural advisories from real weather payloads."""
    if not current_payload and not forecast_payload:
        return {
            "available": False,
            "reason": "Live weather data is currently unavailable from meteorological providers.",
            "provider": None,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "cached": False,
            "uncertainty_note": "No verified meteorological observation available. Rely on local field inspection.",
            "alerts": [],
            "advisories": {},
        }

    src = current_payload or forecast_payload or {}
    loc = src.get("location") or {}
    cur = (current_payload or {}).get("current") or {}
    daily = (forecast_payload or {}).get("daily") or []
    hourly = (forecast_payload or {}).get("hourly") or []

    temp_c = cur.get("temp_c")
    humidity = cur.get("humidity")
    wind_kph = cur.get("wind_kph")
    condition = cur.get("condition") or ""
    observed_at = cur.get("observed_at") or src.get("fetched_at")
    provider = src.get("provider") or (forecast_payload or {}).get("provider") or "unknown"
    cached = bool(src.get("cached") or (forecast_payload or {}).get("cached"))

    # Next 24-48h forecast aggregates
    next_days = daily[:3]
    max_rain_prob_48h = max(
        [d.get("chance_of_rain") or 0 for d in daily[:2]]
        + [h.get("chance_of_rain") or 0 for h in hourly[:24]]
        + ([75] if _is_rain_condition(condition) else [0])
    )
    max_temp_48h = max(
        [d.get("temp_max_c") for d in daily[:2] if d.get("temp_max_c") is not None]
        + ([temp_c] if temp_c is not None else [25.0])
    )
    min_temp_48h = min(
        [d.get("temp_min_c") for d in daily[:2] if d.get("temp_min_c") is not None]
        + ([temp_c] if temp_c is not None else [15.0])
    )
    max_wind_48h = max(
        [d.get("wind_kph") for d in daily[:2] if d.get("wind_kph") is not None]
        + [h.get("wind_kph") for h in hourly[:24] if h.get("wind_kph") is not None]
        + ([wind_kph] if wind_kph is not None else [0.0])
    )

    alerts: List[Dict[str, Any]] = []

    # 1. Heavy rainfall alert
    if max_rain_prob_48h >= 70:
        alerts.append({
            "type": "heavy_rainfall",
            "severity": "high",
            "title": "Rainfall Expected",
            "message": f"High rain probability ({int(max_rain_prob_48h)}%) in the next 24–48h. Review irrigation, pause spraying, and ensure field drainage.",
            "forecast_window": "Next 24–48 hours",
        })
    elif max_rain_prob_48h >= 45:
        alerts.append({
            "type": "rainfall_caution",
            "severity": "medium",
            "title": "Rain Likelihood",
            "message": f"Moderate rain chance ({int(max_rain_prob_48h)}%) ahead. Plan spraying, fertilizer top-dressing, and harvesting accordingly.",
            "forecast_window": "Next 24–48 hours",
        })

    # 2. Frost alert
    if min_temp_48h <= 4.0:
        alerts.append({
            "type": "frost",
            "severity": "high",
            "title": "Frost Risk",
            "message": f"Minimum temperature may drop to {min_temp_48h:.1f}°C. Protect sensitive vegetables/seedlings with light evening irrigation or mulching.",
            "forecast_window": "Next 48 hours",
        })

    # 3. Heatwave alert
    if max_temp_48h >= 40.0:
        alerts.append({
            "type": "heatwave",
            "severity": "high",
            "title": "Heat Stress / Heatwave",
            "message": f"Temperatures expected up to {max_temp_48h:.1f}°C. Schedule irrigation in early morning or evening to reduce evapotranspiration loss.",
            "forecast_window": "Next 48 hours",
        })

    # 4. Strong winds alert
    if max_wind_48h >= 25.0:
        alerts.append({
            "type": "strong_winds",
            "severity": "high",
            "title": "Strong Winds Expected",
            "message": f"Winds up to {max_wind_48h:.0f} km/h expected. Avoid drone spraying, foliar sprays, and support tall crops.",
            "forecast_window": "Next 24–48 hours",
        })
    elif max_wind_48h > 15.0:
        alerts.append({
            "type": "wind_caution",
            "severity": "medium",
            "title": "Elevated Wind for Spraying",
            "message": f"Wind speeds around {max_wind_48h:.0f} km/h may cause spray drift. Check calm morning conditions before spraying or drone use.",
            "forecast_window": "Next 24 hours",
        })

    # 5. Potential drought / dry stress
    dry_days = sum(1 for d in next_days if (d.get("chance_of_rain") or 0) < 15)
    if humidity is not None and humidity < 35 and max_temp_48h >= 34.0 and dry_days >= len(next_days) and len(next_days) > 0:
        alerts.append({
            "type": "drought_stress",
            "severity": "medium",
            "title": "Dry & Moisture Stress Conditions",
            "message": f"Low humidity ({humidity}%) with warm temperatures ({max_temp_48h:.1f}°C) and no rain forecast. Monitor soil moisture closely.",
            "forecast_window": f"Next {len(next_days)} days",
        })

    # 6. Fungal disease risk
    fungal_risk = (
        humidity is not None
        and temp_c is not None
        and humidity >= 75
        and 20.0 <= temp_c <= 32.0
    )
    if fungal_risk:
        alerts.append({
            "type": "crop_disease_risk",
            "severity": "medium",
            "title": "Elevated Fungal Disease Risk",
            "message": f"High humidity ({humidity}%) at {temp_c:.1f}°C favors fungal diseases (blight, rust, powdery mildew). Inspect lower leaves.",
            "forecast_window": "Current conditions",
        })

    # Contextual advisories per farming domain
    crop_label = crop or "your crop"
    advisories: Dict[str, Dict[str, Any]] = {
        "irrigation": {
            "status": "postpone" if max_rain_prob_48h >= 50 else ("increase" if (humidity is not None and humidity < 40 and max_temp_48h >= 32) else "normal"),
            "title": (
                "Review Irrigation Schedule — Rain Expected"
                if max_rain_prob_48h >= 50
                else ("Moisture Stress — Prioritize Morning Irrigation" if (humidity is not None and humidity < 40 and max_temp_48h >= 32) else "Normal Irrigation Window")
            ),
            "message": (
                f"Rainfall probability ({int(max_rain_prob_48h)}%) in the next 24–48h. Delay irrigation to prevent waterlogging and save pumping costs."
                if max_rain_prob_48h >= 50
                else (
                    f"Warm ({max_temp_48h:.1f}°C) and dry ({humidity}% humidity) conditions increase evapotranspiration for {crop_label}."
                    if (humidity is not None and humidity < 40 and max_temp_48h >= 32)
                    else f"Conditions are balanced for standard irrigation scheduling on {crop_label}."
                )
            ),
        },
        "fertilizer": {
            "status": "warning" if max_rain_prob_48h >= 50 else "safe",
            "title": "Rain Leaching Risk for Fertilizer" if max_rain_prob_48h >= 50 else "Suitable for Fertilizer Application",
            "message": (
                f"Predicted rainfall ({int(max_rain_prob_48h)}%) may wash away or leach top-dressed nitrogen/urea. Delay application until rain passes."
                if max_rain_prob_48h >= 50
                else "Low near-term rain risk; apply basal or top-dressing fertilizer as per soil test recommendations."
            ),
        },
        "spraying": {
            "status": "unsafe" if (max_rain_prob_48h >= 40 or max_wind_48h > 15) else "safe",
            "title": (
                "Washout Risk — Delay Spraying"
                if max_rain_prob_48h >= 40
                else ("High Wind Drift Risk — Delay Spraying" if max_wind_48h > 15 else "Suitable Spraying Window")
            ),
            "message": (
                f"Rain probability ({int(max_rain_prob_48h)}%) can wash off foliar sprays within hours."
                if max_rain_prob_48h >= 40
                else (
                    f"Wind speed ({max_wind_48h:.0f} km/h) exceeds safe 15 km/h limit for spraying and drone operations."
                    if max_wind_48h > 15
                    else f"Calm winds ({wind_kph if wind_kph is not None else max_wind_48h:.0f} km/h) and low rain chance support safe early-morning/evening spraying."
                )
            ),
        },
        "disease": {
            "status": "elevated" if fungal_risk else "low",
            "title": "High Fungal Disease Risk" if fungal_risk else "Low Weather-Driven Fungal Risk",
            "message": (
                f"High humidity ({humidity}%) and mild temperatures ({temp_c:.1f}°C) increase risk of fungal infections like blight, rust, and mildew."
                if fungal_risk
                else "Current humidity and temperature are less favorable for rapid fungal spore spread; continue routine scouting."
            ),
        },
        "harvesting": {
            "status": "warning" if max_rain_prob_48h >= 45 else "safe",
            "title": "Rainfall May Affect Harvesting" if max_rain_prob_48h >= 45 else "Dry Harvesting Window",
            "message": (
                f"Rain expected ({int(max_rain_prob_48h)}% probability). Protect cut produce with waterproof tarpaulins or reschedule harvesting."
                if max_rain_prob_48h >= 45
                else "Dry conditions are favorable for harvesting, threshing, and grain drying."
            ),
        },
        "equipment_booking": {
            "status": "warning" if (max_rain_prob_48h >= 45 or max_wind_48h > 15) else "safe",
            "title": (
                "Weather Caution for Field Equipment"
                if (max_rain_prob_48h >= 45 or max_wind_48h > 15)
                else "Conditions Suitable for Field Equipment"
            ),
            "message": (
                f"Check forecast before confirming: "
                + (f"rain probability {int(max_rain_prob_48h)}% may affect harvesting/tillage" if max_rain_prob_48h >= 45 else "")
                + (" and " if (max_rain_prob_48h >= 45 and max_wind_48h > 15) else "")
                + (f"winds up to {max_wind_48h:.0f} km/h may affect spraying or drone operations" if max_wind_48h > 15 else "")
                + "."
                if (max_rain_prob_48h >= 45 or max_wind_48h > 15)
                else "Current forecast shows no major wind or rain disruption for scheduled equipment operations."
            ),
        },
    }

    return {
        "available": True,
        "location": {
            "name": loc.get("name") or "Local Farm",
            "region": loc.get("region"),
            "country": loc.get("country"),
            "lat": loc.get("lat"),
            "lon": loc.get("lon"),
        },
        "snapshot": {
            "temp_c": temp_c,
            "humidity": humidity,
            "wind_kph": wind_kph,
            "condition": condition,
            "max_rain_prob_48h": max_rain_prob_48h,
        },
        "provider": provider,
        "observed_at": observed_at,
        "fetched_at": src.get("fetched_at") or datetime.now(timezone.utc).isoformat(),
        "cached": cached,
        "uncertainty_note": "Meteorological forecasts carry inherent uncertainty beyond 24 hours; verify local field conditions before spraying or harvesting.",
        "alerts": alerts,
        "advisories": advisories,
        "activity_focus": activity,
    }
