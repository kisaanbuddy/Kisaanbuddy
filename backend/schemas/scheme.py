from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class SchemeBase(BaseModel):
    scheme_id: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    short_name: Optional[str] = Field(None, max_length=100)
    jurisdiction: Literal["Central", "State"] = "Central"
    state: str = Field(default="All", max_length=100)
    department: Optional[str] = Field(None, max_length=255)
    category: str = Field(..., max_length=100)
    overview: str
    benefits_summary: str
    benefits_details: Optional[str] = None
    eligibility_criteria_text: str
    eligibility_rules: Dict[str, Any] = Field(default_factory=dict)
    required_documents: List[Dict[str, Any]] = Field(default_factory=list)
    application_steps: List[Dict[str, Any]] = Field(default_factory=list)
    source_url: str = Field(..., max_length=500)
    application_url: Optional[str] = Field(None, max_length=500)
    application_window_status: Literal["open", "upcoming", "closed", "open_all_year", "unconfirmed"] = "open_all_year"
    application_window_start: Optional[date] = None
    application_deadline: Optional[date] = None
    deadline_text: Optional[str] = Field(None, max_length=100)
    helpline_details: Optional[Dict[str, Any]] = Field(default_factory=dict)
    faqs: List[Dict[str, str]] = Field(default_factory=list)
    verification_status: Literal["verified_official", "pending_review", "archived"] = "verified_official"
    data_source: str = Field(default="Official Portal / Gazette", max_length=255)
    is_active: bool = True


class SchemeCreate(SchemeBase):
    pass


class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    jurisdiction: Optional[Literal["Central", "State"]] = None
    state: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    overview: Optional[str] = None
    benefits_summary: Optional[str] = None
    benefits_details: Optional[str] = None
    eligibility_criteria_text: Optional[str] = None
    eligibility_rules: Optional[Dict[str, Any]] = None
    required_documents: Optional[List[Dict[str, Any]]] = None
    application_steps: Optional[List[Dict[str, Any]]] = None
    source_url: Optional[str] = None
    application_url: Optional[str] = None
    application_window_status: Optional[Literal["open", "upcoming", "closed", "open_all_year", "unconfirmed"]] = None
    application_window_start: Optional[date] = None
    application_deadline: Optional[date] = None
    deadline_text: Optional[str] = None
    helpline_details: Optional[Dict[str, Any]] = None
    faqs: Optional[List[Dict[str, str]]] = None
    verification_status: Optional[Literal["verified_official", "pending_review", "archived"]] = None
    data_source: Optional[str] = None
    is_active: Optional[bool] = None


class SchemeResponse(SchemeBase):
    id: int
    last_verified_at: datetime
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Finder / Matching Engine Schemas ---
class SchemeFinderInput(BaseModel):
    state: str = Field(default="All")
    district: Optional[str] = None
    crops: List[str] = Field(default_factory=list)
    landholding_acres: Optional[float] = Field(default=None, ge=0.0)
    tenure_type: Optional[Literal["owner", "tenant", "sharecropper", "other"]] = "owner"
    has_irrigation: Optional[bool] = None
    irrigation_source: Optional[str] = None  # borewell, canal, drip, rainfed, etc.
    farming_activities: List[str] = Field(default_factory=list)  # e.g., ["micro_irrigation", "solar_pump", "machinery", "organic_farming", "horticulture", "credit_loan", "crop_insurance"]
    farmer_category: Optional[Literal["general", "obc", "sc", "st", "women", "any"]] = "any"
    existing_registrations: List[str] = Field(default_factory=list)  # e.g., ["pmkisan", "soil_health_card", "kcc"]
    save_to_profile: bool = False


class SchemeMatchResult(BaseModel):
    scheme: SchemeResponse
    match_status: Literal["Potential Match", "More Information Required", "Appears Not to Match Published Criteria"]
    score: int  # 0 to 100
    reasons: List[str]
    missing_criteria: List[str]
    disclaimer: str = (
        "Disclaimer: Eligibility classifications are indicative and based strictly on published official guidelines. "
        "KisaanBuddy does not guarantee scheme approval, fund disbursement, or government sanction. Final eligibility "
        "is subject to document verification by relevant government authorities."
    )


class SchemeDiscoveryResponse(BaseModel):
    query_summary: Dict[str, Any]
    total_schemes_evaluated: int
    potential_matches: List[SchemeMatchResult]
    more_info_needed: List[SchemeMatchResult]
    unmatched: List[SchemeMatchResult]


# --- Checklist Schemas ---
class ChecklistItemCreate(BaseModel):
    scheme_id: str
    document_name: str
    document_code: Optional[str] = None
    status: Literal["available", "pending", "need_help"] = "pending"
    notes: Optional[str] = None


class ChecklistItemUpdate(BaseModel):
    status: Optional[Literal["available", "pending", "need_help"]] = None
    notes: Optional[str] = None


class ChecklistItemResponse(BaseModel):
    id: int
    user_id: int
    scheme_id: str
    document_name: str
    document_code: Optional[str] = None
    status: Literal["available", "pending", "need_help"]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Reminder Schemas ---
class ReminderCreate(BaseModel):
    scheme_id: str
    reminder_date: date
    reminder_type: Literal["application_deadline", "window_open", "document_ready", "followup"] = "application_deadline"
    notes: Optional[str] = None


class ReminderUpdate(BaseModel):
    reminder_date: Optional[date] = None
    notes: Optional[str] = None
    is_dismissed: Optional[bool] = None


class ReminderResponse(BaseModel):
    id: int
    user_id: int
    scheme_id: str
    scheme_name: Optional[str] = None
    reminder_date: date
    reminder_type: str
    notes: Optional[str] = None
    is_dismissed: bool
    source_url: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
