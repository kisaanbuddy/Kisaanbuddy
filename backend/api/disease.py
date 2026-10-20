import os
import sys
import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from api.auth import get_current_user
from db.session import get_db
from db.models import (
    DiseaseDetection,
    User,
    AgriculturalExpert,
    AdvisoryCase,
    AdvisoryNotificationLog,
    AgriculturalKnowledgeRecord,
)
from schemas.disease import (
    DiseaseHistoryResponse,
    AgriculturalExpertResponse,
    AdvisoryCaseCreate,
    AdvisoryCaseResponse,
    AdvisoryCaseReview,
    AgriculturalKnowledgeResponse,
)
from services.disease_knowledge_engine import (
    AUTHENTIC_KVK_DIRECTORY,
    AGRICULTURAL_KNOWLEDGE_BASE,
    mask_phone_number,
    generate_advisory_case_id,
    find_matching_expert,
    query_knowledge_base,
    dispatch_advisory_notifications,
)
from services.disease_classifier import get_disease_classifier

# Ensure ML pipelines directory is in python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pipelines_dir = os.path.join(BASE_DIR, "ml", "platform", "pipelines")
if pipelines_dir not in sys.path:
    sys.path.insert(0, pipelines_dir)

try:
    from inference_engine import predict_disease
except Exception:
    predict_disease = None

router = APIRouter()


