# KisaanBuddy Crop Doctor: Field Pilot Architecture & Operational Design

**Status:** Approved for Implementation  
**Target Environment:** Local Development, KVK Agronomist Supervised Pilot, Next.js / FastAPI Hybrid Architecture  
**Document Version:** 1.0.0  
**Date:** 2026-11-07  

---

## 1. Executive Context & Objectives

Following the independent safety audit of the Crop Doctor AI system on branch `feature/crop-doctor-ml-rebuild`, the system was certified as **"Suitable for limited supervised field pilot"**. 

While the fine-tuned EfficientNet-B0 vision model achieves 89.44% Top-1 accuracy on clean laboratory images and 61.29% Top-1 (92.74% Top-3) on real-world field photographs, the remaining selective risk of ~31%–34% under outdoor covariate shift means **autonomous, unsupervised pesticide recommendations pose agricultural risks to farmers**.

To bridge the gap between a research prototype and a commercial-grade agricultural service, this architecture establishes a **Supervised Agricultural Field Pilot Platform**. It enables genuine Indian farmers to receive rapid AI preliminary screenings while routing uncertain or critical cases to accredited Krishi Vigyan Kendra (KVK) agronomists, systematically capturing expert-verified ground truth for the next model training iteration.

---

## 2. Current Architecture Audit

### 2.1 Backend Services (`backend/`)
- **FastAPI Core (`backend/main.py`):** Central ASGI application exposing API routes for disease classification, auth, schemes, mandi, and farmer profiles.
- **Vision Inference (`ml/crop_doctor/inference/service.py`):** Loads `exp_c2_efficientnet_b0_pretrained_224` with temperature scaling ($T=1.0500$) and Free Energy OOD detection ($E(x) \le -3.5$). Includes pre-inference image quality guardrails (blur detection via Laplacian variance, over/underexposure, and green foliage ratio).
- **Disease API (`backend/api/disease.py`):**
  - `POST /api/disease/predict`: Accepts leaf image, executes inference service, and queries the ICAR/CIBRC Integrated Disease Management (IDM) knowledge base.
  - `GET /api/disease/crops` & `/classes`: Exposes supported taxonomy (17 canonical conditions).
  - `GET /api/disease/experts`: Queries directory of 8 accredited KVK / ICAR institutions.
  - `GET /api/disease/history` & `/diagnosis/{id}`: Farmer historical records stored in `disease_detections` table.
- **Authentication & Authorization (`backend/api/auth.py`):**
  - Session-based and JWT token authentication.
  - `get_current_user`: Resolves authenticated `User` record.
  - `require_admin`: Restricts access to administrator roles.
  - *Gap identified:* Role-based access control for agricultural experts (`require_expert_or_admin`) was previously unmounted, allowing potential authorization bypass if client endpoints were not secured server-side.

### 2.2 Database Layer (`backend/db/`)
- **Engine & Session (`backend/db/session.py`):** SQLAlchemy 2.0 with SQLite locally (`krishiai.db`) and PostgreSQL compatibility in production.
- **Existing Schema Models (`backend/db/models.py`):**
  - `User`: Handles identity, roles (`Farmer`, `Expert`, `Agronomist`, `Admin`), phone numbers, and language preferences.
  - `DiseaseDetection`: Stores diagnosis history (`image_url`, `detected_disease`, `crop_name`, `confidence`, `detected_at`).
  - `AgriculturalExpert`: Catalogs accredited KVK scientists, qualifications, official contacts, and specialization areas.
  - `AdvisoryCase`: Models escalation cases created by farmers for human review.
  - *Enhancement required:* `AdvisoryCase` must be augmented to store machine learning provenance (`model_version`, `artifact_hash`, `image_quality_json`), exact review outcomes (6 standard outcomes), expert-corrected taxonomy, consent flags, perceptual dHash, and capture session IDs.

