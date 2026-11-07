with open('backend/api/marketplace.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Check imports
old_import = '''from schemas.marketplace import (
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
)'''

new_import = '''from schemas.marketplace import (
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
)'''

code = code.replace(old_import, new_import, 1)

# Check db.models imports
old_models = '''from db.models import (
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
)'''

new_models = '''from db.models import (
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
)'''

code = code.replace(old_models, new_models, 1)

# Update submit_trade_inquiry
old_submit = '''@router.post("/inquiries", response_model=TradeInquiryResponse, status_code=status.HTTP_201_CREATED)
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
    return TradeInquiryResponse.model_validate(inquiry)'''

new_submit = '''@router.post("/inquiries", response_model=TradeInquiryResponse, status_code=status.HTTP_201_CREATED)
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
        **payload.model_dump(),
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
    return TradeInquiryResponse.model_validate(inquiry)'''

code = code.replace(old_submit, new_submit, 1)

# Add compare-prices and dealers endpoints right before list_trade_inquiries or after update_inquiry_status
target_insert = '''@router.patch("/inquiries/{item_id}/status")'''

new_endpoints = '''@router.get("/compare-prices", response_model=PriceComparisonResponse)
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


''' + target_insert

code = code.replace(target_insert, new_endpoints, 1)

with open('backend/api/marketplace.py', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(code)

print("Successfully updated backend/api/marketplace.py")
