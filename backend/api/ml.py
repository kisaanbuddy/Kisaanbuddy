"""
KrishiAI — ML / agronomy recommendation routes.

Endpoints:
  POST /api/ml/recommend     — rule-based crop recommendation (legacy)
  POST /api/ml/crop-check    — NEW: Crop Suitability AI (natural-language Q&A)

The crop-check endpoint accepts the same farm parameters the predictor UI
already collects PLUS a free-text query. It extracts the target crop from the
query (multilingual keyword match), invokes the configured LLM with a strict
JSON system prompt, and returns a structured suitability assessment.
A heuristic fallback guarantees the user always gets a response even if the
LLM is unreachable or rate-limited.
"""
from __future__ import annotations

import json
import logging
import random
import re
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()
log = logging.getLogger(__name__)


# ===========================================================================
# Legacy: rule-based crop recommendation (preserved as-is)
# ===========================================================================
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


CROPS = ["rice", "maize", "chickpea", "kidneybeans", "pigeonpeas",
         "mothbeans", "mungbean", "blackgram", "lentil", "pomegranate",
         "banana", "mango", "grapes", "watermelon", "muskmelon", "apple",
         "orange", "papaya", "coconut", "cotton", "jute", "coffee"]


@router.post("/recommend")
def recommend_crop(data: CropInput):
    """Mock rule-based recommendation. Replace with trained model later."""
    if data.rainfall > 200:
        recommended = "rice"
    elif data.temperature > 30 and data.rainfall < 100:
        recommended = "cotton"
    else:
        recommended = random.choice(CROPS)
    return {
        "recommended_crop": recommended,
        "input_features": data.dict(),
        "confidence": round(random.uniform(0.75, 0.95), 2),
    }


# ===========================================================================
# CROP SUITABILITY AI ("Ask Your Farm AI")
# ===========================================================================

class CropCheckRequest(BaseModel):
    """Request body for /api/ml/crop-check."""
    N: float = Field(..., description="Nitrogen mg/kg")
    P: float = Field(..., description="Phosphorus mg/kg")
    K: float = Field(..., description="Potassium mg/kg")
    temp: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., description="Relative humidity in %")
    ph: float = Field(..., description="Soil pH")
    rainfall: float = Field(..., description="Rainfall in mm")
    query: str = Field(..., min_length=1, max_length=500,
                       description="Natural-language question, any language")


class CropCheckResponse(BaseModel):
    crop: Optional[str] = None
    suitability: str  # "Suitable" | "Moderate" | "Not Suitable"
    confidence: int   # 0-100
    reason: List[str]
    suggestions: List[str]
    alternatives: List[str]


# ---------------------------------------------------------------------------
# Crop-name extractor — multilingual keyword match (no NLP deps)
# ---------------------------------------------------------------------------
# Maps a canonical lowercase crop key → list of aliases (English, Hindi
# Devanagari + Latin transliteration, Kannada). Add freely as needed.
CROP_KEYWORDS: dict[str, list[str]] = {
    "rice":        ["rice", "paddy", "धान", "चावल", "dhan", "chawal", "ಭತ್ತ"],
    "wheat":       ["wheat", "गेहूं", "गेहूँ", "gehu", "gehun", "ಗೋಧಿ", "godhi"],
    "maize":       ["maize", "corn", "मक्का", "makka", "ಮುಸುಕಿನ ಜೋಳ"],
    "cotton":      ["cotton", "कपास", "kapas", "ಹತ್ತಿ", "hatti"],
    "sugarcane":   ["sugarcane", "गन्ना", "ganna", "ಕಬ್ಬು"],
    "soybean":     ["soybean", "soya", "सोयाबीन", "soyabean"],
    "tomato":      ["tomato", "टमाटर", "tamatar", "ಟೊಮೆಟೊ"],
    "potato":      ["potato", "आलू", "aloo", "alu", "ಆಲೂಗಡ್ಡೆ"],
    "onion":       ["onion", "प्याज", "pyaaz", "pyaj", "ಈರುಳ್ಳಿ"],
    "chilli":      ["chilli", "chili", "chillies", "मिर्च", "mirch", "ಮೆಣಸು"],
    "brinjal":     ["brinjal", "eggplant", "बैंगन", "baingan", "ಬದನೆಕಾಯಿ"],
    "pigeonpea":   ["tur", "arhar", "pigeonpea", "तूर", "अरहर"],
    "chickpea":    ["chickpea", "chana", "gram", "चना", "ಕಡಲೆ"],
    "groundnut":   ["groundnut", "peanut", "मूंगफली", "moongphali", "shenga"],
    "mustard":     ["mustard", "सरसों", "sarson", "sarsoon"],
    "banana":      ["banana", "केला", "kela", "ಬಾಳೆ"],
    "mango":       ["mango", "आम", "aam", "ಮಾವು"],
    "grape":       ["grape", "grapes", "अंगूर", "angoor", "ದ್ರಾಕ್ಷಿ"],
    "apple":       ["apple", "सेब", "seb"],
    "pomegranate": ["pomegranate", "अनार", "anar"],
    "papaya":      ["papaya", "पपीता", "papita"],
    "watermelon":  ["watermelon", "तरबूज", "tarbuz"],
    "muskmelon":   ["muskmelon", "खरबूजा", "kharbuja"],
    "coconut":     ["coconut", "नारियल", "nariyal"],
    "coffee":      ["coffee", "कॉफी", "kafi"],
    "ragi":        ["ragi", "finger millet", "रागी", "ಕಡ್ಡಿ"],
    "jowar":       ["jowar", "sorghum", "ज्वार"],
    "bajra":       ["bajra", "pearl millet", "बाजरा"],
    "barley":      ["barley", "जौ", "jau"],
    "lentil":      ["lentil", "masoor", "मसूर"],
    "moong":       ["moong", "mung", "मूंग"],
    "urad":        ["urad", "उड़द"],
    "turmeric":    ["turmeric", "हल्दी", "haldi", "ಅರಿಶಿನ"],
    "ginger":      ["ginger", "अदरक", "adrak", "ಶುಂಠಿ"],
    "garlic":      ["garlic", "लहसुन", "lehsun"],
    "cabbage":     ["cabbage", "पत्तागोभी", "patta gobhi"],
    "cauliflower": ["cauliflower", "फूलगोभी", "phoolgobhi"],
    "okra":        ["okra", "ladyfinger", "भिंडी", "bhindi"],
    "spinach":     ["spinach", "पालक", "palak"],
    "carrot":      ["carrot", "गाजर", "gajar"],
    "cucumber":    ["cucumber", "खीरा", "kheera"],
    "pumpkin":     ["pumpkin", "कद्दू", "kaddu"],
    "tea":         ["tea", "चाय"],
    "cardamom":    ["cardamom", "इलायची", "elaichi"],
    "blackpepper": ["black pepper", "kali mirch", "काली मिर्च"],
}


