"""Unit tests for isolated DiseaseClassifier service module."""
import unittest

try:
    from PIL import Image
    import numpy as np
    from services.disease_classifier import DiseaseClassifier, get_disease_classifier
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    DiseaseClassifier = None
    get_disease_classifier = None


@unittest.skipUnless(HAS_PIL, "PIL or disease classifier dependencies not installed")
class TestDiseaseClassifier(unittest.TestCase):
    def setUp(self):
        self.classifier = DiseaseClassifier()

    def test_classifier_initialization(self):
        """Verifies taxonomy loading and class mapping."""
        self.assertEqual(len(self.classifier.classes), 15)
        self.assertIn("rice_blast", self.classifier.classes)
        self.assertIn("healthy_general", self.classifier.classes)
        self.assertEqual(self.classifier.label_mapping["rice_blast"]["crop"], "Rice")

    def test_preprocessing(self):
        """Verifies image preprocessing output tensor shape and type."""
        img = Image.new("RGB", (300, 300), color=(100, 150, 50))
        tensor = self.classifier.preprocess(img)
        self.assertIsInstance(tensor, np.ndarray)
        self.assertEqual(tensor.shape, (1, 3, 224, 224))
        self.assertEqual(tensor.dtype, np.float32)

    def test_predict_structure(self):
        """Verifies that prediction return dictionary contains all required fields."""
        img = Image.new("RGB", (224, 224), color=(50, 180, 50))
        result = self.classifier.predict(img)

        self.assertIn("disease_code", result)
        self.assertIn("disease_name", result)
        self.assertIn("crop", result)
        self.assertIn("confidence", result)
        self.assertIn("status", result)
        self.assertIn("top_3", result)
        self.assertIn("is_healthy", result)
        self.assertIn("latency_ms", result)

        self.assertIsInstance(result["confidence"], float)
        self.assertIn(result["status"], ["confident", "uncertain", "unknown"])
        self.assertLessEqual(len(result["top_3"]), 3)
        self.assertGreater(result["latency_ms"], 0)

    def test_singleton_getter(self):
        """Verifies singleton pattern getter."""
        inst1 = get_disease_classifier()
        inst2 = get_disease_classifier()
        self.assertIs(inst1, inst2)


if __name__ == "__main__":
    unittest.main()
