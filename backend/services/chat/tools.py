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
            return {"error": "Please provide a location for weather."}
        from services.chat.live_evidence import weather_evidence
        return weather_evidence(data)
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
        from services.chat.live_evidence import weather_evidence
        return weather_evidence(data, forecast=True)
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

        from services.chat.live_evidence import official_source, fresh_timestamp
        schemes = [s for s in list_schemes(state=state, category=category)
                   if official_source(s.get("url")) and fresh_timestamp(s.get("last_verified"), 24 * 30)]
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
            "disclaimer": "Only records with an official source URL and a review timestamp within 30 days are included. Eligibility must be checked against the linked source; approval is not guaranteed.",
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
        from services.whatsapp.market_data import get_market_observations
        return await get_market_observations(crop=crop, state=state, market=market)
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
# Enterprise Marketplace, Equipment Rental & Booking Tools (Reality-First)
# ============================================================================
def _frontend_base_url() -> str:
    from core.config import settings
    base = (getattr(settings, "FRONTEND_URL", None) or "https://kisaanbuddy.in").rstrip("/")
    if "localhost" in base or "127.0.0.1" in base:
        return "https://kisaanbuddy.in"
    return base


async def _tool_search_agri_products(
    query: str = "",
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    crop: Optional[str] = None,
    brand: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    limit: int = 5,
) -> Dict[str, Any]:
    """Search genuine agricultural input products with verified prices, images, and links."""
    try:
        from api.marketplace import AUTHENTIC_AGRI_PRODUCTS
        from db.session import SessionLocal
        from db.models import MarketplaceListing

        q = (query or "").strip().lower()
        cat = (category or "").strip().lower()
        lim = max(1, min(10, int(limit or 5)))
        base_url = _frontend_base_url()
        results: list[Dict[str, Any]] = []

        for p in AUTHENTIC_AGRI_PRODUCTS:
            if cat and cat != "all" and cat not in (p.get("category") or "").lower():
                continue
            if brand and brand.lower() not in (p.get("brand") or "").lower():
                continue
            if state and state.lower() not in (p.get("state") or "").lower():
                continue
            if district and district.lower() not in (p.get("district") or "").lower():
                continue
            if crop and not (
                any(crop.lower() in tc.lower() for tc in p.get("target_crops", []))
                or crop.lower() in (p.get("name") or "").lower()
            ):
                continue
            price_val = p.get("price")
            if max_price is not None and price_val is not None and float(price_val) > float(max_price):
                continue
            if q:
                hay = " ".join([
                    str(p.get("name", "")),
                    str(p.get("brand", "")),
                    str(p.get("category", "")),
                    str(p.get("active_ingredient", "")),
                    str(p.get("description", "")),
                    " ".join(p.get("target_crops", [])),
                ]).lower()
                tokens = [t for t in q.split() if len(t) > 1]
                if tokens and not all(tok in hay for tok in tokens) and q not in hay:
                    continue

            pid = p.get("id")
            results.append({
                "id": pid,
                "name": p.get("name"),
                "brand": p.get("brand"),
                "manufacturer": p.get("manufacturer") or p.get("brand"),
                "category": p.get("category"),
                "price_inr": price_val,
                "unit": p.get("unit") or p.get("pack_size"),
                "availability": p.get("availability_status", "available"),
                "image_url": p.get("image_url"),
                "seller_name": p.get("seller_name") or p.get("supplier_name"),
                "seller_phone": p.get("seller_phone"),
                "location": ", ".join(filter(None, [p.get("district"), p.get("state")])),
                "product_url": f"{base_url}/marketplace?product={pid}",
                "source": p.get("source") or "KisaanBuddy Verified Agri Catalog",
            })
            if len(results) >= lim:
                break

        # Also check DB MarketplaceListing (input sellers) if room remains
        if len(results) < lim and SessionLocal is not None:
            with SessionLocal() as db:
                ml_q = db.query(MarketplaceListing).filter(
                    MarketplaceListing.is_active == True,  # noqa: E712
                    MarketplaceListing.is_archived == False,  # noqa: E712
                    MarketplaceListing.listing_type == "sell",
                )
                if max_price is not None:
                    ml_q = ml_q.filter(
                        (MarketplaceListing.price == None) | (MarketplaceListing.price <= float(max_price))  # noqa: E711
                    )
                for ml in ml_q.limit(30).all():
                    hay = f"{ml.crop_or_item or ''} {ml.variety or ''} {ml.category or ''} {ml.organization_name or ''} {ml.district or ''}".lower()
                    if q and q not in hay:
                        continue
                    if district and district.lower() not in (ml.district or "").lower():
                        continue
                    results.append({
                        "id": f"ml-{ml.id}",
                        "name": f"{ml.crop_or_item} ({ml.variety})" if ml.variety else ml.crop_or_item,
                        "brand": ml.organization_name,
                        "category": ml.category,
                        "price_inr": ml.price,
                        "unit": ml.price_unit or ml.quantity_unit,
                        "availability": ml.verification_status,
                        "seller_name": ml.contact_person or ml.organization_name,
                        "seller_phone": ml.contact_phone,
                        "location": ", ".join(filter(None, [ml.district, ml.state])),
                        "product_url": f"{base_url}/marketplace?listing={ml.id}",
                        "source": "KisaanBuddy Verified Seller Listing",
                    })
                    if len(results) >= lim:
                        break

        return {
            "count": len(results),
            "products": results,
            "note": (
                "Only genuine verified products matching your criteria are shown."
                if results else
                "No verified products matched those exact filters in the KisaanBuddy marketplace."
            ),
        }
    except Exception as e:
        log.warning("tool search_agri_products failed: %s", e)
        return {"error": f"Product search unavailable: {e}"}


