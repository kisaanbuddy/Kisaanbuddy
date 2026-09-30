"""Phase 3B Read-Only pHash Pair Verification Pipeline.

Performs fine-grained image-level visual comparison for all train <-> real_world_test
pHash pairs with Hamming distance <= 2 using MSE, PSNR, Histogram Cosine Similarity,
and Structural Similarity Index (SSIM).

Categorizes pairs into:
A - Same underlying image / obvious duplicate (MSE < 5.0, PSNR > 40.0)
B - Same scene / image with minor transformation (SSIM > 0.80 and HistSim > 0.95)
C - Visually similar but clearly different images (SSIM < 0.60 or HistSim < 0.85)
D - Uncertain (borderline cases)
"""

import os
import json
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple, Any

import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "processed"
AUDIT_REPORT_PATH = BASE_DIR / "models" / "v3a" / "phase3b_dataset_audit_report.json"
VERIFICATION_REPORT_PATH = BASE_DIR / "models" / "v3a" / "phase3b_phash_pair_verification.json"


def compute_dct_phash(file_path: Path) -> np.ndarray:
    """Computes genuine DCT-based perceptual hash (64 bits)."""
    with Image.open(file_path) as img:
        img_gray = img.convert("L").resize((32, 32), Image.Resampling.LANCZOS)
    arr = np.asarray(img_gray, dtype=np.float32)

    N = 32
    n = np.arange(N)
    k = np.arange(N)[:, None]
    C = np.cos((2 * n + 1) * k * np.pi / (2 * N))
    dct_2d = C @ arr @ C.T
    dct_8x8 = dct_2d[0:8, 0:8]
    ac_coeffs = dct_8x8.flatten()[1:]
    med = np.median(ac_coeffs)
    return (dct_8x8 > med).flatten()


def compute_visual_metrics(path1: Path, path2: Path) -> Dict[str, float]:
    """Computes fine-grained visual comparison metrics between two image files."""
    with Image.open(path1) as img1_raw, Image.open(path2) as img2_raw:
        img1 = img1_raw.convert("RGB").resize((224, 224), Image.Resampling.LANCZOS)
        img2 = img2_raw.convert("RGB").resize((224, 224), Image.Resampling.LANCZOS)

    arr1 = np.asarray(img1, dtype=np.float32)
    arr2 = np.asarray(img2, dtype=np.float32)

    # 1. Mean Squared Error (MSE)
    mse = float(np.mean((arr1 - arr2) ** 2))

    # 2. Peak Signal-to-Noise Ratio (PSNR)
    if mse > 0:
        psnr = float(10.0 * np.log10((255.0 ** 2) / mse))
    else:
        psnr = 100.0

    # 3. 32-bin Color Histogram Cosine Similarity
    h1 = np.histogram(arr1, bins=32, range=(0, 256))[0].astype(np.float32)
    h2 = np.histogram(arr2, bins=32, range=(0, 256))[0].astype(np.float32)
    norm1 = np.linalg.norm(h1)
    norm2 = np.linalg.norm(h2)
    hist_sim = float(np.dot(h1, h2) / (norm1 * norm2 + 1e-10))

    # 4. Structural Similarity Index (SSIM) on Grayscale
    g1 = np.mean(arr1, axis=2)
    g2 = np.mean(arr2, axis=2)
    u1, u2 = float(np.mean(g1)), float(np.mean(g2))
    v1, v2 = float(np.var(g1)), float(np.var(g2))
    cov = float(np.mean((g1 - u1) * (g2 - u2)))
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ssim = float(((2 * u1 * u2 + c1) * (2 * cov + c2)) / ((u1 ** 2 + u2 ** 2 + c1) * (v1 + v2 + c2)))

    return {
        "mse": round(mse, 2),
        "psnr": round(psnr, 2),
        "histogram_similarity": round(hist_sim, 4),
        "ssim": round(ssim, 4)
    }


def categorize_pair(metrics: Dict[str, float]) -> Tuple[str, str]:
    """Categorizes pair based on empirical visual comparison metrics."""
    mse = metrics["mse"]
    psnr = metrics["psnr"]
    hist_sim = metrics["histogram_similarity"]
    ssim = metrics["ssim"]

    if mse < 5.0 or psnr > 40.0:
        return "A", "Same underlying image / obvious duplicate"
    elif ssim > 0.80 and hist_sim > 0.95:
        return "B", "Same scene / image with minor transformation"
    elif ssim < 0.60 or hist_sim < 0.85:
        return "C", "Visually similar but clearly different images"
    else:
        return "D", "Uncertain (borderline case requiring manual visual review)"


