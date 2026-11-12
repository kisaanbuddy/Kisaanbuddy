"""Farmer-owned farm context and persistent Khet Diary APIs.

All reads and writes are scoped through the authenticated user.  The router
does not manufacture weather, price, or advisory data; it only returns the
farmer's saved operational context and ledger entries.
"""
from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.auth import get_current_user
from db.models import Farm, FarmActivity, FarmerField, User
from db.session import get_db
from schemas.farmer import (
    FarmActivityCreate, FarmActivityResponse, FarmActivityUpdate,
    FarmCreate, FarmResponse, FarmUpdate, FarmerFieldResponse,
)

router = APIRouter()


def _owned_field(db: Session, user_id: int, field_id: Optional[int]) -> Optional[FarmerField]:
    if field_id is None:
        return None
    field = db.query(FarmerField).filter(
        FarmerField.id == field_id, FarmerField.user_id == user_id
    ).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@router.get("/farms", response_model=List[FarmResponse])
def list_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Any:
    return db.query(Farm).filter(Farm.user_id == current_user.id).order_by(Farm.name.asc()).all()


@router.post("/farms", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    farm_in: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Any:
    farm = Farm(user_id=current_user.id, **farm_in.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.put("/farms/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: int, farm_in: FarmUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Any:
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    for key, value in farm_in.model_dump(exclude_unset=True).items():
        setattr(farm, key, value)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("/context")
def farm_context(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Any:
    """Small shared context payload for the dashboard, assistant, and forms."""
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).order_by(Farm.name.asc()).all()
    fields = db.query(FarmerField).filter(FarmerField.user_id == current_user.id).order_by(FarmerField.field_name.asc()).all()
    return {
        "farms": [FarmResponse.model_validate(f).model_dump(mode="json") for f in farms],
        "fields": [FarmerFieldResponse.model_validate(f).model_dump(mode="json") for f in fields],
        "has_farm_context": bool(farms or fields),
    }


@router.get("/daily-briefing")
async def daily_farm_briefing(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Generate personalized daily morning farm briefing powered by Google Gemini."""
    fields = db.query(FarmerField).filter(FarmerField.user_id == current_user.id).all()
    crops_summary = [
        f"Field: {f.field_name}, Crop: {f.current_crop or 'General'}, Variety: {f.crop_variety or 'N/A'}, Soil: {f.soil_type or 'N/A'}, Irrigation: {f.irrigation_type or 'N/A'}"
        for f in fields
    ]

    lang = current_user.language or "hi"
    briefing = {
        "farmer_name": current_user.name or "Kisaan",
        "date": date.today().isoformat(),
        "crop_count": len(fields),
        "primary_action": "Inspect crop foliage for moisture stress and early pest symptoms.",
        "growth_stage_note": "Ensure timely weeding and balanced nutrition during vegetative stage.",
        "weather_watch": "Check today's local weather before planning fertilizer or pesticide sprays.",
        "ai_powered": False,
    }

    from services.chat.gemini_service import is_gemini_configured, generate_with_retry, get_model_chain
    import json

    if is_gemini_configured() and fields:
        prompt = (
            f"You are the KisaanBuddy Personal Farm Intelligence Advisor.\n"
            f"Farmer: {current_user.name or 'Farmer'}\n"
            f"Language: {lang}\n"
            f"Farmer Fields & Crops:\n" + "\n".join(crops_summary) + "\n\n"
            "Generate a concise, encouraging daily morning briefing for the farm dashboard.\n"
            "Return strict JSON with keys:\n"
            "{\n"
            '  "greeting": "Warm greeting with farmer name in requested language",\n'
            '  "primary_action": "Single most important task to do today",\n'
            '  "growth_stage_note": "Brief agronomic tip for their current crops",\n'
            '  "weather_watch": "Safety or spray consideration for today",\n'
            '  "quote_of_the_day": "Inspiring agricultural proverb / shloka / positive note"\n'
            "}"
        )
        try:
            resp, model = await generate_with_retry(
                contents=prompt,
                feature="daily_briefing",
                models=get_model_chain(for_vision=False),
                temperature=0.3,
                max_output_tokens=500,
                response_mime_type="application/json",
            )
            raw = (getattr(resp, "text", "") or "").strip()
            data = json.loads(raw)
            briefing.update(data)
            briefing["ai_powered"] = True
            briefing["ai_model"] = model
        except Exception as e:
            pass

    return briefing



@router.get("/activities", response_model=List[FarmActivityResponse])
def list_activities(
    field_id: Optional[int] = Query(default=None),
    category: Optional[str] = Query(default=None, pattern="^(activity|expense|income)$"),
    from_date: Optional[date] = Query(default=None),
    to_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    query = db.query(FarmActivity).filter(FarmActivity.user_id == current_user.id)
    if field_id is not None:
        _owned_field(db, current_user.id, field_id)
        query = query.filter(FarmActivity.field_id == field_id)
    if category:
        query = query.filter(FarmActivity.category == category)
    if from_date:
        query = query.filter(FarmActivity.activity_date >= from_date)
    if to_date:
        query = query.filter(FarmActivity.activity_date <= to_date)
    return query.order_by(FarmActivity.activity_date.desc(), FarmActivity.id.desc()).all()


@router.post("/activities", response_model=FarmActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_in: FarmActivityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Any:
    _owned_field(db, current_user.id, activity_in.field_id)
    activity = FarmActivity(user_id=current_user.id, **activity_in.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/activities/{activity_id}", response_model=FarmActivityResponse)
def update_activity(
    activity_id: int, activity_in: FarmActivityUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Any:
    activity = db.query(FarmActivity).filter(
        FarmActivity.id == activity_id, FarmActivity.user_id == current_user.id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    values = activity_in.model_dump(exclude_unset=True)
    if "field_id" in values:
        _owned_field(db, current_user.id, values["field_id"])
    for key, value in values.items():
        setattr(activity, key, value)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    activity = db.query(FarmActivity).filter(
        FarmActivity.id == activity_id, FarmActivity.user_id == current_user.id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    db.delete(activity)
    db.commit()
