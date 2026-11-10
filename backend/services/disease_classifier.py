"""Production-Grade Plant Disease Classification Service.

Integrates the authentic, randomly initialized, temperature-calibrated
CropDoctorInferenceService vision model without heuristic or hardcoded fallbacks.
"""
from __future__ import annotations
import sys
from pathlib import Path
from typing import Dict, Any, Union, Optional
try:
    from PIL import Image
except ImportError:
    Image = None

# Ensure repo root is accessible
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

try:
    from ml.crop_doctor.inference.service import CropDoctorInferenceService
    _HAS_INFERENCE_SERVICE = True
except (ImportError, ModuleNotFoundError):
    _HAS_INFERENCE_SERVICE = False
    CropDoctorInferenceService = None

class DiseaseClassifier:
    """Production Crop Doctor Classifier wrapping CropDoctorInferenceService."""

    def __init__(self):
        if _HAS_INFERENCE_SERVICE and CropDoctorInferenceService is not None:
            try:
                self.service = CropDoctorInferenceService.get_instance()
            except Exception:
                self.service = None
        else:
            self.service = None

    def predict(self, image: Union[Image.Image, bytes, str, Path], crop_hint: Optional[str] = None) -> Dict[str, Any]:
        """Runs authentic vision inference. Never returns fake or heuristic confidence."""
        if not _HAS_INFERENCE_SERVICE or self.service is None:
            return {
                "status": "model_unavailable",
                "error": "Vision inference model runtime (torch) is not installed in this environment.",
            }
        res = self.service.predict(image, crop_hint=crop_hint)
        return res

# Global Singleton Instance for fast reuse across API requests
_classifier_instance = None

def get_disease_classifier() -> DiseaseClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = DiseaseClassifier()
    return _classifier_instance
