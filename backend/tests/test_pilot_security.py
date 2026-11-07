import io
import os
import sys
import unittest
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from db.session import get_db, Base
from db.models import User, AdvisoryCase
from services.auth_service import create_access_token


class TestPilotSecurityAndHardening(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        Base.metadata.create_all(bind=cls.engine)

        def override_get_db():
            db = cls.TestingSessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

        # Seed test users
        db = cls.TestingSessionLocal()
        cls.farmer_user = User(
            phone_number="9876500001",
            email="farmer_sec@example.com",
            name="Ramesh Security",
            role="farmer",
            is_active=True,
        )
        cls.expert_user = User(
            phone_number="9876500002",
            email="expert_sec@example.com",
            name="Dr. Kavita Agronomist",
            role="expert",
            is_active=True,
        )
        cls.other_farmer = User(
            phone_number="9876500003",
            email="other_farmer@example.com",
            name="Suresh Other",
            role="farmer",
            is_active=True,
        )
        db.add_all([cls.farmer_user, cls.expert_user, cls.other_farmer])
        db.commit()
        db.refresh(cls.farmer_user)
        db.refresh(cls.expert_user)
        db.refresh(cls.other_farmer)
        db.close()

        cls.farmer_token = create_access_token(data={"sub": str(cls.farmer_user.id), "phone": cls.farmer_user.phone_number})
        cls.expert_token = create_access_token(data={"sub": str(cls.expert_user.id), "phone": cls.expert_user.phone_number})
        cls.other_farmer_token = create_access_token(data={"sub": str(cls.other_farmer.id), "phone": cls.other_farmer.phone_number})

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    def test_file_size_limit_rejection(self):
        """Files exceeding 15MB are rejected with HTTP 413."""
        huge_data = b"0" * (15 * 1024 * 1024 + 1024)
        files = {"file": ("oversized.jpg", huge_data, "image/jpeg")}
        res = self.client.post("/api/disease/upload-pilot-image", files=files)
        self.assertEqual(res.status_code, 413)

    def test_empty_or_corrupt_file_rejection(self):
        """Empty or non-image corrupted files are rejected with HTTP 400."""
        # 1. Empty file
        files = {"file": ("empty.jpg", b"", "image/jpeg")}
        res = self.client.post("/api/disease/upload-pilot-image", files=files)
        self.assertEqual(res.status_code, 400)

        # 2. Corrupt fake JPEG
        corrupt_bytes = b"\xFF\xD8\xFF" + b"random_corrupt_non_image_payload" * 10
        files = {"file": ("fake.jpg", corrupt_bytes, "image/jpeg")}
        res = self.client.post("/api/disease/upload-pilot-image", files=files)
        self.assertEqual(res.status_code, 400)

    def test_path_traversal_protection(self):
        """Directory traversal attempts on image retrieval are rejected."""
        traversal_attempts = [
            "..%2F..%2Fetc%2Fpasswd",
            "..%5Cwindows%5Cwin.ini",
            "..%2Fsecret.txt",
            "%2Fabsolute%2Fpath%2Fimage.jpg",
        ]
        for attempt in traversal_attempts:
            res = self.client.get(f"/api/disease/images/{attempt}")
            self.assertIn(res.status_code, [400, 404])

    def test_export_endpoint_access_control(self):
        """Dataset export requires expert or admin role; farmer & anonymous are blocked."""
        # 1. Anonymous -> 401
        res = self.client.get("/api/disease/advisory/export")
        self.assertEqual(res.status_code, 401)

        # 2. Ordinary farmer -> 403
        res = self.client.get(
            "/api/disease/advisory/export",
            headers={"Authorization": f"Bearer {self.farmer_token}"},
        )
        self.assertEqual(res.status_code, 403)

        # 3. Agronomist expert -> 200
        res = self.client.get(
            "/api/disease/advisory/export",
            headers={"Authorization": f"Bearer {self.expert_token}"},
        )
        self.assertEqual(res.status_code, 200)

    def test_consent_withdrawal_and_erasure(self):
        """Farmer can revoke consent and erase data; third-party farmers are blocked."""
        db = self.TestingSessionLocal()
        case = AdvisoryCase(
            case_id="ADV-SEC-001",
            user_id=self.farmer_user.id,
            farmer_name="Ramesh Security",
            farmer_phone="9876543210",
            farmer_phone_masked="******3210",
            preferred_contact_method="whatsapp",
            consent_recorded=True,
            consent_for_research=True,
            crop_name="Tomato",
            state="Maharashtra",
            district="Nashik",
            ai_predicted_disease="Tomato Early Blight",
            ai_confidence=0.75,
            review_outcome="confirmed_correct",
            status="resolved",
        )
        db.add(case)
        db.commit()
        db.close()

        # 1. Unauthorized farmer cannot withdraw Ramesh's consent -> 403
        res = self.client.post(
            "/api/disease/advisory/cases/ADV-SEC-001/withdraw-consent",
            headers={"Authorization": f"Bearer {self.other_farmer_token}"},
        )
        self.assertEqual(res.status_code, 403)

        # 2. Owner farmer can withdraw consent -> 200
        res = self.client.post(
            "/api/disease/advisory/cases/ADV-SEC-001/withdraw-consent",
            headers={"Authorization": f"Bearer {self.farmer_token}"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["consent_for_research"])

        # 3. Verify case is excluded from export
        res = self.client.get(
            "/api/disease/advisory/export?consent_only=true",
            headers={"Authorization": f"Bearer {self.expert_token}"},
        )
        self.assertEqual(res.status_code, 200)
        exported_ids = [r["case_id"] for r in res.json()["records"]]
        self.assertNotIn("ADV-SEC-001", exported_ids)

        # 4. Unauthorized farmer cannot delete case -> 403
        res = self.client.delete(
            "/api/disease/advisory/cases/ADV-SEC-001",
            headers={"Authorization": f"Bearer {self.other_farmer_token}"},
        )
        self.assertEqual(res.status_code, 403)

        # 5. Owner farmer can delete case -> 200
        res = self.client.delete(
            "/api/disease/advisory/cases/ADV-SEC-001",
            headers={"Authorization": f"Bearer {self.farmer_token}"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "deleted")

        # 6. Verify case no longer exists
        res = self.client.get("/api/disease/advisory/cases/ADV-SEC-001")
        self.assertEqual(res.status_code, 404)


if __name__ == "__main__":
    unittest.main()
