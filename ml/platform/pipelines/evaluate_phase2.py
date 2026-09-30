"""Comprehensive Phase 2 Model Evaluation, Error Analysis, Calibration, OOD Test, ONNX Consistency, and CPU Latency Benchmark.
"""
import os
import time
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import transforms, datasets, models
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix
import onnxruntime as ort

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
MODEL_DIR = BASE_DIR / "models" / "v1"
PYTORCH_MODEL_PATH = MODEL_DIR / "baseline_model.pth"
ONNX_MODEL_PATH = MODEL_DIR / "model.onnx"
LABEL_MAP_FILE = BASE_DIR / "datasets" / "metadata" / "label_mapping.csv"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16

eval_transform = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def load_dataset_split(split_name: str) -> Tuple[DataLoader, List[str]]:
    split_dir = DATASET_DIR / split_name
    ds = datasets.ImageFolder(root=str(split_dir), transform=eval_transform)
    loader = DataLoader(ds, batch_size=BATCH_SIZE, shuffle=False)
    return loader, ds.classes


def load_model(num_classes: int) -> nn.Module:
    model = models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    model.load_state_dict(torch.load(PYTORCH_MODEL_PATH, map_location="cpu"))
    model.eval()
    return model


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, logits: np.ndarray, class_names: List[str]) -> Dict[str, Any]:
    acc = float(accuracy_score(y_true, y_pred))
    
    # Top-3 Accuracy
    top3_count = 0
    top3_preds = np.argsort(logits, axis=1)[:, -3:]
    for true_lbl, top3 in zip(y_true, top3_preds):
        if true_lbl in top3:
            top3_count += 1
    top3_acc = float(top3_count / len(y_true))

    # Precision, Recall, F1
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    per_class_p, per_class_r, per_class_f1, _ = precision_recall_fscore_support(y_true, y_pred, average=None, zero_division=0)

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred).tolist()

    per_class_metrics = {}
    for i, cls_name in enumerate(class_names):
        per_class_metrics[cls_name] = {
            "precision": round(float(per_class_p[i]), 4),
            "recall": round(float(per_class_r[i]), 4),
            "f1_score": round(float(per_class_f1[i]), 4)
        }

    return {
        "accuracy": round(acc, 4),
        "top1_accuracy": round(acc, 4),
        "top3_accuracy": round(top3_acc, 4),
        "macro_precision": round(float(macro_p), 4),
        "macro_recall": round(float(macro_r), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "per_class": per_class_metrics,
        "confusion_matrix": cm
    }


def evaluate_split(model: nn.Module, loader: DataLoader, class_names: List[str], temperature: float = 1.0) -> Tuple[Dict[str, Any], np.ndarray, np.ndarray, np.ndarray]:
    y_true = []
    y_pred = []
    all_logits = []

    with torch.no_grad():
        for inputs, targets in loader:
            outputs = model(inputs) / temperature
            probs = F.softmax(outputs, dim=1)
            _, preds = outputs.max(1)

            y_true.extend(targets.numpy())
            y_pred.extend(preds.numpy())
            all_logits.extend(outputs.numpy())

    y_true_np = np.array(y_true)
    y_pred_np = np.array(y_pred)
    all_logits_np = np.array(all_logits)

    metrics = compute_metrics(y_true_np, y_pred_np, all_logits_np, class_names)
    return metrics, y_true_np, y_pred_np, all_logits_np


def run_full_evaluation():
    print("Executing Phase 2 Comprehensive Evaluation...")

    val_loader, class_names = load_dataset_split("val")
    test_loader, _ = load_dataset_split("test")
    rw_loader, _ = load_dataset_split("real_world_test")

    model = load_model(len(class_names))

    # 1. Uncalibrated Evaluations
    val_metrics, y_true_val, y_pred_val, logits_val = evaluate_split(model, val_loader, class_names, temperature=1.0)
    test_metrics, y_true_test, y_pred_test, logits_test = evaluate_split(model, test_loader, class_names, temperature=1.0)
    rw_metrics, y_true_rw, y_pred_rw, logits_rw = evaluate_split(model, rw_loader, class_names, temperature=1.0)

    # 2. Temperature Scaling Calibration (Tuned on VAL only)
    # Find temperature T that minimizes NLL on validation set
    val_logits_t = torch.tensor(logits_val)
    val_labels_t = torch.tensor(y_true_val, dtype=torch.long)

    best_temp = 1.0
    best_nll = float("inf")
    for T in np.linspace(0.5, 3.0, 51):
        nll = F.cross_entropy(val_logits_t / T, val_labels_t).item()
        if nll < best_nll:
            best_nll = nll
            best_temp = round(float(T), 2)

    print(f"Optimal Calibration Temperature (from Val): T = {best_temp}")

    # Evaluate Calibrated Test Set
    calibrated_test_metrics, _, _, _ = evaluate_split(model, test_loader, class_names, temperature=best_temp)

    # 3. Error Analysis on Held-Out Test Set
    confused_pairs = []
    cm = test_metrics["confusion_matrix"]
    for i in range(len(class_names)):
        for j in range(len(class_names)):
            if i != j and cm[i][j] > 0:
                confused_pairs.append({
                    "true_class": class_names[i],
                    "predicted_class": class_names[j],
                    "count": cm[i][j]
                })

    confused_pairs = sorted(confused_pairs, key=lambda x: x["count"], reverse=True)[:5]

    # Worst Performing Classes
    sorted_classes = sorted(test_metrics["per_class"].items(), key=lambda x: x[1]["f1_score"])
    worst_classes = sorted_classes[:3]

    # 4. PyTorch vs ONNX Consistency Check
    ort_session = ort.InferenceSession(str(ONNX_MODEL_PATH), providers=["CPUExecutionProvider"])
    ort_input_name = ort_session.get_inputs()[0].name

    agreements = 0
    max_diff = 0.0
    total_samples = 0

    for inputs, _ in test_loader:
        with torch.no_grad():
            pt_outputs = F.softmax(model(inputs), dim=1).numpy()

        onnx_outputs = ort_session.run(None, {ort_input_name: inputs.numpy()})[0]
        # Softmax on ONNX
        exp_o = np.exp(onnx_outputs - np.max(onnx_outputs, axis=1, keepdims=True))
        onnx_probs = exp_o / np.sum(exp_o, axis=1, keepdims=True)

        pt_preds = np.argmax(pt_outputs, axis=1)
        onnx_preds = np.argmax(onnx_outputs, axis=1)

        agreements += np.sum(pt_preds == onnx_preds)
        max_diff = max(max_diff, float(np.max(np.abs(pt_outputs - onnx_probs))))
        total_samples += len(inputs)

    agreement_rate = round(float(agreements / total_samples), 4)

    # 5. Granular CPU Latency Breakdown Benchmark
    dummy_img = np.random.randn(1, 3, 224, 224).astype(np.float32)

    # Warmup
    for _ in range(10):
        ort_session.run(None, {ort_input_name: dummy_img})

    prep_times = []
    inf_times = []
    post_times = []
    total_times = []

    for _ in range(100):
        t0 = time.perf_counter()
        # Preprocessing simulation (resize + transpose + norm)
        raw_np = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
        img_p = (raw_np.astype(np.float32) / 255.0).transpose(2, 0, 1)
        img_p = np.expand_dims(img_p, axis=0)
        t1 = time.perf_counter()

        # Inference
        ort_out = ort_session.run(None, {ort_input_name: img_p})[0]
        t2 = time.perf_counter()

        # Postprocessing (softmax + top-k)
        logits_1d = ort_out[0]
        exp_l = np.exp(logits_1d - np.max(logits_1d))
        probs_1d = exp_l / np.sum(exp_l)
        top3_idx = np.argsort(probs_1d)[-3:]
        t3 = time.perf_counter()

        prep_times.append((t1 - t0) * 1000)
        inf_times.append((t2 - t1) * 1000)
        post_times.append((t3 - t2) * 1000)
        total_times.append((t3 - t0) * 1000)

    latency_stats = {
        "preprocessing_mean_ms": round(float(np.mean(prep_times)), 2),
        "inference_mean_ms": round(float(np.mean(inf_times)), 2),
        "postprocessing_mean_ms": round(float(np.mean(post_times)), 2),
        "total_mean_ms": round(float(np.mean(total_times)), 2),
        "total_median_ms": round(float(np.median(total_times)), 2),
        "total_p95_ms": round(float(np.percentile(total_times, 95)), 2),
        "onnx_file_size_mb": round(os.path.getsize(ONNX_MODEL_PATH) / (1024 * 1024), 2)
    }

    # 6. OOD / Non-Leaf Synthetic Evaluation
    # Evaluate model response on pure random noise and uniform black/white inputs
    ood_noise = np.random.randn(1, 3, 224, 224).astype(np.float32)
    ood_black = np.zeros((1, 3, 224, 224), dtype=np.float32)
    
    noise_out = ort_session.run(None, {ort_input_name: ood_noise})[0]
    exp_n = np.exp(noise_out - np.max(noise_out))
    probs_noise = exp_n / np.sum(exp_n)
    max_noise_prob = float(np.max(probs_noise))

    black_out = ort_session.run(None, {ort_input_name: ood_black})[0]
    exp_b = np.exp(black_out - np.max(black_out))
    probs_black = exp_b / np.sum(exp_b)
    max_black_prob = float(np.max(probs_black))

    ood_eval = {
        "noise_max_softmax_prob": round(max_noise_prob, 4),
        "black_image_max_softmax_prob": round(max_black_prob, 4),
        "rejection_status": "OOD detection remains a Phase 3 requirement. Softmax confidence alone is insufficient."
    }

    report = {
        "validation_metrics": val_metrics,
        "test_metrics": test_metrics,
        "real_world_test_metrics": rw_metrics,
        "calibration": {
            "optimal_temperature": best_temp,
            "calibrated_test_metrics": calibrated_test_metrics
        },
        "error_analysis": {
            "top_confused_pairs": confused_pairs,
            "worst_performing_classes": worst_classes
        },
        "onnx_verification": {
            "agreement_rate": agreement_rate,
            "max_numerical_diff": round(max_diff, 6),
            "status": "PASSED" if agreement_rate > 0.95 else "WARNING"
        },
        "latency_benchmark": latency_stats,
        "ood_assessment": ood_eval
    }

    with open(MODEL_DIR / "full_evaluation_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("Phase 2 Full Evaluation Completed Successfully!")
    print(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    run_full_evaluation()
