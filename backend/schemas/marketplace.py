"""Pydantic schemas for agricultural marketplace (Find Buyers & Sellers)."""
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

ListingType = Literal["buy", "sell"]
MarketplaceCategory = Literal[
    "produce",
    "seeds",
    "fertilizer",
    "equipment",
    "wholesale",
    "institutional",
    "crop_protection"
]


class MarketplaceListingCreate(BaseModel):
    listing_type: ListingType
    category: MarketplaceCategory
    crop_or_item: str = Field(..., min_length=2, max_length=120)
    variety: Optional[str] = Field(default=None, max_length=100)
    quantity: Optional[float] = Field(default=None, ge=0.0)
    quantity_unit: Optional[str] = Field(default="Quintal", max_length=50)
    price: Optional[float] = Field(default=None, ge=0.0)
    price_unit: Optional[str] = Field(default="per Quintal", max_length=50)
    organization_name: str = Field(..., min_length=2, max_length=200)
    contact_person: Optional[str] = Field(default=None, max_length=120)
    contact_phone: Optional[str] = Field(default=None, max_length=30)
    district: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: Optional[str] = Field(default=None, max_length=10)
    verification_status: Optional[str] = "verified"
    delivery_terms: Optional[str] = Field(default="Farm Gate Pickup", max_length=150)
    notes: Optional[str] = None


class MarketplaceListingResponse(MarketplaceListingCreate):
    id: int
    user_id: Optional[int] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
