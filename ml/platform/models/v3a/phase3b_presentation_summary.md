# Phase 3B — Presentation Summary

### Dataset
- **6,075 Total Images** across 15 agricultural crop disease classes (`train`: 3,570 | `val`: 765 | `test`: 765 | `real_world_test`: 975).
- **100% Frozen Holdout**: `real_world_test` remains completely untouched.

### What We Found
- **0 Exact MD5 Duplicates**: No byte-level duplicate files exist anywhere in the dataset.
- **0 Confirmed Leakage Copies**: 224 candidate pHash pairs ($\le 2$) between `train` and `real_world_test` were verified via MSE/PSNR/SSIM. All 224 are visually distinct photographs. `real_world_test` is **clean and valid**.
- **Real-World Performance Gap**: Accuracy on field photos is **47.28%** (MobileNetV3-Small) and **45.74%** (EfficientNetV2-S).

### Main Failure Modes
1. **Cotton vs Tomato Leaf Curl** (124 errors): 102 cotton leaf curl images misclassified as tomato leaf curl due to shared leaf-curling symptoms.
2. **Wheat Brown vs Yellow Rust** (124 errors): High bidirectional confusion and highest high-confidence error rate (24 MobileNet, 16 EfficientNet).
3. **Cross-Crop Blights** (205 errors): Solanaceae early & late blights confused across potato and tomato.
4. **Bacterial Blight** (116 errors): Cotton vs rice bacterial leaf streak confusion.

### What We Changed
- **Read-Only Audit & Diagnosis**: Built automated MD5 hash audit, 64-bit DCT pHash verification, and per-sample error extraction pipelines.
- **Created Targeted Repair Spec**: Formulated [phase3b_dataset_repair_spec.md](file:///c:/Users/HP/Kisaanbuddy/ml/platform/models/v3a/phase3b_dataset_repair_spec.md) focusing data acquisition on leaf architecture context and pustule detail.
- **Zero Retraining / Zero Dataset Mutations**: Models, weights, taxonomy, and production code remained 100% frozen.

### What We Will Do Next
1. **Execute Targeted Dataset Repair** following the Phase 3B specification.
2. **Re-Audit Dataset** for MD5/pHash de-duplication.
3. **Retrain Models (Phase 4)** & benchmark against Phase 3A baseline.
4. **Calibrate & Evaluate OOD Rejection** for production readiness.
