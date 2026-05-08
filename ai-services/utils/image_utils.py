"""
utils/image_utils.py — Image processing utilities
"""

import cv2
import numpy as np
import base64
from typing import Optional, Tuple


def decode_base64_image(image_b64: str) -> Optional[np.ndarray]:
    """Decode base64 string to OpenCV image"""
    try:
        if ',' in image_b64:
            image_b64 = image_b64.split(',')[1]
        img_bytes = base64.b64decode(image_b64)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        return cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    except Exception:
        return None


def encode_image_base64(img: np.ndarray, format: str = 'jpeg', quality: int = 92) -> str:
    """Encode OpenCV image to base64 string"""
    ext = '.jpg' if format == 'jpeg' else '.png'
    params = [cv2.IMWRITE_JPEG_QUALITY, quality] if format == 'jpeg' else []
    _, buffer = cv2.imencode(ext, img, params)
    b64 = base64.b64encode(buffer).decode('utf-8')
    mime = 'image/jpeg' if format == 'jpeg' else 'image/png'
    return f'data:{mime};base64,{b64}'


def resize_image(img: np.ndarray, max_dim: int = 800) -> np.ndarray:
    """Resize image preserving aspect ratio"""
    h, w = img.shape[:2]
    if max(h, w) <= max_dim:
        return img
    scale = max_dim / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def hex_to_bgr(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color (#RRGGBB) to BGR tuple"""
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (b, g, r)


def apply_color_overlay(
    img: np.ndarray,
    mask: np.ndarray,
    color_bgr: Tuple[int, int, int],
    opacity: float
) -> np.ndarray:
    """
    Apply a color overlay to an image using a mask.

    Args:
        img: Base image (float32)
        mask: Alpha mask (0-1 float, same HxW as img)
        color_bgr: BGR color tuple
        opacity: Global opacity multiplier (0-1)

    Returns:
        Blended image (float32)
    """
    color_layer = np.zeros_like(img, dtype=np.float32)
    color_layer[:, :] = color_bgr

    alpha = mask[:, :, np.newaxis] * opacity
    alpha = np.clip(alpha, 0, 1)

    return img * (1 - alpha) + color_layer * alpha


def smooth_mask(mask: np.ndarray, kernel_size: int = 7, sigma: float = 3.0) -> np.ndarray:
    """Apply Gaussian blur to smooth mask edges"""
    if kernel_size % 2 == 0:
        kernel_size += 1
    return cv2.GaussianBlur(mask, (kernel_size, kernel_size), sigma)


def dilate_mask(mask: np.ndarray, kernel_size: Tuple[int, int] = (5, 5)) -> np.ndarray:
    """Dilate a binary/float mask"""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, kernel_size)
    return cv2.dilate(mask, kernel, iterations=1)
