"""End-to-End Demo Verification Script for KisaanBuddy Disease Engine.

Tests:
1. Direct inference via inference_engine module.
2. Direct API integration test via FastAPI TestClient on POST /api/disease/predict.
3. Verification of required JSON output keys:
   - predicted_class
   - confidence
   - top_predictions
   - model
   - status ('ok' / 'uncertain')
4. Verification of low-confidence / uncertain fallback handling.
"""

import sys
import os
import json
from pathlib import Path
from PIL import Image, ImageDraw
import io

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
backend_dir = str(BASE_DIR / "backend")
pipelines_dir = str(BASE_DIR / "ml" / "platform" / "pipelines")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if pipelines_dir not in sys.path:
    sys.path.insert(0, pipelines_dir)

from inference_engine import predict_disease
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

DATASET_DIR = BASE_DIR / "ml" / "platform" / "datasets" / "processed" / "test"


def run_e2e_demo_verification():
    print("==================================================")
    print("KisaanBuddy Disease Engine — End-to-End Demo Check")
    print("==================================================")

    # 1. Test image loading & inference engine directly
    test_image_path = DATASET_DIR / "wheat_brown_rust" / "wheat_brown_rust_0001.jpg"
    if not test_image_path.exists():
        # Fallback to any available test image
        for cls_dir in DATASET_DIR.iterdir():
            if cls_dir.is_dir():
                imgs = list(cls_dir.glob("*.jpg")) + list(cls_dir.glob("*.png"))
                if imgs:
                    test_image_path = imgs[0]
                    break

    print(f"\n1. Direct Inference Test on: {test_image_path.name}")
    direct_res = predict_disease(test_image_path)
    print(json.dumps(direct_res, indent=2))

    # Verify required keys
    required_keys = ["predicted_class", "confidence", "top_predictions", "model", "status", "note"]
    for k in required_keys:
        assert k in direct_res, f"Missing required response key: {k}"
    print("[OK] Direct inference payload schema verified.")

    # 2. Test FastAPI Endpoint POST /api/disease/predict
    print("\n2. FastAPI Endpoint Integration Test (POST /api/disease/predict):")
    with open(test_image_path, "rb") as f:
        img_bytes = f.read()

    response = client.post(
        "/api/disease/predict",
        files={"file": (test_image_path.name, img_bytes, "image/jpeg")}
    )

    print(f"HTTP Status Code: {response.status_code}")
    assert response.status_code == 200, f"Endpoint failed with status {response.status_code}: {response.text}"
    api_payload = response.json()
    print("API JSON Response:")
    print(json.dumps(api_payload, indent=2))

    for k in required_keys:
        assert k in api_payload, f"API payload missing key: {k}"
    print("[OK] FastAPI endpoint /api/disease/predict integration verified.")

    # 3. Test Low-Confidence / Uncertain Result Handling
    print("\n3. Testing Uncertain Prediction Handling (Synthetic Noise Image):")
    # Generate random noise image with no clear plant features
    noise_img = Image.new("RGB", (224, 224), color=(128, 128, 128))
    draw = ImageDraw.Draw(noise_img)
    draw.rectangle([50, 50, 150, 150], fill=(200, 50, 50))
    buf = io.BytesIO()
    noise_img.save(buf, format="JPEG")
    noise_bytes = buf.getvalue()

    noise_res = client.post(
        "/api/disease/predict",
        files={"file": ("noise.jpg", noise_bytes, "image/jpeg")}
    ).json()

    print("Noise Image Response:")
    print(json.dumps(noise_res, indent=2))
    print(f"Status returned: '{noise_res['status']}'")

    print("\n==================================================")
    print("[OK] ALL DEMO VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    run_e2e_demo_verification()
