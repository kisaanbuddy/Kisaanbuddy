import os
import sys
import unittest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from db.session import get_db, Base
from db.models import User, UserOTP, UserSession
from services.auth_service import decode_access_token
from api.auth import limiter

TEST_DB_URL = "sqlite:///./test_otp_auth.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# We will configure get_db overrides in setUp and tearDown below

class TestOTPAuthSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        if limiter:
            limiter.enabled = False
        cls.client = TestClient(app, base_url="https://testserver")

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_otp_auth.db"):
            os.remove("./test_otp_auth.db")

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        db = TestingSessionLocal()
        db.query(User).delete()
        db.query(UserOTP).delete()
        db.query(UserSession).delete()
        from db.models import UserSecurityState, SystemJob
        db.query(UserSecurityState).delete()
        db.query(SystemJob).delete()
        db.commit()
        db.close()

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_send_otp_success(self):
        payload = {"phone_number": "9876543210"}
        response = self.client.post("/api/auth/send-otp", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])

        # Check DB
        db = TestingSessionLocal()
        otp_record = db.query(UserOTP).filter(UserOTP.phone_number == "9876543210").first()
        self.assertIsNotNone(otp_record)
        self.assertEqual(otp_record.attempts, 0)
        self.assertFalse(otp_record.is_verified)
        db.close()

    def test_send_otp_invalid_phone(self):
        payload = {"phone_number": "12345"}
        response = self.client.post("/api/auth/send-otp", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Please enter a valid Indian mobile number", response.json()["detail"])

    def test_verify_otp_unregistered_yields_token(self):
        # Send OTP first
        self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        
        db = TestingSessionLocal()
        otp_record = db.query(UserOTP).filter(UserOTP.phone_number == "9876543210").first()
        # We need the plain OTP. Let's hijack the DB and set it to a known hash
        import hashlib
        known_otp = "123456"
        hashed = hashlib.sha256(known_otp.encode()).hexdigest()
        otp_record.hashed_otp = hashed
        db.commit()
        db.close()

        # Verify OTP
        verify_payload = {"phone_number": "9876543210", "otp": "123456"}
        response = self.client.post("/api/auth/verify-otp", json=verify_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["registered"])
        self.assertIsNotNone(data["registration_token"])

    def test_complete_registration_success(self):
        # Obtain registration token first
        self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        
        db = TestingSessionLocal()
        otp_record = db.query(UserOTP).filter(UserOTP.phone_number == "9876543210").first()
        import hashlib
        hashed = hashlib.sha256(b"123456").hexdigest()
        otp_record.hashed_otp = hashed
        db.commit()
        db.close()

        verify_payload = {"phone_number": "9876543210", "otp": "123456"}
        verify_res = self.client.post("/api/auth/verify-otp", json=verify_payload)
        reg_token = verify_res.json()["registration_token"]

        # Register using the token
        reg_payload = {"registration_token": reg_token, "name": "Kisan Bhai"}
        response = self.client.post("/api/auth/verify-otp", json=reg_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["registered"])
        self.assertEqual(data["user"]["name"], "Kisan Bhai")
        self.assertEqual(data["user"]["phone_number"], "9876543210")
        
        # Verify cookies are set
        self.assertIn("krishiai_session", response.cookies)
        self.assertIn("krishiai_refresh_session", response.cookies)

    def test_verify_otp_incorrect_code(self):
        self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        
        verify_payload = {"phone_number": "9876543210", "otp": "000000"}
        response = self.client.post("/api/auth/verify-otp", json=verify_payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Incorrect OTP", response.json()["detail"])

        # Verify failed attempts incremented in user_security_state
        db = TestingSessionLocal()
        from db.models import UserSecurityState
        sec_state = db.query(UserSecurityState).filter(UserSecurityState.phone_number == "9876543210").first()
        self.assertEqual(sec_state.failed_attempts, 1)
        db.close()

    def test_verify_otp_too_many_attempts(self):
        self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        
        verify_payload = {"phone_number": "9876543210", "otp": "000000"}
        # First 4 attempts fail with Incorrect OTP
        for i in range(4):
            res = self.client.post("/api/auth/verify-otp", json=verify_payload)
            self.assertEqual(res.status_code, 400)
            self.assertIn("Incorrect OTP", res.json()["detail"])
            
        # 5th attempt locks the account
        res = self.client.post("/api/auth/verify-otp", json=verify_payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Account locked for 15 minutes", res.json()["detail"])
        
        # 6th attempt fails due to lockout
        res = self.client.post("/api/auth/verify-otp", json=verify_payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("temporarily locked", res.json()["detail"])

    def test_verify_otp_expired(self):
        self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        
        # Expire the OTP artificially in DB
        db = TestingSessionLocal()
        otp_record = db.query(UserOTP).filter(UserOTP.phone_number == "9876543210").first()
        otp_record.expires_at = datetime.utcnow() - timedelta(minutes=1)
        db.commit()
        db.close()

        verify_payload = {"phone_number": "9876543210", "otp": "123456"}
        response = self.client.post("/api/auth/verify-otp", json=verify_payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("OTP has expired", response.json()["detail"])

    def test_refresh_session_and_logout(self):
        # 1. Create a user
        db = TestingSessionLocal()
        user = User(name="Test Farmer", phone_number="9876543210", provider="phone_otp", role="Farmer", is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
        db.close()

        # 2. Login directly via a verified session flow
        self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        db = TestingSessionLocal()
        otp_record = db.query(UserOTP).filter(UserOTP.phone_number == "9876543210").first()
        import hashlib
        otp_record.hashed_otp = hashlib.sha256(b"123456").hexdigest()
        db.commit()
        db.close()

        login_res = self.client.post("/api/auth/verify-otp", json={"phone_number": "9876543210", "otp": "123456"})
        self.assertEqual(login_res.status_code, 200)
        
        # Extract cookies
        cookies = login_res.cookies
        
        # 3. Call refresh-session with cookies
        refresh_res = self.client.post("/api/auth/refresh-session", cookies=cookies)
        self.assertEqual(refresh_res.status_code, 200)
        self.assertTrue(refresh_res.json()["token"])

        # 4. Logout
        logout_res = self.client.post("/api/auth/logout", cookies=cookies)
        self.assertEqual(logout_res.status_code, 200)
        
        # Verify session is marked revoked in DB
        db = TestingSessionLocal()
        session_record = db.query(UserSession).filter(UserSession.user_id == user.id).first()
        self.assertTrue(session_record.is_revoked)
        db.close()

        # 5. Refreshing again should return 401
        retry_refresh_res = self.client.post("/api/auth/refresh-session", cookies=cookies)
        self.assertEqual(retry_refresh_res.status_code, 401)

    def test_session_invalidated_on_phone_change(self):
        # 1. Create a user
        db = TestingSessionLocal()
        user = User(name="Test Farmer", phone_number="9876543210", provider="phone_otp", role="Farmer", is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
        db.close()

        # 2. Login
        self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        db = TestingSessionLocal()
        otp_record = db.query(UserOTP).filter(UserOTP.phone_number == "9876543210").first()
        import hashlib
        otp_record.hashed_otp = hashlib.sha256(b"123456").hexdigest()
        db.commit()
        db.close()

        login_res = self.client.post("/api/auth/verify-otp", json={"phone_number": "9876543210", "otp": "123456"})
        self.assertEqual(login_res.status_code, 200)
        
        # Extract cookies
        cookies = login_res.cookies
        
        # 3. Call get_me, should succeed (200)
        me_res = self.client.get("/api/auth/me", cookies=cookies)
        self.assertEqual(me_res.status_code, 200)

        # 4. Change user's phone number in database
        db = TestingSessionLocal()
        db_user = db.query(User).filter(User.id == user.id).first()
        db_user.phone_number = "5555555555"
        db.commit()
        db.close()

        # 5. Call get_me again with the same cookies, should fail (401)
        me_res2 = self.client.get("/api/auth/me", cookies=cookies)
        self.assertEqual(me_res2.status_code, 401)
        self.assertIn("Phone number has changed", me_res2.json()["detail"])

        # 6. Call refresh-session, should also fail (401)
        refresh_res = self.client.post("/api/auth/refresh-session", cookies=cookies)
        self.assertEqual(refresh_res.status_code, 401)
        self.assertIn("Session is invalid, expired, or revoked", refresh_res.json()["detail"])

    def test_otp_failed_attempts_lockout(self):
        # 5 failed attempts → 15 minute lock
        phone = "9999999999"
        self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        
        # 5 incorrect attempts
        for _ in range(5):
            res = self.client.post("/api/auth/verify-otp", json={"phone_number": phone, "otp": "000000"})
            self.assertEqual(res.status_code, 400)
            
        # The 6th verify-otp attempt should fail with account locked message
        res = self.client.post("/api/auth/verify-otp", json={"phone_number": phone, "otp": "000000"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("temporarily locked", res.json()["detail"])

        # Also, send-otp should fail with locked message
        res_send = self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        self.assertEqual(res_send.status_code, 400)
        self.assertIn("temporarily locked", res_send.json()["detail"])

    def test_otp_requests_rate_limit(self):
        # 3 OTP requests / 10 minutes limit
        # In core/config.py, OTP_RATE_LIMIT=3. Let's make 3 successful send-otp requests
        phone = "8888888888"
        
        # 1st request
        res1 = self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        self.assertEqual(res1.status_code, 200)
        
        # Artificially clear resend timer between requests by modifying last_request_at in DB
        db = TestingSessionLocal()
        from db.models import UserSecurityState
        sec_state = db.query(UserSecurityState).filter(UserSecurityState.phone_number == phone).first()
        sec_state.last_request_at = datetime.utcnow() - timedelta(seconds=60)
        db.commit()
        db.close()
        
        # 2nd request
        res2 = self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        self.assertEqual(res2.status_code, 200)
        
        db = TestingSessionLocal()
        sec_state = db.query(UserSecurityState).filter(UserSecurityState.phone_number == phone).first()
        sec_state.last_request_at = datetime.utcnow() - timedelta(seconds=60)
        db.commit()
        db.close()
        
        # 3rd request
        res3 = self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        self.assertEqual(res3.status_code, 200)
        
        db = TestingSessionLocal()
        sec_state = db.query(UserSecurityState).filter(UserSecurityState.phone_number == phone).first()
        sec_state.last_request_at = datetime.utcnow() - timedelta(seconds=60)
        db.commit()
        db.close()
        
        # 4th request should fail due to rate limit and trigger 15-minute lock
        res4 = self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        self.assertEqual(res4.status_code, 400)
        self.assertIn("locked for 15 minutes", res4.json()["detail"])

    def test_otp_resend_limit(self):
        # 30 second resend limit check
        phone = "7777777777"
        res1 = self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        self.assertEqual(res1.status_code, 200)
        
        # Immediate 2nd request within 30 seconds should trigger 400 Bad Request with cost optimization message
        res2 = self.client.post("/api/auth/send-otp", json={"phone_number": phone})
        self.assertEqual(res2.status_code, 400)
        self.assertIn("Resend available in", res2.json()["detail"])

    def test_multi_device_sessions_limit(self):
        # Max 3 active sessions limit, 4th device revokes oldest session
        db = TestingSessionLocal()
        user = User(name="Multi Device Farmer", phone_number="6666666666", provider="phone_otp", role="Farmer", is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
        db.close()
        
        # Create 4 sessions for the same user
        sessions = []
        for i in range(4):
            # Clear rate limit and resend cooldown to allow sending OTP without waiting 30 seconds
            db = TestingSessionLocal()
            from db.models import UserSecurityState
            sec_state = db.query(UserSecurityState).filter(UserSecurityState.phone_number == "6666666666").first()
            if sec_state:
                sec_state.last_request_at = None
                sec_state.request_count = 0
                db.commit()
            db.close()

            # Create session via verify-otp flow
            send_res = self.client.post("/api/auth/send-otp", json={"phone_number": "6666666666"})
            self.assertEqual(send_res.status_code, 200)
            
            db = TestingSessionLocal()
            otp_record = db.query(UserOTP).filter(UserOTP.phone_number == "6666666666").first()
            self.assertIsNotNone(otp_record)
            import hashlib
            otp_record.hashed_otp = hashlib.sha256(b"123456").hexdigest()
            db.commit()
            db.close()
            
            # verify-otp
            # Send distinct User-Agent to simulate different devices
            headers = {"User-Agent": f"Device-Agent-{i}"}
            login_res = self.client.post("/api/auth/verify-otp", json={"phone_number": "6666666666", "otp": "123456"}, headers=headers)
            self.assertEqual(login_res.status_code, 200)
            sessions.append(login_res.cookies)
            
            # Wait a split second to ensure distinct creation times
            import time
            time.sleep(0.01)
            
        # The oldest session (sessions[0]) should now be marked is_revoked = True and returning 401
        res0 = self.client.get("/api/auth/me", cookies=sessions[0])
        self.assertEqual(res0.status_code, 401)
        self.assertIn("revoked or has expired", res0.json()["detail"])
        
        # Sessions[1], sessions[2], sessions[3] should still be valid
        for s in sessions[1:]:
            res = self.client.get("/api/auth/me", cookies=s)
            self.assertEqual(res.status_code, 200)

    def test_send_otp_fake_numbers(self):
        # Reject fake numbers
        for num in ["0000000000", "1111111111", "5555555555", "1234567890"]:
            response = self.client.post("/api/auth/send-otp", json={"phone_number": num})
            self.assertEqual(response.status_code, 400)
            self.assertIn("Please enter a valid Indian mobile number", response.json()["detail"])

    def test_sms_delivery_failure_invalid_number(self):
        # Mock SMS provider to simulate an invalid/unreachable number exception
        from unittest.mock import patch
        
        class MockProviderPhoneError:
            def send_otp(self, phone_number, otp_code):
                raise Exception("Number is unreachable and rejected by provider")

        with patch("api.auth.get_sms_provider", return_value=MockProviderPhoneError()):
            response = self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
            self.assertEqual(response.status_code, 400)
            self.assertIn("Unable to send OTP to this mobile number", response.json()["detail"])

    def test_sms_provider_temporarily_unavailable(self):
        # Mock SMS provider to simulate a network or service unavailable exception
        from unittest.mock import patch

        class MockProviderTimeoutError:
            def send_otp(self, phone_number, otp_code):
                raise Exception("Connection timeout connecting to 2Factor API")

        with patch("api.auth.get_sms_provider", return_value=MockProviderTimeoutError()):
            response = self.client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
            self.assertEqual(response.status_code, 503)
            self.assertIn("OTP service is temporarily unavailable", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
