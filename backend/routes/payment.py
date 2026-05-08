"""
routes/payment.py — Stripe payment intent creation
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Cart
import os

payment_bp = Blueprint('payment', __name__)


@payment_bp.route('/create-intent', methods=['POST'])
@jwt_required()
def create_payment_intent():
    """Create a Stripe PaymentIntent for the current cart total."""
    try:
        import stripe
    except ImportError:
        return jsonify({'error': 'Stripe not installed. Run: pip install stripe'}), 500

    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    if not stripe.api_key:
        return jsonify({'error': 'STRIPE_SECRET_KEY not configured'}), 500

    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart or not cart.items:
        return jsonify({'error': 'Cart is empty'}), 400

    subtotal = float(cart.total())
    tax = round(subtotal * 0.08, 2)
    shipping = 0.0 if subtotal >= 75 else 9.95
    total_cents = int(round((subtotal + tax + shipping) * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=total_cents,
            currency='usd',
            automatic_payment_methods={'enabled': True},
            metadata={'user_id': str(user_id)},
        )
        return jsonify({'clientSecret': intent.client_secret, 'amount': total_cents})
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400


@payment_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events (payment_intent.succeeded etc.)."""
    try:
        import stripe
    except ImportError:
        return jsonify({'error': 'Stripe not installed'}), 500

    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', '')
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature', '')

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            event = stripe.Event.construct_from(request.get_json(), stripe.api_key)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    if event['type'] == 'payment_intent.succeeded':
        # Payment confirmed — order creation is handled by the frontend calling /api/orders/checkout
        pass

    return jsonify({'received': True})
