"""Unit tests for Legacy Compatibility Layer (Redirected to IndicTrans2)."""
import os
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-testing-only")
os.environ.setdefault("DEBUG", "1")

import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from main import app
from services.translation.service import translation_service


class TestSarvamCompatibilityAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_sarvam_health_endpoint(self):
        """GET /api/sarvam/health returns configuration and engine metadata."""
        r = self.client.get("/api/sarvam/health")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("status", data)
        self.assertEqual(data.get("engine"), "indictrans2")

    def test_translate_validation_error(self):
        """POST /api/sarvam/translate validates empty input."""
        r = self.client.post("/api/sarvam/translate", json={"text": "", "target_lang": "hi"})
        self.assertEqual(r.status_code, 422)

    @patch("services.translation.service.translation_service.translate", new_callable=AsyncMock)
    def test_translate_endpoint_mocked(self, mock_translate):
        """POST /api/sarvam/translate calls IndicTrans2 service and returns translation."""
        mock_translate.return_value = {
            "translated_text": "आज मौसम साफ है।",
            "target_language": "hin_Deva",
            "source_language": "eng_Latn",
            "provider": "indictrans2",
        }
        r = self.client.post("/api/sarvam/translate", json={
            "text": "Today the weather is clear.",
            "target_lang": "hi",
            "source_lang": "en"
        })
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["translated_text"], "आज मौसम साफ है।")
        self.assertEqual(res["target_lang"], "hi")
        mock_translate.assert_called_once()

    @patch("services.translation.service.translation_service.translate_batch", new_callable=AsyncMock)
    def test_translate_batch_endpoint_mocked(self, mock_batch):
        """POST /api/sarvam/translate-batch handles multiple strings."""
        mock_batch.return_value = {
            "translations": ["मौसम", "फसल"],
            "target_language": "hin_Deva",
            "source_language": "eng_Latn",
        }
        r = self.client.post("/api/sarvam/translate-batch", json={
            "texts": ["weather", "crop"],
            "target_lang": "hi",
            "source_lang": "en"
        })
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["translations"], ["मौसम", "फसल"])
        self.assertEqual(res["target_lang"], "hi")
        mock_batch.assert_called_once()


if __name__ == "__main__":
    unittest.main()
