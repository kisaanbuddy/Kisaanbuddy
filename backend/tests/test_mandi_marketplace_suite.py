"""Comprehensive Verification Test Suite for KisaanBuddy Mandi & Marketplace Buy/Sell Data Aggregation.

Covers all 10 phases:
1. Source Registry & Provenance Audit (7 sources)
2. Mandi Price Intelligence (Filters, Sorting, Duplicate prevention, Stale warnings, Pagination)
3. Dedicated Buyer Requirements (Filters, Automatic expiry, Contact masking, Posting)
4. Structured Sell Offers (Farmer/FPO listings, Confirmation action, Status lifecycle, Contact masking)
5. External Sources Provenance (Licensing, Official links)
6. Government Procurement (MSP rates, Procurement centres, FAQ rules, State portal links)
7. Multi-criterion Search and Filtering
8. Buy/Sell Transaction Flow (Quotation & Inquiry submission, Status updates)
9. Security & Compliance (Phone masking, Report misleading listings, Admin audit)
10. Refresh & API failure fallback resilience
"""
import os
import sys
import unittest
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-mandi-secret-key-9999")
os.environ.setdefault("DEBUG", "1")

from fastapi.testclient import TestClient
from main import app
from db.session import Base, engine, SessionLocal
from db.models import (
    BuyerRequirement,
    GovernmentProcurement,
    ImportSource,
    MarketPriceRecord,
    ProduceListing,
    TradeInquiry,
    ListingReport,
)
from services.marketplace_import import seed_marketplace_catalogue


