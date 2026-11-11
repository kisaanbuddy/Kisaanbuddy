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

    @patch("api.sarvam.extract_soil_report_with_gemini", new_callable=AsyncMock)
    def test_extract_soil_report_uses_gemini(self, mock_extract):
        """POST /api/sarvam/extract-soil-report routes to Gemini document extractor."""
        mock_extract.return_value = {
            "soil_ph": 6.8,
            "nitrogen_kg_ha": 210.0,
            "phosphorus_kg_ha": 19.0,
            "potassium_kg_ha": 240.0,
            "organic_carbon_pct": 0.62,
            "ec_ds_m": 0.4,
            "soil_type": "Alluvial",
            "lab_name": "Karnal Soil Lab",
            "test_date": "2026-10-15",
            "farmer_name": None,
            "village_or_district": "Karnal",
            "health_summary": "Balanced neutral pH with moderate nitrogen.",
            "source_file": "shc.txt",
            "raw_extracted_text": "pH 6.8",
        }
        r = self.client.post(
            "/api/sarvam/extract-soil-report",
            files={"file": ("shc.txt", b"Soil pH 6.8, N 210 kg/ha", "text/plain")},
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["soil_ph"], 6.8)
        mock_extract.assert_called_once()

    @patch("services.chat.tts_service.synthesize", new_callable=AsyncMock)
    def test_tts_compatibility_endpoint(self, mock_synth):
        """POST /api/sarvam/tts returns audio bytes from TTSResult cleanly."""
        from services.chat.tts_service import TTSResult
        mock_synth.return_value = TTSResult(b"FAKE_MP3_BYTES", "audio/mpeg", "neural-hi-IN-SwaraNeural")
        r = self.client.post("/api/sarvam/tts", json={"text": "नमस्ते किसान भाई", "language": "hi-IN"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.content, b"FAKE_MP3_BYTES")
        self.assertEqual(r.headers.get("x-tts-provider"), "neural-hi-IN-SwaraNeural")


if __name__ == "__main__":
    unittest.main()