def extract_crop_from_query(query: str) -> Optional[str]:
    """Return the canonical crop key found in the query, or None."""
    if not query:
        return None
    raw = query.strip()
    low = raw.lower()
    for canonical, aliases in CROP_KEYWORDS.items():
        for alias in aliases:
            alias_low = alias.lower()
            # word-boundary match for ASCII aliases
            if re.fullmatch(r"[\x00-\x7F ]+", alias):
                if re.search(r"\b" + re.escape(alias_low) + r"\b", low):
                    return canonical
            else:
                # raw substring for non-ASCII (Devanagari, Kannada)
                if alias in raw:
                    return canonical
    return None


# ---------------------------------------------------------------------------
# LLM system prompt — strict JSON output
# ---------------------------------------------------------------------------
_SUITABILITY_SYSTEM = """\
You are an expert agricultural AI assistant for Indian farmers. Analyse the
given farm parameters and the farmer's query. Determine if the target crop is
suitable for these conditions. If no specific crop is mentioned, recommend
the best 3 crops for these parameters.

OUTPUT — return ONLY valid JSON. No markdown. No code fences. No prose.

{
  "crop": "<lowercase crop name being analysed, or null if asking generally>",
  "suitability": "Suitable" | "Moderate" | "Not Suitable",
  "confidence": <integer 0-100>,
  "reason": [<3-5 short bullet strings explaining your verdict>],
  "suggestions": [<3-5 actionable items: fertilizer doses, irrigation, sowing time, variety>],
  "alternatives": [<3-5 alternative crop names better suited to these params>]
}

INDIAN AGRO-NORMS (use to judge):
  Rice/Paddy: humidity >70%, rainfall >150mm, 24-32°C, pH 5.5-6.5, high N
  Wheat: 15-25°C, humidity 50-70%, rainfall 30-100mm, pH 6-7.5, high N
  Cotton: 25-35°C, moderate humidity, rainfall 50-100mm, pH 6-8
  Sugarcane: 24-32°C, rainfall >120mm, pH 6.5-7.5, very high N+K
  Maize: 20-30°C, moderate humidity, rainfall 50-100mm, pH 5.5-7.5
  Tomato/Potato/Onion: 18-28°C, humidity 60-80%, rainfall 60-120mm, pH 6-7
  Chickpea/Pulses: 15-25°C, low rainfall (30-60mm), pH 6-7.5, low-medium N
  Groundnut: 25-30°C, rainfall 50-100mm, sandy loam, pH 6-7
  Banana: 25-30°C, very high humidity, rainfall >100mm, pH 6-7.5
  Mustard: 15-25°C, low rainfall, pH 6-7.5
  Ragi/Jowar/Bajra: 25-32°C, low rainfall (40-80mm), tolerant of poor soils

CONFIDENCE SCALE:
  90-100: every parameter strongly matches the target crop
  70-89: most parameters match, 1-2 are marginal
  50-69: mixed — some good, some borderline
  30-49: most parameters off-target — recommend alternatives
  0-29: clearly unsuitable

LANGUAGE: Use simple Hinglish (English + Hindi mix) for reason and
suggestions so an Indian farmer can read easily. Each bullet under 18 words.
Return JSON ONLY.
"""


