# KisaanBuddy Crop Disease Detection Engine — Final Project & Demo Report

## Executive Summary & Presentation Overview
This report synthesizes the complete evolution, empirical benchmarks, failure diagnostics, loss optimization experiments, and production API integration of the KisaanBuddy AI Crop Disease Detection System.

---

## 1. Problem Statement
Smallholder Indian farmers lose up to 35% of crop yields annually to plant diseases. Timely and accurate identification of leaf pathogens (bacterial blights, rusts, curls, and spots) directly impacts pesticide costs, crop yield, and farm profitability. Existing solutions fail on field-captured photographs due to lighting variation, background noise, and severe cross-disease visual similarity.

---

## 2. Original Baseline & Dataset Evolution
- **Original Baseline**: Initial proof-of-concept dataset consisted of only 825 images across 5 classes with ~32% accuracy on field images.
- **Dataset Expansion**: Scaled dataset from **825 to 6,075 total images** across 15 agricultural disease & healthy classes.
- **Dataset Split Breakdown**:
  - **Train**: 3,570 images
  - **Validation**: 765 images
  - **Test**: 765 images
  - **Real-World Holdout (`real_world_test`)**: 975 images (Frozen out-of-distribution benchmark)

---

## 3. 15-Class Agricultural Disease Taxonomy
1. `cotton_bacterial_blight`
2. `cotton_leaf_curl`
3. `healthy_general`
4. `potato_early_blight`
5. `potato_healthy`
6. `potato_late_blight`
7. `rice_bacterial_blight`
8. `rice_blast`
9. `rice_brown_spot`
10. `tomato_early_blight`
11. `tomato_healthy`
12. `tomato_late_blight`
13. `tomato_leaf_curl`
14. `wheat_brown_rust`
15. `wheat_yellow_rust`

---

## 4. Models Evaluated & Phase 3A Baseline
Two lightweight deep convolutional neural network architectures were evaluated:
- **MobileNetV3-Small**: Ultra-fast edge model (~9.8 MB)
- **EfficientNetV2-S**: High-capacity vision backbone (~85.2 MB)

### Phase 3A Cross-Entropy Baseline Performance
- **MobileNetV3-Small**: Test Accuracy: **47.06%**, Macro F1: **44.75%**, Real-World Macro F1: **41.34%**
- **EfficientNetV2-S**: Test Accuracy: **48.89%**, Macro F1: **45.87%**, Real-World Macro F1: **42.27%**

---

## 5. Phase 3B Error Diagnostics & Dataset Audit
A comprehensive read-only audit of the 6,075-image dataset confirmed:
- **Exact Duplicate Multiplicity (MD5)**: 0 cross-split duplicates.
- **Perceptual Hash (pHash $\le 2$) Audit**: 224 candidate pairs audited; 0 confirmed image duplicates found (222 visually distinct field photos, 2 uncertain). The `real_world_test` split remains 100% clean and un-contaminated.
- **Primary Failure Modes Identified**:
  1. `cotton_leaf_curl` $\leftrightarrow$ `tomato_leaf_curl` (52/50 errors; MobileNet recall 20.0%)
  2. `wheat_brown_rust` $\leftrightarrow$ `wheat_yellow_rust` (Major bidirectional confusion)
  3. `potato_early_blight` $\leftrightarrow$ `tomato_early_blight`
  4. High-confidence false predictions on ambiguous leaf images.

---

## 6. Phase 4A Dataset Repair Integrity Audit
Feasibility audit for dataset repair confirmed dataset state remains at 6,075 images (0 images added/removed), preserving exact reproducibility and integrity.

---

## 7. Phase 4B Focal Loss Retraining Experiment & Results
To directly suppress overconfident misclassifications on hard samples, **Multi-class Focal Loss ($\gamma = 2.0$)** was evaluated against the Phase 3A Cross-Entropy baseline with temperature-scaled calibration.

### Key Results Summary

| Metric / Benchmark | Baseline (Phase 3A CE) | Retrained (Phase 4B Focal Loss) | Key Empirical Gain |
| :--- | :--- | :--- | :--- |
| **EfficientNetV2-S Test Accuracy** | $48.89\%$ | **$51.37\%$** | **+2.48% Improvement** |
| **EfficientNetV2-S Test Macro F1** | $45.87\%$ | **$47.45\%$** | **+1.58% Improvement** |
| **EfficientNet High-Confidence Wrongs ($\ge 0.60$)** | $66$ | **$26$** | **$-60.6\%$ Error Suppression** |
| **MobileNetV3-Small Test Accuracy** | $47.06\%$ | **$48.37\%$** | **+1.31% Improvement** |
| **MobileNet High-Confidence Wrongs ($\ge 0.60$)** | $138$ | **$99$** | **$-28.3\%$ Error Suppression** |

---

## 8. Remaining Limitations
- **Visual Disambiguation Bottleneck**: While Focal Loss suppressed overconfidence, loss re-weighting alone cannot manufacture missing visual features (such as host leaf morphology and edge contours).
- **Physical Data Expansion Required**: Distinguishing fine-grained leaf curls and rusts requires physical dataset expansion per `phase3b_dataset_repair_spec.md`.

---

## 9. Final Selected Model & Production API Status
- **Selected Primary Model**: **EfficientNetV2-S (Focal Loss $\gamma=2.0$, $T=0.75$)**
- **Inference Wrapper**: [`ml/platform/pipelines/inference_engine.py`](file:///c:/Users/HP/Kisaanbuddy/ml/platform/pipelines/inference_engine.py)
- **FastAPI Endpoint**: Mounted at `POST /api/disease/predict` in [`backend/api/disease.py`](file:///c:/Users/HP/Kisaanbuddy/backend/api/disease.py)
- **Verification Status**: Passed 100% automated end-to-end verification (`demo_e2e_verification.py`).

### Standard Output Schema
```json
{
  "predicted_class": "cotton_leaf_curl",
  "confidence": 0.5803,
  "top_predictions": [
    {"class": "cotton_leaf_curl", "confidence": 0.5803},
    {"class": "tomato_leaf_curl", "confidence": 0.4194},
    {"class": "rice_brown_spot", "confidence": 0.0}
  ],
  "model": "EfficientNetV2-S (Focal Loss gamma=2.0, T=0.75)",
  "status": "ok",
  "note": "High-confidence prediction."
}
```

---

## 10. Future Work Roadmap
1. Physical field ingestion of host-leaf contextual images per Phase 3B repair spec.
2. ONNX model export for browser-native client-side inference.
3. Multi-crop host pre-classifier to prevent cross-crop leaf curl confusion.
