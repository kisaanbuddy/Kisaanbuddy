"""Pydantic schemas for Agricultural Marketplace & Equipment Reference Catalogue.

Record types:
A. EquipmentCatalog: Reference technical specifications from FMTTI / manufacturers.
B. EquipmentListing: Actual machines offered for rent or sale by farmers/dealers.
C. ProduceListing: Actual harvest lots offered by verified farmers/FPOs.
D. MarketPriceRecord: Benchmark mandi price observations from AGMARKNET.
E. MarketplaceListing: Legacy buyer/seller requirements (backward-compatible).
"""
from datetime import date, datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

# Existing legacy types
ListingType = Literal["buy", "sell"]
MarketplaceCategory = Literal[
    "produce",
    "seeds",
    "fertilizer",
    "equipment",
    "wholesale",
    "institutional",
    "crop_protection",
]

# Equipment categories matching requirements
EquipmentCategoryType = Literal[
    "tractors",
    "harvesters",
    "rotavators",
    "seed_drills",
    "cultivators",
    "ploughs",
    "sprayers",
    "threshers",
    "agricultural_trailers",
    "irrigation_equipment",
    "other_implements",
]

EquipmentListingType = Literal["rent", "sale"]
EquipmentCondition = Literal["new", "excellent", "good", "fair"]
EquipmentAvailability = Literal["available", "booked", "under_maintenance", "sold", "inactive"]

ProduceCategory = Literal["cereal", "pulse", "oilseed", "vegetable", "fruit", "cash_crop"]
ProduceAvailability = Literal["available", "under_negotiation", "sold_out", "inactive"]


# ─── Legacy MarketplaceListing Schemas (Preserved) ────────────────────────────

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


# ─── Phase 2 & 3: Equipment Reference Catalogue Schemas ───────────────────────

class EquipmentCatalogCreate(BaseModel):
    manufacturer: str = Field(..., min_length=2, max_length=150)
    brand: str = Field(..., min_length=2, max_length=100)
    model_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=50)
    subcategory: Optional[str] = Field(default=None, max_length=100)
    hp_rating: Optional[float] = Field(default=None, ge=0.0)
    working_width_mm: Optional[float] = Field(default=None, ge=0.0)
    capacity: Optional[str] = Field(default=None, max_length=100)
    fuel_type: Optional[str] = Field(default=None, max_length=50)
    pto_hp: Optional[float] = Field(default=None, ge=0.0)
    pto_rpm: Optional[int] = Field(default=None, ge=0)
    lifting_capacity_kg: Optional[float] = Field(default=None, ge=0.0)
    weight_kg: Optional[float] = Field(default=None, ge=0.0)
    compatible_tractor_hp: Optional[str] = Field(default=None, max_length=50)
    specifications_json: Optional[str] = None
    description: Optional[str] = None
    official_source_url: Optional[str] = None
    source_verification_date: Optional[date] = None
    image_url: Optional[str] = None
    provenance_source: str = Field(..., min_length=2, max_length=255)
    provenance_license: str = Field(..., min_length=2, max_length=255)
    is_verified: bool = True
    is_reference_only: bool = True
    is_active: bool = True


class EquipmentCatalogResponse(EquipmentCatalogCreate):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class EquipmentCatalogFilter(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    min_hp: Optional[float] = None
    max_hp: Optional[float] = None
    search: Optional[str] = None
    page: int = 1
    limit: int = 20


# ─── Phase 3: Equipment Listings (Rent / Sale) Schemas ────────────────────────

class EquipmentListingCreate(BaseModel):
    catalog_id: Optional[int] = None
    listing_type: EquipmentListingType
    title: str = Field(..., min_length=3, max_length=255)
    brand: str = Field(..., min_length=2, max_length=100)
    model_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=50)
    hp_rating: Optional[float] = Field(default=None, ge=0.0)
    condition: EquipmentCondition = "good"
    year_of_manufacture: Optional[int] = Field(default=None, ge=1970, le=2030)
    operating_hours: Optional[float] = Field(default=None, ge=0.0)
    price: float = Field(..., gt=0.0)
    price_unit: str = Field(..., min_length=2, max_length=50)
    security_deposit: Optional[float] = Field(default=None, ge=0.0)
    includes_operator: bool = False
    owner_name: str = Field(..., min_length=2, max_length=150)
    owner_phone: Optional[str] = Field(default=None, max_length=30)
    owner_consent_shared: bool = True
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    tehsil_or_block: Optional[str] = Field(default=None, max_length=100)
    village: Optional[str] = Field(default=None, max_length=150)
    pincode: Optional[str] = Field(default=None, max_length=10)
    notes: Optional[str] = None


class EquipmentListingResponse(EquipmentListingCreate):
    id: int
    user_id: Optional[int] = None
    availability_status: str = "available"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Phase 3: Produce Listings (Direct from Farms) Schemas ────────────────────

class ProduceListingCreate(BaseModel):
    crop_name: str = Field(..., min_length=2, max_length=120)
    variety: Optional[str] = Field(default=None, max_length=100)
    category: ProduceCategory = "cereal"
    quantity: float = Field(..., gt=0.0)
    quantity_unit: str = Field(default="Quintal", min_length=1, max_length=50)
    asking_price: float = Field(..., gt=0.0)
    price_unit: str = Field(default="per Quintal", min_length=1, max_length=50)
    is_negotiable: bool = True
    harvest_date: Optional[date] = None
    expected_dispatch_date: Optional[date] = None
    grade_or_quality: str = Field(default="Grade A FAQ", max_length=100)
    moisture_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    farmer_name: str = Field(..., min_length=2, max_length=150)
    farmer_phone: Optional[str] = Field(default=None, max_length=30)
    contact_consent_verified: bool = True
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    mandi_nearby: Optional[str] = Field(default=None, max_length=120)
    delivery_option: str = Field(default="Farm Gate Pickup", max_length=100)
    verification_status: str = Field(default="verified", max_length=50)
    notes: Optional[str] = None


class ProduceListingResponse(ProduceListingCreate):
    id: int
    user_id: Optional[int] = None
    availability_status: str = "available"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Phase 3: Market Price Record Schemas ─────────────────────────────────────

class MarketPriceResponse(BaseModel):
    id: int
    commodity: str
    variety: Optional[str] = None
    state: str
    district: str
    market_center: str
    arrival_date: date
    arrival_quantity: Optional[float] = None
    arrival_unit: Optional[str] = "Tonnes"
    min_price: float
    max_price: float
    modal_price: float
    source_name: str
    source_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Phase 4 & 6: Import System Schemas ───────────────────────────────────────

class ImportSourceResponse(BaseModel):
    id: int
    source_name: str
    source_slug: str
    source_type: str
    base_url: Optional[str] = None
    auth_type: str
    commercial_reuse_terms: Optional[str] = None
    update_frequency: str
    last_imported_at: Optional[datetime] = None
    records_count: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class ImportLogResponse(BaseModel):
    id: int
    job_id: int
    log_level: str
    record_identifier: Optional[str] = None
    message: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


class ImportJobResponse(BaseModel):
    id: int
    source_slug: str
    target_type: str
    status: str
    records_read: int
    records_inserted: int
    records_updated: int
    records_skipped: int
    error_summary: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    logs: Optional[List[ImportLogResponse]] = None
    model_config = ConfigDict(from_attributes=True)
