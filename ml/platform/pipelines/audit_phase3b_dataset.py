"""Phase 3B Read-Only Dataset Duplicate & Leakage Audit.

Analyzes processed dataset splits:
- train (3,570)
- val (765)
- test (765)
- real_world_test (975)

Calculates:
1. Exact MD5 duplicates (within-split and all 6 cross-split pairs)
2. Genuine DCT-based pHash near-duplicates at Hamming distance thresholds <=1, <=2, <=3
3. Cross-split leakage and real_world_test contamination status
"""

import os
import json
import hashlib
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple, Any

import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
REPORT_PATH = BASE_DIR / "models" / "v3a" / "phase3b_dataset_audit_report.json"

SPLITS = ["train", "val", "test", "real_world_test"]
SPLIT_PAIRS = [
    ("train", "val"),
    ("train", "test"),
    ("train", "real_world_test"),
    ("val", "test"),
    ("val", "real_world_test"),
    ("test", "real_world_test")
]


def get_split_pair_key(s1: str, s2: str) -> str:
    """Returns canonical cross-split key e.g. 'train_vs_real_world_test'."""
    pair_set = {s1, s2}
    for p1, p2 in SPLIT_PAIRS:
        if pair_set == {p1, p2}:
            return f"{p1}_vs_{p2}"
    return f"{s1}_vs_{s2}"


def compute_md5(file_path: Path) -> str:
    """Computes MD5 hash of a file."""
    hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def compute_dct_phash(file_path: Path) -> np.ndarray:
    """Computes genuine DCT-based perceptual hash (64 bits).

    Flow:
    1. Grayscale 32x32 image using LANCZOS resampling
    2. 2D Discrete Cosine Transform (DCT-II) via NumPy matrix operations
    3. 8x8 low-frequency region (top-left)
    4. Exclude DC coefficient [0,0] for median calculation
    5. Binary thresholding (dct_8x8 > median) -> 64-bit boolean array
    """
    with Image.open(file_path) as img:
        img_gray = img.convert("L").resize((32, 32), Image.Resampling.LANCZOS)
    arr = np.asarray(img_gray, dtype=np.float32)

    # 2D DCT-II matrix computation
    N = 32
    n = np.arange(N)
    k = np.arange(N)[:, None]
    C = np.cos((2 * n + 1) * k * np.pi / (2 * N))
    dct_2d = C @ arr @ C.T

    # Extract top-left 8x8 low-frequency region
    dct_8x8 = dct_2d[0:8, 0:8]

    # Exclude DC coefficient [0,0] for median
    ac_coeffs = dct_8x8.flatten()[1:]
    med = np.median(ac_coeffs)

    # 64-bit boolean hash
    return (dct_8x8 > med).flatten()


