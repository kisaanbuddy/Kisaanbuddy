import os
import sys
import json
import time
import argparse
from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import f1_score, accuracy_score
import numpy as np

# Ensure root is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from ml.crop_doctor.models.factory import create_model, count_parameters, assert_random_initialization
from ml.crop_doctor.training.dataset import (
    CropDoctorDataset,
    get_train_transforms,
    get_eval_transforms,
    CANONICAL_CLASSES
)

def evaluate_model(model, dataloader, criterion, device):
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []
    
    with torch.no_grad():
        for inputs, targets in dataloader:
            inputs = inputs.to(device)
            targets = targets.to(device)
            
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            total_loss += loss.item() * inputs.size(0)
            
            preds = torch.argmax(outputs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(targets.cpu().numpy())
            
    avg_loss = total_loss / len(dataloader.dataset)
    acc = accuracy_score(all_targets, all_preds)
    macro_f1 = f1_score(all_targets, all_preds, average="macro", zero_division=0)
    
    return avg_loss, acc, macro_f1

def train_crop_doctor(
    arch_name: str = "mobilenet_v3_small",
    epochs: int = 15,
    batch_size: int = 32,
    lr: float = 1e-3,
    weight_decay: float = 1e-4,
    seed: int = 42,
    device_name: str = "cpu",
    output_dir: str = "ml/crop_doctor/artifacts"
):
    print(f"\n==================================================================")
    print(f"Starting From-Scratch Training: {arch_name} (Random Init Verified)")
    print(f"Seed: {seed} | Epochs: {epochs} | Batch Size: {batch_size} | Device: {device_name}")
    print(f"==================================================================")
    
    torch.manual_seed(seed)
    np.random.seed(seed)
    device = torch.device(device_name)
    
    out_path = Path(output_dir) / arch_name
    out_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Create Model strictly from random weights (weights=None)
    model = create_model(arch_name, num_classes=len(CANONICAL_CLASSES), seed=seed)
    assert_random_initialization(model)
    model = model.to(device)
    params = count_parameters(model)
    print(f"Trainable Parameters: {params['trainable']:,}")
    
    # 2. Dataloaders
    train_manifest = "ml/crop_doctor/data/splits/train_manifest.json"
    val_manifest = "ml/crop_doctor/data/splits/val_manifest.json"
    
    train_ds = CropDoctorDataset(train_manifest, transform=get_train_transforms())
    val_ds = CropDoctorDataset(val_manifest, transform=get_eval_transforms())
    
    num_workers = 0
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, drop_last=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    
    # 3. Optimization Setup
    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)
    
    best_val_f1 = 0.0
    best_epoch = 0
    history = []
    
    start_train_time = time.time()
    
    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        epoch_start = time.time()
        
        for step, (inputs, targets) in enumerate(train_loader):
            inputs = inputs.to(device)
            targets = targets.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            
            if torch.isnan(loss) or torch.isinf(loss):
                raise ValueError(f"Encountered NaN/Inf loss at epoch {epoch}, step {step}")
                
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            preds = torch.argmax(outputs, dim=1)
            correct += (preds == targets).sum().item()
            total += targets.size(0)
            
        scheduler.step()
        
        train_loss = running_loss / total
        train_acc = correct / total
        
        # Validation pass
        val_loss, val_acc, val_f1 = evaluate_model(model, val_loader, criterion, device)
        epoch_time = time.time() - epoch_start
        
        print(f"Epoch [{epoch:2d}/{epochs:2d}] ({epoch_time:.1f}s) | "
              f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}% | "
              f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.2f}% | Val Macro-F1: {val_f1:.4f}")
              
        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 4),
            "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 4),
            "val_macro_f1": round(val_f1, 4),
            "lr": round(scheduler.get_last_lr()[0], 6),
            "duration_sec": round(epoch_time, 1)
        })
        
        # Checkpoint if best macro-F1 achieved
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            best_epoch = epoch
            
            checkpoint = {
                "architecture": arch_name,
                "weights_mode": "random_initialization_strictly_from_scratch",
                "random_seed": seed,
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "num_classes": len(CANONICAL_CLASSES),
                "classes": CANONICAL_CLASSES,
                "val_acc": val_acc,
                "val_macro_f1": val_f1,
                "train_manifest_records": len(train_ds),
                "val_manifest_records": len(val_ds),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            torch.save(checkpoint, out_path / "best_model.pth")
            print(f"  --> Saved new best checkpoint at epoch {epoch} (Val F1: {val_f1:.4f})")

    total_training_time = time.time() - start_train_time
    print(f"\nTraining Complete in {total_training_time/60:.2f} minutes!")
    print(f"Best Epoch: {best_epoch} with Val Macro-F1: {best_val_f1:.4f}")
    
    # Save training report and history
    report = {
        "architecture": arch_name,
        "weights_mode": "from_scratch",
        "seed": seed,
        "device": device_name,
        "total_parameters": params["total"],
        "trainable_parameters": params["trainable"],
        "epochs_trained": epochs,
        "best_epoch": best_epoch,
        "best_val_macro_f1": round(best_val_f1, 4),
        "total_time_minutes": round(total_training_time / 60, 2),
        "history": history
    }
    
    with open(out_path / "training_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--arch", type=str, default="mobilenet_v3_small", choices=["resnet18", "mobilenet_v3_small", "efficientnet_b0"])
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--device", type=str, default="cpu")
    args = parser.parse_args()
    
    train_crop_doctor(
        arch_name=args.arch,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        seed=args.seed,
        device_name=args.device
    )
