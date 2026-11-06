"""Unit and integration tests for Crop Doctor vision inference and classifier service."""
import os
import sys
from pathlib import Path
import unittest
from PIL import Image

# Ensure backend and root are in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from services.disease_classifier import DiseaseClassifier, get_disease_classifier
from ml.crop_doctor.inference.service import CropDoctorInferenceService
from ml.crop_doctor.models.factory import create_model, assert_random_initialization

class TestCropDoctorService(unittest.TestCase):
    def setUp(self):
        self.classifier = get_disease_classifier()

    def test_random_initialization_verification(self):
        """Verifies that vision models are created with weights=None and random init."""
        model = create_model("mobilenet_v3_small", num_classes=17)
        self.assertTrue(assert_random_initialization(model))

    def test_singleton_getter(self):
        """Verifies that get_disease_classifier returns singleton instance."""
        inst1 = get_disease_classifier()
        inst2 = get_disease_classifier()
        self.assertIs(inst1, inst2)

    def test_authentic_prediction_structure(self):
        """Verifies that predict returns verified, typed, uncertainty-aware structure."""
        test_img = ROOT_DIR / "frontend-next" / "public" / "images" / "crop-doctor" / "powdery-mildew-leaf.jpg"
        self.assertTrue(test_img.exists())

        res = self.classifier.predict(str(test_img))

        self.assertIn(res["status"], ["diagnosed", "uncertain", "retake_image"])
        self.assertIn("crop", res)
        self.assertIn("prediction", res)
        self.assertIn("alternatives", res)
        self.assertIn("image_quality", res)
        self.assertIn("inference_ms", res)

        pred = res["prediction"]
        self.assertIn("condition_id", pred)
        self.assertIn("model_confidence", pred)
        self.assertTrue(pred["calibrated"])
        self.assertGreater(pred["model_confidence"], 0.0)
        self.assertLessEqual(pred["model_confidence"], 1.0)
        self.assertGreater(res["inference_ms"], 0.0)

    def test_unsuitable_image_rejection(self):
        """Verifies that completely black or extreme blurry images trigger retake_image."""
        # Create an underexposed 64x64 solid black image
        black_img = Image.new("RGB", (100, 100), color=(0, 0, 0))
        res = self.classifier.predict(black_img)
        self.assertEqual(res["status"], "retake_image")
        self.assertIn("underexposed", res["image_quality"]["flags"])
        self.assertIsNotNone(res["retake_advice"])

    def test_repeated_inference_stability(self):
        """Verifies that repeated inference produces deterministic and stable results."""
        test_img = ROOT_DIR / "frontend-next" / "public" / "images" / "crop-doctor" / "powdery-mildew-leaf.jpg"
        res1 = self.classifier.predict(str(test_img))
        res2 = self.classifier.predict(str(test_img))

        self.assertEqual(res1["prediction"]["condition_id"], res2["prediction"]["condition_id"])
        self.assertAlmostEqual(res1["prediction"]["model_confidence"], res2["prediction"]["model_confidence"], places=4)

if __name__ == "__main__":
    unittest.main()
