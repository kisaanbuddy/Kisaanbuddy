import os
import sys
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from api.auth import get_current_user
from db.session import get_db
from db.models import DiseaseDetection, User
from schemas.disease import DiseaseHistoryResponse

# Ensure ML pipelines directory is in python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
pipelines_dir = os.path.join(BASE_DIR, "ml", "platform", "pipelines")
if pipelines_dir not in sys.path:
    sys.path.insert(0, pipelines_dir)

try:
    from inference_engine import predict_disease
except Exception as e:
    predict_disease = None

router = APIRouter()

@router.get("/history", response_model=List[DiseaseHistoryResponse])
def get_disease_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get all disease detections for the current user."""
    detections = (
        db.query(DiseaseDetection)
        .filter(DiseaseDetection.user_id == current_user.id)
        .order_by(desc(DiseaseDetection.detected_at))
        .all()
    )
    return detections


@router.post("/predict")
async def predict_crop_disease(
    file: UploadFile = File(...)
) -> Any:
    """Predict plant disease from an uploaded leaf image."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image (JPEG, PNG, etc.)."
        )
    try:
        contents = await file.read()
        if predict_disease is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML inference engine not initialized."
            )
        result = predict_disease(contents)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Disease prediction failed: {str(exc)}"
        )

