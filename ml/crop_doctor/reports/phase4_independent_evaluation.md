# Phase 4 Independent Evaluation Report: Field Generalization & Reliability

**Project:** KisaanBuddy Crop Doctor AI Rebuild  
**Branch:** `feature/crop-doctor-ml-rebuild`  
**Evaluation Date:** 2026-11-07  
**Evaluation Script:** `ml/crop_doctor/experiments/run_full_evaluation.py`  
**Artifact Hash Summary:** `ml/crop_doctor/artifacts/evaluations/evaluation_summary.json`  

---

## 1. Independent Evaluation Methodology

To guarantee evaluation integrity and protect against data leakage or metric fabrication:
1. **Separation of Concerns:** No model weights, hyperparameters, or confidence thresholds were tuned on the `internal_test` (549 samples), `field_holdout` (124 samples), or `ood_test` (300 samples) splits.
2. **Deterministic Evaluation Pipeline:** All evaluations were performed using `CropDoctorDataset` with `get_eval_transforms(224)` (deterministic resize, tensor conversion, and ImageNet standardization; no random flipping or distortion).
3. **Perceptual Leakage Purge:** Verified that perceptual hash duplicates identified in the Phase 1 audit were eliminated in training splits `v2` prior to evaluation.

---

## 2. Comprehensive Multi-Dataset Benchmark

Below is the verified, empirical comparison across all evaluated model candidates:

### 2.1 Internal Test Suite (549 Samples — Laboratory & Studio Conditions)

| Candidate Model | Top-1 Accuracy | Top-3 Accuracy | Macro-F1 | ECE Calibration Error | Selective Acc (@ Conf >= 0.60) | Rejection Rate (@ Conf >= 0.60) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline (Scratch 10 ep)** | 75.41% | 89.07% | 0.7595 | 0.0631 | 94.77% | 37.34% |
| **Exp A1 (Scratch 25 ep)** | 79.05% | 90.16% | 0.8023 | 0.0677 | **96.26%** | 26.96% |
| **Exp C1 (Pretrained 15 ep)** | **86.89%** | **94.17%** | **0.8773** | **0.0426** | 92.53% | **9.84%** |

### 2.2 Field Holdout Suite (124 Samples — Real Farmer Photography)

| Candidate Model | Top-1 Accuracy | Top-3 Accuracy | Macro-F1 | ECE Calibration Error | Selective Acc (@ Conf >= 0.60) | Rejection Rate (@ Conf >= 0.60) | Accepted / Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline (Scratch 10 ep)** | 28.23% | 58.87% | 0.2710 | 0.0931 | 92.31% | 89.52% | 13 / 124 |
| **Exp A1 (Scratch 25 ep)** | 35.48% | 54.84% | 0.3249 | 0.1094 | 65.62% | 74.19% | 32 / 124 |
| **Exp C1 (Pretrained 15 ep)** | **60.48%** | **87.10%** | **0.5974** | 0.1486 | **69.51%** | **33.87%** | **82 / 124** |

### 2.3 Out-of-Distribution (OOD) Suite (300 Samples — Non-Target Plants & Anomalies)

| Candidate Model | Mean Confidence on OOD | OOD Rejection Rate (@ Conf >= 0.60) | False Positive Rate |
| :--- | :--- | :--- | :--- |
| **Baseline (Scratch 10 ep)** | **0.3797** | **82.33%** | 17.67% |
| **Exp A1 (Scratch 25 ep)** | 0.4547 | 76.00% | 24.00% |
| **Exp C1 (Pretrained 15 ep)** | 0.5528 | 61.00% | 39.00% |

---

## 3. Key Findings & Diagnostic Insights

### 3.1 Breakthrough in Field Holdout Generalization
- The baseline model suffered severely on field holdout photos (28.23% Top-1 accuracy), largely because laboratory models trained from scratch overfit to clean, solid backgrounds and artificial lighting.
- Training from scratch for 25 epochs (Exp A1) improved field accuracy slightly from 28.23% to 35.48%.
- **Pretrained MobileNetV3-Small (Exp C1) achieved a dramatic leap to 60.48% Top-1 accuracy (+32.25 percentage points) and 87.10% Top-3 accuracy (+28.23 percentage points)!**
- More importantly, at confidence >= 0.60, Exp C1 diagnoses **82 of the 124 real farmer images** with 69.51% selective accuracy, compared to the baseline which accepted only 13 images.

### 3.2 OOD Sensitivity Trade-off
- While Exp C1 exhibits dramatically superior recognition on real field foliage, pretrained networks naturally exhibit higher baseline confidence on unfamiliar leaves (OOD mean confidence 0.5528 vs baseline 0.3797).
- This finding demonstrates why **Phase 5's multi-layered reliability architecture** (Free Energy scoring, vegetation masking, and Laplacian blur checking) is strictly necessary to prevent high-confidence misclassifications on OOD inputs.

---

## 4. Phase 4 Verification Verdict

- **Status:** **Complete and verified**.
- Independent evaluations executed deterministically on all three test suites.
- Checkpoints evaluated: Baseline, Exp A1, Exp C1. Full JSON metrics recorded in `ml/crop_doctor/artifacts/evaluations/`.