def run_dataset_audit():
    print("Starting Phase 3B Read-Only Dataset Audit...")
    print(f"Dataset location: {DATASET_DIR}")

    images_info = []
    split_counts = defaultdict(int)
    split_md5_counts = {split: defaultdict(int) for split in SPLITS}
    md5_to_images = defaultdict(list)

    # 1. Scan images & compute MD5 + pHash
    print("Scanning images, computing MD5 hashes and DCT pHashes...")
    for split in SPLITS:
        split_dir = DATASET_DIR / split
        if not split_dir.exists():
            raise FileNotFoundError(f"Split directory not found: {split_dir}")

        for class_dir in sorted(split_dir.iterdir()):
            if not class_dir.is_dir():
                continue
            class_name = class_dir.name
            for img_file in sorted(class_dir.glob("*.*")):
                if img_file.suffix.lower() not in [".jpg", ".jpeg", ".png", ".bmp"]:
                    continue

                rel_path = img_file.relative_to(DATASET_DIR).as_posix()
                md5_val = compute_md5(img_file)
                phash_val = compute_dct_phash(img_file)

                img_id = len(images_info)
                info = {
                    "id": img_id,
                    "rel_path": rel_path,
                    "split": split,
                    "class_name": class_name,
                    "md5": md5_val,
                    "phash": phash_val
                }
                images_info.append(info)
                split_counts[split] += 1
                split_md5_counts[split][md5_val] += 1
                md5_to_images[md5_val].append(info)

    total_images = len(images_info)
    print(f"Scanned {total_images} total images across {len(SPLITS)} splits.")
    for s in SPLITS:
        print(f"  - {s}: {split_counts[s]} images")

    # 2. Exact Duplicates Calculation
    print("\nCalculating exact MD5 duplicates...")
    within_split_exact_pairs = {}
    for s in SPLITS:
        pairs = sum(n * (n - 1) // 2 for n in split_md5_counts[s].values() if n > 1)
        within_split_exact_pairs[s] = pairs

    cross_split_exact_pairs = {}
    for s1, s2 in SPLIT_PAIRS:
        key = f"{s1}_vs_{s2}"
        common_md5s = set(split_md5_counts[s1].keys()) & set(split_md5_counts[s2].keys())
        pairs = sum(split_md5_counts[s1][m] * split_md5_counts[s2][m] for m in common_md5s)
        cross_split_exact_pairs[key] = pairs

    exact_dup_groups = []
    for md5_val, img_list in md5_to_images.items():
        if len(img_list) > 1:
            exact_dup_groups.append({
                "md5": md5_val,
                "count": len(img_list),
                "instances": [
                    {
                        "rel_path": img["rel_path"],
                        "split": img["split"],
                        "class_name": img["class_name"]
                    }
                    for img in img_list
                ]
            })

    # 3. Vectorized pHash Hamming Distance Computation
    print("\nComputing pairwise pHash Hamming distances...")
    phash_matrix = np.array([img["phash"] for img in images_info], dtype=bool)

    # Calculate 6075 x 6075 pairwise Hamming distances
    diff_matrix = np.sum(phash_matrix[:, None, :] != phash_matrix[None, :, :], axis=2, dtype=np.uint8)

    # Extract upper triangle indices (i < j)
    triu_i, triu_j = np.triu_indices(total_images, k=1)
    pair_dists = diff_matrix[triu_i, triu_j]

    phash_results = {}

    for thresh in [1, 2, 3]:
        print(f"Analyzing pHash near-duplicates at Hamming distance <= {thresh}...")
        match_mask = pair_dists <= thresh
        match_i = triu_i[match_mask]
        match_j = triu_j[match_mask]
        match_dists = pair_dists[match_mask]

        within_counts = defaultdict(int)
        cross_counts = {f"{s1}_vs_{s2}": 0 for s1, s2 in SPLIT_PAIRS}
        same_class_cnt = 0
        cross_class_cnt = 0
        class_pair_counts = defaultdict(int)
        rep_pairs = []

        for idx_i, idx_j, d in zip(match_i, match_j, match_dists):
            img_i = images_info[idx_i]
            img_j = images_info[idx_j]

            s_i, s_j = img_i["split"], img_j["split"]
            c_i, c_j = img_i["class_name"], img_j["class_name"]

            # Split breakdown
            if s_i == s_j:
                within_counts[s_i] += 1
            else:
                pair_key = get_split_pair_key(s_i, s_j)
                cross_counts[pair_key] += 1

            # Class breakdown
            if c_i == c_j:
                same_class_cnt += 1
            else:
                cross_class_cnt += 1
                c1, c2 = sorted([c_i, c_j])
                class_pair_counts[f"{c1} <-> {c2}"] += 1

            # Keep representative pairs (up to 100 per threshold)
            if len(rep_pairs) < 100:
                rep_pairs.append({
                    "image_1": img_i["rel_path"],
                    "image_2": img_j["rel_path"],
                    "split_1": s_i,
                    "split_2": s_j,
                    "class_1": c_i,
                    "class_2": c_j,
                    "hamming_distance": int(d)
                })

        # Format top 50 cross-class concentrations
        sorted_class_pairs = sorted(class_pair_counts.items(), key=lambda x: x[1], reverse=True)[:50]
        top_50_concentrations = [
            {"class_pair": k, "count": v} for k, v in sorted_class_pairs
        ]

        phash_results[f"threshold_le_{thresh}"] = {
            "threshold": thresh,
            "total_near_duplicate_pairs": int(np.sum(match_mask)),
            "within_split_counts": {s: within_counts[s] for s in SPLITS},
            "cross_split_counts": {
                f"{s1}_vs_{s2}": cross_counts[f"{s1}_vs_{s2}"] for s1, s2 in SPLIT_PAIRS
            },
            "same_class_count": same_class_cnt,
            "cross_class_count": cross_class_cnt,
            "top_50_cross_class_concentrations": top_50_concentrations,
            "representative_pairs": rep_pairs
        }

    # 4. Real-World Test Contamination Summary
    rw_exact_from_train = cross_split_exact_pairs.get("train_vs_real_world_test", 0)
    rw_exact_from_val = cross_split_exact_pairs.get("val_vs_real_world_test", 0)
    rw_exact_from_test = cross_split_exact_pairs.get("test_vs_real_world_test", 0)

    rw_phash_le_1_train = phash_results["threshold_le_1"]["cross_split_counts"].get("train_vs_real_world_test", 0)
    rw_phash_le_2_train = phash_results["threshold_le_2"]["cross_split_counts"].get("train_vs_real_world_test", 0)
    rw_phash_le_3_train = phash_results["threshold_le_3"]["cross_split_counts"].get("train_vs_real_world_test", 0)

    is_contaminated = (
        (rw_exact_from_train > 0) or
        (rw_phash_le_1_train > 0) or
        (rw_phash_le_2_train > 0)
    )

    rw_contamination = {
        "exact_leakage_from_train": rw_exact_from_train,
        "exact_leakage_from_val": rw_exact_from_val,
        "exact_leakage_from_test": rw_exact_from_test,
        "phash_leakage_dist_le_1_from_train": rw_phash_le_1_train,
        "phash_leakage_dist_le_2_from_train": rw_phash_le_2_train,
        "phash_leakage_dist_le_3_from_train": rw_phash_le_3_train,
        "is_contaminated": is_contaminated,
        "summary_notes": (
            "real_world_test is contaminated!" if is_contaminated else
            "real_world_test is clean of exact and near-duplicate leakage from training split."
        )
    }

    # Compile Full Audit Report
    report = {
        "audit_phase": "Phase 3B - Dataset & Leakage Audit",
        "dataset_summary": {
            "total_decoded_images": total_images,
            "split_counts": dict(split_counts)
        },
        "exact_duplicates": {
            "within_split_pairs": within_split_exact_pairs,
            "cross_split_pairs": cross_split_exact_pairs,
            "total_exact_duplicate_groups": len(exact_dup_groups),
            "exact_duplicate_groups": exact_dup_groups
        },
        "phash_near_duplicates": phash_results,
        "real_world_test_contamination": rw_contamination
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\nAudit complete! Report saved to: {REPORT_PATH}")
    return report


if __name__ == "__main__":
    run_dataset_audit()
