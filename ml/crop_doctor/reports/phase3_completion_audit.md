# Phase 3 Completion Audit: Advanced Agricultural Vision Model Development

**Project:** KisaanBuddy Crop Doctor AI Rebuild  
**Branch:** `feature/crop-doctor-ml-rebuild`  
**Audit Date:** 2026-11-07  
**Hardware Platform:** NVIDIA GeForce RTX 4060 Laptop GPU (8GB GDDR6 VRAM), Intel Core i7-14700HX, 16GB System RAM  
**Software Environment:** Python 3.11.9, PyTorch 2.6.0+cu124, Torchvision 0.21.0+cu124, CUDA 12.4, cuDNN 9.1  

---

## 1. Executive Summary

Phase 3 developed, benchmarked, and verified next-generation vision models for the KisaanBuddy Crop Doctor service, addressing the real-world domain gap between clean laboratory benchmark datasets (PlantVillage) and noisy, in-the-wild farmer photographs (PlantDoc).

Key accomplishments:
1. **Clean Dataset Partitions (Splits v2):** Purged 33 conflicting or duplicate samples identified in Phase 1 (including cross-set perceptual hash leaks and mislabeled PlantDoc samples), establishing strict zero-leakage training (`train_manifest_v2.json`: 4,157 samples) and validation (`val_manifest_v2.json`: 826 samples) partitions.
2. **Unified Experiment Pipeline:** Built automated mixed precision (`torch.amp`), warmup + cosine decay scheduling, in-memory thumbnail preloading (eliminating Windows multiprocessing IPC stalls), and enhanced field augmentations (scale-invariant `RandomResizedCrop`, `ColorJitter`, `RandomRotation`, and `RandomErasing`).
3. **Model Experiments Executed & Verified:**
   - **Baseline:** MobileNetV3-Small from scratch (10 epochs, CPU): Validation F1 = 0.7595.
   - **Experiment A1 (`exp_a1_mobilenet_v3_small_scratch_224_std`):** MobileNetV3-Small from random initialization (25 epochs, RTX 4060 GPU): Best Epoch 23, Val Accuracy = **78.21%**, Val Macro-F1 = **0.7942**.
   - **Experiment C1 (`exp_c1_mobilenet_v3_pretrained_224`):** MobileNetV3-Small transfer learning from ImageNet-1k with enhanced augmentations (15 epochs, RTX 4060 GPU): Best Epoch 15, Val Accuracy = **86.80%**, Val Macro-F1 = **0.8761**.
   - **Experiment C2 (`exp_c2_efficientnet_b0_pretrained_224`):** EfficientNet-B0 transfer learning (15 epochs, RTX 4060 GPU): Best Epoch 9, Val Accuracy = **88.38%**, Val Macro-F1 = **0.8900**.

---

## 2. Checkpoint & Artifact Audit

Every experiment artifact is preserved on disk with immutable weights and structured metadata:

| Experiment Name | Architecture | Weights Mode | Resolution | Batch Size | Total Epochs | Best Epoch | Peak VRAM | Checkpoint Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline** | MobileNetV3-Small | Random Init (`weights=None`) | 224x224 | 32 | 10 | 10 | CPU | `ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth` | Verified |
| **Exp A1** | MobileNetV3-Small | Random Init (`weights=None`) | 224x224 | 64 | 25 | 23 | 545 MB | `ml/crop_doctor/artifacts/experiments/exp_a1_mobilenet_v3_small_scratch_224_std/best_model.pth` | Complete and verified |
| **Exp C1** | MobileNetV3-Small | Transfer Learning (`pretrained=True`) | 224x224 | 64 | 15 | 15 | 581 MB | `ml/crop_doctor/artifacts/experiments/exp_c1_mobilenet_v3_pretrained_224/best_model.pth` | Complete and verified |
| **Exp C2** | EfficientNet-B0 | Transfer Learning (`pretrained=True`) | 224x224 | 64 | 15 | 9 | 1,220 MB | `ml/crop_doctor/artifacts/experiments/exp_c2_efficientnet_b0_pretrained_224/best_model.pth` | Complete and verified |

---

## 3. Engineering Discoveries & Bottleneck Solutions

### 3.1 Windows NTFS Multiprocessing Latency
- **Issue:** On Windows, PyTorch `DataLoader(..., num_workers=2)` uses process spawning (`spawn`). At 4,157 files, reading uncompressed high-resolution images repeatedly from NTFS caused high disk queuing and thread contention, slowing epochs down to ~35 seconds.
- **Solution:** Implemented `CropDoctorDataset(..., preload=True, max_cache_dim=384)`. All 4,157 training and 826 validation images are downscaled into compact RGB thumbnails in system RAM once during initialization (taking only 18-25 seconds and consuming ~1.2 GB of RAM). With `num_workers=0`, GPU utilization surged, and epoch durations dropped to ~23 seconds for MobileNetV3.

### 3.2 Scratch Initialization vs Transfer Learning Dynamics
- **Observation:** In from-scratch training (Exp A1), Batch Normalization layers required 8-10 epochs of linear learning rate warmup to accumulate stable running means and variances. The model reached 78.21% validation accuracy at epoch 23.
- In contrast, transfer learning from ImageNet-1k (Exp C1) leveraged general visual primitives (leaf edges, venation textures, necrotic spot gradients), immediately achieving 76.51% validation accuracy in epoch 2 and converging cleanly to **86.80%** (Macro-F1: **0.8761**) by epoch 15.

---

## 4. Phase 3 Verification Verdict

- **Status:** **Complete and verified**.
- All checkpoints, manifests, training logs, and metrics are verified on physical disk.
- Zero data leakage into internal test or field holdout splits.
- Baseline model intact and untouched.
