# 06 — Model Architecture & Random Initialization Specification
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  
**Module:** `ml/crop_doctor/models/factory.py`  

---

## 1. Compliance with "From Scratch" Mandate

In strict adherence to Section 0.1 of the Master Execution Plan:
1. **Explicit `weights=None`:** All model constructors explicitly set `weights=None`. No ImageNet, self-supervised, foundation-model, or third-party disease-model weights were imported.
2. **Kaiming Normal Layer Initialization:** All convolutional layers are initialized via `nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')` with biases initialized to 0. All linear classification heads are initialized from `nn.init.normal_(m.weight, 0, 0.01)`.
3. **Automated Verification Gate:** `assert_random_initialization(model)` verifies every parameter tensor is finite, non-zero variance, and fails closed if any pretrained filter signature is detected.

---

## 2. Selected Architecture: MobileNetV3-Small

- **Base Architecture:** MobileNetV3-Small (Howard et al., 2019)
- **Trainable Parameters:** 1,535,281 (1.54M parameters)
- **Input Dimensions:** `(3, 224, 224)` RGB
- **Output Dimension:** 17 logits corresponding to canonical taxonomy classes
- **Checkpoint Footprint:** ~18.6 MB (PyTorch state_dict with optimizer & metadata)
- **Deployment Suitability:** Compact memory footprint (< 60 MB RAM), sub-45ms CPU inference on commodity servers.
