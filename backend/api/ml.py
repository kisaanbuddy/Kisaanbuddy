"""
KrishiAI — ML / agronomy recommendation routes.

Endpoints:
  POST /api/ml/recommend     — Authentic multi-parameter agronomic crop evaluation (ICAR/SAU norms)
  POST /api/ml/crop-check    — Crop Suitability AI (natural-language Q&A)

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
import re
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()
log = logging.getLogger(__name__)


# ===========================================================================
# Scientific Agronomic Crop Recommendation Engine (ICAR / SAU norms)
# ===========================================================================
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


class CropSuitabilityItem(BaseModel):
    crop: str
    display_name: str
    display_name_hi: str
    display_name_kn: str
    suitability_score: int  # 0-100%
    match_level: str  # Optimal (>=85), Good (70-84), Moderate (55-69), Marginal (<55)
    expected_yield: str
    water_requirement: str
    growing_conditions: str
    important_soil_params: str
    reasons: List[str]
    precautions: List[str]


class SoilHealthDiagnostic(BaseModel):
    parameter: str
    value: float
    unit: str
    status: str  # Deficient (Low), Optimal (Good), High, Acidic, Alkaline, Neutral
    ideal_range: str
    impact: str
    action: str


class WeatherImpactSummary(BaseModel):
    temperature_evaluation: str
    humidity_evaluation: str
    rainfall_evaluation: str
    disease_pest_risk: str
    irrigation_advisory: str


class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    input_features: dict
    confidence: float
    ranked_recommendations: List[CropSuitabilityItem]
    soil_health_assessment: List[SoilHealthDiagnostic]
    weather_suitability: WeatherImpactSummary
    next_steps: List[str]


# Verified agronomic benchmark profiles based on ICAR & State Agricultural Universities (SAUs)
AGRONOMIC_CROPS = [
    {
        "id": "rice",
        "display_name": "Rice (Basmati / Paddy)",
        "display_name_hi": "धान / चावल (Paddy)",
        "display_name_kn": "ಭತ್ತ (Paddy)",
        "optimal": {"n": (70, 120), "p": (30, 60), "k": (30, 60), "temp": (22, 34), "humidity": (70, 95), "ph": (5.5, 7.0), "rain": (150, 300)},
        "yield": "20–25 q/acre (transplanted), 28–32 q/acre (SRI)",
        "water": "1200–1500 mm (High - requires standing water/AWD)",
        "growing": "Warm humid kharif season, clayey to silty loam with good water retention.",
        "soil_notes": "Needs high Nitrogen for tillering and moderate Phosphorus for root establishment.",
        "reasons": [
            "High humidity and rainfall support optimum standing water during vegetative stage.",
            "Soil pH is within the preferred slightly acidic to neutral range for paddy.",
            "Nitrogen availability supports vigorous tillering and panicle development."
        ],
        "precautions": [
            "Adopt Alternate Wetting and Drying (AWD) to save 25–30% water and prevent methane emissions.",
            "Monitor for Brown Plant Hopper (BPH) and Stem Borer during humid spells."
        ]
    },
    {
        "id": "wheat",
        "display_name": "Wheat (Kalyan Sona / HD-3226)",
        "display_name_hi": "गेहूं (Wheat)",
        "display_name_kn": "ಗೋಧಿ (Wheat)",
        "optimal": {"n": (80, 140), "p": (40, 70), "k": (30, 60), "temp": (12, 25), "humidity": (45, 70), "ph": (6.0, 7.5), "rain": (35, 100)},
        "yield": "18–22 q/acre (timely sown)",
        "water": "400–500 mm (Moderate - 4 to 6 critical irrigations)",
        "growing": "Cool, dry rabi season with bright sunshine; well-drained loamy soil.",
        "soil_notes": "Heavy feeder of Nitrogen; requires available Phosphorus at crown root initiation.",
        "reasons": [
            "Moderate temperature and low rainfall align with cool rabi grain filling.",
            "Well-drained soil prevents root waterlogging.",
            "Soil pH between 6.0–7.5 ensures maximum nutrient availability."
        ],
        "precautions": [
            "Ensure first critical irrigation at Crown Root Initiation (CRI) stage (20–25 DAS).",
            "Spray Propiconazole 25 EC (1 ml/L) if yellow/brown rust signs appear."
        ]
    },
    {
        "id": "cotton",
        "display_name": "Cotton (Bt Hybrid / Shankar)",
        "display_name_hi": "कपास (Bt Cotton)",
        "display_name_kn": "ಹತ್ತಿ (Cotton)",
        "optimal": {"n": (60, 120), "p": (30, 60), "k": (40, 80), "temp": (22, 35), "humidity": (50, 80), "ph": (6.0, 8.2), "rain": (50, 110)},
        "yield": "10–15 q/acre (Bt hybrid), 6–8 q/acre (Desi)",
        "water": "600–800 mm (Moderate - deep root system)",
        "growing": "Warm tropical climate, deep black cotton (vertisol) or well-drained loamy soil.",
        "soil_notes": "Requires high Potassium for boll weight and fiber elongation; tolerant of alkaline pH.",
        "reasons": [
            "Warm ambient temperature promotes continuous vegetative and sympodial flowering.",
            "Potassium status ensures strong boll formation and fiber maturity.",
            "Well-suited to black or deep loam soil with high cation-exchange capacity."
        ],
        "precautions": [
            "Install 8 pheromone traps per acre for early pink bollworm monitoring.",
            "Avoid water stagnation; facilitate furrow drainage during monsoon bursts."
        ]
    },
    {
        "id": "maize",
        "display_name": "Maize (Hybrid Deccan / QPM)",
        "display_name_hi": "मक्का (Corn / Maize)",
        "display_name_kn": "ಮುಸುಕಿನ ಜೋಳ (Maize)",
        "optimal": {"n": (70, 130), "p": (35, 65), "k": (30, 60), "temp": (18, 32), "humidity": (50, 80), "ph": (5.8, 7.5), "rain": (60, 130)},
        "yield": "22–30 q/acre (hybrid varieties)",
        "water": "500–650 mm (Medium - critical at knee-high and silking)",
        "growing": "Wide adaptability (Kharif/Rabi/Zaid); well-drained fertile loamy soils.",
        "soil_notes": "Rapid biomass builder requiring split nitrogen application.",
        "reasons": [
            "Moderate rainfall and warm conditions ensure rapid C4 photosynthetic efficiency.",
            "Soil pH is optimal for zinc and phosphorus uptake.",
            "Excellent rotation crop breaking pulse and paddy weed cycles."
        ],
        "precautions": [
            "Scout whorls regularly for Fall Armyworm (FAW); use pheromone traps and Bt spray.",
            "Critical irrigation at tasseling and silking stages to prevent barren cobs."
        ]
    },
    {
        "id": "sugarcane",
        "display_name": "Sugarcane (Co-0238 / Co-86032)",
        "display_name_hi": "गन्ना (Sugarcane)",
        "display_name_kn": "ಕಬ್ಬು (Sugarcane)",
        "optimal": {"n": (100, 160), "p": (50, 80), "k": (60, 120), "temp": (24, 34), "humidity": (60, 85), "ph": (6.5, 7.8), "rain": (120, 250)},
        "yield": "350–450 q/acre (conventional), 500+ q/acre (drip fertigation)",
        "water": "1500–2200 mm (High - requires perennial irrigation/rainfall)",
        "growing": "Tropical/subtropical long-duration (10–12 months); deep loamy soils.",
        "soil_notes": "Exhaustive crop needing balanced high N and K, with good organic carbon.",
        "reasons": [
            "Adequate warmth and moisture supply prolonged tillering and elongation phases.",
            "High potassium and nitrogen levels support thick stalk and high sucrose brix.",
            "Deep soil profile enables extensive rooting."
        ],
        "precautions": [
            "Dip 3-bud setts in carbendazim (0.1%) before planting to prevent red rot.",
            "Earthing-up at 90–100 days prevents lodging and suppresses early shoots."
        ]
    },
    {
        "id": "chickpea",
        "display_name": "Chickpea (Desi Chana / JG-11)",
        "display_name_hi": "चना (Chickpea / Gram)",
        "display_name_kn": "ಕಡಲೆ (Bengal Gram)",
        "optimal": {"n": (20, 50), "p": (30, 60), "k": (20, 50), "temp": (15, 28), "humidity": (35, 65), "ph": (6.0, 7.8), "rain": (30, 75)},
        "yield": "8–12 q/acre",
        "water": "250–350 mm (Low - highly drought hardy)",
        "growing": "Cool, dry rabi season; tolerates residual soil moisture in vertisols.",
        "soil_notes": "Atmospheric nitrogen-fixing legume; responds well to phosphorus and PSB.",
        "reasons": [
            "Low water and humidity requirements prevent collar rot and Ascochyta blight.",
            "Natural nodulation fixes 30–40 kg N/ha, enriching field for next crop.",
            "Cool weather during pod filling ensures bold, unblemished grains."
        ],
        "precautions": [
            "Inoculate seeds with Rhizobium and PSB culture before sowing.",
            "Do not over-irrigate; maximum 1 to 2 light irrigations (pre-flowering and pod development)."
        ]
    },
    {
        "id": "mustard",
        "display_name": "Mustard (Pusa Bold / RH-749)",
        "display_name_hi": "सरसों (Mustard / Sarson)",
        "display_name_kn": "ಸಾಸಿವೆ (Mustard)",
        "optimal": {"n": (50, 95), "p": (30, 55), "k": (25, 50), "temp": (12, 26), "humidity": (40, 70), "ph": (6.0, 7.5), "rain": (25, 75)},
        "yield": "8–11 q/acre",
        "water": "200–300 mm (Low - 2 to 3 light irrigations)",
        "growing": "Rabi oilseed; temperate to subtropical winter with dry atmosphere.",
        "soil_notes": "Requires available sulphur (20–25 kg/ha elemental sulphur) along with balanced NPK.",
        "reasons": [
            "Cool winter temperatures stimulate high oil content and prolonged flowering.",
            "Thrives in light to medium loam with low moisture requirement.",
            "Short duration allows efficient double-cropping."
        ],
        "precautions": [
            "Monitor aphid buildup during cloudy or humid weather; spray neem oil (5 ml/L) early.",
            "Apply gypsum or single superphosphate (SSP) to satisfy sulphur needs."
        ]
    },
    {
        "id": "groundnut",
        "display_name": "Groundnut (TMV-2 / GJG-9)",
        "display_name_hi": "मूंगफली (Peanut / Groundnut)",
        "display_name_kn": "ಕಡಲೆಕಾಯಿ (Groundnut)",
        "optimal": {"n": (20, 50), "p": (30, 60), "k": (30, 70), "temp": (22, 32), "humidity": (50, 75), "ph": (6.0, 7.2), "rain": (50, 100)},
        "yield": "12–18 q/acre (pod weight)",
        "water": "450–600 mm (Medium - critical at pegging and pod formation)",
        "growing": "Sandy loam to light friable red soils allowing easy peg entry.",
        "soil_notes": "Needs calcium (gypsum at 100 kg/acre at 40 DAS) for pod filling and avoiding pops.",
        "reasons": [
            "Warm soil temperature supports healthy peg penetration and pod development.",
            "Moderate moisture and good drainage prevent root/collar rot.",
            "Legume biology fixes nitrogen while yielding high-protein fodder residue."
        ],
        "precautions": [
            "Apply gypsum at flowering/pegging to prevent empty pods ('pops').",
            "Control tikka leaf spot with Mancozeb (2.5 g/L) at first sign."
        ]
    },
    {
        "id": "soybean",
        "display_name": "Soybean (JS-335 / JS-9560)",
        "display_name_hi": "सोयाबीन (Soybean)",
        "display_name_kn": "ಸೋಯಾಬೀನ್ (Soybean)",
        "optimal": {"n": (25, 55), "p": (40, 70), "k": (30, 65), "temp": (20, 32), "humidity": (55, 80), "ph": (6.0, 7.2), "rain": (70, 130)},
        "yield": "10–15 q/acre",
        "water": "450–600 mm (Medium - kharif monsoon crop)",
        "growing": "Well-drained medium to deep black or alluvial soil; kharif season.",
        "soil_notes": "Symbiotic nitrogen fixer; high phosphorus requirement for root nodules.",
        "reasons": [
            "Warm kharif rain patterns match vegetative and flowering canopy growth.",
            "Phosphorus status supports rich nitrogen-fixing bacterial nodules.",
            "Ideal for central Indian rainfed agricultural zones."
        ],
        "precautions": [
            "Ensure broad bed furrow (BBF) or ridge-and-furrow planting to prevent water stagnation.",
            "Treat seed with Trichoderma and Bradyrhizobium japonicum inoculant."
        ]
    },
    {
        "id": "potato",
        "display_name": "Potato (Kufri Jyoti / Pukhraj)",
        "display_name_hi": "आलू (Potato)",
        "display_name_kn": "ಆಲೂಗಡ್ಡೆ (Potato)",
        "optimal": {"n": (80, 140), "p": (50, 90), "k": (70, 130), "temp": (14, 24), "humidity": (60, 85), "ph": (5.2, 6.5), "rain": (40, 95)},
        "yield": "100–140 q/acre",
        "water": "400–500 mm (Frequent light irrigations)",
        "growing": "Cool season tuber; loose, friable sandy loam rich in organic matter.",
        "soil_notes": "Heavy consumer of Potassium for tuber bulking; prefers slightly acidic pH.",
        "reasons": [
            "Cool night temperatures (15–18°C) trigger efficient tuber bulking.",
            "Potassium richness improves tuber size, skin finish, and shelf life.",
            "Slightly acidic to neutral pH minimizes common scab infection risk."
        ],
        "precautions": [
            "Plant certified disease-free seed tubers treated with Mancozeb (2.5 g/L).",
            "Perform proper earthing-up to prevent greening of developing tubers."
        ]
    },
    {
        "id": "tomato",
        "display_name": "Tomato (Hybrid Abhinav / Shivam)",
        "display_name_hi": "टमाटर (Tomato)",
        "display_name_kn": "ಟೊಮೆಟೊ (Tomato)",
        "optimal": {"n": (60, 120), "p": (40, 80), "k": (50, 100), "temp": (18, 30), "humidity": (50, 75), "ph": (6.0, 7.0), "rain": (50, 100)},
        "yield": "120–180 q/acre (trellised hybrid)",
        "water": "400–600 mm (Regular drip irrigation)",
        "growing": "Warm, sunny weather; well-drained loamy soil with high organic matter.",
        "soil_notes": "Needs continuous calcium and potassium to prevent blossom end rot.",
        "reasons": [
            "Temperature regime promotes continuous flowering and fruit set.",
            "Adequate potassium ensures thick pericarp, vivid colour, and transit tolerance.",
            "Balanced soil conditions allow steady fertigation response."
        ],
        "precautions": [
            "Stake plants using nylon wire or bamboo trellises to avoid fruit ground rot.",
            "Foliar spray Calcium Nitrate (0.5%) to safeguard against Blossom End Rot."
        ]
    },
    {
        "id": "ragi",
        "display_name": "Finger Millet / Ragi (GPU-28 / MR-1)",
        "display_name_hi": "रागी / मंडुआ (Finger Millet)",
        "display_name_kn": "ರಾಗಿ (Ragi)",
        "optimal": {"n": (30, 60), "p": (20, 40), "k": (20, 45), "temp": (20, 34), "humidity": (35, 70), "ph": (5.5, 8.0), "rain": (35, 85)},
        "yield": "10–15 q/acre (rainfed), 16–20 q/acre (irrigated)",
        "water": "250–350 mm (Extremely climate-resilient)",
        "growing": "Red, lateritic, or sandy loam soils; tolerant of shallow, marginal soils.",
        "soil_notes": "Low fertilizer requirement; highly efficient nutrient scavenging roots.",
        "reasons": [
            "Exceptional resilience to dry spells and variable soil nutrition.",
            "Tolerant of slightly acidic to alkaline marginal lands.",
            "High nutrition profile (rich in Calcium and iron) with low input costs."
        ],
        "precautions": [
            "Transplanting 21-day seedlings yields 25% higher grain than direct broadcasting.",
            "Prevent blast disease through seed treatment with Trichoderma (4 g/kg)."
        ]
    }
]


def _evaluate_param(val: float, rng: tuple[float, float], weight: float) -> tuple[float, float]:
    """Calculate normalized penalty for a parameter deviating from optimal (min, max)."""
    low, high = rng
    if low <= val <= high:
        return 0.0, 100.0
    span = max(high - low, 1.0)
    if val < low:
        dev = (low - val) / span
    else:
        dev = (val - high) / span
    penalty = min(dev * 28.0 * weight, 45.0 * weight)
    param_score = max(0.0, 100.0 - (penalty / weight))
    return penalty, param_score


def _generate_soil_diagnostics(n: float, p: float, k: float, ph: float) -> List[SoilHealthDiagnostic]:
    """Provide verified soil health status and corrective recommendations."""
    diagnostics = []

    # Nitrogen
    if n < 50:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Nitrogen (N)", value=n, unit="mg/kg", status="Deficient (Low)",
            ideal_range="50–120 mg/kg",
            impact="Slow vegetative growth, stunted pale yellow leaves, fewer tillers/branches.",
            action="Apply 20–25% extra Nitrogen via split urea top-dressing or incorporate well-decomposed FYM (5 tonnes/acre) and green manure (Dhaincha/Sunhemp)."
        ))
    elif n > 140:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Nitrogen (N)", value=n, unit="mg/kg", status="Excessive (High)",
            ideal_range="50–120 mg/kg",
            impact="Excessive vegetative growth, delayed maturity, weak stems prone to lodging, increased susceptibility to sucking pests.",
            action="Reduce synthetic nitrogen (urea) applications. Increase Potassium top-dressing to strengthen stem vascular bundles."
        ))
    else:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Nitrogen (N)", value=n, unit="mg/kg", status="Optimal (Good)",
            ideal_range="50–120 mg/kg",
            impact="Balanced canopy formation and healthy chlorophyll synthesis.",
            action="Maintain current fertility management; apply recommended basal dose at sowing."
        ))

    # Phosphorus
    if p < 30:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Phosphorus (P)", value=p, unit="mg/kg", status="Deficient (Low)",
            ideal_range="30–65 mg/kg",
            impact="Poor root elongation, delayed flowering, purplish discoloration on older leaf margins.",
            action="Apply Single Super Phosphate (SSP) or DAP basal dose at sowing. Inoculate seeds with Phosphorus Solubilizing Bacteria (PSB) @ 500g/acre."
        ))
    elif p > 75:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Phosphorus (P)", value=p, unit="mg/kg", status="High",
            ideal_range="30–65 mg/kg",
            impact="Can interfere with Zinc and Iron micronutrient uptake.",
            action="Omit additional phosphatic fertilizers this season. Supplement with Zinc Sulphate (21% Zn @ 10 kg/acre) basal."
        ))
    else:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Phosphorus (P)", value=p, unit="mg/kg", status="Optimal (Good)",
            ideal_range="30–65 mg/kg",
            impact="Healthy root architecture and timely flowering.",
            action="Continue standard package-of-practices application."
        ))

    # Potassium
    if k < 30:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Potassium (K)", value=k, unit="mg/kg", status="Deficient (Low)",
            ideal_range="35–80 mg/kg",
            impact="Weak drought tolerance, scorching of leaf tips, poor grain/fruit filling and low pest resistance.",
            action="Apply Muriate of Potash (MOP) @ 25–35 kg/acre basal. Spray 1% Potassium Nitrate (13:0:45) during peak reproductive stage."
        ))
    elif k > 100:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Potassium (K)", value=k, unit="mg/kg", status="High",
            ideal_range="35–80 mg/kg",
            impact="High soil potassium is generally well tolerated, though may slightly compete with Magnesium uptake.",
            action="Reduce potash inputs for this crop cycle; ensure adequate soil organic matter."
        ))
    else:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Potassium (K)", value=k, unit="mg/kg", status="Optimal (Good)",
            ideal_range="35–80 mg/kg",
            impact="Robust disease resistance, strong stem strength, optimal grain weight.",
            action="Standard maintenance dose with MOP or complex NPK fertilizer."
        ))

    # Soil pH
    if ph < 6.0:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Soil pH", value=ph, unit="pH", status="Acidic",
            ideal_range="6.2–7.5",
            impact="Reduced Phosphorus, Calcium, and Magnesium availability; potential Aluminium/Manganese toxicity.",
            action="Incorporate Agricultural Lime (calcium carbonate) or Dolomite @ 200–400 kg/acre 3 weeks before sowing to neutralize acidity."
        ))
    elif ph > 7.8:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Soil pH", value=ph, unit="pH", status="Alkaline",
            ideal_range="6.2–7.5",
            impact="Zinc, Iron, and Manganese micronutrient lockout; poor water infiltration in sodic conditions.",
            action="Apply Agricultural Gypsum (calcium sulphate) @ 200–500 kg/acre along with rich compost/FYM to displace sodium and lower soil pH."
        ))
    else:
        diagnostics.append(SoilHealthDiagnostic(
            parameter="Soil pH", value=ph, unit="pH", status="Neutral (Optimal)",
            ideal_range="6.2–7.5",
            impact="Maximum biological activity and peak nutrient solubility for almost all Indian crops.",
            action="Maintain soil organic matter via regular crop residue recycling."
        ))

    return diagnostics


def _generate_weather_summary(temp: float, hum: float, rain: float) -> WeatherImpactSummary:
    """Evaluate weather impacts scientifically."""
    temp_eval = (
        f"{temp}°C — High daytime warmth; promotes active transpiration. Favourable for kharif crops like cotton, sugarcane, and millets."
        if temp >= 28 else
        (f"{temp}°C — Moderate temperate conditions; ideal for general vegetable cultivation, maize, and pulse establishment."
         if temp >= 20 else
         f"{temp}°C — Cool ambient conditions; highly conducive for rabi crops (wheat, mustard, gram, potato) and tillering.")
    )

    hum_eval = (
        f"{hum}% Relative Humidity — High moisture in atmosphere; optimal for paddy and banana, but accelerates foliar fungal and bacterial spore germination."
        if hum >= 75 else
        (f"{hum}% Relative Humidity — Moderate humidity; healthy transpiration balance with low foliar disease pressure."
         if hum >= 45 else
         f"{hum}% Relative Humidity — Dry atmospheric conditions; increases crop evapotranspiration, necessitating scheduled irrigations.")
    )

    rain_eval = (
        f"{rain} mm — High precipitation outlook; natural soil saturation suitable for wetland paddy and sugarcane. Ensure drainage furrows."
        if rain >= 150 else
        (f"{rain} mm — Moderate rainfall; sufficient for rainfed maize, cotton, and pulses during vegetative growth."
         if rain >= 60 else
         f"{rain} mm — Low moisture regime; drought-hardy crops (chickpea, mustard, millets) or assured supplemental irrigation required.")
    )

    disease_risk = (
        "High risk of Downy Mildew, Blast, and Bacterial Blight due to warm temperature coupled with humidity >75%. Preventive Trichoderma or bio-fungicide recommended."
        if hum >= 75 and temp >= 24 else
        ("Moderate risk of sucking pests (thrips, aphids) in warm, dry weather. Inspect undersides of leaves weekly."
         if hum < 55 and temp >= 26 else
         "Low ambient disease pressure under current climatic balance. Standard IPM monitoring advised.")
    )

    irrigation_adv = (
        "Rainfall is ample. Conserve water, avoid unnecessary irrigation, and clear drainage outlets to prevent root zone hypoxia."
        if rain >= 150 else
        ("Supplemental irrigation needed during critical flowering and pod/grain formation stages (drip or alternate furrow recommended)."
         if rain < 70 else
         "Soil moisture is well-balanced. Irrigate strictly based on field capacity or tensiometer readings.")
    )

    return WeatherImpactSummary(
        temperature_evaluation=temp_eval,
        humidity_evaluation=hum_eval,
        rainfall_evaluation=rain_eval,
        disease_pest_risk=disease_risk,
        irrigation_advisory=irrigation_adv,
    )


@router.post("/recommend", response_model=CropRecommendationResponse)
def recommend_crop(data: CropInput):
    """
    Authentic, multi-parameter agronomic crop evaluation based on ICAR & State Agricultural University norms.
    Evaluates soil N, P, K, pH and climatic temperature, humidity, rainfall to calculate genuine suitability scores.
    """
    weights = {
        "n": 0.16, "p": 0.14, "k": 0.14,
        "temp": 0.18, "humidity": 0.14, "ph": 0.12, "rain": 0.12
    }

    scored_crops = []
    for crop in AGRONOMIC_CROPS:
        opt = crop["optimal"]
        pen_n, _ = _evaluate_param(data.N, opt["n"], weights["n"])
        pen_p, _ = _evaluate_param(data.P, opt["p"], weights["p"])
        pen_k, _ = _evaluate_param(data.K, opt["k"], weights["k"])
        pen_temp, _ = _evaluate_param(data.temperature, opt["temp"], weights["temp"])
        pen_hum, _ = _evaluate_param(data.humidity, opt["humidity"], weights["humidity"])
        pen_ph, _ = _evaluate_param(data.ph, opt["ph"], weights["ph"])
        pen_rain, _ = _evaluate_param(data.rainfall, opt["rain"], weights["rain"])

        total_penalty = pen_n + pen_p + pen_k + pen_temp + pen_hum + pen_ph + pen_rain
        score = max(15, min(98, int(round(100.0 - total_penalty))))

        if score >= 85:
            level = "Optimal"
        elif score >= 70:
            level = "Good"
        elif score >= 55:
            level = "Moderate"
        else:
            level = "Marginal"

        scored_crops.append(CropSuitabilityItem(
            crop=crop["id"],
            display_name=crop["display_name"],
            display_name_hi=crop["display_name_hi"],
            display_name_kn=crop["display_name_kn"],
            suitability_score=score,
            match_level=level,
            expected_yield=crop["yield"],
            water_requirement=crop["water"],
            growing_conditions=crop["growing"],
            important_soil_params=crop["soil_notes"],
            reasons=crop["reasons"],
            precautions=crop["precautions"],
        ))

    # Sort descending by suitability score
    scored_crops.sort(key=lambda x: x.suitability_score, reverse=True)

    top_crop = scored_crops[0]
    top_score = top_crop.suitability_score
    confidence = round(top_score / 100.0, 2)

    soil_assessment = _generate_soil_diagnostics(data.N, data.P, data.K, data.ph)
    weather_summary = _generate_weather_summary(data.temperature, data.humidity, data.rainfall)

    # Next steps tailored to top crop & soil conditions
    next_steps = [
        f"Select certified high-yielding variety of {top_crop.display_name} from your local KVK or authorized seed center.",
        "Perform deep summer ploughing (25–30 cm) followed by 2 passes of cultivator for optimum seedbed aeration.",
        "Complete seed treatment with Bio-fertilizer (Trichoderma / Rhizobium / Azotobacter) 24 hours prior to sowing.",
        "Adjust basal fertilizer dose according to the soil diagnostic advice to correct specific nutrient deficits."
    ]

    return CropRecommendationResponse(
        recommended_crop=top_crop.display_name,
        input_features=data.dict(),
        confidence=confidence,
        ranked_recommendations=scored_crops[:6],
        soil_health_assessment=soil_assessment,
        weather_suitability=weather_summary,
        next_steps=next_steps,
    )


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
            if re.fullmatch(r"[\x00-\x7F ]+", alias):
                if re.search(r"\b" + re.escape(alias_low) + r"\b", low):
                    return canonical
            else:
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

    try:
        from services.chat.chat_service import get_orchestrator
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