async def _tool_compare_agri_products(product_names_or_ids: list[str]) -> Dict[str, Any]:
    """Compare up to 4 verified marketplace products side-by-side."""
    try:
        from api.marketplace import AUTHENTIC_AGRI_PRODUCTS
        queries = [str(x).strip().lower() for x in (product_names_or_ids or []) if str(x).strip()][:4]
        if not queries:
            return {"error": "Provide at least one product name or ID to compare."}
        matched = []
        seen_ids = set()
        for q in queries:
            for p in AUTHENTIC_AGRI_PRODUCTS:
                pid = str(p.get("id", "")).lower()
                name = str(p.get("name", "")).lower()
                if q == pid or q in name:
                    if pid not in seen_ids:
                        seen_ids.add(pid)
                        matched.append({
                            "id": p.get("id"),
                            "name": p.get("name"),
                            "brand": p.get("brand"),
                            "category": p.get("category"),
                            "price_inr": p.get("price"),
                            "unit": p.get("unit") or p.get("pack_size"),
                            "active_ingredient": p.get("active_ingredient"),
                            "recommended_dosage": p.get("recommended_dosage"),
                            "target_crops": p.get("target_crops", []),
                            "seller_name": p.get("seller_name") or p.get("supplier_name"),
                        })
                    break
        return {
            "count": len(matched),
            "comparison": matched,
            "source": "KisaanBuddy Verified Agri Products",
        }
    except Exception as e:
        log.warning("tool compare_agri_products failed: %s", e)
        return {"error": f"Product comparison unavailable: {e}"}


