"""
KisaanBuddy — Government Mandi API
Real data from AGMARKNET via data.gov.in
Fallback to curated mock data if API key not set or request fails.
"""

import os
import httpx
import asyncio
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

# ---------------------------------------------------------------------------
# AGMARKNET Config
# Set DATA_GOV_API_KEY in your .env / Vercel environment variables
# Get free key at: https://data.gov.in/user/register
# ---------------------------------------------------------------------------
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")
AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# ---------------------------------------------------------------------------
# Category mapping for AGMARKNET commodities
# ---------------------------------------------------------------------------
CATEGORY_MAP = {
    "wheat": "Cereal", "rice": "Cereal", "paddy": "Cereal",
    "maize": "Cereal", "jowar": "Cereal", "bajra": "Cereal", "barley": "Cereal",
    "soyabean": "Oilseed", "mustard": "Oilseed", "groundnut": "Oilseed",
    "sunflower": "Oilseed", "sesame": "Oilseed", "linseed": "Oilseed",
    "chana": "Pulse", "gram": "Pulse", "tur": "Pulse", "arhar": "Pulse",
    "urad": "Pulse", "moong": "Pulse", "masur": "Pulse",
    "cotton": "Fiber", "jute": "Fiber",
    "onion": "Vegetable", "potato": "Vegetable", "tomato": "Vegetable",
    "cabbage": "Vegetable", "cauliflower": "Vegetable", "brinjal": "Vegetable",
    "sugarcane": "Cash Crop", "tobacco": "Cash Crop", "ginger": "Cash Crop",
}

def get_category(commodity: str) -> str:
    name = commodity.lower()
    for key, cat in CATEGORY_MAP.items():
        if key in name:
            return cat
    return "Other"

def get_trend(modal: float, min_p: float, max_p: float):
    mid = (min_p + max_p) / 2
    if modal > mid * 1.02:
        return "up", round(((modal - mid) / mid) * 100, 1)
    elif modal < mid * 0.98:
        return "down", round(((modal - mid) / mid) * 100, 1)
    return "stable", 0.0

def parse_agmarknet(records: list, limit: int = 50) -> list:
    """Convert raw AGMARKNET JSON records to our MandiCrop format."""
    crops = []
    seen = set()
    crop_id = 1

    for r in records:
        try:
            commodity = r.get("commodity", "Unknown").strip()
            variety   = r.get("variety", "FAQ").strip()
            mandi     = r.get("market", r.get("apmc", "")).strip()
            state     = r.get("state", "").strip()
            min_p     = float(r.get("min_price", 0) or 0)
            max_p     = float(r.get("max_price", 0) or 0)
            modal     = float(r.get("modal_price", 0) or 0)
            arrival   = float(r.get("arrivals_in_qtl", 0) or 0)

            # Skip bad data
            if modal <= 0 or not mandi or not state:
                continue

            key = f"{commodity}_{mandi}"
            if key in seen:
                continue
            seen.add(key)

            trend, change = get_trend(modal, min_p or modal * 0.95, max_p or modal * 1.05)

            crops.append({
                "id": crop_id,
                "name": commodity,
                "variety": variety or "FAQ",
                "price": int(modal),
                "unit": "per quintal",
                "mandi": mandi,
                "state": state,
                "category": get_category(commodity),
                "trend": trend,
                "change_percent": abs(change),
                "min_price": int(min_p or modal * 0.95),
                "max_price": int(max_p or modal * 1.05),
                "modal_price": int(modal),
                "arrival_tonnes": int(arrival / 10),  # qtl → approx tonnes
            })
            crop_id += 1

            if crop_id > limit:
                break
        except Exception:
            continue

    return crops

