"""Phase 3B Per-Sample Prediction & Error Analysis Pipeline.

Analyzes the FROZEN real_world_test split (975 images) using Phase 3A trained models:
1. MobileNetV3-Small (temp = 1.25)
2. EfficientNetV2-S (temp = 1.10)

Performs CPU-based sequential inference, temperature scaling, error analysis,
and generates JSON artifacts for both models.
"""

import os
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import transforms, datasets, models
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any
from collections import defaultdict
from sklearn.metrics import precision_recall_fscore_support, accuracy_score

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
MODEL_DIR = BASE_DIR / "models" / "v3a"
REAL_WORLD_DIR = DATASET_DIR / "real_world_test"

IMAGE_SIZE = (224, 224)

# Phase 3A Frozen Calibration Temperatures
MODEL_CONFIGS = [
    {
        "model_name": "mobilenet_v3_small",
        "pth_file": "mobilenet_v3_small_best.pth",
        "temperature": 1.25,
        "out_json": "phase3b_mobilenet_v3_small_predictions.json"
    },
    {
        "model_name": "efficientnet_v2_s",
        "pth_file": "efficientnet_v2_s_best.pth",
        "temperature": 1.10,
        "out_json": "phase3b_efficientnet_v2_s_predictions.json"
    }
]

eval_transform = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def load_model(model_name: str, pth_path: Path, num_classes: int = 15) -> nn.Module:
    """Loads Phase 3A PyTorch model architecture and weights."""
    if model_name == "mobilenet_v3_small":
        model = models.mobilenet_v3_small(weights=None)
        in_feat = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_feat, num_classes)
    elif model_name == "efficientnet_v2_s":
        model = models.efficientnet_v2_s(weights=None)
        in_feat = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_feat, num_classes)
    else:
        raise ValueError(f"Unknown model name {model_name}")

    if not pth_path.exists():
        raise FileNotFoundError(f"Checkpoint not found: {pth_path}")

    model.load_state_dict(torch.load(pth_path, map_location="cpu"))
    model.eval()
    return model


