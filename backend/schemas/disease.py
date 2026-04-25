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
