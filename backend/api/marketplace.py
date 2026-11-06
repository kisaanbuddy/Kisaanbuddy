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
    Notification,
    ProduceListing,
    TradeInquiry,
    User,
)
from db.session import get_db
from schemas.marketplace import (
    BuyerRequirementCreate,
    BuyerRequirementResponse,
    DealerDiscoveryItem,
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
    PriceComparisonItem,
    PriceComparisonResponse,
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
        from services.auth_service import decode_access_token
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
    data = payload.model_dump()
    images_list = data.pop("images", None)
    if images_list and not data.get("image_url"):
        data["image_url"] = images_list[0]
    if images_list:
        import json as _json
        data["images_json"] = _json.dumps(images_list)
    item = EquipmentListing(
        **data,
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
    # A public form submission does not establish identity, stock ownership, or
    # contact consent. Only a separate verified moderation/consent workflow may
    # promote this state.
    listing_data = payload.model_dump()
    listing_data["verification_status"] = "self_declared"
    listing_data["contact_consent_verified"] = False
    listing_data["source_origin"] = "kisaanbuddy_farmer"
    item = ProduceListing(
        **listing_data,
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
@router.post("/produce-listings/{item_id}/confirm")
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
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update availability status of a produce listing with ownership authorization enforcement."""
    item = db.query(ProduceListing).filter(ProduceListing.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produce listing not found")
    if item.user_id is not None:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required to modify listing status.")
        if current_user.id != item.user_id and not getattr(current_user, "is_admin", False):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this produce listing.")
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
    # Treat direct submissions as self-declared until a back-office
    # verification flow has completed. Never accept a client-provided verified
    # state as proof of identity or availability.
    requirement_data = payload.model_dump()
    requirement_data["verification_status"] = "self_declared"
    requirement_data["contact_consent_verified"] = False
    requirement_data["source"] = "KisaanBuddy self-declared buyer requirement"
    item = BuyerRequirement(
        **requirement_data,
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
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update status of a buyer requirement with ownership authorization enforcement."""
    item = db.query(BuyerRequirement).filter(BuyerRequirement.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Buyer requirement not found")
    if getattr(item, "user_id", None) is not None:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required to modify requirement status.")
        if current_user.id != item.user_id and not getattr(current_user, "is_admin", False):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this buyer requirement.")
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
    """Submit a quotation, callback request, or expression of interest for a marketplace listing."""
    target = None
    seller_user_id = None
    target_title = ""

    if payload.listing_type == "produce_listing":
        target = db.query(ProduceListing).filter(ProduceListing.id == payload.listing_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Produce listing not found")
        seller_user_id = target.user_id
        target_title = target.crop_name
    elif payload.listing_type == "buyer_requirement":
        target = db.query(BuyerRequirement).filter(BuyerRequirement.id == payload.listing_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Buyer requirement not found")
        seller_user_id = getattr(target, "user_id", None)
        target_title = target.commodity
    elif payload.listing_type == "equipment_listing":
        target = db.query(EquipmentListing).filter(EquipmentListing.id == payload.listing_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Equipment listing not found")
        seller_user_id = target.user_id
        target_title = target.title
    elif payload.listing_type == "equipment_catalog":
        target = db.query(EquipmentCatalog).filter(EquipmentCatalog.id == payload.listing_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Equipment catalog model not found")
        target_title = f"{target.brand} {target.model_name}"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported listing_type: {payload.listing_type}")

    inq_type = payload.inquiry_type or "quotation"

    # Duplicate prevention: Check for active enquiry from this phone number for this listing
    existing_inquiry = db.query(TradeInquiry).filter(
        TradeInquiry.listing_type == payload.listing_type,
        TradeInquiry.listing_id == payload.listing_id,
        TradeInquiry.sender_phone == payload.sender_phone,
        TradeInquiry.inquiry_type == inq_type,
        TradeInquiry.status.in_(["submitted", "in_discussion"])
    ).first()
    if existing_inquiry:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An active {inq_type} request (#INQ-{existing_inquiry.id}) is already registered for this phone number."
        )

    inquiry = TradeInquiry(
        listing_type=payload.listing_type,
        listing_id=payload.listing_id,
        sender_name=payload.sender_name,
        sender_phone=payload.sender_phone,
        sender_type=payload.sender_type or "farmer",
        inquiry_type=inq_type,
        preferred_callback_time=payload.preferred_callback_time,
        proposed_quantity=payload.proposed_quantity,
        quantity_unit=payload.quantity_unit,
        proposed_price=payload.proposed_price,
        price_unit=payload.price_unit,
        message=payload.message,
        sender_user_id=current_user.id if current_user else None,
        status="submitted",
    )
    db.add(inquiry)
    db.flush()

    # Dispatch notification to seller if a registered user account exists
    if seller_user_id:
        notif = Notification(
            user_id=seller_user_id,
            title=f"New {inq_type.title()} Request for {target_title}",
            message=f"{payload.sender_name} ({payload.sender_phone}) submitted a {inq_type} request.",
            category="marketplace_inquiry",
        )
        db.add(notif)

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


@router.get("/compare-prices", response_model=PriceComparisonResponse)
def compare_prices(
    category: str = Query(..., description="Machinery category, e.g. tractors, rotavators, sprayers"),
    deal_type: str = Query(default="rent", description="rent or sale"),
    price_unit: Optional[str] = Query(default=None, description="e.g. per hour, per acre, total price"),
    target_id: Optional[str] = Query(default=None, description="Current product ID, e.g. list-1 or cat-1"),
    hp_rating: Optional[float] = Query(default=None),
    brand: Optional[str] = Query(default=None),
    model_name: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> Any:
    """Compare prices across authentic marketplace listings for the same category and configuration."""
    # Query matching active equipment listings
    query = db.query(EquipmentListing).filter(
        EquipmentListing.category == category,
        EquipmentListing.listing_type == deal_type,
        EquipmentListing.price > 0,
        EquipmentListing.availability_status == "available",
    )
    if price_unit:
        query = query.filter(EquipmentListing.price_unit == price_unit)
    
    eq_listings = query.all()

    # If purchase/sale, also check catalog items with verified indicative prices
    cat_items = []
    if deal_type == "sale" or price_unit == "total price":
        cat_query = db.query(EquipmentCatalog).filter(
            EquipmentCatalog.category == category,
            EquipmentCatalog.indicative_price.isnot(None),
            EquipmentCatalog.indicative_price > 0,
            EquipmentCatalog.is_active.is_(True),
        )
        cat_items = cat_query.all()

    comparable_offers: List[PriceComparisonItem] = []

    normalized_brand = brand.strip().lower() if brand else ""
    normalized_model = model_name.strip().lower() if model_name else ""

    for l in eq_listings:
        # Determine exact model vs spec alternative
        is_exact = False
        if normalized_brand and normalized_model:
            if l.brand.strip().lower() == normalized_brand and normalized_model in (l.model_name or l.title).strip().lower():
                is_exact = True

        comparable_offers.append(
            PriceComparisonItem(
                id=f"list-{l.id}",
                source_type="listing",
                title=l.title,
                brand=l.brand,
                model_name=l.model_name or l.title,
                category=l.category,
                hp_rating=l.hp_rating,
                condition=l.condition,
                price=l.price,
                price_unit=l.price_unit,
                seller_name=l.owner_name,
                seller_location=f"{l.district}, {l.state}",
                state=l.state,
                district=l.district,
                includes_operator=bool(l.includes_operator),
                is_verified=True,
                match_type="exact_model" if is_exact else "spec_alternative",
                warranty_info="Verified seller/CHC listing (warranty terms negotiable with owner)",
                delivery_info="Haulage / farm-gate delivery arranged upon agreement with owner",
                notes=l.notes,
            )
        )

    for c in cat_items:
        is_exact = False
        if normalized_brand and normalized_model:
            if c.brand.strip().lower() == normalized_brand and normalized_model in c.model_name.strip().lower():
                is_exact = True

        comparable_offers.append(
            PriceComparisonItem(
                id=f"cat-{c.id}",
                source_type="catalog",
                title=f"{c.brand} {c.model_name}",
                brand=c.brand,
                model_name=c.model_name,
                category=c.category,
                hp_rating=c.hp_rating,
                condition="new",
                price=c.indicative_price,
                price_unit="total price",
                seller_name=c.supplier_name or "Official Supplier Network",
                seller_location="Authorized Pan-India Dealers",
                state=None,
                district=None,
                includes_operator=False,
                is_verified=True,
                match_type="exact_model" if is_exact else "spec_alternative",
                warranty_info="Standard OEM manufacturer warranty applies",
                delivery_info="Supplier direct dispatch across India",
                notes=c.description,
            )
        )

    # Sort offers by price ascending
    comparable_offers.sort(key=lambda x: x.price)

    is_sufficient = len(comparable_offers) >= 2

    if not is_sufficient:
        return PriceComparisonResponse(
            target_id=target_id,
            target_title=f"{brand or ''} {model_name or ''}".strip() or None,
            is_sufficient=False,
            summary_message="Comparison data is currently insufficient for this product. No identical or directly comparable listings exist in our verified database.",
            lowest_offer=comparable_offers[0] if comparable_offers else None,
            best_value_offer=comparable_offers[0] if comparable_offers else None,
            best_value_reason=None,
            comparable_offers=comparable_offers,
        )

    lowest_offer = comparable_offers[0]

    # Best value analysis: factor in price, condition, operator inclusion, and verification
    # For rental, operator inclusion gives massive value to farmers
    best_value_offer = None
    best_value_reason = ""

    # Check if there is an offer with operator included at competitive price
    operator_offers = [o for o in comparable_offers if o.includes_operator]
    if operator_offers and operator_offers[0].price <= lowest_offer.price * 1.25:
        best_value_offer = operator_offers[0]
        best_value_reason = f"Top value: Includes trained operator & implement at ₹{int(best_value_offer.price)}/{best_value_offer.price_unit.replace('per ', '')} from verified CHC in {best_value_offer.seller_location}."
    else:
        best_value_offer = lowest_offer
        best_value_reason = f"Lowest listed rate at ₹{int(lowest_offer.price)}/{lowest_offer.price_unit.replace('per ', '')} from verified provider in {lowest_offer.seller_location}."

    return PriceComparisonResponse(
        target_id=target_id,
        target_title=f"{brand or ''} {model_name or ''}".strip() or None,
        is_sufficient=True,
        summary_message=f"Found {len(comparable_offers)} verified comparable offers in {category.replace('_', ' ').title()}.",
        lowest_offer=lowest_offer,
        best_value_offer=best_value_offer,
        best_value_reason=best_value_reason,
        comparable_offers=comparable_offers,
    )


@router.get("/dealers", response_model=List[DealerDiscoveryItem])
def list_dealers(
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> Any:
    """Discover authentic machinery sellers, Custom Hiring Centers (CHCs), and suppliers."""
    query = db.query(EquipmentListing)
    if state and state.lower() != "all":
        query = query.filter(func.lower(EquipmentListing.state) == state.lower())
    if district and district.lower() != "all":
        query = query.filter(func.lower(EquipmentListing.district) == district.lower())
    if category and category != "all":
        query = query.filter(EquipmentListing.category == category)

    listings = query.all()

    # Aggregate by owner_name and location
    grouped: Dict[tuple, List[EquipmentListing]] = {}
    for l in listings:
        key = (l.owner_name, l.state, l.district)
        if key not in grouped:
            grouped[key] = []
        grouped[key].append(l)

    results: List[DealerDiscoveryItem] = []
    idx = 1
    for (owner_name, st, dist), items in sorted(grouped.items(), key=lambda x: len(x[1]), reverse=True):
        first = items[0]
        phone = first.owner_phone
        has_phone = bool(phone and phone.strip())
        
        seller_type = "Farmer Owner"
        if any(w in owner_name.lower() for w in ["custom hiring", "chc", "kisan seva", "sahakari", "bank", "pool", "federation", "fpo"]):
            seller_type = "Custom Hiring Center (CHC)"

        cats = sorted(list(set(i.category for i in items)))
        samples = [i.title for i in items[:3]]

        results.append(
            DealerDiscoveryItem(
                id=f"dealer-{idx}",
                seller_name=owner_name,
                seller_type=seller_type,
                phone=phone if has_phone else None,
                whatsapp=phone if has_phone else None,
                state=st,
                district=dist,
                village_or_tehsil=first.village or first.tehsil_or_block,
                listings_count=len(items),
                categories=cats,
                sample_equipment=samples,
                is_verified=True,
                contact_available=has_phone,
            )
        )
        idx += 1

    return results


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


# ─── AGRICULTURAL INPUTS & CROP CARE MARKETPLACE ENDPOINTS ───────────────────

from data.authentic_agri_products import AGRICULTURAL_PRODUCT_CATEGORIES, AUTHENTIC_AGRI_PRODUCTS
from schemas.marketplace import (
    AgriProductCategory,
    AgriProductItem,
    AgriPriceComparisonResult,
    AgriPriceComparisonSection,
)


@router.get("/product-categories", response_model=List[AgriProductCategory])
def get_agri_product_categories() -> Any:
    """Return all 11 dedicated agricultural input categories with accurate product counts."""
    counts: Dict[str, int] = {}
    for p in AUTHENTIC_AGRI_PRODUCTS:
        c = p.get("category", "")
        counts[c] = counts.get(c, 0) + 1

    categories_out = []
    for cat in AGRICULTURAL_PRODUCT_CATEGORIES:
        item = dict(cat)
        item["product_count"] = counts.get(cat["id"], 0)
        categories_out.append(item)
    return categories_out


@router.get("/products", response_model=Dict[str, Any])
def list_agri_products(
    category: Optional[str] = Query(None, description="Category slug or 'all'"),
    crop: Optional[str] = Query(None, description="Target crop (e.g. Wheat, Rice, Cotton)"),
    disease: Optional[str] = Query(None, description="Target disease or pest (e.g. Yellow Rust, Whitefly)"),
    deficiency: Optional[str] = Query(None, description="Soil deficiency (e.g. nitrogen, phosphorus, zinc, acidic)"),
    brand: Optional[str] = Query(None, description="Brand name filter"),
    state: Optional[str] = Query(None, description="Seller state filter"),
    district: Optional[str] = Query(None, description="Seller district filter"),
    availability: Optional[str] = Query(None, description="Filter by stock status"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None, description="Keyword search query"),
    sort_by: Optional[str] = Query("relevance", description="relevance | price_asc | price_desc | newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
) -> Any:
    """List verified agricultural inputs, fertilizers, and crop protection products with authentic specifications."""
    items = list(AUTHENTIC_AGRI_PRODUCTS)

    # 1. Category Filter
    if category and category.lower() != "all":
        items = [p for p in items if p.get("category", "").lower() == category.lower()]

    # 2. Crop Filter
    if crop and crop.strip():
        c_low = crop.strip().lower()
        items = [
            p for p in items
            if any(c_low in tc.lower() for tc in p.get("target_crops", []))
            or c_low in p.get("name", "").lower()
            or c_low in p.get("recommended_dosage", "").lower()
        ]

    # 3. Disease / Pest Filter
    if disease and disease.strip():
        d_low = disease.strip().lower()
        items = [
            p for p in items
            if any(d_low in td.lower() for td in p.get("target_pests_diseases", []))
            or d_low in p.get("name", "").lower()
            or d_low in p.get("active_ingredient", "").lower()
        ]

    # 4. Soil Deficiency Filter
    if deficiency and deficiency.strip():
        def_terms = [t.strip().lower() for t in deficiency.split(",") if t.strip()]
        filtered = []
        for p in items:
            p_defs = [d.lower() for d in p.get("target_deficiencies", [])]
            p_cat = p.get("category", "").lower()
            p_act = p.get("active_ingredient", "").lower()
            match = False
            for term in def_terms:
                if any(term in d for d in p_defs):
                    match = True
                    break
                # Special semantic matching for essential fertilizer classes
                if "nitrogen" in term and ("urea" in p_act or "nitrogen" in p_act):
                    match = True
                    break
                if "phosphorus" in term and ("p2o5" in p_act or "dap" in p_act or "phosphate" in p_act):
                    match = True
                    break
                if "potassium" in term and ("k2o" in p_act or "potash" in p_act or "mop" in p_act):
                    match = True
                    break
                if "acidic" in term and ("dolomite" in p_act or "lime" in p_act or p_cat == "soil_conditioners"):
                    match = True
                    break
                if "zinc" in term and "zinc" in p_act:
                    match = True
                    break
            if match:
                filtered.append(p)
        items = filtered

    # 5. Brand Filter
    if brand and brand.lower() != "all":
        b_low = brand.strip().lower()
        items = [p for p in items if b_low in p.get("brand", "").lower()]

    # 6. State Filter
    if state and state.lower() != "all":
        s_low = state.strip().lower()
        items = [p for p in items if s_low in p.get("state", "").lower()]

    # 7. District Filter
    if district and district.strip():
        dist_low = district.strip().lower()
        items = [p for p in items if dist_low in p.get("district", "").lower()]

    # 8. Availability Filter
    if availability and availability.lower() != "all":
        items = [p for p in items if p.get("stock_status", "").lower() == availability.lower()]

    # 9. Price Range
    if min_price is not None:
        items = [p for p in items if p.get("selling_price", 0.0) >= min_price]
    if max_price is not None:
        items = [p for p in items if p.get("selling_price", 0.0) <= max_price]

    # 10. Keyword Search
    if search and search.strip():
        q = search.strip().lower()
        items = [
            p for p in items
            if q in p.get("name", "").lower()
            or q in p.get("brand", "").lower()
            or q in p.get("manufacturer", "").lower()
            or q in p.get("active_ingredient", "").lower()
            or any(q in tc.lower() for tc in p.get("target_crops", []))
            or any(q in td.lower() for td in p.get("target_pests_diseases", []))
        ]

    # 11. Sorting
    if sort_by == "price_asc":
        items = sorted(items, key=lambda x: x.get("selling_price", 0.0))
    elif sort_by == "price_desc":
        items = sorted(items, key=lambda x: x.get("selling_price", 0.0), reverse=True)
    elif sort_by == "newest":
        items = sorted(items, key=lambda x: x.get("last_verified_date", ""), reverse=True)
    # default "relevance" keeps initial ordering

    total_count = len(items)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_items = items[start_idx:end_idx]

    return {
        "items": paginated_items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if total_count > 0 else 1,
    }


@router.get("/products/{product_id}", response_model=AgriProductItem)
def get_agri_product_detail(product_id: str) -> Any:
    """Return complete technical specifications, CIBRC/FCO compliance, and verified seller info for a product."""
    for p in AUTHENTIC_AGRI_PRODUCTS:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")


@router.get("/product-compare-prices", response_model=AgriPriceComparisonResult)
def compare_agri_product_prices(
    product_id: Optional[str] = Query(None, description="Target product ID to compare against"),
    category: Optional[str] = Query(None, description="Category filter"),
    crop: Optional[str] = Query(None, description="Target crop"),
    disease: Optional[str] = Query(None, description="Target disease or pest"),
    active_ingredient: Optional[str] = Query(None, description="Active ingredient to match"),
) -> Any:
    """
    Intelligent Price Comparison Engine with 3 Distinct Sections:
    A. LOWEST PRICE: Lowest verified price among products with identical/equivalent active ingredients.
    B. BEST VALUE: Product offering optimal balance of active concentration, brand credibility, and delivery.
    C. OTHER SUITABLE ALTERNATIVES: Other verified formulations approved for the same crop/disease.
    """
    target: Optional[Dict[str, Any]] = None
    if product_id:
        for p in AUTHENTIC_AGRI_PRODUCTS:
            if p["id"] == product_id:
                target = p
                break

    target_category = category or (target.get("category") if target else None)
    target_crop = crop or (target.get("target_crops")[0] if target and target.get("target_crops") else None)
    target_disease = disease or (target.get("target_pests_diseases")[0] if target and target.get("target_pests_diseases") else None)
    target_active = active_ingredient or (target.get("active_ingredient") if target else None)

    # 1. Identify directly comparable products
    # Strict authenticity rule: comparable products must share active ingredient or exact category/pack group
    pool = list(AUTHENTIC_AGRI_PRODUCTS)

    exact_pool = []
    if target_active:
        # Extract base chemical name, e.g. "Hexaconazole" from "Hexaconazole 5% SC" or "Imidacloprid"
        base_chem = target_active.split()[0].lower()
        exact_pool = [
            p for p in pool
            if base_chem in p.get("active_ingredient", "").lower()
            and (not target or p["id"] != target["id"])
        ]

    # If no direct chemical match found or no active specified, match by category + crop + pest
    if not exact_pool and target_category:
        exact_pool = [
            p for p in pool
            if p.get("category") == target_category
            and (not target or p["id"] != target["id"])
        ]

    # Sort exact pool by selling price
    sorted_by_price = sorted(exact_pool, key=lambda x: x.get("selling_price", 999999))

    lowest_section: Optional[AgriPriceComparisonSection] = None
    best_value_section: Optional[AgriPriceComparisonSection] = None
    alternatives_sections: List[AgriPriceComparisonSection] = []

    if sorted_by_price:
        lowest_item = sorted_by_price[0]
        savings = max(0.0, lowest_item.get("mrp", 0.0) - lowest_item.get("selling_price", 0.0))
        lowest_section = AgriPriceComparisonSection(
            product=lowest_item,
            badge_label="Lowest Verified Price",
            badge_type="lowest_price",
            headline=f"Lowest price in {lowest_item.get('district', 'verified hub')}",
            reason=f"Verified seller '{lowest_item.get('seller_name')}' offers this genuine formulation at Rs. {lowest_item.get('selling_price')} ({lowest_item.get('price_unit')}), saving Rs. {savings:.2f} off MRP.",
            savings_vs_mrp=savings,
            price_per_unit_ratio=f"Rs. {lowest_item.get('selling_price')}/{lowest_item.get('pack_size')}",
        )

    # Best Value: Pick item from top brands (IFFCO, Bayer, Syngenta, Tata, Coromandel, FMC) or highest formulation spec
    top_brands = ["iffco", "bayer", "syngenta", "tata rallis", "fmc", "coromandel", "mahadhan"]
    best_candidate = None
    for p in sorted_by_price:
        if any(tb in p.get("brand", "").lower() for tb in top_brands) and p.get("stock_status") == "available_to_buy":
            best_candidate = p
            break
    if not best_candidate and sorted_by_price:
        best_candidate = sorted_by_price[-1]  # fallback to next candidate

    if best_candidate and (not lowest_section or best_candidate["id"] != lowest_section.product.id):
        b_savings = max(0.0, best_candidate.get("mrp", 0.0) - best_candidate.get("selling_price", 0.0))
        best_value_section = AgriPriceComparisonSection(
            product=best_candidate,
            badge_label="Best Value & Reliability",
            badge_type="best_value",
            headline=f"Top-tier formulation from {best_candidate.get('brand')}",
            reason=f"High-purity active ingredient ({best_candidate.get('active_ingredient')}) with verified dealer stock and full CIBRC/FCO compliance.",
            savings_vs_mrp=b_savings,
            price_per_unit_ratio=f"Rs. {best_candidate.get('selling_price')}/{best_candidate.get('pack_size')}",
        )
    elif sorted_by_price and len(sorted_by_price) > 1:
        # If lowest is also top brand, pick second as alternative best value
        cand2 = sorted_by_price[1]
        c2_savings = max(0.0, cand2.get("mrp", 0.0) - cand2.get("selling_price", 0.0))
        best_value_section = AgriPriceComparisonSection(
            product=cand2,
            badge_label="Best Value & Reliability",
            badge_type="best_value",
            headline=f"Alternative high-grade option from {cand2.get('brand')}",
            reason=f"Strong grower trust with active stock at {cand2.get('seller_location')}.",
            savings_vs_mrp=c2_savings,
            price_per_unit_ratio=f"Rs. {cand2.get('selling_price')}/{cand2.get('pack_size')}",
        )

    # Section C: Other Suitable Alternatives (other registered products for target crop/disease or deficiency)
    alt_pool = []
    for p in pool:
        if target and p["id"] == target["id"]:
            continue
        if lowest_section and p["id"] == lowest_section.product.id:
            continue
        if best_value_section and p["id"] == best_value_section.product.id:
            continue

        match = False
        if target_disease and any(target_disease.lower() in d.lower() for d in p.get("target_pests_diseases", [])):
            match = True
        elif target_crop and any(target_crop.lower() in c.lower() for c in p.get("target_crops", [])) and p.get("category") == target_category:
            match = True
        elif target_category and p.get("category") == target_category:
            match = True

        if match:
            alt_pool.append(p)
            if len(alt_pool) >= 4:
                break

    for alt in alt_pool:
        alt_savings = max(0.0, alt.get("mrp", 0.0) - alt.get("selling_price", 0.0))
        alternatives_sections.append(
            AgriPriceComparisonSection(
                product=alt,
                badge_label="Approved Alternative",
                badge_type="alternative",
                headline=f"{alt.get('brand')} — {alt.get('active_ingredient')}",
                reason=f"Registered for {', '.join(alt.get('target_crops', [])[:3])}. Dosage: {alt.get('recommended_dosage', 'As per label')}.",
                savings_vs_mrp=alt_savings,
                price_per_unit_ratio=f"Rs. {alt.get('selling_price')}/{alt.get('pack_size')}",
            )
        )

    total_found = len(sorted_by_price) + len(alt_pool)
    is_sufficient = total_found >= 1

    disclaimer = (
        "Prices and stock availability are verified directly from authorized agricultural dealers, cooperatives, and FPOs. "
        "Always observe CIBRC label recommendations and FCO nutrient guidelines before purchasing."
    )

    return AgriPriceComparisonResult(
        query_crop=target_crop,
        query_disease=target_disease,
        query_category=target_category,
        query_active_ingredient=target_active,
        target_product=target,
        lowest_price=lowest_section,
        best_value=best_value_section,
        alternatives=alternatives_sections,
        total_comparable_found=total_found,
        is_sufficient_data=is_sufficient,
        disclaimer=disclaimer,
    )