# ---------------------------------------------------------------------------
# 1. Prediction with Calibrated Confidence & IDM Treatment Integration
# ---------------------------------------------------------------------------
@router.post("/predict")
async def predict_crop_disease(
    file: UploadFile = File(...),
    crop_hint: Optional[str] = Query(None, description="Optional crop hint from farmer"),
    symptom_notes: Optional[str] = Query(None, description="Farmer symptom description"),
) -> Any:
    """Predict plant disease from uploaded image using calibrated multi-engine vision inference."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image (JPEG, PNG, WebP, etc.).",
        )

    try:
        contents = await file.read()
        raw_result = None

        # 1. Try PyTorch EfficientNetV2-S inference engine
        if predict_disease is not None:
            try:
                raw_result = predict_disease(contents)
            except Exception as e:
                raw_result = None

        # 2. Fallback to ONNX CPU Classifier
        if raw_result is None:
            classifier = get_disease_classifier()
            onnx_res = classifier.predict(contents)
            raw_result = {
                "predicted_class": onnx_res["disease_code"],
                "confidence": onnx_res["confidence"],
                "top_predictions": [
                    {"class": p["class"], "confidence": p["score"]}
                    for p in onnx_res.get("top_3", [])
                ],
                "model": "ONNX MobileNetV3-Small (Calibrated T=1.2)",
                "status": "ok" if onnx_res["status"] == "confident" else "uncertain",
                "note": (
                    "High-confidence prediction."
                    if onnx_res["status"] == "confident"
                    else "Visual features are ambiguous. Human expert review recommended."
                ),
            }

        # 3. Enrich prediction with authentic ICAR/CIBRC Integrated Disease Management (IDM)
        predicted_class = raw_result.get("predicted_class", "unknown")
        crop_derived = crop_hint or (
            predicted_class.split("_")[0].capitalize() if "_" in predicted_class else "Crop"
        )
        knowledge_matches = query_knowledge_base(crop_derived, predicted_class)
        best_guide = knowledge_matches[0] if knowledge_matches else AGRICULTURAL_KNOWLEDGE_BASE[0]

        is_uncertain = (
            raw_result.get("status") == "uncertain"
            or raw_result.get("confidence", 0.0) < 0.50
            or "healthy" not in predicted_class and raw_result.get("confidence", 0.0) < 0.65
        )

        return {
            "predicted_class": predicted_class,
            "crop": crop_derived,
            "disease_name": best_guide.get("disease_or_pest", predicted_class.replace("_", " ").title()),
            "confidence": raw_result.get("confidence", 0.50),
            "status": "uncertain" if is_uncertain else "ok",
            "note": (
                "Ambiguous or low-margin visual symptom. Human expert review is strongly advised."
                if is_uncertain
                else raw_result.get("note", "High-confidence visual diagnosis.")
            ),
            "model": raw_result.get("model", "EfficientNetV2-S / ONNX Calibrated"),
            "top_predictions": raw_result.get("top_predictions", []),
            "recommend_expert_review": is_uncertain,
            "immediate_action": (
                "Isolate or prune visibly infected lower foliage to reduce spore dispersal. Refrain from heavy chemical drenching until diagnostic confirmation."
                if is_uncertain
                else f"Begin preventive cultural sanitation and apply {best_guide.get('cibrc_registered_compounds', 'recommended organic spray')} as advised below."
            ),
            "cultural_control": best_guide.get("cultural_preventive", ""),
            "biological_control": best_guide.get("biological_organic", ""),
            "chemical_control": best_guide.get("chemical_control", ""),
            "cibrc_approved": True,
            "dosage_guidelines": best_guide.get("dosage_guidelines", ""),
            "phi_days": best_guide.get("pre_harvest_interval_days", 14),
            "safety_instructions": best_guide.get("safety_instructions", ""),
            "source_institution": best_guide.get("source_institution", "ICAR"),
            "source_url": best_guide.get("source_url", "https://icar.gov.in"),
            "last_verified_date": best_guide.get("last_verified_date", "2026-09-01"),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Crop diagnosis failed: {str(exc)}",
        )


# ---------------------------------------------------------------------------
# 2. Authentic Agricultural Knowledge Base Directory
# ---------------------------------------------------------------------------
@router.get("/knowledge", response_model=List[AgriculturalKnowledgeResponse])
def get_agricultural_knowledge(
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    disease: Optional[str] = Query(None, description="Filter by disease or pest"),
    category: Optional[str] = Query(None, description="Filter by category (fungal, bacterial, viral, pest)"),
    db: Session = Depends(get_db),
) -> Any:
    """Query ICAR and CIBRC-verified integrated disease management schedules."""
    items = AGRICULTURAL_KNOWLEDGE_BASE
    if crop:
        items = [i for i in items if crop.lower() in i["crop"].lower()]
    if disease:
        items = [i for i in items if disease.lower() in i["disease_or_pest"].lower()]
    if category:
        items = [i for i in items if category.lower() == i["category"].lower()]
    
    # Format with integer IDs
    response_items = []
    for idx, item in enumerate(items, start=1):
        response_items.append({
            "id": idx,
            "crop": item["crop"],
            "disease_or_pest": item["disease_or_pest"],
            "category": item["category"],
            "symptoms": item["symptoms"],
            "growth_stage_applicability": item.get("growth_stage_applicability"),
            "cultural_preventive": item["cultural_preventive"],
            "biological_organic": item["biological_organic"],
            "chemical_control": item["chemical_control"],
            "cibrc_registered_compounds": item.get("cibrc_registered_compounds"),
            "dosage_guidelines": item.get("dosage_guidelines"),
            "pre_harvest_interval_days": item.get("pre_harvest_interval_days"),
            "safety_instructions": item["safety_instructions"],
            "source_institution": item["source_institution"],
            "source_url": item.get("source_url"),
            "last_verified_date": datetime.date.fromisoformat(item["last_verified_date"]),
        })
    return response_items


# ---------------------------------------------------------------------------
# 3. Authentic KVK & Agricultural Expert Directory
# ---------------------------------------------------------------------------
@router.get("/experts", response_model=List[AgriculturalExpertResponse])
def list_agricultural_experts(
    state: Optional[str] = Query(None, description="Filter by State"),
    district: Optional[str] = Query(None, description="Filter by District"),
    specialization: Optional[str] = Query(None, description="Filter by Specialization"),
    crop: Optional[str] = Query(None, description="Filter by Crop"),
    institution_type: Optional[str] = Query(None, description="kvk, icar, sau, dept_agri"),
    db: Session = Depends(get_db),
) -> Any:
    """Returns authentic, verified KVKs, ICAR stations, and institutional experts."""
    results = AUTHENTIC_KVK_DIRECTORY

    if state and state.lower() != "all":
        results = [e for e in results if state.lower() in e["state"].lower() or e["id"] == 8]
    if district and district.lower() != "all":
        results = [e for e in results if district.lower() in e["district"].lower() or e["id"] == 8]
    if specialization:
        results = [e for e in results if specialization.lower() in e["specialization"].lower() or e["id"] == 8]
    if crop:
        results = [e for e in results if crop.lower() in (e["crops_supported"] or "").lower() or e["id"] == 8]
    if institution_type and institution_type.lower() != "all":
        results = [e for e in results if e["institution_type"].lower() == institution_type.lower()]

    formatted = []
    for exp in results:
        formatted.append({
            "id": exp["id"],
            "name": exp["name"],
            "designation": exp["designation"],
            "institution_name": exp["institution_name"],
            "institution_type": exp["institution_type"],
            "qualification": exp.get("qualification"),
            "specialization": exp["specialization"],
            "state": exp["state"],
            "district": exp["district"],
            "service_area": exp.get("service_area"),
            "crops_supported": exp.get("crops_supported"),
            "official_phone": exp["official_phone"],
            "official_email": exp.get("official_email"),
            "official_website": exp.get("official_website"),
            "contact_type": exp["contact_type"],
            "is_active": exp["is_active"],
            "can_receive_referrals": exp["can_receive_referrals"],
            "verification_date": datetime.date.fromisoformat(exp["verification_date"]) if exp.get("verification_date") else None,
            "source_attribution": exp["source_attribution"],
        })
    return formatted


# ---------------------------------------------------------------------------
# 4. Real-Time Advisory Case Management
# ---------------------------------------------------------------------------
@router.post("/advisory/cases", response_model=AdvisoryCaseResponse, status_code=status.HTTP_201_CREATED)
def create_advisory_case(
    payload: AdvisoryCaseCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Create a new human expert advisory case with explicit consent and geographic matching."""
    if not payload.consent_recorded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer explicit consent is required to share diagnosis data with agricultural experts.",
        )

    case_id = generate_advisory_case_id()
    matched_expert = find_matching_expert(payload.state, payload.district, payload.crop_name)
    masked_phone = mask_phone_number(payload.farmer_phone)

    # Dispatch notification simulation
    dispatch_advisory_notifications(case_id, matched_expert, payload.farmer_phone)

    case_record = AdvisoryCase(
        case_id=case_id,
        farmer_name=payload.farmer_name,
        farmer_phone=payload.farmer_phone,
        farmer_phone_masked=masked_phone,
        preferred_contact_method=payload.preferred_contact_method,
        consent_recorded=payload.consent_recorded,
        crop_name=payload.crop_name,
        crop_variety=payload.crop_variety,
        state=payload.state,
        district=payload.district,
        village_or_tehsil=payload.village_or_tehsil,
        growth_stage=payload.growth_stage,
        sowing_date=payload.sowing_date,
        visible_symptoms=payload.visible_symptoms,
        symptom_duration_days=payload.symptom_duration_days,
        affected_area_acres=payload.affected_area_acres,
        recent_weather_conditions=payload.recent_weather_conditions,
        fertilizer_pesticide_history=payload.fertilizer_pesticide_history,
        image_url=payload.image_url,
        ai_predicted_disease=payload.ai_predicted_disease,
        ai_confidence=payload.ai_confidence,
        ai_status=payload.ai_status,
        ai_differentials=payload.ai_differentials,
        status="sent",
        priority=payload.priority or "normal",
        expert_notes=f"Assigned to {matched_expert['institution_name']}",
    )
    db.add(case_record)
    db.commit()
    db.refresh(case_record)

    resp = AdvisoryCaseResponse.model_validate(case_record)
    resp.assigned_expert = AgriculturalExpertResponse(**matched_expert)
    return resp


