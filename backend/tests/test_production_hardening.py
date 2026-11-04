import unittest
from datetime import datetime, date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from db.session import get_db, Base
from db.models import User, ProduceListing, BuyerRequirement, FarmerFeedback, FarmerProfile
from services.auth_service import create_access_token
from services.providers.demo import DemoWeatherProvider
from core.config import settings


class ProductionHardeningTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///./krishiai_test_hardening.db", connect_args={"check_same_thread": False})
        cls.TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        Base.metadata.create_all(bind=cls.engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=cls.engine)

    def setUp(self):
        self.db = self.TestingSessionLocal()
        def override_get_db():
            try:
                yield self.db
            finally:
                pass
        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        self.db.rollback()
        self.db.close()
        app.dependency_overrides.clear()

    def test_01_weather_demo_provider_integrity(self):
        """Verify DemoWeatherProvider is strictly not configured unless explicitly enabled in debug."""
        provider = DemoWeatherProvider(None, None)
        # By default in config, ENABLE_DEMO_WEATHER is False
        settings.ENABLE_DEMO_WEATHER = False
        self.assertFalse(provider.is_configured, "Demo weather provider must never masquerade as active in default/production configuration.")

    def test_02_disease_indeterminate_symptom_accuracy(self):
        """Verify symptom query without match returns 0.0 confidence and inconclusive status."""
        res = self.client.post("/api/disease/predict?crop_hint=Dragonfruit&symptom_notes=unrecognized_foliage_irregularity")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "inconclusive")
        self.assertEqual(data["confidence"], 0.0)
        self.assertTrue(data["recommend_expert_review"])
        self.assertIn("KVK", data["note"])

    def test_03_auth_update_me_persists_language(self):
        """Verify PATCH /api/auth/me persists preferred language to database."""
        # Create test user
        user = User(
            phone_number="9876500001",
            name="Ramesh Kumar",
            role="Farmer",
            language="en",
            is_active=True,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        token = create_access_token({"sub": str(user.id), "phone": user.phone_number, "role": user.role})
        headers = {"Authorization": f"Bearer {token}"}

        # Update language to Hindi
        res = self.client.patch("/api/auth/me", json={"language": "hi"}, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["language"], "hi")

        # Verify DB directly
        updated = self.db.query(User).filter(User.id == user.id).first()
        self.assertEqual(updated.language, "hi")

    def test_04_marketplace_produce_status_ownership_authorization(self):
        """Verify IDOR prevention: User B cannot modify User A's produce listing status."""
        user_a = User(phone_number="9876500002", name="Farmer A", role="Farmer", is_active=True)
        user_b = User(phone_number="9876500003", name="Farmer B", role="Farmer", is_active=True)
        self.db.add_all([user_a, user_b])
        self.db.commit()

        listing = ProduceListing(
            user_id=user_a.id,
            crop_name="Paddy",
            category="cereal",
            quantity=100.0,
            quantity_unit="Quintal",
            asking_price=2200.0,
            price_unit="per Quintal",
            farmer_name="Farmer A",
            state="Punjab",
            district="Ludhiana",
            availability_status="available",
            verification_status="self_declared",
            contact_consent_verified=False,
            last_confirmation_date=date.today(),
        )
        self.db.add(listing)
        self.db.commit()

        token_b = create_access_token({"sub": str(user_b.id), "phone": user_b.phone_number, "role": user_b.role})
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User B attempts to change status of User A's listing
        res = self.client.patch(f"/api/marketplace/produce-listings/{listing.id}/status?status_value=sold_out", headers=headers_b)
        self.assertEqual(res.status_code, 403, "Cross-user listing modification must be blocked with 403 Forbidden.")

        # User A modifies own listing
        token_a = create_access_token({"sub": str(user_a.id), "phone": user_a.phone_number, "role": user_a.role})
        headers_a = {"Authorization": f"Bearer {token_a}"}
        res_a = self.client.patch(f"/api/marketplace/produce-listings/{listing.id}/status?status_value=sold_out", headers=headers_a)
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.json()["availability_status"], "sold_out")

    def test_05_marketplace_buyer_requirement_ownership_authorization(self):
        """Verify IDOR prevention: User B cannot modify User A's buyer requirement."""
        buyer_a = User(phone_number="9876500004", name="Buyer A", role="Buyer", is_active=True)
        buyer_b = User(phone_number="9876500005", name="Buyer B", role="Buyer", is_active=True)
        self.db.add_all([buyer_a, buyer_b])
        self.db.commit()

        req = BuyerRequirement(
            user_id=buyer_a.id,
            commodity="Wheat",
            required_quantity=50.0,
            quantity_unit="Quintal",
            buyer_name="Buyer A Enterprise",
            buyer_type="Wholesale Trader",
            buyer_location="Indore",
            state="Madhya Pradesh",
            district="Indore",
            status="active",
            offer_expiry_date=date(2026, 12, 31),
            verification_status="self_declared",
            contact_consent_verified=False,
        )
        self.db.add(req)
        self.db.commit()

        token_b = create_access_token({"sub": str(buyer_b.id), "phone": buyer_b.phone_number, "role": buyer_b.role})
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Buyer B attempts to cancel Buyer A's requirement
        res = self.client.patch(f"/api/marketplace/buyer-requirements/{req.id}/status?status_value=cancelled", headers=headers_b)
        self.assertEqual(res.status_code, 403, "Cross-user requirement modification must be blocked with 403 Forbidden.")

        # Buyer A modifies own requirement
        token_a = create_access_token({"sub": str(buyer_a.id), "phone": buyer_a.phone_number, "role": buyer_a.role})
        headers_a = {"Authorization": f"Bearer {token_a}"}
        res_a = self.client.patch(f"/api/marketplace/buyer-requirements/{req.id}/status?status_value=fulfilled", headers=headers_a)
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.json()["status"], "fulfilled")

    def test_06_feedback_support_ticket_creation(self):
        """Verify support inquiry generates real tracked ticket reference."""
        payload = {
            "feedback_type": "help",
            "category": "general",
            "content_text": "Need assistance regarding crop insurance scheme enrollment.",
            "contact_info": "farmer@example.com / 9876500009",
            "language": "hi",
            "source_page": "/contact",
            "is_anonymous": False,
            "contact_consent": True,
        }
        res = self.client.post("/api/feedback", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data["feedback_ref"].startswith("KB-FB-"))

        # Verify DB entry
        fb = self.db.query(FarmerFeedback).filter(FarmerFeedback.feedback_ref == data["feedback_ref"]).first()
        self.assertIsNotNone(fb)
        self.assertEqual(fb.feedback_type, "help")
        self.assertEqual(fb.status, "received")


if __name__ == "__main__":
    unittest.main()
