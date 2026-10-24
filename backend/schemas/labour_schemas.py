"""Pydantic schemas for KisaanBuddy Agricultural Labour Module (Worker Connect).

Covers all 10 phases:
- Agricultural Worker Categories & Admin Extensibility
- Worker Registration with consent & masked phone numbers
- Farmer Job Posting with comprehensive validation
- Multi-criteria Worker Search & Availability
- Official Labour Bureau & MGNREGA Wage Benchmarks
- Consent-based Contact Requests & Approvals
- Reporting, Moderation, and Account Deletion
"""
from __future__ import annotations

import re
from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


# Common phone normalizer
def validate_and_clean_phone(phone_str: str) -> str:
    cleaned = "".join(filter(str.isdigit, str(phone_str).strip()))
    if len(cleaned) == 12 and cleaned.startswith("91"):
        cleaned = cleaned[2:]
    elif len(cleaned) == 11 and cleaned.startswith("0"):
        cleaned = cleaned[1:]
    if len(cleaned) != 10 or cleaned[0] not in "6789":
        raise ValueError("Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")
    return cleaned


def mask_phone_number(raw_phone: str) -> str:
    cleaned = "".join(filter(str.isdigit, str(raw_phone).strip()))
    if len(cleaned) >= 10:
        last10 = cleaned[-10:]
        return f"+91 {last10[:2]}XXX-XX{last10[-3:]}"
    return "+91 XXXXX-XXXXX"


# ---------------------------------------------------------------------------
# Phase 2: Categories
# ---------------------------------------------------------------------------
class WorkerCategoryOut(BaseModel):
    id: int
    slug: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Briefcase"
    is_active: bool = True

    model_config = {"from_attributes": True}


class WorkerCategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = "Briefcase"

    @field_validator("slug", mode="before")
    @classmethod
    def generate_slug(cls, v: Optional[str], info) -> str:
        if v and v.strip():
            return re.sub(r"[^a-z0-9_]+", "_", v.strip().lower()).strip("_")
        return ""


# ---------------------------------------------------------------------------
# Phase 3: Worker Registration & Skills
# ---------------------------------------------------------------------------
class WorkerSkillIn(BaseModel):
    category_slug: str
    skill_name: str = Field(..., min_length=2, max_length=150)
    experience_years: float = Field(1.0, ge=0.0, le=50.0)
    skill_level: Literal["beginner", "intermediate", "skilled", "master_operator"] = "intermediate"
    certification_or_notes: Optional[str] = None


class WorkerSkillOut(BaseModel):
    id: int
    category_slug: str
    skill_name: str
    experience_years: float
    skill_level: str
    certification_or_notes: Optional[str] = None

    model_config = {"from_attributes": True}


class WorkerRegisterIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Full worker or group leader name.")
    phone_number: str = Field(..., description="Indian mobile number.")
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    village: Optional[str] = Field(None, max_length=150)
    lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    lon: Optional[float] = Field(None, ge=-180.0, le=180.0)
    worker_type: Literal["individual", "group", "contractor"] = "individual"
    group_size: int = Field(1, ge=1, le=500)
    max_travel_km: float = Field(25.0, ge=1.0, le=500.0)
    wage_expectation: float = Field(..., ge=50.0, le=100000.0, description="Expected wage rate in Rupees.")
    wage_unit: Literal["per_day", "per_hour", "per_acre", "per_task"] = "per_day"
    preferred_work_types: List[str] = Field(..., min_length=1, description="List of category slugs.")
    skills: Optional[List[WorkerSkillIn]] = []
    languages_spoken: Optional[List[str]] = ["en", "hi"]
    bio_or_experience: Optional[str] = Field(None, max_length=1000)
    photo_url: Optional[str] = None
    consent_share_phone: bool = Field(False, description="Whether phone can be revealed upon approved contact requests.")
    consent_terms: bool = Field(True, description="Worker consent to service terms.")
    otp_code: Optional[str] = Field(None, description="Verification OTP code (optional in dev, validated if provided).")

    @field_validator("phone_number")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return validate_and_clean_phone(v)