@router.get("/advisory/cases/{case_id}", response_model=AdvisoryCaseResponse)
def get_advisory_case(case_id: str, db: Session = Depends(get_db)) -> Any:
    """Track an advisory case by case ID with privacy protection."""
    case = db.query(AdvisoryCase).filter(AdvisoryCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Advisory case not found.")

    matched_expert = find_matching_expert(case.state, case.district, case.crop_name)
    resp = AdvisoryCaseResponse.model_validate(case)
    resp.assigned_expert = AgriculturalExpertResponse(**matched_expert)
    return resp


@router.get("/advisory/cases", response_model=List[AdvisoryCaseResponse])
def list_advisory_cases(
    status_filter: Optional[str] = Query(None, alias="status"),
    crop: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Any:
    """List advisory cases for expert dashboard review."""
    query = db.query(AdvisoryCase).order_by(desc(AdvisoryCase.created_at))
    if status_filter:
        query = query.filter(AdvisoryCase.status == status_filter)
    if crop:
        query = query.filter(AdvisoryCase.crop_name.ilike(f"%{crop}%"))
    if state:
        query = query.filter(AdvisoryCase.state.ilike(f"%{state}%"))

    cases = query.limit(100).all()
    results = []
    for c in cases:
        matched_expert = find_matching_expert(c.state, c.district, c.crop_name)
        resp = AdvisoryCaseResponse.model_validate(c)
        resp.assigned_expert = AgriculturalExpertResponse(**matched_expert)
        results.append(resp)
    return results


@router.post("/advisory/cases/{case_id}/review", response_model=AdvisoryCaseResponse)
def review_advisory_case(
    case_id: str,
    payload: AdvisoryCaseReview,
    db: Session = Depends(get_db),
) -> Any:
    """Participating expert submits diagnosis confirmation, notes, or remedy."""
    case = db.query(AdvisoryCase).filter(AdvisoryCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Advisory case not found.")

    case.status = payload.status
    if payload.expert_notes:
        case.expert_notes = payload.expert_notes
    if payload.expert_recommendation:
        case.expert_recommendation = payload.expert_recommendation
    if payload.follow_up_date:
        case.follow_up_date = payload.follow_up_date
    if payload.status == "resolved":
        case.resolved_at = datetime.datetime.utcnow()

    case.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(case)

    matched_expert = find_matching_expert(case.state, case.district, case.crop_name)
    resp = AdvisoryCaseResponse.model_validate(case)
    resp.assigned_expert = AgriculturalExpertResponse(**matched_expert)
    return resp


# ---------------------------------------------------------------------------
# 5. User Diagnosis History (Existing Preserved)
# ---------------------------------------------------------------------------
@router.get("/history", response_model=List[DiseaseHistoryResponse])
def get_disease_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get all disease detections for the current logged-in user."""
    detections = (
        db.query(DiseaseDetection)
        .filter(DiseaseDetection.user_id == current_user.id)
        .order_by(desc(DiseaseDetection.detected_at))
        .all()
    )
    return detections
