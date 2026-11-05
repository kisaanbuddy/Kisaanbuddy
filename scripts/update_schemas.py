with open('backend/schemas/marketplace.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''class TradeInquiryCreate(BaseModel):
    listing_type: Literal["produce_listing", "buyer_requirement"]
    listing_id: int = Field(..., ge=1)
    sender_name: str = Field(..., min_length=2, max_length=120)
    sender_phone: str = Field(..., min_length=8, max_length=30)
    sender_type: str = Field(default="farmer", max_length=50)
    proposed_quantity: Optional[float] = Field(default=None, ge=0.0)
    quantity_unit: Optional[str] = Field(default="Quintal", max_length=50)
    proposed_price: Optional[float] = Field(default=None, ge=0.0)
    price_unit: Optional[str] = Field(default="per Quintal", max_length=50)
    message: Optional[str] = None


class TradeInquiryResponse(TradeInquiryCreate):
    id: int
    sender_user_id: Optional[int] = None
    status: str = "submitted"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)'''

replacement = '''class TradeInquiryCreate(BaseModel):
    listing_type: str = Field(..., description="produce_listing, buyer_requirement, equipment_listing, equipment_catalog")
    listing_id: int = Field(..., ge=1)
    sender_name: str = Field(..., min_length=2, max_length=120)
    sender_phone: str = Field(..., min_length=8, max_length=30)
    sender_type: str = Field(default="farmer", max_length=50)
    inquiry_type: Optional[str] = Field(default="quotation", description="quotation, callback, general_inquiry")
    preferred_callback_time: Optional[str] = Field(default=None, max_length=100)
    proposed_quantity: Optional[float] = Field(default=None, ge=0.0)
    quantity_unit: Optional[str] = Field(default="Quintal", max_length=50)
    proposed_price: Optional[float] = Field(default=None, ge=0.0)
    price_unit: Optional[str] = Field(default="per Quintal", max_length=50)
    message: Optional[str] = None


class TradeInquiryResponse(TradeInquiryCreate):
    id: int
    sender_user_id: Optional[int] = None
    status: str = "submitted"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class PriceComparisonItem(BaseModel):
    id: str
    source_type: str  # "listing" or "catalog"
    title: str
    brand: str
    model_name: str
    category: str
    hp_rating: Optional[float] = None
    condition: str
    price: float
    price_unit: str
    seller_name: str
    seller_location: str
    state: Optional[str] = None
    district: Optional[str] = None
    includes_operator: bool = False
    is_verified: bool = True
    match_type: str  # "exact_model" or "spec_alternative"
    warranty_info: str
    delivery_info: str
    notes: Optional[str] = None


class PriceComparisonResponse(BaseModel):
    target_id: Optional[str] = None
    target_title: Optional[str] = None
    target_price: Optional[float] = None
    target_price_unit: Optional[str] = None
    is_sufficient: bool
    summary_message: str
    lowest_offer: Optional[PriceComparisonItem] = None
    best_value_offer: Optional[PriceComparisonItem] = None
    best_value_reason: Optional[str] = None
    comparable_offers: List[PriceComparisonItem] = []


class DealerDiscoveryItem(BaseModel):
    id: str
    seller_name: str
    seller_type: str
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    state: str
    district: str
    village_or_tehsil: Optional[str] = None
    listings_count: int
    categories: List[str]
    sample_equipment: List[str]
    is_verified: bool
    contact_available: bool'''

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/schemas/marketplace.py', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(content)
    print('Updated schemas/marketplace.py successfully')
else:
    print('Target not found')
