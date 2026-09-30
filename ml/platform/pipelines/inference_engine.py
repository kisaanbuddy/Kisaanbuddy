"""KisaanBuddy Crop Disease Inference Engine.

Production-ready inference wrapper serving the selected EfficientNetV2-S
model (trained with Focal Loss gamma=2.0, calibrated at T=0.75).
"""

import os
import io
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image
from pathlib import Path
from typing import Dict, Any, Union, List

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "v4" / "efficientnet_v2_s_focal_best.pth"

CLASS_NAMES = [
    "cotton_bacterial_blight",
    "cotton_leaf_curl",
    "healthy_general",
    "potato_early_blight",
    "potato_healthy",
    "potato_late_blight",
    "rice_bacterial_blight",
    "rice_blast",
    "rice_brown_spot",
    "tomato_early_blight",
    "tomato_healthy",
    "tomato_late_blight",
    "tomato_leaf_curl",
    "wheat_brown_rust",
    "wheat_yellow_rust",
]

TEMPERATURE = 0.75
CONFIDENCE_THRESHOLD = 0.40
MARGIN_THRESHOLD = 0.10

eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

_MODEL_INSTANCE: Union[nn.Module, None] = None


def get_inference_model() -> nn.Module:
    """Lazy loader for the EfficientNetV2-S model state."""
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model checkpoint missing at {MODEL_PATH}")
        
        model = models.efficientnet_v2_s(weights=None)
        in_feat = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_feat, len(CLASS_NAMES))
        
        state_dict = torch.load(MODEL_PATH, map_location="cpu")
        model.load_state_dict(state_dict)
        model.eval()
        _MODEL_INSTANCE = model
    return _MODEL_INSTANCE


def predict_disease(image_source: Union[bytes, str, Path, Image.Image]) -> Dict[str, Any]:
    """Runs disease prediction on input image data.
    
    Args:
        image_source: Raw image bytes, file path string/Path, or PIL Image.
        
    Returns:
        Structured dictionary adhering to production API specification.
    """
    if isinstance(image_source, (str, Path)):
        img = Image.open(image_source).convert("RGB")
    elif isinstance(image_source, bytes):
        img = Image.open(io.BytesIO(image_source)).convert("RGB")
    elif isinstance(image_source, Image.Image):
        img = image_source.convert("RGB")
    else:
        raise ValueError("Unsupported image input type.")

    model = get_inference_model()
    tensor = eval_transform(img).unsqueeze(0)

    with torch.no_grad():
        raw_logits = model(tensor)
        calibrated_logits = raw_logits / TEMPERATURE
        probs = F.softmax(calibrated_logits, dim=1).squeeze(0)

        top_k_probs, top_k_indices = torch.topk(probs, k=3)

    top_predictions = []
    for idx, prob in zip(top_k_indices, top_k_probs):
        top_predictions.append({
            "class": CLASS_NAMES[idx.item()],
            "confidence": round(float(prob.item()), 4)
        })

    top_class = top_predictions[0]["class"]
    top_confidence = top_predictions[0]["confidence"]
    second_confidence = top_predictions[1]["confidence"]
    margin = top_confidence - second_confidence

    status = "ok"
    note = "High-confidence prediction."
    if top_confidence < CONFIDENCE_THRESHOLD or margin < MARGIN_THRESHOLD:
        status = "uncertain"
        note = f"Model prediction is uncertain (confidence {top_confidence:.2f} < {CONFIDENCE_THRESHOLD} or margin {margin:.2f} < {MARGIN_THRESHOLD}). Expert review advised."

    return {
        "predicted_class": top_class,
        "confidence": top_confidence,
        "top_predictions": top_predictions,
        "model": "EfficientNetV2-S (Focal Loss gamma=2.0, T=0.75)",
        "status": status,
        "note": note
    }


if __name__ == "__main__":
    # Smoke test on test image
    test_img_path = BASE_DIR / "datasets" / "processed" / "test" / "cotton_leaf_curl" / "cotton_leaf_curl_0001.jpg"
    if test_img_path.exists():
        result = predict_disease(test_img_path)
        print("Inference Wrapper Test Result:")
        import json
        print(json.dumps(result, indent=2))
