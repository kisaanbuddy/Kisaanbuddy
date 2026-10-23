"""Tests for the Farmer Profile, Soil Tests, Recommendations, and Context APIs.
Written using Python's standard library unittest so it runs out-of-the-box without extra packages.
"""
import os
import sys
import unittest
from datetime import date

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-testing-only-12345")
os.environ.setdefault("DEBUG", "1")

from fastapi.testclient import TestClient
from main import app
from schemas.soil import SoilTestCreate, SoilTestResponse
from schemas.recommendation import RecommendationCreate, RecommendationResponse
from schemas.farmer import FarmerProfileCreate, FarmerProfileResponse
from services.chat.farmer_context import build_farmer_context, format_farmer_context


class TestFarmerProfile(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from db.session import engine, Base
        from db import models
        if engine:
            Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app, raise_server_exceptions=True)

    def test_health(self):
        """Backend health probe returns 200."""
        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["status"], "ok")

    def test_profile_requires_auth(self):
        """Farmer profile endpoint requires authentication."""
        r = self.client.get("/api/farmer/profile")
        self.assertIn(r.status_code, (401, 403))

    def test_soil_tests_require_auth(self):
        """Soil tests endpoint requires authentication."""
        r = self.client.get("/api/farmer/soil-tests")
        self.assertIn(r.status_code, (401, 403))

    def test_recommendations_require_auth(self):
        """Recommendations endpoint requires authentication."""
        r = self.client.get("/api/farmer/recommendations")
        self.assertIn(r.status_code, (401, 403))

    def test_fields_require_auth(self):
        """Fields endpoint requires authentication."""
        r = self.client.get("/api/farmer/fields")
        self.assertIn(r.status_code, (401, 403))

    def test_activities_require_auth(self):
        """Activities endpoint requires authentication."""
        r = self.client.get("/api/farmer/activities")
        self.assertIn(r.status_code, (401, 403))

    def test_farm_context_requires_auth(self):
        """Farm context endpoint requires authentication."""
        r = self.client.get("/api/farmer/context")
        self.assertIn(r.status_code, (401, 403))

    def test_farmer_context_builder_anonymous(self):
        """Context builder returns None for anonymous/unauthenticated request."""
        class DummyRequest:
            cookies = {}
        ctx = build_farmer_context(DummyRequest())
        self.assertIsNone(ctx)
        self.assertIsNone(format_farmer_context(None))

    def test_tasks_require_auth(self):
        """Farm tasks endpoint requires authentication."""
        r = self.client.get("/api/farmer/tasks")
        self.assertIn(r.status_code, (401, 403))

    def test_marketplace_listings_public(self):
        """Marketplace listings are publicly discoverable with benchmark listings."""
        r = self.client.get("/api/marketplace/listings")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

    def test_schemas_validation(self):
        """Verify soil test, recommendation, task, and marketplace schema validations."""
        from schemas.task import FarmTaskCreate
        from schemas.marketplace import MarketplaceListingCreate

        task = FarmTaskCreate(
            title="Inspect wheat field for yellow rust",
            category="scouting",
            priority="high",
            due_date=date(2026, 11, 20),
        )
        self.assertEqual(task.category, "scouting")
        self.assertEqual(task.priority, "high")

        listing = MarketplaceListingCreate(
            listing_type="buy",
            category="wholesale",
            crop_or_item="Wheat",
            organization_name="Kisan FPO Collective",
            district="Sehore",
            state="Madhya Pradesh",
        )
        self.assertEqual(listing.listing_type, "buy")
        self.assertEqual(listing.crop_or_item, "Wheat")

        st = SoilTestCreate(
            test_date=date(2026, 10, 15),
            soil_ph=6.8,
            nitrogen_kg_ha=280.0,
            phosphorus_kg_ha=22.0,
            potassium_kg_ha=190.0,
            organic_carbon_pct=0.72,
            is_verified=True,
        )
        self.assertEqual(st.soil_ph, 6.8)
        self.assertTrue(st.is_verified)

        rec = RecommendationCreate(
            title="Apply Urea Top Dressing",
            explanation="Crop is in tillering stage and needs nitrogen boost.",
            recommended_action="Apply 30 kg/acre Urea before next irrigation.",
            category="fertilizer",
            status="pending",
        )
        self.assertEqual(rec.category, "fertilizer")
        self.assertEqual(rec.status, "pending")

        profile = FarmerProfileCreate(
            village_name="Sehore",
            district_name="Sehore",
            state_name="Madhya Pradesh",
            pin_code="466001",
            land_holding_acres=5.2,
            land_ownership="owned",
            primary_crop="Wheat",
            has_irrigation=True,
            has_tractor=True,
        )
        self.assertEqual(profile.pin_code, "466001")
        self.assertEqual(profile.land_holding_acres, 5.2)


if __name__ == "__main__":
    unittest.main()
