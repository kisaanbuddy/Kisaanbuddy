# KISAANBUDDY — DISEASE DATASET & TRAINING STRATEGY

**Date:** September 29, 2026  
**Author:** Senior AI/ML Architect & Computer Vision Engineer  
**Branch:** `feature/disease-detection-production`  
**Phase:** Phase 1 — Dataset Audit & Production ML Strategy

---

## 1. EXISTING DATASET ASSESSMENT

The existing system does not store or maintain a local image training dataset. Disease detection currently relies on third-party vision-language LLMs (Gemini / OpenAI).

* **Strengths:** High zero-shot reasoning ability for well-described symptoms; natural language Hinglish output.
* **Weaknesses:** High inference latency (2–5s), API cost, rate limits, and un-calibrated confidence scores on low-quality or out-of-distribution farmer uploads.

---

## 2. CANDIDATE PUBLIC DATASETS & EVALUATION

To train a fast, reliable, local vision model tailored to Indian agriculture, we investigated 5 public agricultural disease datasets:

| Dataset Name | Source / License | Crops Covered | Target Disease Classes | Characteristics | Suitability for KisaanBuddy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PlantVillage** | Penn State / CC-BY 4.0 | 14 crops (Tomato, Potato, Corn, Pepper, Grape, etc.) | 38 classes | Studio leaf images on solid black/grey background. Clean labels. | **HIGH** for base feature extraction on Tomato, Potato, Pepper. |
| **PlantDoc** | IIT Delhi / Open Access | 13 crops | 27 classes | In-field leaf images taken under real outdoor Indian farm conditions. | **HIGH** — Provides real-world background noise and natural lighting. |
| **Rice Leaf Diseases** | UCI / Kaggle / Open Access | Rice / Paddy | 4 classes (Blast, Bacterial Blight, Brown Spot, Healthy) | Field photographs of Indian rice leaves. | **HIGH** — Direct match for core Indian Paddy taxonomy. |
| **Wheat Rust / Disease Set**| CGIAR / Open Access | Wheat | 4 classes (Yellow Rust, Brown Rust, Loose Smut, Healthy) | Outdoor field images of wheat leaves and spikes. | **HIGH** — Direct match for core Wheat taxonomy. |
| **Cotton Disease Dataset** | Roboflow / CC-BY 4.0 | Cotton | 4 classes (Bacterial Blight, Leaf Curl Virus, Target Spot, Healthy) | Field images of Indian cotton crops. | **HIGH** — Direct match for Cotton taxonomy. |

---

## 3. CLASS MAPPING & TAXONOMY ALIGNMENT

We align candidate dataset classes with KisaanBuddy's priority crop-disease taxonomy:

| KisaanBuddy Target Class | Source Dataset Label | Dataset Compatibility | Integration Action |
| :--- | :--- | :--- | :--- |
| `rice_blast` | `Rice_Blast` (Rice Dataset) | `YES` | Import from Rice Leaf Disease dataset |
| `rice_bacterial_blight` | `Bacterial_leaf_blight` (Rice Dataset) | `YES` | Import from Rice Leaf Disease dataset |
| `rice_brown_spot` | `Brown_spot` (Rice Dataset) | `YES` | Import from Rice Leaf Disease dataset |
| `wheat_yellow_rust` | `Yellow_rust` (Wheat Dataset) | `YES` | Import from CGIAR Wheat dataset |
| `wheat_brown_rust` | `Brown_rust` (Wheat Dataset) | `YES` | Import from CGIAR Wheat dataset |
| `tomato_late_blight` | `Tomato___Late_blight` (PlantVillage) / `Tomato Late blight` (PlantDoc) | `YES` | Merge PlantVillage studio + PlantDoc in-field |
| `tomato_early_blight` | `Tomato___Early_blight` (PlantVillage) / `Tomato Early blight` (PlantDoc) | `YES` | Merge PlantVillage studio + PlantDoc in-field |
| `potato_late_blight` | `Potato___Late_blight` (PlantVillage) / `Potato Late blight` (PlantDoc) | `YES` | Merge PlantVillage studio + PlantDoc in-field |
| `potato_early_blight` | `Potato___Early_blight` (PlantVillage) / `Potato Early blight` (PlantDoc) | `YES` | Merge PlantVillage studio + PlantDoc in-field |
| `cotton_leaf_curl` | `Cotton_leaf_curl` (Cotton Dataset) | `YES` | Import from Cotton Disease dataset |
| `cotton_bacterial_blight`| `Bacterial_blight` (Cotton Dataset) | `YES` | Import from Cotton Disease dataset |

