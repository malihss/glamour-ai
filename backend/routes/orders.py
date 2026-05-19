"""
routes/orders.py — Order management endpoints
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Order, OrderItem, Cart, CartItem, UserInteraction
import uuid
from datetime import datetime

orders_bp = Blueprint('orders', __name__)


def generate_order_number():
    return f"GA-{datetime.utcnow().strftime('%Y%m')}-{str(uuid.uuid4())[:8].upper()}"


def validate_address(addr, label):
    required = ['street', 'city', 'state', 'postalCode']
    missing = [f for f in required if not str(addr.get(f, '')).strip()]
    if missing:
        return f'{label}: missing {", ".join(missing)}'
    return None


@orders_bp.route('/', methods=['GET'])
@jwt_required()
def list_orders():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)

    pagination = Order.query.filter_by(user_id=user_id)\
        .order_by(Order.created_at.desc())\
        .paginate(page=page, per_page=10, error_out=False)

    return jsonify({
        'orders': [o.to_dict() for o in pagination.items],
        'pagination': {
            'page': page,
            'total': pagination.total,
            'totalPages': pagination.pages
        }
    })


@orders_bp.route('/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({'order': order.to_dict()})


@orders_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    data = request.get_json()

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart or not cart.items:
        return jsonify({'error': 'Your cart is empty'}), 400

    # Validate address fields
    shipping_addr = data.get('shippingAddress') or {}
    billing_addr  = data.get('billingAddress')  or {}
    err = validate_address(shipping_addr, 'Shipping address')
    if err:
        return jsonify({'error': err}), 400
    err = validate_address(billing_addr, 'Billing address')
    if err:
        return jsonify({'error': err}), 400

    # Validate all cart products are still active
    for item in cart.items:
        if not item.product or not item.product.is_active:
            name = item.product.name if item.product else 'A product'
            return jsonify({'error': f'"{name}" is no longer available. Please remove it from your cart.'}), 400
        if item.product.stock_quantity is not None and item.product.stock_quantity < item.quantity:
            return jsonify({'error': f'Not enough stock for "{item.product.name}". Only {item.product.stock_quantity} left.'}), 400

    subtotal = float(cart.total())
    tax_rate = 0.08  # 8% tax
    tax_amount = round(subtotal * tax_rate, 2)
    shipping_amount = 0.0 if subtotal >= 75 else 9.95  # Free shipping over $75
    total = subtotal + tax_amount + shipping_amount

    order = Order(
        user_id=user_id,
        order_number=generate_order_number(),
        status='confirmed',
        subtotal=subtotal,
        tax_amount=tax_amount,
        shipping_amount=shipping_amount,
        discount_amount=0,
        total=total,
        shipping_address=data['shippingAddress'],
        billing_address=data['billingAddress'],
        notes=data.get('notes')
    )
    db.session.add(order)
    db.session.flush()

    # Create order items from cart
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            variant_id=cart_item.variant_id,
            product_name=cart_item.product.name if cart_item.product else '',
            variant_name=cart_item.variant.name if cart_item.variant else None,
            quantity=cart_item.quantity,
            unit_price=cart_item.unit_price,
            total_price=cart_item.unit_price * cart_item.quantity,
            snapshot=cart_item.product.to_dict() if cart_item.product else {}
        )
        db.session.add(order_item)

        # Deduct stock
        if cart_item.product:
            cart_item.product.stock_quantity = max(
                0, cart_item.product.stock_quantity - cart_item.quantity
            )

        # Track purchase interaction for recommendations
        if cart_item.product_id:
            interaction = UserInteraction(
                user_id=user_id,
                product_id=cart_item.product_id,
                interaction_type='purchase',
                weight=3.0
            )
            db.session.add(interaction)

    # Clear the cart after checkout
    CartItem.query.filter_by(cart_id=cart.id).delete()

    db.session.commit()
    return jsonify({'order': order.to_dict()}), 201