@router.post("/crop-check", response_model=CropCheckResponse)
async def crop_check(req: CropCheckRequest) -> CropCheckResponse:
    """Crop suitability AI — NLP query + farm params → structured verdict."""
    extracted = extract_crop_from_query(req.query)

    user_payload = (
        f"FARMER'S QUERY: \"{req.query}\"\n"
        f"DETECTED CROP: {extracted or '(none — recommend best crops)'}\n\n"
        f"FARM PARAMETERS:\n"
        f"  Nitrogen (N): {req.N} mg/kg\n"
        f"  Phosphorus (P): {req.P} mg/kg\n"
        f"  Potassium (K): {req.K} mg/kg\n"
        f"  Temperature: {req.temp} °C\n"
        f"  Humidity: {req.humidity} %\n"
        f"  Soil pH: {req.ph}\n"
        f"  Rainfall: {req.rainfall} mm\n"
    )

    # Reuse the chat orchestrator's pre-configured Gemini/OpenAI client +
    # NOT_FOUND-aware model fallback chain.
    try:
        from services.chat.chat_service import get_orchestrator  # local import
        orch = get_orchestrator()
        client = await orch._client_ready()
    except Exception as exc:
        log.warning("crop-check: LLM client unavailable (%s) → heuristic fallback", exc)
        return _heuristic_fallback(req, extracted)

    messages = [
        {"role": "system", "content": _SUITABILITY_SYSTEM},
        {"role": "user", "content": user_payload},
    ]

    resp, err = await orch._call_with_fallbacks(
        client, messages,
        with_tools=False, stream=False,
        temperature=0.2, max_tokens=900,
    )
    if resp is None:
        log.warning("crop-check: LLM call failed (%s) → heuristic fallback", err)
        return _heuristic_fallback(req, extracted)

    raw = (resp.choices[0].message.content or "").strip()
    parsed = _parse_json_loose(raw)
    if not parsed:
        log.warning("crop-check: could not parse JSON → heuristic fallback")
        return _heuristic_fallback(req, extracted)

    return CropCheckResponse(
        crop=(parsed.get("crop") or extracted or None),
        suitability=str(parsed.get("suitability") or "Moderate"),
        confidence=int(parsed.get("confidence", 60)),
        reason=[str(x) for x in (parsed.get("reason") or [])][:6],
        suggestions=[str(x) for x in (parsed.get("suggestions") or [])][:6],
        alternatives=[str(x) for x in (parsed.get("alternatives") or [])][:6],
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _parse_json_loose(text: str) -> Optional[dict]:
    """Extract JSON from a model response that may contain markdown / prose."""
    if not text:
        return None
    s = text.strip()
    if s.startswith("```"):
        s = re.sub(r"^```[a-zA-Z]*\n?", "", s)
        s = re.sub(r"\n?```\s*$", "", s)
    start = s.find("{")
    end = s.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(s[start : end + 1])
    except Exception:
        return None


def _heuristic_fallback(req: CropCheckRequest, crop: Optional[str]) -> CropCheckResponse:
    """Rule-based fallback so the user always gets a useful response."""
    score = 60
    reasons: List[str] = []
    suggestions: List[str] = [
        "Free Soil Health Card test karwao — exact NPK dose milegi",
        "Drip / mulch use karke 40-60% paani bachao",
        "Mandi rate enam.gov.in pe check karke decide karo",
    ]

    if req.rainfall > 150 and req.humidity > 70:
        reasons.append("High rainfall + humidity → paddy / sugarcane / banana favour karte hain")
        if crop in ("rice", "sugarcane", "banana"):
            score = 85
    elif req.rainfall < 80 and req.temp > 25:
        reasons.append("Low rainfall + warm temp → pulses / cotton / millets best chalti hain")
        if crop in ("chickpea", "cotton", "groundnut", "ragi", "bajra"):
            score = 80

    if req.ph < 5.5:
        reasons.append(f"Soil acidic hai (pH {req.ph}) — sowing se pehle lime daalein")
    elif req.ph > 8:
        reasons.append(f"Soil alkaline hai (pH {req.ph}) — gypsum ya organic matter use karein")

    if not reasons:
        reasons.append("Parameters general cultivation ke liye balanced lag rahe hain.")

    suit = "Suitable" if score >= 75 else ("Moderate" if score >= 55 else "Not Suitable")
    alts: List[str] = []
    if req.rainfall > 150:
        alts = ["rice", "sugarcane", "banana", "jute"]
    elif req.rainfall < 80:
        alts = ["chickpea", "ragi", "bajra", "groundnut", "cotton"]
    else:
        alts = ["wheat", "maize", "tomato", "soybean", "groundnut"]

    return CropCheckResponse(
        crop=crop,
        suitability=suit,
        confidence=score,
        reason=reasons,
        suggestions=suggestions,
        alternatives=alts,
    )
