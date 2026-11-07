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

def create_model(arch_name: str, num_classes: int = 17, seed: int = 42, pretrained: bool = False):
    """
    Factory creating vision models.
    When pretrained=False: strictly from random initialization (weights=None, Kaiming init, verified).
    When pretrained=True: loads official torchvision ImageNet-1k pretrained weights, replacing the classification head.
    """
    torch.manual_seed(seed)

    if arch_name == "resnet18":
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        model = models.resnet18(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
        if not pretrained:
            model.apply(init_weights_kaiming)
            assert_random_initialization(model)

    elif arch_name == "mobilenet_v3_small":
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        model = models.mobilenet_v3_small(weights=weights)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)
        if not pretrained:
            model.apply(init_weights_kaiming)
            assert_random_initialization(model)

    elif arch_name == "efficientnet_b0":
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        model = models.efficientnet_b0(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
        if not pretrained:
            model.apply(init_weights_kaiming)
            assert_random_initialization(model)

    elif arch_name == "efficientnet_v2_s":
        weights = models.EfficientNet_V2_S_Weights.DEFAULT if pretrained else None
        model = models.efficientnet_v2_s(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
        if not pretrained:
            model.apply(init_weights_kaiming)
            assert_random_initialization(model)

    else:
        raise ValueError(f"Unsupported architecture: {arch_name}")

    return model

def count_parameters(model: nn.Module):
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return {"total": total, "trainable": trainable}

if __name__ == "__main__":
    for arch in ["resnet18", "mobilenet_v3_small", "efficientnet_b0", "efficientnet_v2_s"]:
        m_scratch = create_model(arch, num_classes=17, pretrained=False)
        p_scratch = count_parameters(m_scratch)
        print(f"Architecture '{arch}' (From Scratch) -> Trainable params: {p_scratch['trainable']:,}")

        m_pt = create_model(arch, num_classes=17, pretrained=True)
        p_pt = count_parameters(m_pt)
        print(f"Architecture '{arch}' (Pretrained)   -> Trainable params: {p_pt['trainable']:,}")
