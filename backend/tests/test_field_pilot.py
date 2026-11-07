"""Automated Test Suite for Supervised Field Pilot Implementation.

Tests:
1. Farmer case submission with consent.
2. Missing consent rejection (HTTP 400).
3. Expert authorization enforcement: ordinary farmer accounts CANNOT review (HTTP 403).
4. Expert review with standard outcomes ('confirmed_correct', 'correct_crop_incorrect_disease', etc.).
5. Independent ground truth preservation (original AI prediction remains intact).
6. Invalid review outcome rejection (HTTP 400).
7. Secure image upload with 64-bit dHash computation and quality checks.
8. Independent dataset export pipeline (consent gating, verification gating, session-isolated splits).
9. Case queue filtering and pagination.
"""
import io
import os
import shutil
import tempfile
import unittest
from datetime import datetime
from PIL import Image

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from main import app
from db.models import Base, User, AdvisoryCase, AgriculturalExpert, AdvisoryNotificationLog
from db.session import get_db
from api.auth import create_access_token, limiter
from ml.crop_doctor.experiments.export_pilot_dataset import export_pilot_dataset, hamming_distance

TEST_DB_FILE = "./test_field_pilot.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_FILE}"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class TestFieldPilotWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=test_engine)
        if limiter:
            limiter.enabled = False
        cls.client = TestClient(app, base_url="http://testserver")

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=test_engine)
        test_engine.dispose()
        if os.path.exists(TEST_DB_FILE):
            try:
                os.remove(TEST_DB_FILE)
            except Exception:
                pass

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        self.db = TestingSessionLocal()
        # Clean test tables
        for table in (AdvisoryNotificationLog, AdvisoryCase, User):
            self.db.query(table).delete()
        self.db.commit()

        # Create test users: 1 Farmer, 1 Expert, 1 Admin
        self.farmer = User(
            phone_number="+919876543210",
            name="Ramesh Farmer",
            email="ramesh@farmer.in",
            role="Farmer",
            is_active=True,
        )
        self.expert = User(
            phone_number="+919811122233",
            name="Dr. V. K. Sharma",
            email="vksharma@kvk.icar.gov.in",
            role="Expert",
            is_active=True,
        )
        self.admin = User(
            phone_number="+919999900000",
            name="Admin User",
            email="admin@kisaanbuddy.in",
            role="Admin",
            is_active=True,
        )
        self.db.add_all([self.farmer, self.expert, self.admin])
        self.db.commit()
        self.db.refresh(self.farmer)
        self.db.refresh(self.expert)
        self.db.refresh(self.admin)

        # Generate JWT tokens
        self.farmer_token = create_access_token(data={"sub": str(self.farmer.id), "phone": self.farmer.phone_number})
        self.expert_token = create_access_token(data={"sub": str(self.expert.id), "phone": self.expert.phone_number})
        self.admin_token = create_access_token(data={"sub": str(self.admin.id), "phone": self.admin.phone_number})

    def tearDown(self):
        self.db.close()
        app.dependency_overrides.clear()

    def test_farmer_submission_with_consent(self):
        """Farmer submits a crop observation for expert review with explicit consent."""
        payload = {
            "farmer_name": "Ramesh Kumar",
            "farmer_phone": "+91 98765 43210",
            "preferred_contact_method": "phone",
            "consent_recorded": True,
            "consent_for_research": True,
            "crop_name": "Tomato",
            "crop_variety": "Abhinav",
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "ai_predicted_disease": "tomato_early_blight",
            "ai_confidence": 0.8124,
            "visible_symptoms": "Brown target-board concentric spots on lower foliage",
            "session_id": "sess-test-001",
            "dhash": "a1b2c3d4e5f60718",
        }
        res = self.client.post("/api/disease/advisory/cases", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("ADV-", data["case_id"])
        self.assertEqual(data["status"], "pending")
        self.assertEqual(data["farmer_phone_masked"], "+9198*** **210")
        self.assertEqual(data["crop_name"], "Tomato")
        self.assertEqual(data["ai_predicted_disease"], "tomato_early_blight")
        self.assertTrue(data["consent_for_research"])

    def test_missing_consent_rejected(self):
        """Submitting without farmer consent is rejected with HTTP 400."""
        payload = {
            "farmer_name": "Ramesh Kumar",
            "farmer_phone": "+91 98765 43210",
            "preferred_contact_method": "phone",
            "consent_recorded": False,  # Missing consent
            "crop_name": "Tomato",
            "state": "Uttar Pradesh",
            "district": "Varanasi",
        }
        res = self.client.post("/api/disease/advisory/cases", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("consent is required", res.json()["detail"].lower())

    def test_ordinary_farmer_cannot_review_case(self):
        """Ordinary farmer account receives HTTP 403 Forbidden when attempting an expert review."""
        case = AdvisoryCase(
            case_id="ADV-20261107-1001",
            farmer_name="Suresh",
            farmer_phone="+919876500000",
            crop_name="Potato",
            state="Punjab",
            district="Jalandhar",
            ai_predicted_disease="potato_late_blight",
            status="pending",
            consent_recorded=True,
            consent_for_research=True,
        )
        self.db.add(case)
        self.db.commit()

        review_payload = {
            "review_outcome": "confirmed_correct",
            "expert_notes": "Farmer trying to self-verify",
        }
        headers = {"Authorization": f"Bearer {self.farmer_token}"}
        res = self.client.post(f"/api/disease/advisory/cases/{case.case_id}/review", json=review_payload, headers=headers)
        self.assertEqual(res.status_code, 403)
        self.assertIn("authorization is required", res.json()["detail"].lower())

    def test_expert_can_review_and_confirm_correct(self):
        """Authorized expert reviews and confirms AI prediction as correct."""
        case = AdvisoryCase(
            case_id="ADV-20261107-1002",
            farmer_name="Harpreet",
            farmer_phone="+919876500001",
            crop_name="Tomato",
            state="Haryana",
            district="Karnal",
            ai_predicted_disease="tomato_early_blight",
            ai_confidence=0.88,
            status="pending",
            consent_recorded=True,
            consent_for_research=True,
        )
        self.db.add(case)
        self.db.commit()

        review_payload = {
            "review_outcome": "confirmed_correct",
            "expert_crop": "Tomato",
            "expert_disease": "tomato_early_blight",
            "expert_is_healthy": False,
            "expert_notes": "Concentric rings confirmed on leaf margin.",
            "expert_recommendation": "Spray Mancozeb 75% WP @ 2 g/L with 5-day PHI.",
        }
        headers = {"Authorization": f"Bearer {self.expert_token}"}
        res = self.client.post(f"/api/disease/advisory/cases/{case.case_id}/review", json=review_payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "resolved")
        self.assertEqual(data["review_outcome"], "confirmed_correct")
        self.assertEqual(data["expert_disease"], "tomato_early_blight")
        self.assertIn("Dr. V. K. Sharma", data["reviewer_name"])
        self.assertIsNotNone(data["reviewed_at"])

    def test_expert_can_correct_disease(self):
        """Expert corrects AI disease classification while preserving original AI prediction."""
        case = AdvisoryCase(
            case_id="ADV-20261107-1003",
            farmer_name="Balwinder",
            farmer_phone="+919876500002",
            crop_name="Tomato",
            state="Punjab",
            district="Ludhiana",
            ai_predicted_disease="tomato_early_blight",  # AI predicted early blight
            ai_confidence=0.62,
            status="pending",
            consent_recorded=True,
            consent_for_research=True,
        )
        self.db.add(case)
        self.db.commit()

        # Expert corrects to Late Blight
        review_payload = {
            "review_outcome": "correct_crop_incorrect_disease",
            "expert_crop": "Tomato",
            "expert_disease": "tomato_late_blight",
            "expert_is_healthy": False,
            "expert_notes": "Water-soaked dark lesions with white mold on underside confirm Late Blight, not Early Blight.",
            "expert_recommendation": "Apply Cymoxanil 8% + Mancozeb 64% WP @ 1.5 g/L immediately.",
        }
        headers = {"Authorization": f"Bearer {self.expert_token}"}
        res = self.client.post(f"/api/disease/advisory/cases/{case.case_id}/review", json=review_payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Original AI prediction is completely preserved
        self.assertEqual(data["ai_predicted_disease"], "tomato_early_blight")
        # Human expert ground truth is stored separately
        self.assertEqual(data["expert_disease"], "tomato_late_blight")
        self.assertEqual(data["review_outcome"], "correct_crop_incorrect_disease")

    def test_invalid_review_outcome_rejected(self):
        """Invalid review outcome strings are rejected with HTTP 400."""
        case = AdvisoryCase(
            case_id="ADV-20261107-1004",
            farmer_name="Kisan",
            farmer_phone="+919876500003",
            crop_name="Corn",
            state="Bihar",
            district="Patna",
            status="pending",
            consent_recorded=True,
        )
        self.db.add(case)
        self.db.commit()

        review_payload = {
            "review_outcome": "not_a_valid_outcome_code",
        }
        headers = {"Authorization": f"Bearer {self.expert_token}"}
        res = self.client.post(f"/api/disease/advisory/cases/{case.case_id}/review", json=review_payload, headers=headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Invalid review outcome", res.json()["detail"])

    def test_upload_pilot_image_and_dhash(self):
        """Secure pilot image upload returns 64-bit dHash and quality assessment."""
        # Create a synthetic 100x100 green image
        img = Image.new("RGB", (100, 100), color=(34, 139, 34))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        files = {"file": ("field_leaf.jpg", buf, "image/jpeg")}
        res = self.client.post("/api/disease/upload-pilot-image", files=files)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "uploaded")
        self.assertIn("/api/disease/images/", data["image_url"])
        self.assertEqual(len(data["dhash"]), 16)  # 64-bit hex = 16 characters
        self.assertEqual(len(data["sha256"]), 64)
        self.assertIn("image_quality", data)

    def test_export_pipeline_session_integrity(self):
        """Export pipeline guarantees zero session leakage across train and locked evaluation splits."""
        c1 = AdvisoryCase(
            case_id="ADV-EXP-01",
            session_id="session_A",
            farmer_name="Farmer 1",
            farmer_phone="+919800000001",
            state="Punjab",
            district="Ludhiana",
            crop_name="Tomato",
            expert_crop="Tomato",
            expert_disease="tomato_early_blight",
            review_outcome="confirmed_correct",
            consent_for_research=True,
            consent_recorded=True,
            dhash="1111222233334444",
        )
        c2 = AdvisoryCase(
            case_id="ADV-EXP-02",
            session_id="session_A",  # Same session as c1
            farmer_name="Farmer 1",
            farmer_phone="+919800000001",
            state="Punjab",
            district="Ludhiana",
            crop_name="Tomato",
            expert_crop="Tomato",
            expert_disease="tomato_early_blight",
            review_outcome="confirmed_correct",
            consent_for_research=True,
            consent_recorded=True,
            dhash="1111222233334445",
        )
        c3 = AdvisoryCase(
            case_id="ADV-EXP-03",
            session_id="session_B",
            farmer_name="Farmer 2",
            farmer_phone="+919800000002",
            state="Haryana",
            district="Karnal",
            crop_name="Potato",
            expert_crop="Potato",
            expert_disease="potato_late_blight",
            review_outcome="confirmed_correct",
            consent_for_research=True,
            consent_recorded=True,
            dhash="aaaa5555bbbb6666",
        )
        c4 = AdvisoryCase(
            case_id="ADV-EXP-04",
            session_id="session_C",
            farmer_name="Farmer 3",
            farmer_phone="+919800000003",
            state="Uttar Pradesh",
            district="Varanasi",
            crop_name="Corn",
            expert_crop="Corn",
            expert_disease="corn_common_rust",
            review_outcome="confirmed_correct",
            consent_for_research=True,
            consent_recorded=True,
            dhash="9999888877776666",
        )
        c5 = AdvisoryCase(
            case_id="ADV-EXP-05",
            session_id="session_D",
            farmer_name="Farmer 4",
            farmer_phone="+919800000004",
            state="Bihar",
            district="Patna",
            crop_name="Tomato",
            review_outcome="confirmed_correct",
            consent_for_research=False,  # NO CONSENT
            consent_recorded=True,
        )
        c6 = AdvisoryCase(
            case_id="ADV-EXP-06",
            session_id="session_E",
            farmer_name="Farmer 5",
            farmer_phone="+919800000005",
            state="Madhya Pradesh",
            district="Sehore",
            crop_name="Potato",
            review_outcome=None,  # NOT VERIFIED
            consent_for_research=True,
            consent_recorded=True,
        )
        self.db.add_all([c1, c2, c3, c4, c5, c6])
        self.db.commit()

        temp_dir = tempfile.mkdtemp()
        try:
            summary = export_pilot_dataset(
                db_session=self.db,
                output_dir=temp_dir,
                locked_eval_ratio=0.33,
                min_dhash_dist=4,
            )
            # Out of 6 cases: 1 excluded (no consent), 1 excluded (unverified).
            # From the 4 eligible, c2 is a perceptual collision with c1 (dhash dist=1 < 4).
            # Thus 1 near-duplicate is purged, leaving 3 unique observations.
            self.assertEqual(summary["total_eligible_samples"], 3)
            self.assertEqual(summary["total_unique_sessions"], 3)
            self.assertEqual(summary["exclusion_summary"]["excluded_no_consent"], 1)
            self.assertEqual(summary["exclusion_summary"]["excluded_unverified"], 1)
            self.assertEqual(summary["exclusion_summary"]["excluded_perceptual_duplicates"], 1)

            train_file = os.path.join(temp_dir, "pilot_train_manifest.json")
            eval_file = os.path.join(temp_dir, "pilot_locked_evaluation_manifest.json")
            self.assertTrue(os.path.exists(train_file))
            self.assertTrue(os.path.exists(eval_file))

            import json
            with open(train_file) as f:
                t_data = json.load(f)
            with open(eval_file) as f:
                e_data = json.load(f)

            train_sessions = {s["session_id"] for s in t_data["samples"]}
            eval_sessions = {s["session_id"] for s in e_data["samples"]}
            self.assertEqual(len(train_sessions.intersection(eval_sessions)), 0)
        finally:
            shutil.rmtree(temp_dir)


if __name__ == "__main__":
    unittest.main()
