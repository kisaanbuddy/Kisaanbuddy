"""
Master Audit Execution Script for Metric Reproduction and Verification.
"""

import sys
import json
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(repo_root))

from ml.crop_doctor.experiments.audit_reproduce_metrics import run_independent_audit

out_dir = Path("ml/crop_doctor/artifacts/evaluations/audit")
out_dir.mkdir(parents=True, exist_ok=True)

models = [
    {
        "id": "exp_c2_efficientnet_b0",
        "ckpt": "ml/crop_doctor/artifacts/experiments/exp_c2_efficientnet_b0_pretrained_224/best_model.pth",
        "temp": 1.05  # We will test T=1.0 and fitted T
    },
    {
        "id": "exp_c1_mobilenet_v3",
        "ckpt": "ml/crop_doctor/artifacts/experiments/exp_c1_mobilenet_v3_pretrained_224/best_model.pth",
        "temp": 0.9758
    },
    {
        "id": "baseline_scratch",
        "ckpt": "ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth",
        "temp": 0.9472
    }
]

datasets = [
    ("internal_test", "ml/crop_doctor/data/splits/internal_test_manifest.json"),
    ("field_holdout", "ml/crop_doctor/data/splits/field_holdout_manifest.json"),
    ("val_v2", "ml/crop_doctor/data/splits_v2/val_manifest_v2.json")
]

audit_results = {}

for m in models:
    m_id = m["id"]
    audit_results[m_id] = {}
    print(f"\n=======================================================")
    print(f"AUDITING MODEL: {m_id} ({m['ckpt']})")
    print(f"=======================================================")
    for d_name, d_manifest in datasets:
        print(f"  Evaluating {d_name}...", flush=True)
        res = run_independent_audit(m["ckpt"], d_manifest, temperature=m["temp"])
        audit_results[m_id][d_name] = res
        
        with open(out_dir / f"{m_id}_{d_name}_audit.json", "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2)
            
        print(f"    Top-1: {res['top1_accuracy']*100:.2f}% | Top-3: {res['top3_accuracy']*100:.2f}% | "
              f"Macro-F1: {res['macro_f1']:.4f} | Weighted-F1: {res['weighted_f1']:.4f} | "
              f"ECE: {res['raw_calibration']['ece']:.4f} | NLL: {res['raw_calibration']['nll']:.4f} | "
              f"Brier: {res['raw_calibration']['brier']:.4f}")

with open(out_dir / "master_reproduced_metrics.json", "w", encoding="utf-8") as f:
    json.dump(audit_results, f, indent=2)

print("\nAll metrics independently reproduced and saved to ml/crop_doctor/artifacts/evaluations/audit/")
