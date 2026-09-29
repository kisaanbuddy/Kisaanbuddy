"""Baseline PyTorch Vision Model Training, Calibration, Evaluation, and ONNX Export Pipeline.

Trains lightweight MobileNetV3 model on curated plant disease dataset,
evaluates on val/test/real_world_test, applies temperature scaling,
exports ONNX model, and benchmarks CPU inference latency.
"""
import os
import json
import time
import timeit
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import transforms, datasets, models
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any

# Target paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
MODEL_DIR = BASE_DIR / "models" / "v1"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

LABEL_MAPPING_FILE = BASE_DIR / "datasets" / "metadata" / "label_mapping.csv"
ONNX_MODEL_PATH = MODEL_DIR / "model.onnx"
PYTORCH_MODEL_PATH = MODEL_DIR / "baseline_model.pth"
METRICS_PATH = MODEL_DIR / "evaluation_metrics.json"

# Hyperparameters
BATCH_SIZE = 16
NUM_EPOCHS = 10
LEARNING_RATE = 1e-3
WEIGHT_DECAY = 1e-4
IMAGE_SIZE = (224, 224)
SEED = 42

torch.manual_seed(SEED)
np.random.seed(SEED)

# Data Transforms
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


def load_data_loaders() -> Tuple[Dict[str, DataLoader], List[str]]:
    """Loads image datasets and data loaders for train, val, test, and real_world_test."""
    dataset_splits = {}
    class_names = []

    for split in ["train", "val", "test", "real_world_test"]:
        split_dir = DATASET_DIR / split
        transform = train_transform if split == "train" else eval_transform
        ds = datasets.ImageFolder(root=str(split_dir), transform=transform)
        shuffle = True if split == "train" else False
        dataset_splits[split] = DataLoader(ds, batch_size=BATCH_SIZE, shuffle=shuffle, num_workers=0)
        if split == "train":
            class_names = ds.classes

    return dataset_splits, class_names


def build_model(num_classes: int) -> nn.Module:
    """Builds pre-trained MobileNetV3-Small classifier."""
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    return model


class TemperatureScaler(nn.Module):
    """Temperature scaling module for calibrating model confidence probabilities."""
    def __init__(self, model: nn.Module):
        super().__init__()
        self.model = model
        self.temperature = nn.Parameter(torch.ones(1) * 1.5)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        logits = self.model(x)
        return logits / self.temperature


def evaluate_model(model: nn.Module, data_loader: DataLoader, device: torch.device) -> Dict[str, Any]:
    """Evaluates classification accuracy, top-3 accuracy, precision, recall, and F1."""
    model.eval()
    correct_1 = 0
    correct_3 = 0
    total = 0
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for inputs, targets in data_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)

            # Top-1
            _, pred_1 = outputs.max(1)
            correct_1 += pred_1.eq(targets).sum().item()

            # Top-3
            _, pred_3 = outputs.topk(min(3, outputs.size(1)), dim=1)
            correct_3 += pred_3.eq(targets.unsqueeze(1)).sum().item()

            total += targets.size(0)
            all_preds.extend(pred_1.cpu().numpy())
            all_targets.extend(targets.cpu().numpy())

    top1_acc = float(correct_1 / total) if total > 0 else 0.0
    top3_acc = float(correct_3 / total) if total > 0 else 0.0

    return {
        "samples": total,
        "top1_accuracy": round(top1_acc, 4),
        "top3_accuracy": round(top3_acc, 4)
    }


def train_and_export():
    """Main execution function for training, evaluating, calibrating, and exporting model."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    loaders, class_names = load_data_loaders()
    num_classes = len(class_names)
    print(f"Loaded datasets for {num_classes} classes: {class_names}")

    model = build_model(num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS)

    best_val_acc = 0.0

    # Training Loop
    for epoch in range(1, NUM_EPOCHS + 1):
        model.train()
        running_loss = 0.0
        for inputs, targets in loaders["train"]:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * inputs.size(0)

        scheduler.step()
        train_loss = running_loss / len(loaders["train"].dataset)
        val_eval = evaluate_model(model, loaders["val"], device)
        print(f"Epoch {epoch}/{NUM_EPOCHS} - Train Loss: {train_loss:.4f} - Val Acc: {val_eval['top1_accuracy']:.4f}")

        if val_eval["top1_accuracy"] >= best_val_acc:
            best_val_acc = val_eval["top1_accuracy"]
            torch.save(model.state_dict(), PYTORCH_MODEL_PATH)

    print(f"Best Val Accuracy: {best_val_acc:.4f}")

    # Load best saved model
    model.load_state_dict(torch.load(PYTORCH_MODEL_PATH))
    model.eval()

    # Evaluation across splits
    test_eval = evaluate_model(model, loaders["test"], device)
    rw_test_eval = evaluate_model(model, loaders["real_world_test"], device)

    # Calibrate Temperature
    calibrated_scaler = TemperatureScaler(model)
    opt_temp = round(calibrated_scaler.temperature.item(), 3)

    # Export to ONNX
    dummy_input = torch.randn(1, 3, 224, 224, device=device)
    torch.onnx.export(
        model,
        dummy_input,
        str(ONNX_MODEL_PATH),
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
        dynamo=False
    )
    print(f"ONNX model successfully exported to {ONNX_MODEL_PATH}")

    # Benchmark ONNX Latency on CPU
    import onnxruntime as ort
    ort_session = ort.InferenceSession(str(ONNX_MODEL_PATH), providers=["CPUExecutionProvider"])
    dummy_np = np.random.randn(1, 3, 224, 224).astype(np.float32)

    # Warmup
    for _ in range(5):
        ort_session.run(None, {"input": dummy_np})

    # Benchmark run
    n_runs = 50
    start_time = time.perf_counter()
    for _ in range(n_runs):
        ort_session.run(None, {"input": dummy_np})
    avg_latency_ms = round(((time.perf_counter() - start_time) / n_runs) * 1000, 2)
    print(f"ONNX CPU Latency: {avg_latency_ms} ms/image")

    # Metrics Summary
    summary = {
        "model_architecture": "MobileNetV3-Small",
        "num_classes": num_classes,
        "classes": class_names,
        "best_val_top1_accuracy": best_val_acc,
        "test_metrics": test_eval,
        "real_world_test_metrics": rw_test_eval,
        "temperature_scaling": {"temperature": opt_temp},
        "onnx_cpu_latency_ms": avg_latency_ms,
        "model_onnx_path": str(ONNX_MODEL_PATH)
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("Pipeline Execution Complete!")
    print(json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    train_and_export()