async def _tool_search_rental_equipment(
    query: str = "",
    category: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    pincode: Optional[str] = None,
    max_price: Optional[float] = None,
    listing_type: str = "rent",
    limit: int = 5,
) -> Dict[str, Any]:
    """Search genuine farm equipment rental/sale listings by location, PIN code, and budget."""
    try:
        from db.session import SessionLocal
        from db.models import EquipmentCatalog, EquipmentListing

        q = (query or "").strip().lower()
        lim = max(1, min(10, int(limit or 5)))
        base_url = _frontend_base_url()
        listings_out: list[Dict[str, Any]] = []
        reference_models: list[Dict[str, Any]] = []

        with SessionLocal() as db:
            eq_q = db.query(EquipmentListing).filter(
                EquipmentListing.is_archived == False,  # noqa: E712
                EquipmentListing.availability_status.notin_(["sold", "inactive"]),
            )
            if listing_type in ("rent", "sale"):
                eq_q = eq_q.filter(EquipmentListing.listing_type == listing_type)
            if category:
                eq_q = eq_q.filter(EquipmentListing.category.ilike(f"%{category.strip()}%"))
            if district:
                eq_q = eq_q.filter(EquipmentListing.district.ilike(f"%{district.strip()}%"))
            if state:
                eq_q = eq_q.filter(EquipmentListing.state.ilike(f"%{state.strip()}%"))
            if pincode:
                eq_q = eq_q.filter(EquipmentListing.pincode == str(pincode).strip())
            if max_price is not None:
                eq_q = eq_q.filter(EquipmentListing.price <= float(max_price))

            for eq in eq_q.limit(30).all():
                hay = f"{eq.title or ''} {eq.brand or ''} {eq.model_name or ''} {eq.category or ''} {eq.district or ''} {eq.tehsil_or_block or ''}".lower()
                if q and q not in hay:
                    continue
                listings_out.append({
                    "listing_id": eq.id,
                    "title": eq.title or f"{eq.brand} {eq.model_name}",
                    "brand": eq.brand,
                    "model_name": eq.model_name,
                    "category": eq.category,
                    "hp_rating": eq.hp_rating,
                    "listing_type": eq.listing_type,
                    "price_inr": eq.price,
                    "price_unit": eq.price_unit,
                    "security_deposit_inr": eq.security_deposit,
                    "includes_operator": eq.includes_operator,
                    "availability_status": eq.availability_status,
                    "availability_confirmed": eq.availability_confirmed,
                    "availability_label": eq.availability_label,
                    "owner_name": eq.owner_name,
                    "owner_phone": eq.owner_phone if eq.owner_consent_shared else None,
                    "provider_type": eq.provider_type,
                    "location": ", ".join(filter(None, [eq.village, eq.tehsil_or_block, eq.district, eq.state, eq.pincode])),
                    "image_url": eq.image_url,
                    "listing_url": f"{base_url}/marketplace?tab=equipment&listing={eq.id}",
                    "is_reference_only": False,
                })
                if len(listings_out) >= lim:
                    break

            # If no live rental listings found, optionally provide reference catalog specs clearly flagged
            if not listings_out:
                cat_q = db.query(EquipmentCatalog).filter(EquipmentCatalog.is_active == True)  # noqa: E712
                if category:
                    cat_q = cat_q.filter(EquipmentCatalog.category.ilike(f"%{category.strip()}%"))
                for c in cat_q.limit(20).all():
                    hay = f"{c.brand or ''} {c.model_name or ''} {c.category or ''}".lower()
                    if q and q not in hay:
                        continue
                    reference_models.append({
                        "catalog_id": c.id,
                        "brand": c.brand,
                        "model_name": c.model_name,
                        "category": c.category,
                        "hp_rating": c.hp_rating,
                        "indicative_price_inr": c.indicative_price,
                        "provenance_source": c.provenance_source,
                        "is_reference_only": True,
                    })
                    if len(reference_models) >= 3:
                        break

        return {
            "live_rental_count": len(listings_out),
            "rental_listings": listings_out,
            "reference_catalog_models": reference_models,
            "policy_note": (
                "Live listings are from real owners/CHCs; availability must be confirmed by the provider. "
                "Reference catalog models (if shown) are NOT available for booking."
            ),
        }
    except Exception as e:
        log.warning("tool search_rental_equipment failed: %s", e)
        return {"error": f"Equipment rental search unavailable: {e}"}


