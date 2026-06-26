import os
import sys
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from db.session import get_db, Base
from db.models import User
from api.auth import limiter

# Test Database setup
TEST_DB_URL = "sqlite:///./test_auth.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# We will configure get_db overrides in setUp and tearDown below

class TestAuthSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create test database tables
        Base.metadata.create_all(bind=engine)
        if limiter:
            limiter.enabled = False
        cls.client = TestClient(app, base_url="https://testserver")

    @classmethod
    def tearDownClass(cls):
        # Drop test database tables and remove file
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_auth.db"):
            os.remove("./test_auth.db")

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        # Clear users table before each test
        db = TestingSessionLocal()
        db.query(User).delete()
        db.commit()
        db.close()

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_register_user_success(self):
        payload = {
            "name": "Test Farmer",
            "email": "farmer@example.com",
            "password": "securepassword123"
        }
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "farmer@example.com")
        self.assertEqual(data["role"], "Farmer")
        self.assertEqual(data["provider"], "email")
        self.assertIn("phone_number", data)

    def test_register_duplicate_email(self):
        payload = {
            "name": "Test Farmer",
            "email": "farmer@example.com",
            "password": "securepassword123"
        }
        # First registration
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 200)

        # Second registration
        response2 = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response2.status_code, 400)
        self.assertIn("already exists", response2.json()["detail"])

    def test_login_success(self):
        # Register user
        reg_payload = {
            "name": "Test User",
            "email": "user@example.com",
            "password": "mysecretpassword"
        }
        self.client.post("/api/auth/register", json=reg_payload)

        # Login user
        login_payload = {
            "email": "user@example.com",
            "password": "mysecretpassword"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["ok"])
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "user@example.com")
        
        # Verify cookie is set
        self.assertIn("kisaanbuddy_session", response.cookies)

    def test_login_invalid_credentials(self):
        # Register user
        reg_payload = {
            "name": "Test User",
            "email": "user@example.com",
            "password": "mysecretpassword"
        }
        self.client.post("/api/auth/register", json=reg_payload)

        # Try logging in with wrong password
        login_payload = {
            "email": "user@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid email or password", response.json()["detail"])

    def test_get_current_user_profile(self):
        # Register and login
        reg_payload = {
            "name": "Profile User",
            "email": "profile@example.com",
            "password": "password123"
        }
        self.client.post("/api/auth/register", json=reg_payload)

        login_payload = {
            "email": "profile@example.com",
            "password": "password123"
        }
        login_response = self.client.post("/api/auth/login", json=login_payload)
        # Call get_me with cookie authentication
        me_response = self.client.get("/api/auth/me", cookies=login_response.cookies)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()["email"], "profile@example.com")

    def test_logout_success(self):
        response = self.client.post("/api/auth/logout")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        
        # Verify cookie is cleared (expiry set to past or empty)
        # Note: TestClient cookies handling might vary, but verify response details
        self.assertIn("Logged out successfully", response.json()["message"])

    def test_register_optional_name_success(self):
        payload = {
            "email": "noname@example.com",
            "password": "securepassword123"
        }
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsNone(data["name"])

    def test_register_with_custom_phone_success(self):
        payload = {
            "email": "customphone@example.com",
            "password": "securepassword123",
            "phone_number": "9876543210"
        }
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["phone_number"], "9876543210")

    def test_register_duplicate_custom_phone(self):
        payload1 = {
            "email": "customphone1@example.com",
            "password": "securepassword123",
            "phone_number": "9876543210"
        }
        payload2 = {
            "email": "customphone2@example.com",
            "password": "securepassword123",
            "phone_number": "9876543210"
        }
        self.client.post("/api/auth/register", json=payload1)
        response = self.client.post("/api/auth/register", json=payload2)
        self.assertEqual(response.status_code, 400)
        self.assertIn("phone number already exists", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
