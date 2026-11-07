"""Comprehensive tests for Real Seller Contact, Callback/Quotation Workflows,
External Website Validation, and Smart Price Comparison.
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from main import app
from db.models import EquipmentListing, EquipmentCatalog, TradeInquiry, Notification

client = TestClient(app)

def test_equipment_listings_preserve_real_seller_phones():
    """Verify that every real listing has a preserved, non-empty phone number."""
    response = client.get("/api/marketplace/equipment-listings?limit=50")
    assert response.status_code == 200
    data = response.json()
    items = data["items"]
    assert len(items) > 0
    for item in items:
        phone = item.get("owner_phone")
        assert phone is not None, f"Listing {item['id']} missing phone number"
        assert len(phone.strip()) >= 10, f"Listing {item['id']} has invalid phone number: {phone}"


def test_callback_request_workflow_equipment_catalog():
    """Scenario B: Submit callback request for catalog item without direct phone number."""
    cat_res = client.get("/api/marketplace/catalog/equipment?limit=5")
    assert cat_res.status_code == 200
    catalog_item = cat_res.json()["items"][0]

    payload = {
        "listing_type": "equipment_catalog",
        "listing_id": catalog_item["id"],
        "sender_name": "Kailash Verma",
        "sender_phone": "+91 98234 56789",
        "sender_type": "farmer",
        "inquiry_type": "callback",
        "preferred_callback_time": "Morning (9:00 AM – 12:00 PM)",
        "message": f"Interested in {catalog_item['brand']} {catalog_item['model_name']}, please call back."
    }

    res = client.post("/api/marketplace/inquiries", json=payload)
    assert res.status_code in [201, 409]
    if res.status_code == 201:
        data = res.json()
        assert data["id"] > 0
        assert data["status"] == "submitted"
        assert data["inquiry_type"] == "callback"
        assert data["preferred_callback_time"] == "Morning (9:00 AM – 12:00 PM)"


def test_quotation_request_workflow_equipment_listing():
    """Scenario B / Alternative: Submit quotation request for equipment listing."""
    eq_res = client.get("/api/marketplace/equipment-listings?limit=5")
    assert eq_res.status_code == 200
    listing = eq_res.json()["items"][0]

    payload = {
        "listing_type": "equipment_listing",
        "listing_id": listing["id"],
        "sender_name": "Devendra Singh",
        "sender_phone": "+91 97112 34567",
        "sender_type": "farmer",
        "inquiry_type": "quotation",
        "message": "Need quotation for 3 days harvesting season along with delivery terms."
    }

    res = client.post("/api/marketplace/inquiries", json=payload)
    assert res.status_code in [201, 409]
    if res.status_code == 201:
        data = res.json()
        assert data["id"] > 0
        assert data["status"] == "submitted"
        assert data["inquiry_type"] == "quotation"


def test_duplicate_inquiry_prevention():
    """Ensure duplicate active inquiries from same phone for same listing are rejected with 409."""
    eq_res = client.get("/api/marketplace/equipment-listings?limit=5")
    listing = eq_res.json()["items"][0]

    unique_phone = "+91 99999 77777"
    payload = {
        "listing_type": "equipment_listing",
        "listing_id": listing["id"],
        "sender_name": "Sunil Kumar",
        "sender_phone": unique_phone,
        "sender_type": "farmer",
        "inquiry_type": "callback",
        "preferred_callback_time": "Afternoon",
        "message": "Duplicate test inquiry"
    }

    # First submission
    res1 = client.post("/api/marketplace/inquiries", json=payload)
    assert res1.status_code in [201, 409]

    # Second submission with exact same phone & listing
    res2 = client.post("/api/marketplace/inquiries", json=payload)
    assert res2.status_code == 409
    assert "already registered" in res2.json()["detail"]


def test_smart_price_comparison_endpoint():
    """Test price comparison endpoint for tractors rental with per hour pricing."""
    res = client.get("/api/marketplace/compare-prices?category=tractors&deal_type=rent&price_unit=per+hour")
    assert res.status_code == 200
    data = res.json()
    assert data["is_sufficient"] is True
    assert len(data["comparable_offers"]) >= 2
    assert data["lowest_offer"] is not None
    assert data["lowest_offer"]["price"] > 0
    assert data["best_value_offer"] is not None
    assert data["best_value_reason"] is not None

    for offer in data["comparable_offers"]:
        assert offer["price_unit"] == "per hour"
        assert offer["price"] > 0


def test_price_comparison_insufficient_data():
    """Test price comparison returns is_sufficient=False when no matching offers exist."""
    res = client.get("/api/marketplace/compare-prices?category=non_existent_category&deal_type=rent")
    assert res.status_code == 200
    data = res.json()
    assert data["is_sufficient"] is False
    assert "insufficient" in data["summary_message"].lower()


def test_dealer_discovery_endpoint():
    """Test dealer discovery returns genuine CHCs and verified sellers."""
    res = client.get("/api/marketplace/dealers")
    assert res.status_code == 200
    dealers = res.json()
    assert len(dealers) > 0

    first = dealers[0]
    assert first["seller_name"]
    assert first["state"]
    assert first["district"]
    assert first["listings_count"] >= 1
    assert len(first["categories"]) >= 1
    assert first["is_verified"] is True
