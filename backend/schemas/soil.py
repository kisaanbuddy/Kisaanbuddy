"""Pydantic schemas for soil test records."""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime


class SoilTestCreate(BaseModel):
    field_id: Optional[int] = None
    test_date: date
    lab_name: Optional[str] = Field(default=None, max_length=150)
    soil_type: Optional[str] = Field(default=None, max_length=100)
    soil_ph: Optional[float] = Field(default=None, ge=0.0, le=14.0)
    nitrogen_kg_ha: Optional[float] = Field(default=None, ge=0.0)
    phosphorus_kg_ha: Optional[float] = Field(default=None, ge=0.0)
    potassium_kg_ha: Optional[float] = Field(default=None, ge=0.0)
    organic_carbon_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    ec_ds_m: Optional[float] = Field(default=None, ge=0.0)
    is_verified: Optional[bool] = False
    notes: Optional[str] = Field(default=None, max_length=3000)


class SoilTestUpdate(BaseModel):
    field_id: Optional[int] = None
    test_date: Optional[date] = None
    lab_name: Optional[str] = Field(default=None, max_length=150)
    soil_type: Optional[str] = Field(default=None, max_length=100)
    soil_ph: Optional[float] = Field(default=None, ge=0.0, le=14.0)
    nitrogen_kg_ha: Optional[float] = Field(default=None, ge=0.0)
    phosphorus_kg_ha: Optional[float] = Field(default=None, ge=0.0)
    potassium_kg_ha: Optional[float] = Field(default=None, ge=0.0)
    organic_carbon_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    ec_ds_m: Optional[float] = Field(default=None, ge=0.0)
    is_verified: Optional[bool] = None
    notes: Optional[str] = Field(default=None, max_length=3000)


class SoilTestResponse(SoilTestCreate):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
