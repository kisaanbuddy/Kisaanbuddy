"""Agricultural Marketplace & Complete Mandi Buy/Sell Trade Hub API.

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

  ─── Produce Listings / Sell Offers (Farmers & FPOs) ───
  GET  /api/marketplace/produce-listings        — list verified farmer harvest lots
  GET  /api/marketplace/produce-listings/{id}   — get produce lot details
  POST /api/marketplace/produce-listings        — post farmer produce lot
  PATCH/api/marketplace/produce-listings/{id}/confirm — confirm stock & price
  PATCH/api/marketplace/produce-listings/{id}/status  — update availability

  ─── Buyer Requirements (Dedicated Section) ───
  GET  /api/marketplace/buyer-requirements      — list verified purchase requirements
  GET  /api/marketplace/buyer-requirements/{id} — get buyer requirement details
  POST /api/marketplace/buyer-requirements      — post purchase requirement
  PATCH/api/marketplace/buyer-requirements/{id}/status — update status (active, fulfilled, cancelled)

  ─── Government Procurement (MSP Centres & Seasons) ───
  GET  /api/marketplace/procurement             — list official MSP procurement centres

  ─── Market Prices (AGMARKNET Benchmarks) ───
  GET  /api/marketplace/market-prices          — benchmark modal prices for context
  POST /api/marketplace/market-prices/refresh  — refresh price intelligence from data.gov.in
  GET  /api/marketplace/sources                — registered data sources & provenance (7 sources)

  ─── Buy/Sell Transaction Flow ───
  POST /api/marketplace/inquiries               — submit quotation or trade inquiry
  GET  /api/marketplace/inquiries               — list inquiries sent / received
  PATCH/api/marketplace/inquiries/{id}/status   — update inquiry status
  POST /api/marketplace/reports                 — report suspicious or misleading listing
  GET  /api/marketplace/reports                 — list reports (admin audit)
  PATCH/api/marketplace/reports/{id}            — resolve report

  ─── Legacy Backward Compatibility ───
  GET  /api/marketplace/listings               — legacy buyer/seller listing
  POST /api/marketplace/listings               — legacy create listing
  GET  /api/marketplace/categories             — legacy categories
"""
from typing import Any, Dict, List, Optional
from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_, desc, asc
from sqlalchemy.orm import Session

from api.auth import get_current_user
from db.models import (
    BuyerRequirement,
    EquipmentCatalog,
    EquipmentListing,
    GovernmentProcurement,
    ImportSource,
    ListingReport,
    MarketplaceListing,
    MarketPriceRecord,
    ProduceListing,
    TradeInquiry,
    User,
)
from db.session import get_db
from schemas.marketplace import (
    BuyerRequirementCreate,
    BuyerRequirementResponse,
    EquipmentCatalogResponse,
    EquipmentListingCreate,
    EquipmentListingResponse,
    GovernmentProcurementResponse,
    ImportSourceResponse,
    ListingReportCreate,
    ListingReportResponse,
    MarketplaceListingCreate,
    MarketplaceListingResponse,
    MarketPriceResponse,
    ProduceListingCreate,
    ProduceListingResponse,
    TradeInquiryCreate,
    TradeInquiryResponse,
)
from services.marketplace_import.agmarknet_importer import AgmarknetPriceImporter
from services.marketplace_import.initial_catalog_data import (
    INITIAL_BUYER_REQUIREMENTS,
    INITIAL_GOVERNMENT_PROCUREMENT,
    INITIAL_MARKET_PRICES,
    INITIAL_PRODUCE_LISTINGS,
)

router = APIRouter()


def mask_phone(phone: Optional[str]) -> Optional[str]:
    """Mask phone numbers to prevent public scraping while preserving verification confidence."""
    if not phone:
        return None
    clean = str(phone).strip()
    if len(clean) <= 6:
        return clean[:2] + "****"
    return clean[:6] + " ****" + clean[-2:]


