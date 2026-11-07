# 04 — Canonical Agricultural Taxonomy Specification
**Version:** 1.0.0  
**Effective Date:** 2026-11-06  
**Auditor:** Crop Doctor ML Rebuild Team  

---

## 1. Taxonomic Design Principles

1. **Botanical Specificity:** Disease and pest conditions are strictly mapped to specific botanical host crops. Symptoms from different crops (e.g., Early Blight in Tomato vs Potato) are maintained as distinct condition IDs (`tomato_early_blight` vs `potato_early_blight`), acknowledging physiological host differences.
2. **Explicit Healthy Category:** Every supported host crop possesses a dedicated `healthy` condition class to avoid forcing normal leaves into disease categories.
3. **Out-of-Distribution Rejection:** Non-plant, unsupported plant species, and unclassified anomalies are routed through uncertainty thresholding rather than forced into the closest class.

---

## 2. Canonical Classes (17 Classes across 5 Staple Crops)

| Class Index | Crop ID | Crop Name | Condition ID | Condition Name | Pathogen / Stress Agent | Type |
|---|---|---|---|---|---|---|
| 0 | `tomato` | Tomato | `tomato_early_blight` | Tomato Early Blight | *Alternaria solani* | fungal_disease |
| 1 | `tomato` | Tomato | `tomato_late_blight` | Tomato Late Blight | *Phytophthora infestans* | oomycete_disease |
| 2 | `tomato` | Tomato | `tomato_leaf_curl` | Tomato Yellow Leaf Curl | Tomato Leaf Curl Virus / TYLCV | viral_disease |
| 3 | `tomato` | Tomato | `tomato_bacterial_spot` | Tomato Bacterial Spot | *Xanthomonas perforans* | bacterial_disease |
| 4 | `tomato` | Tomato | `tomato_septoria_leaf_spot` | Tomato Septoria Leaf Spot | *Septoria lycopersici* | fungal_disease |
| 5 | `tomato` | Tomato | `tomato_leaf_mold` | Tomato Leaf Mold | *Passalora fulva* | fungal_disease |
| 6 | `tomato` | Tomato | `tomato_healthy` | Tomato Healthy | None (Vigorous foliage) | healthy |
| 7 | `potato` | Potato | `potato_early_blight` | Potato Early Blight | *Alternaria solani* | fungal_disease |
| 8 | `potato` | Potato | `potato_late_blight` | Potato Late Blight | *Phytophthora infestans* | oomycete_disease |
| 9 | `potato` | Potato | `potato_healthy` | Potato Healthy | None (Vigorous foliage) | healthy |
| 10 | `corn` | Corn (Maize) | `corn_leaf_blight` | Corn Northern Leaf Blight | *Exserohilum turcicum* | fungal_disease |
| 11 | `corn` | Corn (Maize) | `corn_common_rust` | Corn Common Rust | *Puccinia sorghi* | fungal_disease |
| 12 | `corn` | Corn (Maize) | `corn_gray_leaf_spot` | Corn Gray Leaf Spot | *Cercospora zeae-maydis* | fungal_disease |
| 13 | `corn` | Corn (Maize) | `corn_healthy` | Corn Healthy | None (Vigorous foliage) | healthy |
| 14 | `bell_pepper`| Bell Pepper | `bell_pepper_bacterial_spot`| Bell Pepper Bacterial Spot | *Xanthomonas campestris* | bacterial_disease |
| 15 | `bell_pepper`| Bell Pepper | `bell_pepper_healthy` | Bell Pepper Healthy | None (Vigorous foliage) | healthy |
| 16 | `squash` | Squash | `squash_powdery_mildew` | Squash Powdery Mildew | *Podosphaera xanthii* | fungal_disease |

---

## 3. Mapping from Source Datasets

| Source Dataset | Source Folder Label | Canonical Condition ID |
|---|---|---|
| PlantDoc | `Tomato Early blight leaf` | `tomato_early_blight` |
| PlantDoc | `Tomato leaf late blight` | `tomato_late_blight` |
| PlantDoc | `Tomato leaf yellow virus` | `tomato_leaf_curl` |
| PlantDoc | `Tomato leaf bacterial spot` | `tomato_bacterial_spot` |
| PlantDoc | `Tomato Septoria leaf spot` | `tomato_septoria_leaf_spot` |
| PlantDoc | `Tomato mold leaf` | `tomato_leaf_mold` |
| PlantDoc | `Tomato leaf` | `tomato_healthy` |
| PlantDoc | `Potato leaf early blight` | `potato_early_blight` |
| PlantDoc | `Potato leaf late blight` | `potato_late_blight` |
| PlantDoc | `Corn leaf blight` | `corn_leaf_blight` |
| PlantDoc | `Corn rust leaf` | `corn_common_rust` |
| PlantDoc | `Corn Gray leaf spot` | `corn_gray_leaf_spot` |
| PlantDoc | `Bell_pepper leaf spot` | `bell_pepper_bacterial_spot` |
| PlantDoc | `Bell_pepper leaf` | `bell_pepper_healthy` |
| PlantDoc | `Squash Powdery mildew leaf` | `squash_powdery_mildew` |
| PlantVillage | `Tomato___Early_blight` | `tomato_early_blight` |
| PlantVillage | `Tomato___Late_blight` | `tomato_late_blight` |
| PlantVillage | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | `tomato_leaf_curl` |
| PlantVillage | `Tomato___Bacterial_spot` | `tomato_bacterial_spot` |
| PlantVillage | `Tomato___Septoria_leaf_spot` | `tomato_septoria_leaf_spot` |
| PlantVillage | `Tomato___Leaf_Mold` | `tomato_leaf_mold` |
| PlantVillage | `Tomato___healthy` | `tomato_healthy` |
| PlantVillage | `Potato___Early_blight` | `potato_early_blight` |
| PlantVillage | `Potato___Late_blight` | `potato_late_blight` |
| PlantVillage | `Potato___healthy` | `potato_healthy` |
| PlantVillage | `Corn_(maize)___Northern_Leaf_Blight` | `corn_leaf_blight` |
| PlantVillage | `Corn_(maize)___Common_rust_` | `corn_common_rust` |
| PlantVillage | `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` | `corn_gray_leaf_spot` |
| PlantVillage | `Corn_(maize)___healthy` | `corn_healthy` |
| PlantVillage | `Pepper,_bell___Bacterial_spot` | `bell_pepper_bacterial_spot` |
| PlantVillage | `Pepper,_bell___healthy` | `bell_pepper_healthy` |
| PlantVillage | `Squash___Powdery_mildew` | `squash_powdery_mildew` |
