from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.auth import get_current_user
from db.session import get_db
from db.models import Farm, FarmerField, User
from schemas.farmer import FarmerFieldCreate, FarmerFieldUpdate, FarmerFieldResponse

router = APIRouter()

@router.get("/fields", response_model=List[FarmerFieldResponse])
def get_fields(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get all fields for the current user."""
    fields = db.query(FarmerField).filter(FarmerField.user_id == current_user.id).all()
    return fields

@router.post("/fields", response_model=FarmerFieldResponse)
def create_field(
    field_in: FarmerFieldCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new field for the current user."""
    if field_in.farm_id is not None:
        farm = db.query(Farm).filter(Farm.id == field_in.farm_id, Farm.user_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found")
    field = FarmerField(user_id=current_user.id, **field_in.model_dump())
    db.add(field)
    db.commit()
    db.refresh(field)
    return field

@router.put("/fields/{id}", response_model=FarmerFieldResponse)
def update_field(
    id: int,
    field_in: FarmerFieldUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update a field for the current user."""
    field = db.query(FarmerField).filter(FarmerField.id == id, FarmerField.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    values = field_in.model_dump(exclude_unset=True)
    if "farm_id" in values and values["farm_id"] is not None:
        farm = db.query(Farm).filter(Farm.id == values["farm_id"], Farm.user_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found")
        
    for var, value in values.items():
        setattr(field, var, value)
        
    db.commit()
    db.refresh(field)
    return field

@router.delete("/fields/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a field for the current user."""
    field = db.query(FarmerField).filter(FarmerField.id == id, FarmerField.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
        
    db.delete(field)
    db.commit()

