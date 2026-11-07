# Known Limitations & Domain Boundary Guide

**Project:** KisaanBuddy Crop Doctor AI Rebuild  
**Version:** 1.0.0-scratch  

---

## 1. Domain Coverage Boundaries

### 1.1 Supported Crops & Pathologies
The v1.0.0 model is trained specifically on **17 canonical foliage conditions** across **5 crops**:
- **Tomato (7):** Early Blight, Late Blight, Leaf Curl, Bacterial Spot, Septoria Leaf Spot, Leaf Mold, Healthy.
- **Potato (3):** Early Blight, Late Blight, Healthy.
- **Corn / Maize (4):** Leaf Blight, Common Rust, Gray Leaf Spot, Healthy.
- **Bell Pepper (2):** Bacterial Spot, Healthy.
- **Squash (1):** Powdery Mildew.

### 1.2 Explicitly Unsupported Modalities
- **Non-foliage Organs:** Roots, tubers, underground rhizomes, bark, and interior fruit flesh.
- **Non-target Crops:** Wheat, rice, sugarcane, cotton, mango, apple, tea, coffee. (Images of non-target crops will trigger low-confidence or OOD rejection in 80% of cases, or prompt the user to consult an agronomist).
- **Post-Harvest Pathologies:** Rot during cold storage or transit.

---

## 2. Environmental & Optical Constraints

1. **Extreme Distance / Canopy Wide-Shots:** Model is optimized for leaf close-ups ($15\text{--}40\text{ cm}$ distance). Field landscape panoramas will fail quality inspection due to lack of leaf detail.
2. **Artificial / Neon Lighting:** Flash reflections or colored grow lights introduce color distortion that alters lesion appearance.
3. **Compound Multi-Infections:** When a plant experiences both severe nitrogen deficiency and fungal septoria spot simultaneously, the model will identify the most visually dominant lesion pattern or report uncertain status.

---

## 3. Farm Safety Warnings

- Recommendations provided by the Crop Doctor are agronomical decision-support advisories and not legal guarantees.
- Always follow official pesticide label instructions, safety intervals (PHI), and local pesticide regulatory approvals before applying chemical controls.
