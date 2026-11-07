"""
Crop Doctor Production Vision Inference Service.
Integrates vision backbones with Platt temperature scaling calibration,
image quality guardrails, and out-of-distribution selective prediction.
"""

import os
import sys
import time
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional, Union
import torch
import numpy as np
from PIL import Image, ImageOps

# Ensure root in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from ml.crop_doctor.models.factory import create_model
from ml.crop_doctor.training.dataset import (
    get_eval_transforms,
    CANONICAL_CLASSES,
    IDX_TO_CLASS
)
from ml.crop_doctor.inference.calibrator import ModelWithTemperature
from ml.crop_doctor.inference.validator import ImageQualityValidator
from ml.crop_doctor.inference.ood_detector import OODAndAbstentionEngine

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

EFFICIENTNET_CKPT = "ml/crop_doctor/artifacts/experiments/exp_c2_efficientnet_b0_pretrained_224/best_model.pth"
DEFAULT_CANDIDATE_CKPT = EFFICIENTNET_CKPT
MOBILENET_TRANSFER_CKPT = "ml/crop_doctor/artifacts/experiments/exp_c1_mobilenet_v3_pretrained_224/best_model.pth"
BASELINE_CKPT = "ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth"

class CropDoctorInferenceService:
    _instance: Optional["CropDoctorInferenceService"] = None

    def __init__(self, checkpoint_path: Optional[str] = None, device_name: str = "cpu"):
        self.device = torch.device(device_name)

        # Determine active model path from env or prioritized defaults
        env_ckpt = os.getenv("CROP_DOCTOR_MODEL_PATH")
        if checkpoint_path:
            self.checkpoint_path = checkpoint_path
        elif env_ckpt and Path(env_ckpt).exists():
            self.checkpoint_path = env_ckpt
        elif Path(EFFICIENTNET_CKPT).exists():
            self.checkpoint_path = EFFICIENTNET_CKPT
        elif Path(MOBILENET_TRANSFER_CKPT).exists():
            self.checkpoint_path = MOBILENET_TRANSFER_CKPT
        else:
            self.checkpoint_path = BASELINE_CKPT

        self.model = None
        self.calibrated_model = None
        self.transform = get_eval_transforms()
        self.validator = ImageQualityValidator()
        self.ood_engine = OODAndAbstentionEngine(min_confidence_thresh=0.58)

        self.model_version = "crop-doctor-v1.0.0-scratch"
        self.taxonomy_version = "1.0.0"
        self.artifact_hash = ""
        self.is_ready = False
        self.temperature = 1.0

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

        ckpt = torch.load(p, map_location=self.device, weights_only=False)
        arch = ckpt.get("architecture", "mobilenet_v3_small")
        pretrained = ckpt.get("pretrained", ckpt.get("weights_mode") == "imagenet_transfer")

        # Dynamically set calibrated temperature and model version from artifact metadata
        if arch == "efficientnet_b0":
            self.model_version = "crop-doctor-v2.1.0-efficientnet-b0"
            self.temperature = 1.05
        elif pretrained:
            self.model_version = "crop-doctor-v2.0.0-mobilenet-v3-transfer"
            self.temperature = 0.9758
        else:
            self.model_version = "crop-doctor-v1.0.0-mobilenet-scratch"
            self.temperature = 0.9472

        base_model = create_model(arch, num_classes=len(CANONICAL_CLASSES), pretrained=pretrained)
        base_model.load_state_dict(ckpt["model_state_dict"])
        base_model.to(self.device)
        base_model.eval()

        self.calibrated_model = ModelWithTemperature(base_model)
        self.calibrated_model.temperature.data.fill_(self.temperature)
        self.calibrated_model.to(self.device)
        self.calibrated_model.eval()

        self.is_ready = True
        print(f"CropDoctorInferenceService initialized successfully with {arch} from {self.checkpoint_path} (hash: {self.artifact_hash[:12]}...).")

    def inspect_image_quality(self, img_rgb: Image.Image) -> Dict[str, Any]:
        """Runs fast deterministic quality and suitability checks via ImageQualityValidator."""
        return self.validator.validate(img_rgb)

    def predict(self, image_file_or_bytes: Union[Image.Image, str, Path, bytes], crop_hint: Optional[str] = None) -> Dict[str, Any]:
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
        if not quality.get("is_acceptable", True):
            return {
                "status": "retake_image",
                "image_quality": quality,
                "retake_advice": quality.get("retake_advice", "Image quality is unsuitable for reliable diagnosis."),
                "prediction": None,
                "alternatives": [],
                "model_version": self.model_version,
                "inference_ms": round((time.perf_counter() - start_time) * 1000, 2)
            }

        # 2. PyTorch Vision Inference with Calibrated Scaling
        tensor = self.transform(img_rgb).unsqueeze(0).to(self.device)
        with torch.no_grad():
            scaled_logits = self.calibrated_model(tensor)
            probs = torch.softmax(scaled_logits, dim=1).squeeze(0).cpu().numpy()

        # 3. Uncertainty, Energy, and OOD Evaluation
        reliability = self.ood_engine.evaluate_reliability(scaled_logits, probs, temperature=self.temperature)

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

        # 4. Crop Hint Cross-Verification
        crop_hint_mismatch = False
        if crop_hint:
            hint_norm = crop_hint.lower().strip()
            detected_crop_id = top_meta["id"].lower()
            if hint_norm not in detected_crop_id and detected_crop_id not in hint_norm:
                crop_hint_mismatch = True

        # 5. Final Diagnostic Status
        is_uncertain = reliability["should_abstain"] or crop_hint_mismatch
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
            "reliability_assessment": reliability,
            "image_quality": quality,
            "crop_hint_mismatch": crop_hint_mismatch,
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
