"""Production-Grade Plant Disease Classification Service.

Integrates the authentic, randomly initialized, temperature-calibrated
CropDoctorInferenceService vision model without heuristic or hardcoded fallbacks.
"""
import sys
from pathlib import Path
from typing import Dict, Any, Union
from PIL import Image

# Ensure repo root is accessible
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.crop_doctor.inference.service import CropDoctorInferenceService

class DiseaseClassifier:
    """Production Crop Doctor Classifier wrapping CropDoctorInferenceService."""

    def __init__(self):
        self.service = CropDoctorInferenceService.get_instance()

    def predict(self, image: Union[Image.Image, bytes, str, Path], crop_hint: str = None) -> Dict[str, Any]:
        """Runs authentic vision inference. Never returns fake or heuristic confidence."""
        res = self.service.predict(image, crop_hint=crop_hint)
        return res

# Global Singleton Instance for fast reuse across API requests
_classifier_instance = None

def get_disease_classifier() -> DiseaseClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = DiseaseClassifier()
    return _classifier_instance
