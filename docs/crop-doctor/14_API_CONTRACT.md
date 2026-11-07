# API Contract & Schema Specification

**Project:** KisaanBuddy Crop Doctor AI Rebuild  
**Prefix:** `/api/v1/disease`  
**Protocol:** HTTP/1.1 & HTTP/2 REST / JSON  

---

## 1. Endpoints Overview

| Method | Path | Summary | Auth | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/disease/predict` | Upload image for vision disease diagnosis | Bearer / Public | 60 req/min/IP |
| `GET` | `/api/v1/disease/crops` | List supported crops & coverage | None | 120 req/min |
| `GET` | `/api/v1/disease/classes` | List 17 canonical conditions & taxonomy | None | 120 req/min |
| `GET` | `/api/v1/disease/model-status` | Model version, hash, temperature, health | None | 120 req/min |
| `GET` | `/api/v1/disease/diagnosis/{id}` | Retrieve persisted historical diagnosis | Optional | 120 req/min |
| `POST` | `/api/v1/disease/feedback` | Farmer confirmation or correction feedback | Optional | 60 req/min |

---

## 2. Request & Response Schemas

### 2.1 `POST /api/v1/disease/predict`

#### Request: `multipart/form-data`
- `image` *(binary, required)*: JPG, PNG, or WebP leaf photograph. Maximum size: 10MB.
- `crop_hint` *(string, optional)*: Optional crop identifier (e.g., `tomato`, `potato`, `corn`).
- `notes` *(string, optional)*: Farmer-reported observations.

#### Response: `200 OK` (Application JSON)
```json
{
  "id": "diag_01HXYZ123456789",
  "status": "diagnosed",
  "crop": {
    "id": "tomato",
    "name": "Tomato"
  },
  "prediction": {
    "condition_id": "tomato_early_blight",
    "condition_name": "Early Blight",
    "condition_type": "disease",
    "model_confidence": 0.8421,
    "is_healthy": false,
    "calibrated": true
  },
  "alternatives": [
    {
      "condition_id": "tomato_septoria_leaf_spot",
      "condition_name": "Septoria Leaf Spot",
      "crop": "Tomato",
      "confidence": 0.0912
    },
    {
      "condition_id": "tomato_late_blight",
      "condition_name": "Late Blight",
      "crop": "Tomato",
      "confidence": 0.0415
    }
  ],
  "image_quality": {
    "status": "acceptable",
    "blur_score": 42.18,
    "brightness_mean": 118.4,
    "flags": [],
    "retake_advice": null
  },
  "treatment": {
    "description": "Fungal infection caused by Alternaria solani causing target-like brown spots.",
    "immediate_actions": [
      "Remove and safely dispose of infected lower leaves.",
      "Avoid overhead sprinkler irrigation to keep foliage dry."
    ],
    "organic_options": [
      "Apply copper fungicide or neem oil solution at early symptom emergence."
    ],
    "chemical_options": [
      "Mancozeb 75% WP (2g/L) or Chlorothalonil 75% WP."
    ]
  },
  "expert_review_recommended": false,
  "model_version": "crop-doctor-v1.0.0-scratch",
  "taxonomy_version": "1.0.0",
  "artifact_hash": "a335653b9173",
  "inference_ms": 22.45
}
```

#### Response: `200 OK` (Unsuitable Image Retake State)
```json
{
  "id": "diag_01HXYZ999999999",
  "status": "retake_image",
  "crop": null,
  "prediction": null,
  "alternatives": [],
  "image_quality": {
    "status": "unsuitable",
    "blur_score": 4.12,
    "brightness_mean": 9.8,
    "flags": ["extreme_blur", "underexposed"],
    "retake_advice": "Image is blurry. Hold your phone steady and tap to focus on the leaf. Photo is too dark. Please take the picture in bright daytime natural light."
  },
  "treatment": null,
  "expert_review_recommended": true,
  "model_version": "crop-doctor-v1.0.0-scratch",
  "taxonomy_version": "1.0.0",
  "artifact_hash": "a335653b9173",
  "inference_ms": 5.12
}
```

---

## 3. Error Codes & SLA Guarantees

| HTTP Status | Code | Meaning |
| :--- | :--- | :--- |
| `400 Bad Request` | `INVALID_IMAGE_FILE` | Corrupted byte header or unsupported file format |
| `413 Payload Too Large` | `FILE_TOO_LARGE` | File exceeds maximum allowable 10MB limit |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Exceeded 60 requests per minute per IP |
| `503 Service Unavailable` | `MODEL_UNAVAILABLE` | Checkpoint not loaded into memory or inference offline |
