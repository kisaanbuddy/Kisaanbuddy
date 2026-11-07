import os
import sys
import json
import argparse
from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    top_k_accuracy_score
)

# Ensure root in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from ml.crop_doctor.models.factory import create_model
from ml.crop_doctor.training.dataset import (
    CropDoctorDataset,
    get_eval_transforms,
    CANONICAL_CLASSES,
    IDX_TO_CLASS
)
from ml.crop_doctor.calibration.temperature_scaling import ModelWithTemperature, compute_ece

def run_evaluation(
    checkpoint_path: str = "ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth",
    device_name: str = "cpu",
    output_dir: str = "ml/crop_doctor/evaluation/results"
):
    print("==================================================================")
    print("Running Full Exhaustive Crop Doctor Model Evaluation")
    print(f"Checkpoint: {checkpoint_path}")
    print("==================================================================")
    
    device = torch.device(device_name)
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Load trained from-scratch checkpoint
    ckpt = torch.load(checkpoint_path, map_location=device)
    arch_name = ckpt["architecture"]
    model = create_model(arch_name, num_classes=len(CANONICAL_CLASSES))
    model.load_state_dict(ckpt["model_state_dict"])
    model = model.to(device)
    model.eval()
    print(f"Loaded {arch_name} checkpoint (Best Epoch: {ckpt['epoch']}, Val F1: {ckpt['val_macro_f1']:.4f})")
    
    # 2. Temperature Calibration on Validation Set
    val_manifest = "ml/crop_doctor/data/splits/val_manifest.json"
    val_ds = CropDoctorDataset(val_manifest, transform=get_eval_transforms())
    val_loader = DataLoader(val_ds, batch_size=32, shuffle=False)
    
    calibrated_model = ModelWithTemperature(model)
    opt_temp, nll_before, nll_after = calibrated_model.set_temperature(val_loader, device=device_name)
    calibrated_model.eval()
    
    eval_splits = {
        "internal_test": "ml/crop_doctor/data/splits/internal_test_manifest.json",
        "field_holdout": "ml/crop_doctor/data/splits/field_holdout_manifest.json",
        "ood_test": "ml/crop_doctor/data/splits/ood_test_manifest.json"
    }
    
    full_report = {
        "checkpoint": checkpoint_path,
        "architecture": arch_name,
        "temperature": round(opt_temp, 4),
        "val_nll_before": round(nll_before, 4),
        "val_nll_after": round(nll_after, 4),
        "splits": {}
    }
    
    for split_name, manifest_file in eval_splits.items():
        is_ood = (split_name == "ood_test")
        ds = CropDoctorDataset(manifest_file, transform=get_eval_transforms(), is_ood=is_ood)
        loader = DataLoader(ds, batch_size=32, shuffle=False)
        print(f"\nEvaluating Split: '{split_name}' ({len(ds)} samples)...")
        
        all_logits = []
        all_probs = []
        all_targets = []
        sample_records = []
        
        with torch.no_grad():
            for i, (inputs, targets) in enumerate(loader):
                inputs = inputs.to(device)
                logits = calibrated_model(inputs)
                probs = torch.softmax(logits, dim=1)
                
                all_logits.append(logits.cpu())
                all_probs.append(probs.cpu())
                all_targets.extend(targets.numpy())
                
                for idx_in_batch in range(inputs.size(0)):
                    global_idx = i * 32 + idx_in_batch
                    rec = ds.get_record(global_idx)
                    p = probs[idx_in_batch].cpu().numpy()
                    top3_idx = np.argsort(p)[::-1][:3]
                    sample_records.append({
                        "filename": rec["filename"],
                        "source": rec["source"],
                        "true_class": rec["canonical_class"],
                        "pred_class": IDX_TO_CLASS[top3_idx[0]],
                        "confidence": round(float(p[top3_idx[0]]), 4),
                        "top3": [
                            {"class": IDX_TO_CLASS[idx], "prob": round(float(p[idx]), 4)}
                            for idx in top3_idx
                        ],
                        "quality_flags": rec.get("quality_flags", [])
                    })

        all_logits = torch.cat(all_logits)
        all_probs = torch.cat(all_probs)
        all_preds = torch.argmax(all_probs, dim=1).numpy()
        
        if not is_ood:
            all_targets = np.array(all_targets)
            top1_acc = accuracy_score(all_targets, all_preds)
            balanced_acc = balanced_accuracy_score(all_targets, all_preds)
            top3_acc = top_k_accuracy_score(all_targets, all_probs.numpy(), k=3, labels=list(range(len(CANONICAL_CLASSES))))
            
            p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(all_targets, all_preds, average="macro", zero_division=0)
            p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(all_targets, all_preds, average="weighted", zero_division=0)
            
            ece_score = compute_ece(all_probs, torch.tensor(all_targets))
            
            # Per class breakdown
            prec_cls, rec_cls, f1_cls, supp_cls = precision_recall_fscore_support(
                all_targets, all_preds, labels=list(range(len(CANONICAL_CLASSES))), zero_division=0
            )
            
            cm = confusion_matrix(all_targets, all_preds, labels=list(range(len(CANONICAL_CLASSES))))
            
            class_metrics = {}
            for idx, c_name in enumerate(CANONICAL_CLASSES):
                class_metrics[c_name] = {
                    "precision": round(float(prec_cls[idx]), 4),
                    "recall": round(float(rec_cls[idx]), 4),
                    "f1": round(float(f1_cls[idx]), 4),
                    "support": int(supp_cls[idx])
                }
                
            split_summary = {
                "num_samples": len(ds),
                "top1_accuracy": round(float(top1_acc), 4),
                "top3_accuracy": round(float(top3_acc), 4),
                "balanced_accuracy": round(float(balanced_acc), 4),
                "macro_precision": round(float(p_macro), 4),
                "macro_recall": round(float(r_macro), 4),
                "macro_f1": round(float(f1_macro), 4),
                "weighted_f1": round(float(f1_weighted), 4),
                "ece": round(float(ece_score), 4),
                "class_metrics": class_metrics,
                "confusion_matrix": cm.tolist()
            }
            
            print(f"Results for '{split_name}':")
            print(f"  Top-1 Accuracy: {top1_acc*100:.2f}% | Top-3 Accuracy: {top3_acc*100:.2f}%")
            print(f"  Macro-F1: {f1_macro:.4f} | Balanced Acc: {balanced_acc*100:.2f}% | ECE: {ece_score:.4f}")
            
        else:
            # OOD Analysis: Measure max confidence distribution and rejection under thresholds
            max_confidences = torch.max(all_probs, dim=1)[0].numpy()
            rejection_rates = {
                "reject_at_0.50": round(float(np.mean(max_confidences < 0.50)), 4),
                "reject_at_0.60": round(float(np.mean(max_confidences < 0.60)), 4),
                "reject_at_0.70": round(float(np.mean(max_confidences < 0.70)), 4),
                "mean_ood_confidence": round(float(np.mean(max_confidences)), 4)
            }
            split_summary = {
                "num_samples": len(ds),
                "rejection_behavior": rejection_rates,
                "notes": "Real agricultural non-target foliage (Blueberry, Peach, Cherry, Grape, etc.)"
            }
            print(f"OOD Rejection Analysis:")
            print(f"  Mean OOD Confidence: {rejection_rates['mean_ood_confidence']:.4f}")
            print(f"  Rejected at >=0.60 uncertainty threshold: {rejection_rates['reject_at_0.60']*100:.2f}%")

        full_report["splits"][split_name] = split_summary
        
        # Save sample predictions
        with open(out_path / f"{split_name}_predictions.json", "w", encoding="utf-8") as f:
            json.dump(sample_records, f, indent=2)

    # Save overall evaluation report
    report_file = out_path / "full_evaluation_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(full_report, f, indent=2)
        
    print(f"\nEvaluation Complete! Full report written to: {report_file}")
    return full_report

if __name__ == "__main__":
    run_evaluation()
