import os
import sys
import json
import argparse
from pathlib import Path
import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, confusion_matrix

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

def compute_ece(probs, targets, n_bins=10):
    """
    Computes Expected Calibration Error (ECE).
    """
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
            accuracy_in_bin = np.mean(accuracies[in_bin])
            avg_confidence_in_bin = np.mean(confidences[in_bin])
            ece += np.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin
            bin_details.append({
                "bin": f"{bin_boundaries[i]:.2f}-{bin_boundaries[i+1]:.2f}",
                "count": int(np.sum(in_bin)),
                "acc": round(float(accuracy_in_bin), 4),
                "conf": round(float(avg_confidence_in_bin), 4)
            })
    return float(ece), bin_details

def compute_top_k_accuracy(outputs, targets, k=3):
    """Computes top-k accuracy."""
    _, top_indices = torch.topk(outputs, k, dim=1)
    correct = 0
    for i in range(len(targets)):
        if targets[i] in top_indices[i]:
            correct += 1
    return correct / len(targets)

def evaluate_checkpoint(checkpoint_path: str, manifest_path: str, image_size: int = 224, device_name: str = "cuda", is_ood: bool = False):
    device = torch.device(device_name if torch.cuda.is_available() else "cpu")
    
    # Load checkpoint
    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)
    arch_name = ckpt.get("architecture", "mobilenet_v3_small")
    pretrained = ckpt.get("pretrained", ckpt.get("weights_mode") == "imagenet_transfer")
    
    model = create_model(arch_name, num_classes=len(CANONICAL_CLASSES), pretrained=pretrained)
    model.load_state_dict(ckpt["model_state_dict"])
    model = model.to(device)
    model.eval()

    eval_trans = get_eval_transforms(image_size)
    dataset = CropDoctorDataset(manifest_path, transform=eval_trans, is_ood=is_ood, preload=False)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=False, num_workers=0)

    all_logits = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for inputs, targets in dataloader:
            inputs = inputs.to(device)
            logits = model(inputs)
            probs = F.softmax(logits, dim=1)
            all_logits.append(logits.cpu())
            all_probs.append(probs.cpu())
            all_targets.extend(targets.numpy())

    all_logits = torch.cat(all_logits, dim=0)
    all_probs = torch.cat(all_probs, dim=0).numpy()
    all_targets = np.array(all_targets)
    all_preds = np.argmax(all_probs, axis=1)
    confidences = np.max(all_probs, axis=1)

    thresholds = [0.50, 0.60, 0.70, 0.80]
    total_samples = len(all_targets)

    if is_ood or (all_targets == -1).all():
        # OOD evaluation: measures false positive rate, rejection rate, mean confidence & entropy
        rejection_metrics = {}
        for thresh in thresholds:
            accepted = confidences >= thresh
            num_accepted = int(np.sum(accepted))
            rej_rate = float((total_samples - num_accepted) / total_samples)
            fpr = float(num_accepted / total_samples)
            rejection_metrics[f"thresh_{thresh:.2f}"] = {
                "accepted_count": num_accepted,
                "rejection_rate": round(rej_rate, 4),
                "false_positive_rate": round(fpr, 4)
            }
        
        eps = 1e-9
        entropies = -np.sum(all_probs * np.log(all_probs + eps), axis=1)
        
        results = {
            "checkpoint": str(checkpoint_path),
            "manifest": str(manifest_path),
            "is_ood": True,
            "total_samples": total_samples,
            "mean_confidence": round(float(np.mean(confidences)), 4),
            "mean_entropy": round(float(np.mean(entropies)), 4),
            "ood_rejection_metrics": rejection_metrics,
            "predictions_sample": [
                {
                    "idx": i,
                    "top_pred_class": IDX_TO_CLASS[all_preds[i]],
                    "confidence": round(float(confidences[i]), 4)
                }
                for i in range(min(10, total_samples))
            ]
        }
        return results

    # In-Distribution / Standard Evaluation
    # Core Metrics
    top1_acc = float(accuracy_score(all_targets, all_preds))
    top3_acc = float(compute_top_k_accuracy(all_logits, all_targets, k=3))
    macro_f1 = float(f1_score(all_targets, all_preds, average="macro", zero_division=0))
    ece, ece_bins = compute_ece(all_probs, all_targets)

    class_indices = list(range(len(CANONICAL_CLASSES)))
    per_class_f1 = f1_score(all_targets, all_preds, labels=class_indices, average=None, zero_division=0).tolist()
    per_class_prec = precision_score(all_targets, all_preds, labels=class_indices, average=None, zero_division=0).tolist()
    per_class_rec = recall_score(all_targets, all_preds, labels=class_indices, average=None, zero_division=0).tolist()
    cm = confusion_matrix(all_targets, all_preds, labels=class_indices).tolist()

    # Selective Accuracy at Thresholds
    selective_metrics = {}
    for thresh in thresholds:
        accepted = confidences >= thresh
        num_accepted = int(np.sum(accepted))
        rejection_rate = float((total_samples - num_accepted) / total_samples)
        if num_accepted > 0:
            sel_acc = float(accuracy_score(all_targets[accepted], all_preds[accepted]))
        else:
            sel_acc = 0.0
        selective_metrics[f"thresh_{thresh:.2f}"] = {
            "accepted_count": num_accepted,
            "rejection_rate": round(rejection_rate, 4),
            "selective_accuracy": round(sel_acc, 4)
        }

    # Failure cases (sample of up to 10 worst errors)
    failures = []
    for idx in range(len(all_targets)):
        if all_preds[idx] != all_targets[idx]:
            rec = dataset.get_record(idx)
            failures.append({
                "filename": rec.get("filename", ""),
                "filepath": rec.get("filepath", ""),
                "true_class": IDX_TO_CLASS[all_targets[idx]],
                "pred_class": IDX_TO_CLASS[all_preds[idx]],
                "confidence": round(float(confidences[idx]), 4)
            })

    # Sort failures by confidence (highest confidence mistakes first)
    failures.sort(key=lambda x: x["confidence"], reverse=True)

    results = {
        "checkpoint": str(checkpoint_path),
        "manifest": str(manifest_path),
        "total_samples": len(all_targets),
        "top1_accuracy": round(top1_acc, 4),
        "top3_accuracy": round(top3_acc, 4),
        "macro_f1": round(macro_f1, 4),
        "ece": round(ece, 4),
        "selective_prediction": selective_metrics,
        "per_class_metrics": {
            CANONICAL_CLASSES[i]: {
                "f1": round(per_class_f1[i], 4),
                "precision": round(per_class_prec[i], 4),
                "recall": round(per_class_rec[i], 4)
            }
            for i in range(len(CANONICAL_CLASSES))
        },
        "confusion_matrix": cm,
        "failure_count": len(failures),
        "worst_failures_sample": failures[:15]
    }

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ckpt", type=str, required=True)
    parser.add_argument("--manifest", type=str, required=True)
    parser.add_argument("--size", type=int, default=224)
    parser.add_argument("--ood", action="store_true")
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()

    res = evaluate_checkpoint(args.ckpt, args.manifest, image_size=args.size, is_ood=args.ood)
    print(json.dumps(res, indent=2))
    if args.out:
        with open(args.out, "w") as f:
            json.dump(res, f, indent=2)
