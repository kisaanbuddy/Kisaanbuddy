"""
Out-of-Distribution (OOD) and Selective Abstention Engine for Crop Doctor.
Computes Maximum Softmax Probability (MSP), Shannon Entropy, and Free Energy scores
to detect non-crop imagery, unfamiliar diseases, and ambiguous symptoms.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import torch
import torch.nn.functional as F

class OODAndAbstentionEngine:
    def __init__(
        self,
        min_confidence_thresh: float = 0.58,
        energy_threshold: float = -3.5,
        entropy_threshold: float = 2.10,
    ):
        self.min_confidence_thresh = min_confidence_thresh
        self.energy_threshold = energy_threshold
        self.entropy_threshold = entropy_threshold

    @staticmethod
    def compute_energy_score(logits: torch.Tensor, temperature: float = 1.0) -> float:
        """
        Free Energy score: E(x; T) = -T * logsumexp(logits / T).
        More negative energy corresponds to high in-distribution confidence.
        Less negative (higher) energy corresponds to anomalous / OOD samples.
        """
        scaled = logits / temperature
        energy = -temperature * torch.logsumexp(scaled, dim=-1)
        return float(energy.item())

    @staticmethod
    def compute_entropy(probs: np.ndarray) -> float:
        """Computes Shannon entropy in nats."""
        eps = 1e-9
        return float(-np.sum(probs * np.log(probs + eps)))

    def evaluate_reliability(
        self,
        logits: torch.Tensor,
        probs: np.ndarray,
        temperature: float = 1.0
    ) -> Dict[str, Any]:
        """
        Evaluates logits and softmax probabilities against OOD and uncertainty criteria.
        """
        if logits.dim() > 1:
            logits_1d = logits.squeeze(0)
        else:
            logits_1d = logits

        max_prob = float(np.max(probs))
        entropy = self.compute_entropy(probs)
        energy = self.compute_energy_score(logits_1d, temperature=temperature)

        abstain_reasons: List[str] = []
        is_ood_candidate = False

        if energy > self.energy_threshold:
            abstain_reasons.append("high_energy_ood_anomaly")
            is_ood_candidate = True

        if entropy > self.entropy_threshold:
            abstain_reasons.append("high_entropy_uniformity")

        if max_prob < self.min_confidence_thresh:
            abstain_reasons.append("low_prediction_confidence")

        should_abstain = len(abstain_reasons) > 0

        return {
            "should_abstain": should_abstain,
            "is_ood_candidate": is_ood_candidate,
            "abstain_reasons": abstain_reasons,
            "decision": "abstain" if should_abstain else "accept",
            "metrics": {
                "max_softmax_prob": round(max_prob, 4),
                "shannon_entropy": round(entropy, 4),
                "energy_score": round(energy, 4),
                "min_confidence_thresh": self.min_confidence_thresh,
                "energy_thresh": self.energy_threshold,
            }
        }
