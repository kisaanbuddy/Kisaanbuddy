# Final Model Selection Report — KisaanBuddy Phase 4 Finalization

## Executive Summary
This document formalizes the final candidate selection for the KisaanBuddy crop disease detection engine following Phase 4B controlled retraining experiments.

---

## Candidate Comparison Matrix

| Evaluation Metric / Feature | MobileNetV3-Small (Phase 3A CE) | MobileNetV3-Small (Phase 4B Focal Loss) | EfficientNetV2-S (Phase 3A CE) | EfficientNetV2-S (Phase 4B Focal Loss) **[SELECTED]** |
| :--- | :--- | :--- | :--- | :--- |
| **Loss Function** | Cross-Entropy | Focal Loss ($\gamma = 2.0$) | Cross-Entropy | Focal Loss ($\gamma = 2.0$) |
| **Optimal Temperature ($T_{\text{opt}}$)** | $1.00$ | $0.90$ | $1.15$ | **$0.75$** |
| **Test Set Overall Accuracy** | $47.06\%$ | $48.37\%$ | $48.89\%$ | **$51.37\%$ (+2.48%)** |
| **Test Set Macro F1** | $44.75\%$ | $46.60\%$ | $45.87\%$ | **$47.45\%$ (+1.58%)** |
| **Real-World Holdout Macro F1** | $41.34\%$ | $41.48\%$ | $42.27\%$ | **$42.15\%$** |
| **High-Confidence Wrongs ($\ge 0.60$)** | $138$ | $99$ ($-28.3\%$) | $66$ | **$26$ ($-60.6\%$)** |
| **Model Size (PyTorch Checkpoint)** | ~9.8 MB | ~9.8 MB | ~85.2 MB | ~85.2 MB |
| **CPU Latency (Single Image)** | ~25 ms | ~25 ms | ~120 ms | ~120 ms |

---

## Final Selected Candidate

### Selected Primary Production Model: **EfficientNetV2-S (Focal Loss $\gamma=2.0$, $T=0.75$)**
- **Checkpoint Path**: `ml/platform/models/v4/efficientnet_v2_s_focal_best.pth`
- **Key Justification**:
  1. **Highest Overall Accuracy**: Achieves the highest test set accuracy ($51.37\%$) and test Macro F1 ($47.45\%$) across all tested configurations.
  2. **Dramatic Error Suppression**: Reduces high-confidence false predictions ($\ge 0.60$) by **60.6%** (from 66 to 26), ensuring safer inference behavior when deployed to farmers.
  3. **Calibrated Confidence**: Scaled temperature ($T=0.75$) produces well-calibrated class probability distributions suited for thresholding uncertain predictions.

### Selected Secondary Edge Candidate: **MobileNetV3-Small (Focal Loss $\gamma=2.0$, $T=0.90$)**
- **Checkpoint Path**: `ml/platform/models/v4/mobilenet_v3_small_focal_best.pth`
- **Key Justification**: Ultra-lightweight footprint (~10 MB) suitable for resource-constrained embedded or offline mobile devices where sub-30ms latency is required.

---

## Diagnostic Caveat & Limitations
- **Non-Clinical / Non-Diagnostic Warning**: The selected model is intended as an agricultural decision-support tool, NOT a certified diagnostic instrument.
- **Ambiguous Failure Families**: Visual confusion remains high between fine-grained leaf curl variants (`cotton_leaf_curl` $\leftrightarrow$ `tomato_leaf_curl`) and rust variants (`wheat_brown_rust` $\leftrightarrow$ `wheat_yellow_rust`).
- **Confidence Thresholding Policy**: Predictions with top class confidence $< 0.40$ or where the top-1 to top-2 probability margin $< 0.15$ are flagged as **`uncertain`** requiring agricultural expert review.