---

## 4. RECOMMENDED DATASET COMBINATION STRATEGY

We recommend **Option C + E (Multi-Dataset Synthesis + Isolated Real-World Evaluation Set)**:

```text
  +-----------------------+     +-----------------------+     +-----------------------+
  |  PlantVillage (Studio)|     |  PlantDoc (In-Field)  |     | Specialized Datasets  |
  |  Clean Leaf Baselines |     |  Outdoor Backgrounds  |     | (Rice, Wheat, Cotton) |
  +-----------+-----------+     +-----------+-----------+     +-----------+-----------+
              |                             |                             |
              +----------------------+------+-----------------------------+
                                     |
                                     v
                        +-------------------------+
                        | Unified Training Set    | (80% Train / 20% Val)
                        | ~25,000 Curated Images  |
                        +-------------------------+
```

---

## 5. REAL-WORLD EVALUATION TEST SET (`real_world_test`)

To ensure the model performs accurately on realistic farmer-uploaded photos, we establish an isolated test dataset: `real_world_test`.

### 5.1 Dataset Characteristics
* **Target Size:** 1,500 images (100 images per target class).
* **Isolation Guarantee:** 0 images from `real_world_test` will ever be used during training, validation, or hyperparameter optimization.
* **Environmental Noise Metrics:**
  - 30% direct sunlight / harsh glare
  - 30% shadowed / low-light conditions
  - 20% blurry or low-resolution mobile camera optics
  - 20% complex background clutter (soil, irrigation pipes, hand holding leaf)

---

## 6. PRODUCTION ML REQUIREMENTS & UNCERTAINTY POLICY

### 6.1 Architecture & Edge Performance
* **Target Backbone:** MobileNetV4-Small or EfficientNetV2-S.
* **Target Latency:** < 50 ms per image on 1-CPU container (Render/Linux).
* **Export Format:** ONNX Runtime / PyTorch TorchScript.

### 6.2 Uncertainty & Out-of-Distribution (OOD) Policy
The production classifier must reject non-leaf images and low-confidence predictions:

```text
                     +----------------------------+
                     |  Input Image Upload        |
                     +--------------+-------------+
                                    |
                                    v
                     +----------------------------+
                     | Vision Model Classification|
                     +--------------+-------------+
                                    |
                     +--------------+-------------+
                     |  Softmax Confidence Score  |
                     +--------------+-------------+
                                    |
         +--------------------------+--------------------------+
         | (>= 0.85)                | (0.50 - 0.84)            | (< 0.50 or OOD)
         v                          v                          v
+------------------+       +------------------+       +------------------+
| High Confidence  |       | Medium Confidence|       | Low Confidence / |
| Direct Diagnosis |       | + Differentials  |       | OOD Rejection    |
| + Remedies       |       | & LLM Second-Op  |       | "Upload clearer  |
+------------------+       +------------------+       |  leaf photo"     |
                                                      +------------------+
```

---

## 7. RECOMMENDED NEXT IMPLEMENTATION PHASES (PHASE 2+)

* **Phase 2: Dataset Curation & Pipeline Scripting**
  - Download and merge PlantVillage, PlantDoc, Rice, Wheat, Cotton subsets.
  - Script preprocessing & augmentation pipeline (`albumentations`).
  - Create isolated `real_world_test` directory structure.
* **Phase 3: Model Training & Calibration**
  - Train MobileNetV4 / EfficientNetV2 using PyTorch.
  - Perform temperature scaling for confidence calibration.
  - Export ONNX checkpoint.
* **Phase 4: Fast Local API Integration**
  - Build local ONNX inference service in `backend/services/disease_classifier.py`.
  - Integrate hybrid fallback: Local ONNX (fast prediction) → LLM (detailed Hinglish remedies).

---
*Disease Dataset Strategy Complete.*
