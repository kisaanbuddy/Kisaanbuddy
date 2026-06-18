from __future__ import annotations

import json
import os
import tempfile
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field
from fastapi import APIRouter, status

router = APIRouter()

# ---------------------------------------------------------------------------
# File location — backend/data/reviews.json
# ---------------------------------------------------------------------------
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DATA_DIR = _BACKEND_DIR / "data"
_REVIEWS_FILE = _DATA_DIR / "reviews.json"
_DATA_DIR.mkdir(parents=True, exist_ok=True)

_LOCK = threading.RLock()

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

if not _REVIEWS_FILE.exists():
    with open(_REVIEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(DEFAULT_REVIEWS, f, ensure_ascii=False, indent=2)

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

# ---------------------------------------------------------------------------
# Helper persistence functions
# ---------------------------------------------------------------------------
def load_reviews() -> List[ReviewOut]:
    with _LOCK:
        try:
            if not _REVIEWS_FILE.exists():
                return [ReviewOut(**r) for r in DEFAULT_REVIEWS]
            with open(_REVIEWS_FILE, "r", encoding="utf-8") as f:
                raw = json.load(f)
                return [ReviewOut(**r) for r in raw]
        except Exception:
            return [ReviewOut(**r) for r in DEFAULT_REVIEWS]

def save_review(review: ReviewOut) -> None:
    with _LOCK:
        reviews = load_reviews()
        # Insert new review at the beginning
        reviews.insert(0, review)
        
        # Write atomically via tempfile
        raw_list = [r.dict() for r in reviews]
        fd, temp_path = tempfile.mkstemp(dir=str(_DATA_DIR), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(raw_list, f, ensure_ascii=False, indent=2)
            os.replace(temp_path, str(_REVIEWS_FILE))
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.get("", response_model=List[ReviewOut])
def get_all_reviews():
    """Retrieve all user-submitted reviews and testimonials."""
    return load_reviews()

@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def submit_new_review(payload: ReviewPostIn):
    """Submit a new review or testimonial."""
    new_review = ReviewOut(
        id=str(uuid.uuid4()),
        name=payload.name.strip(),
        location=payload.location.strip(),
        crop=payload.crop.strip(),
        text=payload.text.strip(),
        stars=payload.stars,
        created_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    )
    save_review(new_review)
    return new_review
