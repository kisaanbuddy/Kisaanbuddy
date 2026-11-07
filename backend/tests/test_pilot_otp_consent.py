import hashlib
import os
import sys
import unittest
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from db.session import get_db, Base
from db.models import User, UserOTP, AdvisoryCase, AdvisoryNotificationLog
from services.auth_service import create_access_token


class TestPilotOTPConsentRevocation(unittest.TestCase):
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

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    def setUp(self):
        self.db = self.TestingSessionLocal()
        # Seed test advisory case
        self.case = AdvisoryCase(
            case_id="ADV-OTP-101",
            farmer_name="Harish Farmer",
            farmer_phone="9876543210",
            farmer_phone_masked="******3210",
            preferred_contact_method="sms",
            consent_recorded=True,
            consent_for_research=True,
            crop_name="Tomato",
            state="Maharashtra",
            district="Nashik",
            ai_predicted_disease="Tomato Early Blight",
            ai_confidence=0.82,
            status="pending",
        )
        self.db.add(self.case)
        self.db.commit()

    def tearDown(self):
        self.db.query(AdvisoryNotificationLog).delete()
        self.db.query(UserOTP).delete()
        self.db.query(AdvisoryCase).delete()
        self.db.commit()
        self.db.close()

    def test_request_otp_timing_safe_generic_response(self):
        """OTP request never reveals whether a phone number or case exists."""
        # 1. Matching case & phone
        res1 = self.client.post("/api/disease/advisory/cases/ADV-OTP-101/request-consent-otp?phone=9876543210")
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        self.assertEqual(data1["status"], "otp_dispatched")
        self.assertIn("verification code has been dispatched", data1["message"])

        # 2. Non-existent case
        res2 = self.client.post("/api/disease/advisory/cases/ADV-NONEXISTENT/request-consent-otp?phone=9876543210")
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2["status"], "otp_dispatched")

        # 3. Mismatched phone
        res3 = self.client.post("/api/disease/advisory/cases/ADV-OTP-101/request-consent-otp?phone=9111111111")
        self.assertEqual(res3.status_code, 200)
        data3 = res3.json()
        self.assertEqual(data3["status"], "otp_dispatched")

    def test_valid_otp_revokes_consent(self):
        """Valid OTP successfully revokes research consent and writes audit record."""
        # Request OTP
        res_req = self.client.post("/api/disease/advisory/cases/ADV-OTP-101/request-consent-otp?phone=9876543210")
        self.assertEqual(res_req.status_code, 200)
        otp_code = res_req.json().get("_dev_test_code")
        self.assertIsNotNone(otp_code)

        # Submit withdrawal with OTP
        res_withdraw = self.client.post(
            f"/api/disease/advisory/cases/ADV-OTP-101/withdraw-consent?phone=9876543210&otp={otp_code}"
        )
        self.assertEqual(res_withdraw.status_code, 200)
        self.assertFalse(res_withdraw.json()["consent_for_research"])

        # Check DB state
        db_case = self.db.query(AdvisoryCase).filter(AdvisoryCase.case_id == "ADV-OTP-101").first()
        self.assertFalse(db_case.consent_for_research)

        # Verify audit log exists and does not contain plain OTP
        audit = self.db.query(AdvisoryNotificationLog).filter(
            AdvisoryNotificationLog.case_id == db_case.id
        ).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.status, "revoked")
        self.assertNotIn(otp_code, audit.message_snippet)

    def test_invalid_otp_rejected(self):
        """Incorrect OTP code is rejected with HTTP 403."""
        # Request OTP
        self.client.post("/api/disease/advisory/cases/ADV-OTP-101/request-consent-otp?phone=9876543210")

        # Attempt with wrong code
        res = self.client.post(
            "/api/disease/advisory/cases/ADV-OTP-101/withdraw-consent?phone=9876543210&otp=999999"
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("Invalid", res.json()["detail"])

    def test_expired_otp_rejected(self):
        """Expired OTP is rejected with HTTP 403."""
        # Create expired OTP record
        expired_time = datetime.utcnow() - timedelta(minutes=10)
        otp_record = UserOTP(
            phone_number="9876543210",
            hashed_otp=hashlib.sha256(b"123456").hexdigest(),
            expires_at=expired_time,
            attempts=0,
            is_verified=False,
        )
        self.db.add(otp_record)
        self.db.commit()

        res = self.client.post(
            "/api/disease/advisory/cases/ADV-OTP-101/withdraw-consent?phone=9876543210&otp=123456"
        )
        self.assertEqual(res.status_code, 403)

    def test_reused_otp_rejected(self):
        """Single-use OTP cannot be reused twice."""
        res_req = self.client.post("/api/disease/advisory/cases/ADV-OTP-101/request-consent-otp?phone=9876543210")
        otp_code = res_req.json().get("_dev_test_code")

        # 1st use succeeds
        res1 = self.client.post(
            f"/api/disease/advisory/cases/ADV-OTP-101/withdraw-consent?phone=9876543210&otp={otp_code}"
        )
        self.assertEqual(res1.status_code, 200)

        # 2nd use fails
        res2 = self.client.post(
            f"/api/disease/advisory/cases/ADV-OTP-101/withdraw-consent?phone=9876543210&otp={otp_code}"
        )
        self.assertEqual(res2.status_code, 403)

    def test_excessive_attempts_lockout(self):
        """After 3 failed attempts, OTP is burned and subsequent tries fail."""
        res_req = self.client.post("/api/disease/advisory/cases/ADV-OTP-101/request-consent-otp?phone=9876543210")
        correct_otp = res_req.json().get("_dev_test_code")

        # 3 wrong attempts
        for _ in range(3):
            res_bad = self.client.post(
                "/api/disease/advisory/cases/ADV-OTP-101/withdraw-consent?phone=9876543210&otp=000000"
            )
            self.assertEqual(res_bad.status_code, 403)

        # 4th attempt with the correct OTP must now fail due to lockout
        res_lockout = self.client.post(
            f"/api/disease/advisory/cases/ADV-OTP-101/withdraw-consent?phone=9876543210&otp={correct_otp}"
        )
        self.assertEqual(res_lockout.status_code, 403)

    def test_anonymous_deletion_requires_otp_and_succeeds(self):
        """Deleting a case anonymously without OTP returns 401; with OTP deletes record."""
        # 1. Without OTP -> 401
        res_no_otp = self.client.delete("/api/disease/advisory/cases/ADV-OTP-101?phone=9876543210")
        self.assertEqual(res_no_otp.status_code, 401)

        # 2. Request OTP
        res_req = self.client.post("/api/disease/advisory/cases/ADV-OTP-101/request-consent-otp?phone=9876543210")
        otp_code = res_req.json().get("_dev_test_code")

        # 3. With OTP -> 200
        res_del = self.client.delete(
            f"/api/disease/advisory/cases/ADV-OTP-101?phone=9876543210&otp={otp_code}"
        )
        self.assertEqual(res_del.status_code, 200)
        self.assertEqual(res_del.json()["status"], "deleted")

        # 4. Confirm deleted
        res_get = self.client.get("/api/disease/advisory/cases/ADV-OTP-101")
        self.assertEqual(res_get.status_code, 404)


if __name__ == "__main__":
    unittest.main()
