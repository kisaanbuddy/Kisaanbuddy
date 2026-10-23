# KisaanBuddy Agricultural Data Sources, Public Datasets & Provenance Registry

This registry documents all authentic agricultural data sources, public model training datasets, and institutional authorities integrated into the **KisaanBuddy Advanced AI Crop Doctor & Expert Advisory Network**.

---

## 1. Government Agricultural Data Sources (India)

| Institution / Portal | Authority | Geographic Scope | Data Types Integrated | Official URL | License & Access Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ministry of Agriculture & Farmers Welfare** | Central Govt. of India | National (Pan-India) | Statutory guidelines, MSP, PMFBY, KCC Helpdesk | https://agricoop.nic.in | Open Government Data (OGD) Platform India / Public Information |
| **Directorate of Plant Protection, Quarantine & Storage (DPPQS)** | Ministry of Agriculture & Farmers Welfare | National | CIBRC Registered Pesticides, Permitted Crop Labels, Approved Formulations, PHI (Waiting Periods), Banned Agro-chemicals | https://ppqs.gov.in | Public Regulatory Database (Statutory Compliance) |
| **Indian Council of Agricultural Research (ICAR)** | Department of Agricultural Research and Education (DARE) | National | Crop varieties, disease descriptions, package of practices, IPM guidelines | https://icar.gov.in | Official Research Publications & Extension Bulletins |
| **ICAR Institutes (NRRI, IIWBR, CICR, CPRI, IIVR, NCIPM)** | Specialized National Institutes | Commodity-specific (Rice, Wheat, Cotton, Potato, Veg, IPM) | Pathogen lifecycles, disease etiology, resistant cultivars, economic threshold levels (ETL) | https://icar-nrri.gov.in<br>https://iiwbr.icar.gov.in<br>https://cicr.icar.gov.in | Institutional Research Publications & Advisory Bulletins |
| **Krishi Vigyan Kendras (KVK Network - 731 Centers)** | ICAR & State Agricultural Universities | District-level across all 732+ Indian districts | Ground-level expert advisory, local agro-climatic conditions, KVK scientist contacts | https://kvk.icar.gov.in | Public Directory & Official Extension Contact Points |
| **Kisan Call Centre (KCC)** | DAC&FW, Govt. of India | National (Toll-Free `1800-180-1551`) | Real-time multilingual voice advisory, agronomic issue resolution | https://daconline.gov.in/kcc | Public Farmer Service (24x7 / All Official Languages) |
| **State Agricultural Universities (TNAU, PAU, UAS, HAU, MPKV)** | State Governments | State-specific Agro-climatic zones | Regional spraying schedules, diagnostic keys, regional vernacular advisories | https://agritech.tnau.ac.in<br>https://pau.edu | University Extension Knowledge Portals |
| **Agmarknet & CACP** | Directorate of Marketing & Inspection | All regulated APMC mandis | Real-time mandi prices, arrivals, modal rates | https://agmarknet.gov.in | Government Open Data Portal API |

---

## 2. Public Datasets for Model Training & Benchmarking

