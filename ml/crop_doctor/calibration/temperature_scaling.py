import torch
import torch.nn as nn
import torch.optim as optim

class ModelWithTemperature(nn.Module):
    """
    Temperature scaling post-processing wrapper.
    Calibrates logits: p = softmax(logits / T)
    T is optimized strictly on the validation partition via NLL minimization.
    """
    def __init__(self, model):
        super().__init__()
        self.model = model
        self.temperature = nn.Parameter(torch.ones(1) * 1.0)

    def forward(self, input):
        logits = self.model(input)
        return self.temperature_scale(logits)

    def temperature_scale(self, logits):
        temperature = self.temperature.unsqueeze(1).expand(logits.size(0), logits.size(1))
        return logits / temperature

    def set_temperature(self, val_loader, device="cpu"):
        self.model.eval()
        nll_criterion = nn.CrossEntropyLoss()
        
        logits_list = []
        labels_list = []
        
        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs = inputs.to(device)
                logits = self.model(inputs)
                logits_list.append(logits.cpu())
                labels_list.append(targets)
                
        logits = torch.cat(logits_list)
        labels = torch.cat(labels_list)
        
        # Calculate NLL before calibration
        before_nll = nll_criterion(logits, labels).item()
        
        # Optimize temperature parameter
        optimizer = optim.LBFGS([self.temperature], lr=0.01, max_iter=50)
        
        def eval_nll():
            optimizer.zero_grad()
            loss = nll_criterion(self.temperature_scale(logits), labels)
            loss.backward()
            return loss
            
        optimizer.step(eval_nll)
        
        after_nll = nll_criterion(self.temperature_scale(logits), labels).item()
        t_val = self.temperature.item()
        
        print(f"Temperature Calibration Complete:")
        print(f"  Optimized Temperature (T): {t_val:.4f}")
        print(f"  Val NLL Before: {before_nll:.4f} -> After: {after_nll:.4f}")
        
        return t_val, before_nll, after_nll

def compute_ece(probs, labels, n_bins=10):
    """
    Computes Expected Calibration Error (ECE).
    """
    bin_boundaries = torch.linspace(0, 1, n_bins + 1)
    bin_lowers = bin_boundaries[:-1]
    bin_uppers = bin_boundaries[1:]
    
    confidences, predictions = torch.max(probs, 1)
    accuracies = predictions.eq(labels)
    
    ece = torch.zeros(1)
    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = confidences.gt(bin_lower.item()) * confidences.le(bin_upper.item())
        prop_in_bin = in_bin.float().mean()
        if prop_in_bin.item() > 0:
            accuracy_in_bin = accuracies[in_bin].float().mean()
            avg_confidence_in_bin = confidences[in_bin].mean()
            ece += torch.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin
            
    return ece.item()
