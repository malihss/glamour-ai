"""
routes/cart.py — Shopping cart endpoints
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Cart, CartItem, Product, ProductVariant

cart_bp = Blueprint('cart', __name__)


def get_or_create_cart(user_id):
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart


@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart = get_or_create_cart(user_id)
    return jsonify({'cart': cart.to_dict()})


@cart_bp.route('/items', methods=['POST'])
@jwt_required()
def add_item():
    user_id = get_jwt_identity()
    data = request.get_json()

    product_id = data.get('productId')
    variant_id = data.get('variantId')
    quantity = max(1, data.get('quantity', 1))

    product = db.session.get(Product, product_id)
    if not product or not product.is_active:
        return jsonify({'error': 'Product not found'}), 404

    # Stock check
    if product.stock_quantity is not None and product.stock_quantity < quantity:
        available = product.stock_quantity
        if available == 0:
            return jsonify({'error': 'This product is out of stock'}), 400
        return jsonify({'error': f'Only {available} left in stock'}), 400

    unit_price = float(product.price)
    if variant_id:
        variant = db.session.get(ProductVariant, variant_id)
        if variant:
            unit_price += float(variant.price_modifier or 0)
            if variant.stock_quantity is not None and variant.stock_quantity < quantity:
                available = variant.stock_quantity
                if available == 0:
                    return jsonify({'error': 'This shade is out of stock'}), 400
                return jsonify({'error': f'Only {available} left for this shade'}), 400

    cart = get_or_create_cart(user_id)

    existing = CartItem.query.filter_by(
        cart_id=cart.id,
        product_id=product_id,
        variant_id=variant_id
    ).first()

    if existing:
        existing.quantity += quantity
    else:
        item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            variant_id=variant_id,
            quantity=quantity,
            unit_price=unit_price
        )
        db.session.add(item)

    db.session.commit()
    return jsonify({'cart': cart.to_dict()})


@cart_bp.route('/items/<item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    quantity = data.get('quantity', 1)

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    if quantity <= 0:
        db.session.delete(item)
    else:
        item.quantity = quantity

    db.session.commit()
    return jsonify({'cart': cart.to_dict()})


@cart_bp.route('/items/<item_id>', methods=['DELETE'])
@jwt_required()
def remove_item(item_id):
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({'cart': cart.to_dict()})


@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()
    if cart:
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
    return jsonify({'message': 'Cart cleared'})
