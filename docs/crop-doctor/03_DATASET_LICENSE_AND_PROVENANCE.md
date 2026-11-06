# 03 — Dataset License, Attribution and Provenance Registry
**Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  

---

## 1. Primary Ingested Datasets

### A. PlantDoc Dataset
- **Repository:** `https://github.com/pratikkayal/PlantDoc-Dataset`
- **Citation:** Pratik Kayal, Brijraj Singh, et al. *"PlantDoc: A Dataset for Visual Plant Disease Detection in the Wild"*, Proceedings of the 7th ACM IKDD CoDS and 25th COMAD (2020). DOI: `10.1145/3371158.3371196`
- **License:** **Creative Commons Attribution 4.0 International (CC BY 4.0)**
- **Attribution Statement:** "PlantDoc dataset created by Pratik Kayal and Brijraj Singh, used under CC BY 4.0 license. Preprocessing and quality curation applied by KisaanBuddy ML Team."
- **Commercial & Derivative Rights:** Fully permitted under CC BY 4.0 with attribution.
- **Acquired Count:** 2,581 verified original image files extracted directly from git commit `5467f6012d78d1c446145d5f582da6096f852ae8`.

### B. PlantVillage Dataset
- **Repository:** `https://github.com/spMohanty/PlantVillage-Dataset`
- **Citation:** David P. Hughes, Marcel Salathé. *"An open access repository of images on plant health to enable the development of mobile disease diagnostics"*, arXiv:1511.08060 (2015).
- **License:** **Creative Commons CC0 1.0 Universal (Public Domain Dedication)**
- **Attribution Statement:** "PlantVillage dataset authored by David P. Hughes and Marcel Salathé, dedicated to the public domain under CC0 1.0."
- **Commercial & Derivative Rights:** Public Domain; zero copyright restrictions worldwide.

---

## 2. Gated / Blocked Datasets
- **ICAR / AIKosh Crop Disease & Insect-Pest Dataset (Rice & Maize):**
  - Gated behind IndiaAI portal login (`https://aikosh.indiaai.gov.in/`).
  - Access requires individual Aadhaar/government OTP or citizen authentication.
  - Cannot be automated headless. Documented as external access gate.
- **Paddy Doctor (Kaggle Archive):**
  - Core codebase is Apache 2.0. Full raw image tarball (~16 GB) is hosted on Kaggle competition servers and requires a Kaggle API key (`kaggle.json`) with competition acceptance.
