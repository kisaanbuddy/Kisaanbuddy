"""Phase 4B Controlled Retraining Experiment: Focal Loss vs Cross-Entropy Baseline.

Trains and evaluates:
1. MobileNetV3-Small (Focal Loss, gamma=2.0)
2. EfficientNetV2-S (Focal Loss, gamma=2.0)

Performs controlled retraining on the Phase 3A dataset (3,570 train images),
applies temperature scaling post-training on Validation set,
and benchmarks performance against the frozen Phase 3A baseline on:
- Validation set (765 images)
- Test set (765 images)
- Frozen real_world_test holdout (975 images)

Outputs JSON and Markdown comparison reports in ml/platform/models/v4/.
"""

import os
import time
import json
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import transforms, datasets, models
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
MODEL_V3A_DIR = BASE_DIR / "models" / "v3a"
MODEL_V4_DIR = BASE_DIR / "models" / "v4"
MODEL_V4_DIR.mkdir(parents=True, exist_ok=True)

BATCH_SIZE = 32
LEARNING_RATE = 1e-3
WEIGHT_DECAY = 1e-4
IMAGE_SIZE = (224, 224)
SEED = 42
FOCAL_GAMMA = 2.0

# Model Epoch Configs (MobileNetV3-Small: 10 epochs, EfficientNetV2-S: 3 epochs for CPU feasibility)
MODEL_SPECS = {
    "mobilenet_v3_small": {"epochs": 10},
    "efficientnet_v2_s": {"epochs": 3}
}

# Set deterministic random seeds
torch.manual_seed(SEED)
np.random.seed(SEED)

# Data Transforms (identical to Phase 3A baseline)
train_transform = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

eval_transform = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


class FocalLoss(nn.Module):
    """Multi-class Focal Loss: FL(p_t) = - (1 - p_t)^gamma * log(p_t)"""
    def __init__(self, gamma: float = 2.0, reduction: str = 'mean'):
        super().__init__()
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        log_probs = F.log_softmax(inputs, dim=1)
        probs = torch.exp(log_probs)

        target_probs = probs.gather(1, targets.unsqueeze(1)).squeeze(1)
        target_log_probs = log_probs.gather(1, targets.unsqueeze(1)).squeeze(1)

        focal_weight = (1.0 - target_probs) ** self.gamma
        loss = -focal_weight * target_log_probs

        if self.reduction == 'mean':
            return loss.mean()
        elif self.reduction == 'sum':
            return loss.sum()
        else:
            return loss


def load_dataset_loaders() -> Tuple[Dict[str, DataLoader], List[str]]:
    loaders = {}
    class_names = []

    for split in ["train", "val", "test", "real_world_test"]:
        split_dir = DATASET_DIR / split
        transform = train_transform if split == "train" else eval_transform
        ds = datasets.ImageFolder(root=str(split_dir), transform=transform)
        shuffle = True if split == "train" else False
        loaders[split] = DataLoader(ds, batch_size=BATCH_SIZE, shuffle=shuffle, num_workers=0)
        if split == "train":
            class_names = ds.classes

    return loaders, class_names


def compute_ece(probs: np.ndarray, y_true: np.ndarray, n_bins: int = 10) -> float:
    """Computes Expected Calibration Error (ECE)."""
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    accuracies = (predictions == y_true)

    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0

    for i in range(n_bins):
        bin_lower, bin_upper = bin_boundaries[i], bin_boundaries[i + 1]
        in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
        prop_in_bin = np.mean(in_bin)

        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(accuracies[in_bin])
            avg_confidence_in_bin = np.mean(confidences[in_bin])
            ece += np.abs(accuracy_in_bin - avg_confidence_in_bin) * prop_in_bin

    return round(float(ece), 4)


def compute_brier(probs: np.ndarray, y_true: np.ndarray, num_classes: int = 15) -> float:
    """Computes multi-class Brier score."""
    one_hot = np.zeros((len(y_true), num_classes))
    one_hot[np.arange(len(y_true)), y_true] = 1.0
    brier = np.mean(np.sum((probs - one_hot) ** 2, axis=1))
    return round(float(brier), 4)


def evaluate_split_full(model: nn.Module, loader: DataLoader, class_names: List[str], temp: float = 1.0) -> Dict[str, Any]:
    model.eval()
    y_true = []
    y_pred = []
    all_raw_probs = []
    all_cal_probs = []
    per_sample_details = []

    with torch.no_grad():
        for idx, (inputs, targets) in enumerate(loader):
            raw_logits = model(inputs)
            raw_probs_t = F.softmax(raw_logits, dim=1)

            calibrated_logits = raw_logits / temp
            calibrated_probs_t = F.softmax(calibrated_logits, dim=1)

            _, preds_t = raw_logits.max(1)

            for i in range(inputs.size(0)):
                sample_idx = len(y_true)
                img_path, true_lbl = loader.dataset.samples[sample_idx]
                rel_path = Path(img_path).relative_to(DATASET_DIR).as_posix()

                r_probs = [round(float(p), 6) for p in raw_probs_t[i].numpy()]
                c_probs = [round(float(p), 6) for p in calibrated_probs_t[i].numpy()]

                p_idx = int(preds_t[i].item())
                t_idx = int(targets[i].item())

                top3_indices = torch.topk(raw_logits[i], k=3).indices.tolist()
                top3_classes = [class_names[k] for k in top3_indices]

                raw_conf = r_probs[p_idx]
                cal_conf = c_probs[p_idx]
                is_correct = bool(p_idx == t_idx)

                y_true.append(t_idx)
                y_pred.append(p_idx)
                all_raw_probs.append(r_probs)
                all_cal_probs.append(c_probs)

                per_sample_details.append({
                    "sample_index": sample_idx,
                    "image_path": rel_path,
                    "true_class": class_names[t_idx],
                    "true_class_index": t_idx,
                    "predicted_class": class_names[p_idx],
                    "predicted_class_index": p_idx,
                    "top_3_classes": top3_classes,
                    "top_3_indices": top3_indices,
                    "raw_confidence": raw_conf,
                    "calibrated_confidence": cal_conf,
                    "raw_probabilities": r_probs,
                    "calibrated_probabilities": c_probs,
                    "is_correct": is_correct
                })

    y_true_np = np.array(y_true)
    y_pred_np = np.array(y_pred)
    all_cal_probs_np = np.array(all_cal_probs)

    acc = float(accuracy_score(y_true_np, y_pred_np))

    # Top-3 accuracy
    top3_count = 0
    for sample in per_sample_details:
        if sample["true_class_index"] in sample["top_3_indices"]:
            top3_count += 1
    top3_acc = float(top3_count / len(y_true_np))

    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true_np, y_pred_np, average="macro", zero_division=0)
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(y_true_np, y_pred_np, average="weighted", zero_division=0)
    per_p, per_r, per_f1, per_supp = precision_recall_fscore_support(y_true_np, y_pred_np, labels=list(range(len(class_names))), zero_division=0)

    ece = compute_ece(all_cal_probs_np, y_true_np)
    brier = compute_brier(all_cal_probs_np, y_true_np, len(class_names))

    per_class_res = {}
    for i, name in enumerate(class_names):
        per_class_res[name] = {
            "precision": round(float(per_p[i]), 4),
            "recall": round(float(per_r[i]), 4),
            "f1_score": round(float(per_f1[i]), 4),
            "support": int(per_supp[i])
        }

    # Error analysis counts
    high_conf_wrong = [s for s in per_sample_details if (not s["is_correct"]) and (s["calibrated_confidence"] >= 0.60)]
    low_conf_correct = [s for s in per_sample_details if s["is_correct"] and (s["calibrated_confidence"] < 0.35)]

    # Confusion matrix
    conf_mat = confusion_matrix(y_true_np, y_pred_np, labels=list(range(len(class_names)))).tolist()

    return {
        "summary": {
            "total_samples": len(per_sample_details),
            "correct_samples": int(np.sum(y_true_np == y_pred_np)),
            "accuracy": round(acc, 4),
            "top1_accuracy": round(acc, 4),
            "top3_accuracy": round(top3_acc, 4),
            "macro_precision": round(float(macro_p), 4),
            "macro_recall": round(float(macro_r), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_f1": round(float(weighted_f1), 4),
            "ece": ece,
            "brier_score": brier,
            "high_confidence_wrong_count": len(high_conf_wrong),
            "low_confidence_correct_count": len(low_conf_correct)
        },
        "per_class_metrics": per_class_res,
        "confusion_matrix": conf_mat,
        "high_confidence_wrong_predictions": high_conf_wrong,
        "low_confidence_correct_predictions": low_conf_correct,
        "per_sample_predictions": per_sample_details
    }


def analyze_failure_families(eval_res: Dict[str, Any], class_names: List[str]) -> Dict[str, Any]:
    """Extracts confusion metrics for the 5 key Phase 3B failure families."""
    families = [
        ("cotton_leaf_curl", "tomato_leaf_curl"),
        ("wheat_brown_rust", "wheat_yellow_rust"),
        ("potato_early_blight", "tomato_early_blight"),
        ("potato_late_blight", "tomato_late_blight"),
        ("cotton_bacterial_blight", "rice_bacterial_blight")
    ]

    family_results = {}
    preds = eval_res["per_sample_predictions"]
    hc_wrong = eval_res["high_confidence_wrong_predictions"]

    for c1, c2 in families:
        dir1_cnt = sum(1 for s in preds if s["true_class"] == c1 and s["predicted_class"] == c2)
        dir2_cnt = sum(1 for s in preds if s["true_class"] == c2 and s["predicted_class"] == c1)
        tot_confusion = dir1_cnt + dir2_cnt

        hc_cnt = sum(1 for s in hc_wrong if (s["true_class"] == c1 and s["predicted_class"] == c2) or (s["true_class"] == c2 and s["predicted_class"] == c1))

        c1_metrics = eval_res["per_class_metrics"].get(c1, {})
        c2_metrics = eval_res["per_class_metrics"].get(c2, {})

        family_results[f"{c1}_vs_{c2}"] = {
            "class_1": c1,
            "class_2": c2,
            "total_family_confusion": tot_confusion,
            "direction_1_count": {f"{c1} -> {c2}": dir1_cnt},
            "direction_2_count": {f"{c2} -> {c1}": dir2_cnt},
            "high_confidence_wrong_in_family": hc_cnt,
            "class_1_recall": c1_metrics.get("recall", 0.0),
            "class_1_f1": c1_metrics.get("f1_score", 0.0),
            "class_2_recall": c2_metrics.get("recall", 0.0),
            "class_2_f1": c2_metrics.get("f1_score", 0.0)
        }

    return family_results


def train_focal_loss_model(model_name: str, num_classes: int, loaders: Dict[str, DataLoader], class_names: List[str]) -> Dict[str, Any]:
    epochs = MODEL_SPECS[model_name]["epochs"]
    print(f"\n==================================================", flush=True)
    print(f"Training Model with Focal Loss (gamma={FOCAL_GAMMA}, epochs={epochs}): {model_name}", flush=True)
    print(f"==================================================", flush=True)

    if model_name == "mobilenet_v3_small":
        model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        in_feat = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_feat, num_classes)
    elif model_name == "efficientnet_v2_s":
        model = models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.DEFAULT)
        in_feat = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_feat, num_classes)
    else:
        raise ValueError(f"Unknown model name {model_name}")

    criterion = FocalLoss(gamma=FOCAL_GAMMA)
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    start_train_time = time.time()
    best_val_f1 = 0.0
    best_pth_path = MODEL_V4_DIR / f"{model_name}_focal_best.pth"

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        for inputs, targets in loaders["train"]:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * inputs.size(0)

        scheduler.step()
        train_loss = running_loss / len(loaders["train"].dataset)

        val_eval = evaluate_split_full(model, loaders["val"], class_names)
        val_f1 = val_eval["summary"]["macro_f1"]
        val_acc = val_eval["summary"]["accuracy"]
        print(f"Epoch {epoch}/{epochs} - Train Focal Loss: {train_loss:.4f} - Val F1: {val_f1:.4f} - Val Acc: {val_acc:.4f}", flush=True)

        if val_f1 >= best_val_f1:
            best_val_f1 = val_f1
            torch.save(model.state_dict(), best_pth_path)

    train_duration = round(time.time() - start_train_time, 2)
    print(f"Model {model_name} (Focal Loss) Training Completed in {train_duration}s. Best Val F1: {best_val_f1:.4f}", flush=True)

    # Load best checkpoint for evaluation
    model.load_state_dict(torch.load(best_pth_path, map_location="cpu"))
    model.eval()

    # Temperature Calibration Tuning on Val Set (minimizing Cross Entropy / NLL)
    best_temp = 1.0
    best_val_nll = float("inf")
    with torch.no_grad():
        val_logits_list = []
        val_targets_list = []
        for inputs, targets in loaders["val"]:
            val_logits_list.append(model(inputs))
            val_targets_list.append(targets)
        val_logits_t = torch.cat(val_logits_list, dim=0)
        val_targets_t = torch.cat(val_targets_list, dim=0)

        for T in np.linspace(0.5, 3.0, 51):
            nll = F.cross_entropy(val_logits_t / T, val_targets_t).item()
            if nll < best_val_nll:
                best_val_nll = nll
                best_temp = round(float(T), 2)

    print(f"Optimal Calibration Temperature for {model_name} (Focal Loss): {best_temp}", flush=True)

    # Evaluate across splits
    val_res = evaluate_split_full(model, loaders["val"], class_names, temp=1.0)
    test_res_uncal = evaluate_split_full(model, loaders["test"], class_names, temp=1.0)
    test_res_cal = evaluate_split_full(model, loaders["test"], class_names, temp=best_temp)
    rw_res_cal = evaluate_split_full(model, loaders["real_world_test"], class_names, temp=best_temp)

    # Failure family metrics on real_world_test
    rw_families = analyze_failure_families(rw_res_cal, class_names)

    # Save per-sample prediction report JSON for real_world_test
    pred_json_path = MODEL_V4_DIR / f"phase4b_{model_name}_focal_predictions.json"
    pred_report = {
        "model_name": model_name,
        "loss_function": "FocalLoss",
        "focal_gamma": FOCAL_GAMMA,
        "epochs": epochs,
        "temperature": best_temp,
        "dataset_split": "real_world_test",
        "summary": rw_res_cal["summary"],
        "per_class_metrics": rw_res_cal["per_class_metrics"],
        "failure_families": rw_families,
        "high_confidence_wrong_predictions": rw_res_cal["high_confidence_wrong_predictions"],
        "low_confidence_correct_predictions": rw_res_cal["low_confidence_correct_predictions"],
        "predictions": rw_res_cal["per_sample_predictions"]
    }
    with open(pred_json_path, "w", encoding="utf-8") as f:
        json.dump(pred_report, f, indent=2)

    # Safe ONNX Export
    onnx_path = MODEL_V4_DIR / f"{model_name}_focal.onnx"
    onnx_exported = False
    onnx_size_mb = 0.0
    try:
        dummy_in = torch.randn(1, 3, 224, 224)
        torch.onnx.export(
            model, dummy_in, str(onnx_path),
            export_params=True, opset_version=14, do_constant_folding=True,
            input_names=["input"], output_names=["output"],
            dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
            dynamo=False
        )
        onnx_size_mb = round(os.path.getsize(onnx_path) / (1024 * 1024), 2)
        onnx_exported = True
        print(f"Exported ONNX model to {onnx_path} ({onnx_size_mb} MB)", flush=True)
    except Exception as err:
        print(f"ONNX export skipped for {model_name}: {err}", flush=True)

    return {
        "model_name": model_name,
        "loss_function": f"Focal Loss (gamma={FOCAL_GAMMA})",
        "epochs": epochs,
        "training_time_s": train_duration,
        "onnx_exported": onnx_exported,
        "onnx_size_mb": onnx_size_mb,
        "optimal_temperature": best_temp,
        "validation_metrics": val_res["summary"],
        "test_metrics_uncalibrated": test_res_uncal["summary"],
        "test_metrics_calibrated": test_res_cal["summary"],
        "real_world_test_metrics": rw_res_cal["summary"],
        "real_world_failure_families": rw_families,
        "predictions_report_path": str(pred_json_path)
    }


def run_phase4b_experiment():
    print("Starting Phase 4B Controlled Retraining Experiment...", flush=True)

    loaders, class_names = load_dataset_loaders()
    num_classes = len(class_names)

    # Train MobileNetV3-Small with Focal Loss
    mbv3_focal = train_focal_loss_model("mobilenet_v3_small", num_classes, loaders, class_names)

    # Train EfficientNetV2-S with Focal Loss
    effv2_focal = train_focal_loss_model("efficientnet_v2_s", num_classes, loaders, class_names)

    # Load Phase 3A Baseline Report for Direct Comparison
    phase3a_report_path = MODEL_V3A_DIR / "phase3a_benchmark_report.json"
    if not phase3a_report_path.exists():
        raise FileNotFoundError(f"Phase 3A benchmark report not found: {phase3a_report_path}")

    with open(phase3a_report_path, "r", encoding="utf-8") as f:
        phase3a_bench = json.load(f)

    mbv3_p3a = phase3a_bench["models"]["mobilenet_v3_small"]
    effv2_p3a = phase3a_bench["models"]["efficientnet_v2_s"]

    # Load Phase 3B prediction reports for failure family metrics
    mbv3_p3b_pred = json.load(open(MODEL_V3A_DIR / "phase3b_mobilenet_v3_small_predictions.json"))
    effv2_p3b_pred = json.load(open(MODEL_V3A_DIR / "phase3b_efficientnet_v2_s_predictions.json"))

    mbv3_p3b_families = analyze_failure_families({
        "per_sample_predictions": mbv3_p3b_pred["predictions"],
        "high_confidence_wrong_predictions": mbv3_p3b_pred["high_confidence_wrong_predictions"],
        "per_class_metrics": mbv3_p3b_pred["per_class_metrics"]
    }, class_names)

    effv2_p3b_families = analyze_failure_families({
        "per_sample_predictions": effv2_p3b_pred["predictions"],
        "high_confidence_wrong_predictions": effv2_p3b_pred["high_confidence_wrong_predictions"],
        "per_class_metrics": effv2_p3b_pred["per_class_metrics"]
    }, class_names)

    # Construct Comprehensive Comparison JSON
    comparison = {
        "experiment": "Phase 4B - Controlled Focal Loss (gamma=2.0) vs Phase 3A Cross Entropy Baseline",
        "dataset_summary": {
            "num_classes": num_classes,
            "train_samples": len(loaders["train"].dataset),
            "val_samples": len(loaders["val"].dataset),
            "test_samples": len(loaders["test"].dataset),
            "real_world_test_samples": len(loaders["real_world_test"].dataset)
        },
        "models": {
            "mobilenet_v3_small": {
                "phase3a_cross_entropy": {
                    "epochs": 10,
                    "temperature": mbv3_p3a["optimal_temperature"],
                    "test_calibrated": mbv3_p3a["test_metrics_calibrated"],
                    "real_world_test": mbv3_p3a["real_world_test_metrics"],
                    "real_world_high_conf_wrong": mbv3_p3b_pred["summary"]["high_confidence_wrong_count"],
                    "real_world_low_conf_correct": mbv3_p3b_pred["summary"]["low_confidence_correct_count"],
                    "failure_families": mbv3_p3b_families
                },
                "phase4b_focal_loss": {
                    "epochs": mbv3_focal["epochs"],
                    "temperature": mbv3_focal["optimal_temperature"],
                    "test_calibrated": mbv3_focal["test_metrics_calibrated"],
                    "real_world_test": mbv3_focal["real_world_test_metrics"],
                    "real_world_high_conf_wrong": mbv3_focal["real_world_test_metrics"]["high_confidence_wrong_count"],
                    "real_world_low_conf_correct": mbv3_focal["real_world_test_metrics"]["low_confidence_correct_count"],
                    "failure_families": mbv3_focal["real_world_failure_families"]
                },
                "delta_real_world": {
                    "top1_accuracy_diff": round(mbv3_focal["real_world_test_metrics"]["top1_accuracy"] - mbv3_p3a["real_world_test_metrics"]["top1_accuracy"], 4),
                    "macro_f1_diff": round(mbv3_focal["real_world_test_metrics"]["macro_f1"] - mbv3_p3a["real_world_test_metrics"]["macro_f1"], 4),
                    "ece_diff": round(mbv3_focal["real_world_test_metrics"]["ece"] - mbv3_p3a["real_world_test_metrics"]["ece"], 4),
                    "brier_diff": round(mbv3_focal["real_world_test_metrics"]["brier_score"] - mbv3_p3a["real_world_test_metrics"]["brier_score"], 4),
                    "high_conf_wrong_diff": mbv3_focal["real_world_test_metrics"]["high_confidence_wrong_count"] - mbv3_p3b_pred["summary"]["high_confidence_wrong_count"]
                }
            },
            "efficientnet_v2_s": {
                "phase3a_cross_entropy": {
                    "epochs": 10,
                    "temperature": effv2_p3a["optimal_temperature"],
                    "test_calibrated": effv2_p3a["test_metrics_calibrated"],
                    "real_world_test": effv2_p3a["real_world_test_metrics"],
                    "real_world_high_conf_wrong": effv2_p3b_pred["summary"]["high_confidence_wrong_count"],
                    "real_world_low_conf_correct": effv2_p3b_pred["summary"]["low_confidence_correct_count"],
                    "failure_families": effv2_p3b_families
                },
                "phase4b_focal_loss": {
                    "epochs": effv2_focal["epochs"],
                    "temperature": effv2_focal["optimal_temperature"],
                    "test_calibrated": effv2_focal["test_metrics_calibrated"],
                    "real_world_test": effv2_focal["real_world_test_metrics"],
                    "real_world_high_conf_wrong": effv2_focal["real_world_test_metrics"]["high_confidence_wrong_count"],
                    "real_world_low_conf_correct": effv2_focal["real_world_test_metrics"]["low_confidence_correct_count"],
                    "failure_families": effv2_focal["real_world_failure_families"]
                },
                "delta_real_world": {
                    "top1_accuracy_diff": round(effv2_focal["real_world_test_metrics"]["top1_accuracy"] - effv2_p3a["real_world_test_metrics"]["top1_accuracy"], 4),
                    "macro_f1_diff": round(effv2_focal["real_world_test_metrics"]["macro_f1"] - effv2_p3a["real_world_test_metrics"]["macro_f1"], 4),
                    "ece_diff": round(effv2_focal["real_world_test_metrics"]["ece"] - effv2_p3a["real_world_test_metrics"]["ece"], 4),
                    "brier_diff": round(effv2_focal["real_world_test_metrics"]["brier_score"] - effv2_p3a["real_world_test_metrics"]["brier_score"], 4),
                    "high_conf_wrong_diff": effv2_focal["real_world_test_metrics"]["high_confidence_wrong_count"] - effv2_p3b_pred["summary"]["high_confidence_wrong_count"]
                }
            }
        }
    }

    report_json_path = MODEL_V4_DIR / "phase4b_benchmark_report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(comparison, f, indent=2)

    print(f"\nPhase 4B Benchmarking Complete! Report saved to: {report_json_path}", flush=True)
    return comparison


if __name__ == "__main__":
    run_phase4b_experiment()
