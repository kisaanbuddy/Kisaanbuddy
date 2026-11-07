# 10 — Field Generalization & Domain Shift Analysis
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  

---

## 1. Domain Shift: Controlled Lab vs. In-The-Wild Field

The evaluation demonstrates a classic agricultural computer-vision domain shift:
- **Internal Test Accuracy:** 75.41% Top-1, 89.07% Top-3.
- **Unconstrained Field Holdout Accuracy:** 28.23% Top-1, 58.87% Top-3.

### Root Causes of Field Discrepancy
1. **Severe Occlusion & Complex Backgrounds:** Real field photographs from PlantDoc feature hands holding leaves, soil, weeds, multiple leaves at varying depths of field, and harsh direct sunlight.
2. **Multi-Symptom Leaves:** In true farmer fields, a leaf may simultaneously exhibit fungal spotting, nutrient stress, and insect feeding scars.
3. **Implication for Farmer Experience:**
   - Visual classification models cannot be deployed as authoritarian diagnostic engines.
   - The platform MUST employ calibrated uncertainty rejection: when an image has low confidence (< 0.60), KisaanBuddy returns `status: "uncertain"` with `expert_review_recommended: true` and differential top-3 options, preventing dangerous pesticide misapplication.
