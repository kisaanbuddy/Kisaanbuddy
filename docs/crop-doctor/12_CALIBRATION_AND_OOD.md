# 12 — Uncertainty Calibration & Out-Of-Distribution (OOD) Rejection
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  
**Module:** `ml/crop_doctor/calibration/temperature_scaling.py`  

---

## 1. Temperature Scaling Calibration

Raw model logits are scaled using an optimized scalar temperature parameter $T > 0$ calibrated strictly on the validation partition via negative log-likelihood (NLL) minimization:

$$p_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

- **Optimized Temperature ($T$):** `0.9472`
- **Validation NLL:** Reduced from `0.8461` to `0.8410`
- **Internal Test Expected Calibration Error (ECE):** `0.0490` (4.90%)

---

## 2. OOD Evaluation (300 Real Agricultural Non-Target Foliage Images)

The OOD benchmark tested foliage from unsupported agricultural species (Blueberry, Cherry, Peach, Apple rust, Grape, Soybean) and cluttered background photos:
- **Mean OOD Calibrated Confidence:** `0.3976` (39.76%)
- **Rejection Rates Under Decision Thresholds:**
  - Confidence < 0.50: **71.33%** rejected
  - Confidence < 0.60: **80.00%** rejected
  - Confidence < 0.70: **87.67%** rejected

---

## 3. Production Selective Prediction Policy

- If top calibrated probability $\ge 0.60$ and quality is acceptable $\rightarrow$ `status: "diagnosed"`.
- If top calibrated probability $< 0.60$ $\rightarrow$ `status: "uncertain"`, `expert_review_recommended: true`.
- If image is blurry, underexposed, or corrupted $\rightarrow$ `status: "retake_image"`.
- Never invent a diagnosis or fallback to fixed confidences (0.84, 0.92, etc.).
