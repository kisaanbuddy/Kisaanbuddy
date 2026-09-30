# Phase 3B — Targeted Dataset Repair Specification

## 1. Executive Overview

This document defines the actionable specification for repairing dataset vulnerabilities identified during Phase 3B Error Analysis & Dataset Audit.

Rather than indiscriminately adding thousands of random images, this repair specification targets the **5 key empirical failure families** and **6 weakest classes** identified in the Phase 3A model evaluation on the frozen 975-sample `real_world_test` set.

---

## 2. Target Classes & Required Visual Diversity

### A. Priority 1 — Leaf Curl Morphology (`cotton_leaf_curl` vs `tomato_leaf_curl`)
- **Observed Deficit**: MobileNetV3-Small and EfficientNetV2-S misclassified over 75% of `cotton_leaf_curl` images as `tomato_leaf_curl` (cotton recall: 20.0% / 23.1%).
- **Target Classes**: `cotton_leaf_curl`, `tomato_leaf_curl`.
- **Required Visual Diversity**:
  - Full-leaf macro images showing distinctive **cotton leaf shape (palmate / lobed)** vs **tomato leaf shape (pinnate / serrated)** along with leaf-curling symptoms.
  - Multi-angle perspectives capturing vein thickening and enation on lower leaf surfaces.
- **Priority**: **CRITICAL**

### B. Priority 1 — Wheat Rust Pustule Structure (`wheat_brown_rust` vs `wheat_yellow_rust`)
- **Observed Deficit**: 124 total confusion instances and the highest rate of high-confidence wrong predictions (24 in MobileNet, 16 in EfficientNet).
- **Target Classes**: `wheat_brown_rust`, `wheat_yellow_rust`.
- **Required Visual Diversity**:
  - High-resolution close-ups distinguishing **circular/scattered orange-brown pustules** (brown rust) from **linear/striped yellow pustule rows** along leaf veins (yellow rust).
  - Varying disease severity stages (early pustule eruption to late necrosis).
- **Priority**: **CRITICAL**

### C. Priority 2 — Solanaceae Blights (`potato_early_blight` / `tomato_early_blight` & `potato_late_blight` / `tomato_late_blight`)
- **Observed Deficit**: 210 total cross-crop blight confusion instances across early and late blights.
- **Target Classes**: `potato_early_blight`, `tomato_early_blight`, `potato_late_blight`, `tomato_late_blight`.
- **Required Visual Diversity**:
  - Images showing concentric target-ring lesions (*Alternaria solani*) alongside clear compound potato foliage vs pinnate tomato foliage.
  - Water-soaked dark lesions with white mold margins (*Phytophthora infestans*) with visible stem and leaf architecture.
- **Priority**: **HIGH**

### D. Priority 2 — Bacterial Blight Distinction (`cotton_bacterial_blight` vs `rice_bacterial_blight`)
- **Observed Deficit**: 116 total confusion instances; rice bacterial blight recall dropped to 20.0% on EfficientNetV2-S.
- **Target Classes**: `cotton_bacterial_blight`, `rice_bacterial_blight`.
- **Required Visual Diversity**:
  - Distinctive **angular water-soaked lesions bounded by leaf veins** on broad cotton leaves vs **longitudinal water-soaked streaks along narrow grass-like blade margins** on rice leaves.
- **Priority**: **HIGH**

### E. Priority 3 — Healthy Baseline Control (`healthy_general`, `potato_healthy`, `tomato_healthy`)
- **Observed Deficit**: `potato_healthy` (recall: 24.6% / 18.5%) and `tomato_healthy` (recall: 29.2% / 29.2%) frequently confused with diseased leaves due to soil/background noise.
- **Target Classes**: `healthy_general`, `potato_healthy`, `tomato_healthy`.
- **Required Visual Diversity**:
  - Clean healthy foliage across varied field backgrounds (dry soil, wet soil, mulch, shading, sunlight glare).
- **Priority**: **MEDIUM**

---

## 3. Data Collection & Image Selection Rules

### Prioritize (MUST ADD):
1. **Whole-leaf & Branch Context**: Images where leaf architecture (shape, margins, petiole) is clearly distinguishable alongside disease lesions.
2. **Natural Field Conditions**: Varied lighting (direct sun, overcast), field dirt, shadows, and natural field background clutter.
3. **Multiple Disease Stages**: Early stage spot formation, mid-stage lesion expansion, and late-stage chlorosis/necrosis.
4. **Sharp Focus on Lesion Margins**: Clear micro-texture of pustules, fungal hyphae, or bacterial exudate.

### Exclude (MUST NOT ADD):
1. **Tight Lesion Crops**: Cropped images showing only a brown spot or yellowing without any leaf margin or crop architecture context.
2. **Duplicate & Near-Duplicate Photos**: Photos taken seconds apart of the exact same leaf or plant branch.
3. **Out-of-Focus / Motion-Blurred Images**: Low-quality images where pustule vs lesion texture cannot be resolved visually.
4. **Synthetic or Watermarked Images**: Artificially generated, heavily filtered, or stock-photo watermarked images.

---

## 4. Quality Control & Audit Standards

1. **Dual-Expert Verification**: Every new candidate image must undergo validation by two independent annotators to confirm crop identity and disease label.
2. **Automated MD5 De-duplication**: Reject any image matching an existing MD5 hash in `train`, `val`, `test`, or `real_world_test`.
3. **DCT pHash Distance Filtering**: Compute 64-bit DCT pHash. Reject candidate images with pHash Hamming distance $\le 2$ against any image in the dataset to prevent near-duplicate leakage.
4. **Strict Real-World Test Protection**: The `real_world_test` split (975 images) remains **100% frozen, read-only, and untouched**. No new images may be added to or removed from `real_world_test`.

---

## 5. Train / Val / Test Partitioning Rules

1. **Stratified Field-Batch Splitting**: Group images by source field/farm before splitting so images from the same field batch never span across `train`, `val`, and `test`.
2. **Fixed Split Proportions**: Maintain target split ratio (~70% train, ~15% val, ~15% test).
3. **Class Balance**: Ensure each of the 15 classes maintains a balanced distribution across `train`, `val`, and `test`.

---

## 6. Recommended Evaluation Metrics for Next Phase

Upon completion of targeted dataset repair and model retraining in Phase 4, evaluation must measure:
1. **Overall Accuracy & Macro F1** on test and real-world holdout splits.
2. **Per-class Recall & F1** for the 5 targeted failure families.
3. **High-Confidence Wrong Prediction Rate** (calibrated confidence $\ge 0.60$).
4. **Calibration Error (ECE & Brier Score)** post-temperature scaling.