def check_stale(arr_date: Optional[date]) -> tuple[bool, Optional[str]]:
    """Determine whether reported market price data is stale (>48h old)."""
    if not arr_date:
        return True, "Reporting date unknown. Verify current mandi rates locally."
    today = date.today()
    age_days = (today - arr_date).days
    if age_days > 2:
        return True, f"Reported on {arr_date.isoformat()} — Stale reference data ({age_days} days old). Verify locally before trading."
    return False, None


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Extract authenticated user if session cookie or bearer token exists, without rejecting unauthenticated users."""
    token = request.cookies.get("session_token")
    if not token:
        auth_hdr = request.headers.get("authorization", "")
        if auth_hdr.lower().startswith("bearer "):
            token = auth_hdr[7:].strip()
    if not token:
        return None
    try:
        from core.security import decode_access_token
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            return None
        user_id = int(payload["sub"])
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    except Exception:
        return None


# ─── Reference Equipment Catalogue Endpoints ─────────────────────────────────

@router.get("/catalog/equipment")
def list_equipment_catalog(
    category: Optional[str] = Query(default=None, description="tractors, harvesters, rotavators, seed_drills, etc."),
    brand: Optional[str] = Query(default=None),
    supplier: Optional[str] = Query(default=None, description="e.g. MachinePoint, FMTTI"),
    min_hp: Optional[float] = Query(default=None, ge=0.0),
    max_hp: Optional[float] = Query(default=None, ge=0.0),
    search: Optional[str] = Query(default=None, description="Search model or manufacturer"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=24, ge=1, le=250),
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
    if supplier and supplier != "all":
        query = query.filter(EquipmentCatalog.supplier_name.ilike(f"%{supplier}%"))
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


# ─── Produce Listings / Sell Offers (Direct from Rural Farms) ─────────────────

@router.get("/produce-listings")
def list_produce_listings(
    crop_name: Optional[str] = Query(default=None),
    variety: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    min_quantity: Optional[float] = Query(default=None, ge=0.0),
    max_price: Optional[float] = Query(default=None, ge=0.0),
    status: Optional[str] = Query(default="available"),
    search: Optional[str] = Query(default=None),
    sort_by: str = Query(default="date", pattern="^(date|price|quantity|crop)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Browse verified farmer harvest lots offered directly from rural farms (Sell Offers)."""
    # Auto-seed initial produce listings if none exist
    if db.query(ProduceListing).count() == 0:
        for pr in INITIAL_PRODUCE_LISTINGS:
            db.add(ProduceListing(**pr))
        db.commit()

    query = db.query(ProduceListing)

    if status and status != "all":
        query = query.filter(ProduceListing.availability_status == status)
    if crop_name and crop_name != "all":
        query = query.filter(ProduceListing.crop_name.ilike(f"%{crop_name.strip()}%"))
    if variety and variety != "all":
        query = query.filter(ProduceListing.variety.ilike(f"%{variety.strip()}%"))
    if category and category != "all":
        query = query.filter(ProduceListing.category == category)
    if state and state != "all":
        query = query.filter(ProduceListing.state.ilike(f"%{state.strip()}%"))
    if district and district != "all":
        query = query.filter(ProduceListing.district.ilike(f"%{district.strip()}%"))
    if min_quantity is not None:
        query = query.filter(ProduceListing.quantity >= min_quantity)
    if max_price is not None:
        query = query.filter(ProduceListing.asking_price <= max_price)
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

    # Sorting
    if sort_by == "price":
        order_col = ProduceListing.asking_price
    elif sort_by == "quantity":
        order_col = ProduceListing.quantity
    elif sort_by == "crop":
        order_col = ProduceListing.crop_name
    else:
        order_col = ProduceListing.created_at

    if sort_order == "asc":
        query = query.order_by(order_col.asc(), ProduceListing.id.asc())
    else:
        query = query.order_by(order_col.desc(), ProduceListing.id.desc())

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    results = []
    for i in items:
        resp = ProduceListingResponse.model_validate(i)
        resp.farmer_phone_masked = mask_phone(i.farmer_phone)
        results.append(resp)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": results,
    }


