"""
routes/products.py — Product catalog endpoints
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import db
from models import Product, ProductVariant, Category, Brand, Review, Wishlist, UserInteraction
from sqlalchemy import or_, func, desc, asc
import uuid
import math


def _hex_distance(h1: str, h2: str) -> float:
    """Euclidean RGB distance between two hex color strings."""
    def parse(h):
        h = h.lstrip('#')
        if len(h) != 6:
            return None
        try:
            return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        except ValueError:
            return None
    p1, p2 = parse(h1), parse(h2)
    if not p1 or not p2:
        return math.inf
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))

products_bp = Blueprint('products', __name__)


@products_bp.route('/', methods=['GET'])
def list_products():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('limit', 12, type=int), 100)
    category = request.args.get('category')
    brand = request.args.get('brand')
    search = request.args.get('search')
    min_price = request.args.get('minPrice', type=float)
    max_price = request.args.get('maxPrice', type=float)
    featured = request.args.get('featured', type=bool)
    sort = request.args.get('sort', 'created_at')
    order = request.args.get('order', 'desc')
    tags = request.args.getlist('tags')
    ids_param = request.args.get('ids', '')
    shade_hex  = request.args.get('shade_hex', '').strip()

    query = Product.query.filter_by(is_active=True)

    if ids_param:
        id_list = [i.strip() for i in ids_param.split(',') if i.strip()]
        try:
            uuid_list = [uuid.UUID(i) for i in id_list]
            query = query.filter(Product.id.in_(uuid_list))
            per_page = len(uuid_list)
        except ValueError:
            pass

    if category:
        cat = Category.query.filter_by(slug=category).first()
        if cat:
            # Include subcategories
            cat_ids = [cat.id] + [s.id for s in cat.subcategories]
            query = query.filter(Product.category_id.in_(cat_ids))

    if brand:
        b = Brand.query.filter_by(slug=brand).first()
        if b:
            query = query.filter_by(brand_id=b.id)

    if search:
        search_term = f'%{search}%'
        query = query.filter(or_(
            Product.name.ilike(search_term),
            Product.short_description.ilike(search_term),
            Product.description.ilike(search_term)
        ))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if featured:
        query = query.filter_by(is_featured=True)

    if tags:
        for tag in tags:
            query = query.filter(Product.tags.any(tag))

    # Sorting
    sort_map = {
        'price': Product.price,
        'name': Product.name,
        'created_at': Product.created_at,
        'rating': func.coalesce(
            db.session.query(func.avg(Review.rating))
                .filter(Review.product_id == Product.id)
                .correlate(Product)
                .scalar_subquery(), 0
        )
    }
    sort_col = sort_map.get(sort, Product.created_at)
    query = query.order_by(desc(sort_col) if order == 'desc' else asc(sort_col))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    products_out = []
    for p in pagination.items:
        d = p.to_dict()
        if shade_hex:
            # Attach the closest-color variant when variants with hex values exist.
            # Products without hex variants (mascara, eyeliner, etc.) are still
            # included — they just won't have a matchedVariant annotation.
            active_variants = [v for v in p.variants if v.is_active and v.shade_hex]
            if active_variants:
                best = min(active_variants, key=lambda v: _hex_distance(shade_hex, v.shade_hex))
                dist = _hex_distance(shade_hex, best.shade_hex)
                d['matchedVariant'] = best.to_dict()
                d['matchedVariant']['colorDistance'] = dist
        products_out.append(d)

    # When shade requested: products with a close color match float to the top;
    # products without hex variants (single-shade items) go to the bottom.
    if shade_hex:
        products_out.sort(key=lambda d: d.get('matchedVariant', {}).get('colorDistance', math.inf))

    return jsonify({
        'products': products_out,
        'pagination': {
            'page': page,
            'perPage': per_page,
            'total': pagination.total,
            'totalPages': pagination.pages,
            'hasNext': pagination.has_next,
            'hasPrev': pagination.has_prev
        }
    })


@products_bp.route('/featured', methods=['GET'])
def featured_products():
    # Return 2 products per root category for a balanced, diverse showcase
    root_cats = ['makeup', 'skincare', 'fragrance', 'tools']
    result = []
    for slug in root_cats:
        cat = Category.query.filter_by(slug=slug).first()
        if not cat:
            continue
        cat_ids = [cat.id] + [s.id for s in cat.subcategories]
        picks = Product.query.filter(
            Product.is_active == True,
            Product.is_featured == True,
            Product.category_id.in_(cat_ids)
        ).order_by(func.random()).limit(2).all()
        result.extend(picks)
    # Pad with any other featured products if fewer than 8
    if len(result) < 8:
        existing_ids = [p.id for p in result]
        extras = Product.query.filter(
            Product.is_active == True,
            Product.is_featured == True,
            ~Product.id.in_(existing_ids)
        ).order_by(func.random()).limit(8 - len(result)).all()
        result.extend(extras)
    return jsonify({'products': [p.to_dict() for p in result]})


@products_bp.route('/categories', methods=['GET'])
def list_categories():
    categories = Category.query.filter_by(parent_id=None).all()
    return jsonify({'categories': [c.to_dict(include_subs=True) for c in categories]})


@products_bp.route('/brands', methods=['GET'])
def list_brands():
    brands = Brand.query.all()
    return jsonify({'brands': [b.to_dict() for b in brands]})


@products_bp.route('/<slug>', methods=['GET'])
def get_product(slug):
    product = Product.query.filter_by(slug=slug, is_active=True).first()
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # Track view interaction if user is logged in
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            interaction = UserInteraction(
                user_id=user_id,
                product_id=product.id,
                interaction_type='view',
                weight=0.5
            )
            db.session.add(interaction)
            db.session.commit()
    except Exception:
        pass

    # Related products (same category)
    related = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).limit(4).all()

    result = product.to_dict(include_details=True)
    result['relatedProducts'] = [p.to_dict() for p in related]

    # Full reviews list (not capped at 10) + rating breakdown
    all_reviews = product.reviews
    result['reviews'] = [r.to_dict() for r in all_reviews]
    breakdown = {str(i): 0 for i in range(1, 6)}
    for r in all_reviews:
        if r.rating and 1 <= r.rating <= 5:
            breakdown[str(r.rating)] += 1
    result['ratingBreakdown'] = breakdown
    result['reviewCount'] = len(all_reviews)

    return jsonify({'product': result})


@products_bp.route('/<product_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(product_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    if not 1 <= data.get('rating', 0) <= 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    review = Review(
        product_id=product_id,
        user_id=user_id,
        rating=data['rating'],
        title=data.get('title'),
        body=data.get('body'),
        is_verified_purchase=False
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({'review': review.to_dict()}), 201


@products_bp.route('/reviews/recent', methods=['GET'])
def recent_reviews():
    limit = min(request.args.get('limit', 6, type=int), 20)
    reviews = (
        Review.query
        .filter(Review.body != None, Review.body != '', Review.rating >= 4)
        .order_by(desc(Review.created_at))
        .limit(limit)
        .all()
    )
    result = []
    for r in reviews:
        p = r.product
        if r.reviewer_name:
            name = r.reviewer_name
        elif r.user:
            name = f"{r.user.first_name} {r.user.last_name[0]}."
        else:
            name = 'Anonymous'
        result.append({
            'id': str(r.id),
            'name': name,
            'rating': r.rating,
            'title': r.title,
            'body': r.body,
            'productName': p.name if p else '',
            'productSlug': p.slug if p else '',
            'createdAt': r.created_at.isoformat() if r.created_at else None,
        })
    return jsonify({'reviews': result})


@products_bp.route('/search/suggestions', methods=['GET'])
def search_suggestions():
    q = request.args.get('q', '')
    if len(q) < 2:
        return jsonify({'suggestions': []})

    products = Product.query.filter(
        Product.name.ilike(f'%{q}%'),
        Product.is_active == True
    ).limit(5).all()

    brands = Brand.query.filter(Brand.name.ilike(f'%{q}%')).limit(3).all()

    return jsonify({
        'suggestions': {
            'products': [{'id': str(p.id), 'name': p.name, 'slug': p.slug, 'image': p.primary_image()} for p in products],
            'brands': [{'id': b.id, 'name': b.name, 'slug': b.slug} for b in brands]
        }
    })
