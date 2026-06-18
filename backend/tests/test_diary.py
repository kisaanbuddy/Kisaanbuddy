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
from db.models import User, DiaryEntry
from api.auth import create_access_token

# Test Database setup
TEST_DB_URL = "sqlite:///./test_diary.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the get_db dependency
app.dependency_overrides[get_db] = override_get_db

class TestDiarySystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create test database tables
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("test_diary.db"):
            try:
                os.remove("test_diary.db")
            except Exception:
                pass


    def setUp(self):
        # Insert a test user
        self.db = TestingSessionLocal()
        self.user = User(
            id=999,
            phone_number="+919999999999",
            name="Test Farmer",
            email="farmer@test.com",
            role="Farmer",
            is_active=True
        )
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)
        
        # Create a test token
        self.token = create_access_token(data={"sub": str(self.user.id)})
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def tearDown(self):
        self.db.query(DiaryEntry).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_create_and_get_diary_entry(self):
        # Create entry
        payload = {
            "id": "entry-123",
            "date": "2026-06-18",
            "activity": "sowing",
            "crop": "Wheat",
            "notes": "Sowed wheat seeds",
            "weather": "sunny"
        }
        response = self.client.post("/api/diary", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["id"], "entry-123")
        self.assertEqual(data["crop"], "Wheat")

        # Get entries
        response = self.client.get("/api/diary", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], "entry-123")

    def test_sync_diary_entries(self):
        payloads = [
            {
                "id": "entry-sync-1",
                "date": "2026-06-17",
                "activity": "irrigation",
                "crop": "Rice",
                "notes": "Watered rice",
                "weather": "cloudy"
            },
            {
                "id": "entry-sync-2",
                "date": "2026-06-18",
                "activity": "fertilizer",
                "crop": "Cotton",
                "notes": "Added urea",
                "weather": "rainy"
            }
        ]
        response = self.client.post("/api/diary/sync", json=payloads, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        
        # Verify stored in DB
        entries = self.db.query(DiaryEntry).filter(DiaryEntry.user_id == self.user.id).all()
        self.assertEqual(len(entries), 2)

    def test_delete_diary_entry(self):
        # Seed entry
        entry = DiaryEntry(
            id="entry-to-delete",
            user_id=self.user.id,
            date="2026-06-18",
            activity="weeding",
            crop="Sugarcane",
            notes="Removed weeds"
        )
        self.db.add(entry)
        self.db.commit()

        # Delete entry
        response = self.client.delete("/api/diary/entry-to-delete", headers=self.headers)
        self.assertEqual(response.status_code, 204)

        # Verify deletion
        db_entry = self.db.query(DiaryEntry).filter(DiaryEntry.id == "entry-to-delete").first()
        self.assertIsNone(db_entry)
