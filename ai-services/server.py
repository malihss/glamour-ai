"""
ai-services/server.py — AI Microservice
Handles: Face detection, makeup try-on, recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

from face_detection.detector import FaceDetector
from face_detection.makeup_renderer import MakeupRenderer
from recommendation.engine import RecommendationEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize services
face_detector = FaceDetector()
makeup_renderer = MakeupRenderer()
recommendation_engine = RecommendationEngine()


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'glamour-ai-services'})


@app.route('/detect-face', methods=['POST'])
def detect_face():
    """Detect face landmarks from base64 image"""
    data = request.get_json()
    image_b64 = data.get('image')

    if not image_b64:
        return jsonify({'error': 'Image required'}), 400

    try:
        result = face_detector.detect(image_b64)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Face detection error: {e}")
        return jsonify({'error': str(e), 'detected': False}), 500


@app.route('/apply-makeup', methods=['POST'])
def apply_makeup():
    """Apply makeup overlays to a face image"""
    data = request.get_json()
    image_b64 = data.get('image')
    makeup_config = data.get('makeupConfig', {})

    if not image_b64:
        return jsonify({'error': 'Image required'}), 400

    try:
        result = makeup_renderer.apply(image_b64, makeup_config)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Makeup application error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/recommend', methods=['POST'])
def recommend():
    """Get personalized product recommendations"""
    data = request.get_json()
    user_id = data.get('userId')
    limit = data.get('limit', 8)
    context = data.get('context', 'homepage')

    try:
        product_ids = recommendation_engine.recommend(user_id, limit, context)
        return jsonify({'productIds': product_ids, 'personalized': bool(user_id)})
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        return jsonify({'productIds': [], 'error': str(e)}), 500


@app.route('/similar', methods=['POST'])
def similar_products():
    """Get similar products based on a product"""
    data = request.get_json()
    product_id = data.get('productId')
    limit = data.get('limit', 4)

    try:
        product_ids = recommendation_engine.similar(product_id, limit)
        return jsonify({'productIds': product_ids})
    except Exception as e:
        logger.error(f"Similar products error: {e}")
        return jsonify({'productIds': []}), 500


if __name__ == '__main__':
    logger.info("Starting Glamour AI Services on port 5001")
    app.run(debug=os.getenv('FLASK_ENV') == 'development', port=5001, host='0.0.0.0')
