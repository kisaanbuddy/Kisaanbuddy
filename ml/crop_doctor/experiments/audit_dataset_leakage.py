"""
Comprehensive Dataset Leakage and Manifest Audit.
Checks for exact SHA256 matches, dHash collisions, label contradictions,
source distributions, and verifies whether untouched field datasets exist.
"""

import sys
import json
import os
from pathlib import Path
from collections import Counter

manifest_paths = {
    "train_v2": "ml/crop_doctor/data/splits_v2/train_manifest_v2.json",
    "val_v2": "ml/crop_doctor/data/splits_v2/val_manifest_v2.json",
    "internal_test": "ml/crop_doctor/data/splits/internal_test_manifest.json",
    "field_holdout": "ml/crop_doctor/data/splits/field_holdout_manifest.json",
    "ood_test": "ml/crop_doctor/data/splits/ood_test_manifest.json"
}

data = {}
for k, p in manifest_paths.items():
    with open(p, "r", encoding="utf-8") as f:
        data[k] = json.load(f)

print("=== SPLIT SAMPLE COUNTS ===")
for k, items in data.items():
    sources = Counter(x.get("source", "unknown") for x in items)
    classes = Counter(x.get("canonical_class", "unknown") for x in items)
    print(f"\n{k.upper()}: Total {len(items)} images")
    print(f"  Sources: {dict(sources)}")
    print(f"  Unique Classes: {len(classes)} classes")

# 1. Exact SHA256 cross-split collisions
sha_maps = {k: {item["sha256"]: item for item in items if "sha256" in item} for k, items in data.items()}
print("\n=== EXACT SHA256 CROSS-SPLIT COLLISIONS ===")
exact_collisions = {}
for k1 in list(sha_maps.keys()):
    for k2 in list(sha_maps.keys()):
        if k1 < k2:
            pair = f"{k1} vs {k2}"
            inter = set(sha_maps[k1].keys()) & set(sha_maps[k2].keys())
            exact_collisions[pair] = len(inter)
            print(f"  {pair}: {len(inter)} exact duplicate files")
            if inter:
                for s in list(inter)[:2]:
                    f1 = sha_maps[k1][s]["filepath"]
                    f2 = sha_maps[k2][s]["filepath"]
                    c1 = sha_maps[k1][s]["canonical_class"]
                    c2 = sha_maps[k2][s]["canonical_class"]
                    print(f"    * Collision: {f1} [{c1}] == {f2} [{c2}]")

# 2. dHash (perceptual) collisions
dhash_maps = {k: {item["dhash"]: item for item in items if "dhash" in item} for k, items in data.items()}
print("\n=== DHASH (PERCEPTUAL) CROSS-SPLIT COLLISIONS ===")
dhash_collisions = {}
for k1 in list(dhash_maps.keys()):
    for k2 in list(dhash_maps.keys()):
        if k1 < k2:
            pair = f"{k1} vs {k2}"
            inter = set(dhash_maps[k1].keys()) & set(dhash_maps[k2].keys())
            dhash_collisions[pair] = len(inter)
            print(f"  {pair}: {len(inter)} perceptual matches")
            if inter:
                for d in list(inter)[:2]:
                    f1 = dhash_maps[k1][d]["filepath"]
                    f2 = dhash_maps[k2][d]["filepath"]
                    c1 = dhash_maps[k1][d]["canonical_class"]
                    c2 = dhash_maps[k2][d]["canonical_class"]
                    print(f"    * Match: {f1} [{c1}] == {f2} [{c2}]")

# 3. Check for any other field datasets in data/ or raw/
print("\n=== INVENTORY OF DATA DIRECTORIES ===")
for root, dirs, files in os.walk("ml/crop_doctor/data"):
    # summarize top level directories
    p = Path(root)
    if len(p.parts) <= 5:
        num_imgs = sum(1 for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png')))
        if num_imgs > 0:
            print(f"  {p}: {num_imgs} images")

# 4. Check exclusions audit v2
if Path("ml/crop_doctor/data/splits_v2/audit_exclusions_v2.json").exists():
    with open("ml/crop_doctor/data/splits_v2/audit_exclusions_v2.json") as f:
        exclusions = json.load(f)
    print(f"\n=== AUDIT EXCLUSIONS V2 (Purged from train/val) ===")
    print(f"Total Purged Samples: {len(exclusions)}")
    excl_reasons = Counter(x.get("reason", "unknown") for x in exclusions)
    print(f"Reasons: {dict(excl_reasons)}")
