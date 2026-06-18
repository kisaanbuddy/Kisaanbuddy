from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from db.session import get_db
from db import models
from api.auth import get_current_user

router = APIRouter()

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class DiaryEntryIn(BaseModel):
    id: str = Field(..., description="Unique entry ID (UUID/client-side generated)")
    date: str = Field(..., description="ISO date YYYY-MM-DD")
    activity: str = Field(...)
    crop: str = Field(...)
    notes: Optional[str] = None
    imageDataUrl: Optional[str] = None
    weather: Optional[str] = None

class DiaryEntryOut(BaseModel):
    id: str
    date: str
    activity: str
    crop: str
    notes: Optional[str]
    imageDataUrl: Optional[str]
    weather: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=List[DiaryEntryOut])
def get_diary_entries(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve all diary entries for the authenticated user."""
    entries = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == current_user.id
    ).all()
    
    out_entries = []
    for e in entries:
        out_entries.append(DiaryEntryOut(
            id=e.id,
            date=e.date,
            activity=e.activity,
            crop=e.crop,
            notes=e.notes,
            imageDataUrl=e.image_data_url,
            weather=e.weather,
            created_at=e.created_at
        ))
    
    # Sort by creation date descending
    out_entries.sort(key=lambda x: x.created_at, reverse=True)
    return out_entries

@router.post("", response_model=DiaryEntryOut, status_code=status.HTTP_201_CREATED)
def create_diary_entry(
    payload: DiaryEntryIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new diary entry for the authenticated user."""
    existing = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == payload.id).first()
    if existing:
        # If it exists, update it (acts as upsert)
        existing.date = payload.date
        existing.activity = payload.activity
        existing.crop = payload.crop
        existing.notes = payload.notes
        existing.image_data_url = payload.imageDataUrl
        existing.weather = payload.weather
        db.commit()
        db.refresh(existing)
        return DiaryEntryOut(
            id=existing.id,
            date=existing.date,
            activity=existing.activity,
            crop=existing.crop,
            notes=existing.notes,
            imageDataUrl=existing.image_data_url,
            weather=existing.weather,
            created_at=existing.created_at
        )
    
    new_entry = models.DiaryEntry(
        id=payload.id,
        user_id=current_user.id,
        date=payload.date,
        activity=payload.activity,
        crop=payload.crop,
        notes=payload.notes,
        image_data_url=payload.imageDataUrl,
        weather=payload.weather
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return DiaryEntryOut(
        id=new_entry.id,
        date=new_entry.date,
        activity=new_entry.activity,
        crop=new_entry.crop,
        notes=new_entry.notes,
        imageDataUrl=new_entry.image_data_url,
        weather=new_entry.weather,
        created_at=new_entry.created_at
    )

@router.post("/sync", response_model=List[DiaryEntryOut])
def sync_diary_entries(
    payloads: List[DiaryEntryIn],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Sync multiple offline/local diary entries to the database."""
    synced_entries = []
    for p in payloads:
        existing = db.query(models.DiaryEntry).filter(
            models.DiaryEntry.id == p.id
        ).first()
        
        if existing:
            existing.date = p.date
            existing.activity = p.activity
            existing.crop = p.crop
            existing.notes = p.notes
            existing.image_data_url = p.imageDataUrl
            existing.weather = p.weather
            db.commit()
            db.refresh(existing)
            synced_entries.append(existing)
        else:
            new_entry = models.DiaryEntry(
                id=p.id,
                user_id=current_user.id,
                date=p.date,
                activity=p.activity,
                crop=p.crop,
                notes=p.notes,
                image_data_url=p.imageDataUrl,
                weather=p.weather
            )
            db.add(new_entry)
            db.commit()
            db.refresh(new_entry)
            synced_entries.append(new_entry)
            
    out_entries = []
    for e in synced_entries:
        out_entries.append(DiaryEntryOut(
            id=e.id,
            date=e.date,
            activity=e.activity,
            crop=e.crop,
            notes=e.notes,
            imageDataUrl=e.image_data_url,
            weather=e.weather,
            created_at=e.created_at
        ))
    return out_entries

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diary_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a diary entry."""
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diary entry not found"
        )
        
    # Check ownership
    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this diary entry"
        )
        
    db.delete(entry)
    db.commit()
    return None
