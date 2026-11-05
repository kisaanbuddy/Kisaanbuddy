with open('backend/api/marketplace.py', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''    inquiry = TradeInquiry(
        **payload.model_dump(),
        sender_user_id=current_user.id if current_user else None,
        status="submitted",
    )'''

replacement = '''    inquiry = TradeInquiry(
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
    )'''

if target in code:
    code = code.replace(target, replacement, 1)
    with open('backend/api/marketplace.py', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(code)
    print('Updated TradeInquiry initialization')
else:
    print('Target not found')
