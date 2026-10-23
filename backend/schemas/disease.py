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
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class AdvisoryCaseReview(BaseModel):
    status: str  # accepted, farmer_contacted, resolved, request_more_info
    expert_notes: Optional[str] = None
    expert_recommendation: Optional[str] = None
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

