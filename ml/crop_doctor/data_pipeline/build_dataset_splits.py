import os
import json
import hashlib
import random
from collections import defaultdict
from pathlib import Path
from PIL import Image, ImageOps
import numpy as np

# Random seed for reproducible dataset splitting
SPLIT_SEED = 42
random.seed(SPLIT_SEED)
np.random.seed(SPLIT_SEED)

CANONICAL_CLASSES = [
    "tomato_early_blight",
    "tomato_late_blight",
    "tomato_leaf_curl",
    "tomato_bacterial_spot",
    "tomato_septoria_leaf_spot",
    "tomato_leaf_mold",
    "tomato_healthy",
    "potato_early_blight",
    "potato_late_blight",
    "potato_healthy",
    "corn_leaf_blight",
    "corn_common_rust",
    "corn_gray_leaf_spot",
    "corn_healthy",
    "bell_pepper_bacterial_spot",
    "bell_pepper_healthy",
    "squash_powdery_mildew",
]

PLANTDOC_MAPPING = {
    "Tomato Early blight leaf": "tomato_early_blight",
    "Tomato leaf late blight": "tomato_late_blight",
    "Tomato leaf yellow virus": "tomato_leaf_curl",
    "Tomato leaf bacterial spot": "tomato_bacterial_spot",
    "Tomato Septoria leaf spot": "tomato_septoria_leaf_spot",
    "Tomato mold leaf": "tomato_leaf_mold",
    "Tomato leaf": "tomato_healthy",
    "Potato leaf early blight": "potato_early_blight",
    "Potato leaf late blight": "potato_late_blight",
    "Corn leaf blight": "corn_leaf_blight",
    "Corn rust leaf": "corn_common_rust",
    "Corn Gray leaf spot": "corn_gray_leaf_spot",
    "Bell_pepper leaf spot": "bell_pepper_bacterial_spot",
    "Bell_pepper leaf": "bell_pepper_healthy",
    "Squash Powdery mildew leaf": "squash_powdery_mildew",
}

PLANTVILLAGE_MAPPING = {
    "Tomato___Early_blight": "tomato_early_blight",
    "Tomato___Late_blight": "tomato_late_blight",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "tomato_leaf_curl",
    "Tomato___Bacterial_spot": "tomato_bacterial_spot",
    "Tomato___Septoria_leaf_spot": "tomato_septoria_leaf_spot",
    "Tomato___Leaf_Mold": "tomato_leaf_mold",
    "Tomato___healthy": "tomato_healthy",
    "Potato___Early_blight": "potato_early_blight",
    "Potato___Late_blight": "potato_late_blight",
    "Potato___healthy": "potato_healthy",
    "Corn_(maize)___Northern_Leaf_Blight": "corn_leaf_blight",
    "Corn_(maize)___Common_rust_": "corn_common_rust",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "corn_gray_leaf_spot",
    "Corn_(maize)___healthy": "corn_healthy",
    "Pepper,_bell___Bacterial_spot": "bell_pepper_bacterial_spot",
    "Pepper,_bell___healthy": "bell_pepper_healthy",
    "Squash___Powdery_mildew": "squash_powdery_mildew",
}

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def compute_dhash(image, hash_size=8):
    resized = image.convert("L").resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
    pixels = np.asarray(resized)
    diff = pixels[:, 1:] > pixels[:, :-1]
    return sum([2 ** i for (i, v) in enumerate(diff.flatten()) if v])

def compute_image_stats(image):
    gray = np.asarray(image.convert("L"), dtype=np.float32)
    # Laplacian kernel variance for blur
    laplacian = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
    from scipy.signal import convolve2d
    convolved = convolve2d(gray, laplacian, mode="valid")
    blur_score = float(np.var(convolved))
    brightness_mean = float(np.mean(gray))
    brightness_std = float(np.std(gray))
    return blur_score, brightness_mean, brightness_std

