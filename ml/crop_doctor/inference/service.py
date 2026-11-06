import os
import sys
import time
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional
import torch
import numpy as np
from PIL import Image, ImageOps

# Ensure root in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from ml.crop_doctor.models.factory import create_model, assert_random_initialization
from ml.crop_doctor.training.dataset import (
    get_eval_transforms,
    CANONICAL_CLASSES,
    IDX_TO_CLASS
)
from ml.crop_doctor.calibration.temperature_scaling import ModelWithTemperature

# Crop mapping for canonical classes
CLASS_CROP_MAP = {
    "tomato_early_blight": {"id": "tomato", "name": "Tomato", "condition": "Early Blight"},
    "tomato_late_blight": {"id": "tomato", "name": "Tomato", "condition": "Late Blight"},
    "tomato_leaf_curl": {"id": "tomato", "name": "Tomato", "condition": "Yellow Leaf Curl"},
    "tomato_bacterial_spot": {"id": "tomato", "name": "Tomato", "condition": "Bacterial Spot"},
    "tomato_septoria_leaf_spot": {"id": "tomato", "name": "Tomato", "condition": "Septoria Leaf Spot"},
    "tomato_leaf_mold": {"id": "tomato", "name": "Tomato", "condition": "Leaf Mold"},
    "tomato_healthy": {"id": "tomato", "name": "Tomato", "condition": "Healthy Foliage"},
    "potato_early_blight": {"id": "potato", "name": "Potato", "condition": "Early Blight"},
    "potato_late_blight": {"id": "potato", "name": "Potato", "condition": "Late Blight"},
    "potato_healthy": {"id": "potato", "name": "Potato", "condition": "Healthy Foliage"},
    "corn_leaf_blight": {"id": "corn", "name": "Corn (Maize)", "condition": "Northern Leaf Blight"},
    "corn_common_rust": {"id": "corn", "name": "Corn (Maize)", "condition": "Common Rust"},
    "corn_gray_leaf_spot": {"id": "corn", "name": "Corn (Maize)", "condition": "Gray Leaf Spot"},
    "corn_healthy": {"id": "corn", "name": "Corn (Maize)", "condition": "Healthy Foliage"},
    "bell_pepper_bacterial_spot": {"id": "bell_pepper", "name": "Bell Pepper", "condition": "Bacterial Spot"},
    "bell_pepper_healthy": {"id": "bell_pepper", "name": "Bell Pepper", "condition": "Healthy Foliage"},
    "squash_powdery_mildew": {"id": "squash", "name": "Squash", "condition": "Powdery Mildew"},
}

