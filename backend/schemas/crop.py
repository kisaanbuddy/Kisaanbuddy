"""Crop recommendation schemas."""
from typing import Dict, Any
from pydantic import BaseModel, Field


class CropInput(BaseModel):
    N: float = Field(..., description="Nitrogen content in soil")
    P: float = Field(..., description="Phosphorus content in soil")
    K: float = Field(..., description="Potassium content in soil")
    temperature: float
    humidity: float
    ph: float = Field(..., ge=0, le=14)
    rainfall: float


class CropRecommendation(BaseModel):
    recommended_crop: str
    input_features: Dict[str, Any]
    confidence: float = Field(..., ge=0.0, le=1.0)