def process_image(filepath, source, canonical_class):
    try:
        with Image.open(filepath) as img:
            img = ImageOps.exif_transpose(img)
            img_rgb = img.convert("RGB")
            width, height = img_rgb.size
            
            blur, b_mean, b_std = compute_image_stats(img_rgb)
            dhash_val = compute_dhash(img_rgb)
            file_sha = compute_sha256(filepath)
            
            flags = []
            if blur < 15.0:
                flags.append("extreme_blur")
            if b_mean < 15.0:
                flags.append("underexposed")
            elif b_mean > 240.0:
                flags.append("overexposed")
            if width < 64 or height < 64:
                flags.append("insufficient_resolution")

            return {
                "filepath": str(filepath).replace("\\", "/"),
                "filename": os.path.basename(filepath),
                "source": source,
                "canonical_class": canonical_class,
                "sha256": file_sha,
                "dhash": hex(dhash_val),
                "dhash_int": dhash_val,
                "width": width,
                "height": height,
                "aspect_ratio": round(width / max(1, height), 3),
                "blur_score": round(blur, 2),
                "brightness_mean": round(b_mean, 2),
                "brightness_std": round(b_std, 2),
                "quality_flags": flags,
                "is_corrupt": False
            }
    except Exception as e:
        return {
            "filepath": str(filepath).replace("\\", "/"),
            "filename": os.path.basename(filepath),
            "source": source,
            "canonical_class": canonical_class,
            "is_corrupt": True,
            "error": str(e)
        }

