"""
Automated Batch Evaluator for Phase 4 Independent Evaluation.
Evaluates baseline, exp_a1, and exp_c1 across internal_test, field_holdout, and ood_test.
"""

import sys
import json
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(repo_root))

from ml.crop_doctor.experiments.evaluate import evaluate_checkpoint

models = [
    {
        "id": "baseline_scratch",
        "name": "Baseline (MobileNetV3-Small Scratch 10 ep)",
        "ckpt": "ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth"
    },
    {
        "id": "exp_a1_scratch_25ep",
        "name": "Exp A1 (MobileNetV3-Small Scratch 25 ep)",
        "ckpt": "ml/crop_doctor/artifacts/experiments/exp_a1_mobilenet_v3_small_scratch_224_std/best_model.pth"
    },
    {
        "id": "exp_c1_pretrained_15ep",
        "name": "Exp C1 (MobileNetV3-Small Pretrained 15 ep)",
        "ckpt": "ml/crop_doctor/artifacts/experiments/exp_c1_mobilenet_v3_pretrained_224/best_model.pth"
    }
]

datasets = [
    {
        "name": "internal_test",
        "manifest": "ml/crop_doctor/data/splits/internal_test_manifest.json",
        "is_ood": False
    },
    {
        "name": "field_holdout",
        "manifest": "ml/crop_doctor/data/splits/field_holdout_manifest.json",
        "is_ood": False
    },
    {
        "name": "ood_test",
        "manifest": "ml/crop_doctor/data/splits/ood_test_manifest.json",
        "is_ood": True
    }
]

out_dir = Path("ml/crop_doctor/artifacts/evaluations")
out_dir.mkdir(parents=True, exist_ok=True)

summary_table = []

for m in models:
    ckpt_path = Path(m["ckpt"])
    if not ckpt_path.exists():
        print(f"Skipping {m['id']} (checkpoint not found: {ckpt_path})")
        continue

    print(f"\n=======================================================")
    print(f"EVALUATING MODEL: {m['name']}")
    print(f"=======================================================")

    m_summary = {
        "model_id": m["id"],
        "model_name": m["name"],
        "checkpoint": m["ckpt"]
    }

    for d in datasets:
        manifest_path = Path(d["manifest"])
        if not manifest_path.exists():
            print(f"Manifest not found: {manifest_path}")
            continue

        print(f"  -> Testing on {d['name']} (is_ood={d['is_ood']})...", flush=True)
        res = evaluate_checkpoint(
            checkpoint_path=str(ckpt_path),
            manifest_path=str(manifest_path),
            image_size=224,
            is_ood=d["is_ood"]
        )

        out_file = out_dir / f"{m['id']}_{d['name']}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2)

        if not d["is_ood"]:
            print(f"     Top-1 Acc: {res['top1_accuracy']*100:.2f}% | Top-3 Acc: {res['top3_accuracy']*100:.2f}% | Macro-F1: {res['macro_f1']:.4f} | ECE: {res['ece']:.4f}")
            m_summary[f"{d['name']}_top1"] = res['top1_accuracy']
            m_summary[f"{d['name']}_top3"] = res['top3_accuracy']
            m_summary[f"{d['name']}_f1"] = res['macro_f1']
            m_summary[f"{d['name']}_ece"] = res['ece']
            m_summary[f"{d['name']}_sel60_acc"] = res['selective_prediction']['thresh_0.60']['selective_accuracy']
            m_summary[f"{d['name']}_sel60_rej"] = res['selective_prediction']['thresh_0.60']['rejection_rate']
        else:
            print(f"     OOD Mean Conf: {res['mean_confidence']:.4f} | OOD Rej Rate @ 0.60: {res['ood_rejection_metrics']['thresh_0.60']['rejection_rate']*100:.2f}%")
            m_summary["ood_mean_confidence"] = res['mean_confidence']
            m_summary["ood_rejection_rate_60"] = res['ood_rejection_metrics']['thresh_0.60']['rejection_rate']

    summary_table.append(m_summary)

with open(out_dir / "evaluation_summary.json", "w", encoding="utf-8") as f:
    json.dump(summary_table, f, indent=2)

print("\nIndependent evaluation batch completed successfully!")
