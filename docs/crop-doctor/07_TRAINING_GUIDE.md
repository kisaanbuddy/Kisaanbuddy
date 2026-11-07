# 07 — Training Guide & Pipeline Execution
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  
**Module:** `ml/crop_doctor/training/train.py`  

---

## 1. Pipeline Invocation

```bash
# Run from repository root
$env:KMP_DUPLICATE_LIB_OK="TRUE"
python ml/crop_doctor/training/train.py \
  --arch mobilenet_v3_small \
  --epochs 10 \
  --batch_size 32 \
  --lr 0.001 \
  --seed 42 \
  --device cpu
```

## 2. Training Hyperparameters

- **Loss Function:** `nn.CrossEntropyLoss(label_smoothing=0.05)`
- **Optimizer:** AdamW (`lr=1e-3`, `weight_decay=1e-4`)
- **Learning Rate Schedule:** Cosine Annealing decay across epochs down to `1e-6`
- **Gradient Clipping:** Max norm 5.0
- **Batch Size:** 32
- **Image Resolution:** 224x224 RGB
- **Augmentation Pipeline (Train Only):**
  - Random Horizontal Flip (`p=0.5`)
  - Random Vertical Flip (`p=0.5`)
  - Random Rotation (`degrees=15`)
  - Color Jitter (Brightness 0.15, Contrast 0.15, Saturation 0.15, Hue 0.03)
- **Early Stopping & Checkpoint Metric:** Validation Macro-F1 across all 17 classes