def build_manifests():
    print("=== Starting Dataset Audit and Splitting Pipeline ===")
    
    seen_sha = set()
    dhash_map = defaultdict(list)
    
    in_distribution_samples = defaultdict(list)
    field_holdout_samples = defaultdict(list)
    ood_samples = []
    quarantined = []
    
    # 1. Ingest PlantDoc field test as pure field_holdout
    plantdoc_test_base = Path("ml/crop_doctor/data/extracted/plantdoc/test")
    if plantdoc_test_base.exists():
        for folder in plantdoc_test_base.iterdir():
            if not folder.is_dir():
                continue
            folder_name = folder.name
            if folder_name in PLANTDOC_MAPPING:
                cls_id = PLANTDOC_MAPPING[folder_name]
                for img_file in folder.glob("*.*"):
                    if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        rec = process_image(img_file, "plantdoc_field_test", cls_id)
                        if rec.get("is_corrupt"):
                            quarantined.append(rec)
                            continue
                        if rec["sha256"] in seen_sha:
                            rec["quarantine_reason"] = "exact_sha_duplicate"
                            quarantined.append(rec)
                            continue
                        seen_sha.add(rec["sha256"])
                        dhash_map[rec["dhash_int"]].append(rec)
                        field_holdout_samples[cls_id].append(rec)
            else:
                # Non-target classes serve as natural field OOD
                for img_file in folder.glob("*.*"):
                    if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        rec = process_image(img_file, "plantdoc_ood_field", "ood_unknown_plant")
                        if not rec.get("is_corrupt") and rec["sha256"] not in seen_sha:
                            seen_sha.add(rec["sha256"])
                            ood_samples.append(rec)

    print(f"Ingested {sum(len(v) for v in field_holdout_samples.values())} official field-holdout samples.")

    # 2. Ingest PlantDoc train (natural field in-the-wild training/validation images)
    plantdoc_train_base = Path("ml/crop_doctor/data/extracted/plantdoc/train")
    if plantdoc_train_base.exists():
        for folder in plantdoc_train_base.iterdir():
            if not folder.is_dir():
                continue
            folder_name = folder.name
            if folder_name in PLANTDOC_MAPPING:
                cls_id = PLANTDOC_MAPPING[folder_name]
                for img_file in folder.glob("*.*"):
                    if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        rec = process_image(img_file, "plantdoc_field_train", cls_id)
                        if rec.get("is_corrupt"):
                            quarantined.append(rec)
                            continue
                        if rec["sha256"] in seen_sha:
                            rec["quarantine_reason"] = "exact_sha_duplicate"
                            quarantined.append(rec)
                            continue
                        seen_sha.add(rec["sha256"])
                        dhash_map[rec["dhash_int"]].append(rec)
                        in_distribution_samples[cls_id].append(rec)
            else:
                for img_file in folder.glob("*.*"):
                    if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        rec = process_image(img_file, "plantdoc_ood_train", "ood_unknown_plant")
                        if not rec.get("is_corrupt") and rec["sha256"] not in seen_sha:
                            seen_sha.add(rec["sha256"])
                            ood_samples.append(rec)

    print(f"Ingested PlantDoc train samples across canonical classes.")

    # 3. Ingest PlantVillage clean training images (sample up to 250 clean images per class to balance dataset)
    plantvillage_base = Path("ml/crop_doctor/data/raw/plantvillage/raw/color")
    if plantvillage_base.exists():
        for folder_name, cls_id in PLANTVILLAGE_MAPPING.items():
            folder = plantvillage_base / folder_name
            if folder.is_dir():
                all_pv_files = sorted(list(folder.glob("*.*")))
                # Deterministic shuffle to pick a balanced subset
                rng = random.Random(hash(cls_id))
                rng.shuffle(all_pv_files)
                selected = all_pv_files[:250]
                
                count_added = 0
                for img_file in selected:
                    if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                        rec = process_image(img_file, "plantvillage_clean", cls_id)
                        if rec.get("is_corrupt"):
                            quarantined.append(rec)
                            continue
                        if rec["sha256"] in seen_sha:
                            rec["quarantine_reason"] = "exact_sha_duplicate"
                            quarantined.append(rec)
                            continue
                        seen_sha.add(rec["sha256"])
                        dhash_map[rec["dhash_int"]].append(rec)
                        in_distribution_samples[cls_id].append(rec)
                        count_added += 1

    # 4. Stratified Split Construction (train / val / internal_test)
    train_manifest = []
    val_manifest = []
    internal_test_manifest = []
    
    print("\nClass Distribution and Split Allocations:")
    for cls_id in CANONICAL_CLASSES:
        samples = in_distribution_samples[cls_id]
        rng = random.Random(42 + hash(cls_id))
        rng.shuffle(samples)
        
        n = len(samples)
        n_test = max(3, int(n * 0.10))
        n_val = max(4, int(n * 0.15))
        n_train = n - n_test - n_val
        
        test_part = samples[:n_test]
        val_part = samples[n_test:n_test + n_val]
        train_part = samples[n_test + n_val:]
        
        for s in train_part:
            s["split"] = "train"
        for s in val_part:
            s["split"] = "val"
        for s in test_part:
            s["split"] = "internal_test"
            
        train_manifest.extend(train_part)
        val_manifest.extend(val_part)
        internal_test_manifest.extend(test_part)
        
        fh_count = len(field_holdout_samples[cls_id])
        print(f"  {cls_id:28s} | Train: {len(train_part):3d} | Val: {len(val_part):3d} | Test: {len(test_part):3d} | Field Holdout: {fh_count:3d}")

    # Format field holdout manifest
    field_holdout_manifest = []
    for cls_id, samples in field_holdout_samples.items():
        for s in samples:
            s["split"] = "field_holdout"
            field_holdout_manifest.append(s)

    # Format OOD manifest
    ood_manifest = []
    for s in ood_samples[:300]:
        s["split"] = "ood_test"
        ood_manifest.append(s)

    # 5. Save immutable JSON manifests
    out_dir = Path("ml/crop_doctor/data/splits")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    def save_json(path, data):
        # Strip dhash_int before saving JSON
        clean_data = []
        for d in data:
            item = dict(d)
            item.pop("dhash_int", None)
            clean_data.append(item)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(clean_data, f, indent=2)
        print(f"Saved {len(clean_data)} records to {path}")

    save_json(out_dir / "train_manifest.json", train_manifest)
    save_json(out_dir / "val_manifest.json", val_manifest)
    save_json(out_dir / "internal_test_manifest.json", internal_test_manifest)
    save_json(out_dir / "field_holdout_manifest.json", field_holdout_manifest)
    save_json(out_dir / "ood_test_manifest.json", ood_manifest)
    
    # Save quarantine report
    with open(out_dir / "quarantine_manifest.json", "w", encoding="utf-8") as f:
        json.dump(quarantined, f, indent=2)

    # Audit summary
    audit_summary = {
        "total_acquired_clean": len(train_manifest) + len(val_manifest) + len(internal_test_manifest) + len(field_holdout_manifest) + len(ood_manifest),
        "train_count": len(train_manifest),
        "val_count": len(val_manifest),
        "internal_test_count": len(internal_test_manifest),
        "field_holdout_count": len(field_holdout_manifest),
        "ood_test_count": len(ood_manifest),
        "quarantined_count": len(quarantined),
        "canonical_classes_count": len(CANONICAL_CLASSES),
        "split_seed": SPLIT_SEED,
    }
    
    with open(out_dir / "dataset_audit_report.json", "w", encoding="utf-8") as f:
        json.dump(audit_summary, f, indent=2)
        
    print("\n=== Dataset Audit Complete ===")
    print(json.dumps(audit_summary, indent=2))

if __name__ == "__main__":
    build_manifests()
