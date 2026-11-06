# 02 — Dataset Research, Evaluation Matrix & Acquisition Plan
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  

---

## 1. Candidate Source Evaluation Matrix

| Source Candidate | Geography / Conditions | Annotations & Evidence | Raw Independent Samples | License & Commercial Rights | Risk / Limitations | Selection Decision |
|---|---|---|---|---|---|---|
| **PlantDoc** (`pratikkayal/PlantDoc-Dataset`) | India & Global, 100% in-the-wild field conditions (uncontrolled background, variable lighting, complex occlusion) | Manually annotated by researchers (Kayal et al., CoDS-COMAD 2020) | 2,581 original field images across 28 classes | **CC BY 4.0** (Open commercial & derivative use with attribution) | Label noise on rare classes; duplicates between raw submissions must be resolved by pHash. | **SELECTED as Primary In-the-Wild Holdout & Natural Field Corpus** |
| **PlantVillage** (`spMohanty/PlantVillage-Dataset`) | Controlled / semi-controlled leaf photography | Expert plant pathologist validated (Hughes & Salathé 2015) | ~54,306 images across 38 classes | **CC0 1.0 Universal** (Public Domain Dedication) | Laboratory background does not reflect farmer field conditions if used alone; must not be claimed as field holdout. | **SELECTED as Supplementary Controlled Training Benchmark** |
| **Paddy Doctor** (`paddydoc/paddy-doctor-dataset`) | Real paddy fields in Tirunelveli, Tamil Nadu, India | Agricultural officer assistance; RGB & IR phone camera (CAT S62 Pro) | ~16,225 retained images across 10 paddy conditions | **Apache 2.0** for codebase; raw dataset hosted primarily on Kaggle competition archive | Images require Kaggle authenticated API download; paired RGB/IR files must not cross splits. | **CANDIDATE for Dedicated Rice Extension (Phase 2B)** |
| **ICAR / AIKosh Rice & Maize Dataset** | Real Indian field conditions, multi-stage growth | Expert ICAR-IASRI agronomic annotation | 925.91 MB archive | **ICAR Data Use License** | Gated behind IndiaAI AIKosh authenticated citizen portal. Manual login required; cannot be bypassed headless without credentials. | **BLOCKED by Portal Authentication Gate; documented in ledger** |
| **PlantWild (v1 & v2)** | Multi-crop global wild images | Academic web-curated | 11,488–18,542 images | **CC BY-NC-ND 4.0** (Non-commercial, no derivatives) | Strictly prohibits commercial derivatives. Incompatible with deployed production application. | **EXCLUDED (License Violation)** |
| **PlantSeg** | Multi-host segmentation | Academic research | Variable | **CC BY-NC 4.0** (Non-commercial) | Non-commercial restriction prohibits production derivative use. | **EXCLUDED (License Violation)** |
| **BRRI Rice Field (2025)** | Bangladesh rice fields | Academic | 2,753 original, 16,247 augmented | **CC BY-NC** | Heavily augmented; non-commercial restriction. | **EXCLUDED (License Violation & Synthetic Duplication)** |

---

## 2. Strategic Acquisition Decision

1. **Dual-Corpus Architecture:**
   - **Training & Development Corpus:** Authenticated, rights-cleared authentic leaf photographs from PlantVillage (CC0) and PlantDoc (CC BY 4.0).
   - **Independent Field-Holdout Benchmark:** Unseen, in-the-wild test partition of PlantDoc (CC BY 4.0), captured in natural agricultural field conditions with soil, hands, weeds, and sun glare.
2. **Zero Synthetic Tolerance:**
   - PIL procedural leaf generation scripts (`download_and_curate.py`, `download_and_curate_phase3a.py`) are strictly quarantined and deleted from active ingestion.
3. **Targeted First-Release Pilot:**
   - Focus on 17 canonical conditions across 5 primary Indian food & cash crops: Tomato, Potato, Corn (Maize), Bell Pepper (Capsicum), and Cucurbit (Squash).
   - All 17 classes possess complete ICAR/CIBRC management guidance, differential diagnoses, and chemical safety restrictions in KisaanBuddy's knowledge base.
