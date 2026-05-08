"""
routes/admin.py — Admin API (dashboard, products, orders, users, categories)
Protected by a separate admin JWT with role='admin' claim.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from extensions import db
from models import Product, Category, Brand, Order, OrderItem, User, ProductImage, Review, ChatSession
from sqlalchemy import func, desc, asc, or_
from datetime import datetime, timedelta
import os
import re
import uuid
import logging

admin_bp = Blueprint('admin', __name__)

ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']


# ── Auth helpers ──────────────────────────────────────────────────────────────

def require_admin():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None


def require_consultant():
    claims = get_jwt()
    if claims.get('role') not in ('admin', 'consultant'):
        return jsonify({'error': 'Consultant access required'}), 403
    return None


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')


# ── Login ─────────────────────────────────────────────────────────────────────

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    admin_user = os.getenv('ADMIN_USERNAME', 'admin')
    admin_pass = os.getenv('ADMIN_PASSWORD', 'glamour2026')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if username != admin_user or password != admin_pass:
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(
        identity='admin',
        additional_claims={'role': 'admin'},
        expires_delta=timedelta(hours=24)
    )
    return jsonify({'access_token': token, 'username': admin_user})


# ── Dashboard stats ───────────────────────────────────────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    err = require_admin()
    if err: return err

    EXCLUDED = ('cancelled', 'refunded')

    total_products  = Product.query.filter_by(is_active=True).count()
    total_orders    = Order.query.count()
    total_users     = User.query.count()
    total_revenue   = db.session.query(func.sum(Order.total)).filter(
        Order.status.notin_(EXCLUDED)
    ).scalar() or 0
    pending_orders  = Order.query.filter_by(status='pending').count()
    featured        = Product.query.filter_by(is_featured=True, is_active=True).count()

    # Revenue by month (last 6) — exclude cancelled/refunded
    monthly = (
        db.session.query(
            func.date_trunc('month', Order.created_at).label('month'),
            func.sum(Order.total).label('revenue'),
            func.count(Order.id).label('orders')
        )
        .filter(Order.status.notin_(EXCLUDED))
        .group_by('month')
        .order_by(desc('month'))
        .limit(6)
        .all()
    )

    recent_orders = (
        Order.query
        .join(User, Order.user_id == User.id, isouter=True)
        .order_by(desc(Order.created_at))
        .limit(8)
        .all()
    )

    recent_orders_data = []
    for o in recent_orders:
        d = {
            'id': str(o.id),
            'orderNumber': o.order_number,
            'status': o.status,
            'total': float(o.total),
            'createdAt': o.created_at.isoformat(),
            'customerName': f"{o.user.first_name} {o.user.last_name}" if o.user else 'Guest',
            'customerEmail': o.user.email if o.user else '',
        }
        recent_orders_data.append(d)

    return jsonify({
        'stats': {
            'totalProducts': total_products,
            'totalOrders': total_orders,
            'totalUsers': total_users,
            'totalRevenue': float(total_revenue),
            'pendingOrders': pending_orders,
            'featuredProducts': featured,
        },
        'monthlyRevenue': [
            {
                'month': m.month.strftime('%b %Y') if m.month else '',
                'revenue': float(m.revenue or 0),
                'orders': m.orders,
            }
            for m in reversed(monthly)
        ],
        'recentOrders': recent_orders_data,
    })


# ── Products ──────────────────────────────────────────────────────────────────

@admin_bp.route('/products', methods=['GET'])
@jwt_required()
def list_products():
    err = require_admin()
    if err: return err

    page     = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('limit', 20, type=int), 100)
    search   = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    featured = request.args.get('featured')
    active   = request.args.get('active')

    q = Product.query

    if search:
        term = f'%{search}%'
        q = q.filter(or_(Product.name.ilike(term), Product.sku.ilike(term)))
    if category:
        cat = Category.query.filter_by(slug=category).first()
        if cat:
            ids = [cat.id] + [s.id for s in cat.subcategories]
            q = q.filter(Product.category_id.in_(ids))
    if featured == 'true':
        q = q.filter_by(is_featured=True)
    if active == 'false':
        q = q.filter_by(is_active=False)
    else:
        q = q.filter_by(is_active=True)

    pag = q.order_by(desc(Product.created_at)).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'products': [_product_row(p) for p in pag.items],
        'pagination': {
            'page': page, 'perPage': per_page,
            'total': pag.total, 'totalPages': pag.pages,
        },
    })


def _product_row(p):
    return {
        'id': str(p.id),
        'name': p.name,
        'slug': p.slug,
        'sku': p.sku,
        'price': float(p.price),
        'compareAtPrice': float(p.compare_at_price) if p.compare_at_price else None,
        'stock': p.stock_quantity,
        'isActive': p.is_active,
        'isFeatured': p.is_featured,
        'brand': {'id': p.brand.id, 'name': p.brand.name} if p.brand else None,
        'category': {'id': p.category.id, 'name': p.category.name, 'slug': p.category.slug} if p.category else None,
        'primaryImage': p.primary_image(),
        'createdAt': p.created_at.isoformat() if p.created_at else None,
    }


@admin_bp.route('/products/<product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    err = require_admin()
    if err: return err
    p = Product.query.get(product_id)
    if not p:
        return jsonify({'error': 'Not found'}), 404
    data = p.to_dict(include_details=True)
    return jsonify({'product': data})


@admin_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    err = require_admin()
    if err: return err

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    price = data.get('price')
    if price is None:
        return jsonify({'error': 'Price is required'}), 400

    # Generate unique slug
    base_slug = slugify(name)
    slug = base_slug
    i = 1
    while Product.query.filter_by(slug=slug).first():
        slug = f'{base_slug}-{i}'
        i += 1

    meta = {}
    if data.get('fragranceNotes'):
        fn = data['fragranceNotes']
        if fn.get('top'):    meta['notes_top']    = fn['top']
        if fn.get('middle'): meta['notes_middle'] = fn['middle']
        if fn.get('base'):   meta['notes_base']   = fn['base']
        if fn.get('longevity'): meta['longevity'] = fn['longevity']
        if fn.get('sillage'):   meta['sillage']   = fn['sillage']
        if fn.get('gender'):    meta['gender']    = fn['gender']
        if fn.get('family'):    meta['fragrance_family'] = fn['family']

    product = Product(
        name=name,
        slug=slug,
        price=float(price),
        compare_at_price=float(data['compareAtPrice']) if data.get('compareAtPrice') else None,
        cost_price=float(data['costPrice']) if data.get('costPrice') else None,
        description=data.get('description', ''),
        short_description=data.get('shortDescription', ''),
        sku=data.get('sku') or None,
        stock_quantity=int(data.get('stock', 0)),
        is_active=bool(data.get('isActive', True)),
        is_featured=bool(data.get('isFeatured', False)),
        brand_id=data.get('brandId'),
        category_id=data.get('categoryId'),
        tags=data.get('tags') or [],
        meta=meta,
    )
    db.session.add(product)
    db.session.flush()

    # Add image if provided
    image_url = data.get('imageUrl', '').strip()
    if image_url:
        img = ProductImage(
            product_id=product.id,
            url=image_url,
            alt_text=name,
            is_primary=True,
        )
        db.session.add(img)

    db.session.commit()
    return jsonify({'product': _product_row(product)}), 201


@admin_bp.route('/products/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    err = require_admin()
    if err: return err

    p = Product.query.get(product_id)
    if not p:
        return jsonify({'error': 'Not found'}), 404

    data = request.get_json() or {}

    if 'name' in data:          p.name = data['name'].strip()
    if 'price' in data:         p.price = float(data['price'])
    if 'compareAtPrice' in data: p.compare_at_price = float(data['compareAtPrice']) if data['compareAtPrice'] else None
    if 'description' in data:   p.description = data['description']
    if 'shortDescription' in data: p.short_description = data['shortDescription']
    if 'sku' in data:           p.sku = data['sku'] or None
    if 'stock' in data:         p.stock_quantity = int(data['stock'])
    if 'isActive' in data:      p.is_active = bool(data['isActive'])
    if 'isFeatured' in data:    p.is_featured = bool(data['isFeatured'])
    if 'brandId' in data:       p.brand_id = data['brandId']
    if 'categoryId' in data:    p.category_id = data['categoryId']
    if 'tags' in data:          p.tags = data['tags'] or []

    if 'fragranceNotes' in data:
        fn = data['fragranceNotes'] or {}
        meta = dict(p.meta or {})
        for k in ('notes_top', 'notes_middle', 'notes_base', 'longevity', 'sillage', 'gender'):
            meta.pop(k, None)
        if fn.get('top'):    meta['notes_top']    = fn['top']
        if fn.get('middle'): meta['notes_middle'] = fn['middle']
        if fn.get('base'):   meta['notes_base']   = fn['base']
        if fn.get('longevity'): meta['longevity'] = fn['longevity']
        if fn.get('sillage'):   meta['sillage']   = fn['sillage']
        if fn.get('gender'):    meta['gender']    = fn['gender']
        if fn.get('family'):    meta['fragrance_family'] = fn['family']
        p.meta = meta

    if 'imageUrl' in data and data['imageUrl']:
        existing = ProductImage.query.filter_by(product_id=p.id, is_primary=True).first()
        if existing:
            existing.url = data['imageUrl']
        else:
            db.session.add(ProductImage(product_id=p.id, url=data['imageUrl'], is_primary=True))

    p.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'product': _product_row(p)})


@admin_bp.route('/products/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    err = require_admin()
    if err: return err
    p = Product.query.get(product_id)
    if not p:
        return jsonify({'error': 'Not found'}), 404
    p.is_active = False
    db.session.commit()
    return jsonify({'message': 'Product deactivated'})


# ── Orders ────────────────────────────────────────────────────────────────────

@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def list_orders():
    err = require_admin()
    if err: return err

    page     = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('limit', 20, type=int), 100)
    status   = request.args.get('status', '').strip()
    search   = request.args.get('search', '').strip()

    q = Order.query.join(User, Order.user_id == User.id, isouter=True)

    if status:
        q = q.filter(Order.status == status)
    if search:
        term = f'%{search}%'
        q = q.filter(or_(
            Order.order_number.ilike(term),
            User.email.ilike(term),
            User.first_name.ilike(term),
            User.last_name.ilike(term),
        ))

    pag = q.order_by(desc(Order.created_at)).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'orders': [_order_row(o) for o in pag.items],
        'pagination': {
            'page': page, 'perPage': per_page,
            'total': pag.total, 'totalPages': pag.pages,
        },
    })


def _order_row(o):
    return {
        'id': str(o.id),
        'orderNumber': o.order_number,
        'status': o.status,
        'subtotal': float(o.subtotal),
        'total': float(o.total),
        'currency': o.currency,
        'itemCount': len(o.items),
        'customerName': f"{o.user.first_name} {o.user.last_name}" if o.user else 'Guest',
        'customerEmail': o.user.email if o.user else '',
        'shippingAddress': o.shipping_address,
        'createdAt': o.created_at.isoformat() if o.created_at else None,
        'updatedAt': o.updated_at.isoformat() if o.updated_at else None,
    }


@admin_bp.route('/orders/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    err = require_admin()
    if err: return err
    o = Order.query.get(order_id)
    if not o:
        return jsonify({'error': 'Not found'}), 404

    items = [{
        'id': str(i.id),
        'productName': i.product_name,
        'variantName': i.variant_name,
        'quantity': i.quantity,
        'unitPrice': float(i.unit_price),
        'totalPrice': float(i.total_price),
        'productImage': (i.snapshot or {}).get('primaryImage'),
    } for i in o.items]

    return jsonify({
        'order': {
            **_order_row(o),
            'items': items,
            'billingAddress': o.billing_address,
            'notes': o.notes,
            'taxAmount': float(o.tax_amount or 0),
            'shippingAmount': float(o.shipping_amount or 0),
            'discountAmount': float(o.discount_amount or 0),
        }
    })


@admin_bp.route('/orders/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    err = require_admin()
    if err: return err
    o = Order.query.get(order_id)
    if not o:
        return jsonify({'error': 'Not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    if new_status not in ORDER_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(ORDER_STATUSES)}'}), 400

    o.status = new_status
    o.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'order': _order_row(o)})


# ── Users ─────────────────────────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    err = require_admin()
    if err: return err

    page     = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('limit', 20, type=int), 100)
    search   = request.args.get('search', '').strip()

    q = User.query
    if search:
        term = f'%{search}%'
        q = q.filter(or_(User.email.ilike(term), User.first_name.ilike(term), User.last_name.ilike(term)))

    pag = q.order_by(desc(User.created_at)).paginate(page=page, per_page=per_page, error_out=False)

    def user_row(u):
        order_count = Order.query.filter_by(user_id=u.id).count()
        total_spent = db.session.query(func.sum(Order.total)).filter_by(user_id=u.id).scalar() or 0
        return {
            'id': str(u.id),
            'email': u.email,
            'firstName': u.first_name,
            'lastName': u.last_name,
            'skinTone': u.skin_tone,
            'skinType': u.skin_type,
            'orderCount': order_count,
            'totalSpent': float(total_spent),
            'createdAt': u.created_at.isoformat() if u.created_at else None,
        }

    return jsonify({
        'users': [user_row(u) for u in pag.items],
        'pagination': {'page': page, 'perPage': per_page, 'total': pag.total, 'totalPages': pag.pages},
    })


# ── Categories & Brands ───────────────────────────────────────────────────────

@admin_bp.route('/categories', methods=['GET'])
@jwt_required()
def list_categories():
    err = require_admin()
    if err: return err
    cats = Category.query.order_by(Category.parent_id.asc().nullsfirst(), Category.name.asc()).all()
    return jsonify({'categories': [{'id': c.id, 'name': c.name, 'slug': c.slug, 'parentId': c.parent_id} for c in cats]})


@admin_bp.route('/brands', methods=['GET'])
@jwt_required()
def list_brands():
    err = require_admin()
    if err: return err
    brands = Brand.query.order_by(Brand.name.asc()).all()
    return jsonify({'brands': [{'id': b.id, 'name': b.name, 'slug': b.slug} for b in brands]})


@admin_bp.route('/brands', methods=['POST'])
@jwt_required()
def create_brand():
    err = require_admin()
    if err: return err

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Brand name is required'}), 400

    brand_slug = slugify(name)
    # Ensure unique slug
    base = brand_slug
    i = 1
    while Brand.query.filter_by(slug=brand_slug).first():
        brand_slug = f'{base}-{i}'
        i += 1

    brand = Brand(
        name=name,
        slug=brand_slug,
        description=data.get('description', f'{name} beauty brand'),
        country=data.get('country', '').strip() or None,
    )
    db.session.add(brand)
    db.session.commit()
    return jsonify({'brand': {'id': brand.id, 'name': brand.name, 'slug': brand.slug}}), 201


# ── Beauty Consultant ─────────────────────────────────────────────────────────

@admin_bp.route('/consultant/login', methods=['POST'])
def consultant_login_route():
    data = request.get_json() or {}
    password = data.get('password', '').strip()
    consultant_pass = os.getenv('CONSULTANT_PASSWORD', 'beautyexpert2026')
    if not password or password != consultant_pass:
        return jsonify({'error': 'Invalid password'}), 401
    token = create_access_token(
        identity='consultant',
        additional_claims={'role': 'consultant'},
        expires_delta=timedelta(hours=12)
    )
    return jsonify({'access_token': token})


@admin_bp.route('/consultant/clients', methods=['GET'])
@jwt_required()
def consultant_list_clients():
    err = require_consultant()
    if err: return err

    page     = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('limit', 30, type=int), 100)
    search   = request.args.get('search', '').strip()

    q = User.query
    if search:
        term = f'%{search}%'
        q = q.filter(or_(
            User.email.ilike(term),
            User.first_name.ilike(term),
            User.last_name.ilike(term),
        ))

    pag = q.order_by(desc(User.created_at)).paginate(page=page, per_page=per_page, error_out=False)

    def client_row(u):
        order_count = Order.query.filter_by(user_id=u.id).count()
        total_spent = db.session.query(func.sum(Order.total)).filter_by(user_id=u.id).scalar() or 0
        review_count = Review.query.filter_by(user_id=u.id).count()
        prefs = u.preferences or {}
        has_notes = bool(prefs.get('consultant_notes'))
        last_order = Order.query.filter_by(user_id=u.id).order_by(desc(Order.created_at)).first()
        return {
            'id': str(u.id),
            'email': u.email,
            'firstName': u.first_name,
            'lastName': u.last_name,
            'skinTone': u.skin_tone,
            'skinType': u.skin_type,
            'orderCount': order_count,
            'totalSpent': float(total_spent),
            'reviewCount': review_count,
            'hasNotes': has_notes,
            'lastOrderAt': last_order.created_at.isoformat() if last_order else None,
            'createdAt': u.created_at.isoformat() if u.created_at else None,
        }

    return jsonify({
        'clients': [client_row(u) for u in pag.items],
        'pagination': {'page': page, 'perPage': per_page, 'total': pag.total, 'totalPages': pag.pages},
    })


@admin_bp.route('/consultant/clients/<user_id>', methods=['GET'])
@jwt_required()
def consultant_get_client(user_id):
    err = require_consultant()
    if err: return err

    u = User.query.get(user_id)
    if not u:
        return jsonify({'error': 'User not found'}), 404

    orders = (Order.query.filter_by(user_id=u.id)
              .order_by(desc(Order.created_at)).limit(10).all())
    reviews = Review.query.filter_by(user_id=u.id).order_by(desc(Review.created_at)).all()
    chat_count = ChatSession.query.filter_by(user_id=u.id).count()
    order_count = Order.query.filter_by(user_id=u.id).count()
    total_spent = db.session.query(func.sum(Order.total)).filter_by(user_id=u.id).scalar() or 0

    prefs = u.preferences or {}
    consultant_notes = prefs.get('consultant_notes', [])
    recommended_ids  = prefs.get('recommended_products', [])

    recommended_products = []
    if recommended_ids:
        for pid in recommended_ids[-10:]:
            p = Product.query.get(pid)
            if p:
                recommended_products.append({
                    'id': str(p.id),
                    'name': p.name,
                    'slug': p.slug,
                    'price': float(p.price),
                    'primaryImage': p.primary_image(),
                    'brand': p.brand.name if p.brand else None,
                })

    return jsonify({
        'client': {
            'id': str(u.id),
            'email': u.email,
            'firstName': u.first_name,
            'lastName': u.last_name,
            'skinTone': u.skin_tone,
            'skinType': u.skin_type,
            'preferences': prefs,
            'createdAt': u.created_at.isoformat() if u.created_at else None,
            'orderCount': order_count,
            'totalSpent': float(total_spent),
            'chatCount': chat_count,
            'consultantNotes': consultant_notes,
            'recommendedProducts': recommended_products,
            'orders': [
                {
                    'id': str(o.id),
                    'orderNumber': o.order_number,
                    'status': o.status,
                    'total': float(o.total),
                    'itemCount': sum(i.quantity for i in o.items),
                    'createdAt': o.created_at.isoformat() if o.created_at else None,
                }
                for o in orders
            ],
            'reviews': [
                {
                    'id': str(r.id),
                    'productName': r.product.name if r.product else '',
                    'rating': r.rating,
                    'title': r.title,
                    'body': r.body,
                    'createdAt': r.created_at.isoformat() if r.created_at else None,
                }
                for r in reviews
            ],
        }
    })


@admin_bp.route('/consultant/clients/<user_id>/notes', methods=['POST'])
@jwt_required()
def consultant_add_note(user_id):
    err = require_consultant()
    if err: return err

    u = User.query.get(user_id)
    if not u:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    note_text = data.get('note', '').strip()
    if not note_text:
        return jsonify({'error': 'Note text required'}), 400

    prefs = dict(u.preferences or {})
    notes = list(prefs.get('consultant_notes', []))
    notes.append({
        'text': note_text,
        'createdAt': datetime.utcnow().isoformat(),
    })
    prefs['consultant_notes'] = notes[-50:]
    u.preferences = prefs
    db.session.commit()

    return jsonify({'notes': prefs['consultant_notes']})


@admin_bp.route('/consultant/clients/<user_id>/recommend', methods=['POST'])
@jwt_required()
def consultant_recommend(user_id):
    err = require_consultant()
    if err: return err

    u = User.query.get(user_id)
    if not u:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    product_id = data.get('productId', '').strip()
    if not product_id:
        return jsonify({'error': 'productId required'}), 400

    p = Product.query.get(product_id)
    if not p:
        return jsonify({'error': 'Product not found'}), 404

    prefs = dict(u.preferences or {})
    recs = list(prefs.get('recommended_products', []))
    if product_id not in recs:
        recs.append(product_id)
    prefs['recommended_products'] = recs[-20:]
    u.preferences = prefs
    db.session.commit()

    return jsonify({
        'product': {
            'id': str(p.id),
            'name': p.name,
            'slug': p.slug,
            'price': float(p.price),
            'primaryImage': p.primary_image(),
            'brand': p.brand.name if p.brand else None,
        }
    })
