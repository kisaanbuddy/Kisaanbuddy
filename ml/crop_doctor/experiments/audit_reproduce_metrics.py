"""
Independent Reproduction and Audit of Evaluation Metrics.
Directly loads checkpoints and recomputes all metrics from raw and calibrated outputs.
Calculates Top-1, Top-3, Macro-F1, Weighted-F1, per-class precision/recall,
confusion matrices, ECE, NLL, Brier score, and coverage-risk curves.
"""

import sys
import json
import math
from pathlib import Path
import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, confusion_matrix, log_loss

repo_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(repo_root))

from ml.crop_doctor.models.factory import create_model
from ml.crop_doctor.training.dataset import (
    CropDoctorDataset,
    get_eval_transforms,
    CANONICAL_CLASSES,
    CLASS_TO_IDX,
    IDX_TO_CLASS
)

def compute_calibration_suite(probs: np.ndarray, targets: np.ndarray, n_bins: int = 10):
    """Computes ECE, NLL, and Brier Score."""
    num_samples = len(targets)
    num_classes = probs.shape[1]
    
    # 1. Brier Score
    one_hot = np.zeros((num_samples, num_classes), dtype=np.float32)
    one_hot[np.arange(num_samples), targets] = 1.0
    brier_score = float(np.mean(np.sum((probs - one_hot) ** 2, axis=1)))
    
    # 2. NLL (Log Loss)
    eps = 1e-12
    clipped_probs = np.clip(probs, eps, 1.0 - eps)
    nll = float(-np.mean(np.log(clipped_probs[np.arange(num_samples), targets])))
    
    # 3. ECE
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    accuracies = (predictions == targets)

    ece = 0.0
    bin_details = []
    for i in range(n_bins):
        in_bin = (confidences > bin_boundaries[i]) & (confidences <= bin_boundaries[i + 1])
        prop_in_bin = np.mean(in_bin)
        if prop_in_bin > 0:
            acc_in_bin = float(np.mean(accuracies[in_bin]))
            conf_in_bin = float(np.mean(confidences[in_bin]))
            ece += np.abs(conf_in_bin - acc_in_bin) * prop_in_bin
            bin_details.append({
                "bin": f"{bin_boundaries[i]:.2f}-{bin_boundaries[i+1]:.2f}",
                "count": int(np.sum(in_bin)),
                "acc": round(acc_in_bin, 4),
                "conf": round(conf_in_bin, 4)
            })
    return float(ece), nll, brier_score, bin_details

def compute_selective_risk_coverage(probs: np.ndarray, targets: np.ndarray, thresholds=None):
    """Computes selective prediction metrics across thresholds."""
    if thresholds is None:
        thresholds = [0.40, 0.50, 0.55, 0.58, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90]
        
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    total = len(targets)
    
    results = {}
    for thresh in thresholds:
        accepted_mask = confidences >= thresh
        num_accepted = int(np.sum(accepted_mask))
        num_rejected = total - num_accepted
        coverage = num_accepted / total
        rejection_rate = num_rejected / total
        
        if num_accepted > 0:
            acc_targets = targets[accepted_mask]
            acc_preds = predictions[accepted_mask]
            correct_accepted = int(np.sum(acc_targets == acc_preds))
            incorrect_accepted = num_accepted - correct_accepted
            selective_acc = correct_accepted / num_accepted
            selective_risk = incorrect_accepted / num_accepted
        else:
            correct_accepted = 0
            incorrect_accepted = 0
            selective_acc = 0.0
            selective_risk = 0.0
            
        results[f"{thresh:.2f}"] = {
            "threshold": thresh,
            "accepted_count": num_accepted,
            "rejected_count": num_rejected,
            "coverage": round(coverage, 4),
            "rejection_rate": round(rejection_rate, 4),
            "correct_accepted": correct_accepted,
            "incorrect_accepted": incorrect_accepted,
            "selective_accuracy": round(selective_acc, 4),
            "selective_risk": round(selective_risk, 4)
        }
    return results

