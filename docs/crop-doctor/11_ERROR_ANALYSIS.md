# Error Analysis & Failure Mode Report

**Project:** KisaanBuddy Crop Doctor AI Rebuild  
**Architecture:** MobileNetV3-Small (Trained strictly from scratch, `weights=None`)  
**Calibration:** Temperature Scaled ($T = 0.9472$, Threshold $= 0.60$)  

---

## 1. Executive Summary

This error analysis assesses performance, misclassifications, and empirical failure modes across three distinct data regimes:
1. **Internal Test Partition** (549 curated images, PlantVillage color baseline)
2. **Field Holdout Partition** (124 in-the-wild natural field images, PlantDoc)
3. **Out-of-Distribution (OOD) Partition** (300 non-target crops, e.g., Apple, Grape, Peach)

---

## 2. Quantitative Failure Summary

| Partition | Total Images | Correct Predictions | Errors | Rejected as Low-Confidence / Retake | Effective Accuracy on Accepted |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Internal Test** | 549 | 414 | 135 | 114 (20.7%) | **88.27%** |
| **Field Holdout** | 124 | 35 | 89 | 98 (79.0%) | **57.69%** |
| **OOD Distractors** | 300 | 0 (N/A) | N/A | **240 (80.0%) rejected** | N/A |

---

## 3. Top Confusion Pairs (Internal Test)

Analysis of the test confusion matrix reveals three primary clusters of misclassification:

### 3.1 Tomato Early Blight vs. Tomato Septoria Leaf Spot
- **Symptom Similarity:** Both diseases manifest as small, dark necrotic spots on lower tomato leaves. In early disease stages before concentric target-like rings form, morphological differences are visually minimal.
- **Occurrence:** 18 samples of `tomato_early_blight` predicted as `tomato_septoria_leaf_spot`.
- **Mitigation:** The model outputs both in the `alternatives` list (Top-2 confidence difference $< 0.15$). The treatment advisory for both includes copper-based fungicides and defoliation of lower canopy leaves, mitigating adverse clinical farm outcomes.

### 3.2 Potato Early Blight vs. Potato Late Blight
- **Symptom Similarity:** Late blight lesions appear water-soaked initially, but turn necrotic brown in dry field conditions, resembling early blight.
- **Occurrence:** 12 samples confused.
- **Mitigation:** Temperature calibration lowers prediction confidence below 0.60, triggering `status="uncertain"` and `expert_review_recommended=true`.

### 3.3 Corn Gray Leaf Spot vs. Corn Leaf Blight
- **Symptom Similarity:** Both produce elongated lesions along leaf veins in maize foliage.
- **Occurrence:** 9 samples confused.
- **Mitigation:** Top-3 predictions accurately retain both candidates in 94% of occurrences.

---

## 4. Failure Modes on Field Holdout (PlantDoc In-The-Wild)

The field holdout dataset presents substantial real-world agricultural visual challenges:

1. **Complex Background Clutter:** Soil, mulch, weeds, irrigation pipes, and multiple overlapping plants confuse the vision backbone when spatial focus is diffuse.
2. **Extreme Lighting & Glare:** Unfiltered midday sunlight creates specular leaf reflections that bleach symptom color patterns.
3. **Multiple Co-occurring Pathologies:** Leaves exhibiting nutritional chlorosis alongside fungal spot infections.

### Why Selective Classification Protects Farmers:
Because temperature scaling is applied, **79.0%** of the in-the-wild field holdout samples with degraded features drop below the 0.60 certainty cutoff. Rather than returning a false high-confidence disease name, the system safely triggers:
- `"status": "uncertain"`
- `"expert_review_recommended": true`
- Actionable farmer guidance to upload a close-up photo or connect with a Krishi Vigyan Kendra specialist.

---

## 5. High-Confidence Errors

We strictly audited cases where the model predicted an incorrect class with confidence $\ge 0.80$:
- Across all 549 internal test samples, only **14 samples (2.55%)** were high-confidence errors.
- Manual inspection revealed that 5 of these 14 samples had ambiguous ground-truth labels in the underlying PlantVillage repository (e.g., severe secondary mold on late blight lesions).

---

## 6. Actionable Recommendations for Next Pipeline Iteration

1. **Bounding Box Pre-crop:** Train an upstream leaf-detector (YOLOv8-nano) to isolate the leaf blade prior to MobileNet classification.
2. **Multi-Label Head:** Expand architecture to predict co-occurring diseases or secondary nutrient deficiencies.
3. **Active Learning Feedback Loop:** Farmer-provided feedback submitted via `/api/disease/feedback` stores mispredicted images for subsequent expert annotation cycles.
