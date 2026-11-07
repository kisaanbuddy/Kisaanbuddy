"""
Temperature Scaling and Probability Calibration for Crop Doctor.
Calibrates model logits using Platt / Temperature Scaling to reduce overconfidence
and compute rigorous Expected Calibration Error (ECE).
"""

import json
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader

class ModelWithTemperature(nn.Module):
    """
    Wraps a model with temperature scaling to produce calibrated probabilities.
    Output: Softmax(logits / T) where T > 0 is learned on validation data.
    """
    def __init__(self, model: nn.Module):
        super().__init__()
        self.model = model
        self.temperature = nn.Parameter(torch.ones(1) * 1.0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        logits = self.model(x)
        return self.temperature_scale(logits)

    def temperature_scale(self, logits: torch.Tensor) -> torch.Tensor:
        temperature = self.temperature.to(logits.device).unsqueeze(1).expand(logits.size(0), logits.size(1))
        return logits / temperature

    def calibrate(self, valid_loader: DataLoader, device: torch.device, lr: float = 0.01, max_iter: int = 50) -> float:
        """
        Tunes the temperature parameter T on validation set logits using L-BFGS.
        """
        self.to(device)
        self.model.eval()
        nll_criterion = nn.CrossEntropyLoss()
        
        # 1. Collect all logits and labels from the validation set
        logits_list = []
        labels_list = []
        with torch.no_grad():
            for inputs, targets in valid_loader:
                inputs = inputs.to(device)
                logits = self.model(inputs)
                logits_list.append(logits.cpu())
                labels_list.append(targets.cpu())
        
        logits = torch.cat(logits_list).to(device)
        labels = torch.cat(labels_list).to(device)

        # 2. Optimize temperature parameter
        optimizer = torch.optim.LBFGS([self.temperature], lr=lr, max_iter=max_iter)

        def eval_step():
            optimizer.zero_grad()
            loss = nll_criterion(self.temperature_scale(logits), labels)
            loss.backward()
            return loss

        optimizer.step(eval_step)
        
        # Clamp temperature to avoid numerical degeneration
        with torch.no_grad():
            self.temperature.clamp_(min=0.1, max=10.0)
            
        optimal_t = float(self.temperature.item())
        return optimal_t

def compute_ece(probs: np.ndarray, targets: np.ndarray, n_bins: int = 10) -> Tuple[float, list]:
    """
    Calculates Expected Calibration Error (ECE) and bin statistics.
    """
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    accuracies = (predictions == targets)

    ece = 0.0
    bins_data = []
    for i in range(n_bins):
        in_bin = (confidences > bin_boundaries[i]) & (confidences <= bin_boundaries[i + 1])
        prop_in_bin = np.mean(in_bin)
        if prop_in_bin > 0:
            acc_in_bin = float(np.mean(accuracies[in_bin]))
            conf_in_bin = float(np.mean(confidences[in_bin]))
            ece += np.abs(conf_in_bin - acc_in_bin) * prop_in_bin
            bins_data.append({
                "bin": f"{bin_boundaries[i]:.2f}-{bin_boundaries[i+1]:.2f}",
                "count": int(np.sum(in_bin)),
                "acc": round(acc_in_bin, 4),
                "conf": round(conf_in_bin, 4),
            })
    return float(ece), bins_data

def evaluate_calibration(
    model: nn.Module,
    dataloader: DataLoader,
    device: torch.device,
    temperature: float = 1.0
) -> Dict[str, Any]:
    """
    Evaluates accuracy, log-loss, and ECE at a specified temperature.
    """
    model.eval()
    all_logits = []
    all_targets = []

    with torch.no_grad():
        for inputs, targets in dataloader:
            inputs = inputs.to(device)
            logits = model(inputs)
            all_logits.append(logits.cpu())
            all_targets.append(targets.cpu())

    logits = torch.cat(all_logits, dim=0)
    targets = torch.cat(all_targets, dim=0).numpy()

    scaled_logits = logits / temperature
    probs = F.softmax(scaled_logits, dim=1).numpy()
    preds = np.argmax(probs, axis=1)

    top1 = float(np.mean(preds == targets))
    ece, bin_details = compute_ece(probs, targets)

    return {
        "temperature": round(temperature, 4),
        "top1_accuracy": round(top1, 4),
        "ece": round(ece, 4),
        "bin_details": bin_details
    }