def run_independent_audit(checkpoint_path: str, manifest_path: str, temperature: float = 1.0, image_size: int = 224, device_name: str = "cuda"):
    device = torch.device(device_name if torch.cuda.is_available() else "cpu")
    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)
    arch = ckpt.get("architecture", "mobilenet_v3_small")
    pretrained = ckpt.get("pretrained", ckpt.get("weights_mode") == "imagenet_transfer")
    
    model = create_model(arch, num_classes=len(CANONICAL_CLASSES), pretrained=pretrained)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device).eval()
    
    dataset = CropDoctorDataset(manifest_path, transform=get_eval_transforms(image_size), preload=False)
    loader = DataLoader(dataset, batch_size=32, shuffle=False, num_workers=0)
    
    all_logits = []
    all_targets = []
    with torch.no_grad():
        for inputs, targets in loader:
            inputs = inputs.to(device)
            logits = model(inputs)
            all_logits.append(logits.cpu())
            all_targets.extend(targets.numpy())
            
    logits = torch.cat(all_logits, dim=0)
    targets = np.array(all_targets)
    
    # 1. Raw Probs (T=1.0)
    raw_probs = F.softmax(logits, dim=1).numpy()
    # 2. Scaled Probs (T=temperature)
    scaled_probs = F.softmax(logits / temperature, dim=1).numpy()
    
    preds = np.argmax(raw_probs, axis=1) # Monotonically identical for scaled
    
    # Core Accuracy
    top1 = float(accuracy_score(targets, preds))
    _, top3_indices = torch.topk(logits, k=3, dim=1)
    top3_correct = sum(targets[i] in top3_indices[i] for i in range(len(targets)))
    top3 = float(top3_correct / len(targets))
    
    class_indices = list(range(len(CANONICAL_CLASSES)))
    macro_f1 = float(f1_score(targets, preds, labels=class_indices, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(targets, preds, labels=class_indices, average="weighted", zero_division=0))
    
    per_class_p = precision_score(targets, preds, labels=class_indices, average=None, zero_division=0).tolist()
    per_class_r = recall_score(targets, preds, labels=class_indices, average=None, zero_division=0).tolist()
    per_class_f = f1_score(targets, preds, labels=class_indices, average=None, zero_division=0).tolist()
    cm = confusion_matrix(targets, preds, labels=class_indices).tolist()
    
    # Calibration metrics for raw vs scaled
    raw_ece, raw_nll, raw_brier, raw_bins = compute_calibration_suite(raw_probs, targets)
    scaled_ece, scaled_nll, scaled_brier, scaled_bins = compute_calibration_suite(scaled_probs, targets)
    
    # Selective risk & coverage
    raw_selective = compute_selective_risk_coverage(raw_probs, targets)
    scaled_selective = compute_selective_risk_coverage(scaled_probs, targets)
    
    return {
        "checkpoint": str(checkpoint_path),
        "manifest": str(manifest_path),
        "total_samples": len(targets),
        "architecture": arch,
        "temperature_applied": round(temperature, 4),
        "top1_accuracy": round(top1, 4),
        "top3_accuracy": round(top3, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "per_class": {
            CANONICAL_CLASSES[i]: {
                "precision": round(per_class_p[i], 4),
                "recall": round(per_class_r[i], 4),
                "f1": round(per_class_f[i], 4),
                "support": int(np.sum(targets == i))
            }
            for i in range(len(CANONICAL_CLASSES))
        },
        "confusion_matrix": cm,
        "raw_calibration": {
            "ece": round(raw_ece, 4),
            "nll": round(raw_nll, 4),
            "brier": round(raw_brier, 4),
            "bins": raw_bins
        },
        "scaled_calibration": {
            "ece": round(scaled_ece, 4),
            "nll": round(scaled_nll, 4),
            "brier": round(scaled_brier, 4),
            "bins": scaled_bins
        },
        "raw_selective": raw_selective,
        "scaled_selective": scaled_selective
    }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--ckpt", type=str, required=True)
    parser.add_argument("--manifest", type=str, required=True)
    parser.add_argument("--temp", type=float, default=1.0)
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()
    
    res = run_independent_audit(args.ckpt, args.manifest, temperature=args.temp)
    print(json.dumps({k: v for k, v in res.items() if k not in ["confusion_matrix", "per_class"]}, indent=2))
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2)
