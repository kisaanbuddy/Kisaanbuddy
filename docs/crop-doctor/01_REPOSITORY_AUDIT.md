# 01 — Repository Audit & Legacy Assessment
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  
**Branch:** `feature/crop-doctor-ml-rebuild`  

---

## 1. Executive Summary

A comprehensive static and dynamic inspection was conducted across the KisaanBuddy repository (`https://github.com/utkarshsinha-dev/Kisaanbuddy`). The inspection confirmed that while the user-facing interfaces, agronomic protocols, and backend routing frameworks provide strong architectural bones, the legacy ML pipeline and fallback logic suffer from fundamental defects that compromise diagnostic integrity:
1. **Procedural Synthetic Leaves:** Existing dataset scripts in `ml/platform/datasets/scripts/` synthesize leaf images using PIL drawing primitives (`ImageDraw`) rather than curating genuine field photographs.
2. **Pretrained Weights Dependency:** Legacy model training scripts explicitly load torchvision pretrained ImageNet checkpoints (`weights=...DEFAULT`), in direct contradiction with the requirement to train from random initialization.
3. **Hardcoded Fallbacks & Fabricated Metrics:** The Next.js prediction route (`frontend-next/src/app/api/disease/predict/route.ts`) returns fixed confidence metrics (`0.92`, `0.84`, `0.76`) and claims `"EfficientNetV2-S (Calibrated T=0.75)"` when the backend is offline. The FastAPI classifier (`backend/services/disease_classifier.py`) falls back to `self.classes[0]` when the model is not loaded.
4. **Environment Discrepancy:** The host machine has an NVIDIA GeForce RTX 4060 Laptop GPU with 8 GB VRAM, but the Python virtual environment has CPU-only PyTorch (`2.14.0+cpu`). Training and inference must be optimized to run cleanly on CPU/GPU without dependency conflicts.

---

## 2. File-by-File Inspection Evidence

### 2.1 Dataset Generation Scripts
- **File:** `ml/platform/datasets/scripts/download_and_curate.py`
  - *Lines 49–60:* Defines `generate_synthetic_leaf(cls_name: str, ...)` using `ImageDraw.Draw` to draw ellipses, veins, and lesion dots.
  - *Lines 116–120:* Iterates through classes generating synthetic PNGs and saving them as raw data.
- **File:** `ml/platform/datasets/scripts/download_and_curate_phase3a.py`
  - *Lines 47–80:* Defines `generate_field_leaf_sample(...)` simulating "field-looking" leaves with synthetic noise.
  - *Verdict:* **UNACCEPTABLE AS FIELD EVIDENCE.** All synthetic data must be strictly quarantined and barred from training, validation, and holdout evaluation.

### 2.2 Model Training Pipelines
- **File:** `ml/platform/pipelines/train_and_benchmark_phase3a.py`
  - *Line 172:* `models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)`
  - *Line 176:* `models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.DEFAULT)`
- **File:** `ml/platform/pipelines/train_and_benchmark_phase4b.py`
  - *Line 306:* Loads ImageNet default weights for training with focal loss.
  - *Verdict:* **NON-COMPLIANT.** The rebuild must train models initialized exclusively with random weights (`weights=None`).

### 2.3 Backend Classification & Routing
- **File:** `backend/services/disease_classifier.py`
  - *Lines 120–126:* If `self.session is None` (ONNX missing or uninitialized), it assigns:
    `top_class = self.classes[0] if self.classes else "healthy_general"` and returns a synthetic heuristic dictionary.
- **File:** `backend/api/disease.py`
  - *Lines 99–108:* Symptom matching fallback returns fixed `confidence: 0.76` and hardcoded alternative distributions (`0.14`, `0.10`).
  - *Lines 170–178:* When raw confidence is missing or low, it injects a default `0.50` confidence.
  - *Verdict:* **NON-COMPLIANT.** When inference is unavailable or inconclusive, the service must return explicit typed statuses (`model_unavailable`, `uncertain`, `retake_image`) and never invent a diagnosis.

### 2.4 Frontend Prediction Route
- **File:** `frontend-next/src/app/api/disease/predict/route.ts`
  - *Lines 66–72:* Catches backend offline error and executes a local "calibrated diagnosis" fallback.
  - *Lines 100–103:* `const confidence = isHealthy ? 0.92 : hasPhoto ? 0.84 : 0.76;`
  - *Line 127:* `model: hasPhoto ? "EfficientNetV2-S (Calibrated T=0.75)" : "ICAR-CIBRC Agronomic Expert Engine (Symptom Match)"`
  - *Verdict:* **DECEPTIVE FALLBACK.** Must be replaced with a clean HTTP 503 Service Unavailable / backend error response.

---

## 3. Preserved Assets

The following existing assets represent high-quality work that will be preserved and leveraged:
1. **Agronomic Knowledge Base:**
   - `backend/data/knowledge/disease_diagnosis_protocol.md`
   - `backend/data/knowledge/pests_diseases.md`
   These provide genuine ICAR/CIBRC management guidance, chemical restrictions, and cultural practices.
2. **Database Models & Auth Architecture:**
   - `backend/db/models.py` (SQLAlchemy models for users, farmer profiles, and farm entities).
   - JWT authentication and user ownership checks.
3. **Frontend UI Components:**
   - `frontend-next/src/app/disease/DiseaseClient.tsx` contains an accessible mobile-friendly farmer UI with Hindi/English localization.

---

## 4. Hardware and Environment Specification

- **OS:** Windows 11 Home Single Language (10.0.26300)
- **Host CPU:** 13th Gen Intel Core i7-13700H (16 logical processors)
- **Host RAM:** 15.65 GB (5.45 GB available during audit)
- **Host Storage:** 25.59 GB free on drive `C:`
- **Host GPU:** NVIDIA GeForce RTX 4060 Laptop GPU (8188 MiB VRAM), Driver 621.01
- **Python:** 3.13.9 in `backend/venv` with PyTorch 2.14.0+cpu, torchvision 0.29.0, onnxruntime 1.30.0.
  - *Windows OpenMP Note:* Requires `$env:KMP_DUPLICATE_LIB_OK="TRUE"`.
- **Node.js:** v24.16.0

---

## 5. Phase 1 Conclusion & Transition Gate

Phase 1 audit is complete. The work ledger has been established in `00_EXECUTION_STATUS.md`.
Immediate next step: Proceed to **Phase 2 — Dataset Research and Licensing**, defining the canonical taxonomy and verifying genuine Indian agricultural image sources.
