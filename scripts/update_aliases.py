with open('backend/schemas/marketplace.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''class TradeInquiryCreate(BaseModel):
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
    message: Optional[str] = None'''

replacement = '''class TradeInquiryCreate(BaseModel):
    listing_type: Optional[str] = None
    target_type: Optional[str] = None
    listing_id: Optional[int] = None
    target_id: Optional[int] = None
    sender_name: Optional[str] = None
    inquirer_name: Optional[str] = None
    sender_phone: Optional[str] = None
    inquirer_phone: Optional[str] = None
    sender_type: str = Field(default="farmer", max_length=50)
    inquirer_type: Optional[str] = None
    inquiry_type: Optional[str] = Field(default="quotation", description="quotation, callback, general_inquiry")
    preferred_callback_time: Optional[str] = Field(default=None, max_length=100)
    proposed_quantity: Optional[float] = Field(default=None, ge=0.0)
    offered_quantity: Optional[float] = None
    quantity_unit: Optional[str] = Field(default="Quintal", max_length=50)
    proposed_price: Optional[float] = Field(default=None, ge=0.0)
    offered_price: Optional[float] = None
    price_unit: Optional[str] = Field(default="per Quintal", max_length=50)
    message: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("listing_type") and data.get("target_type"):
                data["listing_type"] = data["target_type"]
            if not data.get("listing_id") and data.get("target_id"):
                data["listing_id"] = data["target_id"]
            if not data.get("sender_name") and data.get("inquirer_name"):
                data["sender_name"] = data["inquirer_name"]
            if not data.get("sender_phone") and data.get("inquirer_phone"):
                data["sender_phone"] = data["inquirer_phone"]
            if data.get("proposed_price") is None and data.get("offered_price") is not None:
                data["proposed_price"] = data["offered_price"]
            if data.get("proposed_quantity") is None and data.get("offered_quantity") is not None:
                data["proposed_quantity"] = data["offered_quantity"]
        return data

    @model_validator(mode="after")
    def validate_required_fields(self) -> "TradeInquiryCreate":
        if not self.listing_type:
            raise ValueError("listing_type or target_type is required")
        if not self.listing_id or self.listing_id < 1:
            raise ValueError("listing_id or target_id must be >= 1")
        if not self.sender_name or len(self.sender_name.strip()) < 2:
            raise ValueError("sender_name or inquirer_name must have at least 2 characters")
        if not self.sender_phone or len(self.sender_phone.strip()) < 8:
            raise ValueError("sender_phone or inquirer_phone must have at least 8 characters")
        return self'''

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/schemas/marketplace.py', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(content)
    print("Updated TradeInquiryCreate with alias normalizer")
else:
    print("Target not found")
