"""Unit tests for Sarvam AI integrations and endpoints."""
import os
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-testing-only")
os.environ.setdefault("DEBUG", "1")

import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from main import app
from services import sarvam_service


class TestSarvamAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_sarvam_health_endpoint(self):
        """GET /api/sarvam/health returns configuration and supported model metadata."""
        r = self.client.get("/api/sarvam/health")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("status", data)
        self.assertIn("translation", data)
        self.assertIn("tts", data)
        self.assertIn("stt", data)
        self.assertEqual(data.get("tts_model"), "bulbul:v3")
        self.assertEqual(data.get("stt_model"), "saaras:v4")

    def test_translate_validation_error(self):
        """POST /api/sarvam/translate validates empty input."""
        r = self.client.post("/api/sarvam/translate", json={"text": "", "target_lang": "hi"})
        self.assertEqual(r.status_code, 422)

    @patch("services.sarvam_service.translate_text", new_callable=AsyncMock)
    def test_translate_endpoint_mocked(self, mock_translate):
        """POST /api/sarvam/translate calls service and returns translation."""
        mock_translate.return_value = "आज मौसम साफ है।"
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

    @patch("services.sarvam_service.translate_batch", new_callable=AsyncMock)
    def test_translate_batch_endpoint_mocked(self, mock_batch):
        """POST /api/sarvam/translate-batch handles multiple strings."""
        mock_batch.return_value = ["मौसम", "फसल"]
        r = self.client.post("/api/sarvam/translate-batch", json={
            "texts": ["Weather", "Crop"],
            "target_lang": "hi"
        })
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(len(res["translations"]), 2)
        self.assertEqual(res["translations"][0], "मौसम")

    @patch("services.sarvam_service.text_to_speech", new_callable=AsyncMock)
    def test_tts_endpoint_mocked(self, mock_tts):
        """POST /api/sarvam/tts returns audio/wav with headers."""
        fake_wav = b"RIFF....WAVEfmt ...."
        mock_tts.return_value = fake_wav
        r = self.client.post("/api/sarvam/tts", json={
            "text": "Namaste farmer",
            "language": "hi-IN",
            "speaker": "priya"
        })
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.headers.get("content-type"), "audio/wav")
        self.assertEqual(r.content, fake_wav)
        self.assertIn("X-TTS-Provider", r.headers)

    @patch("services.sarvam_service.speech_to_text", new_callable=AsyncMock)
    def test_stt_endpoint_mocked(self, mock_stt):
        """POST /api/sarvam/stt transcribes uploaded audio."""
        mock_stt.return_value = {
            "transcript": "kheti ke bare me bataye",
            "language_code": "hi-IN",
            "request_id": "test-req-123"
        }
        files = {"audio": ("sample.wav", b"fake audio bytes", "audio/wav")}
        r = self.client.post("/api/sarvam/stt", files=files, data={"language": "hi"})
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["transcript"], "kheti ke bare me bataye")

    @patch("services.sarvam_service.extract_soil_report", new_callable=AsyncMock)
    def test_extract_soil_report_endpoint_mocked(self, mock_extract):
        """POST /api/sarvam/extract-soil-report parses Soil Health Card document."""
        mock_extract.return_value = {
            "soil_ph": 6.8,
            "nitrogen_kg_ha": 240.0,
            "phosphorus_kg_ha": 18.5,
            "potassium_kg_ha": 210.0,
            "organic_carbon_pct": 0.65,
            "ec_ds_m": 0.45,
            "soil_type": "Alluvial Loam",
            "lab_name": "District Soil Testing Laboratory",
            "test_date": "2026-03-15",
            "farmer_name": "Ramesh Patel",
            "village_or_district": "Indore",
            "health_summary": "Soil is slightly acidic with good potassium levels.",
            "source_file": "soil_card.pdf",
            "raw_extracted_text": "Sample card text",
        }
        files = {"file": ("soil_card.pdf", b"%PDF-1.4 sample pdf content", "application/pdf")}
        r = self.client.post("/api/sarvam/extract-soil-report", files=files)
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["soil_ph"], 6.8)
        self.assertEqual(data["nitrogen_kg_ha"], 240.0)
        self.assertEqual(data["phosphorus_kg_ha"], 18.5)
        self.assertEqual(data["potassium_kg_ha"], 210.0)
        self.assertEqual(data["farmer_name"], "Ramesh Patel")

    def test_normalise_lang_code_kannada(self):
        """Verify normalise_lang_code maps all Kannada and related code variants correctly."""
        self.assertEqual(sarvam_service.normalise_lang_code("kn"), "kn-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("kn-IN"), "kn-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("kn-in"), "kn-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("en"), "en-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("en-IN"), "en-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("en-US"), "en-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("hi"), "hi-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("hi-IN"), "hi-IN")
        self.assertEqual(sarvam_service.normalise_lang_code("auto"), "auto")

    @patch("services.sarvam_service.translate_text", new_callable=AsyncMock)
    def test_translate_endpoint_kannada(self, mock_translate):
        """POST /api/sarvam/translate handles Kannada requests in both directions."""
        mock_translate.return_value = "ಇಂದು ಹವಾಮಾನ ಸ್ವಚ್ಛವಾಗಿದೆ."
        r = self.client.post("/api/sarvam/translate", json={
            "text": "Today the weather is clear.",
            "target_lang": "kn",
            "source_lang": "en"
        })
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["translated_text"], "ಇಂದು ಹವಾಮಾನ ಸ್ವಚ್ಛವಾಗಿದೆ.")
        self.assertEqual(res["target_lang"], "kn")
        mock_translate.assert_called_with(
            text="Today the weather is clear.",
            target_lang="kn",
            source_lang="en",
            mode="formal"
        )

    def test_translation_caching(self):
        """Ensure translated text is cached in memory."""
        import asyncio
        sarvam_service._TRANSLATION_CACHE.clear()
        sarvam_service._TRANSLATION_CACHE[("hello world", "en-IN", "hi-IN")] = ("नमस्ते दुनिया", 9999999999.0)
        res = asyncio.run(sarvam_service.translate_text("hello world", "hi", "en"))
        self.assertEqual(res, "नमस्ते दुनिया")



if __name__ == "__main__":
    unittest.main()
