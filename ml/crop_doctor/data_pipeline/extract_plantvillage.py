import os
import subprocess

TARGET_CLASSES = {
    # Tomato
    "Tomato___Early_blight": "tomato_early_blight",
    "Tomato___Late_blight": "tomato_late_blight",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "tomato_leaf_curl",
    "Tomato___Bacterial_spot": "tomato_bacterial_spot",
    "Tomato___Septoria_leaf_spot": "tomato_septoria_leaf_spot",
    "Tomato___Leaf_Mold": "tomato_leaf_mold",
    "Tomato___healthy": "tomato_healthy",
    # Potato
    "Potato___Early_blight": "potato_early_blight",
    "Potato___Late_blight": "potato_late_blight",
    "Potato___healthy": "potato_healthy",
    # Corn
    "Corn_(maize)___Northern_Leaf_Blight": "corn_leaf_blight",
    "Corn_(maize)___Common_rust_": "corn_common_rust",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "corn_gray_leaf_spot",
    "Corn_(maize)___healthy": "corn_healthy",
    # Bell Pepper
    "Pepper,_bell___Bacterial_spot": "bell_pepper_bacterial_spot",
    "Pepper,_bell___healthy": "bell_pepper_healthy",
    # Squash
    "Squash___Powdery_mildew": "squash_powdery_mildew",
}

def extract_plantvillage(max_samples_per_class=350):
    repo_dir = "ml/crop_doctor/data/raw/plantvillage"
    output_base = "ml/crop_doctor/data/extracted/plantvillage"
    os.makedirs(output_base, exist_ok=True)

    print("Fetching raw/color directory tree from PlantVillage...")
    res = subprocess.run(["git", "-C", repo_dir, "ls-tree", "HEAD:raw/color"], capture_output=True, text=True, check=True)
    
    class_shas = {}
    for line in res.stdout.strip().split("\n"):
        if not line:
            continue
        parts = line.split(maxsplit=3)
        if len(parts) >= 4 and parts[1] == "tree":
            folder_name = parts[3]
            if folder_name in TARGET_CLASSES:
                class_shas[folder_name] = parts[2]

    print(f"Matched {len(class_shas)} target classes out of {len(TARGET_CLASSES)} required.")

    total_extracted = 0
    for folder_name, tree_sha in class_shas.items():
        canonical_id = TARGET_CLASSES[folder_name]
        dest_dir = os.path.join(output_base, canonical_id)
        os.makedirs(dest_dir, exist_ok=True)

        res_files = subprocess.run(["git", "-C", repo_dir, "ls-tree", tree_sha], capture_output=True, text=True, check=True)
        file_lines = res_files.stdout.strip().split("\n")
        
        extracted_this_class = 0
        for f_line in file_lines:
            if not f_line:
                continue
            parts = f_line.split(maxsplit=3)
            if len(parts) >= 4 and parts[1] == "blob":
                blob_sha = parts[2]
                filename = parts[3]
                dest_path = os.path.join(dest_dir, filename)

                blob_res = subprocess.run(["git", "-C", repo_dir, "cat-file", "-p", blob_sha], capture_output=True, check=True)
                with open(dest_path, "wb") as f:
                    f.write(blob_res.stdout)

                extracted_this_class += 1
                total_extracted += 1

                if max_samples_per_class and extracted_this_class >= max_samples_per_class:
                    break

        print(f"Class '{canonical_id}': extracted {extracted_this_class} files.")

    print(f"\nCompleted! Total PlantVillage files extracted: {total_extracted}")

if __name__ == "__main__":
    extract_plantvillage()
