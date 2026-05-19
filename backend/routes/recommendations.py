"""
routes/recommendations.py — AI product recommendations
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import db
from models import Product, UserInteraction
import requests
import os

recommendations_bp = Blueprint('recommendations', __name__)

AI_SERVICE_URL = os.getenv('AI_SERVICE_URL', 'http://localhost:5001')


@recommendations_bp.route('/', methods=['GET'])
def get_recommendations():
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    limit = request.args.get('limit', 8, type=int)
    context = request.args.get('context', 'homepage')

    if user_id:
        try:
            # Call AI service for personalized recommendations
            response = requests.post(
                f'{AI_SERVICE_URL}/recommend',
                json={'userId': user_id, 'limit': limit, 'context': context},
                timeout=5
            )
            if response.ok:
                data = response.json()
                product_ids = data.get('productIds', [])
                if product_ids:
                    products = Product.query.filter(
                        Product.id.in_(product_ids),
                        Product.is_active == True
                    ).all()
                    # Preserve order from AI service
                    product_map = {str(p.id): p for p in products}
                    ordered = [product_map[pid] for pid in product_ids if pid in product_map]
                    return jsonify({'products': [p.to_dict() for p in ordered], 'personalized': True})
        except requests.RequestException:
            pass  # Fall through to default recommendations

    # Default: featured + popular products
    products = Product.query.filter_by(is_active=True, is_featured=True)\
        .order_by(Product.created_at.desc()).limit(limit).all()

    return jsonify({'products': [p.to_dict() for p in products], 'personalized': False})


@recommendations_bp.route('/similar/<product_id>', methods=['GET'])
def similar_products(product_id):
    limit = request.args.get('limit', 4, type=int)

    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    try:
        response = requests.post(
            f'{AI_SERVICE_URL}/similar',
            json={'productId': product_id, 'limit': limit},
            timeout=5
        )
        if response.ok:
            data = response.json()
            product_ids = data.get('productIds', [])
            if product_ids:
                products = Product.query.filter(
                    Product.id.in_(product_ids),
                    Product.is_active == True
                ).all()
                return jsonify({'products': [p.to_dict() for p in products]})
    except requests.RequestException:
        pass

    # Fallback: same category
    products = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).limit(limit).all()

    return jsonify({'products': [p.to_dict() for p in products]})


@recommendations_bp.route('/track', methods=['POST'])
def track_interaction():
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    if not user_id:
        return jsonify({'message': 'skipped'}), 200

    data = request.get_json()
    interaction = UserInteraction(
        user_id=user_id,
        product_id=data['productId'],
        interaction_type=data.get('type', 'view'),
        weight=data.get('weight', 1.0),
        metadata=data.get('metadata', {})
    )
    db.session.add(interaction)
    db.session.commit()

    return jsonify({'message': 'tracked'})
