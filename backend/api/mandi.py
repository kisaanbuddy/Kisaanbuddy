"""
KrishiAI — Government Mandi API (Mandi Price Intelligence)
Real data from AGMARKNET via data.gov.in (resource 9ef84268-d588-465a-a308-a864a43d0070).
Strictly separates reference market prices from confirmed transaction prices.
Includes date filtering, sorting, duplicate detection, pagination, stale warnings, and source attribution.
"""

import os
import logging
from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_

from core.config import settings
from db.session import get_db
from db.models import MarketPriceRecord, ImportSource, ImportJob
from services.marketplace_import.agmarknet_importer import AgmarknetPriceImporter
from services.marketplace_import.initial_catalog_data import INITIAL_MARKET_PRICES

log = logging.getLogger("krishiai.api.mandi")
router = APIRouter()

DATA_GOV_API_KEY = settings.DATA_GOV_API_KEY or os.getenv("DATA_GOV_API_KEY", "")
AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# Category mapping for AGMARKNET commodities
CATEGORY_MAP = {
    "wheat": "Cereal", "rice": "Cereal", "paddy": "Cereal",
    "maize": "Cereal", "jowar": "Cereal", "bajra": "Cereal", "barley": "Cereal",
    "soyabean": "Oilseed", "soybean": "Oilseed", "mustard": "Oilseed", "groundnut": "Oilseed",
    "sunflower": "Oilseed", "sesame": "Oilseed", "linseed": "Oilseed",
    "chana": "Pulse", "gram": "Pulse", "tur": "Pulse", "arhar": "Pulse",
    "urad": "Pulse", "moong": "Pulse", "masur": "Pulse",
    "cotton": "Fiber", "jute": "Fiber",
    "onion": "Vegetable", "potato": "Vegetable", "tomato": "Vegetable",
    "cabbage": "Vegetable", "cauliflower": "Vegetable", "brinjal": "Vegetable",
    "sugarcane": "Cash Crop", "tobacco": "Cash Crop", "ginger": "Cash Crop",
}


def get_category(commodity: str) -> str:
    name = (commodity or "").lower()
    for key, cat in CATEGORY_MAP.items():
        if key in name:
            return cat
    return "Other"


def get_trend(modal: float, min_p: float, max_p: float) -> tuple[str, float]:
    mid = (min_p + max_p) / 2
    if mid <= 0:
        return "stable", 0.0
    if modal > mid * 1.02:
        return "up", round(((modal - mid) / mid) * 100, 1)
    elif modal < mid * 0.98:
        return "down", round(((modal - mid) / mid) * 100, 1)
    return "stable", 0.0


def check_stale(arr_date: Optional[date]) -> tuple[bool, Optional[str]]:
    """Determine whether reported market price data is stale (>48h old)."""
    if not arr_date:
        return True, "Reporting date unknown. Verify current mandi rates locally."
    today = date.today()
    age_days = (today - arr_date).days
    if age_days > 2:
        return True, f"Reported on {arr_date.isoformat()} — Stale reference data ({age_days} days old). Verify locally before trading."
    return False, None


# In-memory short-lived cache for rapid repeated queries
_cache: dict = {"timestamp": 0, "crops": []}