# ---------------------------------------------------------------------------
# Fallback mock data (used when API key not set or network fails)
# ---------------------------------------------------------------------------
MOCK_CROPS = [
    {"id":1,"name":"Wheat (गेहूं)","variety":"Sharbati","price":2275,"unit":"per quintal","mandi":"Indore Mandi","state":"Madhya Pradesh","category":"Cereal","trend":"up","change_percent":2.3,"min_price":2100,"max_price":2400,"modal_price":2275,"arrival_tonnes":12500},
    {"id":2,"name":"Rice (चावल)","variety":"Basmati 1121","price":3850,"unit":"per quintal","mandi":"Karnal Mandi","state":"Haryana","category":"Cereal","trend":"up","change_percent":1.8,"min_price":3600,"max_price":4100,"modal_price":3850,"arrival_tonnes":8200},
    {"id":3,"name":"Soybean (सोयाबीन)","variety":"Yellow","price":4600,"unit":"per quintal","mandi":"Ujjain Mandi","state":"Madhya Pradesh","category":"Oilseed","trend":"down","change_percent":1.2,"min_price":4400,"max_price":4800,"modal_price":4600,"arrival_tonnes":5600},
    {"id":4,"name":"Cotton (कपास)","variety":"Medium Staple","price":6800,"unit":"per quintal","mandi":"Rajkot Mandi","state":"Gujarat","category":"Fiber","trend":"up","change_percent":3.1,"min_price":6500,"max_price":7200,"modal_price":6800,"arrival_tonnes":3200},
    {"id":5,"name":"Mustard (सरसों)","variety":"Laha","price":5200,"unit":"per quintal","mandi":"Alwar Mandi","state":"Rajasthan","category":"Oilseed","trend":"stable","change_percent":0.1,"min_price":5000,"max_price":5400,"modal_price":5200,"arrival_tonnes":4100},
    {"id":6,"name":"Chana (चना)","variety":"Desi","price":5100,"unit":"per quintal","mandi":"Latur Mandi","state":"Maharashtra","category":"Pulse","trend":"down","change_percent":0.8,"min_price":4900,"max_price":5300,"modal_price":5100,"arrival_tonnes":6800},
    {"id":7,"name":"Tur/Arhar Dal (तूर दाल)","variety":"FAQ","price":7200,"unit":"per quintal","mandi":"Gulbarga Mandi","state":"Karnataka","category":"Pulse","trend":"up","change_percent":4.5,"min_price":6800,"max_price":7600,"modal_price":7200,"arrival_tonnes":2800},
    {"id":8,"name":"Onion (प्याज)","variety":"Nasik Red","price":1800,"unit":"per quintal","mandi":"Nashik Mandi","state":"Maharashtra","category":"Vegetable","trend":"up","change_percent":8.2,"min_price":1500,"max_price":2200,"modal_price":1800,"arrival_tonnes":15000},
    {"id":9,"name":"Potato (आलू)","variety":"Jyoti","price":1200,"unit":"per quintal","mandi":"Agra Mandi","state":"Uttar Pradesh","category":"Vegetable","trend":"stable","change_percent":0.3,"min_price":1000,"max_price":1400,"modal_price":1200,"arrival_tonnes":18000},
    {"id":10,"name":"Sugarcane (गन्ना)","variety":"Co-0238","price":350,"unit":"per quintal","mandi":"Muzaffarnagar Mandi","state":"Uttar Pradesh","category":"Cash Crop","trend":"stable","change_percent":0.0,"min_price":340,"max_price":365,"modal_price":350,"arrival_tonnes":45000},
    {"id":11,"name":"Maize (मक्का)","variety":"Yellow","price":2050,"unit":"per quintal","mandi":"Davangere Mandi","state":"Karnataka","category":"Cereal","trend":"down","change_percent":1.5,"min_price":1900,"max_price":2200,"modal_price":2050,"arrival_tonnes":7200},
    {"id":12,"name":"Groundnut (मूंगफली)","variety":"Bold","price":5800,"unit":"per quintal","mandi":"Junagadh Mandi","state":"Gujarat","category":"Oilseed","trend":"up","change_percent":2.0,"min_price":5500,"max_price":6100,"modal_price":5800,"arrival_tonnes":3400},
]

# Simple in-memory cache (refreshes every hour)
_cache: dict = {"crops": [], "timestamp": 0, "source": "mock"}

async def fetch_live_crops() -> tuple[list, str]:
    """Fetch from AGMARKNET. Returns (crops_list, source_label)."""
    if not DATA_GOV_API_KEY:
        return MOCK_CROPS, "mock"

    now = datetime.utcnow().timestamp()
    if _cache["crops"] and (now - _cache["timestamp"]) < 3600:
        return _cache["crops"], _cache["source"]

    try:
        params = {
            "api-key": DATA_GOV_API_KEY,
            "format": "json",
            "limit": 200,
            "offset": 0,
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(AGMARKNET_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        records = data.get("records", [])
        if not records:
            return MOCK_CROPS, "mock"

        crops = parse_agmarknet(records, limit=50)
        if not crops:
            return MOCK_CROPS, "mock"

        _cache["crops"] = crops
        _cache["timestamp"] = now
        _cache["source"] = "live"
        return crops, "live"

    except Exception as e:
        print(f"[AGMARKNET] fetch failed: {e} — using mock data")
        return MOCK_CROPS, "mock"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.get("/crops")
async def get_mandi_crops(state: str = "", commodity: str = ""):
    crops, source = await fetch_live_crops()

    # Optional filters
    if state:
        crops = [c for c in crops if state.lower() in c["state"].lower()]
    if commodity:
        crops = [c for c in crops if commodity.lower() in c["name"].lower()]

    return {
        "crops": crops,
        "total": len(crops),
        "source": source,
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "api_key_set": bool(DATA_GOV_API_KEY),
    }


@router.get("/crops/{crop_id}")
async def get_mandi_crop(crop_id: int):
    crops, source = await fetch_live_crops()
    for crop in crops:
        if crop["id"] == crop_id:
            return {"crop": crop, "source": source}
    return {"error": "Crop not found", "crop_id": crop_id}


@router.get("/health")
async def mandi_health():
    return {
        "status": "ok",
        "api_key_configured": bool(DATA_GOV_API_KEY),
        "data_source": "AGMARKNET (live)" if DATA_GOV_API_KEY else "Mock (set DATA_GOV_API_KEY for live data)",
        "cache_age_seconds": int(datetime.utcnow().timestamp() - _cache["timestamp"]) if _cache["timestamp"] else None,
    }
