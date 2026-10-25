import os
import sys
import unittest
import io

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from api.auth import limiter
from db.models import FarmerFeedback, User, UserSession, ActivityLog
from db.session import Base, get_db
from services.auth_service import hash_password, create_access_token

TEST_DB_URL = "sqlite:///./test_farmer_feedback.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class FarmerFeedbackTests(unittest.TestCase):
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
        if os.path.exists("./test_farmer_feedback.db"):
            os.remove("./test_farmer_feedback.db")

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        db = TestingSessionLocal()
        for table in (FarmerFeedback, ActivityLog, UserSession, User):
            db.query(table).delete()

        admin_user = User(
            id=1,
            name="Platform Admin",
            email="admin@kisaanbuddy.com",
            phone_number="9100000000",
            password_hash=hash_password("adminpass123"),
            provider="email",
            role="Admin",
            is_active=True,
        )
        farmer_user = User(
            id=2,
            name="Ramesh Kisan",
            email="ramesh@example.com",
            phone_number="9198765432",
            password_hash=hash_password("farmerpass123"),
            provider="email",
            role="Farmer",
            is_active=True,
        )
        db.add_all([admin_user, farmer_user])
        db.commit()
        db.close()
        self.client.cookies.clear()

    def tearDown(self):
        app.dependency_overrides.clear()

    def _login_as(self, email: str, role: str = "Admin"):
        token = create_access_token({"sub": "1" if role == "Admin" else "2", "role": role})
        self.client.cookies.set("krishiai_session", token)

    def test_anonymous_guided_option_submission(self):
        """Farmer submits a suggestion using guided choice only (no text, no voice)."""
        res = self.client.post(
            "/api/feedback",
            data={
                "feedback_type": "idea",
                "category": "mandi",
                "guided_option": "Need historical weekly price graph",
                "language": "hi",
                "source_page": "/mandi",
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data["id"])
        self.assertTrue(data["feedback_ref"].startswith("KB-FB-"))
        self.assertEqual(data["feedback_type"], "idea")
        self.assertEqual(data["category"], "mandi")
        self.assertEqual(data["status"], "received")

    def test_anonymous_voice_recording_submission(self):
        """Farmer submits audio recording with explicit duration."""
        fake_audio = b"\x1a\x45\xdf\xa3webm-test-audio-bytes"
        audio_file = io.BytesIO(fake_audio)

        res = self.client.post(
            "/api/feedback",
            data={
                "feedback_type": "improvement",
                "category": "weather",
                "language": "kn",
                "source_page": "/weather",
                "audio_duration_seconds": "18",
            },
            files={
                "audio_file": ("suggestion.webm", audio_file, "audio/webm"),
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data["feedback_ref"].startswith("KB-FB-"))

        # Check in DB
        db = TestingSessionLocal()
        record = db.query(FarmerFeedback).filter(FarmerFeedback.id == data["id"]).first()
        self.assertIsNotNone(record)
        self.assertTrue(record.has_audio)
        self.assertEqual(record.audio_mimetype, "audio/webm")
        self.assertEqual(record.audio_duration_seconds, 18)
        self.assertEqual(record.audio_data, fake_audio)
        self.assertTrue(record.is_anonymous)
        db.close()

    def test_empty_submission_is_rejected(self):
        """Submission without voice, guided option, text, or quick rating must return 422."""
        res = self.client.post(
            "/api/feedback",
            data={
                "feedback_type": "idea",
                "category": "general",
            },
        )
        self.assertEqual(res.status_code, 422)

    def test_invalid_feedback_type_is_rejected(self):
        """Invalid feedback type returns 422."""
        res = self.client.post(
            "/api/feedback",
            data={
                "feedback_type": "invalid_type_here",
                "content_text": "Good app",
            },
        )
        self.assertEqual(res.status_code, 422)

    def test_unsupported_audio_type_is_rejected(self):
        """Uploading an executable or unsupported media format as audio returns 415."""
        fake_exe = io.BytesIO(b"MZnotaudio")
        res = self.client.post(
            "/api/feedback",
            data={
                "feedback_type": "issue",
                "category": "disease",
            },
            files={
                "audio_file": ("test.exe", fake_exe, "application/x-dosexec"),
            },
        )
        self.assertEqual(res.status_code, 415)

    def test_quick_review_submission(self):
        """Contextual 'Was this helpful?' 1-tap review endpoint."""
        res = self.client.post(
            "/api/feedback/quick",
            json={
                "quick_rating": "helpful",
                "category": "weather",
                "source_page": "/weather",
                "language": "hi",
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["feedback_type"], "quick_review")
        self.assertEqual(data["category"], "weather")

    def test_admin_endpoints_require_authentication(self):
        """Unauthenticated requests to admin feedback list are rejected."""
        self.client.cookies.clear()
        res = self.client.get("/api/feedback/admin/list")
        self.assertEqual(res.status_code, 401)

    def test_admin_endpoints_require_admin_role(self):
        """Farmer role is forbidden from admin feedback list."""
        self._login_as("ramesh@example.com", role="Farmer")
        res = self.client.get("/api/feedback/admin/list")
        self.assertEqual(res.status_code, 403)

    def test_admin_workflow_list_update_stream_delete(self):
        """Complete staff admin workflow: list, stream audio, change status, and delete."""
        # 1. Submit a feedback with audio and text
        audio_bytes = b"sample-farmer-audio-stream"
        res_sub = self.client.post(
            "/api/feedback",
            data={
                "feedback_type": "improvement",
                "category": "mandi",
                "guided_option": "Display mandi distance from village",
                "content_text": "Kripya karke paas ki mandi ki doori bhi dikhayein.",
                "language": "hi",
                "source_page": "/mandi",
                "audio_duration_seconds": "12",
            },
            files={
                "audio_file": ("voice.webm", io.BytesIO(audio_bytes), "audio/webm"),
            },
        )
        self.assertEqual(res_sub.status_code, 201)
        fb_id = res_sub.json()["id"]
        ref_id = res_sub.json()["feedback_ref"]

        # 2. Login as Admin and list feedback
        self._login_as("admin@kisaanbuddy.com", role="Admin")
        res_list = self.client.get("/api/feedback/admin/list?category=mandi")
        self.assertEqual(res_list.status_code, 200)
        list_data = res_list.json()
        self.assertGreaterEqual(list_data["total"], 1)
        found = any(item["id"] == fb_id for item in list_data["items"])
        self.assertTrue(found)

        # 3. Retrieve single detail
        res_detail = self.client.get(f"/api/feedback/admin/{fb_id}")
        self.assertEqual(res_detail.status_code, 200)
        detail = res_detail.json()
        self.assertEqual(detail["feedback_ref"], ref_id)
        self.assertTrue(detail["has_audio"])
        self.assertEqual(detail["audio_duration_seconds"], 12)

        # 4. Stream private audio
        res_audio = self.client.get(f"/api/feedback/admin/{fb_id}/audio")
        self.assertEqual(res_audio.status_code, 200)
        self.assertEqual(res_audio.content, audio_bytes)
        self.assertEqual(res_audio.headers.get("Cache-Control"), "private, no-store, max-age=0")

        # 5. Update status, staff notes, and set public showcase
        res_patch = self.client.patch(
            f"/api/feedback/admin/{fb_id}",
            json={
                "status": "planned",
                "priority": "high",
                "internal_notes": "Reviewed in product meeting. Adding distance calculator in Mandi v2.",
                "assigned_to": "Engineering Team",
                "is_public_showcase": True,
                "public_improvement_summary": "Added distance in kilometers to nearby APMC mandis.",
            },
        )
        self.assertEqual(res_patch.status_code, 200)
        patched = res_patch.json()
        self.assertEqual(patched["status"], "planned")
        self.assertEqual(patched["priority"], "high")
        self.assertEqual(patched["assigned_to"], "Engineering Team")
        self.assertTrue(patched["is_public_showcase"])

        # 6. Check public improvements endpoint (no auth needed)
        self.client.cookies.clear()
        res_public = self.client.get("/api/feedback/public-improvements")
        self.assertEqual(res_public.status_code, 200)
        public_items = res_public.json()
        self.assertEqual(len(public_items), 1)
        self.assertEqual(public_items[0]["feedback_ref"], ref_id)
        self.assertEqual(public_items[0]["improvement_summary"], "Added distance in kilometers to nearby APMC mandis.")
        # Ensure no PII or raw text leaked
        self.assertNotIn("content_text", public_items[0])
        self.assertNotIn("audio_data", public_items[0])
        self.assertNotIn("internal_notes", public_items[0])

        # 7. Admin deletion
        self._login_as("admin@kisaanbuddy.com", role="Admin")
        res_del = self.client.delete(f"/api/feedback/admin/{fb_id}")
        self.assertEqual(res_del.status_code, 204)

        # Detail should now 404
        res_after = self.client.get(f"/api/feedback/admin/{fb_id}")
        self.assertEqual(res_after.status_code, 404)


if __name__ == "__main__":
    unittest.main()
