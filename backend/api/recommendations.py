"""Farming recommendations API.

GET    /api/farmer/recommendations           — list recommendations
POST   /api/farmer/recommendations           — create recommendation (admin/internal)
PATCH  /api/farmer/recommendations/{id}/status — update status
DELETE /api/farmer/recommendations/{id}       — delete recommendation
"""
from datetime import datetime, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.auth import get_current_user
from db.models import Recommendation, User
from db.session import get_db
from schemas.recommendation import (
    RecommendationCreate,
    RecommendationResponse,
    RecommendationStatusUpdate,
)

router = APIRouter()


@router.get("/recommendations", response_model=List[RecommendationResponse])
def list_recommendations(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    category: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """List all recommendations for the current farmer."""
    query = db.query(Recommendation).filter(Recommendation.user_id == current_user.id)
    if status_filter:
        query = query.filter(Recommendation.status == status_filter)
    if category:
        query = query.filter(Recommendation.category == category)
    return query.order_by(Recommendation.created_at.desc()).limit(50).all()


@router.post("/recommendations", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
def create_recommendation(
    rec_in: RecommendationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Store a new recommendation for the current farmer."""
    rec = Recommendation(user_id=current_user.id, **rec_in.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.patch("/recommendations/{rec_id}/status", response_model=RecommendationResponse)
def update_recommendation_status(
    rec_id: int,
    body: RecommendationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Mark a recommendation as completed, not_applicable, or postponed."""
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id, Recommendation.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.status = body.status
    rec.status_updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/recommendations/{rec_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recommendation(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a recommendation."""
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id, Recommendation.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    db.delete(rec)
    db.commit()
