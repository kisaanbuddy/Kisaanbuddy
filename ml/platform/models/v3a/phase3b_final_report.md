# Phase 3B — Disease Detection Error Analysis

## 1. Objective

Phase 3B performed a read-only dataset integrity audit and per-sample error analysis for the KisaanBuddy crop disease detection platform. 

Following the frozen baseline established in Phase 3A (Commit `e07c94c`), Phase 3B audited all 6,075 dataset images for duplicate leakage and evaluated MobileNetV3-Small and EfficientNetV2-S models across all 975 samples of the isolated `real_world_test` holdout split without retraining or altering model weights.

---

## 2. Dataset Integrity

- **Total Dataset Size**: 6,075 images across 15 agricultural disease classes.
- **Split Distribution**:
  - `train`: 3,570 images (58.8%)
  - `val`: 765 images (12.6%)
  - `test`: 765 images (12.6%)
  - `real_world_test`: 975 images (16.0%) — *Frozen isolated holdout*
- **Exact MD5 Duplicate Audit**: **0 exact byte duplicates** found across within-split and all 6 cross-split pair combinations.
- **pHash Near-Duplicate Audit**: 64-bit DCT-based perceptual hashing ($\le 2$ Hamming distance) initially surfaced 224 candidate pairs between `train` and `real_world_test`.
- **pHash Pair Verification Pass**: Fine-grained visual metrics (MSE, PSNR, SSIM, and Color Histogram Cosine Similarity) confirmed:
  - **Category A (Obvious duplicates)**: 0
  - **Category B (Transformed copies)**: 0
  - **Category C (Visually distinct photos)**: 222
  - **Category D (Uncertain)**: 2
- **Integrity Conclusion**: `real_world_test` is **NOT CONTAMINATED**. The 224 pHash pairs represent shared background soil and leaf color palettes across distinct photographs. The holdout set remains valid, clean, and frozen.

---

## 3. Model Error Analysis

Inference was conducted on CPU using Phase 3A temperature-scaled checkpoints (MobileNetV3-Small: $T=1.25$, EfficientNetV2-S: $T=1.10$).

### Performance Overview on `real_world_test` (975 samples)

| Metric | MobileNetV3-Small | EfficientNetV2-S |
| :--- | :---: | :---: |
| **Accuracy** | 47.28% | 45.74% |
| **Macro Precision** | 0.4612 | 0.4397 |
| **Macro Recall** | 0.4728 | 0.4574 |
| **Macro F1-Score** | 0.4502 | 0.4365 |
| **High-Confidence Wrong ($\ge 0.60$)** | 138 samples (14.2%) | 66 samples (6.8%) |
| **Low-Confidence Correct ($< 0.35$)** | 39 samples (4.0%) | 64 samples (6.6%) |

### 5 Major Failure Families

1. **`cotton_leaf_curl` $\leftrightarrow$ `tomato_leaf_curl`** (124 total confusion instances)
   - Severe one-way collapse: 102 total cotton $\rightarrow$ tomato misclassifications.
   - Cotton Leaf Curl Recall: 20.0% (MobileNet) / 23.1% (EfficientNet).
2. **`wheat_brown_rust` $\leftrightarrow$ `wheat_yellow_rust`** (124 total confusion instances)
   - Highest rate of high-confidence wrong predictions (24 MobileNet, 16 EfficientNet).
   - Brown Rust Recall: 27.7% (MobileNet) / 41.5% (EfficientNet).
3. **`cotton_bacterial_blight` $\leftrightarrow$ `rice_bacterial_blight`** (116 total confusion instances)
   - Rice Bacterial Blight Recall dropped to 20.0% on EfficientNetV2-S.
4. **`potato_late_blight` $\leftrightarrow$ `tomato_late_blight`** (115 total confusion instances)
   - Potato Late Blight Recall: 49.2% (MobileNet) / 21.5% (EfficientNet).
5. **`potato_early_blight` $\leftrightarrow$ `tomato_early_blight`** (95 total confusion instances)
   - Potato Early Blight Recall: 26.2% (MobileNet) / 32.3% (EfficientNet).

---

## 4. Key Findings

1. **Zero Data Leakage**: The dataset is free of exact byte duplicates and actual cross-split photo copies; test set integrity is preserved.
2. **Morphological Confusion Dominates Errors**: Models over-index on generic symptom textures (e.g. leaf curling, leaf spotting) while ignoring host plant leaf architecture.
3. **High-Confidence Overconfidence**: MobileNetV3-Small produces 138 high-confidence ($\ge 60\%$) wrong predictions on real-world field photos, highlighting temperature scaling limits on out-of-domain textures.
4. **Asymmetric Class Collapse**: Classes like `cotton_leaf_curl` collapse into visually dominant classes like `tomato_leaf_curl` due to unbalanced leaf context in training crops.

---

## 5. Dataset Repair Strategy

Rather than adding unstructured bulk images, Phase 3B defines a **Targeted Dataset Repair Specification** focused on:
- Acquiring macro photos that include **both leaf morphology/structure and lesion patterns**.
- Enhancing pustule detail for wheat rusts (linear stripe vs scattered circular spots).
- Enforcing strict MD5 and pHash $\le 2$ de-duplication prior to ingestion.
- Maintaining the frozen `real_world_test` benchmark untouched.

---

## 6. Current Limitations

- Current models (MobileNetV3-Small and EfficientNetV2-S) are **not production-ready** for autonomous field diagnosis (real-world accuracy remains $\sim 45.7\% - 47.3\%$).
- Real-world field performance is constrained by symptom-morphology confusion and background soil noise.
- All evidence presented is derived from read-only audit of existing Phase 3A checkpoints and datasets.
- **No model retraining or dataset modification has been performed in Phase 3B.**

---

## 7. Next Phase Roadmap

```
Targeted Dataset Repair (Phase 3B Spec)
   │
   ▼
Dataset Re-Audit (MD5 & pHash Verification)
   │
   ▼
Model Retraining (Phase 4 Execution)
   │
   ▼
Benchmark against Phase 3A Frozen Baseline
   │
   ▼
Calibration & OOD Reliability Validation
   │
   ▼
Final Model Candidate Selection
```
