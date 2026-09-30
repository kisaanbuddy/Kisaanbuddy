# Phase 4A — Targeted Dataset Repair Report

## 1. Baseline

The baseline dataset state for Phase 4A is frozen from Phase 3B (Commit `b6b1f31`):
- **Total Images**: 6,075 across 15 crop disease classes.
- **Splits**: `train` (3,570), `val` (765), `test` (765), `real_world_test` (975).
- **Exact MD5 Duplicates**: 0.
- **Confirmed Data Leakage**: 0 (all 224 pHash $\le 2$ pairs verified as visually distinct photographs).
- **Holdout Status**: `real_world_test` is 100% frozen, read-only, and valid.

---

## 2. Repair Targets

Following [phase3b_dataset_repair_spec.md](file:///c:/Users/HP/Kisaanbuddy/ml/platform/models/v3a/phase3b_dataset_repair_spec.md), Phase 4A targets 5 key empirical failure families:
1. **`cotton_leaf_curl` $\leftrightarrow$ `tomato_leaf_curl`**: Address 102 cotton $\rightarrow$ tomato misclassifications and asymmetric recall collapse (cotton recall $\sim 20\%$).
2. **`wheat_brown_rust` $\leftrightarrow$ `wheat_yellow_rust`**: Address 124 bidirectional errors and high-confidence wrong predictions (24 MobileNet, 16 EfficientNet).
3. **`potato_early_blight` $\leftrightarrow$ `tomato_early_blight` & `potato_late_blight` $\leftrightarrow$ `tomato_late_blight`**: Address 205 cross-crop Solanaceae blight errors.
4. **`cotton_bacterial_blight` $\leftrightarrow$ `rice_bacterial_blight`**: Address 116 cross-crop bacterial streak errors.
5. **`healthy_general`, `potato_healthy`, `tomato_healthy`**: Address soil/background shadow confusion (healthy recall $\sim 18\% - 29\%$).

---

## 3. Changes Made

- **Local Data Storage Inspection**: Inspected `ml/platform/datasets/` (`processed/`, `raw/`, `quarantine/`, `metadata/`). All 6,075 locally stored images are fully allocated across existing splits (`train`: 3,570, `val`: 765, `test`: 765, `real_world_test`: 975). No unallocated local images exist.
- **Strict Adherence to Safety Rules**: Per Phase 4A constraints ("If new images are required but no verified source/data is available locally, DO NOT fabricate them... Do not download random internet images simply to increase the count"):
  - **0 synthetic or unverified web images were fabricated or added.**
  - **0 images were deleted or modified.**
  - **`real_world_test` remained 100% byte-for-byte unchanged.**
- **Pipeline & Audit Execution**: Re-executed dataset audit to verify complete dataset consistency and zero data corruption.

---

## 4. Dataset Before vs After

| Split | Before (Phase 3B) | After (Phase 4A) | Net Change |
| :--- | :---: | :---: | :---: |
| **`train`** | 3,570 | 3,570 | 0 |
| **`val`** | 765 | 765 | 0 |
| **`test`** | 765 | 765 | 0 |
| **`real_world_test`** | 975 | 975 | 0 |
| **Total** | **6,075** | **6,075** | **0** |

Per-class balance across all 15 classes remains identical:
- `train`: ~227 – 247 images per class
- `val`: ~43 – 60 images per class
- `test`: ~40 – 61 images per class
- `real_world_test`: Exactly 65 images per class across all 15 classes

---

## 5. Integrity Validation

Re-audit results verified:
- **Total Decoded Images**: 6,075.
- **Exact MD5 Duplicates**: **0** within-split and **0** cross-split across all 6 split pairs.
- **pHash Near-Duplicates ($\le 2$)**: 224 candidate pairs verified as visually distinct photographs (0 confirmed duplicates/transformed copies).
- **Cross-Split Leakage**: 0 exact byte leakage, 0 photo copy leakage.
- **`real_world_test` Preservation**: **100% frozen, read-only, and untouched.**

---

## 6. Limitations

- **Physical Image Acquisition**: Additional field-collected photographs matching the exact leaf morphology specifications in `phase3b_dataset_repair_spec.md` require out-of-band agricultural field collection and expert labeling. Unverified web scraping or synthetic augmentation was explicitly prohibited to prevent dataset corruption.
- **Phase 4B Mitigation**: Phase 4B model retraining must utilize targeted loss re-weighting (Focal Loss / Class-Weighted Cross Entropy) and crop-aware data augmentation to address leaf curl and rust confusion using the verified 6,075 dataset images.

---

## 7. Phase 4B Recommendations

For Phase 4B Controlled Retraining & Benchmarking:
1. **Model Architectures**: MobileNetV3-Small & EfficientNetV2-S.
2. **Loss Function**: Class-weighted Cross-Entropy Loss to penalize `cotton_leaf_curl` $\rightarrow$ `tomato_leaf_curl` and `wheat_brown_rust` $\rightarrow$ `wheat_yellow_rust` errors.
3. **Data Augmentations**: Aspect-preserving scaling and subtle contrast/color jitter to emphasize leaf structure over background dirt.
4. **Evaluation**: Benchmark retrained models against Phase 3A baseline (`e07c94c`) on the frozen 975-sample `real_world_test` set.
