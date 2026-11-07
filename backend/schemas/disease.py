"""Disease detection schemas.

Blueprint contract:
    POST /api/v1/disease/detect (multipart/form-data image)
    reply: { "disease", "confidence", "remedy" }
"""
from pydantic import BaseModel, Field


class DiseaseDetectionResponse(BaseModel):
    disease: str = Field(..., description="Identified disease name")
    confidence: float = Field(..., ge=0.0, le=1.0)
    remedy: str = Field(..., description="Suggested treatment in farmer-friendly language")
    severity: str = Field("unknown", description="low | medium | high")

from typing import Optional
from datetime import datetime
from pydantic import ConfigDict

class DiseaseHistoryResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    image_url: Optional[str] = None
    crop_name: Optional[str] = None
    detected_disease: Optional[str] = None
    confidence: Optional[float] = None
    remedy_suggested: Optional[str] = None
    detected_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


from typing import List, Dict, Any
from datetime import date


class DifferentialPrediction(BaseModel):
    class_name: str
    confidence: float
    description: Optional[str] = None


class DiagnosisPredictionResponse(BaseModel):
    predicted_class: str
    crop: str
    disease_name: str
    confidence: float
    status: str  # ok, uncertain, unknown
    note: Optional[str] = None
    model: str
    top_predictions: List[Dict[str, Any]] = []
    immediate_action: Optional[str] = None
    recommend_expert_review: bool = False
    source_guidance: Optional[str] = None
    cultural_control: Optional[str] = None
    biological_control: Optional[str] = None
    chemical_control: Optional[str] = None
    cibrc_approved: bool = True
    phi_days: Optional[int] = None


class AgriculturalExpertResponse(BaseModel):
    id: int
    name: str
    designation: str
    institution_name: str
    institution_type: str
    qualification: Optional[str] = None
    specialization: str
    state: str
    district: str
    service_area: Optional[str] = None
    crops_supported: Optional[str] = None
    official_phone: str
    official_email: Optional[str] = None
    official_website: Optional[str] = None
    contact_type: str
    is_active: bool
    can_receive_referrals: bool
    verification_date: Optional[date] = None
    source_attribution: str
    model_config = ConfigDict(from_attributes=True)


class AdvisoryCaseCreate(BaseModel):
    farmer_name: str
    farmer_phone: str
    preferred_contact_method: str = "phone"  # phone, whatsapp, sms
    consent_recorded: bool = True
    consent_for_research: bool = True
    crop_name: str
    crop_variety: Optional[str] = None
    state: str
    district: str
    village_or_tehsil: Optional[str] = None
    growth_stage: Optional[str] = None
    sowing_date: Optional[date] = None
    visible_symptoms: Optional[str] = None
    symptom_duration_days: Optional[int] = None
    affected_area_acres: Optional[float] = None
    recent_weather_conditions: Optional[str] = None
    fertilizer_pesticide_history: Optional[str] = None
    image_url: Optional[str] = None
    ai_predicted_disease: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_status: Optional[str] = "confident"
    ai_differentials: Optional[str] = None
    priority: Optional[str] = "normal"
    model_version: Optional[str] = None
    artifact_hash: Optional[str] = None
    image_quality_json: Optional[str] = None
    session_id: Optional[str] = None
    dhash: Optional[str] = None
    farmer_crop_hint: Optional[str] = None


class AdvisoryCaseResponse(BaseModel):
    id: int
    case_id: str
    farmer_name: str
    farmer_phone_masked: Optional[str] = None
    preferred_contact_method: str
    crop_name: str
    crop_variety: Optional[str] = None
    state: str
    district: str
    village_or_tehsil: Optional[str] = None
    growth_stage: Optional[str] = None
    sowing_date: Optional[date] = None
    visible_symptoms: Optional[str] = None
    symptom_duration_days: Optional[int] = None
    affected_area_acres: Optional[float] = None
    recent_weather_conditions: Optional[str] = None
    fertilizer_pesticide_history: Optional[str] = None
    image_url: Optional[str] = None
    ai_predicted_disease: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_status: Optional[str] = None
    ai_differentials: Optional[str] = None
    status: str
    priority: str
    expert_notes: Optional[str] = None
    expert_recommendation: Optional[str] = None
    assigned_expert: Optional[AgriculturalExpertResponse] = None
    follow_up_date: Optional[date] = None
    # Supervised Field Pilot Provenance & Expert Review
    model_version: Optional[str] = None
    artifact_hash: Optional[str] = None
    image_quality_json: Optional[str] = None
    review_outcome: Optional[str] = None
    expert_crop: Optional[str] = None
    expert_disease: Optional[str] = None
    expert_is_healthy: Optional[bool] = False
    reviewed_by_id: Optional[int] = None
    reviewer_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    consent_for_research: bool = True
    session_id: Optional[str] = None
    dhash: Optional[str] = None
    image_storage_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class AdvisoryCaseReview(BaseModel):
    review_outcome: str  # confirmed_correct, correct_crop_incorrect_disease, incorrect_crop, uncertain_diagnosis, unable_to_assess_photograph, additional_photograph_required
    expert_crop: Optional[str] = None
    expert_disease: Optional[str] = None
    expert_is_healthy: Optional[bool] = False
    expert_notes: Optional[str] = None
    expert_recommendation: Optional[str] = None
    status: Optional[str] = None  # resolved, accepted, farmer_contacted, request_more_info
    follow_up_date: Optional[date] = None


class AgriculturalKnowledgeResponse(BaseModel):
    id: int
    crop: str
    disease_or_pest: str
    category: str
    symptoms: str
    growth_stage_applicability: Optional[str] = None
    cultural_preventive: str
    biological_organic: str
    chemical_control: str
    cibrc_registered_compounds: Optional[str] = None
    dosage_guidelines: Optional[str] = None
    pre_harvest_interval_days: Optional[int] = None
    safety_instructions: str
    source_institution: str
    source_url: Optional[str] = None
    last_verified_date: date
    model_config = ConfigDict(from_attributes=True)

