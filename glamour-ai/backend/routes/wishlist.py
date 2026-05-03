"""
routes/wishlist.py — Wishlist endpoints
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Wishlist, Product

wishlist_bp = Blueprint('wishlist', __name__)


@wishlist_bp.route('/', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    items = Wishlist.query.filter_by(user_id=user_id).all()
    return jsonify({
        'items': [
            {
                'id': str(w.id),
                'product': w.product.to_dict() if w.product else None
            }
            for w in items
        ]
    })


@wishlist_bp.route('/<product_id>', methods=['POST'])
@jwt_required()
def add_to_wishlist(product_id):
    user_id = get_jwt_identity()
    existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        return jsonify({'message': 'Already in wishlist'}), 200

    item = Wishlist(user_id=user_id, product_id=product_id)
    db.session.add(item)
    db.session.commit()
    return jsonify({'message': 'Added to wishlist'}), 201


@wishlist_bp.route('/<product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    user_id = get_jwt_identity()
    item = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if item:
        db.session.delete(item)
        db.session.commit()
    return jsonify({'message': 'Removed from wishlist'})