class CropDoctorInferenceService:
    _instance: Optional["CropDoctorInferenceService"] = None

    def __init__(self, checkpoint_path: str = "ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth", device_name: str = "cpu"):
        self.device = torch.device(device_name)
        self.checkpoint_path = checkpoint_path
        self.model = None
        self.calibrated_model = None
        self.transform = get_eval_transforms()
        self.model_version = "crop-doctor-v1.0.0-scratch"
        self.taxonomy_version = "1.0.0"
        self.artifact_hash = ""
        self.is_ready = False
        self.temperature = 0.9472  # Calibrated on validation partition
        self.uncertainty_threshold = 0.60
        
        self._load_model()

    @classmethod
    def get_instance(cls) -> "CropDoctorInferenceService":
        if cls._instance is None:
            cls._instance = CropDoctorInferenceService()
        return cls._instance

    def _load_model(self):
        p = Path(self.checkpoint_path)
        if not p.exists():
            print(f"WARNING: Checkpoint {self.checkpoint_path} not found. Model unavailable.")
            self.is_ready = False
            return

        with open(p, "rb") as f:
            self.artifact_hash = hashlib.sha256(f.read()).hexdigest()

        ckpt = torch.load(p, map_location=self.device)
        arch = ckpt.get("architecture", "mobilenet_v3_small")
        
        base_model = create_model(arch, num_classes=len(CANONICAL_CLASSES))
        base_model.load_state_dict(ckpt["model_state_dict"])
        base_model.to(self.device)
        base_model.eval()

        self.calibrated_model = ModelWithTemperature(base_model)
        self.calibrated_model.temperature.data.fill_(self.temperature)
        self.calibrated_model.to(self.device)
        self.calibrated_model.eval()

        self.is_ready = True
        print(f"CropDoctorInferenceService initialized successfully with {arch} (hash: {self.artifact_hash[:12]}...).")

    def inspect_image_quality(self, img_rgb: Image.Image) -> Dict[str, Any]:
        """Runs fast deterministic quality and suitability checks."""
        w, h = img_rgb.size
        gray = np.asarray(img_rgb.convert("L"), dtype=np.float32)
        
        # 3x3 Laplacian kernel variance for blur
        laplacian = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
        from scipy.signal import convolve2d
        convolved = convolve2d(gray, laplacian, mode="valid")
        blur_score = float(np.var(convolved))
        brightness = float(np.mean(gray))

        flags = []
        is_acceptable = True
        advice = []

        if w < 64 or h < 64:
            flags.append("insufficient_resolution")
            is_acceptable = False
            advice.append("Image resolution is too low. Please move closer to the plant.")
        if blur_score < 15.0:
            flags.append("extreme_blur")
            is_acceptable = False
            advice.append("Image is blurry. Hold your phone steady and tap to focus on the leaf.")
        if brightness < 15.0:
            flags.append("underexposed")
            is_acceptable = False
            advice.append("Photo is too dark. Please take the picture in bright daytime natural light.")
        elif brightness > 240.0:
            flags.append("overexposed")
            is_acceptable = False
            advice.append("Photo is washed out by direct flash or glare. Shade the leaf gently.")

        return {
            "status": "acceptable" if is_acceptable else "unsuitable",
            "blur_score": round(blur_score, 2),
            "brightness_mean": round(brightness, 2),
            "flags": flags,
            "retake_advice": " ".join(advice) if advice else None
        }

    def predict(self, image_file_or_bytes, crop_hint: Optional[str] = None) -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        if not self.is_ready:
            return {
                "status": "model_unavailable",
                "error": "The Crop Doctor vision inference model is not loaded. Please ensure checkpoints are initialized.",
                "inference_ms": round((time.perf_counter() - start_time) * 1000, 2)
            }

        try:
            if isinstance(image_file_or_bytes, Image.Image):
                img = image_file_or_bytes
            elif isinstance(image_file_or_bytes, (str, Path)):
                img = Image.open(image_file_or_bytes)
            elif isinstance(image_file_or_bytes, bytes):
                import io
                img = Image.open(io.BytesIO(image_file_or_bytes))
            else:
                img = Image.open(image_file_or_bytes)
                
            img = ImageOps.exif_transpose(img)
            img_rgb = img.convert("RGB")
        except Exception as e:
            return {
                "status": "invalid_image",
                "error": f"Failed to decode image: {str(e)}",
                "inference_ms": round((time.perf_counter() - start_time) * 1000, 2)
            }

        # 1. Quality & Suitability Check
        quality = self.inspect_image_quality(img_rgb)
        if quality["status"] == "unsuitable":
            return {
                "status": "retake_image",
                "image_quality": quality,
                "retake_advice": quality["retake_advice"],
                "prediction": None,
                "alternatives": [],
                "model_version": self.model_version,
                "inference_ms": round((time.perf_counter() - start_time) * 1000, 2)
            }

        # 2. PyTorch Vision Inference
        tensor = self.transform(img_rgb).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.calibrated_model(tensor)
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        top3_indices = np.argsort(probs)[::-1][:3]
        top_idx = top3_indices[0]
        top_cls = IDX_TO_CLASS[top_idx]
        top_prob = float(probs[top_idx])

        top_meta = CLASS_CROP_MAP.get(top_cls, {"id": "unknown", "name": "Unknown", "condition": top_cls})
        is_healthy = "healthy" in top_cls
        
        alternatives = []
        for alt_idx in top3_indices[1:]:
            alt_cls = IDX_TO_CLASS[alt_idx]
            alt_meta = CLASS_CROP_MAP.get(alt_cls, {"id": "unknown", "name": "Unknown", "condition": alt_cls})
            alternatives.append({
                "condition_id": alt_cls,
                "condition_name": alt_meta["condition"],
                "crop": alt_meta["name"],
                "confidence": round(float(probs[alt_idx]), 4),
            })

        # 3. Calibrated Uncertainty Thresholding
        is_uncertain = top_prob < self.uncertainty_threshold
        status = "uncertain" if is_uncertain else "diagnosed"

        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "status": status,
            "crop": {"id": top_meta["id"], "name": top_meta["name"]},
            "prediction": {
                "condition_id": top_cls,
                "condition_name": top_meta["condition"],
                "condition_type": "healthy" if is_healthy else "disease",
                "model_confidence": round(top_prob, 4),
                "is_healthy": is_healthy,
                "calibrated": True
            },
            "alternatives": alternatives,
            "image_quality": quality,
            "expert_review_recommended": is_uncertain,
            "model_version": self.model_version,
            "taxonomy_version": self.taxonomy_version,
            "artifact_hash": self.artifact_hash[:16],
            "inference_ms": inference_time_ms
        }

if __name__ == "__main__":
    service = CropDoctorInferenceService()
    test_img = "frontend-next/public/images/crop-doctor/powdery-mildew-leaf.jpg"
    res = service.predict(test_img)
    print("\nInference Output Test:")
    print(json.dumps(res, indent=2))
