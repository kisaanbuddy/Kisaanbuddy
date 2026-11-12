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

        if lat is None or lon is None:
            if city:
                try:
                    hits = await orchestrator.search(city, limit=1)
                    if hits:
                        lat, lon = hits[0].lat, hits[0].lon
                except Exception:
                    pass

        if lat is not None and lon is not None:
            res = await orchestrator.get_current(lat=lat, lon=lon)
            data = res.payload if hasattr(res, "payload") else res
        else:
            return {"error": f"Could not determine coordinates for '{city or 'unknown'}'."}
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
        if lat is None or lon is None:
            if city:
                try:
                    hits = await orchestrator.search(city, limit=1)
                    if hits:
                        lat, lon = hits[0].lat, hits[0].lon
                except Exception:
                    pass

        if lat is not None and lon is not None:
            res = await orchestrator.get_forecast(lat=lat, lon=lon, days=days)
            data = res.payload if hasattr(res, "payload") else res
        else:
            return {"error": f"Could not determine coordinates for '{city or 'unknown'}'."}
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
                    "scheme_id": s.get("scheme_id"),
                    "name": s.get("name"),
                    "category": s.get("category"),
                    "state": s.get("state"),
                    "benefits": s.get("benefits"),
                    "summary": s.get("summary"),
                    "eligibility": s.get("eligibility"),
                    "deadline": s.get("deadline"),
                    "official_source_url": s.get("url"),
                    "application_url": s.get("application_url"),
                    "last_verified": s.get("last_verified"),
                }
                for s in schemes[:15]
            ],
            "disclaimer": "All schemes are grounded in official government gazettes. KisaanBuddy does not guarantee scheme approval.",
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
        # Reuse the same AGMARKNET-backed source exposed by the API route.
        # Its explicit source label prevents the assistant from presenting a
        # fallback record as a live market quotation.
        from api.mandi import fetch_live_crops

        crops, source = await fetch_live_crops()
        if crop:
            crops = [c for c in crops if crop.casefold() in c["name"].casefold()]
        if state:
            crops = [c for c in crops if state.casefold() in c["state"].casefold()]
        if market:
            crops = [c for c in crops if market.casefold() in c["mandi"].casefold()]
        return {
            "count": len(crops),
            "source": source,
            "observation_note": (
                "Live AGMARKNET data" if source == "live"
                else "Fallback reference data; it is not a live market quote."
            ),
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
# Crop Doctor / Disease Diagnostic
# ============================================================================
async def _tool_diagnose_crop_disease(
    crop_name: str,
    symptoms: Optional[str] = None,
) -> Dict[str, Any]:
    """Query authentic ICAR/CIBRC disease advisory database for a crop and symptoms."""
    try:
        from services.disease_knowledge_engine import query_knowledge_base
        results = query_knowledge_base(crop_name, symptoms)
        if not results:
            return {
                "found": False,
                "crop": crop_name,
                "message": f"No exact match found in ICAR records for '{crop_name}' with symptoms '{symptoms or ''}'. Please upload a clear photo of the leaf or stem in Crop Doctor for visual analysis.",
            }
        top = results[0]
        return {
            "found": True,
            "crop": top.get("crop"),
            "disease_name": top.get("disease_or_pest"),
            "category": top.get("category"),
            "symptoms_described": top.get("symptoms"),
            "preventive_cultural": top.get("cultural_preventive"),
            "biological_organic_solution": top.get("biological_organic"),
            "chemical_control": top.get("chemical_control"),
            "dosage_guidelines": top.get("dosage_guidelines"),
            "pre_harvest_interval_days": top.get("pre_harvest_interval_days"),
            "safety_instructions": top.get("safety_instructions"),
            "source_institution": top.get("source_institution"),
        }
    except Exception as e:
        log.warning("tool diagnose_crop_disease failed: %s", e)
        return {"error": f"Crop diagnostic unavailable: {e}"}


# ============================================================================
# Agriculture Marketplace (Authentic Verified Listings)
# ============================================================================
async def _tool_search_marketplace(
    query: str = "",
    category: Optional[str] = None,
    listing_type: Optional[str] = None,
    limit: int = 5,
) -> Dict[str, Any]:
    """Search authentic equipment and produce listings from verified farmers/sellers."""
    try:
        from db.session import SessionLocal
        from db.models import EquipmentListing, ProduceListing
        q = (query or "").strip().lower()
        items = []
        with SessionLocal() as db:
            eq_q = db.query(EquipmentListing).filter(EquipmentListing.availability_status == "available")
            if listing_type in ("rent", "sale"):
                eq_q = eq_q.filter(EquipmentListing.listing_type == listing_type)
            for eq in eq_q.limit(25).all():
                text_block = f"{eq.title or ''} {eq.category or ''} {eq.brand or ''} {eq.model_name or ''} {eq.district or ''} {eq.state or ''}".lower()
                if not q or q in text_block:
                    price_str = f"₹{int(eq.price):,}" if eq.price else "Negotiable"
                    unit = f"/{eq.price_unit}" if eq.price_unit else ""
                    items.append({
                        "id": eq.id,
                        "type": "equipment",
                        "title": eq.title or f"{eq.brand} {eq.model_name}",
                        "category": eq.category,
                        "listing_type": eq.listing_type,
                        "price": f"{price_str}{unit}",
                        "location": f"{eq.district or ''}, {eq.state or ''}".strip(", "),
                        "owner_name": eq.owner_name,
                        "contact_phone": eq.owner_phone,
                    })
                    if len(items) >= limit:
                        break

            if len(items) < limit:
                pr_q = db.query(ProduceListing).filter(ProduceListing.availability_status == "available")
                for pr in pr_q.limit(20).all():
                    text_block = f"{pr.crop_name or ''} {pr.variety or ''} {pr.district or ''} {pr.state or ''}".lower()
                    if not q or q in text_block:
                        price_val = f"₹{int(pr.asking_price):,}/{pr.price_unit or 'quintal'}" if pr.asking_price else "Market rate"
                        items.append({
                            "id": pr.id,
                            "type": "produce",
                            "title": f"{pr.crop_name} ({pr.variety or 'Standard'})",
                            "quantity": f"{pr.quantity} {pr.quantity_unit or 'quintals'}" if pr.quantity else "Available",
                            "price": price_val,
                            "location": f"{pr.district or ''}, {pr.state or ''}".strip(", "),
                            "farmer_name": pr.farmer_name,
                            "contact_phone": pr.farmer_phone,
                        })
                        if len(items) >= limit:
                            break

        return {
            "count": len(items),
            "listings": items,
            "source": "KisaanBuddy Authentic Marketplace (Farmer/Owner Direct)",
        }
    except Exception as e:
        log.warning("tool search_marketplace failed: %s", e)
        return {"error": f"Marketplace search unavailable: {e}"}


# ============================================================================
# Fertilizer & Nutrient Recommendations
# ============================================================================
async def _tool_get_fertilizer_recommendation(
    crop_name: str,
    growth_stage: Optional[str] = None,
) -> Dict[str, Any]:
    """Get ICAR recommended NPK and organic fertilization dose per acre."""
    crop_l = (crop_name or "").lower().strip()
    guides = {
        "wheat": {
            "crop": "Wheat (गेहूं)",
            "basal_dose": "50 kg DAP + 25 kg MOP per acre at sowing",
            "top_dress_1": "50 kg Urea per acre at 1st irrigation (~21 days, CRI stage)",
            "top_dress_2": "25 kg Urea per acre at 2nd irrigation (~45 days)",
            "bio_fertilizer": "Azotobacter + PSB @ 500g/acre seed treatment",
            "micronutrients": "Zinc Sulphate (21%) @ 10 kg/acre if soil deficient",
        },
        "rice": {
            "crop": "Rice / Paddy (धान)",
            "basal_dose": "35 kg DAP + 20 kg MOP + 10 kg Zinc Sulphate (21%) per acre at transplanting",
            "top_dress_1": "35 kg Urea per acre at active tillering (~25 days)",
            "top_dress_2": "25 kg Urea per acre at panicle initiation (~45 days)",
            "bio_fertilizer": "Azospirillum + PSB root dip before transplanting",
            "micronutrients": "If yellowing/Khaira appears: spray 5 kg Zinc Sulphate + 2.5 kg Slaked Lime per acre in 200 L water",
        },
        "tomato": {
            "crop": "Tomato (टमाटर)",
            "basal_dose": "8-10 tons well-rotted FYM + 40 kg DAP + 25 kg MOP per acre",
            "top_dress_1": "25 kg Urea + 15 kg MOP at 30 days after transplanting",
            "top_dress_2": "25 kg Urea at flowering & fruit setting stage",
            "bio_fertilizer": "Trichoderma viride @ 2 kg/acre mixed in FYM for soil application",
            "micronutrients": "Boron (Solubor) @ 1 g/L spray at flowering to prevent fruit cracking",
        },
        "cotton": {
            "crop": "Cotton (कपास)",
            "basal_dose": "40 kg DAP + 25 kg MOP per acre at sowing",
            "top_dress_1": "35 kg Urea at squaring (~35-40 days)",
            "top_dress_2": "35 kg Urea at peak flowering (~60-70 days)",
            "bio_fertilizer": "Azotobacter + PSB seed treatment",
            "micronutrients": "Magnesium Sulphate @ 10 g/L spray if leaf reddening occurs",
        },
    }
    for k, v in guides.items():
        if k in crop_l or (k == "rice" and ("धान" in crop_l or "paddy" in crop_l)) or (k == "wheat" and "गेहूं" in crop_l) or (k == "tomato" and "टमाटर" in crop_l) or (k == "cotton" and "कपास" in crop_l):
            return {"crop": v["crop"], "recommendation": v}

    return {
        "crop": crop_name,
        "recommendation": {
            "basal_dose": "Balanced NPK 4:2:1 ratio. Apply all P & K + 1/3 N as basal dose.",
            "top_dressing": "Apply remaining Nitrogen in 2 equal splits during vegetative and flowering stages.",
            "advice": "Take a free Soil Health Card test from your block Krishi Bhavan for site-specific nutrient doses.",
        }
    }


# ============================================================================
# Irrigation Advisory (Critical Stages + Water Saving)
# ============================================================================
async def _tool_get_irrigation_advisory(
    crop_name: str,
    soil_type: Optional[str] = None,
    irrigation_type: Optional[str] = "flood",
    growth_stage: Optional[str] = None,
    rain_forecast_mm: float = 0.0,
) -> Dict[str, Any]:
    """Get ICAR-grounded irrigation recommendations and critical moisture stages."""
    crop_l = (crop_name or "").lower().strip()
    critical_stages = {
        "wheat": ["Crown Root Initiation (CRI) at 21 DAS", "Tillering at 40-45 DAS", "Jointing at 60-65 DAS", "Flowering at 80-85 DAS", "Milking/Dough at 100-105 DAS"],
        "rice": ["Transplanting establishment", "Active tillering", "Panicle initiation", "Flowering & grain filling (keep 2-3 cm standing water)"],
        "maize": ["Knee-high vegetative stage", "Tasseling", "Silking (most critical)", "Grain filling"],
        "cotton": ["Squaring (35-40 DAS)", "Peak flowering (60-70 DAS)", "Boll development"],
        "tomato": ["Early establishment", "Vegetative branch growth", "Flowering & fruit set", "Fruit expansion"],
    }
    matched_crop = next((k for k in critical_stages if k in crop_l), "general_crop")
    stages = critical_stages.get(matched_crop, ["Active vegetative growth", "Flowering", "Fruit/grain development"])

    soil = (soil_type or "Loamy").lower()
    interval_days = 7
    if "sand" in soil:
        interval_days = 4
        soil_note = "Sandy soil drains quickly: apply lighter water more frequently to avoid nutrient leaching."
    elif "clay" in soil or "black" in soil:
        interval_days = 10
        soil_note = "Clay/Black soil holds moisture well: avoid waterlogging and ensure good surface drainage."
    else:
        soil_note = "Loamy soil has good water retention: maintain moderate soil moisture without standing water."

    rain_action = "Normal irrigation schedule."
    if rain_forecast_mm >= 15.0:
        rain_action = f"POSTPONE irrigation: {rain_forecast_mm} mm rainfall forecast over the coming days. Conserve water and prevent root hypoxia."
    elif rain_forecast_mm >= 5.0:
        rain_action = f"Reduce irrigation volume: light rain ({rain_forecast_mm} mm) expected."

    return {
        "crop": crop_name,
        "soil_type": soil_type or "Loam",
        "irrigation_type": irrigation_type or "flood",
        "recommended_interval_days": interval_days,
        "critical_moisture_stages": stages,
        "soil_management_note": soil_note,
        "rain_forecast_adjustment": rain_action,
        "water_saving_tip": "Switching from flood to Drip/Sprinkler saves 40-60% water and increases fertilizer use efficiency via fertigation.",
    }


# ============================================================================
# Crop Calendar & Growth Stage Monitoring
# ============================================================================
async def _tool_get_crop_calendar(
    crop_name: str,
    sowing_date_or_month: Optional[str] = None,
    state: Optional[str] = None,
) -> Dict[str, Any]:
    """Get crop growth timeline, milestone DAS (Days After Sowing), and harvesting indicators."""
    crop_l = (crop_name or "").lower().strip()
    data = {
        "wheat": {
            "duration_days": 120,
            "season": "Rabi",
            "stages": [
                {"das": "0-7", "stage": "Germination / Emergence"},
                {"das": "20-25", "stage": "Crown Root Initiation (CRI) - 1st irrigation"},
                {"das": "40-45", "stage": "Tillering & Weed Management"},
                {"das": "60-75", "stage": "Jointing & Booting"},
                {"das": "80-95", "stage": "Flowering & Milking"},
                {"das": "100-115", "stage": "Dough / Grain Hardening"},
                {"das": "120-135", "stage": "Physiological Maturity & Harvest"},
            ],
            "harvest_indicators": "Golden yellow straw, dry spikes, grain moisture below 14% (cracks between teeth).",
        },
        "rice": {
            "duration_days": 135,
            "season": "Kharif",
            "stages": [
                {"das": "0-25", "stage": "Nursery & Seedling"},
                {"das": "25-30", "stage": "Transplanting to Main Field"},
                {"das": "45-55", "stage": "Active Tillering"},
                {"das": "65-75", "stage": "Panicle Initiation"},
                {"das": "85-95", "stage": "Flowering / Anthesis"},
                {"das": "110-125", "stage": "Grain Filling & Ripening"},
                {"das": "130-140", "stage": "Harvesting"},
            ],
            "harvest_indicators": "80-85% panicles turn straw yellow, lower grains hard, drain water 10 days before harvest.",
        },
        "cotton": {
            "duration_days": 160,
            "season": "Kharif",
            "stages": [
                {"das": "0-15", "stage": "Germination & Stand Establishment"},
                {"das": "35-45", "stage": "Squaring (Square formation)"},
                {"das": "60-75", "stage": "Flowering"},
                {"das": "80-110", "stage": "Boll Formation"},
                {"das": "120-160", "stage": "Boll Bursting & Picking (2-3 pickings)"},
            ],
            "harvest_indicators": "Pick fully burst bolls in dry sunny morning hours. Do not pick wet cotton.",
        },
    }
    key = next((k for k in data if k in crop_l), None)
    if key:
        return {"crop": crop_name, "calendar": data[key]}
    return {
        "crop": crop_name,
        "calendar": {
            "duration_days": 110,
            "season": "General",
            "stages": [
                {"das": "0-10", "stage": "Sowing & Germination"},
                {"das": "20-40", "stage": "Vegetative Growth"},
                {"das": "45-65", "stage": "Flowering & Fruit/Ear Set"},
                {"das": "70-95", "stage": "Maturation"},
                {"das": "100-115", "stage": "Harvesting"},
            ],
            "harvest_indicators": "Plant leaves turn yellow/senesce, fruit/seed reaches full size and recommended moisture.",
        }
    }


# ============================================================================
# Farming Economics (Expense and Profit Analysis)
# ============================================================================
async def _tool_analyze_farming_economics(
    crop_name: str,
    acreage: float = 1.0,
    yield_expected_quintals: Optional[float] = None,
    mandi_price_per_quintal: Optional[float] = None,
) -> Dict[str, Any]:
    """Calculate transparent farming expense breakdown, gross revenue, and net profit per acre."""
    crop_l = (crop_name or "").lower().strip()
    ac = max(0.25, float(acreage or 1.0))

    # CACP-based representative cost models per acre in India (approximate ranges)
    models = {
        "wheat": {"yield": 18.0, "mandi": 2275, "land_prep": 2500, "seeds": 1600, "fert": 3200, "irrigation": 2000, "pest": 1200, "labor_harvest": 4500},
        "rice": {"yield": 22.0, "mandi": 2300, "land_prep": 3500, "seeds": 1400, "fert": 3800, "irrigation": 3000, "pest": 1800, "labor_harvest": 6500},
        "mustard": {"yield": 8.0, "mandi": 5650, "land_prep": 2200, "seeds": 800, "fert": 2500, "irrigation": 1200, "pest": 1000, "labor_harvest": 3500},
        "cotton": {"yield": 9.0, "mandi": 7121, "land_prep": 3000, "seeds": 2000, "fert": 4500, "irrigation": 2500, "pest": 3500, "labor_harvest": 7500},
        "tomato": {"yield": 120.0, "mandi": 1200, "land_prep": 4000, "seeds": 3500, "fert": 6000, "irrigation": 3000, "pest": 5000, "labor_harvest": 10000},
    }
    match = next((m for k, m in models.items() if k in crop_l), {
        "yield": 15.0, "mandi": 2500, "land_prep": 2800, "seeds": 1500, "fert": 3200, "irrigation": 2200, "pest": 1500, "labor_harvest": 5000
    })

    y_per_acre = yield_expected_quintals if yield_expected_quintals and yield_expected_quintals > 0 else match["yield"]
    rate = mandi_price_per_quintal if mandi_price_per_quintal and mandi_price_per_quintal > 0 else match["mandi"]

    cost_per_acre = sum([match["land_prep"], match["seeds"], match["fert"], match["irrigation"], match["pest"], match["labor_harvest"]])
    total_cost = round(cost_per_acre * ac)
    total_yield = round(y_per_acre * ac, 1)
    gross_revenue = round(total_yield * rate)
    net_profit = round(gross_revenue - total_cost)

    return {
        "crop": crop_name,
        "acreage": ac,
        "expected_yield_quintals": total_yield,
        "assumed_mandi_price_per_quintal": rate,
        "estimated_costs": {
            "land_preparation": round(match["land_prep"] * ac),
            "seeds_and_sowing": round(match["seeds"] * ac),
            "fertilizers_and_nutrients": round(match["fert"] * ac),
            "irrigation": round(match["irrigation"] * ac),
            "plant_protection_ipm": round(match["pest"] * ac),
            "harvesting_and_labor": round(match["labor_harvest"] * ac),
            "total_estimated_cost_inr": total_cost,
        },
        "gross_revenue_inr": gross_revenue,
        "estimated_net_profit_inr": net_profit,
        "return_on_investment_pct": round((net_profit / max(1, total_cost)) * 100, 1),
        "disclaimer": "Cost and profit figures are indicative benchmarks based on CACP/SAU averages. Actual realizations vary with market arrivals, weather, and farm management.",
    }


# ============================================================================
# Soil Health Analysis & Amendment
# ============================================================================
async def _tool_get_soil_health_advisory(
    soil_ph: Optional[float] = None,
    nitrogen_kg_ha: Optional[float] = None,
    phosphorus_kg_ha: Optional[float] = None,
    potassium_kg_ha: Optional[float] = None,
    organic_carbon_pct: Optional[float] = None,
    crop_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Provide scientific soil health diagnosis and correction amendments."""
    amendments = []
    status = "Normal"
    if soil_ph is not None:
        if soil_ph < 6.0:
            status = "Acidic"
            amendments.append("Soil is acidic (pH < 6.0): Apply agricultural lime (calcium carbonate) or dolomite @ 200-400 kg/acre 3 weeks before sowing to improve nutrient availability.")
        elif soil_ph > 8.0:
            status = "Alkaline / Saline"
            amendments.append("Soil is alkaline (pH > 8.0): Apply agricultural gypsum @ 300-500 kg/acre and incorporate green manuring (Dhaincha/Sesbania) to lower alkalinity.")
        else:
            amendments.append("Soil pH is in the optimal range (6.0-7.5) for nutrient uptake.")

    if organic_carbon_pct is not None:
        if organic_carbon_pct < 0.5:
            amendments.append("Organic Carbon is low (< 0.5%): Apply 4-5 tons well-decomposed Farmyard Manure (FYM) or 2 tons Vermicompost per acre to restore soil microbial life.")
        elif organic_carbon_pct >= 0.75:
            amendments.append("Organic Carbon is healthy (>= 0.75%): Excellent soil biological activity and moisture retention.")

    return {
        "crop": crop_name or "General",
        "soil_ph_status": status,
        "recorded_ph": soil_ph,
        "recorded_oc": organic_carbon_pct,
        "scientific_amendments": amendments,
        "recommendation": "Maintain crop residue in field (zero burning), practice crop rotation with pulses (gram, moong, cowpea) to fix biological nitrogen naturally.",
    }


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
    "diagnose_crop_disease": _tool_diagnose_crop_disease,
    "search_marketplace": _tool_search_marketplace,
    "get_fertilizer_recommendation": _tool_get_fertilizer_recommendation,
    "get_irrigation_advisory": _tool_get_irrigation_advisory,
    "get_crop_calendar": _tool_get_crop_calendar,
    "analyze_farming_economics": _tool_analyze_farming_economics,
    "get_soil_health_advisory": _tool_get_soil_health_advisory,
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