class WorkerProfileOut(BaseModel):
    id: int
    name: str
    masked_phone: str
    unmasked_phone: Optional[str] = None
    worker_type: str
    group_size: int
    state: str
    district: str
    village: Optional[str] = None
    max_travel_km: float
    wage_expectation: float
    wage_unit: str
    preferred_work_types: List[str]
    skills: List[WorkerSkillOut] = []
    languages_spoken: List[str] = []
    bio_or_experience: Optional[str] = None
    photo_url: Optional[str] = None
    verification_status: str
    is_available: bool
    availability_status_label: str
    last_confirmed_at: datetime
    availability_expires_at: datetime
    distance_km: Optional[float] = None
    match_score: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Phase 3/7: Phone OTP Simulation / Verification
# ---------------------------------------------------------------------------
class WorkerOtpRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return validate_and_clean_phone(v)


class WorkerOtpVerify(BaseModel):
    phone_number: str
    otp_code: str = Field(..., min_length=4, max_length=8)

    @field_validator("phone_number")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return validate_and_clean_phone(v)


# ---------------------------------------------------------------------------
# Phase 4: Farmer Job Posting
# ---------------------------------------------------------------------------
class LabourJobPostIn(BaseModel):
    job_title: str = Field(..., min_length=3, max_length=200)
    category_slug: str = Field(..., description="Category slug from /categories")
    work_type_detail: Optional[str] = Field(None, max_length=500)
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    village: Optional[str] = Field(None, max_length=150)
    address_text: Optional[str] = Field(None, max_length=255)
    lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    lon: Optional[float] = Field(None, ge=-180.0, le=180.0)
    workers_needed: int = Field(1, ge=1, le=500)
    required_skills: Optional[List[str]] = []
    start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Job start date (YYYY-MM-DD)")
    duration_days: int = Field(1, ge=1, le=120)
    working_hours_desc: Optional[str] = Field("7:00 AM - 2:00 PM (7 hours)", max_length=100)
    wage_amount: float = Field(..., ge=50.0, le=100000.0)
    wage_unit: Literal["per_day", "per_hour", "per_acre", "per_task"] = "per_day"
    payment_terms: Literal["Daily Cash on Site", "Weekly Payment", "On Task Completion", "Direct UPI"] = "Daily Cash on Site"
    transport_info: str = Field("Worker to arrange own transport", max_length=150)
    accommodation_info: str = Field("No accommodation provided", max_length=150)
    application_deadline: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    additional_instructions: Optional[str] = Field(None, max_length=1000)
    contact_name: str = Field(..., min_length=2, max_length=150)
    contact_phone: str = Field(..., description="Farmer contact number")

    @field_validator("contact_phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return validate_and_clean_phone(v)


class LabourJobPostOut(BaseModel):
    id: int
    job_code: str
    job_title: str
    category_slug: str
    work_type_detail: Optional[str] = None
    state: str
    district: str
    village: Optional[str] = None
    address_text: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    workers_needed: int
    required_skills: List[str] = []
    start_date: date
    duration_days: int
    working_hours_desc: Optional[str] = None
    wage_amount: float
    wage_unit: str
    payment_terms: str
    transport_info: str
    accommodation_info: str
    application_deadline: Optional[date] = None
    additional_instructions: Optional[str] = None
    contact_name: str
    masked_contact_phone: str
    unmasked_contact_phone: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Phase 5: Worker Search & Filters
# ---------------------------------------------------------------------------
class WorkerSearchQuery(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    category_slug: Optional[str] = None
    skills: Optional[List[str]] = None
    worker_type: Optional[Literal["all", "individual", "group", "contractor"]] = "all"
    min_wage: Optional[float] = None
    max_wage: Optional[float] = None
    only_confirmed_available: bool = True
    lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    lon: Optional[float] = Field(None, ge=-180.0, le=180.0)
    radius_km: float = Field(50.0, ge=1.0, le=500.0)
    sort_by: Literal["relevance", "distance", "availability", "wage_asc", "wage_desc"] = "relevance"
    limit: int = Field(30, ge=1, le=100)
    offset: int = Field(0, ge=0)


class WorkerSearchResponse(BaseModel):
    workers: List[WorkerProfileOut]
    total: int
    filters_applied: dict


# ---------------------------------------------------------------------------
# Phase 5/7: Availability Updates
# ---------------------------------------------------------------------------
class AvailabilityUpdateIn(BaseModel):
    is_available: bool = True
    available_from: Optional[str] = None  # YYYY-MM-DD
    available_to: Optional[str] = None  # YYYY-MM-DD
    validity_days: int = Field(7, ge=1, le=30, description="TTL in days before availability expires.")
    notes: Optional[str] = Field(None, max_length=300)


# ---------------------------------------------------------------------------
# Phase 6: Wage Benchmarks
# ---------------------------------------------------------------------------
class WageBenchmarkOut(BaseModel):
    id: int
    state: str
    activity_slug: str
    activity_label: str
    reported_wage_male: Optional[float] = None
    reported_wage_female: Optional[float] = None
    reported_wage_average: float
    wage_unit: str = "per_day"
    survey_month: str
    survey_year: int
    source_name: str
    source_url: Optional[str] = None
    legal_disclaimer: str
    last_updated_date: date

    model_config = {"from_attributes": True}


class WageBenchmarkQuery(BaseModel):
    state: Optional[str] = None
    activity_slug: Optional[str] = None


# ---------------------------------------------------------------------------
# Phase 7: Consent-Based Contact Requests
# ---------------------------------------------------------------------------
class LabourContactRequestIn(BaseModel):
    worker_id: int
    job_id: Optional[int] = None
    requester_name: str = Field(..., min_length=2, max_length=150)
    requester_phone: str = Field(..., description="Farmer or employer phone number.")
    purpose: Literal["hiring_inquiry", "wage_negotiation", "urgent_labour"] = "hiring_inquiry"
    farm_location: Optional[str] = Field(None, max_length=200)
    work_dates: Optional[str] = Field(None, max_length=100)
    message: Optional[str] = Field(None, max_length=500)

    @field_validator("requester_phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return validate_and_clean_phone(v)


class LabourContactRequestOut(BaseModel):
    id: int
    worker_id: int
    job_id: Optional[int] = None
    requester_name: str
    masked_requester_phone: str
    unmasked_requester_phone: Optional[str] = None
    purpose: str
    farm_location: Optional[str] = None
    work_dates: Optional[str] = None
    message: Optional[str] = None
    status: str  # pending, approved, rejected, expired
    approved_phone_revealed: bool
    unmasked_worker_phone: Optional[str] = None
    whatsapp_url: Optional[str] = None
    expires_at: datetime
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ContactRequestResolutionIn(BaseModel):
    action: Literal["approve", "reject"]
    worker_phone: str  # Worker authenticates resolution via their phone number


# ---------------------------------------------------------------------------
# Phase 7: Job Applications
# ---------------------------------------------------------------------------
class LabourJobApplicationIn(BaseModel):
    applicant_name: str = Field(..., min_length=2, max_length=150)
    applicant_phone: str
    worker_id: Optional[int] = None
    proposed_wage: Optional[float] = None
    wage_unit: str = "per_day"
    group_members_count: int = Field(1, ge=1, le=200)
    message: Optional[str] = Field(None, max_length=500)

    @field_validator("applicant_phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return validate_and_clean_phone(v)


class LabourJobApplicationOut(BaseModel):
    id: int
    job_id: int
    worker_id: Optional[int] = None
    applicant_name: str
    applicant_masked_phone: str
    proposed_wage: Optional[float] = None
    wage_unit: str
    group_members_count: int
    message: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Phase 7: Reports, Moderation, and Account Deletion
# ---------------------------------------------------------------------------
class LabourReportIn(BaseModel):
    target_type: Literal["worker", "job_post", "contractor", "farmer"]
    target_id: int
    reason: Literal["fake_profile", "spam", "non_payment", "unreachable", "abusive_conduct", "wage_dispute", "other"]
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    details: Optional[str] = Field(None, max_length=1000)

    @field_validator("reporter_phone")
    @classmethod
    def clean_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        return validate_and_clean_phone(v)


class LabourReportOut(BaseModel):
    id: int
    target_type: str
    target_id: int
    reason: str
    details: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AccountDeleteIn(BaseModel):
    phone_number: str
    reason: Optional[str] = None
    confirmation_text: str = Field("DELETE MY ACCOUNT", description="Must type 'DELETE MY ACCOUNT' to confirm.")

    @field_validator("phone_number")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return validate_and_clean_phone(v)
