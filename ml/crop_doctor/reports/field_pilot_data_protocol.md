# KisaanBuddy Crop Doctor: Field Pilot Data Collection & Annotation Protocol

**Document Version:** 1.0.0  
**Target Program:** Supervised Agricultural Field Pilot (KVK Collaborative Pilot)  
**Date:** 2026-11-07  
**Owner:** Senior ML Architect & Agricultural QA Lead  

---

## 1. Objectives & Quality Standards

The primary goal of this data protocol is to construct an authentic, high-fidelity, leakage-free dataset of Indian agricultural photographs taken under natural field conditions. This dataset will serve as the benchmark for certifying future Crop Doctor vision models.

---

## 2. Standardized Expert Review Outcomes

To ensure semantic consistency across agronomists, KVK scientists, and extension officers, every review MUST resolve to exactly one of the six standardized outcomes:

| Review Outcome Code | Description | Ground Truth Status | Dataset Export Eligibility |
| :--- | :--- | :--- | :--- |
| `confirmed_correct` | AI correctly identified both the crop species and specific pathological condition. | Valid Ground Truth | **Eligible** (Label = AI condition) |
| `correct_crop_incorrect_disease` | AI correctly identified the crop genus, but misclassified the specific disease/symptom. Expert provides corrected condition. | Valid Ground Truth | **Eligible** (Label = Expert corrected condition) |
| `incorrect_crop` | AI misidentified the crop species entirely. Expert provides corrected crop and condition. | Valid Ground Truth | **Eligible** (if corrected crop & condition belong to canonical taxonomy) |
| `uncertain_diagnosis` | Foliage symptoms are ambiguous, multi-pathogen complex present, or secondary nutritional deficiency obscures visual diagnosis. | Uncertain / Inconclusive | **Excluded from ground truth** |
| `unable_to_assess_photograph` | Photograph is out of focus, motion-blurred, overexposed, severely occluded, or taken from too great a distance. | Image Quality Defect | **Excluded from ground truth** (Archived for guardrail failure analysis) |
| `additional_photograph_required` | A single leaf angle is insufficient; agronomist requests whole-plant shot, stem inspection, or reverse-leaf view. | Pending Additional Evidence | **Excluded from ground truth** |

---

## 3. Data Collection Fields & Storage Schema

For each field observation, the system records:

1. **Machine Learning Provenance:**
   - `model_version`: e.g. `crop-doctor-v2.1.0-efficientnet-b0`
   - `artifact_hash`: SHA-256 checkpoint prefix (e.g. `db0d33a37dc200a7`)
   - `ai_predicted_crop`: Crop genus predicted by vision model
   - `ai_predicted_disease`: Specific pathological condition ID
   - `ai_confidence`: Calibrated softmax confidence score ($[0.0, 1.0]$)
   - `ai_status`: Prediction acceptance state (`ok`, `uncertain`, `retake_image`)
   - `image_quality_json`: Pre-inference check results (Laplacian variance, brightness, contrast, green foliage percentage)
2. **Farmer Input & Provenance:**
   - `farmer_crop_hint`: Crop species reported by farmer
   - `symptom_notes`: Free-text symptom observations (optional)
   - `state` & `district`: Geographic administrative region
   - `session_id`: Unique cryptographic session UUID generated on the client per photo session
   - `consent_recorded`: Boolean indicating farmer consent to share photo with experts
   - `consent_for_research`: Boolean indicating farmer consent to include anonymized imagery in ML research
3. **Expert Ground Truth & Audit:**
   - `review_outcome`: One of the 6 standardized outcome codes above
   - `expert_crop`: Confirmed botanical crop name
   - `expert_disease`: Confirmed disease/pest name or `healthy`
   - `expert_is_healthy`: Boolean flag confirming clean, asymptomatic foliage
   - `expert_notes`: Agronomist explanation and clinical reasoning
   - `expert_recommendation`: Organic/chemical management advisory
   - `reviewed_by_id`: User ID of reviewing expert
   - `reviewed_by_name`: Full name and institutional designation of reviewer
   - `reviewed_at`: ISO 8601 UTC timestamp of review completion
4. **Perceptual Deduplication:**
   - `dhash`: 64-bit difference hash computed at ingest to identify identical and burst photographs.

---

## 4. Privacy, Anonymization & Consent Enforcement

1. **Consent Gating:**
   Under no circumstances is an observation exported into training or evaluation manifests without `consent_for_research == True`.
2. **Zero-PII Manifests:**
   Exported manifests strip all phone numbers, farmer names, specific village addresses, and IP addresses. Observations are identified solely by an anonymized observation UUID (`obs_uuid`).
3. **Encrypted at Rest:**
   Farmer photographs are stored in isolated local storage with unguessable UUID filenames (e.g. `field_pilot_images/d7a8e2b1-5f4c-4e3a-9b1e-6d8c2a4f5b6e.jpg`).

---

## 5. Session-Isolated Splitting Strategy

A common failure mode in agricultural computer vision is **session leakage**: a farmer takes 5 photos of the same affected tomato plant from slightly different angles. If 3 photos land in the training set and 2 in the test set, the model memorizes plant-specific background clutter, yielding artificially inflated evaluation metrics.

To eliminate this flaw:
- The export pipeline groups observations strictly by `session_id` (or `farmer_id` if session is absent).
- Entire capture sessions are assigned atomically to either the Training Split or the Locked Evaluation Split.
- The splitting ratio is **80% Training / 20% Locked Evaluation**.
- Stratification is enforced at the class level based on `expert_confirmed_disease`.

---

## 6. Manifest File Specification

The export pipeline generates JSON manifests compliant with the KisaanBuddy V2 Manifest Standard:

```json
{
  "manifest_version": "2.1.0-field-pilot",
  "generated_at": "2026-11-07T12:00:00Z",
  "total_samples": 450,
  "unique_sessions": 210,
  "split_summary": {
    "train": 360,
    "locked_evaluation": 90
  },
  "samples": [
    {
      "sample_id": "PILOT-20261107-1042",
      "session_id": "sess-8a9b1c2d",
      "image_path": "ml/crop_doctor/data/field_pilot/images/d7a8e2b1.jpg",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "dhash": "a4f2c1b987654321",
      "crop": "Tomato",
      "canonical_label": "tomato_early_blight",
      "is_healthy": false,
      "review_outcome": "confirmed_correct",
      "original_ai_prediction": "tomato_early_blight",
      "original_ai_confidence": 0.8124,
      "reviewer_institution": "ICAR-IIVR KVK Varanasi",
      "state": "Uttar Pradesh",
      "district": "Varanasi",
      "split": "train"
    }
  ]
}
```
