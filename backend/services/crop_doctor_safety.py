"""Honest screening output while calibration and treatment labels await review."""
from starlette.responses import JSONResponse


def screening_response(data):
    data = dict(data)
    data.update(confidence=None, calibrated=False, confidence_basis="not_validated",
                severity="unknown", cibrc_approved=False, phi_days=None,
                dosage_guidelines=None, source_institution=None, source_url=None,
                last_verified_date=None, treatment_verification="pending_review")
    data["top_predictions"] = [
        {**item, "confidence": None} for item in data.get("top_predictions", [])
    ]
    # Institute homepages do not verify a crop/formulation label or application rate.
    for key in ("cultural_control", "biological_control", "preventive_measures", "expert_guidance"):
        data[key] = None
    data["chemical_control"] = "Treatment is not verified. Consult a qualified local agricultural expert and the applicable product label before application."
    data["immediate_action"] = "Record symptoms and affected area. Take clear close-up and whole-plant photographs for expert review. Do not apply a pesticide solely on this screening."
    data["safety_instructions"] = "No chemical dose or harvest interval has been verified for this consultation."
    data["recommend_expert_review"] = True
    data["note"] = "Preliminary screening only. Confidence calibration, field-wide severity and treatment have not been verified."
    if data.get("status") in ("text_advisory", "inconclusive"):
        data.update(status="inconclusive", disease_name="Problem not identified from symptoms alone",
                    predicted_class="unknown", top_predictions=[])
    return data


class ScreeningJSONResponse(JSONResponse):
    def render(self, content):
        return super().render(screening_response(content))
