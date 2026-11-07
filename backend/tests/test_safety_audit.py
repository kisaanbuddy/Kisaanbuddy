"""
Independent Safety, Concurrency, and Security Audit Tests for Crop Doctor.
Tests maximum file size enforcement, model version reporting, concurrent inference,
corrupted image handling, and fail-closed behaviors.
"""

import sys
import io
import time
from pathlib import Path
import unittest
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from main import app
from services.disease_classifier import get_disease_classifier
from ml.crop_doctor.inference.service import CropDoctorInferenceService

class TestCropDoctorSafetyAudit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.classifier = get_disease_classifier()

    def test_model_version_and_hash_integrity(self):
        """Verifies that the inference service reports authentic version and sha256 checksum."""
        service = CropDoctorInferenceService.get_instance()
        self.assertTrue(service.is_ready)
        self.assertGreater(len(service.artifact_hash), 16)
        self.assertIn("crop-doctor", service.model_version)
        self.assertNotIn("unknown", service.model_version)

    def test_corrupted_image_safety(self):
        """Verifies that corrupted or non-image payloads are handled safely without 500 error."""
        # Non-image binary bytes
        corrupt_bytes = b"\x00\x01\x02\x03CORRUPTED_NON_IMAGE_DATA_PADDING_12345"
        res = self.classifier.predict(corrupt_bytes)
        self.assertEqual(res["status"], "invalid_image")
        self.assertIn("error", res)

    def test_api_rejection_of_unsuitable_images(self):
        """Verifies that the API properly returns retake_image for blank/unsuitable input."""
        black_img = Image.new("RGB", (100, 100), color=(0, 0, 0))
        img_byte_arr = io.BytesIO()
        black_img.save(img_byte_arr, format="JPEG")
        img_byte_arr.seek(0)

        response = self.client.post(
            "/api/disease/predict",
            files={"file": ("test_black.jpg", img_byte_arr, "image/jpeg")},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "retake_image")
        self.assertIn("underexposed", data["image_quality"]["flags"])
        self.assertIsNotNone(data.get("retake_advice"))

    def test_api_payload_too_large_rejection(self):
        """Verifies that oversized payloads exceeding limit are rejected with 413."""
        # Create a dummy payload larger than 15MB
        oversized_payload = b"0" * (16 * 1024 * 1024)
        response = self.client.post(
            "/api/disease/predict",
            files={"file": ("oversized.jpg", io.BytesIO(oversized_payload), "image/jpeg")},
        )
        self.assertEqual(response.status_code, 413)

    def test_api_reports_dynamic_model_info(self):
        """Verifies that the API does not return a hardcoded model string."""
        test_img_path = ROOT_DIR / "frontend-next" / "public" / "images" / "crop-doctor" / "powdery-mildew-leaf.jpg"
        with open(test_img_path, "rb") as f:
            response = self.client.post(
                "/api/disease/predict",
                files={"file": ("leaf.jpg", f, "image/jpeg")},
            )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("model", data)
        self.assertIn("artifact_hash", data)
        self.assertNotIn("Trained from Scratch, T=0.9472", data["model"])

    def test_concurrent_requests_stability(self):
        """Verifies that concurrent requests execute deterministically without race conditions."""
        test_img_path = ROOT_DIR / "frontend-next" / "public" / "images" / "crop-doctor" / "powdery-mildew-leaf.jpg"
        with open(test_img_path, "rb") as f:
            img_bytes = f.read()

        def make_request():
            res = self.classifier.predict(img_bytes)
            return res["prediction"]["condition_id"], res["prediction"]["model_confidence"]

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [f.result() for f in futures]

        first_cls, first_conf = results[0]
        for c, conf in results:
            self.assertEqual(c, first_cls)
            self.assertAlmostEqual(conf, first_conf, places=4)

if __name__ == "__main__":
    unittest.main()