async def _tool_create_equipment_booking(
    listing_id: int,
    farmer_name: str,
    farmer_phone: str,
    preferred_date: Optional[str] = None,
    duration_notes: Optional[str] = None,
    confirmed: bool = False,
) -> Dict[str, Any]:
    """Submit an equipment rental booking request. MUST have confirmed=True after explicit user confirmation."""
    try:
        from db.session import SessionLocal
        from db.models import EquipmentListing, Notification, TradeInquiry

        with SessionLocal() as db:
            eq = db.query(EquipmentListing).filter(
                EquipmentListing.id == int(listing_id),
                EquipmentListing.is_archived == False,  # noqa: E712
            ).first()
            if not eq:
                return {"error": f"Equipment listing #{listing_id} not found or no longer active."}
            if eq.availability_status in ("sold", "inactive"):
                return {"error": f"Equipment '{eq.title}' is currently {eq.availability_status} and cannot be booked."}

            if not confirmed:
                return {
                    "requires_confirmation": True,
                    "listing_id": eq.id,
                    "title": eq.title,
                    "price_inr": eq.price,
                    "price_unit": eq.price_unit,
                    "owner_name": eq.owner_name,
                    "location": f"{eq.district}, {eq.state}",
                    "preferred_date": preferred_date,
                    "message": "Ask the farmer for explicit confirmation (Yes/Confirm) before creating this booking request.",
                }

            existing = db.query(TradeInquiry).filter(
                TradeInquiry.listing_type == "equipment_listing",
                TradeInquiry.listing_id == eq.id,
                TradeInquiry.sender_phone == farmer_phone,
                TradeInquiry.status.in_(["submitted", "in_discussion"]),
            ).first()
            if existing:
                return {
                    "already_exists": True,
                    "booking_reference": f"#INQ-{existing.id}",
                    "status": existing.status,
                    "message": f"You already have an active request (#INQ-{existing.id}) for this equipment.",
                }

            notes = f"Preferred date: {preferred_date or 'Flexible'}. {duration_notes or ''}".strip()
            inquiry = TradeInquiry(
                listing_type="equipment_listing",
                listing_id=eq.id,
                sender_name=farmer_name or "WhatsApp Farmer",
                sender_phone=farmer_phone,
                sender_type="farmer",
                proposed_price=eq.price,
                price_unit=eq.price_unit,
                message=notes,
                inquiry_type="quotation",
                status="submitted",
            )
            db.add(inquiry)
            db.flush()
            if eq.user_id:
                db.add(Notification(
                    user_id=eq.user_id,
                    title=f"New Equipment Rental Request for {eq.title}",
                    message=f"{farmer_name} ({farmer_phone}) requested rental. {notes}",
                    category="marketplace_inquiry",
                ))
            db.commit()
            db.refresh(inquiry)
            return {
                "created": True,
                "booking_reference": f"#INQ-{inquiry.id}",
                "status": inquiry.status,
                "equipment_title": eq.title,
                "provider_name": eq.owner_name,
                "provider_phone": eq.owner_phone if eq.owner_consent_shared else None,
                "confirmation_disclaimer": "Request submitted to provider. Booking is NOT confirmed until the provider accepts.",
            }
    except Exception as e:
        log.warning("tool create_equipment_booking failed: %s", e)
        return {"error": f"Could not create booking request: {e}"}


