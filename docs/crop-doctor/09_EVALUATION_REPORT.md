# 09 — Full Exhaustive Model Evaluation Report
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  
**Evaluation Script:** `ml/crop_doctor/evaluation/evaluate.py`  
**Model Checkpoint:** `ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth`  

---

## 1. Overall Metric Summary

| Evaluation Split | Total Samples | Top-1 Accuracy | Top-3 Accuracy | Balanced Accuracy | Macro-F1 | Weighted-F1 | ECE (Expected Calibration Error) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Internal Test** | 549 | **75.41%** | **89.07%** | **75.83%** | **0.7595** | **0.7561** | **0.0490** |
| **Field Holdout (PlantDoc in-the-wild)** | 124 | **28.23%** | **58.87%** | **29.26%** | **0.2710** | **0.2778** | **0.1086** |
| **Out-Of-Distribution (OOD)** | 300 | N/A (Non-target) | N/A | N/A | N/A | N/A | Mean Conf: 0.3976 |

---

## 2. Per-Class Performance on Internal Test Set (549 Samples)

| Condition ID | Support | Precision | Recall | F1-Score | Status |
|---|:---:|:---:|:---:|:---:|:---:|
| `tomato_early_blight` | 32 | 0.6571 | 0.7188 | 0.6866 | Validated |
| `tomato_late_blight` | 35 | 0.7568 | 0.8000 | 0.7778 | Validated |
| `tomato_leaf_curl` | 31 | 0.8889 | 0.7742 | 0.8276 | Validated |
| `tomato_bacterial_spot` | 35 | 0.7838 | 0.8286 | 0.8056 | Validated |
| `tomato_septoria_leaf_spot` | 38 | 0.8000 | 0.7368 | 0.7671 | Validated |
| `tomato_leaf_mold` | 33 | 0.7143 | 0.7576 | 0.7353 | Validated |
| `tomato_healthy` | 30 | 0.7812 | 0.8333 | 0.8065 | Validated |
| `potato_early_blight` | 35 | 0.6857 | 0.6857 | 0.6857 | Validated |
| `potato_late_blight` | 34 | 0.7353 | 0.7353 | 0.7353 | Validated |
| `potato_healthy` | 15 | 0.8750 | 0.9333 | 0.9032 | Validated |
| `corn_leaf_blight` | 42 | 0.7500 | 0.7143 | 0.7317 | Validated |
| `corn_common_rust` | 35 | 0.8438 | 0.7714 | 0.8060 | Validated |
| `corn_gray_leaf_spot` | 31 | 0.6875 | 0.7097 | 0.6984 | Validated |
| `corn_healthy` | 25 | 0.7600 | 0.7600 | 0.7600 | Validated |
| `bell_pepper_bacterial_spot` | 31 | 0.7500 | 0.7742 | 0.7619 | Validated |
| `bell_pepper_healthy` | 30 | 0.7059 | 0.8000 | 0.7500 | Validated |
| `squash_powdery_mildew` | 37 | 0.8421 | 0.8649 | 0.8533 | Validated |