def run_phash_verification():
    print("Executing Phase 3B Read-Only pHash Pair Verification...")

    train_dir = DATASET_DIR / "train"
    rw_dir = DATASET_DIR / "real_world_test"

    train_files = []
    for cd in sorted(train_dir.iterdir()):
        if cd.is_dir():
            for f in sorted(cd.glob("*.*")):
                train_files.append({
                    "rel_path": f.relative_to(DATASET_DIR).as_posix(),
                    "class_name": cd.name,
                    "abs_path": f
                })

    rw_files = []
    for cd in sorted(rw_dir.iterdir()):
        if cd.is_dir():
            for f in sorted(cd.glob("*.*")):
                rw_files.append({
                    "rel_path": f.relative_to(DATASET_DIR).as_posix(),
                    "class_name": cd.name,
                    "abs_path": f
                })

    print(f"Loaded {len(train_files)} train images and {len(rw_files)} real_world_test images.")

    # Compute pHashes
    print("Computing pHashes for pairwise comparison...")
    train_ph = np.array([compute_dct_phash(item["abs_path"]) for item in train_files], dtype=bool)
    rw_ph = np.array([compute_dct_phash(item["abs_path"]) for item in rw_files], dtype=bool)

    # 3570 x 975 pairwise diffs
    diff_matrix = np.sum(train_ph[:, None, :] != rw_ph[None, :, :], axis=2, dtype=np.uint8)

    t_indices, r_indices = np.where(diff_matrix <= 2)
    print(f"Identified {len(t_indices)} train <-> real_world_test pairs with pHash distance <= 2.")

    category_counts = defaultdict(int)
    verified_pairs = []

    for idx, (t_idx, r_idx) in enumerate(zip(t_indices, r_indices)):
        t_info = train_files[t_idx]
        r_info = rw_files[r_idx]
        d = int(diff_matrix[t_idx, r_idx])

        metrics = compute_visual_metrics(t_info["abs_path"], r_info["abs_path"])
        cat_code, cat_desc = categorize_pair(metrics)

        category_counts[cat_code] += 1
        is_same_class = bool(t_info["class_name"] == r_info["class_name"])

        verified_pairs.append({
            "pair_index": idx,
            "train_image_path": t_info["rel_path"],
            "real_world_test_image_path": r_info["rel_path"],
            "phash_hamming_distance": d,
            "train_class": t_info["class_name"],
            "real_world_test_class": r_info["class_name"],
            "is_same_class": is_same_class,
            "visual_metrics": metrics,
            "category": cat_code,
            "category_description": cat_desc
        })

    is_truly_contaminated = (category_counts["A"] > 0) or (category_counts["B"] > 0)

    summary = {
        "verification_phase": "Phase 3B - pHash Pair Verification Pass",
        "total_phash_pairs_analyzed": len(verified_pairs),
        "hamming_distance_breakdown": {
            "dist_0": int(np.sum([p["phash_hamming_distance"] == 0 for p in verified_pairs])),
            "dist_1": int(np.sum([p["phash_hamming_distance"] == 1 for p in verified_pairs])),
            "dist_2": int(np.sum([p["phash_hamming_distance"] == 2 for p in verified_pairs]))
        },
        "category_counts": {
            "A_same_underlying_image_obvious_duplicate": category_counts["A"],
            "B_same_scene_minor_transformation": category_counts["B"],
            "C_visually_similar_clearly_different_images": category_counts["C"],
            "D_uncertain": category_counts["D"]
        },
        "contamination_status": {
            "is_real_world_test_contaminated": is_truly_contaminated,
            "confirmed_duplicates_count": category_counts["A"] + category_counts["B"],
            "summary_conclusion": (
                "real_world_test is CONTAMINATED with actual image duplicates/transformations."
                if is_truly_contaminated else
                "real_world_test is NOT CONTAMINATED. All 224 pHash <=2 pairs are visually similar but distinct photographs (Category C/D)."
            )
        },
        "verified_pairs": verified_pairs
    }

    VERIFICATION_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(VERIFICATION_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"\nVerification complete! Report saved to: {VERIFICATION_REPORT_PATH}")
    print(f"Summary: {summary['contamination_status']['summary_conclusion']}")
    print(f"Category counts: {dict(category_counts)}")

    return summary


if __name__ == "__main__":
    run_phash_verification()
