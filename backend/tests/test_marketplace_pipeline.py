"""Unit & Integration tests for Agricultural Marketplace and Equipment Reference Catalogue."""
import os
import sys
import unittest
from datetime import date

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key-12345")
os.environ.setdefault("DEBUG", "1")

from fastapi.testclient import TestClient
from main import app
from db.session import Base, engine, SessionLocal
from db import models
from services.marketplace_import import (
    EquipmentCatalogueImporter,
    AgmarknetPriceImporter,
    seed_marketplace_catalogue,
)


class TestMarketplacePipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        seed_marketplace_catalogue(cls.db, force=True)
        cls.client = TestClient(app, raise_server_exceptions=True)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_sources_endpoint(self):
        """GET /api/marketplace/sources returns registered external sources with provenance terms."""
        r = self.client.get("/api/marketplace/sources")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreaterEqual(len(data), 5)
        slugs = [s["source_slug"] for s in data]
        self.assertIn("farmech_fmtti", slugs)
        self.assertIn("agmarknet_mandi", slugs)
        self.assertIn("mfg_catalogues", slugs)

    def test_equipment_catalog_categories(self):
        """GET /api/marketplace/catalog/categories returns all 11 required equipment categories."""
        r = self.client.get("/api/marketplace/catalog/categories")
        self.assertEqual(r.status_code, 200)
        categories = [item["category"] for item in r.json()]
        expected_categories = [
            "tractors",
            "harvesters",
            "rotavators",
            "seed_drills",
            "cultivators",
            "ploughs",
            "sprayers",
            "threshers",
            "agricultural_trailers",
            "irrigation_equipment",
            "other_implements",
        ]
        for ec in expected_categories:
            self.assertIn(ec, categories, f"Missing category: {ec}")

    def test_equipment_catalog_filtering(self):
        """GET /api/marketplace/catalog/equipment supports category, brand, and HP filtering."""
        # Filter tractors
        r = self.client.get("/api/marketplace/catalog/equipment?category=tractors")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreater(data["total"], 0)
        for item in data["items"]:
            self.assertEqual(item["category"], "tractors")
            self.assertTrue(item["is_reference_only"])
            self.assertIsNotNone(item["provenance_source"])

        # Filter by brand
        r_brand = self.client.get("/api/marketplace/catalog/equipment?brand=Mahindra")
        self.assertEqual(r_brand.status_code, 200)
        data_brand = r_brand.json()
        self.assertGreater(data_brand["total"], 0)

        # Filter by HP range
        r_hp = self.client.get("/api/marketplace/catalog/equipment?min_hp=45&max_hp=55")
        self.assertEqual(r_hp.status_code, 200)
        data_hp = r_hp.json()
        for item in data_hp["items"]:
            if item["hp_rating"] is not None:
                self.assertGreaterEqual(item["hp_rating"], 45.0)
                self.assertLessEqual(item["hp_rating"], 55.0)

    def test_equipment_listings_rent_and_sale(self):
        """GET /api/marketplace/equipment-listings returns live rent and sale items."""
        r_rent = self.client.get("/api/marketplace/equipment-listings?listing_type=rent")
        self.assertEqual(r_rent.status_code, 200)
        data_rent = r_rent.json()
        self.assertGreater(data_rent["total"], 0)
        for item in data_rent["items"]:
            self.assertEqual(item["listing_type"], "rent")
            self.assertIsNotNone(item["owner_name"])
            self.assertTrue(item["owner_consent_shared"])

        r_sale = self.client.get("/api/marketplace/equipment-listings?listing_type=sale")
        self.assertEqual(r_sale.status_code, 200)
        data_sale = r_sale.json()
        self.assertGreater(data_sale["total"], 0)

    def test_produce_listings_direct_from_farms(self):
        """GET /api/marketplace/produce-listings filters farmer produce lots by crop and district."""
        r = self.client.get("/api/marketplace/produce-listings?crop_name=Wheat")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreater(data["total"], 0)
        for item in data["items"]:
            self.assertIn("wheat", item["crop_name"].lower())
            self.assertIsNotNone(item["farmer_name"])
            self.assertIsNotNone(item["asking_price"])

    def test_market_prices_benchmark_context(self):
        """GET /api/marketplace/market-prices returns AGMARKNET observations with provenance."""
        r = self.client.get("/api/marketplace/market-prices?commodity=Wheat")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreater(len(data), 0)
        first = data[0]
        self.assertEqual(first["commodity"], "Wheat")
        self.assertIn("AGMARKNET", first["source_name"])
        self.assertGreater(first["modal_price"], 0)

    def test_duplicate_detection_and_normalization(self):
        """Importer normalizes units, detects duplicates by brand/model/category, and updates records."""
        importer = EquipmentCatalogueImporter(self.db, source_slug="farmech_fmtti")
        sample = [
            {
                "manufacturer": "Mahindra & Mahindra Ltd",
                "brand": "Mahindra",
                "model_name": "575 DI XP Plus",
                "category": "tractor",  # Tests synonym normalization
                "hp_rating": "47.0 HP",  # Tests unit string normalization
                "working_width_mm": "—",  # Tests dash to None
                "provenance_source": "CFMTTI Budni Test Code T-1184/2019",
                "provenance_license": "Public Technical Specification",
            }
        ]
        res = importer.import_records(sample, update_existing=True)
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["records_updated"], 1)  # Was updated, not duplicated!

    def test_create_and_update_listings(self):
        """Users can post equipment and produce listings, and update availability status."""
        new_produce = {
            "crop_name": "Mustard",
            "variety": "Pusa Bold",
            "category": "oilseed",
            "quantity": 100.0,
            "quantity_unit": "Quintal",
            "asking_price": 5300.0,
            "price_unit": "per Quintal",
            "is_negotiable": True,
            "grade_or_quality": "Grade A",
            "farmer_name": "Ramcharan Gurjar",
            "state": "Rajasthan",
            "district": "Bharatpur",
            "delivery_option": "Farm Gate Pickup",
        }
        r_post = self.client.post("/api/marketplace/produce-listings", json=new_produce)
        self.assertEqual(r_post.status_code, 201)
        created_id = r_post.json()["id"]

        # Update status to under_negotiation
        r_patch = self.client.patch(f"/api/marketplace/produce-listings/{created_id}/status?status_value=under_negotiation")
        self.assertEqual(r_patch.status_code, 200)
        self.assertEqual(r_patch.json()["availability_status"], "under_negotiation")


if __name__ == "__main__":
    unittest.main()