@router.get("/crops")
def get_mandi_crops(
    commodity: Optional[str] = Query(default=None, description="Crop / Commodity name"),
    variety: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    market: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    from_date: Optional[date] = Query(default=None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(default=None, description="End date (YYYY-MM-DD)"),
    min_price: Optional[float] = Query(default=None, ge=0.0),
    max_price: Optional[float] = Query(default=None, ge=0.0),
    sort_by: str = Query(default="date", pattern="^(date|price|arrival|name|modal_price)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> Any:
    """Mandi price intelligence endpoint.
    
    Reads verified daily APMC observations from AGMARKNET / data.gov.in.
    Provides multi-field filtering, date ranges, duplicate-free records,
    stale-data warnings, and visible source attribution.
    """
    # Auto-seed if database is completely empty
    count = db.query(MarketPriceRecord).count()
    if count == 0:
        importer = AgmarknetPriceImporter(db)
        importer.import_benchmarks(INITIAL_MARKET_PRICES)

    query = db.query(MarketPriceRecord)

    if commodity and commodity.lower() != "all":
        query = query.filter(MarketPriceRecord.commodity.ilike(f"%{commodity.strip()}%"))
    if variety and variety.lower() != "all":
        query = query.filter(MarketPriceRecord.variety.ilike(f"%{variety.strip()}%"))
    if state and state.lower() != "all":
        query = query.filter(MarketPriceRecord.state.ilike(f"%{state.strip()}%"))
    if district and district.lower() != "all":
        query = query.filter(MarketPriceRecord.district.ilike(f"%{district.strip()}%"))
    if market and market.lower() != "all":
        query = query.filter(MarketPriceRecord.market_center.ilike(f"%{market.strip()}%"))
    if from_date:
        query = query.filter(MarketPriceRecord.arrival_date >= from_date)
    if to_date:
        query = query.filter(MarketPriceRecord.arrival_date <= to_date)
    if min_price is not None:
        query = query.filter(MarketPriceRecord.modal_price >= min_price)
    if max_price is not None:
        query = query.filter(MarketPriceRecord.modal_price <= max_price)

    # Sorting
    if sort_by in ("price", "modal_price"):
        sort_col = MarketPriceRecord.modal_price
    elif sort_by == "arrival":
        sort_col = MarketPriceRecord.arrival_quantity
    elif sort_by == "name":
        sort_col = MarketPriceRecord.commodity
    else:
        sort_col = MarketPriceRecord.arrival_date

    if sort_order == "asc":
        query = query.order_by(sort_col.asc(), MarketPriceRecord.id.asc())
    else:
        query = query.order_by(sort_col.desc(), MarketPriceRecord.id.desc())

    total = query.count()
    records = query.offset((page - 1) * limit).limit(limit).all()

    crops = []
    seen = set()

    for r in records:
        cat = get_category(r.commodity)
        if category and category.lower() != "all" and cat.lower() != category.lower():
            continue

        dup_key = f"{r.commodity.strip().lower()}_{r.market_center.strip().lower()}_{r.arrival_date}"
        if dup_key in seen:
            continue
        seen.add(dup_key)

        trend, change = get_trend(r.modal_price, r.min_price, r.max_price)
        is_stale, stale_msg = check_stale(r.arrival_date)

        crops.append({
            "id": r.id,
            "name": r.commodity,
            "variety": r.variety or "FAQ",
            "price": int(r.modal_price),
            "unit": "per quintal",
            "mandi": r.market_center,
            "state": r.state,
            "district": r.district,
            "category": cat,
            "trend": trend,
            "change_percent": abs(change),
            "min_price": int(r.min_price),
            "max_price": int(r.max_price),
            "modal_price": int(r.modal_price),
            "arrival_tonnes": int(r.arrival_quantity or 0),
            "arrival_date": r.arrival_date.isoformat() if r.arrival_date else None,
            "source_name": r.source_name,
            "source_url": r.source_url or "https://agmarknet.gov.in",
            "retrieved_at": r.data_retrieval_timestamp.isoformat() + "Z" if getattr(r, "data_retrieval_timestamp", None) else None,
            "is_stale": is_stale,
            "stale_warning": stale_msg,
            "data_label": "Official market-price data",
        })

    return {
        "crops": crops,
        "total": total,
        "page": page,
        "limit": limit,
        "source": "AGMARKNET / Directorate of Marketing & Inspection (data.gov.in)",
        "source_license": "Open Government Data (OGD) License - India",
        "provenance_url": "https://agmarknet.gov.in",
        "api_key_set": bool(DATA_GOV_API_KEY),
        "disclaimer": "Reference daily APMC reported data only. Not a guaranteed purchase or transaction rate.",
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/historical-prices")
def get_mandi_historical_prices(
    commodity: str = Query(..., description="Crop / Commodity name"),
    variety: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    market: Optional[str] = Query(default=None),
    from_date: Optional[date] = Query(default=None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(default=None, description="End date (YYYY-MM-DD)"),
    days: Optional[int] = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
) -> Any:
    """Historical Mandi Price Intelligence endpoint.

    Returns authentic historical APMC observations from AGMARKNET / data.gov.in.
    Never fabricates, estimates, or mathematically interpolates prices.
    If official records are unavailable, returns available=False with an informative explanation.
    """
    clean_comm = (commodity or "").strip()
    if not clean_comm:
        raise HTTPException(status_code=400, detail="Missing required parameter: commodity")

    # Remove regional language names in brackets, e.g. "Wheat (गेहूं)" -> "Wheat"
    if "(" in clean_comm:
        clean_comm = clean_comm.split("(")[0].strip()

    # Auto-seed if database is completely empty
    count = db.query(MarketPriceRecord).count()
    if count == 0:
        importer = AgmarknetPriceImporter(db)
        importer.import_benchmarks(INITIAL_MARKET_PRICES)

    # Determine cutoff date
    if not from_date and days:
        latest_rec = (
            db.query(MarketPriceRecord)
            .filter(MarketPriceRecord.commodity.ilike(f"%{clean_comm}%"))
            .order_by(MarketPriceRecord.arrival_date.desc())
            .first()
        )
        ref_date = latest_rec.arrival_date if latest_rec and latest_rec.arrival_date else date.today()
        from_date = ref_date - timedelta(days=days)

    query = db.query(MarketPriceRecord).filter(
        MarketPriceRecord.commodity.ilike(f"%{clean_comm}%")
    )

    if variety and variety.lower() != "all":
        query = query.filter(MarketPriceRecord.variety.ilike(f"%{variety.strip()}%"))
    if state and state.lower() != "all":
        query = query.filter(MarketPriceRecord.state.ilike(f"%{state.strip()}%"))
    if district and district.lower() != "all":
        query = query.filter(MarketPriceRecord.district.ilike(f"%{district.strip()}%"))
    if market and market.lower() != "all":
        mkt_clean = market.lower().replace("mandi", "").replace("apmc", "").strip()
        query = query.filter(MarketPriceRecord.market_center.ilike(f"%{mkt_clean}%"))
    if from_date:
        query = query.filter(MarketPriceRecord.arrival_date >= from_date)
    if to_date:
        query = query.filter(MarketPriceRecord.arrival_date <= to_date)

    records = query.order_by(MarketPriceRecord.arrival_date.asc()).all()

    # If empty and specific market didn't match, attempt commodity match in state
    if not records and market and market.lower() != "all":
        fallback_query = db.query(MarketPriceRecord).filter(
            MarketPriceRecord.commodity.ilike(f"%{clean_comm}%")
        )
        if state and state.lower() != "all":
            fallback_query = fallback_query.filter(MarketPriceRecord.state.ilike(f"%{state.strip()}%"))
        if from_date:
            fallback_query = fallback_query.filter(MarketPriceRecord.arrival_date >= from_date)
        if to_date:
            fallback_query = fallback_query.filter(MarketPriceRecord.arrival_date <= to_date)
        records = fallback_query.order_by(MarketPriceRecord.arrival_date.asc()).all()

    if not records:
        return {
            "commodity": commodity,
            "variety": variety,
            "market": market or "APMC Market",
            "state": state,
            "district": district,
            "source": "AGMARKNET / Directorate of Marketing & Inspection (data.gov.in)",
            "source_url": "https://agmarknet.gov.in",
            "available": False,
            "records_count": 0,
            "observations": [],
            "summary": None,
            "message": f"Historical price records are currently unavailable for {commodity} in official AGMARKNET government archives for the requested date period.",
            "disclaimer": "Official AGMARKNET reference market benchmarks. Historical APMC observations only, not a guaranteed transaction offer.",
            "updated_at": datetime.utcnow().isoformat() + "Z",
        }

    # Deduplicate by arrival_date
    seen_dates = set()
    observations = []
    for r in records:
        d_str = r.arrival_date.isoformat() if r.arrival_date else None
        if not d_str or d_str in seen_dates:
            continue
        seen_dates.add(d_str)
        observations.append({
            "date": d_str,
            "min_price": int(r.min_price),
            "max_price": int(r.max_price),
            "modal_price": int(r.modal_price),
            "arrival_tonnes": int(r.arrival_quantity or 0),
        })

    observations.sort(key=lambda x: x["date"])

    modals = [o["modal_price"] for o in observations]
    highest_modal = max(modals)
    lowest_modal = min(modals)
    average_modal = round(sum(modals) / len(modals))
    latest_modal = observations[-1]["modal_price"]
    first_modal = observations[0]["modal_price"]

    change_percent = None
    change_direction = "neutral"
    if len(observations) >= 2 and first_modal > 0:
        diff = latest_modal - first_modal
        change_percent = round((diff / first_modal) * 100, 1)
        if change_percent > 0.1:
            change_direction = "up"
        elif change_percent < -0.1:
            change_direction = "down"

    primary = records[-1]

    return {
        "commodity": commodity,
        "variety": primary.variety or variety or "FAQ",
        "market": primary.market_center or market or "APMC Mandi",
        "state": primary.state or state,
        "district": primary.district or district,
        "source": primary.source_name or "AGMARKNET / Directorate of Marketing & Inspection (data.gov.in)",
        "source_url": primary.source_url or "https://agmarknet.gov.in",
        "available": True,
        "records_count": len(observations),
        "observations": observations,
        "summary": {
            "highest_modal": highest_modal,
            "lowest_modal": lowest_modal,
            "average_modal": average_modal,
            "latest_modal": latest_modal,
            "first_modal": first_modal,
            "change_percent": change_percent,
            "change_direction": change_direction,
            "from_date": observations[0]["date"],
            "to_date": observations[-1]["date"],
            "data_points": len(observations),
        },
        "disclaimer": "Official AGMARKNET reference market benchmarks. Historical APMC observations only, not a guaranteed transaction offer.",
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/crops/{crop_id}")
def get_mandi_crop(crop_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed observation by ID with price spread and trend."""
    r = db.query(MarketPriceRecord).filter(MarketPriceRecord.id == crop_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Mandi price record not found")

    trend, change = get_trend(r.modal_price, r.min_price, r.max_price)
    is_stale, stale_msg = check_stale(r.arrival_date)

    crop_data = {
        "id": r.id,
        "name": r.commodity,
        "variety": r.variety or "FAQ",
        "price": int(r.modal_price),
        "unit": "per quintal",
        "mandi": r.market_center,
        "state": r.state,
        "district": r.district,
        "category": get_category(r.commodity),
        "trend": trend,
        "change_percent": abs(change),
        "min_price": int(r.min_price),
        "max_price": int(r.max_price),
        "modal_price": int(r.modal_price),
        "arrival_tonnes": int(r.arrival_quantity or 0),
        "arrival_date": r.arrival_date.isoformat() if r.arrival_date else None,
        "source_name": r.source_name,
        "source_url": r.source_url or "https://agmarknet.gov.in",
        "retrieved_at": r.data_retrieval_timestamp.isoformat() + "Z" if getattr(r, "data_retrieval_timestamp", None) else None,
        "is_stale": is_stale,
        "stale_warning": stale_msg,
        "data_label": "Official market-price data",
    }
    return {"crop": crop_data, "source": r.source_name}


@router.post("/refresh")
async def refresh_mandi_prices(
    limit: int = Query(default=50, ge=10, le=200),
    db: Session = Depends(get_db),
):
    """Trigger scheduled or manual data refresh from data.gov.in / AGMARKNET.
    
    Includes failure handling, fallback to curated reference benchmarks,
    and automatic duplicate prevention.
    """
    importer = AgmarknetPriceImporter(db)
    result = await importer.fetch_live_api(limit=limit)
    return {
        "status": "success",
        "result": result,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/health")
def mandi_health(db: Session = Depends(get_db)):
    """Health check for Mandi price ingestion service and database records."""
    total_records = db.query(MarketPriceRecord).count()
    latest = db.query(MarketPriceRecord).order_by(MarketPriceRecord.arrival_date.desc()).first()
    return {
        "status": "ok",
        "api_key_configured": bool(DATA_GOV_API_KEY),
        "data_source": "AGMARKNET / data.gov.in",
        "total_benchmark_records": total_records,
        "latest_arrival_date": latest.arrival_date.isoformat() if latest and latest.arrival_date else None,
    }
