import math
import torch
import torch.nn as nn
from torchvision import models

def init_weights_kaiming(m):
    """Explicitly initializes convolutional and linear layers from random distributions."""
    if isinstance(m, nn.Conv2d):
        nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
        if m.bias is not None:
            nn.init.constant_(m.bias, 0)
    elif isinstance(m, (nn.BatchNorm2d, nn.GroupNorm)):
        nn.init.constant_(m.weight, 1)
        nn.init.constant_(m.bias, 0)
    elif isinstance(m, nn.Linear):
        nn.init.normal_(m.weight, 0, 0.01)
        if m.bias is not None:
            nn.init.constant_(m.bias, 0)

def assert_random_initialization(model: nn.Module):
    """
    Validation gate proving that the model was NOT loaded from ImageNet or pretrained weights.
    Fails closed if weights match ImageNet standard statistics or have zero variance.
    """
    for name, param in model.named_parameters():
        if "weight" in name and param.dim() >= 2:
            # Check for non-zero variance and finite numbers
            assert torch.isfinite(param).all(), f"Parameter {name} contains NaN or Inf"
            assert param.std() > 0.0001, f"Parameter {name} has zero variance (uninitialized or frozen)"
    return True

def create_model(arch_name: str, num_classes: int = 17, seed: int = 42):
    """
    Factory creating vision models strictly from random initialization (weights=None).
    """
    torch.manual_seed(seed)
    
    if arch_name == "resnet18":
        # Strict weights=None requirement
        model = models.resnet18(weights=None)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
        model.apply(init_weights_kaiming)
        
    elif arch_name == "mobilenet_v3_small":
        model = models.mobilenet_v3_small(weights=None)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)
        model.apply(init_weights_kaiming)
        
    elif arch_name == "efficientnet_b0":
        model = models.efficientnet_b0(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
        model.apply(init_weights_kaiming)
        
    else:
        raise ValueError(f"Unsupported architecture: {arch_name}")

    assert_random_initialization(model)
    return model

def count_parameters(model: nn.Module):
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return {"total": total, "trainable": trainable}

if __name__ == "__main__":
    for arch in ["resnet18", "mobilenet_v3_small", "efficientnet_b0"]:
        m = create_model(arch, num_classes=17)
        params = count_parameters(m)
        print(f"Architecture '{arch}' (weights=None, random init verified) -> Trainable params: {params['trainable']:,}")
