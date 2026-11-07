"""
Fits temperature scaling on the validation set for the given checkpoint and records calibration stats.
"""

import sys
import json
import argparse
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(repo_root))

import torch
from torch.utils.data import DataLoader
from ml.crop_doctor.models.factory import create_model
from ml.crop_doctor.training.dataset import CropDoctorDataset, get_eval_transforms, CANONICAL_CLASSES
from ml.crop_doctor.inference.calibrator import ModelWithTemperature, evaluate_calibration

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ckpt", type=str, required=True)
    parser.add_argument("--val_manifest", type=str, default="ml/crop_doctor/data/splits_v2/val_manifest_v2.json")
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ckpt = torch.load(args.ckpt, map_location=device, weights_only=False)
    arch = ckpt.get("architecture", "mobilenet_v3_small")
    pretrained = ckpt.get("pretrained", ckpt.get("weights_mode") == "imagenet_transfer")

    model = create_model(arch, num_classes=len(CANONICAL_CLASSES), pretrained=pretrained)
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device).eval()

    val_ds = CropDoctorDataset(args.val_manifest, transform=get_eval_transforms(224), preload=False)
    val_loader = DataLoader(val_ds, batch_size=32, shuffle=False, num_workers=0)

    cal_model = ModelWithTemperature(model)
    opt_t = cal_model.calibrate(val_loader, device)

    before = evaluate_calibration(model, val_loader, device, temperature=1.0)
    after = evaluate_calibration(model, val_loader, device, temperature=opt_t)

    result = {
        "checkpoint": str(args.ckpt),
        "validation_manifest": str(args.val_manifest),
        "optimal_temperature": round(opt_t, 4),
        "uncalibrated_ece": round(before["ece"], 4),
        "calibrated_ece": round(after["ece"], 4),
        "accuracy": round(after["top1_accuracy"], 4),
        "bin_details": after["bin_details"]
    }

    print(f"Optimal Temperature: {opt_t:.4f}")
    print(f"Uncalibrated ECE: {before['ece']:.4f} -> Calibrated ECE: {after['ece']:.4f}")

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

if __name__ == "__main__":
    main()