@router.get("/produce-listings/{item_id}", response_model=ProduceListingResponse)
def get_produce_listing(item_id: int, db: Session = Depends(get_db)) -> Any:
    """Retrieve details for a produce listing."""
    item = db.query(ProduceListing).filter(ProduceListing.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    resp = ProduceListingResponse.model_validate(item)
    resp.farmer_phone_masked = mask_phone(item.farmer_phone)
    return resp


@router.post("/produce-listings", response_model=ProduceListingResponse, status_code=status.HTTP_201_CREATED)
def create_produce_listing(
    payload: ProduceListingCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Post an actual harvest batch for direct sale (Sell Offer)."""
    item = ProduceListing(
        **payload.model_dump(),
        availability_status="available",
        last_confirmation_date=date.today(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    resp = ProduceListingResponse.model_validate(item)
    resp.farmer_phone_masked = mask_phone(item.farmer_phone)
    return resp


@router.patch("/produce-listings/{item_id}/confirm")
def confirm_produce_listing_stock(item_id: int, db: Session = Depends(get_db)) -> Any:
    """Seller action: Confirm stock and price validity (updates last_confirmation_date)."""
    item = db.query(ProduceListing).filter(ProduceListing.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    item.last_confirmation_date = date.today()
    item.updated_at = datetime.utcnow()
    db.commit()
    return {
        "id": item.id,
        "confirmed": True,
        "last_confirmation_date": item.last_confirmation_date.isoformat(),
        "message": "Stock and price confirmed successfully.",
    }


@router.patch("/produce-listings/{item_id}/status")
def update_produce_listing_status(
    item_id: int,
    status_value: str = Query(..., pattern="^(available|under_negotiation|sold_out|inactive|flagged)$"),
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


# ─── Buyer Requirements (Dedicated Section) ──────────────────────────────────

@router.get("/buyer-requirements")
def list_buyer_requirements(
    commodity: Optional[str] = Query(default=None),
    variety: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    min_quantity: Optional[float] = Query(default=None, ge=0.0),
    max_price: Optional[float] = Query(default=None, ge=0.0),
    status: Optional[str] = Query(default="active"),
    search: Optional[str] = Query(default=None),
    sort_by: str = Query(default="expiry", pattern="^(expiry|date|price|quantity|commodity)$"),
    sort_order: str = Query(default="asc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Browse dedicated buyer purchase requirements from food processors, mills, and FPOs."""
    # Auto-seed initial buyer requirements if empty
    if db.query(BuyerRequirement).count() == 0:
        for br in INITIAL_BUYER_REQUIREMENTS:
            db.add(BuyerRequirement(**br))
        db.commit()

    query = db.query(BuyerRequirement)
    today = date.today()

    if status and status != "all":
        query = query.filter(BuyerRequirement.status == status)
    if commodity and commodity != "all":
        query = query.filter(BuyerRequirement.commodity.ilike(f"%{commodity.strip()}%"))
    if variety and variety != "all":
        query = query.filter(BuyerRequirement.variety.ilike(f"%{variety.strip()}%"))
    if state and state != "all":
        query = query.filter(BuyerRequirement.state.ilike(f"%{state.strip()}%"))
    if district and district != "all":
        query = query.filter(BuyerRequirement.district.ilike(f"%{district.strip()}%"))
    if min_quantity is not None:
        query = query.filter(BuyerRequirement.required_quantity >= min_quantity)
    if max_price is not None:
        query = query.filter(
            or_(
                BuyerRequirement.expected_price <= max_price,
                BuyerRequirement.expected_price_max <= max_price,
            )
        )
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                BuyerRequirement.commodity.ilike(s),
                BuyerRequirement.variety.ilike(s),
                BuyerRequirement.buyer_name.ilike(s),
                BuyerRequirement.district.ilike(s),
            )
        )

    # Sorting
    if sort_by == "expiry":
        order_col = BuyerRequirement.offer_expiry_date
    elif sort_by == "price":
        order_col = BuyerRequirement.expected_price
    elif sort_by == "quantity":
        order_col = BuyerRequirement.required_quantity
    elif sort_by == "commodity":
        order_col = BuyerRequirement.commodity
    else:
        order_col = BuyerRequirement.created_at

    if sort_order == "asc":
        query = query.order_by(order_col.asc(), BuyerRequirement.id.asc())
    else:
        query = query.order_by(order_col.desc(), BuyerRequirement.id.desc())

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    results = []
    for item in items:
        resp = BuyerRequirementResponse.model_validate(item)
        resp.is_expired = item.offer_expiry_date < today
        resp.contact_phone_masked = mask_phone(item.contact_phone)
        results.append(resp)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": results,
    }


