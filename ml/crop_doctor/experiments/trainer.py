import os
import sys
import json
import time
import argparse
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import f1_score, accuracy_score, precision_score, recall_score

# Ensure repo root is in path
repo_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(repo_root))

from ml.crop_doctor.models.factory import create_model, count_parameters, assert_random_initialization
from ml.crop_doctor.training.dataset import (
    CropDoctorDataset,
    get_train_transforms,
    get_enhanced_train_transforms,
    get_eval_transforms,
    apply_mixup_cutmix,
    CANONICAL_CLASSES
)

def evaluate_model(model, dataloader, criterion, device):
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []
    
    with torch.no_grad():
        for inputs, targets in dataloader:
            inputs = inputs.to(device, non_blocking=True)
            targets = targets.to(device, non_blocking=True)
            
            with torch.amp.autocast("cuda", enabled=(device.type == "cuda")):
                outputs = model(inputs)
                loss = criterion(outputs, targets)
            
            total_loss += loss.item() * inputs.size(0)
            preds = torch.argmax(outputs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(targets.cpu().numpy())
            
    avg_loss = total_loss / len(dataloader.dataset)
    acc = accuracy_score(all_targets, all_preds)
    macro_f1 = f1_score(all_targets, all_preds, average="macro", zero_division=0)
    per_class_f1 = f1_score(all_targets, all_preds, average=None, zero_division=0)
    per_class_prec = precision_score(all_targets, all_preds, average=None, zero_division=0)
    per_class_rec = recall_score(all_targets, all_preds, average=None, zero_division=0)
    
    return {
        "loss": avg_loss,
        "acc": acc,
        "macro_f1": macro_f1,
        "per_class_f1": per_class_f1.tolist(),
        "per_class_prec": per_class_prec.tolist(),
        "per_class_rec": per_class_rec.tolist()
    }

def run_experiment(
    experiment_name: str,
    arch_name: str = "mobilenet_v3_small",
    pretrained: bool = False,
    image_size: int = 224,
    epochs: int = 30,
    batch_size: int = 64,
    lr: float = 1e-3,
    weight_decay: float = 1e-4,
    augmentation: str = "enhanced",  # "standard", "enhanced", "mixup_cutmix"
    patience: int = 8,
    seed: int = 42,
    device_name: str = "cuda",
    train_manifest: str = "ml/crop_doctor/data/splits_v2/train_manifest_v2.json",
    val_manifest: str = "ml/crop_doctor/data/splits_v2/val_manifest_v2.json",
    output_base_dir: str = "ml/crop_doctor/artifacts/experiments"
):
    print("=" * 70, flush=True)
    print(f"RUNNING EXPERIMENT: {experiment_name}", flush=True)
    print(f"Architecture: {arch_name} | Pretrained: {pretrained} | Res: {image_size}x{image_size}", flush=True)
    print(f"Augmentation: {augmentation} | Epochs: {epochs} | Batch: {batch_size} | LR: {lr}", flush=True)
    print("=" * 70, flush=True)

    # Set seeds
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    np.random.seed(seed)
    
    device = torch.device(device_name if torch.cuda.is_available() else "cpu")
    out_dir = Path(output_base_dir) / experiment_name
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Instantiate Model
    model = create_model(arch_name, num_classes=len(CANONICAL_CLASSES), seed=seed, pretrained=pretrained)
    model = model.to(device)
    params = count_parameters(model)
    print(f"Total Parameters: {params['total']:,} | Trainable: {params['trainable']:,}", flush=True)

    # 2. Setup Data Transforms and Loaders with RAM Preloading
    if augmentation == "standard":
        train_trans = get_train_transforms(image_size)
    else:
        train_trans = get_enhanced_train_transforms(image_size)
        
    eval_trans = get_eval_transforms(image_size)
    
    print(f"Preloading datasets into RAM...", flush=True)
    t0_pre = time.time()
    train_ds = CropDoctorDataset(train_manifest, transform=train_trans, preload=True)
    val_ds = CropDoctorDataset(val_manifest, transform=eval_trans, preload=True)
    print(f"Preloaded in {time.time()-t0_pre:.1f}s! Train: {len(train_ds)} | Val: {len(val_ds)}", flush=True)
    
    train_loader = DataLoader(
        train_ds, batch_size=batch_size, shuffle=True,
        num_workers=0, pin_memory=True, drop_last=True
    )
    val_loader = DataLoader(
        val_ds, batch_size=batch_size, shuffle=False,
        num_workers=0, pin_memory=True
    )

    # 3. Optimization Setup with Warmup + Cosine Annealing
    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    
    warmup_epochs = 3
    def lr_lambda(epoch):
        if epoch < warmup_epochs:
            return float(epoch + 1) / float(warmup_epochs)
        else:
            progress = float(epoch - warmup_epochs) / float(max(1, epochs - warmup_epochs))
            return 0.5 * (1.0 + np.cos(np.pi * progress))
            
    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda=lr_lambda)
    scaler = torch.amp.GradScaler("cuda", enabled=(device.type == "cuda"))

    best_val_f1 = 0.0
    best_epoch = 0
    epochs_no_improve = 0
    history = []
    
    if device.type == "cuda":
        torch.cuda.reset_peak_memory_stats(device)
        
    start_total_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        epoch_start = time.time()
        
        for step, (inputs, targets) in enumerate(train_loader):
            inputs = inputs.to(device, non_blocking=True)
            targets = targets.to(device, non_blocking=True)
            
            optimizer.zero_grad()
            
            if augmentation == "mixup_cutmix":
                inputs_m, targets_a, targets_b, lam = apply_mixup_cutmix(inputs, targets)
                with torch.amp.autocast("cuda", enabled=(device.type == "cuda")):
                    outputs = model(inputs_m)
                    loss = lam * criterion(outputs, targets_a) + (1.0 - lam) * criterion(outputs, targets_b)
            else:
                with torch.amp.autocast("cuda", enabled=(device.type == "cuda")):
                    outputs = model(inputs)
                    loss = criterion(outputs, targets)
                    
            if torch.isnan(loss) or torch.isinf(loss):
                raise ValueError(f"Encountered NaN/Inf loss at epoch {epoch}, step {step}")
                
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
            scaler.step(optimizer)
            scaler.update()
            
            running_loss += loss.item() * inputs.size(0)
            preds = torch.argmax(outputs, dim=1)
            correct += (preds == targets).sum().item()
            total += targets.size(0)
            
        current_lr = scheduler.get_last_lr()[0]
        scheduler.step()
        
        train_loss = running_loss / total
        train_acc = correct / total
        
        # Validation Evaluation
        val_metrics = evaluate_model(model, val_loader, criterion, device)
        epoch_time = time.time() - epoch_start
        
        print(f"Epoch [{epoch:2d}/{epochs:2d}] ({epoch_time:.1f}s) | "
              f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}% | "
              f"Val Loss: {val_metrics['loss']:.4f} | Val Acc: {val_metrics['acc']*100:.2f}% | "
              f"Val Macro-F1: {val_metrics['macro_f1']:.4f} (Best: {best_val_f1:.4f})", flush=True)
              
        history_entry = {
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 4),
            "val_loss": round(val_metrics["loss"], 4),
            "val_acc": round(val_metrics["acc"], 4),
            "val_macro_f1": round(val_metrics["macro_f1"], 4),
            "lr": round(current_lr, 7),
            "duration_sec": round(epoch_time, 1)
        }
        history.append(history_entry)

        # Checkpoint if best macro-F1
        if val_metrics["macro_f1"] > best_val_f1:
            best_val_f1 = val_metrics["macro_f1"]
            best_epoch = epoch
            epochs_no_improve = 0
            
            checkpoint = {
                "experiment_name": experiment_name,
                "architecture": arch_name,
                "pretrained": pretrained,
                "weights_mode": "imagenet_transfer" if pretrained else "random_from_scratch",
                "random_seed": seed,
                "image_size": image_size,
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "num_classes": len(CANONICAL_CLASSES),
                "classes": CANONICAL_CLASSES,
                "val_acc": val_metrics["acc"],
                "val_macro_f1": val_metrics["macro_f1"],
                "val_per_class_f1": val_metrics["per_class_f1"],
                "val_per_class_prec": val_metrics["per_class_prec"],
                "val_per_class_rec": val_metrics["per_class_rec"],
                "train_manifest": train_manifest,
                "val_manifest": val_manifest,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            torch.save(checkpoint, out_dir / "best_model.pth")
            print(f"  --> Saved new best checkpoint to {out_dir / 'best_model.pth'} (Val Macro-F1: {best_val_f1:.4f})", flush=True)
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience and epoch >= 15:
                print(f"Early stopping triggered after {epoch} epochs (patience: {patience})", flush=True)
                break

    total_training_time = time.time() - start_total_time
    peak_vram_alloc = torch.cuda.max_memory_allocated(device) / (1024**2) if device.type == "cuda" else 0.0
    peak_vram_res = torch.cuda.max_memory_reserved(device) / (1024**2) if device.type == "cuda" else 0.0

    print("\n" + "=" * 70, flush=True)
    print(f"EXPERIMENT COMPLETE: {experiment_name}", flush=True)
    print(f"Best Epoch: {best_epoch} | Best Val Macro-F1: {best_val_f1:.4f}", flush=True)
    print(f"Total Time: {total_training_time/60:.2f} mins | Peak VRAM Alloc: {peak_vram_alloc:.1f} MB | Reserved: {peak_vram_res:.1f} MB", flush=True)
    print("=" * 70, flush=True)

    # Save final report
    summary = {
        "experiment_name": experiment_name,
        "architecture": arch_name,
        "pretrained": pretrained,
        "initialization": "ImageNet-1k pretrained" if pretrained else "random_from_scratch (Kaiming)",
        "image_size": image_size,
        "batch_size": batch_size,
        "learning_rate": lr,
        "weight_decay": weight_decay,
        "augmentation": augmentation,
        "optimizer": "AdamW",
        "scheduler": "WarmupCosineDecay",
        "seed": seed,
        "epochs_trained": len(history),
        "best_epoch": best_epoch,
        "best_val_macro_f1": round(best_val_f1, 4),
        "best_val_acc": round(history[best_epoch - 1]["val_acc"], 4) if best_epoch > 0 else 0.0,
        "total_training_time_min": round(total_training_time / 60, 2),
        "peak_vram_allocated_mb": round(peak_vram_alloc, 1),
        "peak_vram_reserved_mb": round(peak_vram_res, 1),
        "train_manifest": train_manifest,
        "val_manifest": val_manifest,
        "checkpoint_path": str(out_dir / "best_model.pth"),
        "history": history
    }

    with open(out_dir / "experiment_metrics.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return summary

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", type=str, required=True)
    parser.add_argument("--arch", type=str, default="mobilenet_v3_small")
    parser.add_argument("--pretrained", action="store_true")
    parser.add_argument("--size", type=int, default=224)
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--aug", type=str, default="enhanced", choices=["standard", "enhanced", "mixup_cutmix"])
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--patience", type=int, default=8)
    args = parser.parse_args()

    run_experiment(
        experiment_name=args.name,
        arch_name=args.arch,
        pretrained=args.pretrained,
        image_size=args.size,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        augmentation=args.aug,
        patience=args.patience,
        seed=args.seed
    )
