"""
face_detection/detector.py — Face detection using MediaPipe
Detects 468 facial landmarks in real-time
"""

import cv2
import mediapipe as mp
import numpy as np
import base64
import json
from typing import Optional


class FaceDetector:
    """
    Detects facial landmarks using MediaPipe Face Mesh.
    Returns normalized landmark coordinates for makeup rendering.
    """

    # Key landmark indices for makeup regions
    LIPS_UPPER_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
    LIPS_LOWER_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291]
    LIPS_UPPER_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308]
    LIPS_LOWER_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308]

    LEFT_EYE_UPPER = [246, 161, 160, 159, 158, 157, 173]
    LEFT_EYE_LOWER = [33, 7, 163, 144, 145, 153, 154, 155, 133]
    LEFT_EYEBROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]

    RIGHT_EYE_UPPER = [466, 388, 387, 386, 385, 384, 398]
    RIGHT_EYE_LOWER = [263, 249, 390, 373, 374, 380, 381, 382, 362]
    RIGHT_EYEBROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]

    LEFT_CHEEK = [116, 123, 147, 213, 192, 214, 210, 211, 212]
    RIGHT_CHEEK = [345, 352, 376, 433, 416, 434, 430, 431, 432]

    FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10]

    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def decode_image(self, image_b64: str) -> Optional[np.ndarray]:
        """Decode base64 image to numpy array"""
        try:
            # Handle data URL prefix
            if ',' in image_b64:
                image_b64 = image_b64.split(',')[1]

            img_bytes = base64.b64decode(image_b64)
            img_array = np.frombuffer(img_bytes, dtype=np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            raise ValueError(f"Failed to decode image: {e}")

    def detect(self, image_b64: str) -> dict:
        """
        Detect face landmarks and return region coordinates.
        Returns dict with landmark coordinates for each makeup region.
        """
        img = self.decode_image(image_b64)
        if img is None:
            return {'detected': False, 'error': 'Could not decode image'}

        h, w = img.shape[:2]
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        results = self.face_mesh.process(rgb_img)

        if not results.multi_face_landmarks:
            return {'detected': False, 'landmarks': None}

        face_landmarks = results.multi_face_landmarks[0]
        landmarks = face_landmarks.landmark

        def get_region(indices):
            return [
                {
                    'x': landmarks[i].x,
                    'y': landmarks[i].y,
                    'z': landmarks[i].z,
                    'px': int(landmarks[i].x * w),
                    'py': int(landmarks[i].y * h)
                }
                for i in indices
            ]

        return {
            'detected': True,
            'imageSize': {'width': w, 'height': h},
            'regions': {
                'lipsUpperOuter': get_region(self.LIPS_UPPER_OUTER),
                'lipsLowerOuter': get_region(self.LIPS_LOWER_OUTER),
                'lipsUpperInner': get_region(self.LIPS_UPPER_INNER),
                'lipsLowerInner': get_region(self.LIPS_LOWER_INNER),
                'leftEyeUpper': get_region(self.LEFT_EYE_UPPER),
                'leftEyeLower': get_region(self.LEFT_EYE_LOWER),
                'leftEyebrow': get_region(self.LEFT_EYEBROW),
                'rightEyeUpper': get_region(self.RIGHT_EYE_UPPER),
                'rightEyeLower': get_region(self.RIGHT_EYE_LOWER),
                'rightEyebrow': get_region(self.RIGHT_EYEBROW),
                'leftCheek': get_region(self.LEFT_CHEEK),
                'rightCheek': get_region(self.RIGHT_CHEEK),
                'faceOval': get_region(self.FACE_OVAL)
            }
        }

    def get_all_landmarks(self, image_b64: str) -> dict:
        """Get all 468 landmarks for advanced processing"""
        img = self.decode_image(image_b64)
        if img is None:
            return {'detected': False}

        h, w = img.shape[:2]
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_img)

        if not results.multi_face_landmarks:
            return {'detected': False}

        face_landmarks = results.multi_face_landmarks[0]
        all_landmarks = [
            {'x': lm.x, 'y': lm.y, 'z': lm.z}
            for lm in face_landmarks.landmark
        ]

        return {
            'detected': True,
            'landmarks': all_landmarks,
            'imageSize': {'width': w, 'height': h}
        }
