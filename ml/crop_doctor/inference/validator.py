"""
Crop Doctor Image Quality and Pre-Inference Validator.
Validates agricultural leaf images for resolution, focus/blur, exposure, contrast, and plant presence.
"""

from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image, ImageOps

class ImageQualityValidator:
    def __init__(
        self,
        min_dim: int = 64,
        blur_thresh: float = 18.0,
        min_brightness: float = 20.0,
        max_brightness: float = 238.0,
        min_contrast_std: float = 14.0,
        min_vegetation_ratio: float = 0.05,
    ):
        self.min_dim = min_dim
        self.blur_thresh = blur_thresh
        self.min_brightness = min_brightness
        self.max_brightness = max_brightness
        self.min_contrast_std = min_contrast_std
        self.min_vegetation_ratio = min_vegetation_ratio

    def validate(self, img: Image.Image) -> Dict[str, Any]:
        """
        Runs fast deterministic image quality checks.
        Returns a dict with is_acceptable, flags, metrics, and actionable retake_advice.
        """
        flags: List[str] = []
        advice: List[str] = []

        try:
            img = ImageOps.exif_transpose(img)
            img_rgb = img.convert("RGB")
        except Exception as e:
            return {
                "is_acceptable": False,
                "status": "corrupt_image",
                "flags": ["unreadable_format"],
                "metrics": {},
                "retake_advice": f"Unable to read image file: {str(e)}. Please capture and upload a standard JPG or PNG photo.",
            }

        w, h = img_rgb.size
        # 1. Dimension checks
        if w < self.min_dim or h < self.min_dim:
            flags.append("insufficient_resolution")
            advice.append("Image resolution is too low. Move closer to the crop leaf.")

        aspect_ratio = max(w, h) / max(1, min(w, h))
        if aspect_ratio > 4.5:
            flags.append("extreme_aspect_ratio")
            advice.append("Image has an extreme aspect ratio. Take a centered photo of the leaf.")

        # Downsample for fast inspection metrics if huge
        inspect_img = img_rgb
        if max(w, h) > 512:
            inspect_img = img_rgb.copy()
            inspect_img.thumbnail((512, 512))

        gray = np.asarray(inspect_img.convert("L"), dtype=np.float32)
        mean_brightness = float(np.mean(gray))
        std_contrast = float(np.std(gray))

        # 2. Exposure & Contrast
        if mean_brightness < self.min_brightness:
            flags.append("underexposed")
            advice.append("Photo is too dark. Capture under daylight or illuminate the leaf.")
        elif mean_brightness > self.max_brightness:
            flags.append("overexposed")
            advice.append("Photo is washed out by bright flash or glare. Shade the leaf gently.")

        if std_contrast < self.min_contrast_std:
            flags.append("low_contrast_flat")
            advice.append("Image appears flat with little detail or pattern visible.")

        # 3. Blur detection via Laplacian filter
        laplacian_kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
        # Using numpy convolution or scipy if available
        try:
            from scipy.signal import convolve2d
            convolved = convolve2d(gray, laplacian_kernel, mode="valid")
            blur_score = float(np.var(convolved))
        except ImportError:
            # Simple numpy finite difference gradient approximation
            gy, gx = np.gradient(gray)
            gnorm = np.sqrt(gx**2 + gy**2)
            blur_score = float(np.var(gnorm) * 2.0)

        if blur_score < self.blur_thresh:
            flags.append("excessive_blur")
            advice.append("Image is blurry. Hold your camera steady and tap to focus on the leaf.")

        # 4. Color / Foliage Check (HSV green / yellow / brown leaf spectrum)
        hsv = np.asarray(inspect_img.convert("HSV"), dtype=np.float32)
        h_ch = hsv[:, :, 0]  # Hue: 0-255 in Pillow
        s_ch = hsv[:, :, 1]  # Saturation
        v_ch = hsv[:, :, 2]  # Value

        # Leaves typically occupy Hue ~25-100 (yellow to dark green) with moderate saturation (>30)
        leaf_mask = (h_ch >= 20) & (h_ch <= 110) & (s_ch > 25) & (v_ch > 25)
        vegetation_ratio = float(np.sum(leaf_mask) / leaf_mask.size)

        if vegetation_ratio < self.min_vegetation_ratio:
            flags.append("low_vegetation_content")
            advice.append("No crop leaf detected in the frame. Make sure the leaf fills most of the photo.")

        is_acceptable = len([f for f in flags if f in ["insufficient_resolution", "underexposed", "overexposed", "excessive_blur", "low_vegetation_content"]]) == 0

        metrics = {
            "width": w,
            "height": h,
            "aspect_ratio": round(aspect_ratio, 2),
            "brightness_mean": round(mean_brightness, 2),
            "contrast_std": round(std_contrast, 2),
            "blur_score": round(blur_score, 2),
            "vegetation_ratio": round(vegetation_ratio, 4),
        }

        return {
            "is_acceptable": is_acceptable,
            "status": "acceptable" if is_acceptable else "unsuitable",
            "flags": flags,
            "metrics": metrics,
            "retake_advice": " ".join(advice) if advice else None,
        }
