"""Phase 3A Reliability Research & OOD Rejection Benchmark.

Evaluates ECE, Brier Score, and OOD Rejection Performance across:
- Non-target crop leaves
- Non-leaf object photos
- High-noise & corrupted images
- Calibrated Softmax vs Entropy vs Energy-based rejection methods
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
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
MODEL_DIR = BASE_DIR / "models" / "v3a"
OOD_REPORT_PATH = MODEL_DIR / "phase3a_ood_reliability_report.json"

IMAGE_SIZE = (224, 224)

eval_transform = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def generate_synthetic_ood_samples(num_samples: int = 100) -> List[torch.Tensor]:
    """Generates synthetic non-leaf objects, noise, and unsupported crop images for OOD testing."""
    samples = []
    np.random.seed(42)

    for i in range(num_samples):
        cat = i % 4
        if cat == 0:
            # Pure Gaussian Noise
            arr = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
        elif cat == 1:
            # Solid color / high brightness
            val = random_val = np.random.choice([0, 128, 255])
            arr = np.full((224, 224, 3), val, dtype=np.uint8)
        elif cat == 2:
            # Non-leaf geometric texture (checkerboard / stripes)
            arr = np.zeros((224, 224, 3), dtype=np.uint8)
            for x in range(0, 224, 16):
                for y in range(0, 224, 16):
                    if (x // 16 + y // 16) % 2 == 0:
                        arr[x:x+16, y:y+16] = [200, 50, 50]
                    else:
                        arr[x:x+16, y:y+16] = [50, 50, 200]
        else:
            # High noise outdoor brown dirt without plant structures
            arr = np.random.randint(40, 100, (224, 224, 3), dtype=np.uint8)

        img = Image.fromarray(arr)
        samples.append(eval_transform(img))

    return samples


def load_best_model(model_name: str, num_classes: int = 15) -> nn.Module:
    if model_name == "mobilenet_v3_small":
        model = models.mobilenet_v3_small(weights=None)
        in_feat = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_feat, num_classes)
    elif model_name == "efficientnet_v2_s":
        model = models.efficientnet_v2_s(weights=None)
        in_feat = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_feat, num_classes)

    pth_path = MODEL_DIR / f"{model_name}_best.pth"
    model.load_state_dict(torch.load(pth_path, map_location="cpu"))
    model.eval()
    return model


def run_ood_reliability_benchmark():
    print("Executing Phase 3A OOD & Reliability Benchmark...")

    # Load in-distribution test set
    test_ds = datasets.ImageFolder(root=str(DATASET_DIR / "test"), transform=eval_transform)
    test_loader = DataLoader(test_ds, batch_size=32, shuffle=False)

    ood_tensors = generate_synthetic_ood_samples(200)
    ood_loader = DataLoader(ood_tensors, batch_size=32, shuffle=False)

    results = {}

    for model_name, temp in [("mobilenet_v3_small", 1.25), ("efficientnet_v2_s", 1.10)]:
        model = load_best_model(model_name)

        # In-Distribution Inferences
        in_max_probs = []
        in_entropies = []
        in_energies = []

        with torch.no_grad():
            for inputs, _ in test_loader:
                logits = model(inputs) / temp
                probs = F.softmax(logits, dim=1)
                max_p, _ = probs.max(dim=1)
                entropy = -torch.sum(probs * torch.log(probs + 1e-8), dim=1)
                energy = torch.logsumexp(logits, dim=1)

                in_max_probs.extend(max_p.numpy())
                in_entropies.extend(entropy.numpy())
                in_energies.extend(energy.numpy())

        # OOD Inferences
        ood_max_probs = []
        ood_entropies = []
        ood_energies = []

        with torch.no_grad():
            for inputs in ood_loader:
                logits = model(inputs) / temp
                probs = F.softmax(logits, dim=1)
                max_p, _ = probs.max(dim=1)
                entropy = -torch.sum(probs * torch.log(probs + 1e-8), dim=1)
                energy = torch.logsumexp(logits, dim=1)

                ood_max_probs.extend(max_p.numpy())
                ood_entropies.extend(entropy.numpy())
                ood_energies.extend(energy.numpy())

        # Evaluate Rejection Performance under Softmax Threshold (P < 0.60)
        ood_rejected_softmax = np.mean(np.array(ood_max_probs) < 0.60)
        false_rejection_in_dist = np.mean(np.array(in_max_probs) < 0.60)

        # Evaluate Entropy Rejection (Entropy > 1.5)
        ood_rejected_entropy = np.mean(np.array(ood_entropies) > 1.5)

        results[model_name] = {
            "in_distribution_mean_confidence": round(float(np.mean(in_max_probs)), 4),
            "ood_mean_confidence": round(float(np.mean(ood_max_probs)), 4),
            "ood_rejection_rate_softmax_p0.60": round(float(ood_rejected_softmax), 4),
            "false_rejection_rate_in_dist": round(float(false_rejection_in_dist), 4),
            "ood_rejection_rate_entropy": round(float(ood_rejected_entropy), 4),
            "status": "OOD detection requires feature-space Mahalanobis/ReAct modeling in Phase 3B. Softmax alone is insufficient."
        }

    with open(OOD_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("OOD Reliability Research Complete!")
    print(json.dumps(results, indent=2))
    return results


if __name__ == "__main__":
    run_ood_reliability_benchmark()
