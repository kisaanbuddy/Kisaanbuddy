"""Agricultural Marketplace API — Reference Catalogue, Equipment Rental & Farm Sourcing.

Endpoints:
  ─── Reference Catalogue (FMTTI / Manufacturers) ───
  GET  /api/marketplace/catalog/equipment      — list reference machinery specs
  GET  /api/marketplace/catalog/equipment/{id} — get specific reference model
  GET  /api/marketplace/catalog/categories     — list 11 equipment categories
  GET  /api/marketplace/catalog/brands         — list equipment brands

  ─── Equipment Listings (Rent / Sale by Owners) ───
  GET  /api/marketplace/equipment-listings      — list active equipment for rent/sale
  GET  /api/marketplace/equipment-listings/{id} — get listing details
  POST /api/marketplace/equipment-listings      — post equipment for rent/sale
  PATCH/api/marketplace/equipment-listings/{id}/status — update availability

  ─── Produce Listings (Source Directly from Farms) ───
  GET  /api/marketplace/produce-listings        — list verified farmer harvest lots
  GET  /api/marketplace/produce-listings/{id}   — get produce lot details
  POST /api/marketplace/produce-listings        — post farmer produce lot
  PATCH/api/marketplace/produce-listings/{id}/status — update availability

  ─── Market Prices (AGMARKNET Benchmarks) ───
  GET  /api/marketplace/market-prices          — benchmark modal prices for context
  GET  /api/marketplace/sources                — registered data sources & provenance

  ─── Legacy Backward Compatibility ───
  GET  /api/marketplace/listings               — legacy buyer/seller listing
  POST /api/marketplace/listings               — legacy create listing
  GET  /api/marketplace/categories             — legacy categories
"""
from typing import Any, Dict, List, Optional
from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, desc, asc
from sqlalchemy.orm import Session

from api.auth import get_current_user
from db.models import (
    EquipmentCatalog,
    EquipmentListing,
    ImportSource,
    MarketplaceListing,
    MarketPriceRecord,
    ProduceListing,
    User,
)
from db.session import get_db
from schemas.marketplace import (
    EquipmentCatalogResponse,
    EquipmentListingCreate,
    EquipmentListingResponse,
    ImportSourceResponse,
    MarketplaceListingCreate,
    MarketplaceListingResponse,
    MarketPriceResponse,
    ProduceListingCreate,
    ProduceListingResponse,
)

router = APIRouter()


# ─── Reference Equipment Catalogue Endpoints ─────────────────────────────────

