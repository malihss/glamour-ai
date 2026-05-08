"""
routes/tryon.py — Virtual makeup try-on proxy endpoint
"""

from flask import Blueprint, request, jsonify
import requests
import os
import base64

tryon_bp = Blueprint('tryon', __name__)


@tryon_bp.route('/apply', methods=['POST'])
def apply_makeup():
    """Proxy to AI service for server-side makeup processing"""
    ai_service_url = os.getenv('AI_SERVICE_URL', 'http://localhost:5002')
    data = request.get_json()

    required = ['image', 'makeupConfig']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    try:
        response = requests.post(
            f'{ai_service_url}/apply-makeup',
            json={
                'image': data['image'],
                'makeupConfig': data['makeupConfig']
            },
            timeout=15
        )

        if response.ok:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'AI service error', 'details': response.text}), 502

    except requests.Timeout:
        return jsonify({'error': 'AI service timeout'}), 504
    except requests.RequestException as e:
        return jsonify({'error': 'AI service unavailable', 'details': str(e)}), 503


@tryon_bp.route('/shades', methods=['GET'])
def get_makeup_shades():
    """Return available makeup shades for try-on"""
    return jsonify({
        'lipstick': [
            {'name': 'Ruby Red', 'hex': '#C41E3A', 'opacity': 0.75},
            {'name': 'Nude Pink', 'hex': '#D4808E', 'opacity': 0.65},
            {'name': 'Berry Plum', 'hex': '#8B1A4A', 'opacity': 0.75},
            {'name': 'Coral', 'hex': '#FF6B6B', 'opacity': 0.65},
            {'name': 'Brick', 'hex': '#9B4448', 'opacity': 0.70},
            {'name': 'Rose Gold', 'hex': '#C9706A', 'opacity': 0.65},
            {'name': 'Deep Bordeaux', 'hex': '#5C0A14', 'opacity': 0.80},
            {'name': 'Mauve', 'hex': '#B07080', 'opacity': 0.65}
        ],
        'eyeshadow': [
            {'name': 'Smoky Charcoal', 'hex': '#333333', 'opacity': 0.55},
            {'name': 'Rose Gold', 'hex': '#B76E79', 'opacity': 0.50},
            {'name': 'Bronze', 'hex': '#8C5A2E', 'opacity': 0.50},
            {'name': 'Purple Haze', 'hex': '#6A0D83', 'opacity': 0.45},
            {'name': 'Champagne', 'hex': '#C8A882', 'opacity': 0.40},
            {'name': 'Teal', 'hex': '#008080', 'opacity': 0.45},
            {'name': 'Nude', 'hex': '#C49A6C', 'opacity': 0.40},
            {'name': 'Ocean Blue', 'hex': '#1C5F8C', 'opacity': 0.45}
        ],
        'blush': [
            {'name': 'Peachy', 'hex': '#FFAA80', 'opacity': 0.35},
            {'name': 'Rose', 'hex': '#D4698A', 'opacity': 0.30},
            {'name': 'Coral', 'hex': '#FF7B54', 'opacity': 0.30},
            {'name': 'Berry', 'hex': '#9B4F7A', 'opacity': 0.30},
            {'name': 'Terracotta', 'hex': '#C1694F', 'opacity': 0.30}
        ],
        'foundation': [
            {'name': 'Porcelain', 'hex': '#F5E6D3', 'opacity': 0.30},
            {'name': 'Fair', 'hex': '#EDD5B8', 'opacity': 0.30},
            {'name': 'Light', 'hex': '#D9B99B', 'opacity': 0.30},
            {'name': 'Medium', 'hex': '#C08040', 'opacity': 0.30},
            {'name': 'Tan', 'hex': '#A0663C', 'opacity': 0.30},
            {'name': 'Deep', 'hex': '#6B3320', 'opacity': 0.30}
        ]
    })
