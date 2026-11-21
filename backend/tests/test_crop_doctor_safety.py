import json
from services.crop_doctor_safety import ScreeningJSONResponse


def test_generated_confidence_and_unverified_dosage_are_not_published():
    response = ScreeningJSONResponse({
        "status": "ok", "disease_name": "Possible blight", "confidence": 0.99,
        "calibrated": True, "cibrc_approved": True, "dosage_guidelines": "unverified rate",
        "phi_days": 14, "biological_control": "unverified formulation",
        "source_institution": "claimed institution", "last_verified_date": "2026-11-21",
        "top_predictions": [{"class": "blight", "confidence": 0.99}],
    })
    data = json.loads(response.body)
    assert data["disease_name"] == "Possible blight"
    assert data["confidence"] is None and data["calibrated"] is False
    assert data["dosage_guidelines"] is None and data["phi_days"] is None
    assert data["biological_control"] is None and data["cibrc_approved"] is False
    assert data["source_institution"] is None and data["last_verified_date"] is None
    assert data["top_predictions"][0]["confidence"] is None


def test_text_search_is_not_a_diagnosis():
    data = json.loads(ScreeningJSONResponse({"status": "text_advisory", "disease_name": "Arbitrary first match"}).body)
    assert data["status"] == "inconclusive"
    assert data["predicted_class"] == "unknown"
    assert data["top_predictions"] == []


def test_retake_state_is_preserved():
    data = json.loads(ScreeningJSONResponse({"status": "retake_image", "retake_advice": "Image too dark"}).body)
    assert data["status"] == "retake_image"
    assert data["retake_advice"] == "Image too dark"
