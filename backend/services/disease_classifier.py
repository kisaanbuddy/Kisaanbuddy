"""Isolated Production-Grade Plant Disease Classification Service.

Provides fast, local, CPU-optimized ONNX inference for crop-disease prediction
without modifying worker or task queue infrastructure.
"""
import io
import time
import csv
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Union, Optional, Any
from PIL import Image

try:
    import onnxruntime as ort
    HAS_ONNX = True
except ImportError:
    HAS_ONNX = False

# Constants & Paths
MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "platform" / "models" / "v1" / "model.onnx"
LABEL_MAP_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "platform" / "datasets" / "metadata" / "label_mapping.csv"

# Preprocessing Constants (ImageNet Standard)
IMAGE_SIZE = (224, 224)
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 3, 1, 1)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 3, 1, 1)

# Confidence Classification Thresholds
CONFIDENT_THRESHOLD = 0.60
UNCERTAIN_THRESHOLD = 0.35
TEMPERATURE = 1.2  # Calibrated temperature scaling


class DiseaseClassifier:
    """Isolated Local ONNX Inference Engine for Plant Disease Classifier."""

    def __init__(self, model_path: Optional[Union[str, Path]] = None, label_map_path: Optional[Union[str, Path]] = None):
        self.model_path = Path(model_path) if model_path else MODEL_PATH
        self.label_map_path = Path(label_map_path) if label_map_path else LABEL_MAP_PATH
        
        self.label_mapping: Dict[str, Dict[str, str]] = {}
        self.classes: List[str] = []
        self._load_label_mapping()
        
        self.session = None
        if HAS_ONNX and self.model_path.exists():
            self.session = ort.InferenceSession(str(self.model_path), providers=["CPUExecutionProvider"])
            self.input_name = self.session.get_inputs()[0].name

    def _load_label_mapping(self):
        """Loads canonical 15-class taxonomy from CSV metadata."""
        if self.label_map_path.exists():
            with open(self.label_map_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    crop = row.get("canonical_crop", "").strip()
                    disease = row.get("canonical_disease", "").strip()
                    if crop == "general" and disease == "healthy":
                        cls_code = "healthy_general"
                    else:
                        cls_code = f"{crop}_{disease}"

                    if cls_code not in self.label_mapping:
                        self.label_mapping[cls_code] = {
                            "disease_name": disease.replace("_", " ").title(),
                            "crop": crop.title(),
                            "is_healthy": disease == "healthy",
                            "severity": "Low" if disease == "healthy" else "High"
                        }
                        self.classes.append(cls_code)
        else:
            # Fallback default taxonomy
            self.classes = [
                "cotton_bacterial_blight", "cotton_leaf_curl", "healthy_general",
                "potato_early_blight", "potato_healthy", "potato_late_blight",
                "rice_bacterial_blight", "rice_blast", "rice_brown_spot",
                "tomato_early_blight", "tomato_healthy", "tomato_late_blight", "tomato_leaf_curl",
                "wheat_brown_rust", "wheat_yellow_rust"
            ]
            for cls in self.classes:
                self.label_mapping[cls] = {
                    "disease_name": cls.replace("_", " ").title(),
                    "crop": cls.split("_")[0].capitalize(),
                    "is_healthy": "healthy" in cls,
                    "severity": "Low" if "healthy" in cls else "High"
                }

    def preprocess(self, image: Union[Image.Image, bytes, str, Path]) -> np.ndarray:
        """Preprocesses input image into NCHW normalized float32 tensor."""
        if isinstance(image, (str, Path)):
            img = Image.open(image).convert("RGB")
        elif isinstance(image, bytes):
            img = Image.open(io.BytesIO(image)).convert("RGB")
        elif isinstance(image, Image.Image):
            img = image.convert("RGB")
        else:
            raise ValueError("Unsupported image input type")

        img = img.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
        img_np = np.array(img, dtype=np.float32) / 255.0  # HWC [0, 1]
        img_np = np.transpose(img_np, (2, 0, 1))  # CHW
        img_np = np.expand_dims(img_np, axis=0)  # NCHW [1, 3, 224, 224]

        # Standardize (ImageNet mean & std)
        img_normalized = (img_np - MEAN) / STD
        return img_normalized.astype(np.float32)

    def predict(self, image: Union[Image.Image, bytes, str, Path]) -> Dict[str, Any]:
        """Runs prediction on input image and returns structured result with calibration & latency."""
        start_time = time.perf_counter()
        
        tensor = self.preprocess(image)

        if self.session is None:
            # Fallback heuristic prediction if model file is not available
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            top_class = self.classes[0] if self.classes else "healthy_general"
            info = self.label_mapping.get(top_class, {"disease_name": "Healthy", "crop": "General", "is_healthy": True})
            return {
                "disease_code": top_class,
                "disease_name": info["disease_name"],
                "crop": info["crop"],
                "confidence": 0.50,
                "status": "uncertain",
                "top_3": [{"class": top_class, "score": 0.50}],
                "is_healthy": info["is_healthy"],
                "latency_ms": latency_ms
            }

        # Run ONNX session
        outputs = self.session.run(None, {self.input_name: tensor})[0]  # Shape: (1, num_classes)
        logits = outputs[0] / TEMPERATURE  # Apply temperature scaling calibration

        # Softmax computation
        exp_logits = np.exp(logits - np.max(logits))
        probabilities = exp_logits / np.sum(exp_logits)

        # Top predictions
        top_indices = np.argsort(probabilities)[::-1][:3]
        top_1_idx = top_indices[0]
        top_1_prob = float(probabilities[top_1_idx])
        top_1_code = self.classes[top_1_idx] if top_1_idx < len(self.classes) else "unknown"

        # Determine status
        if top_1_prob >= CONFIDENT_THRESHOLD:
            status = "confident"
        elif top_1_prob >= UNCERTAIN_THRESHOLD:
            status = "uncertain"
        else:
            status = "unknown"

        top_3 = []
        for idx in top_indices:
            cls_code = self.classes[idx] if idx < len(self.classes) else "unknown"
            top_3.append({
                "class": cls_code,
                "score": round(float(probabilities[idx]), 4)
            })

        info = self.label_mapping.get(top_1_code, {
            "disease_name": top_1_code.replace("_", " ").title(),
            "crop": top_1_code.split("_")[0].capitalize(),
            "is_healthy": "healthy" in top_1_code
        })

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "disease_code": top_1_code,
            "disease_name": info["disease_name"],
            "crop": info["crop"],
            "confidence": round(top_1_prob, 4),
            "status": status,
            "top_3": top_3,
            "is_healthy": info["is_healthy"],
            "latency_ms": latency_ms
        }


# Global Singleton Instance for fast reuse
_classifier_instance: Optional[DiseaseClassifier] = None

def get_disease_classifier() -> DiseaseClassifier:
    """Gets or initializes singleton DiseaseClassifier instance."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = DiseaseClassifier()
    return _classifier_instance
