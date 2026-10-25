"""Pydantic schemas for Farmer-First Reviews & Suggestions."""
from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


VALID_FEEDBACK_TYPES = {"positive", "improvement", "issue", "idea", "help", "quick_review"}
VALID_CATEGORIES = {"mandi", "weather", "disease", "marketplace", "workers", "schemes", "general"}
VALID_STATUSES = {"received", "under_review", "planned", "completed", "declined"}
VALID_PRIORITIES = {"low", "normal", "high", "urgent"}
VALID_QUICK_RATINGS = {"helpful", "neutral", "unhelpful"}


class FarmerFeedbackCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    feedback_type: str = Field(..., pattern="^(positive|improvement|issue|idea|help|quick_review)$")
    category: str = Field(default="general", max_length=50)
    guided_option: Optional[str] = Field(None, max_length=120)
    quick_rating: Optional[str] = Field(None, pattern="^(helpful|neutral|unhelpful)$")
    content_text: Optional[str] = Field(None, max_length=2000)
    language: str = Field(default="en", max_length=10)
    source_page: Optional[str] = Field(None, max_length=255)
    contact_consent: bool = Field(default=False)
    contact_info: Optional[str] = Field(None, max_length=100)
    audio_duration_seconds: Optional[int] = Field(None, ge=0, le=300)


class QuickReviewCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    quick_rating: str = Field(..., pattern="^(helpful|neutral|unhelpful)$")
    category: str = Field(default="general", max_length=50)
    source_page: Optional[str] = Field(None, max_length=255)
    language: str = Field(default="en", max_length=10)
    guided_option: Optional[str] = Field(None, max_length=120)


class FarmerFeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    feedback_ref: str
    feedback_type: str
    category: str
    status: str
    created_at: datetime
    message: str


class FarmerFeedbackAdminDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    feedback_ref: str
    feedback_type: str
    category: str
    quick_rating: Optional[str] = None
    guided_option: Optional[str] = None
    content_text: Optional[str] = None
    has_audio: bool
    audio_duration_seconds: Optional[int] = None
    audio_mimetype: Optional[str] = None
    has_image: bool
    image_mimetype: Optional[str] = None
    language: str
    source_page: Optional[str] = None
    user_id: Optional[int] = None
    is_anonymous: bool
    contact_consent: bool
    contact_info: Optional[str] = None
    status: str
    priority: str
    internal_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    is_spam: bool
    is_public_showcase: bool
    public_improvement_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class FarmerFeedbackListResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[FarmerFeedbackAdminDetail]


class FarmerFeedbackAdminUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: Optional[str] = Field(None, pattern="^(received|under_review|planned|completed|declined)$")
    priority: Optional[str] = Field(None, pattern="^(low|normal|high|urgent)$")
    internal_notes: Optional[str] = Field(None, max_length=5000)
    assigned_to: Optional[str] = Field(None, max_length=100)
    is_spam: Optional[bool] = None
    is_public_showcase: Optional[bool] = None
    public_improvement_summary: Optional[str] = Field(None, max_length=2000)


class PublicImprovementItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    feedback_ref: str
    category: str
    feedback_type: str
    guided_option: Optional[str] = None
    improvement_summary: str
    status: str
    created_at: datetime
    updated_at: datetime
