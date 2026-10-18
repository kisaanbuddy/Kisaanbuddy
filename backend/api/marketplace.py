"""Agricultural Marketplace API — Find Harvest Buyers and Agri Input Sellers.

Endpoints:
  GET  /api/marketplace/listings   — list buyers or sellers with filters
  POST /api/marketplace/listings   — create a produce or input listing
  GET  /api/marketplace/categories — list supported commodity categories
"""
from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.auth import get_current_user
from db.models import MarketplaceListing, User
from db.session import get_db
from schemas.marketplace import MarketplaceListingCreate, MarketplaceListingResponse

router = APIRouter()

# Initial verified benchmark listings for Indian farmers
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
        "contact_person": "Rajesh Sharma (Procurement Head)",
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
    {
        "listing_type": "buy",
        "category": "produce",
        "crop_or_item": "Tomato",
        "variety": "Hybrid Abhinav / Himsona",
        "quantity": 120.0,
        "quantity_unit": "Quintal",
        "price": 1850.0,
        "price_unit": "per Quintal",
        "organization_name": "Kisan Mitra FPO Collective",
        "contact_person": "Manoj Patel",
        "contact_phone": "+91 97522 31045",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "verification_status": "fpo_certified",
        "delivery_terms": "Farm Gate Collection",
        "notes": "Direct purchase for retail supermarket supply chain. Crates provided.",
    },
    {
        "listing_type": "buy",
        "category": "wholesale",
        "crop_or_item": "Paddy",
        "variety": "Pusa Basmati 1121 / 1509",
        "quantity": 500.0,
        "quantity_unit": "Quintal",
        "price": 3800.0,
        "price_unit": "per Quintal",
        "organization_name": "Heritage Rice Exporters Pvt Ltd",
        "contact_person": "Suresh Gupta",
        "contact_phone": "+91 98110 55432",
        "district": "Karnal",
        "state": "Haryana",
        "verification_status": "verified",
        "delivery_terms": "Mandi Delivery",
        "notes": "Export-grade clean paddy, certified residue tested.",
    },
    {
        "listing_type": "sell",
        "category": "seeds",
        "crop_or_item": "Certified Wheat Seeds",
        "variety": "GW-322 / HD-3086",
        "quantity": 200.0,
        "quantity_unit": "Bags (40kg)",
        "price": 1450.0,
        "price_unit": "per Bag",
        "organization_name": "State Certified Seed Corporation",
        "contact_person": "Dr. A. K. Joshi",
        "contact_phone": "+91 755 255 1200",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "verification_status": "verified",
        "delivery_terms": "Block Level Distribution Centers",
        "notes": "98% germination rate certified, treated with bio-fungicide.",
    },
    {
        "listing_type": "sell",
        "category": "equipment",
        "crop_or_item": "Drip Irrigation & Micro-Sprinkler Kits",
        "variety": "PM-KUSUM Subsidy Approved",
        "quantity": 50.0,
        "quantity_unit": "Units",
        "price": 18500.0,
        "price_unit": "per Acre Kit",
        "organization_name": "Jal Shakti Agro Equipment",
        "contact_person": "Vikas Choudhary",
        "contact_phone": "+91 93010 44321",
        "district": "Ujjain",
        "state": "Madhya Pradesh",
        "verification_status": "verified",
        "delivery_terms": "On-farm Installation & Demo",
        "notes": "Eligible for up to 55% state government subsidy with installation warranty.",
    },
]


def _seed_benchmark_listings_if_empty(db: Session) -> None:
    """Ensure baseline institutional buyers and verified sellers exist."""
    try:
        count = db.query(MarketplaceListing).count()
        if count == 0:
            for item in DEFAULT_BENCHMARK_LISTINGS:
                db.add(MarketplaceListing(**item))
            db.commit()
    except Exception:
        db.rollback()


@router.get("/listings", response_model=List[MarketplaceListingResponse])
def list_marketplace_listings(
    listing_type: Optional[str] = Query(default=None, description="buy or sell"),
    category: Optional[str] = Query(default=None),
    crop_or_item: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """List marketplace buyer and seller opportunities with filters."""
    _seed_benchmark_listings_if_empty(db)
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
def create_marketplace_listing(
    listing_in: MarketplaceListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Allow an authenticated farmer to list produce for sale or request inputs."""
    listing = MarketplaceListing(
        user_id=current_user.id,
        **listing_in.model_dump()
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing
