"""Phase 3A Multi-Model Retraining, Calibration (ECE & Brier Score), OOD Benchmark, and Comparison Pipeline.

Trains & benchmarks:
1. MobileNetV3-Small (Phase 3A Retrained Baseline)
2. EfficientNetV2-S (Phase 3A Benchmark Candidate)

Evaluates on Val, Test, and Isolated Real-World Holdout splits.
Exports ONNX models, benchmarks CPU latency, computes ECE and Brier scores.
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
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix, brier_score_loss
import onnxruntime as ort

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
MODEL_DIR = BASE_DIR / "models" / "v3a"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 1e-3
WEIGHT_DECAY = 1e-4
IMAGE_SIZE = (224, 224)
SEED = 42

torch.manual_seed(SEED)
np.random.seed(SEED)

# Data Augmentations
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


def load_loaders() -> Tuple[Dict[str, DataLoader], List[str]]:
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


def compute_brier(probs: np.ndarray, y_true: np.ndarray, num_classes: int) -> float:
    """Computes multi-class Brier score."""
    one_hot = np.zeros((len(y_true), num_classes))
    one_hot[np.arange(len(y_true)), y_true] = 1.0
    brier = np.mean(np.sum((probs - one_hot) ** 2, axis=1))
    return round(float(brier), 4)


def evaluate_model_full(model: nn.Module, loader: DataLoader, class_names: List[str], temp: float = 1.0) -> Dict[str, Any]:
    model.eval()
    y_true = []
    y_pred = []
    all_probs = []
    all_logits = []

    with torch.no_grad():
        for inputs, targets in loader:
            outputs = model(inputs) / temp
            probs = F.softmax(outputs, dim=1)
            _, preds = outputs.max(1)

            y_true.extend(targets.numpy())
            y_pred.extend(preds.numpy())
            all_probs.extend(probs.numpy())
            all_logits.extend(outputs.numpy())

    y_true_np = np.array(y_true)
    y_pred_np = np.array(y_pred)
    all_probs_np = np.array(all_probs)
    all_logits_np = np.array(all_logits)

    acc = float(accuracy_score(y_true_np, y_pred_np))

    # Top-3
    top3_count = 0
    top3_preds = np.argsort(all_logits_np, axis=1)[:, -3:]
    for true_lbl, top3 in zip(y_true_np, top3_preds):
        if true_lbl in top3:
            top3_count += 1
    top3_acc = float(top3_count / len(y_true_np))

    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true_np, y_pred_np, average="macro", zero_division=0)
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(y_true_np, y_pred_np, average="weighted", zero_division=0)
    per_p, per_r, per_f1, _ = precision_recall_fscore_support(y_true_np, y_pred_np, average=None, zero_division=0)

    ece = compute_ece(all_probs_np, y_true_np)
    brier = compute_brier(all_probs_np, y_true_np, len(class_names))

    per_class_res = {}
    for i, name in enumerate(class_names):
        per_class_res[name] = {
            "precision": round(float(per_p[i]), 4),
            "recall": round(float(per_r[i]), 4),
            "f1_score": round(float(per_f1[i]), 4)
        }

    return {
        "accuracy": round(acc, 4),
        "top1_accuracy": round(acc, 4),
        "top3_accuracy": round(top3_acc, 4),
        "macro_precision": round(float(macro_p), 4),
        "macro_recall": round(float(macro_r), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "ece": ece,
        "brier_score": brier,
        "per_class": per_class_res,
        "confusion_matrix": confusion_matrix(y_true_np, y_pred_np).tolist()
    }


def train_single_model(model_name: str, num_classes: int, loaders: Dict[str, DataLoader], class_names: List[str]) -> Dict[str, Any]:
    print(f"\n==========================================")
    print(f"Training Model Architecture: {model_name}")
    print(f"==========================================")

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

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS)

    start_train_time = time.time()
    best_val_f1 = 0.0
    best_pth_path = MODEL_DIR / f"{model_name}_best.pth"

    for epoch in range(1, NUM_EPOCHS + 1):
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

        val_eval = evaluate_model_full(model, loaders["val"], class_names)
        print(f"Epoch {epoch}/{NUM_EPOCHS} - Train Loss: {train_loss:.4f} - Val F1: {val_eval['macro_f1']:.4f} - Val Acc: {val_eval['accuracy']:.4f}")

        if val_eval["macro_f1"] >= best_val_f1:
            best_val_f1 = val_eval["macro_f1"]
            torch.save(model.state_dict(), best_pth_path)

    train_duration = round(time.time() - start_train_time, 2)
    print(f"Model {model_name} Training Completed in {train_duration}s. Best Val F1: {best_val_f1}")

    # Load best model for evaluation
    model.load_state_dict(torch.load(best_pth_path))
    model.eval()

    # Temperature Calibration Tuning on Val Set
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

    # Evaluate across splits
    val_res = evaluate_model_full(model, loaders["val"], class_names, temp=1.0)
    test_res_uncal = evaluate_model_full(model, loaders["test"], class_names, temp=1.0)
    test_res_cal = evaluate_model_full(model, loaders["test"], class_names, temp=best_temp)
    rw_res = evaluate_model_full(model, loaders["real_world_test"], class_names, temp=best_temp)

    # Export to ONNX
    onnx_path = MODEL_DIR / f"{model_name}.onnx"
    dummy_in = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model, dummy_in, str(onnx_path),
        export_params=True, opset_version=14, do_constant_folding=True,
        input_names=["input"], output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
        dynamo=False
    )
    model_size_mb = round(os.path.getsize(onnx_path) / (1024 * 1024), 2)

    # CPU Latency Benchmark
    ort_session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    input_name = ort_session.get_inputs()[0].name
    dummy_np = np.random.randn(1, 3, 224, 224).astype(np.float32)

    for _ in range(5):
        ort_session.run(None, {input_name: dummy_np})

    latencies = []
    for _ in range(50):
        t0 = time.perf_counter()
        ort_session.run(None, {input_name: dummy_np})
        latencies.append((time.perf_counter() - t0) * 1000)

    mean_lat = round(float(np.mean(latencies)), 2)
    p95_lat = round(float(np.percentile(latencies, 95)), 2)

    return {
        "model_name": model_name,
        "training_time_s": train_duration,
        "model_onnx_size_mb": model_size_mb,
        "cpu_latency": {"mean_ms": mean_lat, "p95_ms": p95_lat},
        "optimal_temperature": best_temp,
        "validation_metrics": val_res,
        "test_metrics_uncalibrated": test_res_uncal,
        "test_metrics_calibrated": test_res_cal,
        "real_world_test_metrics": rw_res
    }


def run_phase3a_benchmark():
    loaders, class_names = load_loaders()
    num_classes = len(class_names)

    mbv3_res = train_single_model("mobilenet_v3_small", num_classes, loaders, class_names)
    effv2_res = train_single_model("efficientnet_v2_s", num_classes, loaders, class_names)

    comparison = {
        "dataset_summary": {
            "num_classes": num_classes,
            "train_samples": len(loaders["train"].dataset),
            "val_samples": len(loaders["val"].dataset),
            "test_samples": len(loaders["test"].dataset),
            "real_world_test_samples": len(loaders["real_world_test"].dataset)
        },
        "models": {
            "mobilenet_v3_small": mbv3_res,
            "efficientnet_v2_s": effv2_res
        }
    }

    with open(MODEL_DIR / "phase3a_benchmark_report.json", "w", encoding="utf-8") as f:
        json.dump(comparison, f, indent=2)

    print("\nPhase 3A Benchmarking Complete!")
    print(json.dumps(comparison, indent=2))
    return comparison


if __name__ == "__main__":
    run_phase3a_benchmark()
