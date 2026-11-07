"""
Independent Audit of Image Quality Guardrails and Out-of-Distribution (OOD) Detection.
Evaluates ImageQualityValidator on real leaves and edge cases.
Computes AUROC, AUPR, and FPR@95%TPR for MSP, Shannon Entropy, and Free Energy.
"""

import sys
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import roc_auc_score, precision_recall_curve, auc

repo_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(repo_root))

from ml.crop_doctor.models.factory import create_model
from ml.crop_doctor.training.dataset import CropDoctorDataset, get_eval_transforms, CANONICAL_CLASSES
from ml.crop_doctor.inference.validator import ImageQualityValidator
from ml.crop_doctor.inference.ood_detector import OODAndAbstentionEngine

def compute_fpr_at_tpr(labels, scores, target_tpr=0.95):
    """
    Computes False Positive Rate at target True Positive Rate (95%).
    labels: 1 for In-Distribution, 0 for OOD.
    scores: higher score = more likely In-Distribution.
    """
    sorted_indices = np.argsort(scores)[::-1]
    sorted_labels = labels[sorted_indices]
    
    total_pos = np.sum(labels == 1)
    total_neg = np.sum(labels == 0)
    
    tp = np.cumsum(sorted_labels == 1)
    fp = np.cumsum(sorted_labels == 0)
    
    tpr = tp / total_pos
    fpr = fp / total_neg
    
    # Find index where tpr >= target_tpr
    idx = np.where(tpr >= target_tpr)[0]
    if len(idx) > 0:
        return float(fpr[idx[0]])
    return 1.0

def audit_image_quality_validator():
    print("\n=======================================================")
    print("1. AUDITING IMAGE QUALITY VALIDATOR")
    print("=======================================================")
    validator = ImageQualityValidator()
    
    # 1. Test on 100 real valid crop images from validation manifest
    with open("ml/crop_doctor/data/splits_v2/val_manifest_v2.json", "r", encoding="utf-8") as f:
        val_records = json.load(f)
        
    real_sample_count = min(100, len(val_records))
    real_passed = 0
    real_rejected = 0
    real_rejection_reasons = []
    
    for r in val_records[:real_sample_count]:
        try:
            with Image.open(r["filepath"]) as img:
                res = validator.validate(img)
                if res["is_acceptable"]:
                    real_passed += 1
                else:
                    real_rejected += 1
                    real_rejection_reasons.extend(res["flags"])
        except Exception:
            pass
            
    false_rejection_rate = real_rejected / real_sample_count
    print(f"Real Crop Foliage Validation (N={real_sample_count}):")
    print(f"  Accepted: {real_passed} ({real_passed/real_sample_count*100:.1f}%)")
    print(f"  Rejected (False Rejections): {real_rejected} ({false_rejection_rate*100:.1f}%)")
    if real_rejection_reasons:
        from collections import Counter
        print(f"  False Rejection Flags: {dict(Counter(real_rejection_reasons))}")

    # 2. Test Adversarial / Synthetic Edge Cases
    synthetic_cases = [
        ("tiny_16x16", Image.new("RGB", (16, 16), color=(50, 150, 50)), False, "Tiny 16x16 icon"),
        ("tiny_32x32", Image.new("RGB", (32, 32), color=(50, 150, 50)), False, "Tiny 32x32 thumbnail"),
        ("solid_black", Image.new("RGB", (256, 256), color=(0, 0, 0)), False, "Completely black photo"),
        ("dark_underexposed", Image.new("RGB", (256, 256), color=(12, 14, 10)), False, "Very dark night photo"),
        ("solid_white", Image.new("RGB", (256, 256), color=(255, 255, 255)), False, "Overexposed washed out"),
        ("pure_soil_brown", Image.new("RGB", (256, 256), color=(101, 67, 33)), False, "Pure dry field soil"),
        ("blue_sky", Image.new("RGB", (256, 256), color=(135, 206, 235)), False, "Pure open sky"),
        ("extreme_aspect_ratio", Image.new("RGB", (600, 50), color=(50, 160, 50)), False, "Panorama strip 12:1"),
        # Adversarial Green Case: Solid green wall / green cloth
        ("solid_green_wall", Image.new("RGB", (256, 256), color=(34, 139, 34)), False, "Solid green painted wall / cloth"),
        ("artificial_green_turf", Image.new("RGB", (256, 256), color=(46, 120, 50)), False, "Synthetic green turf flat"),
    ]
    
    # Add blurred leaf test
    test_leaf_path = "frontend-next/public/images/crop-doctor/powdery-mildew-leaf.jpg"
    if Path(test_leaf_path).exists():
        with Image.open(test_leaf_path) as ref_img:
            synthetic_cases.append(("real_leaf_valid", ref_img.copy(), True, "Real sharp diseased leaf"))
            
            blur_light = ref_img.filter(ImageFilter.GaussianBlur(radius=2))
            synthetic_cases.append(("leaf_mild_blur", blur_light, True, "Mildly blurred leaf"))
            
            blur_heavy = ref_img.filter(ImageFilter.GaussianBlur(radius=8))
            synthetic_cases.append(("leaf_extreme_blur", blur_heavy, False, "Severely blurred leaf"))
            
            dim_leaf = ref_img.point(lambda p: int(p * 0.10))
            synthetic_cases.append(("leaf_darkened", dim_leaf, False, "Heavily underexposed leaf"))

    edge_results = []
    print("\nAdversarial & Edge Cases Test:")
    for name, img, should_accept, desc in synthetic_cases:
        res = validator.validate(img)
        is_pass = res["is_acceptable"]
        is_correct = (is_pass == should_accept)
        edge_results.append({
            "case": name,
            "description": desc,
            "expected_acceptable": should_accept,
            "actual_acceptable": is_pass,
            "flags": res["flags"],
            "blur_score": res["metrics"].get("blur_score"),
            "vegetation_ratio": res["metrics"].get("vegetation_ratio"),
            "test_passed": is_correct
        })
        status_sym = "PASS" if is_correct else "FAIL/LEAK"
        print(f"  [{status_sym}] {name:22}: acceptable={is_pass} (expected {should_accept}) | flags={res['flags']}")

    return {
        "real_leaf_sample_count": real_sample_count,
        "real_passed": real_passed,
        "real_rejected": real_rejected,
        "false_rejection_rate": round(false_rejection_rate, 4),
        "edge_cases": edge_results
    }