def analyze_model_predictions(cfg: Dict[str, Any], dataset: datasets.ImageFolder, class_names: List[str]):
    model_name = cfg["model_name"]
    pth_path = MODEL_DIR / cfg["pth_file"]
    temp = cfg["temperature"]
    out_path = MODEL_DIR / cfg["out_json"]

    print(f"\n==================================================")
    print(f"Analyzing {model_name} on real_world_test (CPU)")
    print(f"Temperature: {temp}")
    print(f"==================================================")

    model = load_model(model_name, pth_path, len(class_names))

    # Sequential inference over all 975 real_world_test samples
    loader = DataLoader(dataset, batch_size=1, shuffle=False, num_workers=0)

    per_sample_records = []
    y_true_list = []
    y_pred_list = []
    confusion_pair_counts = defaultdict(int)

    with torch.no_grad():
        for idx, (input_tensor, target_tensor) in enumerate(loader):
            img_path, true_idx = dataset.samples[idx]
            rel_path = Path(img_path).relative_to(DATASET_DIR).as_posix()
            true_class = class_names[true_idx]

            # Raw logits and probabilities
            raw_logits = model(input_tensor)
            raw_probs_t = F.softmax(raw_logits, dim=1)[0]
            raw_probs = [round(float(p), 6) for p in raw_probs_t.numpy()]

            # Temperature calibrated logits and probabilities
            calibrated_logits = raw_logits / temp
            calibrated_probs_t = F.softmax(calibrated_logits, dim=1)[0]
            calibrated_probs = [round(float(p), 6) for p in calibrated_probs_t.numpy()]

            # Predicted class index and top-3
            pred_idx = int(torch.argmax(raw_logits, dim=1).item())
            top3_indices = torch.topk(raw_logits, k=3, dim=1).indices[0].tolist()
            top3_classes = [class_names[i] for i in top3_indices]

            pred_class = class_names[pred_idx]
            raw_conf = raw_probs[pred_idx]
            cal_conf = calibrated_probs[pred_idx]
            is_correct = bool(pred_idx == true_idx)

            y_true_list.append(true_idx)
            y_pred_list.append(pred_idx)

            if not is_correct:
                confusion_pair_counts[(true_class, pred_class)] += 1

            per_sample_records.append({
                "sample_index": idx,
                "image_path": rel_path,
                "true_class": true_class,
                "true_class_index": true_idx,
                "predicted_class": pred_class,
                "predicted_class_index": pred_idx,
                "top_3_classes": top3_classes,
                "top_3_indices": top3_indices,
                "raw_confidence": raw_conf,
                "calibrated_confidence": cal_conf,
                "raw_probabilities": raw_probs,
                "calibrated_probabilities": calibrated_probs,
                "is_correct": is_correct
            })

    # Summary Metrics Calculation
    y_true_np = np.array(y_true_list)
    y_pred_np = np.array(y_pred_list)
    overall_acc = round(float(accuracy_score(y_true_np, y_pred_np)), 4)

    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true_np, y_pred_np, average="macro", zero_division=0)
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(y_true_np, y_pred_np, average="weighted", zero_division=0)
    per_p, per_r, per_f1, per_supp = precision_recall_fscore_support(y_true_np, y_pred_np, labels=list(range(len(class_names))), zero_division=0)

    per_class_metrics = {}
    for i, name in enumerate(class_names):
        per_class_metrics[name] = {
            "precision": round(float(per_p[i]), 4),
            "recall": round(float(per_r[i]), 4),
            "f1_score": round(float(per_f1[i]), 4),
            "support": int(per_supp[i])
        }

    # Error analysis subsets
    high_conf_wrong = [
        rec for rec in per_sample_records
        if (not rec["is_correct"]) and (rec["calibrated_confidence"] >= 0.60)
    ]

    low_conf_correct = [
        rec for rec in per_sample_records
        if rec["is_correct"] and (rec["calibrated_confidence"] < 0.35)
    ]

    # Confusion pairs list
    sorted_confusion = sorted(
        confusion_pair_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )
    confusion_pairs = [
        {
            "true_class": pair[0],
            "predicted_class": pair[1],
            "count": cnt
        }
        for pair, cnt in sorted_confusion
    ]

    report = {
        "model_name": model_name,
        "temperature": temp,
        "dataset_split": "real_world_test",
        "summary": {
            "total_samples": len(per_sample_records),
            "correct_samples": int(np.sum(y_true_np == y_pred_np)),
            "accuracy": overall_acc,
            "macro_precision": round(float(macro_p), 4),
            "macro_recall": round(float(macro_r), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_f1": round(float(weighted_f1), 4),
            "high_confidence_wrong_count": len(high_conf_wrong),
            "low_confidence_correct_count": len(low_conf_correct)
        },
        "per_class_metrics": per_class_metrics,
        "top_confusion_pairs": confusion_pairs,
        "high_confidence_wrong_predictions": high_conf_wrong,
        "low_confidence_correct_predictions": low_conf_correct,
        "predictions": per_sample_records
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Analysis complete for {model_name}!")
    print(f"  - Accuracy: {overall_acc:.4f}")
    print(f"  - Macro F1: {macro_f1:.4f}")
    print(f"  - High-confidence wrong predictions (cal_conf >= 0.60): {len(high_conf_wrong)}")
    print(f"  - Low-confidence correct predictions (cal_conf < 0.35): {len(low_conf_correct)}")
    print(f"Artifact saved to: {out_path}")

    return report


def run_prediction_analysis():
    print("Starting Phase 3B Prediction Analysis on real_world_test...")

    if not REAL_WORLD_DIR.exists():
        raise FileNotFoundError(f"real_world_test directory not found: {REAL_WORLD_DIR}")

    rw_dataset = datasets.ImageFolder(root=str(REAL_WORLD_DIR), transform=eval_transform)
    class_names = rw_dataset.classes
    print(f"Loaded real_world_test dataset with {len(rw_dataset)} samples and {len(class_names)} classes.")

    # Sequential execution: MobileNetV3-Small first, then EfficientNetV2-S
    reports = {}
    for cfg in MODEL_CONFIGS:
        reports[cfg["model_name"]] = analyze_model_predictions(cfg, rw_dataset, class_names)

    print("\nPhase 3B Prediction Analysis Completed Successfully!")
    return reports


if __name__ == "__main__":
    run_prediction_analysis()
