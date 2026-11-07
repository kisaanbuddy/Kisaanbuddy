"""Independent Dataset Export Pipeline for Supervised Agricultural Field Pilot.

Exports only expert-verified observations with explicit farmer research consent.
Enforces session-isolated splitting (prevents session leakage), perceptual hash
deduplication (dHash), and produces reproducible V2 manifest files.
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import logging
import os
import random
import sys
from typing import Any, Dict, List, Set, Tuple

# Ensure repository root is on sys.path
_repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)
backend_path = os.path.join(_repo_root, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.models import AdvisoryCase, Base
from ml.crop_doctor.training.dataset import CANONICAL_CLASSES

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("export_pilot_dataset")

VALID_GROUND_TRUTH_OUTCOMES = {
    "confirmed_correct",
    "correct_crop_incorrect_disease",
    "incorrect_crop",
}

EXCLUDED_OUTCOMES = {
    "uncertain_diagnosis",
    "unable_to_assess_photograph",
    "additional_photograph_required",
}


def hamming_distance(hex1: str, hex2: str) -> int:
    """Computes bitwise Hamming distance between two hex-encoded difference hashes."""
    if not hex1 or not hex2 or len(hex1) != len(hex2):
        return 64
    try:
        val1 = int(hex1, 16)
        val2 = int(hex2, 16)
        xor_val = val1 ^ val2
        return bin(xor_val).count("1")
    except ValueError:
        return 64


def resolve_canonical_label(crop: str, condition: str, is_healthy: bool) -> str:
    """Maps expert-confirmed crop and condition to canonical class name if valid."""
    if is_healthy:
        crop_clean = crop.strip().lower().replace(" ", "_")
        cand = f"{crop_clean}_healthy"
        if cand in CANONICAL_CLASSES:
            return cand
    
    # Check exact match
    cond_clean = condition.strip().lower().replace(" ", "_")
    if cond_clean in CANONICAL_CLASSES:
        return cond_clean
    
    # Try crop + condition prefix
    crop_prefix = crop.strip().lower().replace(" ", "_")
    if not cond_clean.startswith(crop_prefix):
        combined = f"{crop_prefix}_{cond_clean}"
        if combined in CANONICAL_CLASSES:
            return combined
            
    return cond_clean


def export_pilot_dataset(
    db_session: Any,
    output_dir: str,
    locked_eval_ratio: float = 0.20,
    min_dhash_dist: int = 4,
    seed: int = 42,
) -> Dict[str, Any]:
    """
    Queries verified advisory cases, filters for consent, deduplicates,
    groups by session_id, and writes train and locked-evaluation manifests.
    """
    random.seed(seed)
    os.makedirs(output_dir, exist_ok=True)

    log.info("Querying advisory cases from database...")
    all_cases = db_session.query(AdvisoryCase).all()
    log.info("Total advisory cases in DB: %d", len(all_cases))

    # 1. Eligibility Filtering
    eligible_samples: List[Dict[str, Any]] = []
    excluded_no_consent = 0
    excluded_unverified = 0
    excluded_uncertain = 0

    for c in all_cases:
        # Check consent
        if not c.consent_for_research:
            excluded_no_consent += 1
            continue

        # Check review outcome
        if c.review_outcome not in VALID_GROUND_TRUTH_OUTCOMES:
            if c.review_outcome in EXCLUDED_OUTCOMES:
                excluded_uncertain += 1
            else:
                excluded_unverified += 1
            continue

        # Determine true label
        confirmed_crop = c.expert_crop or c.crop_name
        confirmed_disease = c.expert_disease or c.ai_predicted_disease or "unknown"
        is_healthy = bool(c.expert_is_healthy)

        canonical_label = resolve_canonical_label(confirmed_crop, confirmed_disease, is_healthy)
        if canonical_label not in CANONICAL_CLASSES:
            log.warning("Case %s label '%s' not in canonical 17 classes; preserving but tagging as non-canonical", c.case_id, canonical_label)

        sample = {
            "case_id": c.case_id,
            "session_id": c.session_id or f"sess_farmer_{c.user_id or c.id}",
            "image_url": c.image_url,
            "dhash": c.dhash or "",
            "crop": confirmed_crop,
            "condition": confirmed_disease,
            "canonical_label": canonical_label,
            "is_healthy": is_healthy,
            "review_outcome": c.review_outcome,
            "original_ai_prediction": c.ai_predicted_disease,
            "original_ai_confidence": c.ai_confidence,
            "ai_status": c.ai_status,
            "model_version": c.model_version,
            "artifact_hash": c.artifact_hash,
            "state": c.state,
            "district": c.district,
            "reviewer_name": c.reviewer_name,
            "reviewed_at": c.reviewed_at.isoformat() if c.reviewed_at else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        eligible_samples.append(sample)

    log.info("Eligible samples after verification & consent gating: %d", len(eligible_samples))
    log.info("Excluded (No consent): %d | Excluded (Unverified): %d | Excluded (Uncertain/Unassessable): %d",
             excluded_no_consent, excluded_unverified, excluded_uncertain)

    # 2. Perceptual Deduplication (dHash distance check)
    deduped_samples: List[Dict[str, Any]] = []
    seen_hashes: List[Tuple[str, str]] = []  # (case_id, dhash)
    excluded_duplicates = 0

    for s in eligible_samples:
        shash = s["dhash"]
        if not shash:
            deduped_samples.append(s)
            continue

        is_dup = False
        for seen_id, seen_h in seen_hashes:
            dist = hamming_distance(shash, seen_h)
            if dist < min_dhash_dist:
                is_dup = True
                log.info("Perceptual collision detected: %s with %s (dist=%d < %d)", s["case_id"], seen_id, dist, min_dhash_dist)
                break

        if is_dup:
            excluded_duplicates += 1
        else:
            seen_hashes.append((s["case_id"], shash))
            deduped_samples.append(s)

    log.info("Deduplication complete. Remaining unique observations: %d (Purged near-duplicates: %d)",
             len(deduped_samples), excluded_duplicates)

    # 3. Session-Grouped Splitting (Zero Session Leakage)
    sessions: Dict[str, List[Dict[str, Any]]] = {}
    for s in deduped_samples:
        sess_id = s["session_id"]
        if sess_id not in sessions:
            sessions[sess_id] = []
        sessions[sess_id].append(s)

    sorted_session_ids = sorted(list(sessions.keys()))
    random.shuffle(sorted_session_ids)

    n_locked = int(len(sorted_session_ids) * locked_eval_ratio)
    locked_session_ids = set(sorted_session_ids[:n_locked])
    train_session_ids = set(sorted_session_ids[n_locked:])

    train_samples: List[Dict[str, Any]] = []
    locked_eval_samples: List[Dict[str, Any]] = []

    for sess_id, sample_list in sessions.items():
        if sess_id in locked_session_ids:
            for item in sample_list:
                item_copy = dict(item)
                item_copy["split"] = "locked_evaluation"
                locked_eval_samples.append(item_copy)
        else:
            for item in sample_list:
                item_copy = dict(item)
                item_copy["split"] = "train"
                train_samples.append(item_copy)

    log.info("Session-Grouped Splitting: %d unique sessions total.", len(sessions))
    log.info("  -> Train Sessions: %d (%d samples)", len(train_session_ids), len(train_samples))
    log.info("  -> Locked Evaluation Sessions: %d (%d samples)", len(locked_session_ids), len(locked_eval_samples))

    # Verify zero session intersection
    intersection = train_session_ids.intersection(locked_session_ids)
    assert len(intersection) == 0, f"Critical integrity failure: {intersection} sessions shared across splits!"

    # 4. Generate Manifest Artifacts
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    train_manifest = {
        "manifest_version": "2.1.0-field-pilot-train",
        "generated_at": timestamp,
        "split_name": "train",
        "total_samples": len(train_samples),
        "total_sessions": len(train_session_ids),
        "samples": train_samples,
    }
    locked_eval_manifest = {
        "manifest_version": "2.1.0-field-pilot-locked-eval",
        "generated_at": timestamp,
        "split_name": "locked_evaluation",
        "total_samples": len(locked_eval_samples),
        "total_sessions": len(locked_session_ids),
        "samples": locked_eval_samples,
    }
    master_manifest = {
        "manifest_version": "2.1.0-field-pilot-master",
        "generated_at": timestamp,
        "total_eligible_samples": len(deduped_samples),
        "total_unique_sessions": len(sessions),
        "exclusion_summary": {
            "excluded_no_consent": excluded_no_consent,
            "excluded_unverified": excluded_unverified,
            "excluded_uncertain": excluded_uncertain,
            "excluded_perceptual_duplicates": excluded_duplicates,
        },
        "train_samples": len(train_samples),
        "locked_eval_samples": len(locked_eval_samples),
    }

    train_path = os.path.join(output_dir, "pilot_train_manifest.json")
    locked_eval_path = os.path.join(output_dir, "pilot_locked_evaluation_manifest.json")
    master_path = os.path.join(output_dir, "pilot_export_summary.json")

    with open(train_path, "w", encoding="utf-8") as f:
        json.dump(train_manifest, f, indent=2)
    with open(locked_eval_path, "w", encoding="utf-8") as f:
        json.dump(locked_eval_manifest, f, indent=2)
    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(master_manifest, f, indent=2)

    log.info("Saved train manifest to: %s", train_path)
    log.info("Saved locked evaluation manifest to: %s", locked_eval_path)
    log.info("Saved export summary to: %s", master_path)

    return master_manifest


def main():
    parser = argparse.ArgumentParser(description="Export Supervised Field Pilot Verified Observations")
    parser.add_argument("--db-url", type=str, default="", help="SQLAlchemy database connection URL")
    parser.add_argument("--output-dir", type=str, default="ml/crop_doctor/data/splits_v2/field_pilot", help="Destination manifest folder")
    parser.add_argument("--locked-eval-ratio", type=float, default=0.20, help="Ratio of sessions allocated to locked evaluation split")
    parser.add_argument("--min-dhash-dist", type=int, default=4, help="Hamming distance below which images are classified as duplicates")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for splitting")
    args = parser.parse_args()

    # Determine database URL
    db_url = args.db_url
    if not db_url:
        from db.session import DATABASE_URL
        db_url = DATABASE_URL

    log.info("Connecting to database: %s", db_url.split("@")[-1] if "@" in db_url else db_url)
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    try:
        summary = export_pilot_dataset(
            db_session=session,
            output_dir=args.output_dir,
            locked_eval_ratio=args.locked_eval_ratio,
            min_dhash_dist=args.min_dhash_dist,
            seed=args.seed,
        )
        log.info("Field Pilot Export Pipeline completed successfully.")
        print(json.dumps(summary, indent=2))
    finally:
        session.close()


if __name__ == "__main__":
    main()
