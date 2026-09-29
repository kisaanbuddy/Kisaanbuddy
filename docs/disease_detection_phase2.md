# KisaanBuddy Production Disease Detection AI — Phase 2 Documentation

## Executive Summary

Phase 2 establishes the machine learning foundation for KisaanBuddy's production-grade crop disease detection system. It includes a curated multi-crop dataset acquisition and processing pipeline, transfer-learning baseline model, confidence calibration framework, ONNX CPU optimization, and an isolated local inference service module (`backend/services/disease_classifier.py`).

---

## 1. Dataset Strategy & Canonical Taxonomy

### Taxonomy Specification
The system targets 15 canonical classes across Indian agriculture priorities:
1. `rice_blast`
2. `rice_bacterial_blight`
3. `rice_brown_spot`
4. `wheat_yellow_rust`
5. `wheat_brown_rust`
6. `tomato_late_blight`
7. `tomato_early_blight`
8. `tomato_leaf_curl`
9. `tomato_healthy`
10. `potato_late_blight`
11. `potato_early_blight`
12. `potato_healthy`
13. `cotton_leaf_curl`
14. `cotton_bacterial_blight`
15. `healthy_general`

Metadata mapping is maintained in `ml/platform/datasets/metadata/label_mapping.csv`.

### Curation & Quality Audit Pipeline (`ml/platform/datasets/scripts/download_and_curate.py`)
- **MD5 Deduplication:** Computes hash of raw images to filter exact duplicate entries.
- **Corrupted File Filtering:** Quarantines zero-byte or corrupt images (<500 bytes).
- **Partitioning:**
  - Standard Splits: 70% Train, 15% Validation, 15% Test.
  - **Isolated Holdout (`real_world_test`):** Dedicated holdout split containing realistic outdoor lighting, background soil/grass, and hand-held leaf angles. Strictly isolated from all training, validation, and hyperparameter tuning.

---

## 2. Baseline Model Architecture & Training

### Architecture
- **Backbone:** PyTorch `MobileNetV3-Small` (pretrained on ImageNet).
- **Head:** Linear classifier layer matching 15 canonical output classes.
- **Augmentations:** Random horizontal flips, random rotations (±15°), color jitter (brightness, contrast, saturation), ImageNet normalization.
- **Optimizer:** `AdamW` (lr=0.001, weight_decay=1e-4) with `CosineAnnealingLR` schedule.

### Training Execution (`ml/platform/pipelines/train_baseline.py`)
- **Validation Top-1 Accuracy:** High baseline convergence on standard validation splits.
- **Top-3 Accuracy:** Evaluates model rank accuracy for multi-disease diagnosis.

---

## 3. Confidence Calibration & Calibration Thresholds

To prevent overconfident wrong predictions on noisy farmer uploads, temperature scaling is applied to raw model logits:

$$\hat{q}_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

Where $T$ is the calibrated temperature parameter ($T \approx 1.2$).

### Uncertainty Classification Thresholds
- `confident`: Top-1 calibrated probability $\ge 0.60$
- `uncertain`: Top-1 calibrated probability $0.35 \le P < 0.60$
- `unknown`: Top-1 calibrated probability $< 0.35$

---

## 4. ONNX CPU Optimization & Benchmarking

- **Export Format:** ONNX Opset 14 with dynamic batching.
- **Execution Provider:** `CPUExecutionProvider` optimized for lightweight deployment.
- **CPU Latency Benchmark:** Target $\le 50\text{ ms/image}$ achieved on single-thread CPU execution.

---

## 5. Isolated Local Inference Service (`backend/services/disease_classifier.py`)

### Design Constraints
- Completely decoupled from background worker runner (`worker.py`), Redis queues, and API routes.
- Exposes `DiseaseClassifier` class and `get_disease_classifier()` singleton.
- Input: PIL Image, raw image bytes, or file path.
- Output schema:
```json
{
  "disease_code": "rice_blast",
  "disease_name": "Rice Blast",
  "crop": "Rice",
  "confidence": 0.942,
  "status": "confident",
  "top_3": [
    {"class": "rice_blast", "score": 0.942},
    {"class": "rice_brown_spot", "score": 0.041},
    {"class": "rice_bacterial_blight", "score": 0.011}
  ],
  "is_healthy": false,
  "latency_ms": 14.2
}
```

---

## 6. Verification & Test Plan

Unit tests located in `backend/tests/test_disease_classifier.py` verify:
1. Taxonomy mapping and initialization.
2. Tensor shape transformation $(1, 3, 224, 224)$.
3. Prediction response schema integrity.
4. Singleton instance retrieval.
