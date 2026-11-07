import json
import torch
from torch.utils.data import Dataset
from torchvision import transforms
from PIL import Image
import numpy as np

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
    Standard baseline leaf augmentations.
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

def get_enhanced_train_transforms(image_size: int = 224):
    """
    Enhanced field-robust leaf augmentations designed for real-world farmer photos:
    - RandomResizedCrop: simulates varying camera distance to lesions
    - Expanded ColorJitter: handles harsh sunlight, shadows, overcast skies
    - RandomRotation: handles arbitrary phone angles
    - RandomErasing: trains network to look at multiple leaf areas rather than plain backgrounds
    """
    return transforms.Compose([
        transforms.RandomResizedCrop(image_size, scale=(0.75, 1.0), ratio=(0.85, 1.15)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.25, hue=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        transforms.RandomErasing(p=0.20, scale=(0.02, 0.15), ratio=(0.3, 3.3), value="random")
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
    def __init__(self, manifest_path: str, transform=None, is_ood: bool = False, preload: bool = True, max_cache_dim: int = 384):
        self.transform = transform
        self.is_ood = is_ood

        with open(manifest_path, "r", encoding="utf-8") as f:
            self.records = json.load(f)

        self.cached_images = None
        if preload:
            self.cached_images = []
            for rec in self.records:
                try:
                    with Image.open(rec["filepath"]) as img:
                        # Downscale very large images to max_cache_dim to keep RAM compact and fast
                        if max(img.size) > max_cache_dim:
                            img.thumbnail((max_cache_dim, max_cache_dim))
                        self.cached_images.append(img.convert("RGB"))
                except Exception:
                    self.cached_images.append(None)

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        rec = self.records[idx]

        if self.cached_images is not None and self.cached_images[idx] is not None:
            img_rgb = self.cached_images[idx]
        else:
            try:
                with Image.open(rec["filepath"]) as img:
                    img_rgb = img.convert("RGB")
            except Exception:
                img_rgb = None

        if img_rgb is not None:
            if self.transform:
                tensor = self.transform(img_rgb)
            else:
                tensor = transforms.ToTensor()(img_rgb)
        else:
            tensor = torch.zeros((3, 224, 224), dtype=torch.float32)

        if self.is_ood:
            label = -1
        else:
            cls_name = rec["canonical_class"]
            label = CLASS_TO_IDX.get(cls_name, -1)

        return tensor, label

    def get_record(self, idx):
        return self.records[idx]

def apply_mixup_cutmix(inputs, targets, alpha_mixup=0.2, alpha_cutmix=1.0, prob_mixup=0.3, prob_cutmix=0.3):
    """
    Applies MixUp or CutMix with specified probabilities to a batch of inputs and targets.
    Returns:
        mixed_inputs, targets_a, targets_b, lam
    """
    r = np.random.rand()
    bsz = inputs.size(0)

    if r < prob_mixup and alpha_mixup > 0:
        # MixUp
        lam = float(np.random.beta(alpha_mixup, alpha_mixup))
        idx = torch.randperm(bsz, device=inputs.device)
        mixed_inputs = lam * inputs + (1.0 - lam) * inputs[idx]
        return mixed_inputs, targets, targets[idx], lam

    elif r < (prob_mixup + prob_cutmix) and alpha_cutmix > 0:
        # CutMix
        lam = float(np.random.beta(alpha_cutmix, alpha_cutmix))
        idx = torch.randperm(bsz, device=inputs.device)
        _, _, h, w = inputs.size()

        cut_rat = np.sqrt(1.0 - lam)
        cut_w = int(w * cut_rat)
        cut_h = int(h * cut_rat)

        cx = np.random.randint(w)
        cy = np.random.randint(h)

        bbx1 = np.clip(cx - cut_w // 2, 0, w)
        bby1 = np.clip(cy - cut_h // 2, 0, h)
        bbx2 = np.clip(cx + cut_w // 2, 0, w)
        bby2 = np.clip(cy + cut_h // 2, 0, h)

        mixed_inputs = inputs.clone()
        mixed_inputs[:, :, bby1:bby2, bbx1:bbx2] = inputs[idx, :, bby1:bby2, bbx1:bbx2]
        lam = 1.0 - ((bbx2 - bbx1) * (bby2 - bby1) / (h * w))
        return mixed_inputs, targets, targets[idx], float(lam)

    else:
        return inputs, targets, targets, 1.0
