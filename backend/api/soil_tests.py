"""Soil test record CRUD API.

All endpoints are scoped to the authenticated farmer.
POST /api/farmer/soil-tests   — record a soil test
GET  /api/farmer/soil-tests   — list soil tests (optionally filtered by field)
PUT  /api/farmer/soil-tests/{id} — update a test record
DELETE /api/farmer/soil-tests/{id} — remove a test record
"""
from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.auth import get_current_user
from db.models import FarmerField, SoilTest, User
from db.session import get_db
from schemas.soil import SoilTestCreate, SoilTestResponse, SoilTestUpdate

router = APIRouter()


def _owned_field(db: Session, user_id: int, field_id: Optional[int]) -> None:
    """Raise 404 if the field doesn't belong to this user."""
    if field_id is None:
        return
    field = db.query(FarmerField).filter(
        FarmerField.id == field_id, FarmerField.user_id == user_id
    ).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")


@router.get("/soil-tests", response_model=List[SoilTestResponse])
def list_soil_tests(
    field_id: Optional[int] = Query(default=None),
    from_date: Optional[date] = Query(default=None),
    to_date: Optional[date] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """List all soil tests for the current user."""
    query = db.query(SoilTest).filter(SoilTest.user_id == current_user.id)
    if field_id is not None:
        _owned_field(db, current_user.id, field_id)
        query = query.filter(SoilTest.field_id == field_id)
    if from_date:
        query = query.filter(SoilTest.test_date >= from_date)
    if to_date:
        query = query.filter(SoilTest.test_date <= to_date)
    return query.order_by(SoilTest.test_date.desc(), SoilTest.id.desc()).all()


@router.post("/soil-tests", response_model=SoilTestResponse, status_code=status.HTTP_201_CREATED)
def create_soil_test(
    test_in: SoilTestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Record a new soil test."""
    _owned_field(db, current_user.id, test_in.field_id)
    soil_test = SoilTest(user_id=current_user.id, **test_in.model_dump())
    db.add(soil_test)
    db.commit()
    db.refresh(soil_test)
    return soil_test


@router.put("/soil-tests/{test_id}", response_model=SoilTestResponse)
def update_soil_test(
    test_id: int,
    test_in: SoilTestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update an existing soil test record."""
    test = db.query(SoilTest).filter(
        SoilTest.id == test_id, SoilTest.user_id == current_user.id
    ).first()
    if not test:
        raise HTTPException(status_code=404, detail="Soil test not found")
    values = test_in.model_dump(exclude_unset=True)
    if "field_id" in values:
        _owned_field(db, current_user.id, values["field_id"])
    for key, value in values.items():
        setattr(test, key, value)
    db.commit()
    db.refresh(test)
    return test


@router.delete("/soil-tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_soil_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a soil test record."""
    test = db.query(SoilTest).filter(
        SoilTest.id == test_id, SoilTest.user_id == current_user.id
    ).first()
    if not test:
        raise HTTPException(status_code=404, detail="Soil test not found")
    db.delete(test)
    db.commit()