def audit_ood_detector(ckpt_path="ml/crop_doctor/artifacts/experiments/exp_c2_efficientnet_b0_pretrained_224/best_model.pth", temp=1.05):
    print("\n=======================================================")
    print(f"2. AUDITING OOD DETECTOR (Model: {Path(ckpt_path).name}, T={temp})")
    print("=======================================================")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    arch = ckpt.get("architecture", "efficientnet_b0")
    pretrained = ckpt.get("pretrained", True)
    
    model = create_model(arch, num_classes=len(CANONICAL_CLASSES), pretrained=pretrained)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device).eval()
    
    eval_trans = get_eval_transforms(224)
    
    # 1. In-Distribution: Validation Dataset (826 images)
    val_ds = CropDoctorDataset("ml/crop_doctor/data/splits_v2/val_manifest_v2.json", transform=eval_trans, preload=False)
    val_loader = DataLoader(val_ds, batch_size=32, shuffle=False)
    
    # 2. Out-of-Distribution: OOD Test Dataset (300 images)
    ood_ds = CropDoctorDataset("ml/crop_doctor/data/splits/ood_test_manifest.json", transform=eval_trans, is_ood=True, preload=False)
    ood_loader = DataLoader(ood_ds, batch_size=32, shuffle=False)
    
    def extract_scores(loader):
        all_logits = []
        with torch.no_grad():
            for inputs, _ in loader:
                inputs = inputs.to(device)
                logits = model(inputs)
                all_logits.append(logits.cpu())
        logits = torch.cat(all_logits, dim=0)
        scaled_logits = logits / temp
        probs = F.softmax(scaled_logits, dim=1).numpy()
        
        # MSP: higher means more in-distribution
        msp = np.max(probs, axis=1)
        
        # Shannon Entropy: lower means more in-distribution -> score = -entropy
        eps = 1e-12
        entropy = -np.sum(probs * np.log(probs + eps), axis=1)
        neg_entropy = -entropy
        
        # Free Energy: E(x) = -T * logsumexp(logits / T). Lower E(x) = more in-distribution -> score = -E(x)
        # Note: score = logsumexp(logits / T)
        energy_scores = []
        for i in range(len(scaled_logits)):
            lse = torch.logsumexp(scaled_logits[i], dim=-1).item()
            energy_scores.append(float(lse)) # Higher LSE = Lower Energy = More In-Distribution
        neg_energy = np.array(energy_scores)
        
        return msp, neg_entropy, neg_energy, probs
        
    val_msp, val_negent, val_lse, _ = extract_scores(val_loader)
    ood_msp, ood_negent, ood_lse, _ = extract_scores(ood_loader)
    
    # Ground truth labels: 1 for In-Distribution, 0 for OOD
    labels = np.concatenate([np.ones(len(val_msp)), np.zeros(len(ood_msp))])
    
    score_types = {
        "Maximum_Softmax_Probability (MSP)": np.concatenate([val_msp, ood_msp]),
        "Negative_Shannon_Entropy": np.concatenate([val_negent, ood_negent]),
        "Energy_Score (Negative Free Energy / LogSumExp)": np.concatenate([val_lse, ood_lse])
    }
    
    ood_metrics = {}
    for name, scores in score_types.items():
        auroc = float(roc_auc_score(labels, scores))
        
        # AUPR-In (ID as positive class)
        p_in, r_in, _ = precision_recall_curve(labels, scores)
        aupr_in = float(auc(r_in, p_in))
        
        # AUPR-Out (OOD as positive class)
        p_out, r_out, _ = precision_recall_curve(1 - labels, -scores)
        aupr_out = float(auc(r_out, p_out))
        
        # FPR@95%TPR
        fpr95 = compute_fpr_at_tpr(labels, scores, target_tpr=0.95)
        
        ood_metrics[name] = {
            "AUROC": round(auroc, 4),
            "AUPR_In": round(aupr_in, 4),
            "AUPR_Out": round(aupr_out, 4),
            "FPR_at_95TPR": round(fpr95, 4)
        }
        
        print(f"\nMethod: {name}")
        print(f"  AUROC:      {auroc*100:6.2f}%")
        print(f"  AUPR-In:    {aupr_in*100:6.2f}%")
        print(f"  AUPR-Out:   {aupr_out*100:6.2f}%")
        print(f"  FPR@95%TPR: {fpr95*100:6.2f}% (Lower is better)")

    return ood_metrics

if __name__ == "__main__":
    val_res = audit_image_quality_validator()
    ood_res = audit_ood_detector()
    
    out_dir = Path("ml/crop_doctor/artifacts/evaluations/audit")
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "guardrails_and_ood_audit.json", "w", encoding="utf-8") as f:
        json.dump({"validator_audit": val_res, "ood_audit": ood_res}, f, indent=2)
    print("\nSaved guardrails and OOD audit to ml/crop_doctor/artifacts/evaluations/audit/guardrails_and_ood_audit.json")
