"""Crop Doctor diagnosis processing for WhatsApp incoming crop foliage images."""
from __future__ import annotations

import io
import logging
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from PIL import Image
from sqlalchemy.orm import Session

from core.config import settings
from db.models import DiseaseDetection, User, WhatsAppUser
from services.disease_classifier import get_disease_classifier
from services.disease_knowledge_engine import (
    AGRICULTURAL_KNOWLEDGE_BASE,
    normalize_crop_name,
    query_knowledge_base,
)
from services.whatsapp.localization import get_text
from services.whatsapp.security import generate_secure_link_token

log = logging.getLogger(__name__)

# Uploads directory
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "uploads" / "crop_doctor"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Image validation limits
MAX_IMAGE_SIZE_BYTES = 16 * 1024 * 1024  # 16 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Try loading PyTorch inference engine if available
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
pipelines_dir = BASE_DIR / "ml" / "platform" / "pipelines"
if str(pipelines_dir) not in sys.path and pipelines_dir.exists():
    sys.path.insert(0, str(pipelines_dir))

try:
    from inference_engine import predict_disease as pytorch_predict_disease
except Exception:
    pytorch_predict_disease = None


def validate_crop_image(image_bytes: bytes, mime_type: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """Validates image payload size, magic bytes, dimensions and formats.

    Returns (is_valid, error_reason).
    """
    if not image_bytes or len(image_bytes) == 0:
        return False, "Empty image bytes received."

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        return False, f"Image size exceeds 16 MB limit ({len(image_bytes) / (1024 * 1024):.1f} MB)."

    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.width * img.height > 20_000_000:
            return False, "Image dimensions exceed the 20 megapixel limit."
        img.verify()  # Verifies file integrity
    except Exception as e:
        log.warning("Image verification failed: %s", e)
        return False, "Corrupted or unsupported image file."

    # Check format
    img_format = (img.format or "").upper()
    if img_format not in ("JPEG", "JPG", "PNG", "WEBP"):
        return False, f"Unsupported image format: {img_format}."

    # Check minimum dimensions
    try:
        # Re-open after verify()
        img2 = Image.open(io.BytesIO(image_bytes))
        width, height = img2.size
        if width < 32 or height < 32:
            return False, f"Image dimensions too small ({width}x{height})."
    except Exception as e:
        return False, f"Failed reading image dimensions: {e}"

    return True, None


def save_crop_image(image_bytes: bytes, ext: str = ".jpg") -> str:
    """Saves crop image locally and returns relative or accessible file URL."""
    filename = f"crop_{uuid.uuid4().hex[:12]}{ext}"
    target_path = UPLOADS_DIR / filename
    with open(target_path, "wb") as f:
        f.write(image_bytes)
    return f"/static/uploads/crop_doctor/{filename}"


async def process_crop_doctor_image(
    image_bytes: bytes,
    mime_type: str,
    phone_number: str,
    db: Session,
    language: str = "en",
) -> Dict[str, Any]:
    """Runs actual Crop Doctor inference on foliage image, records diagnosis, and crafts response."""
    # 1. Validate image
    is_valid, reason = validate_crop_image(image_bytes, mime_type)
    if not is_valid:
        log.warning("Rejected crop image from %s: %s", phone_number, reason)
        return {
            "success": False,
            "error_type": "invalid_image",
            "message": get_text("crop_doctor_invalid_image", language),
        }

    # 2. Save image to disk
    ext = ".jpg" if "jpeg" in mime_type or "jpg" in mime_type else ".png"
    stored_image_url = save_crop_image(image_bytes, ext=ext)

    # 3. Execute actual Crop Doctor ML inference
    raw_result = None

    if pytorch_predict_disease is not None:
        try:
            raw_result = pytorch_predict_disease(image_bytes)
        except Exception as e:
            log.warning("PyTorch inference error: %s; falling back to ONNX", e)
            raw_result = None

    if raw_result is None:
        try:
            classifier = get_disease_classifier()
            onnx_res = classifier.predict(image_bytes)
            raw_result = {
                "predicted_class": onnx_res["disease_code"],
                "confidence": onnx_res["confidence"],
                "top_predictions": [
                    {"class": p["class"], "confidence": p["score"]}
                    for p in onnx_res.get("top_3", [])
                ],
                "model": "ONNX MobileNetV3-Small (Calibrated T=1.2)",
                "status": "ok" if onnx_res["status"] == "confident" else "uncertain",
                "crop": onnx_res.get("crop", "General"),
                "disease_name": onnx_res.get("disease_name", onnx_res["disease_code"]),
            }
        except Exception as exc:
            log.exception("Inference failed completely: %s", exc)
            return {
                "success": False,
                "error_type": "inference_failure",
                "message": get_text("crop_doctor_inference_error", language),
            }

    # 4. Enrich with authentic ICAR/CIBRC Knowledge
    predicted_class = raw_result.get("predicted_class", "unknown")
    crop_name = raw_result.get("crop")
    if not crop_name or crop_name == "General":
        crop_name = predicted_class.split("_")[0].capitalize() if "_" in predicted_class else "Crop"

    knowledge_matches = query_knowledge_base(crop_name, predicted_class)
    best_guide = {}  # Legacy profiles lack document-level reviewed provenance.

    confidence_val = float(raw_result.get("confidence", 0.0))
    is_uncertain = (
        raw_result.get("status") == "uncertain"
        or confidence_val < 0.60
        or ("healthy" not in predicted_class and confidence_val < 0.65)
    )

    disease_display = best_guide.get("disease_or_pest", predicted_class.replace("_", " ").title())
    remedy_text = "Verified treatment guidance is unavailable; field assessment is required."
    is_uncertain = True  # A classifier score is not a validated field diagnosis.

    # 5. Persist to existing DiseaseDetection database model
    # Link to existing user if phone number matches
    user_rec = db.query(User).filter(User.phone_number == phone_number).first()
    user_id = user_rec.id if user_rec else None

    detection_record = DiseaseDetection(
        user_id=user_id,
        image_url=stored_image_url,
        detected_disease=disease_display,
        crop_name=crop_name,
        confidence=confidence_val,
        remedy_suggested=remedy_text[:1000],
        detected_at=datetime.utcnow(),
    )
    db.add(detection_record)
    db.commit()
    db.refresh(detection_record)

    diagnosis_id = str(detection_record.id)

    # 6. Generate secure contextual web link
    link_token = generate_secure_link_token(
        phone_number=phone_number,
        action="view_diagnosis",
        target_id=diagnosis_id,
        expires_seconds=86400 * 7,  # 7 days validity
    )
    frontend_base = (settings.FRONTEND_BASE_URL or "https://www.kisaanbuddy.com").rstrip("/")
    if "localhost" in frontend_base and not settings.DEBUG:
        frontend_base = "https://www.kisaanbuddy.com"
    diagnosis_web_url = f"{frontend_base}/disease?diagnosis_id={diagnosis_id}&token={link_token}"

    # Scores remain internal; do not present them as calibrated field certainty.
    if language == "hi":
        text = (f"फोटो मॉडल ने यह संभावना सुझाई: {disease_display}। यह पक्का निदान नहीं है। "
                "कृपया फसल का नाम, उम्र, जिला और लक्षण कब शुरू हुए बताएं। "
                "सत्यापित उपचार उपलब्ध नहीं है। दवा छिड़कने से पहले स्थानीय KVK से पुष्टि कराएं।")
    elif language == "kn":
        text = (f"ಚಿತ್ರ ಮಾದರಿಯ ಸಾಧ್ಯತೆ: {disease_display}. ಇದು ಖಚಿತ ರೋಗನಿರ್ಣಯವಲ್ಲ. "
                "ಬೆಳೆ, ವಯಸ್ಸು, ಜಿಲ್ಲೆ ಮತ್ತು ಲಕ್ಷಣಗಳು ಪ್ರಾರಂಭವಾದ ಸಮಯ ತಿಳಿಸಿ. "
                "ದೃಢೀಕೃತ ಚಿಕಿತ್ಸೆ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳೀಯ KVK ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.")
    else:
        text = (f"The image model suggests a possibility: {disease_display}. This is not a confirmed diagnosis. "
                "What crop is this, how old is it, which district, and when did symptoms begin? "
                "Reviewed treatment guidance is unavailable. Consult your local KVK before applying chemicals.")
    formatted_message = text + f"\n\nCase report: {diagnosis_web_url}"

    return {
        "success": True,
        "diagnosis_id": diagnosis_id,
        "crop": crop_name,
        "disease": disease_display,
        "confidence": confidence_val,
        "is_uncertain": is_uncertain,
        "web_url": diagnosis_web_url,
        "message": formatted_message,
    }