### 2.3 Frontend Application (`frontend-next/`)
- **Next.js 14 App Router:** TypeScript and React with Tailwind CSS.
- **Farmer Interface (`frontend-next/src/app/disease/DiseaseClient.tsx`):**
  - Interactive upload zone with live camera capture and drag-and-drop.
  - Diagnosis card displaying crop name, predicted disease, confidence bar, and IDM guidance.
  - `RequestExpertModal` (`frontend-next/src/components/disease/RequestExpertModal.tsx`): Farmer escalation modal collecting contact preferences, location, and explicit consent.
- **Expert Portal (`frontend-next/src/app/expert-dashboard/ExpertDashboardClient.tsx`):**
  - Queue view of pending and resolved advisory cases.
  - Case inspection card with farmer details, crop name, visible symptoms, and image preview.
  - Review submission interface.
- **API Proxy Layer (`frontend-next/src/app/api/disease/...`):**
  - Next.js server routes proxying frontend calls to the FastAPI backend with offline fallback capabilities (`disease-advisory-store.ts`).

---

## 3. Supervised Field Pilot System Design

```
+---------------------------------------------------------------------------------+
|                                 FARMER CLIENT                                   |
|   1. Uploads crop photograph + selects crop hint                                |
|   2. Receives Preliminary AI Assessment (clearly marked "Unverified AI Screening")|
|   3. Requests KVK Expert Review (grants research consent & location context)    |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                             FASTAPI INFERENCE & API                             |
|   POST /api/disease/predict: Runs guardrails + EfficientNet-B0 + OOD scoring    |
|   POST /api/disease/advisory/cases: Creates pilot observation & stores image    |
|     - Calculates 64-bit dHash for perceptual duplicate prevention               |
|     - Generates cryptographically isolated session_id to prevent leak           |
|     - Stores model provenance (version, SHA-256 artifact hash, temperature)    |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                           DATABASE: ADVISORY CASES                              |
|   Status: "pending" | Consent: True | Image: Secure UUID | Review Outcome: null |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                            EXPERT / KVK DASHBOARD                               |
|   (Restricted to authenticated users with role: 'Expert', 'Agronomist', 'Admin')|
|   GET /api/disease/advisory/cases: Paginated queue of pending field images      |
|   GET /api/disease/images/{uuid}: Secure authenticated image stream             |
|   POST /api/disease/advisory/cases/{id}/review: Submit verified ground truth    |
|     - 6 Discrete Standardized Review Outcomes                                   |
|     - Expert Corrected Crop & Condition (or Healthy plant confirmation)         |
|     - Written Agronomic Note & Treatment Prescription                           |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                        INDEPENDENT DATASET EXPORT PIPELINE                      |
|   `ml/crop_doctor/experiments/export_pilot_dataset.py`                          |
|     - Filters: Verified status ONLY + Consent == True + Non-duplicate dHash     |
|     - Grouped by `session_id` to strictly prevent intra-session split leakage   |
|     - Partitions into:                                                          |
|         * Training Manifest (`pilot_train_manifest.json`)                       |
|         * Locked Independent Evaluation Manifest (`pilot_locked_eval.json`)     |
+---------------------------------------------------------------------------------+
```

---

## 4. Key Architectural Standards & Safety Controls

1. **Strict Decoupling of AI Predictions and Expert Ground Truth:**
   The database records AI predictions (`ai_predicted_disease`, `ai_confidence`, `ai_status`) independently of human expert conclusions (`expert_confirmed_crop`, `expert_confirmed_disease`, `expert_is_healthy`, `review_outcome`). At no point can a machine prediction overwrite human ground truth.
2. **Server-Side Authorization Enforcement:**
   Role verification occurs inside FastAPI using `require_expert_or_admin`. An HTTP 403 Forbidden is returned if an ordinary farmer account attempts to invoke `/review` endpoints.
3. **Session-Isolated Splitting:**
   Capturing multiple photographs of the same leaf or field plant introduces high perceptual correlation. The export pipeline groups by `session_id` so all photos from a single session remain entirely within train or entirely within evaluation splits.
4. **Zero-PII Ground Truth Manifests:**
   Exported dataset manifests contain purely technical metadata (file path, canonical label, image resolution, dHash, split) and contain zero farmer names, phone numbers, or village details.
