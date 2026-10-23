"""Pydantic schemas for AI farming recommendations."""
from pydantic import BaseModel, ConfigDict, Field
from typing import Literal, Optional
from datetime import datetime

RecommendationStatus = Literal["pending", "completed", "not_applicable", "postponed"]
RecommendationCategory = Literal["irrigation", "fertilizer", "pest", "disease", "harvest", "next_season", "general"]


class RecommendationCreate(BaseModel):
    field_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=255)
    explanation: str = Field(..., min_length=1)
    crop_name: Optional[str] = Field(default=None, max_length=100)
    reason: Optional[str] = None
    data_used: Optional[str] = None  # JSON string
    recommended_action: str = Field(..., min_length=1)
    date_window: Optional[str] = Field(default=None, max_length=100)
    confidence: Optional[str] = Field(default=None, max_length=50)
    source: Optional[str] = Field(default=None, max_length=255)
    category: RecommendationCategory = "general"
    status: RecommendationStatus = "pending"


class RecommendationStatusUpdate(BaseModel):
    status: RecommendationStatus


class RecommendationResponse(RecommendationCreate):
    id: int
    user_id: int
    status_updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
