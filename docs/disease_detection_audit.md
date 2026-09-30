# KISAANBUDDY — DISEASE DETECTION AI AUDIT REPORT

**Date:** September 29, 2026  
**Auditor:** Senior AI/ML Architect & Computer Vision Engineer  
**Target:** Disease Detection Subsystem  
**Branch:** `feature/disease-detection-production`  
**Phase:** Phase 1 — Technical Audit & Architecture Review

---

## 1. CURRENT ARCHITECTURE OVERVIEW

The current KisaanBuddy disease detection implementation relies on an **LLM-based Vision-Language pipeline** rather than a localized convolutional/vision ML model.

```text
+------------------------+      Canvas Resize      +----------------------+
|  Farmer Leaf Photo     | ---------------------> | Base64 Data URL      |
|  (Browser File Upload) |   (MAX_WIDTH: 800px)   | (JPEG Quality: 0.7)  |
+------------------------+                        +----------+-----------+
                                                             |
                                                             | POST /api/chat/stream
                                                             v
+------------------------+      SSE Stream        +----------------------+
| DiseasePortal (React)  | <--------------------- | FastAPI Orchestrator |
| Render 10-Section UI   |                        | Gemini / OpenAI LLM  |
+------------------------+                        +----------------------+
```

---

## 2. CURRENT MODEL & INFERENCE PIPELINE AUDIT

* **Model Type:** Multimodal Vision-Language LLM (Google Gemini 1.5 Flash / OpenAI GPT-4o-mini).
* **Local Models / Weights:** 0 local ML checkpoints in `ml/` or `backend/`.
* **Preprocessing Pipeline:**
  - Client-side canvas resize in [`frontend-next/src/app/disease/DiseaseClient.tsx`](file:///c:/Users/HP/Kisaanbuddy/frontend-next/src/app/disease/DiseaseClient.tsx#L64-L79):
    ```typescript
    const MAX_WIDTH = 800;
    // Resizes canvas and exports to JPEG base64 at 0.7 quality
    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
    ```
* **System Prompt & Diagnosis Protocol:**
  - Enforces a 10-section structured Hindi/English diagnosis format defined in [`backend/data/knowledge/disease_diagnosis_protocol.md`](file:///c:/Users/HP/Kisaanbuddy/backend/data/knowledge/disease_diagnosis_protocol.md):
    1. Crop Name
    2. Disease Diagnosis
    3. Confidence Level (High/Medium/Low)
    4. Problem Explanation
    5. Causes
    6. Organic Treatment
    7. Chemical Treatment
    8. Prevention Strategy
    9. Severity Level
    10. Market Advice
* **Database Persistence:**
  - Diagnoses and metadata are stored in PostgreSQL table `disease_detections` ([`backend/db/models.py`](file:///c:/Users/HP/Kisaanbuddy/backend/db/models.py#L72-L83)) and queried via `GET /api/disease/history` ([`backend/api/disease.py`](file:///c:/Users/HP/Kisaanbuddy/backend/api/disease.py)).

---

## 3. DATASET & CLASS TAXONOMY AUDIT

* **Local Training Dataset:** 0 images (no local training data checked into the repository).
* **Supported Taxonomies in Knowledge Base:**
  - ~35+ major Indian crop-disease pairs across 9 primary categories:
    1. **Rice / Paddy:** Blast, Bacterial Leaf Blight, Sheath Blight, Brown Spot
    2. **Wheat:** Yellow Rust, Brown Rust, Loose Smut, Karnal Bunt
    3. **Cotton:** Pink Bollworm, Whitefly, Bacterial Blight, Leaf Curl Virus (CLCuV)
    4. **Tomato / Potato:** Late Blight, Early Blight, Fusarium Wilt, Tomato Leaf Curl Virus
    5. **Chilli / Brinjal:** Anthracnose, Thrips (Leaf Curl), Shoot & Fruit Borer
    6. **Maize:** Fall Armyworm, Stem Borer, Turcicum Leaf Blight
    7. **Sugarcane:** Red Rot, Smut, Early Shoot Borer
    8. **Pulses:** Pod Borer, Fusarium Wilt, Yellow Mosaic Virus
    9. **Mango / Banana:** Hopper, Anthracnose, Panama Wilt (TR4), Sigatoka

---

## 4. SYSTEM WEAKNESSES & REAL-WORLD RISKS

### 4.1 Dataset & Training Weaknesses
1. **Lack of Local Ground-Truth Benchmark:** Zero internal training or validation datasets exist to evaluate prediction accuracy or measure degradation across model updates.
2. **Dependence on Clean Web Data:** General-purpose LLMs are trained primarily on web images, which disproportionately feature clean benchmark photos (such as studio leaf samples on uniform backgrounds).

### 4.2 Inference & Operational Weaknesses
1. **High Latency & Cost:** Sending 800px base64 images over HTTP SSE streams to commercial LLM APIs incurs high per-request latency (2–5 seconds) and token costs.
2. **Rate Limits & API Quotas:** High traffic volume on `/api/chat/stream` risks hitting LLM rate limits.
3. **Lack of Out-of-Distribution (OOD) Rejection:** Current LLM prompts attempt to guess a disease even when provided non-leaf images, blurry photos, or un-diagnosable input, rather than cleanly rejecting out-of-distribution uploads.

---

## 5. SCOPE & FILE SAFETY MATRIX

### Files Inspected (Read-Only)
* [`backend/api/disease.py`](file:///c:/Users/HP/Kisaanbuddy/backend/api/disease.py)
* [`backend/api/ml.py`](file:///c:/Users/HP/Kisaanbuddy/backend/api/ml.py)
* [`backend/data/knowledge/disease_diagnosis_protocol.md`](file:///c:/Users/HP/Kisaanbuddy/backend/data/knowledge/disease_diagnosis_protocol.md)
* [`backend/data/knowledge/pests_diseases.md`](file:///c:/Users/HP/Kisaanbuddy/backend/data/knowledge/pests_diseases.md)
* [`frontend-next/src/app/disease/DiseaseClient.tsx`](file:///c:/Users/HP/Kisaanbuddy/frontend-next/src/app/disease/DiseaseClient.tsx)

### Files to be Modified in Implementation Phases (Phase 2+)
* `ml/platform/models/` (New trained ONNX/PyTorch vision model checkpoints)
* `backend/api/disease.py` (Adding local vision model inference endpoint)
* `backend/services/disease_classifier.py` (New local vision classifier service)

### Strict Un-Touched Files (Preserved Architecture)
* [`backend/services/worker.py`](file:///c:/Users/HP/Kisaanbuddy/backend/services/worker.py)
* [`backend/services/job_service.py`](file:///c:/Users/HP/Kisaanbuddy/backend/services/job_service.py)
* `backend/infrastructure/redis.py`
* `docker-compose.yml` & `Dockerfile`

---
*Disease Detection Audit Complete.*
