from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from db import models

router = APIRouter()

# Default testimonials to pre-populate the review list
DEFAULT_REVIEWS = [
    {
        "id": "default-1",
        "name": "Ramesh Patel",
        "location": "Rajkot, Gujarat",
        "crop": "Cotton Farmer",
        "text": "The Crop Predictor identified Cotton was optimal for my low-nitrogen field and suggested the exact fertilizer ratio. My crop yield grew by 35% this season.",
        "stars": 5,
        "created_at": "2026-06-18T06:00:00Z"
    },
    {
        "id": "default-2",
        "name": "Suresh Gowda",
        "location": "Kolar, Karnataka",
        "crop": "Tomato Grower",
        "text": "The leaf disease detector saved my crop. I photographed black spots on my tomato leaves, diagnosed early blight in 2 seconds, and applied the organic neem recommendations.",
        "stars": 5,
        "created_at": "2026-06-18T06:10:00Z"
    },
    {
        "id": "default-3",
        "name": "Rajesh Kumar",
        "location": "Agra, Uttar Pradesh",
        "crop": "Potato Cultivator",
        "text": "Mandi price target notifications allowed me to track Agra rates easily. I got an SMS alert when potato crossed ₹1,900 and sold at maximum profit.",
        "stars": 5,
        "created_at": "2026-06-18T06:20:00Z"
    }
]

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class ReviewPostIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    crop: str = Field(..., min_length=2, max_length=100)
    text: str = Field(..., min_length=5, max_length=1000)
    stars: int = Field(5, ge=1, le=5)

class ReviewOut(BaseModel):
    id: str
    name: str
    location: str
    crop: str
    text: str
    stars: int
    created_at: str

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.get("", response_model=List[ReviewOut])
def get_all_reviews(db: Session = Depends(get_db)):
    """Retrieve all user-submitted reviews and testimonials from the database."""
    db_reviews = db.query(models.Review).all()
    if not db_reviews:
        # Pre-populate with default reviews
        for r in DEFAULT_REVIEWS:
            new_r = models.Review(
                id=r["id"],
                name=r["name"],
                location=r["location"],
                crop=r["crop"],
                text=r["text"],
                stars=r["stars"],
                created_at=r["created_at"]
            )
            db.add(new_r)
        db.commit()
        db_reviews = db.query(models.Review).all()
    
    # Sort reviews in descending order of creation
    db_reviews.sort(key=lambda x: x.created_at, reverse=True)
    return db_reviews

@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def submit_new_review(payload: ReviewPostIn, db: Session = Depends(get_db)):
    """Submit a new review or testimonial and save to database."""
    new_review = models.Review(
        id=str(uuid.uuid4()),
        name=payload.name.strip(),
        location=payload.location.strip(),
        crop=payload.crop.strip(),
        text=payload.text.strip(),
        stars=payload.stars,
        created_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review
