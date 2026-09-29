"""Dataset Acquisition, Quality Audit, Hashing, and Split Pipeline for KisaanBuddy.

Provides reproducible dataset synthesis/ingestion, exact duplicate detection via MD5,
data quality validation, train/val/test splitting, and isolated real_world_test curation.
"""
import os
import io
import json
import csv
import hashlib
import random
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Any
from PIL import Image, ImageDraw, ImageFilter

# Deterministic Seed
SEED = 42
random.seed(SEED)

CLASSES = [
    "rice_blast",
    "rice_bacterial_blight",
    "rice_brown_spot",
    "wheat_yellow_rust",
    "wheat_brown_rust",
    "tomato_late_blight",
    "tomato_early_blight",
    "tomato_leaf_curl",
    "tomato_healthy",
    "potato_late_blight",
    "potato_early_blight",
    "potato_healthy",
    "cotton_leaf_curl",
    "cotton_bacterial_blight",
    "healthy_general"
]

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "raw"
PROCESSED_DIR = BASE_DIR / "processed"
METADATA_DIR = BASE_DIR / "metadata"
REJECTED_DIR = BASE_DIR / "quarantine"

for d in [RAW_DIR, PROCESSED_DIR, METADATA_DIR, REJECTED_DIR]:
    d.mkdir(parents=True, exist_ok=True)


def generate_synthetic_leaf(cls_name: str, width: int = 224, height: int = 224, is_real_world: bool = False) -> Image.Image:
    """Generates a synthetic plant leaf image with class-specific visual patterns for pipeline validation."""
    if is_real_world:
        # Background: noisy outdoor soil / grass / ground
        bg_color = (random.randint(60, 100), random.randint(40, 70), random.randint(20, 50))
    else:
        # Studio clean background or subtle leaf backdrop
        bg_color = (240, 240, 240) if random.random() > 0.3 else (30, 30, 30)

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw main leaf shape (ellipse / polygon)
    leaf_color = (random.randint(30, 70), random.randint(120, 200), random.randint(30, 70))
    if "healthy" in cls_name:
        leaf_color = (30, random.randint(150, 220), 40)

    leaf_box = [random.randint(20, 40), random.randint(20, 40), width - random.randint(20, 40), height - random.randint(20, 40)]
    draw.ellipse(leaf_box, fill=leaf_color, outline=(20, 100, 20))

    # Add disease spots or patterns based on class
    if "blast" in cls_name or "rust" in cls_name:
        spot_color = (180, 100, 30) if "rust" in cls_name else (120, 80, 40)
        for _ in range(random.randint(5, 15)):
            x = random.randint(leaf_box[0] + 10, leaf_box[2] - 10)
            y = random.randint(leaf_box[1] + 10, leaf_box[3] - 10)
            r = random.randint(3, 8)
            draw.ellipse([x - r, y - r, x + r, y + r], fill=spot_color)
    elif "blight" in cls_name:
        spot_color = (60, 40, 20)
        for _ in range(random.randint(3, 8)):
            x = random.randint(leaf_box[0] + 10, leaf_box[2] - 10)
            y = random.randint(leaf_box[1] + 10, leaf_box[3] - 10)
            r = random.randint(8, 18)
            draw.ellipse([x - r, y - r, x + r, y + r], fill=spot_color)
    elif "curl" in cls_name:
        # Distorted lines / yellowing
        draw.line(leaf_box, fill=(200, 200, 50), width=5)

    if is_real_world:
        # Add blur or outdoor noise
        if random.random() > 0.5:
            img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))

    return img


def build_dataset(samples_per_class: int = 50, real_world_per_class: int = 20) -> Dict[str, Any]:
    """Populates raw & processed datasets, detects duplicates, splits train/val/test and real_world_test."""
    print(f"Building dataset with {samples_per_class} standard samples & {real_world_per_class} real-world samples per class...")
    
    seen_hashes = set()
    duplicates_count = 0
    rejected_count = 0
    manifest = []

    # 1. Generate / Audit Raw Images
    for cls in CLASSES:
        cls_raw_dir = RAW_DIR / cls
        cls_raw_dir.mkdir(parents=True, exist_ok=True)

        for i in range(samples_per_class + real_world_per_class):
            is_rw = i >= samples_per_class
            img_name = f"{cls}_{'rw_' if is_rw else ''}{i:04d}.jpg"
            img_path = cls_raw_dir / img_name

            if not img_path.exists():
                img = generate_synthetic_leaf(cls, is_real_world=is_rw)
                img.save(img_path, "JPEG", quality=90)

            # Compute MD5 hash for exact duplicate detection
            with open(img_path, "rb") as f:
                file_bytes = f.read()
                file_hash = hashlib.md5(file_bytes).hexdigest()

            # Data Quality Audit
            if len(file_bytes) < 500:  # Corrupted or zero byte check
                rejected_path = REJECTED_DIR / img_name
                img_path.rename(rejected_path)
                rejected_count += 1
                continue

            if file_hash in seen_hashes:
                duplicates_count += 1
                continue

            seen_hashes.add(file_hash)

            manifest.append({
                "path": str(img_path),
                "filename": img_name,
                "class": cls,
                "hash": file_hash,
                "is_real_world": is_rw,
                "size_bytes": len(file_bytes)
            })

    # 2. Partition into Train (70%), Val (15%), Test (15%), and Isolated Real-World Test
    standard_samples = [m for m in manifest if not m["is_real_world"]]
    real_world_samples = [m for m in manifest if m["is_real_world"]]

    random.shuffle(standard_samples)

    n_total = len(standard_samples)
    n_train = int(n_total * 0.70)
    n_val = int(n_total * 0.15)

    train_set = standard_samples[:n_train]
    val_set = standard_samples[n_train:n_train + n_val]
    test_set = standard_samples[n_train + n_val:]
    rw_set = real_world_samples  # Strictly isolated holdout

    # 3. Create Processed Directory Structure & Save Splits
    splits = {
        "train": train_set,
        "val": val_set,
        "test": test_set,
        "real_world_test": rw_set
    }

    split_counts = {}
    for split_name, items in splits.items():
        split_dir = PROCESSED_DIR / split_name
        split_dir.mkdir(parents=True, exist_ok=True)
        split_counts[split_name] = len(items)

        for item in items:
            dest_dir = split_dir / item["class"]
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest_path = dest_dir / item["filename"]
            if not dest_path.exists():
                Image.open(item["path"]).save(dest_path)

    # 4. Generate Dataset Quality & Split Summary Metadata
    summary = {
        "total_images": len(manifest),
        "total_classes": len(CLASSES),
        "classes": CLASSES,
        "duplicates_detected": duplicates_count,
        "rejected_images": rejected_count,
        "splits": split_counts
    }

    with open(METADATA_DIR / "dataset_report.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("Dataset Audit & Processing Complete!")
    print(json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dataset Curation and Audit Script")
    parser.add_argument("--samples", type=int, default=40, help="Standard samples per class")
    parser.add_argument("--real-world", type=int, default=15, help="Real-world samples per class")
    args = parser.parse_args()

    build_dataset(samples_per_class=args.samples, real_world_per_class=args.real_world)
