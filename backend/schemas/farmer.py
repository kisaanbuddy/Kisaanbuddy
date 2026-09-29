from pydantic import BaseModel, ConfigDict, Field
from typing import Literal, Optional
from datetime import date, datetime

class FarmerProfileCreate(BaseModel):
    village_name: Optional[str] = None
    block_name: Optional[str] = None
    district_name: Optional[str] = None
    state_name: Optional[str] = None
    experience_years: Optional[int] = Field(default=0, ge=0)
    primary_crop: Optional[str] = None
    land_holding_acres: Optional[float] = Field(default=0.0, ge=0.0)
    has_irrigation: Optional[bool] = False
    has_tractor: Optional[bool] = False

class FarmerProfileResponse(FarmerProfileCreate):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class FarmerFieldCreate(BaseModel):
    field_name: str = Field(..., max_length=255)
    acreage: Optional[float] = Field(default=None, ge=0.0)
    soil_type: Optional[str] = Field(default=None, max_length=100)
    current_crop: Optional[str] = Field(default=None, max_length=100)
    sowing_date: Optional[date] = None
    irrigation_type: Optional[str] = Field(default=None, max_length=100)
    farm_id: Optional[int] = None
    area_unit: Optional[Literal["acre", "hectare", "bigha", "other"]] = "acre"
    location_text: Optional[str] = Field(default=None, max_length=255)
    water_source: Optional[str] = Field(default=None, max_length=100)
    crop_variety: Optional[str] = Field(default=None, max_length=100)
    season: Optional[str] = Field(default=None, max_length=50)
    previous_crop: Optional[str] = Field(default=None, max_length=100)
    expected_harvest: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=3000)
    polygon_geojson: Optional[str] = None  # preserve existing column support

class FarmerFieldUpdate(BaseModel):
    field_name: Optional[str] = Field(default=None, max_length=255)
    acreage: Optional[float] = Field(default=None, ge=0.0)
    soil_type: Optional[str] = Field(default=None, max_length=100)
    current_crop: Optional[str] = Field(default=None, max_length=100)
    sowing_date: Optional[date] = None
    irrigation_type: Optional[str] = Field(default=None, max_length=100)
    farm_id: Optional[int] = None
    area_unit: Optional[Literal["acre", "hectare", "bigha", "other"]] = None
    location_text: Optional[str] = Field(default=None, max_length=255)
    water_source: Optional[str] = Field(default=None, max_length=100)
    crop_variety: Optional[str] = Field(default=None, max_length=100)
    season: Optional[str] = Field(default=None, max_length=50)
    previous_crop: Optional[str] = Field(default=None, max_length=100)
    expected_harvest: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=3000)

class FarmerFieldResponse(BaseModel):
    id: int
    user_id: int
    field_name: Optional[str] = None
    acreage: Optional[float] = None
    soil_type: Optional[str] = None
    current_crop: Optional[str] = None
    sowing_date: Optional[date] = None
    irrigation_type: Optional[str] = None
    polygon_geojson: Optional[str] = None
    farm_id: Optional[int] = None
    area_unit: Optional[str] = "acre"
    location_text: Optional[str] = None
    water_source: Optional[str] = None
    crop_variety: Optional[str] = None
    season: Optional[str] = None
    previous_crop: Optional[str] = None
    expected_harvest: Optional[date] = None
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class FarmCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    location_text: Optional[str] = Field(default=None, max_length=255)
    village_name: Optional[str] = Field(default=None, max_length=100)
    district_name: Optional[str] = Field(default=None, max_length=100)
    state_name: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = Field(default=None, max_length=3000)


class FarmUpdate(FarmCreate):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)


class FarmResponse(FarmCreate):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class FarmActivityCreate(BaseModel):
    field_id: Optional[int] = None
    crop_cycle_id: Optional[int] = None
    activity_date: date
    activity_type: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    category: Literal["activity", "expense", "income"] = "activity"
    amount: Optional[float] = Field(default=None, ge=0)
    quantity: Optional[float] = Field(default=None, ge=0)
    unit: Optional[str] = Field(default=None, max_length=30)
    labour_count: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None, max_length=3000)


class FarmActivityUpdate(BaseModel):
    field_id: Optional[int] = None
    crop_cycle_id: Optional[int] = None
    activity_date: Optional[date] = None
    activity_type: Optional[str] = Field(default=None, min_length=1, max_length=50)
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[Literal["activity", "expense", "income"]] = None
    amount: Optional[float] = Field(default=None, ge=0)
    quantity: Optional[float] = Field(default=None, ge=0)
    unit: Optional[str] = Field(default=None, max_length=30)
    labour_count: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None, max_length=3000)


class FarmActivityResponse(FarmActivityCreate):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