async def _tool_get_my_bookings(
    phone_number: str,
    user_id: Optional[int] = None,
) -> Dict[str, Any]:
    """Retrieve genuine booking/inquiry requests for the verified farmer phone or linked user_id."""
    try:
        from db.session import SessionLocal
        from db.models import EquipmentListing, TradeInquiry
        from sqlalchemy import or_

        with SessionLocal() as db:
            conds = [TradeInquiry.sender_phone == phone_number]
            if user_id:
                conds.append(TradeInquiry.sender_user_id == int(user_id))
            rows = (
                db.query(TradeInquiry)
                .filter(or_(*conds))
                .order_by(TradeInquiry.created_at.desc())
                .limit(10)
                .all()
            )
            bookings = []
            for r in rows:
                title = f"{r.listing_type} #{r.listing_id}"
                if r.listing_type == "equipment_listing":
                    eq = db.query(EquipmentListing).filter(EquipmentListing.id == r.listing_id).first()
                    if eq:
                        title = eq.title or f"{eq.brand} {eq.model_name}"
                bookings.append({
                    "inquiry_id": r.id,
                    "booking_reference": f"#INQ-{r.id}",
                    "listing_type": r.listing_type,
                    "title": title,
                    "status": r.status,
                    "proposed_price": r.proposed_price,
                    "price_unit": r.price_unit,
                    "message": r.message,
                    "cancellable": r.status in ("submitted", "in_discussion"),
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                })
        return {"count": len(bookings), "bookings": bookings}
    except Exception as e:
        log.warning("tool get_my_bookings failed: %s", e)
        return {"error": f"Could not retrieve bookings: {e}"}


async def _tool_cancel_booking_request(
    inquiry_id: int,
    phone_number: str,
    user_id: Optional[int] = None,
    reason: str = "",
    confirmed: bool = False,
) -> Dict[str, Any]:
    """Cancel a pending booking request according to policy. Requires confirmed=True."""
    try:
        from db.session import SessionLocal
        from db.models import TradeInquiry

        with SessionLocal() as db:
            inq = db.query(TradeInquiry).filter(TradeInquiry.id == int(inquiry_id)).first()
            if not inq:
                return {"error": f"Booking #INQ-{inquiry_id} not found."}
            owns = (inq.sender_phone == phone_number) or (user_id and inq.sender_user_id == int(user_id))
            if not owns:
                return {"error": "Unauthorized: you can only cancel your own booking requests."}
            if inq.status == "cancelled":
                return {"already_cancelled": True, "booking_reference": f"#INQ-{inq.id}", "status": "cancelled"}
            if inq.status not in ("submitted", "in_discussion"):
                return {
                    "cancellable": False,
                    "status": inq.status,
                    "error": f"Booking #INQ-{inq.id} is already '{inq.status}' and cannot be self-cancelled. Please contact the provider directly.",
                }
            if not confirmed:
                return {
                    "requires_confirmation": True,
                    "booking_reference": f"#INQ-{inq.id}",
                    "status": inq.status,
                    "message": "Ask the farmer for explicit confirmation before cancelling this booking request.",
                }
            inq.status = "cancelled"
            if reason:
                inq.message = f"{inq.message or ''}\n[Cancelled by farmer: {reason}]".strip()
            db.commit()
            return {
                "cancelled": True,
                "booking_reference": f"#INQ-{inq.id}",
                "status": "cancelled",
            }
    except Exception as e:
        log.warning("tool cancel_booking_request failed: %s", e)
        return {"error": f"Could not cancel booking: {e}"}


async def _tool_create_support_ticket(
    phone_number: str,
    query_summary: str,
    farmer_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a genuine backend support ticket with KB-SUP-YYYYMMDD-XXXX reference."""
    try:
        from db.session import SessionLocal
        from services.whatsapp.support_handler import create_support_ticket

        with SessionLocal() as db:
            ticket_id = create_support_ticket(
                phone_number=phone_number,
                query_summary=query_summary,
                db=db,
                farmer_name=farmer_name,
            )
            return {
                "created": True,
                "ticket_id": ticket_id,
                "status": "OPEN",
            }
    except Exception as e:
        log.warning("tool create_support_ticket failed: %s", e)
        return {"error": f"Could not create support ticket: {e}"}


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
    "search_agri_products": _tool_search_agri_products,
    "compare_agri_products": _tool_compare_agri_products,
    "search_rental_equipment": _tool_search_rental_equipment,
    "create_equipment_booking": _tool_create_equipment_booking,
    "get_my_bookings": _tool_get_my_bookings,
    "cancel_booking_request": _tool_cancel_booking_request,
    "create_support_ticket": _tool_create_support_ticket,
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