@router.get("/buyer-requirements/{item_id}", response_model=BuyerRequirementResponse)
def get_buyer_requirement(item_id: int, db: Session = Depends(get_db)) -> Any:
    """Retrieve details for a buyer requirement."""
    item = db.query(BuyerRequirement).filter(BuyerRequirement.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Buyer requirement not found")
    resp = BuyerRequirementResponse.model_validate(item)
    resp.is_expired = item.offer_expiry_date < date.today()
    resp.contact_phone_masked = mask_phone(item.contact_phone)
    return resp


@router.post("/buyer-requirements", response_model=BuyerRequirementResponse, status_code=status.HTTP_201_CREATED)
def create_buyer_requirement(
    payload: BuyerRequirementCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Post an actual buyer purchase requirement."""
    item = BuyerRequirement(
        **payload.model_dump(),
        status="active",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    resp = BuyerRequirementResponse.model_validate(item)
    resp.contact_phone_masked = mask_phone(item.contact_phone)
    return resp


@router.patch("/buyer-requirements/{item_id}/status")
def update_buyer_requirement_status(
    item_id: int,
    status_value: str = Query(..., pattern="^(active|fulfilled|cancelled|expired)$"),
    db: Session = Depends(get_db),
) -> Any:
    """Update status of a buyer requirement."""
    item = db.query(BuyerRequirement).filter(BuyerRequirement.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Buyer requirement not found")
    item.status = status_value
    item.updated_at = datetime.utcnow()
    db.commit()
    return {"id": item.id, "status": item.status}


# ─── Government Procurement (MSP Centres & Seasons) ───────────────────────────

@router.get("/procurement")
def list_government_procurements(
    crop_name: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    season: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Browse verified official government MSP procurement centres, schedules, and state portals."""
    # Auto-seed initial procurement records if empty
    if db.query(GovernmentProcurement).count() == 0:
        for gp in INITIAL_GOVERNMENT_PROCUREMENT:
            db.add(GovernmentProcurement(**gp))
        db.commit()

    query = db.query(GovernmentProcurement)

    if crop_name and crop_name != "all":
        query = query.filter(GovernmentProcurement.crop_name.ilike(f"%{crop_name.strip()}%"))
    if state and state != "all":
        query = query.filter(GovernmentProcurement.state.ilike(f"%{state.strip()}%"))
    if district and district != "all":
        query = query.filter(GovernmentProcurement.district.ilike(f"%{district.strip()}%"))
    if season and season != "all":
        query = query.filter(GovernmentProcurement.procurement_season.ilike(f"%{season.strip()}%"))
    if status and status != "all":
        query = query.filter(GovernmentProcurement.status == status)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                GovernmentProcurement.crop_name.ilike(s),
                GovernmentProcurement.procurement_center.ilike(s),
                GovernmentProcurement.district.ilike(s),
                GovernmentProcurement.nodal_agency.ilike(s),
            )
        )

    total = query.count()
    items = (
        query.order_by(GovernmentProcurement.state.asc(), GovernmentProcurement.crop_name.asc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "disclaimer": "Government procurement is conducted exclusively at designated state centers for registered farmers under statutory MSP rules. KisaanBuddy does not promise eligibility or procurement acceptance.",
        "items": [GovernmentProcurementResponse.model_validate(i) for i in items],
    }


# ─── Market Prices (AGMARKNET Benchmark Context) ──────────────────────────────

@router.get("/market-prices")
def get_market_prices(
    commodity: Optional[str] = Query(default=None),
    variety: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    from_date: Optional[date] = Query(default=None),
    to_date: Optional[date] = Query(default=None),
    min_price: Optional[float] = Query(default=None, ge=0.0),
    max_price: Optional[float] = Query(default=None, ge=0.0),
    sort_by: str = Query(default="date", pattern="^(date|price|commodity)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve official AGMARKNET benchmark prices. Provided strictly as market context."""
    # Auto-seed if empty
    if db.query(MarketPriceRecord).count() == 0:
        importer = AgmarknetPriceImporter(db)
        importer.import_benchmarks(INITIAL_MARKET_PRICES)

    query = db.query(MarketPriceRecord)

    if commodity and commodity != "all":
        query = query.filter(MarketPriceRecord.commodity.ilike(f"%{commodity.strip()}%"))
    if variety and variety != "all":
        query = query.filter(MarketPriceRecord.variety.ilike(f"%{variety.strip()}%"))
    if state and state != "all":
        query = query.filter(MarketPriceRecord.state.ilike(f"%{state.strip()}%"))
    if district and district != "all":
        query = query.filter(MarketPriceRecord.district.ilike(f"%{district.strip()}%"))
    if from_date:
        query = query.filter(MarketPriceRecord.arrival_date >= from_date)
    if to_date:
        query = query.filter(MarketPriceRecord.arrival_date <= to_date)
    if min_price is not None:
        query = query.filter(MarketPriceRecord.modal_price >= min_price)
    if max_price is not None:
        query = query.filter(MarketPriceRecord.modal_price <= max_price)

    sort_col = MarketPriceRecord.modal_price if sort_by == "price" else MarketPriceRecord.arrival_date
    if sort_order == "asc":
        query = query.order_by(sort_col.asc(), MarketPriceRecord.id.asc())
    else:
        query = query.order_by(sort_col.desc(), MarketPriceRecord.id.desc())

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    results = []
    for i in items:
        resp = MarketPriceResponse.model_validate(i)
        is_stale, stale_msg = check_stale(i.arrival_date)
        resp.is_stale = is_stale
        resp.stale_warning = stale_msg
        results.append(resp)

    return results


@router.post("/market-prices/refresh")
async def trigger_price_refresh(
    limit: int = Query(default=50, ge=10, le=200),
    db: Session = Depends(get_db),
) -> Any:
    """Trigger an import update from AGMARKNET / data.gov.in."""
    importer = AgmarknetPriceImporter(db)
    result = await importer.fetch_live_api(limit=limit)
    return {
        "status": "success",
        "result": result,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ─── Registered External Sources & Provenance (All 7 Sources) ────────────────

@router.get("/sources", response_model=List[ImportSourceResponse])
def get_registered_sources(db: Session = Depends(get_db)) -> Any:
    """List all 7 registered external agricultural data sources, legal permissions, and provenance."""
    sources = db.query(ImportSource).all()
    return [ImportSourceResponse.model_validate(s) for s in sources]


# ─── Buy/Sell Transaction Flow (Inquiries & Quotations) ───────────────────────

@router.post("/inquiries", response_model=TradeInquiryResponse, status_code=status.HTTP_201_CREATED)
def submit_trade_inquiry(
    payload: TradeInquiryCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Any:
    """Submit a quotation or expression of interest for a produce listing or buyer requirement."""
    # Verify that target listing exists
    if payload.listing_type == "produce_listing":
        target = db.query(ProduceListing).filter(ProduceListing.id == payload.listing_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Produce listing not found")
    else:
        target = db.query(BuyerRequirement).filter(BuyerRequirement.id == payload.listing_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Buyer requirement not found")

    inquiry = TradeInquiry(
        **payload.model_dump(),
        sender_user_id=current_user.id if current_user else None,
        status="submitted",
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return TradeInquiryResponse.model_validate(inquiry)


@router.get("/inquiries", response_model=List[TradeInquiryResponse])
def list_trade_inquiries(
    listing_type: Optional[str] = Query(default=None),
    listing_id: Optional[int] = Query(default=None),
    sender_phone: Optional[str] = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """List trade inquiries submitted for negotiation."""
    query = db.query(TradeInquiry)
    if listing_type:
        query = query.filter(TradeInquiry.listing_type == listing_type)
    if listing_id:
        query = query.filter(TradeInquiry.listing_id == listing_id)
    if sender_phone:
        query = query.filter(TradeInquiry.sender_phone == sender_phone)
    items = query.order_by(TradeInquiry.created_at.desc()).limit(limit).all()
    return [TradeInquiryResponse.model_validate(i) for i in items]


@router.patch("/inquiries/{item_id}/status")
def update_inquiry_status(
    item_id: int,
    status_value: str = Query(..., pattern="^(submitted|in_discussion|accepted|rejected|closed)$"),
    db: Session = Depends(get_db),
) -> Any:
    """Update status of a trade inquiry / quotation."""
    inquiry = db.query(TradeInquiry).filter(TradeInquiry.id == item_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    inquiry.status = status_value
    inquiry.updated_at = datetime.utcnow()
    db.commit()
    return {"id": inquiry.id, "status": inquiry.status}


# ─── Audit & Review: Report Misleading Listings ───────────────────────────────

@router.post("/reports", response_model=ListingReportResponse, status_code=status.HTTP_201_CREATED)
def report_listing(
    payload: ListingReportCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Any:
    """Report a misleading, inaccurate, or fraudulent listing for admin review."""
    report = ListingReport(
        **payload.model_dump(),
        reporter_user_id=current_user.id if current_user else None,
        status="pending_review",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return ListingReportResponse.model_validate(report)


@router.get("/reports", response_model=List[ListingReportResponse])
def list_reports(
    status: Optional[str] = Query(default="pending_review"),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """Admin view: List reports submitted against listings."""
    query = db.query(ListingReport)
    if status and status != "all":
        query = query.filter(ListingReport.status == status)
    items = query.order_by(ListingReport.created_at.desc()).limit(limit).all()
    return [ListingReportResponse.model_validate(i) for i in items]


@router.patch("/reports/{item_id}")
def resolve_report(
    item_id: int,
    status_value: str = Query(..., pattern="^(pending_review|investigated|dismissed|action_taken)$"),
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Any:
    """Admin action: Resolve listing report."""
    report = db.query(ListingReport).filter(ListingReport.id == item_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = status_value
    if admin_notes:
        report.admin_notes = admin_notes
    report.resolved_at = datetime.utcnow()
    db.commit()
    return {"id": report.id, "status": report.status}


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
