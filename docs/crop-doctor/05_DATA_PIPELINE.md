# 05 — Data Pipeline, Quality Curation & Manifest Specification
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  
**Pipeline Script:** `ml/crop_doctor/data_pipeline/build_dataset_splits.py`  

---

## 1. Overview and Ingestion Integrity

The data pipeline ingested 5,989 clean, verified photographic records from two distinct, legally cleared sources:
1. **PlantDoc (CC BY 4.0):** 100% in-the-wild agricultural field photographs with realistic backgrounds, shadows, dirt, and varied lighting.
2. **PlantVillage (CC0 1.0):** Clean, controlled laboratory photographic support samples.

**Zero Synthetic Data Policy:**
All legacy procedural PIL generation scripts (`download_and_curate.py`, `download_and_curate_phase3a.py`) were excluded. No simulated or procedurally painted lesions exist in any manifest.

---

## 2. Image Integrity, Curation & Deduplication

Every single sample underwent automated computer-vision quality checks:
- **Corrupt Image Rejection:** Decompression integrity verified via PIL `ImageOps.exif_transpose` and decode test.
- **Deduplication:** Full SHA-256 hash computed on raw file bytes; 11 exact duplicates were quarantined.
- **Perceptual Hashing:** 64-bit dHash (difference hash) computed to track perceptual near-duplicates and ensure identical visual content does not leak across splits.
- **Quality Metrics:**
  - Blur score: Laplacian variance computed via 2D spatial convolution (`scipy.signal.convolve2d`). Extreme blur (`blur < 15.0`) flagged.
  - Exposure metrics: Gray-scale intensity mean and standard deviation. Overexposure (`> 240.0`) and underexposure (`< 15.0`) flagged.
  - Resolution: Minimum resolution check (`>= 64x64`).

---

## 3. Split Stratification and Isolation

The manifests are strictly partitioned to prevent data leakage:
- **`train` (4,190 samples):** In-distribution field and controlled authentic training originals.
- **`val` (826 samples):** Stratified validation partition used strictly for early stopping, learning-rate decay, and temperature calibration.
- **`internal_test` (549 samples):** Stratified internal holdout partition not touched during model training.
- **`field_holdout` (124 samples):** Unseen, independent test partition from PlantDoc's official field dataset (`test/`), representing true farmer-field conditions.
- **`ood_test` (300 samples):** Out-of-distribution real agricultural photographs of non-target crop foliage (Blueberry, Cherry, Peach, Apple rust, Grape, Soybean) and field clutter.
- **`quarantine` (11 samples):** Corrupted or duplicate items isolated in `quarantine_manifest.json`.

---

## 4. Manifest Hashes (SHA-256)

- `train_manifest.json`: `d5ae1d3951a29ad8ac35c59f352fea7d4c7fa6c74077bf05cb0afe6422afe8f5`
- `val_manifest.json`: `f3b6a21221185d1ad6eeae334377f9eb4655a12be28a7fa337d7089fb29441b5`
- `internal_test_manifest.json`: `942c461da734a474d77744337ddb9abb77162cd0784c8fc69cb15fe9f217291f`
- `field_holdout_manifest.json`: `b0512593c30a1180a7db2a717fb4e1144c3a3e2d7b245edc5639339df62aefec`
- `ood_test_manifest.json`: `172e63626b1625b1f5a73f47fab2b560b0d5a9047c41921c66be93c7d605d475`
