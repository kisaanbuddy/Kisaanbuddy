"""
Independent Audit of Prediction Acceptance, Rejection, Risk, and Coverage.
Evaluates thresholds solely on Validation Data (826 samples) and OOD Data (300 samples).
Computes Per-Class Acceptance, Selective Risk vs Coverage, and Recommends an Operational Threshold.
"""

import sys
import json
from pathlib import Path
import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader

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

def get_model_predictions(ckpt_path, manifest_path, is_ood=False, temperature=1.0, device="cuda"):
    dev = torch.device(device if torch.cuda.is_available() else "cpu")
    ckpt = torch.load(ckpt_path, map_location=dev, weights_only=False)
    arch = ckpt.get("architecture", "mobilenet_v3_small")
    pretrained = ckpt.get("pretrained", ckpt.get("weights_mode") == "imagenet_transfer")
    
    model = create_model(arch, num_classes=len(CANONICAL_CLASSES), pretrained=pretrained)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(dev).eval()
    
    ds = CropDoctorDataset(manifest_path, transform=get_eval_transforms(224), is_ood=is_ood, preload=False)
    loader = DataLoader(ds, batch_size=32, shuffle=False, num_workers=0)
    
    all_logits = []
    all_targets = []
    with torch.no_grad():
        for inputs, targets in loader:
            inputs = inputs.to(dev)
            logits = model(inputs)
            all_logits.append(logits.cpu())
            all_targets.extend(targets.numpy())
            
    logits = torch.cat(all_logits, dim=0)
    scaled_logits = logits / temperature
    probs = F.softmax(scaled_logits, dim=1).numpy()
    targets = np.array(all_targets)
    
    return logits, probs, targets

def main():
    ckpts = {
        "exp_c2_efficientnet_b0": ("ml/crop_doctor/artifacts/experiments/exp_c2_efficientnet_b0_pretrained_224/best_model.pth", 1.05),
        "exp_c1_mobilenet_v3": ("ml/crop_doctor/artifacts/experiments/exp_c1_mobilenet_v3_pretrained_224/best_model.pth", 0.9758),
        "baseline_scratch": ("ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth", 0.9472)
    }
    
    val_manifest = "ml/crop_doctor/data/splits_v2/val_manifest_v2.json"
    ood_manifest = "ml/crop_doctor/data/splits/ood_test_manifest.json"
    
    thresholds = [0.40, 0.50, 0.55, 0.58, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95]
    
    report = {}
    
    for m_id, (ckpt_path, temp) in ckpts.items():
        print(f"\n=======================================================")
        print(f"EVALUATING RISK-COVERAGE: {m_id} (Temp={temp})")
        print(f"=======================================================")
        
        _, val_probs, val_targets = get_model_predictions(ckpt_path, val_manifest, temperature=temp)
        _, ood_probs, _ = get_model_predictions(ckpt_path, ood_manifest, is_ood=True, temperature=temp)
        
        val_confs = np.max(val_probs, axis=1)
        val_preds = np.argmax(val_probs, axis=1)
        
        ood_confs = np.max(ood_probs, axis=1)
        
        val_total = len(val_targets)
        ood_total = len(ood_confs)
        
        thresh_table = []
        for tau in thresholds:
            # Validation selective metrics
            val_acc_mask = val_confs >= tau
            n_acc = int(np.sum(val_acc_mask))
            n_rej = val_total - n_acc
            cov = n_acc / val_total
            rej_rate = n_rej / val_total
            
            if n_acc > 0:
                correct = int(np.sum(val_targets[val_acc_mask] == val_preds[val_acc_mask]))
                incorrect = n_acc - correct
                sel_acc = correct / n_acc
                sel_risk = incorrect / n_acc
            else:
                correct, incorrect, sel_acc, sel_risk = 0, 0, 0.0, 0.0
                
            # OOD False Acceptance
            ood_acc_mask = ood_confs >= tau
            ood_false_acc_count = int(np.sum(ood_acc_mask))
            ood_false_acc_rate = ood_false_acc_count / ood_total
            ood_rejection_rate = 1.0 - ood_false_acc_rate
            
            thresh_table.append({
                "threshold": tau,
                "coverage": round(cov, 4),
                "rejection_rate": round(rej_rate, 4),
                "accepted_count": n_acc,
                "rejected_count": n_rej,
                "correct_accepted": correct,
                "incorrect_accepted": incorrect,
                "selective_accuracy": round(sel_acc, 4),
                "selective_risk": round(sel_risk, 4),
                "ood_false_acceptance_count": ood_false_acc_count,
                "ood_false_acceptance_rate": round(ood_false_acc_rate, 4),
                "ood_rejection_rate": round(ood_rejection_rate, 4)
            })
            
            print(f"Tau {tau:.2f} | Cov: {cov*100:5.1f}% | SelAcc: {sel_acc*100:5.2f}% | "
                  f"Risk: {sel_risk*100:5.2f}% (Err {incorrect}/{n_acc}) | "
                  f"OOD False Acc: {ood_false_acc_rate*100:5.1f}% (Leak {ood_false_acc_count}/{ood_total})")
                  
        # Per-Class Acceptance at Tau=0.60, 0.70, 0.80 on Validation Set
        per_class_acceptance = {}
        for eval_tau in [0.60, 0.70, 0.80]:
            per_class_acceptance[f"tau_{eval_tau:.2f}"] = {}
            for c_idx, c_name in enumerate(CANONICAL_CLASSES):
                class_mask = (val_targets == c_idx)
                c_total = int(np.sum(class_mask))
                if c_total > 0:
                    c_confs = val_confs[class_mask]
                    c_preds = val_preds[class_mask]
                    c_acc_mask = c_confs >= eval_tau
                    c_accepted = int(np.sum(c_acc_mask))
                    c_correct = int(np.sum(c_preds[c_acc_mask] == c_idx))
                    per_class_acceptance[f"tau_{eval_tau:.2f}"][c_name] = {
                        "total": c_total,
                        "accepted": c_accepted,
                        "acceptance_rate": round(c_accepted / c_total, 4),
                        "correct": c_correct,
                        "selective_acc": round(c_correct / c_accepted, 4) if c_accepted > 0 else 0.0
                    }
                    
        report[m_id] = {
            "temperature": temp,
            "threshold_sweep": thresh_table,
            "per_class_acceptance": per_class_acceptance
        }
        
    out_file = Path("ml/crop_doctor/artifacts/evaluations/audit/selective_risk_audit.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"\nSaved selective prediction audit to {out_file}")

if __name__ == "__main__":
    main()