| Dataset Attribute | PlantVillage Dataset | PlantDoc Dataset | Rice Leaf Diseases Dataset | Cotton Leaf Disease Dataset |
| :--- | :--- | :--- | :--- | :--- |
| **Publisher** | Penn State University / EPFL | IIT Delhi & Academic Collaborators | Kaggle / University Research | Kaggle / Research Collaborators |
| **Source URL** | https://plantvillage.psu.edu | https://github.com/pratikkayal/PlantDoc-Dataset | Kaggle Public Datasets | Kaggle Public Datasets |
| **License** | Creative Commons Attribution (CC BY 4.0) | MIT License / Academic Research | CC0: Public Domain | CC0: Public Domain |
| **Commercial Use Permitted** | Yes (with attribution) | Yes (under MIT License) | Yes (Public Domain) | Yes (Public Domain) |
| **Crop Species Covered** | 14 crops (Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Bell Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato) | 13 plant species (Apple, Bell Pepper, Blueberry, Cherry, Corn, Grape, Peach, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato) | Rice (Oryza sativa) | Cotton (Gossypium hirsutum) |
| **Disease Classes** | 26 disease classes + 12 healthy classes | 17 disease classes + 10 healthy classes | Brown Spot, Bacterial Blight, Leaf Blast, Tungro | Bacterial Blight, Curl Virus, Leaf Spot, Healthy |
| **Geographic Origin** | North America / Laboratory | India (Field and Web crowdsourced) | South Asia / India | Central & Western India |
| **Number of Usable Records** | 54,306 laboratory images | 2,598 annotated field images | 3,355 field images | 2,280 field images |
| **Collection Conditions** | Laboratory studio lighting, leaves detached, uniform black/grey backgrounds | In-situ open field conditions, mobile phone cameras, background noise (soil, weeds, shadows) | Field visits, natural sunlight, variable crop density | Real farm field conditions, handheld devices |
| **Annotation Quality** | High (expert botanical verification) | Moderate (bounding-box crowdsourced with academic review) | High (verified by university pathologists) | Moderate-High (agronomist labeled) |
| **Known Limitations** | **Zero field background noise.** Severe domain shift when tested on real Indian farmer phone photos. Models trained purely on PlantVillage fail under outdoor sunlight and shadows. | Imbalanced class distribution; lower resolution on older web scrapes. | Limited to 4 specific rice foliar diseases; misses root and stem rot. | Does not cover pink bollworm damage inside bolls (visual foliar only). |
| **KisaanBuddy Implementation Role** | Initial taxonomy & baseline weights only. | Real-world benchmark split (`real_world_test`). | Specialized Rice Blast / BLB classifier validation. | Cotton Leaf Curl vector diagnostic calibration. |

---

## 3. Safe Treatment Recommendation Hierarchy

KisaanBuddy enforces a strict 4-tier Integrated Pest & Disease Management (IPM) decision hierarchy:

1. **Level 1: Cultural & Preventive Management (Always Shown)**
   - Resistant seed varieties (e.g. HD-3226 wheat for yellow rust; Kufri Girdhari for late blight potato).
   - Crop rotation with non-host families.
   - Canopy spacing, drainage management, eradication of alternate weed hosts.
2. **Level 2: Biological & Mechanical Control (Always Prioritized)**
   - Biocontrol agents: *Trichoderma viride* / *harzianum*, *Pseudomonas fluorescens*, *Bacillus subtilis*.
   - Organic botanical sprays: 5% Neem Seed Kernel Extract (NSKE), Neem Oil (10,000 ppm), Fermented buttermilk, Dashparni ark.
   - Pheromone traps and yellow/blue sticky traps.
3. **Level 3: Integrated Pest Management (Economic Threshold Level)**
   - Chemical interventions only triggered when infestation crosses actionable thresholds (e.g. 5-10% leaf lesions or 8+ bollworm moths/trap).
4. **Level 4: Registered Chemical Control (Strict DPPQS / CIBRC Compliance)**
   - Only approved active ingredients and formulations.
   - Exact dilution dosage per liter and total volume per acre.
   - Mandatory **Pre-Harvest Interval (PHI)** display (waiting period before harvesting).
   - Mandatory Personal Protective Equipment (PPE) instructions.
   - **Zero fabricated dosages**: When data is missing, farmers are directed to the local KVK or Kisan Call Centre (`1800-180-1551`).

---

## 4. Source Attribution & Provenance Rules
- Every diagnosis recommendation displays the originating institution (e.g., `ICAR-NRRI Cuttack`, `DPPQS CIBRC Database`, `PAU Ludhiana`).
- Timestamp of last verification is permanently recorded (`last_verified_date`).
- Conflicting guidance between state universities is never silently averaged; it is surfaced with regional notes and flagged for local KVK review.
