# Model Card: KisaanBuddy Crop Doctor AI (v1.0.0-scratch)

**Model Name:** `kisaanbuddy-crop-doctor-mobilenetv3-small`  
**Model Version:** `v1.0.0-scratch`  
**License:** Apache 2.0 (Code) / CC BY 4.0 & CC0 (Training Data)  
**Date Authored:** November 2026  
**Developer:** KisaanBuddy Engineering & ML Team  

---

## 1. Intended Use

- **Primary Intended Use:** Automated, real-time visual assistance for smallholder farmers diagnosing 17 major foliage pathologies across 5 critical staple crops (Tomato, Potato, Corn, Bell Pepper, Squash).
- **Primary Users:** Farmers, agricultural extension field workers, and Krishi Vigyan Kendra agronomists.
- **Out-of-Scope Use:** Not intended as an infallible single-point regulatory certification or as a replacement for lab-based molecular/PCR pathogen testing.

---

## 2. Architecture & Training Details

- **Backbone Architecture:** MobileNetV3-Small (1.54M parameters).
- **Weight Initialization:** Strictly random (`weights=None`), initialized via Kaiming Normal distribution. **Zero pretrained foundation or ImageNet weights.**
- **Input Resolution:** $224 \times 224 \times 3$ RGB.
- **Training Epochs:** 10 epochs with AdamW optimizer ($\text{lr}=10^{-3}$, weight decay $=10^{-4}$) and Cosine Annealing learning rate schedule.
- **Data Augmentations:** Random horizontal/vertical flip, random affine rotation ($\pm 15^\circ$), color jitter (brightness 0.2, contrast 0.2, saturation 0.2).
- **Loss Function:** Cross-Entropy Loss with label smoothing ($\epsilon = 0.05$).
- **Post-hoc Calibration:** Platt Temperature Scaling ($T = 0.9472$) optimized on held-out validation cross-entropy.

---

## 3. Training & Validation Datasets

- **Training Partition:** 4,190 verified authentic agricultural images (PlantVillage & PlantDoc).
- **Validation Partition:** 826 verified authentic images.
- **Exclusions:** Zero synthetic leaves, zero PIL-drawn artifacts, zero non-leaf synthetic noise.

---

## 4. Evaluation Performance

### Internal Test (549 samples)
- **Top-1 Accuracy:** 75.41%
- **Top-3 Accuracy:** 89.07%
- **Macro-F1 Score:** 0.7595
- **Expected Calibration Error (ECE):** 0.0490

### Field Holdout (124 in-the-wild samples)
- **Top-1 Accuracy:** 28.23% (Raw) $\rightarrow$ 57.69% on accepted samples ($\ge 0.60$ confidence).
- **Uncertainty Rejection Rate:** 79.0% routed safely to expert review.

### Out-of-Distribution Distractors (300 samples)
- **Mean Confidence:** 0.3976
- **OOD Rejection Rate:** 80.00% rejected at $\ge 0.60$ threshold.

---

## 5. Ethical Considerations & Limitations

- The model uses selective prediction. When symptom visual indicators are weak, blurry, or outside the 17 target conditions, it surfaces an uncertainty flag rather than giving a false answer.
- Farmers are provided with non-chemical cultural sanitation practices alongside chemical suggestions.
