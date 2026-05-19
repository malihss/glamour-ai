"""
routes/auth.py — Authentication endpoints
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from extensions import db
from models import User, Product
import re

auth_bp = Blueprint('auth', __name__)


def validate_email(email):
    return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) is not None


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    required = ['email', 'password', 'firstName', 'lastName']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if User.query.filter_by(email=data['email'].lower()).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        email=data['email'].lower(),
        first_name=data['firstName'],
        last_name=data['lastName'],
        skin_tone=data.get('skinTone'),
        skin_type=data.get('skinType')
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'user': user.to_dict(),
        'accessToken': access_token,
        'refreshToken': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=data['email'].lower()).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'user': user.to_dict(),
        'accessToken': access_token,
        'refreshToken': refresh_token
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'accessToken': access_token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    updatable = ['firstName', 'lastName', 'skinTone', 'skinType', 'avatarUrl']

    for field in updatable:
        db_field = ''.join(['_' + c.lower() if c.isupper() else c for c in field]).lstrip('_')
        if field in data:
            setattr(user, db_field, data[field])

    if 'preferences' in data:
        user.preferences = {**(user.preferences or {}), **data['preferences']}

    db.session.commit()
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    data = request.get_json()

    if not user.check_password(data.get('currentPassword', '')):
        return jsonify({'error': 'Current password is incorrect'}), 400

    if len(data.get('newPassword', '')) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400

    user.set_password(data['newPassword'])
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'})


@auth_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'recommendations': []})

    prefs = user.preferences or {}
    product_ids = prefs.get('recommended_products', [])

    products = []
    for pid in product_ids[-20:]:
        p = db.session.get(Product, pid)
        if p and p.is_active:
            products.append({
                'id': str(p.id),
                'name': p.name,
                'slug': p.slug,
                'price': float(p.price),
                'compareAtPrice': float(p.compare_at_price) if p.compare_at_price else None,
                'primaryImage': p.primary_image(),
                'brand': p.brand.name if p.brand else None,
                'category': p.category.name if p.category else None,
            })

    notes = prefs.get('consultant_notes', [])

    return jsonify({'recommendations': products, 'notes': notes})