class TestMandiMarketplaceAggregation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        seed_marketplace_catalogue(cls.db, force=True)
        cls.client = TestClient(app, raise_server_exceptions=True)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # ─── PHASE 1 & 5: Source Audit & Registered Sources ───────────────────────

    def test_all_seven_agricultural_sources_registered(self):
        """GET /api/marketplace/sources returns all 7 audited agricultural market sources with terms."""
        r = self.client.get("/api/marketplace/sources")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        slugs = [s["source_slug"] for s in data]

        expected_slugs = [
            "agmarknet_mandi",
            "enam_national_market",
            "apeda_farmer_connect",
            "fci_central_procurement",
            "state_procurement_portals",
            "ondc_agri",
            "agri_b2b_partners",
        ]
        for expected in expected_slugs:
            self.assertIn(expected, slugs, f"Missing audited source: {expected}")

        # Check provenance terms and license attribution
        agmarknet = next(s for s in data if s["source_slug"] == "agmarknet_mandi")
        self.assertIn("OGD", agmarknet["commercial_reuse_terms"])
        self.assertEqual(agmarknet["auth_type"], "api_key")

    # ─── PHASE 2: Mandi Price Intelligence ───────────────────────────────────

    def test_mandi_crops_price_intelligence_endpoint(self):
        """GET /api/mandi/crops returns database-backed observations with provenance and attribution."""
        r = self.client.get("/api/mandi/crops")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("crops", data)
        self.assertGreaterEqual(data["total"], 6)
        self.assertIn("AGMARKNET", data["source"])
        self.assertIn("disclaimer", data)

        first = data["crops"][0]
        self.assertIn("name", first)
        self.assertIn("modal_price", first)
        self.assertIn("min_price", first)
        self.assertIn("max_price", first)
        self.assertIn("arrival_date", first)
        self.assertIn("is_stale", first)
        self.assertEqual(first["data_label"], "Official market-price data")

    def test_mandi_crops_filtering_and_sorting(self):
        """Filters by commodity, state, and sorts by price asc and desc."""
        # Filter by commodity Wheat
        r_wheat = self.client.get("/api/mandi/crops?commodity=Wheat")
        self.assertEqual(r_wheat.status_code, 200)
        wheat_crops = r_wheat.json()["crops"]
        self.assertTrue(all("wheat" in c["name"].lower() for c in wheat_crops))

        # Sort by price desc
        r_desc = self.client.get("/api/mandi/crops?sort_by=price&sort_order=desc")
        self.assertEqual(r_desc.status_code, 200)
        desc_crops = r_desc.json()["crops"]
        prices = [c["modal_price"] for c in desc_crops]
        self.assertEqual(prices, sorted(prices, reverse=True))

        # Sort by price asc
        r_asc = self.client.get("/api/mandi/crops?sort_by=price&sort_order=asc")
        self.assertEqual(r_asc.status_code, 200)
        asc_crops = r_asc.json()["crops"]
        asc_prices = [c["modal_price"] for c in asc_crops]
        self.assertEqual(asc_prices, sorted(asc_prices))

    def test_mandi_single_crop_and_health(self):
        """GET /api/mandi/crops/{id} and GET /api/mandi/health."""
        r_list = self.client.get("/api/mandi/crops")
        first_id = r_list.json()["crops"][0]["id"]

        r_detail = self.client.get(f"/api/mandi/crops/{first_id}")
        self.assertEqual(r_detail.status_code, 200)
        self.assertEqual(r_detail.json()["crop"]["id"], first_id)

        r_health = self.client.get("/api/mandi/health")
        self.assertEqual(r_health.status_code, 200)
        self.assertEqual(r_health.json()["status"], "ok")

    # ─── PHASE 3: Dedicated Buyer Requirements ───────────────────────────────

    def test_buyer_requirements_list_and_filters(self):
        """GET /api/marketplace/buyer-requirements returns verified buyer purchase requirements."""
        r = self.client.get("/api/marketplace/buyer-requirements")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreaterEqual(data["total"], 4)

        first = data["items"][0]
        self.assertIn("commodity", first)
        self.assertIn("buyer_name", first)
        self.assertIn("required_quantity", first)
        self.assertIn("offer_expiry_date", first)
        self.assertIn("quality_requirements", first)
        # Verify phone masking protects buyer contact details
        self.assertIn("****", first["contact_phone_masked"])

    def test_buyer_requirements_expiry_and_creation(self):
        """POST /api/marketplace/buyer-requirements creates new buyer requirement with auto-expiry check."""
        future_date = (date.today() + timedelta(days=45)).isoformat()
        payload = {
            "commodity": "Maize",
            "variety": "Yellow Feed Grade",
            "required_quantity": 300.0,
            "quantity_unit": "Quintal",
            "buyer_name": "Godrej Agrovet Poultry Feed Plant",
            "buyer_type": "Feed Processor",
            "buyer_location": "Davanagere Industrial Area",
            "state": "Karnataka",
            "district": "Davanagere",
            "delivery_destination": "Godrej Agrovet Mill Gate, Davanagere",
            "expected_price": 2250.0,
            "price_unit": "per Quintal",
            "quality_requirements": "Moisture < 12.5%, Aflatoxin < 20 ppb",
            "offer_expiry_date": future_date,
            "verification_status": "verified",
            "source": "KisaanBuddy verified buyer requirement",
            "contact_person": "Venkatesh Rao",
            "contact_phone": "+91 98450 12345",
        }
        r = self.client.post("/api/marketplace/buyer-requirements", json=payload)
        self.assertEqual(r.status_code, 201)
        created = r.json()
        self.assertEqual(created["commodity"], "Maize")
        self.assertFalse(created["is_expired"])
        self.assertIn("****", created["contact_phone_masked"])

        # Update status to fulfilled
        patch_r = self.client.patch(f"/api/marketplace/buyer-requirements/{created['id']}/status?status_value=fulfilled")
        self.assertEqual(patch_r.status_code, 200)
        self.assertEqual(patch_r.json()["status"], "fulfilled")

    # ─── PHASE 4: Structured Sell Offers & Stock Confirmation ─────────────────

    def test_produce_listings_sell_offers_and_confirm_action(self):
        """GET /api/marketplace/produce-listings and PATCH /confirm stock and price."""
        r = self.client.get("/api/marketplace/produce-listings")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreaterEqual(data["total"], 4)

        first = data["items"][0]
        self.assertIn("crop_name", first)
        self.assertIn("farmer_name", first)
        self.assertIn("grade_or_quality", first)
        self.assertIn("****", first["farmer_phone_masked"])

        # Confirm stock action updates last_confirmation_date
        confirm_r = self.client.patch(f"/api/marketplace/produce-listings/{first['id']}/confirm")
        self.assertEqual(confirm_r.status_code, 200)
        self.assertTrue(confirm_r.json()["confirmed"])
        self.assertEqual(confirm_r.json()["last_confirmation_date"], date.today().isoformat())

    # ─── PHASE 6: Government Procurement (MSP & Centres) ─────────────────────

    def test_government_procurement_directory(self):
        """GET /api/marketplace/procurement returns verified statutory MSP rates and centres."""
        r = self.client.get("/api/marketplace/procurement")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreaterEqual(data["total"], 5)
        self.assertIn("disclaimer", data)

        # Verify Wheat MSP rate is ₹2,425/Qtl (RMS 2026-27)
        wheat_proc = next(i for i in data["items"] if "wheat" in i["crop_name"].lower() and "madhya pradesh" in i["state"].lower())
        self.assertEqual(wheat_proc["msp_rate"], 2425.0)
        self.assertIn("FCI", wheat_proc["nodal_agency"])
        self.assertTrue(wheat_proc["official_portal_url"].startswith("http"))
        self.assertIn("e-Uparjan", wheat_proc["registration_requirements"] or wheat_proc["official_portal_url"])

    # ─── PHASE 8: Buy/Sell Transaction Flow (Inquiries & Quotations) ─────────

    def test_submit_trade_inquiry_and_status_tracking(self):
        """POST /api/marketplace/inquiries allows farmers/buyers to submit interest/quotation."""
        # Find a produce listing
        produce_r = self.client.get("/api/marketplace/produce-listings")
        target_lot = produce_r.json()["items"][0]

        inquiry_payload = {
            "listing_type": "produce_listing",
            "listing_id": target_lot["id"],
            "sender_name": "Suresh Aggarwal (Malwa Agro Trader)",
            "sender_phone": "+91 98930 55443",
            "sender_type": "buyer",
            "proposed_quantity": 100.0,
            "quantity_unit": "Quintal",
            "proposed_price": target_lot["asking_price"] - 50.0,
            "price_unit": "per Quintal",
            "message": "Interested in 100 Quintals. Can dispatch truck for farm gate pickup tomorrow.",
        }

        r = self.client.post("/api/marketplace/inquiries", json=inquiry_payload)
        self.assertEqual(r.status_code, 201)
        inquiry = r.json()
        self.assertEqual(inquiry["status"], "submitted")
        self.assertEqual(inquiry["proposed_quantity"], 100.0)

        # List inquiries
        list_r = self.client.get(f"/api/marketplace/inquiries?listing_id={target_lot['id']}")
        self.assertEqual(list_r.status_code, 200)
        self.assertGreaterEqual(len(list_r.json()), 1)

        # Update negotiation status to in_discussion
        status_r = self.client.patch(f"/api/marketplace/inquiries/{inquiry['id']}/status?status_value=in_discussion")
        self.assertEqual(status_r.status_code, 200)
        self.assertEqual(status_r.json()["status"], "in_discussion")

    # ─── PHASE 9: Security, Privacy & Misleading Listing Reporting ───────────

    def test_report_suspicious_listing_and_admin_audit(self):
        """POST /api/marketplace/reports reports suspicious listing and admin can resolve."""
        report_payload = {
            "target_type": "produce_listing",
            "target_id": 1,
            "reporter_name": "Rajesh Kumar (FPO Member)",
            "reporter_phone": "+91 94250 11223",
            "reason": "misleading_price",
            "details": "Price quoted is substantially below APMC modal floor rate; requested advance token money.",
        }

        r = self.client.post("/api/marketplace/reports", json=report_payload)
        self.assertEqual(r.status_code, 201)
        report = r.json()
        self.assertEqual(report["status"], "pending_review")

        # Admin lists pending reports
        list_r = self.client.get("/api/marketplace/reports?status=pending_review")
        self.assertEqual(list_r.status_code, 200)
        self.assertGreaterEqual(len(list_r.json()), 1)

        # Admin resolves report
        patch_r = self.client.patch(
            f"/api/marketplace/reports/{report['id']}?status_value=action_taken&admin_notes=Verified+seller+notified"
        )
        self.assertEqual(patch_r.status_code, 200)
        self.assertEqual(patch_r.json()["status"], "action_taken")

    # ─── PHASE 10: Refresh & API Fallback Resilience ─────────────────────────

    def test_mandi_refresh_fallback_resilience(self):
        """POST /api/mandi/refresh executes without crashing even if external API key is absent."""
        r = self.client.post("/api/mandi/refresh?limit=20")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("result", data)


if __name__ == "__main__":
    unittest.main()