@router.get("/catalog/equipment")
def list_equipment_catalog(
    category: Optional[str] = Query(default=None, description="tractors, harvesters, rotavators, seed_drills, etc."),
    brand: Optional[str] = Query(default=None),
    min_hp: Optional[float] = Query(default=None, ge=0.0),
    max_hp: Optional[float] = Query(default=None, ge=0.0),
    search: Optional[str] = Query(default=None, description="Search model or manufacturer"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve verified reference technical specifications for farm machinery."""
    query = db.query(EquipmentCatalog).filter(
        EquipmentCatalog.is_active == True,
        EquipmentCatalog.is_reference_only == True,
    )

    if category and category != "all":
        query = query.filter(EquipmentCatalog.category == category)
    if brand and brand != "all":
        query = query.filter(EquipmentCatalog.brand.ilike(brand))
    if min_hp is not None:
        query = query.filter(EquipmentCatalog.hp_rating >= min_hp)
    if max_hp is not None:
        query = query.filter(EquipmentCatalog.hp_rating <= max_hp)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                EquipmentCatalog.model_name.ilike(s),
                EquipmentCatalog.brand.ilike(s),
                EquipmentCatalog.manufacturer.ilike(s),
                EquipmentCatalog.subcategory.ilike(s),
                EquipmentCatalog.description.ilike(s),
            )
        )

    total = query.count()
    items = (
        query.order_by(EquipmentCatalog.category.asc(), EquipmentCatalog.brand.asc(), EquipmentCatalog.model_name.asc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": [EquipmentCatalogResponse.model_validate(item) for item in items],
    }


@router.get("/catalog/equipment/{item_id}", response_model=EquipmentCatalogResponse)
def get_equipment_catalog_item(item_id: int, db: Session = Depends(get_db)) -> Any:
    """Retrieve detailed specifications and official test provenance for a reference model."""
    item = db.query(EquipmentCatalog).filter(EquipmentCatalog.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment catalogue item not found")
    return EquipmentCatalogResponse.model_validate(item)


@router.get("/catalog/categories")
def get_equipment_categories(db: Session = Depends(get_db)) -> Any:
    """List all 11 equipment categories with count of verified reference models."""
    results = (
        db.query(EquipmentCatalog.category, func.count(EquipmentCatalog.id))
        .filter(EquipmentCatalog.is_active == True)
        .group_by(EquipmentCatalog.category)
        .all()
    )
    return [{"category": row[0], "count": row[1]} for row in results]


@router.get("/catalog/brands")
def get_equipment_brands(db: Session = Depends(get_db)) -> Any:
    """List machinery brands with count of reference models."""
    results = (
        db.query(EquipmentCatalog.brand, func.count(EquipmentCatalog.id))
        .filter(EquipmentCatalog.is_active == True)
        .group_by(EquipmentCatalog.brand)
        .order_by(func.count(EquipmentCatalog.id).desc())
        .all()
    )
    return [{"brand": row[0], "count": row[1]} for row in results]


# ─── Equipment Listings (Rent / Sale) Endpoints ──────────────────────────────

@router.get("/equipment-listings")
def list_equipment_listings(
    listing_type: Optional[str] = Query(default=None, description="rent or sale"),
    category: Optional[str] = Query(default=None),
    brand: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default="available"),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Browse live machinery actively offered for rent or sale by farmers and CHCs."""
    query = db.query(EquipmentListing)

    if status and status != "all":
        query = query.filter(EquipmentListing.availability_status == status)
    if listing_type:
        query = query.filter(EquipmentListing.listing_type == listing_type)
    if category and category != "all":
        query = query.filter(EquipmentListing.category == category)
    if brand and brand != "all":
        query = query.filter(EquipmentListing.brand.ilike(brand))
    if state and state != "all":
        query = query.filter(EquipmentListing.state.ilike(f"%{state}%"))
    if district and district != "all":
        query = query.filter(EquipmentListing.district.ilike(f"%{district}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                EquipmentListing.title.ilike(s),
                EquipmentListing.model_name.ilike(s),
                EquipmentListing.brand.ilike(s),
                EquipmentListing.owner_name.ilike(s),
            )
        )

    total = query.count()
    items = (
        query.order_by(EquipmentListing.created_at.desc(), EquipmentListing.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": [EquipmentListingResponse.model_validate(i) for i in items],
    }


@router.get("/equipment-listings/{item_id}", response_model=EquipmentListingResponse)
def get_equipment_listing(item_id: int, db: Session = Depends(get_db)) -> Any:
    """Retrieve details for an equipment listing."""
    item = db.query(EquipmentListing).filter(EquipmentListing.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment listing not found")
    return EquipmentListingResponse.model_validate(item)


@router.post("/equipment-listings", response_model=EquipmentListingResponse, status_code=status.HTTP_201_CREATED)
def create_equipment_listing(
    payload: EquipmentListingCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Post an actual piece of equipment for rent or sale."""
    item = EquipmentListing(
        **payload.model_dump(),
        availability_status="available",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return EquipmentListingResponse.model_validate(item)


@router.patch("/equipment-listings/{item_id}/status")
def update_equipment_listing_status(
    item_id: int,
    status_value: str = Query(..., pattern="^(available|booked|under_maintenance|sold|inactive)$"),
    db: Session = Depends(get_db),
) -> Any:
    """Update availability status of an equipment listing."""
    item = db.query(EquipmentListing).filter(EquipmentListing.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment listing not found")
    item.availability_status = status_value
    item.updated_at = datetime.utcnow()
    db.commit()
    return {"id": item.id, "availability_status": item.availability_status}


# ─── Produce Listings (Source Directly from Farms) Endpoints ─────────────────

@router.get("/produce-listings")
def list_produce_listings(
    crop_name: Optional[str] = Query(default=None),
    variety: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    min_quantity: Optional[float] = Query(default=None, ge=0.0),
    status: Optional[str] = Query(default="available"),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Browse verified farmer harvest lots offered directly from rural farms."""
    query = db.query(ProduceListing)

    if status and status != "all":
        query = query.filter(ProduceListing.availability_status == status)
    if crop_name and crop_name != "all":
        query = query.filter(ProduceListing.crop_name.ilike(f"%{crop_name}%"))
    if variety and variety != "all":
        query = query.filter(ProduceListing.variety.ilike(f"%{variety}%"))
    if category and category != "all":
        query = query.filter(ProduceListing.category == category)
    if state and state != "all":
        query = query.filter(ProduceListing.state.ilike(f"%{state}%"))
    if district and district != "all":
        query = query.filter(ProduceListing.district.ilike(f"%{district}%"))
    if min_quantity is not None:
        query = query.filter(ProduceListing.quantity >= min_quantity)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ProduceListing.crop_name.ilike(s),
                ProduceListing.variety.ilike(s),
                ProduceListing.farmer_name.ilike(s),
                ProduceListing.district.ilike(s),
            )
        )

    total = query.count()
    items = (
        query.order_by(ProduceListing.created_at.desc(), ProduceListing.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": [ProduceListingResponse.model_validate(i) for i in items],
    }


@router.get("/produce-listings/{item_id}", response_model=ProduceListingResponse)
def get_produce_listing(item_id: int, db: Session = Depends(get_db)) -> Any:
    """Retrieve details for a produce listing."""
    item = db.query(ProduceListing).filter(ProduceListing.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    return ProduceListingResponse.model_validate(item)


@router.post("/produce-listings", response_model=ProduceListingResponse, status_code=status.HTTP_201_CREATED)
def create_produce_listing(
    payload: ProduceListingCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Post an actual harvest batch for direct sale."""
    item = ProduceListing(
        **payload.model_dump(),
        availability_status="available",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ProduceListingResponse.model_validate(item)


@router.patch("/produce-listings/{item_id}/status")
def update_produce_listing_status(
    item_id: int,
    status_value: str = Query(..., pattern="^(available|under_negotiation|sold_out|inactive)$"),
    db: Session = Depends(get_db),
) -> Any:
    """Update availability status of a produce listing."""
    item = db.query(ProduceListing).filter(ProduceListing.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    item.availability_status = status_value
    item.updated_at = datetime.utcnow()
    db.commit()
    return {"id": item.id, "availability_status": item.availability_status}


# ─── Market Prices (AGMARKNET Benchmark Context) ──────────────────────────────

@router.get("/market-prices")
def get_market_prices(
    commodity: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve official AGMARKNET benchmark prices. Provided strictly as market context."""
    query = db.query(MarketPriceRecord)
    if commodity and commodity != "all":
        query = query.filter(MarketPriceRecord.commodity.ilike(f"%{commodity}%"))
    if state and state != "all":
        query = query.filter(MarketPriceRecord.state.ilike(f"%{state}%"))
    if district and district != "all":
        query = query.filter(MarketPriceRecord.district.ilike(f"%{district}%"))

    items = query.order_by(MarketPriceRecord.arrival_date.desc(), MarketPriceRecord.id.desc()).limit(limit).all()
    return [MarketPriceResponse.model_validate(i) for i in items]


# ─── Registered External Sources & Provenance ─────────────────────────────────

@router.get("/sources", response_model=List[ImportSourceResponse])
def get_registered_sources(db: Session = Depends(get_db)) -> Any:
    """List registered external agricultural data sources, legal permissions, and provenance."""
    sources = db.query(ImportSource).all()
    return [ImportSourceResponse.model_validate(s) for s in sources]


# ─── Legacy Backward Compatibility Endpoints ─────────────────────────────────

DEFAULT_BENCHMARK_LISTINGS = [
    {
        "listing_type": "buy",
        "category": "wholesale",
        "crop_or_item": "Wheat",
        "variety": "Sharbati / HD-2967",
        "quantity": 250.0,
        "quantity_unit": "Quintal",
        "price": 2450.0,
        "price_unit": "per Quintal",
        "organization_name": "AgroGrain Processors & Flour Mills",
        "contact_person": "Rajesh Sharma",
        "contact_phone": "+91 98261 44520",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "verification_status": "verified",
        "delivery_terms": "Mandi Delivery or Farm Gate Pickup",
        "notes": "Grade A dry grain with moisture < 12%. Immediate payment via RTGS/NEFT.",
    },
    {
        "listing_type": "buy",
        "category": "institutional",
        "crop_or_item": "Mushroom",
        "variety": "Button (Agaricus bisporus)",
        "quantity": 15.0,
        "quantity_unit": "Quintal",
        "price": 140.0,
        "price_unit": "per Kg",
        "organization_name": "FreshHarvest Agro Foods & Hotels",
        "contact_person": "Pooja Verma",
        "contact_phone": "+91 94250 88912",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "verification_status": "verified",
        "delivery_terms": "Cold-chain Pickup from Farm",
        "notes": "Daily or alternate-day fresh harvest required. Firm contracts for 3+ months.",
    },
]


def _seed_legacy_listings_if_empty(db: Session) -> None:
    try:
        count = db.query(MarketplaceListing).count()
        if count == 0:
            for item in DEFAULT_BENCHMARK_LISTINGS:
                db.add(MarketplaceListing(**item))
            db.commit()
    except Exception:
        db.rollback()


@router.get("/listings", response_model=List[MarketplaceListingResponse])
def list_legacy_listings(
    listing_type: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    crop_or_item: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Legacy marketplace listings endpoint (preserved for backward compatibility)."""
    _seed_legacy_listings_if_empty(db)
    query = db.query(MarketplaceListing).filter(MarketplaceListing.is_active == True)

    if listing_type:
        query = query.filter(MarketplaceListing.listing_type == listing_type)
    if category:
        query = query.filter(MarketplaceListing.category == category)
    if crop_or_item:
        query = query.filter(MarketplaceListing.crop_or_item.ilike(f"%{crop_or_item}%"))
    if state:
        query = query.filter(MarketplaceListing.state.ilike(f"%{state}%"))
    if district:
        query = query.filter(MarketplaceListing.district.ilike(f"%{district}%"))

    return query.order_by(MarketplaceListing.created_at.desc(), MarketplaceListing.id.desc()).limit(limit).all()


@router.post("/listings", response_model=MarketplaceListingResponse, status_code=status.HTTP_201_CREATED)
def create_legacy_listing(
    listing_in: MarketplaceListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Legacy create listing endpoint."""
    listing = MarketplaceListing(user_id=current_user.id, **listing_in.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get("/categories")
def get_legacy_categories() -> List[str]:
    return [
        "produce",
        "seeds",
        "fertilizer",
        "equipment",
        "wholesale",
        "institutional",
        "crop_protection",
    ]
