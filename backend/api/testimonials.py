from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session

from db.session import get_db
from db import models
from api.auth import get_current_user

router = APIRouter()

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class TestimonialPostIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    crop: str = Field(..., min_length=2, max_length=100)
    text: str = Field(..., min_length=5, max_length=1000)
    stars: int = Field(5, ge=1, le=5)

class TestimonialPutIn(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    crop: Optional[str] = Field(None, min_length=2, max_length=100)
    text: Optional[str] = Field(None, min_length=5, max_length=1000)
    stars: Optional[int] = Field(None, ge=1, le=5)
    status: Optional[str] = Field(None, pattern="^(pending|approved|rejected)$")

class TestimonialOut(BaseModel):
    id: str
    name: str
    location: str
    crop: str
    text: str
    stars: int
    status: str
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
async def get_optional_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    """Optional authentication that returns None if user is not authenticated."""
    try:
        return await get_current_user(request, db)
    except Exception:
        return None

def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    """Enforces that the current authenticated user has an Admin role."""
    if user.role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin authentication required.",
        )
    return user

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("", response_model=TestimonialOut, status_code=status.HTTP_201_CREATED)
def submit_testimonial(payload: TestimonialPostIn, db: Session = Depends(get_db)):
    """Public submission of a new testimonial/review. Defaults to pending status."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    new_testimonial = models.Review(
        id=str(uuid.uuid4()),
        name=payload.name.strip(),
        location=payload.location.strip(),
        crop=payload.crop.strip(),
        text=payload.text.strip(),
        stars=payload.stars,
        status="pending",
        created_at=now_str,
        updated_at=now_str
    )
    db.add(new_testimonial)
    db.commit()
    db.refresh(new_testimonial)
    return new_testimonial

@router.get("", response_model=List[TestimonialOut])
def get_testimonials(
    status: Optional[str] = None,
    search: Optional[str] = None,
    user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve testimonials. Public sees only approved; Admin sees all with optional filters."""
    is_admin = user is not None and user.role.lower() == "admin"
    query = db.query(models.Review)

    if not is_admin:
        query = query.filter(models.Review.status == "approved")
    else:
        if status:
            query = query.filter(models.Review.status == status)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Review.name.ilike(search_term)) |
            (models.Review.location.ilike(search_term)) |
            (models.Review.crop.ilike(search_term)) |
            (models.Review.text.ilike(search_term))
        )

    results = query.all()
    # Sort reviews in descending order of creation (newest first)
    results.sort(key=lambda x: x.created_at or "", reverse=True)
    return results

@router.put("/{id}", response_model=TestimonialOut)
def update_testimonial(
    id: str,
    payload: TestimonialPutIn,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Edit testimonial parameters or update moderation status."""
    testimonial = db.query(models.Review).filter(models.Review.id == id).first()
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(testimonial, key, value)

    testimonial.updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    db.commit()
    db.refresh(testimonial)
    return testimonial

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    id: str,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin only: Permanently delete a testimonial."""
    testimonial = db.query(models.Review).filter(models.Review.id == id).first()
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found."
        )
    db.delete(testimonial)
    db.commit()
    return None
