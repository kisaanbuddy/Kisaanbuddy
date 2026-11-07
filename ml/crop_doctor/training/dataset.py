import json
import torch
from torch.utils.data import Dataset
from torchvision import transforms
from PIL import Image

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

CLASS_TO_IDX = {cls_name: idx for idx, cls_name in enumerate(CANONICAL_CLASSES)}
IDX_TO_CLASS = {idx: cls_name for idx, cls_name in enumerate(CANONICAL_CLASSES)}

# Image normalization parameters
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

def get_train_transforms(image_size: int = 224):
    """
    Biological leaf augmentations applied only to training samples.
    Avoids distorting diagnostic leaf lesions or creating impossible artifacts.
    """
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15, hue=0.03),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

def get_eval_transforms(image_size: int = 224):
    """
    Deterministic preprocessing for validation, test, and field holdout evaluation.
    """
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

class CropDoctorDataset(Dataset):
    def __init__(self, manifest_path: str, transform=None, is_ood: bool = False):
        self.transform = transform
        self.is_ood = is_ood
        
        with open(manifest_path, "r", encoding="utf-8") as f:
            self.records = json.load(f)

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        rec = self.records[idx]
        img_path = rec["filepath"]
        
        try:
            with Image.open(img_path) as img:
                img_rgb = img.convert("RGB")
                if self.transform:
                    tensor = self.transform(img_rgb)
                else:
                    tensor = transforms.ToTensor()(img_rgb)
        except Exception as e:
            # Fallback to zero tensor if unreadable (flagged in audit)
            tensor = torch.zeros((3, 224, 224), dtype=torch.float32)

        if self.is_ood:
            label = -1
        else:
            cls_name = rec["canonical_class"]
            label = CLASS_TO_IDX.get(cls_name, -1)

        return tensor, label

    def get_record(self, idx):
        return self.records[idx]

if __name__ == "__main__":
    train_ds = CropDoctorDataset("ml/crop_doctor/data/splits/train_manifest.json", transform=get_train_transforms())
    val_ds = CropDoctorDataset("ml/crop_doctor/data/splits/val_manifest.json", transform=get_eval_transforms())
    print(f"Loaded Train Dataset: {len(train_ds)} samples")
    print(f"Loaded Val Dataset: {len(val_ds)} samples")
    x, y, rec = train_ds[0]
    print(f"Sample tensor shape: {x.shape}, label: {y} ({IDX_TO_CLASS[y]}), file: {rec['filename']}")
