"""Comprehensive Dataset Quality Audit and Leakage Verification Script for KisaanBuddy."""
import os
import json
import csv
import hashlib
from pathlib import Path
from typing import Dict, List, Set, Any
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "processed"
METADATA_DIR = BASE_DIR / "metadata"
LABEL_MAP_FILE = METADATA_DIR / "label_mapping.csv"

DATASET_SOURCES = [
    {"name": "PlantVillage", "url": "https://github.com/spMohanty/PlantVillage-Dataset", "license": "CC BY 4.0", "version": "v1.0 (2016)"},
    {"name": "PlantDoc", "url": "https://github.com/pratikkayal/PlantDoc-Dataset", "license": "MIT / Academic", "version": "v1.0 (2019)"},
    {"name": "Rice Leaf Diseases", "url": "https://www.kaggle.com/datasets/vbookshelf/rice-leaf-diseases", "license": "CC0 Public Domain", "version": "v1 (2019)"},
    {"name": "Wheat Disease Dataset", "url": "https://github.com/pau-research/wheat-diseases", "license": "Public Domain", "version": "v1 (2020)"},
    {"name": "Cotton Leaf Disease", "url": "https://www.kaggle.com/datasets/janmejayb/cotton-disease-dataset", "license": "CC0 Public Domain", "version": "v1 (2021)"}
]


def audit_dataset() -> Dict[str, Any]:
    print("Starting Comprehensive Dataset Quality Audit...")

    # 1. Load label mapping taxonomy & check status
    taxonomy_rows = []
    mapped_count = 0
    exact_count = 0
    ambiguous_rejected = 0

    if LABEL_MAP_FILE.exists():
        with open(LABEL_MAP_FILE, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                taxonomy_rows.append(row)
                status = row.get("mapping_status", "").strip().upper()
                if status == "EXACT":
                    exact_count += 1
                elif status == "MAPPED":
                    mapped_count += 1
                elif status in ["AMBIGUOUS", "REJECTED"]:
                    ambiguous_rejected += 1

    # 2. Collect files, calculate MD5 hashes, image dimensions, and split counts
    split_hashes: Dict[str, Set[str]] = {
        "train": set(),
        "val": set(),
        "test": set(),
        "real_world_test": set()
    }
    split_counts: Dict[str, int] = {}
    class_counts: Dict[str, int] = {}
    crop_counts: Dict[str, int] = {}
    dimensions: List[Tuple[int, int]] = []
    total_images = 0
    corrupt_images = 0
    duplicate_count = 0
    all_seen_hashes = set()

    for split in ["train", "val", "test", "real_world_test"]:
        split_dir = PROCESSED_DIR / split
        if not split_dir.exists():
            continue

        s_count = 0
        for cls_dir in split_dir.iterdir():
            if not cls_dir.is_dir():
                continue

            cls_name = cls_dir.name
            crop_name = cls_name.split("_")[0].capitalize()

            for img_path in cls_dir.glob("*.*"):
                if img_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
                    continue

                try:
                    with open(img_path, "rb") as f:
                        file_bytes = f.read()

                    if len(file_bytes) < 500:
                        corrupt_images += 1
                        continue

                    file_hash = hashlib.md5(file_bytes).hexdigest()
                    if file_hash in all_seen_hashes:
                        duplicate_count += 1
                    all_seen_hashes.add(file_hash)

                    split_hashes[split].add(file_hash)

                    with Image.open(img_path) as img:
                        dimensions.append(img.size)

                    s_count += 1
                    total_images += 1
                    class_counts[cls_name] = class_counts.get(cls_name, 0) + 1
                    crop_counts[crop_name] = crop_counts.get(crop_name, 0) + 1

                except Exception as e:
                    corrupt_images += 1

        split_counts[split] = s_count

    # 3. Check for Train / Test / Real-World Leakage
    train_rw_overlap = len(split_hashes["train"].intersection(split_hashes["real_world_test"]))
    val_rw_overlap = len(split_hashes["val"].intersection(split_hashes["real_world_test"]))
    test_rw_overlap = len(split_hashes["test"].intersection(split_hashes["real_world_test"]))
    train_test_overlap = len(split_hashes["train"].intersection(split_hashes["test"]))

    has_leakage = (train_rw_overlap > 0 or val_rw_overlap > 0 or test_rw_overlap > 0 or train_test_overlap > 0)

    # 4. Class Imbalance Calculation
    if class_counts:
        min_class = min(class_counts.values())
        max_class = max(class_counts.values())
        imbalance_ratio = round(max_class / max(1, min_class), 2)
    else:
        min_class = max_class = imbalance_ratio = 0

    # 5. Dimension Statistics
    if dimensions:
        widths = [d[0] for d in dimensions]
        heights = [d[1] for d in dimensions]
        dim_stats = {
            "min": [min(widths), min(heights)],
            "max": [max(widths), max(heights)],
            "mean": [round(sum(widths) / len(widths), 1), round(sum(heights) / len(heights), 1)]
        }
    else:
        dim_stats = {"min": [0, 0], "max": [0, 0], "mean": [0, 0]}

    report = {
        "sources": DATASET_SOURCES,
        "taxonomy": {
            "label_mappings_total": len(taxonomy_rows),
            "exact_matches": exact_count,
            "mapped_matches": mapped_count,
            "ambiguous_or_rejected": ambiguous_rejected
        },
        "total_usable_images": total_images,
        "splits": split_counts,
        "images_per_crop": crop_counts,
        "images_per_disease_class": class_counts,
        "class_imbalance": {
            "min_class_count": min_class,
            "max_class_count": max_class,
            "imbalance_ratio": imbalance_ratio
        },
        "data_quality": {
            "corrupted_images": corrupt_images,
            "duplicate_images": duplicate_count,
            "dimension_stats": dim_stats
        },
        "leakage_verification": {
            "train_real_world_overlap": train_rw_overlap,
            "val_real_world_overlap": val_rw_overlap,
            "test_real_world_overlap": test_rw_overlap,
            "train_test_overlap": train_test_overlap,
            "leakage_detected": has_leakage,
            "isolation_status": "PASSED (Zero Leakage)" if not has_leakage else "FAILED (Leakage Detected)"
        }
    }

    with open(METADATA_DIR / "dataset_audit_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("Audit Complete!")
    print(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    audit_dataset()
