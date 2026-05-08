"""
face_detection/makeup_renderer.py — Apply makeup using OpenCV + MediaPipe landmarks
Renders: lipstick, eyeshadow, blush, foundation
"""

import cv2
import mediapipe as mp
import numpy as np
import base64
from typing import Dict, List, Tuple, Optional
from .detector import FaceDetector


def hex_to_bgr(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to BGR for OpenCV"""
    hex_color = hex_color.lstrip('#')
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return (b, g, r)


class MakeupRenderer:
    """
    Applies makeup overlays to face images using MediaPipe landmarks.
    All rendering uses Gaussian blur for smooth, natural blending.
    """

    def __init__(self):
        self.detector = FaceDetector()
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

    def apply(self, image_b64: str, makeup_config: dict) -> dict:
        """
        Apply one or more makeup effects to an image.

        makeup_config format:
        {
            "lipstick": {"color": "#C41E3A", "opacity": 0.75},
            "eyeshadow": {"color": "#333333", "opacity": 0.5},
            "blush": {"color": "#FFAA80", "opacity": 0.35},
            "foundation": {"color": "#F5E6D3", "opacity": 0.25}
        }
        """
        img = self.detector.decode_image(image_b64)
        if img is None:
            return {'success': False, 'error': 'Could not decode image'}

        h, w = img.shape[:2]
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_img)

        if not results.multi_face_landmarks:
            return {'success': False, 'error': 'No face detected', 'faceDetected': False}

        face_landmarks = results.multi_face_landmarks[0].landmark
        result_img = img.copy().astype(np.float32)

        if 'foundation' in makeup_config and makeup_config['foundation']:
            result_img = self._apply_foundation(
                result_img, face_landmarks, w, h,
                makeup_config['foundation']
            )

        if 'blush' in makeup_config and makeup_config['blush']:
            result_img = self._apply_blush(
                result_img, face_landmarks, w, h,
                makeup_config['blush']
            )

        if 'eyeshadow' in makeup_config and makeup_config['eyeshadow']:
            result_img = self._apply_eyeshadow(
                result_img, face_landmarks, w, h,
                makeup_config['eyeshadow']
            )

        if 'lipstick' in makeup_config and makeup_config['lipstick']:
            result_img = self._apply_lipstick(
                result_img, face_landmarks, w, h,
                makeup_config['lipstick']
            )

        result_img = np.clip(result_img, 0, 255).astype(np.uint8)

        # Encode result
        _, buffer = cv2.imencode('.jpg', result_img, [cv2.IMWRITE_JPEG_QUALITY, 92])
        result_b64 = base64.b64encode(buffer).decode('utf-8')

        return {
            'success': True,
            'faceDetected': True,
            'image': f'data:image/jpeg;base64,{result_b64}'
        }

    def _get_landmark_points(self, landmarks, indices, w, h) -> np.ndarray:
        """Get pixel coordinates for a set of landmark indices"""
        return np.array([
            [int(landmarks[i].x * w), int(landmarks[i].y * h)]
            for i in indices
        ], dtype=np.int32)

    def _apply_lipstick(self, img: np.ndarray, landmarks, w: int, h: int, config: dict) -> np.ndarray:
        """Apply lipstick color to lip region"""
        color_bgr = hex_to_bgr(config.get('color', '#C41E3A'))
        opacity = config.get('opacity', 0.7)

        # Upper lip
        upper_outer = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
        upper_inner = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308]

        # Lower lip
        lower_outer = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291]
        lower_inner = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308]

        lip_mask = np.zeros((h, w), dtype=np.float32)

        # Draw upper lip region (outer boundary -> inner boundary)
        upper_pts = self._get_landmark_points(landmarks, upper_outer, w, h)
        upper_inner_pts = self._get_landmark_points(landmarks, upper_inner, w, h)
        upper_full = np.vstack([upper_pts, upper_inner_pts[::-1]])
        cv2.fillPoly(lip_mask, [upper_full], 1.0)

        # Draw lower lip region
        lower_pts = self._get_landmark_points(landmarks, lower_outer, w, h)
        lower_inner_pts = self._get_landmark_points(landmarks, lower_inner, w, h)
        lower_full = np.vstack([lower_pts, lower_inner_pts[::-1]])
        cv2.fillPoly(lip_mask, [lower_full], 1.0)

        # Smooth mask edges
        lip_mask = cv2.GaussianBlur(lip_mask, (7, 7), 3)

        # Apply color
        color_layer = np.zeros_like(img, dtype=np.float32)
        color_layer[:, :] = color_bgr

        alpha = lip_mask[:, :, np.newaxis] * opacity
        img = img * (1 - alpha) + color_layer * alpha

        return img

    def _apply_eyeshadow(self, img: np.ndarray, landmarks, w: int, h: int, config: dict) -> np.ndarray:
        """Apply eyeshadow to eyelid regions"""
        color_bgr = hex_to_bgr(config.get('color', '#333333'))
        opacity = config.get('opacity', 0.5)

        # Left eye lid region
        left_lid = [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33]
        # Right eye lid region
        right_lid = [466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249, 263]

        eye_mask = np.zeros((h, w), dtype=np.float32)

        left_pts = self._get_landmark_points(landmarks, left_lid, w, h)
        cv2.fillPoly(eye_mask, [left_pts], 1.0)

        right_pts = self._get_landmark_points(landmarks, right_lid, w, h)
        cv2.fillPoly(eye_mask, [right_pts], 1.0)

        # Extend shadow slightly upward for more dramatic effect
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 10))
        eye_mask = cv2.dilate(eye_mask, kernel, iterations=1)

        # Smooth for natural blending
        eye_mask = cv2.GaussianBlur(eye_mask, (21, 21), 8)

        color_layer = np.zeros_like(img, dtype=np.float32)
        color_layer[:, :] = color_bgr

        alpha = eye_mask[:, :, np.newaxis] * opacity
        img = img * (1 - alpha) + color_layer * alpha

        return img

    def _apply_blush(self, img: np.ndarray, landmarks, w: int, h: int, config: dict) -> np.ndarray:
        """Apply blush to cheek areas"""
        color_bgr = hex_to_bgr(config.get('color', '#FFAA80'))
        opacity = config.get('opacity', 0.35)

        # Left cheek center point
        left_cheek_idx = 116
        right_cheek_idx = 345

        lx = int(landmarks[left_cheek_idx].x * w)
        ly = int(landmarks[left_cheek_idx].y * h)
        rx = int(landmarks[right_cheek_idx].x * w)
        ry = int(landmarks[right_cheek_idx].y * h)

        # Estimate cheek radius based on face width
        face_width = int(abs(landmarks[454].x - landmarks[234].x) * w)
        radius = int(face_width * 0.18)

        blush_mask = np.zeros((h, w), dtype=np.float32)
        cv2.circle(blush_mask, (lx, ly), radius, 1.0, -1)
        cv2.circle(blush_mask, (rx, ry), radius, 1.0, -1)

        # Heavy blur for natural, diffused blush look
        blush_mask = cv2.GaussianBlur(blush_mask, (radius * 2 + 1, radius * 2 + 1), radius // 2)

        color_layer = np.zeros_like(img, dtype=np.float32)
        color_layer[:, :] = color_bgr

        alpha = blush_mask[:, :, np.newaxis] * opacity
        img = img * (1 - alpha) + color_layer * alpha

        return img

    def _apply_foundation(self, img: np.ndarray, landmarks, w: int, h: int, config: dict) -> np.ndarray:
        """Apply foundation to even out skin tone"""
        color_bgr = hex_to_bgr(config.get('color', '#F5E6D3'))
        opacity = config.get('opacity', 0.25)

        # Face oval landmarks
        face_oval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                     397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                     172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

        face_mask = np.zeros((h, w), dtype=np.float32)
        face_pts = self._get_landmark_points(landmarks, face_oval, w, h)
        cv2.fillPoly(face_mask, [face_pts], 1.0)

        # Feather the edges
        face_mask = cv2.GaussianBlur(face_mask, (21, 21), 10)

        color_layer = np.zeros_like(img, dtype=np.float32)
        color_layer[:, :] = color_bgr

        alpha = face_mask[:, :, np.newaxis] * opacity
        img = img * (1 - alpha) + color_layer * alpha

        return img
