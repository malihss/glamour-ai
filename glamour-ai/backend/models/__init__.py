"""
models/__init__.py — SQLAlchemy ORM Models
"""

import uuid
from datetime import datetime
from extensions import db
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy import Text
import bcrypt


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    avatar_url = db.Column(Text)
    skin_tone = db.Column(db.String(50))
    skin_type = db.Column(db.String(50))
    preferences = db.Column(JSONB, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    carts = db.relationship('Cart', backref='user', lazy=True)
    orders = db.relationship('Order', backref='user', lazy=True)
    wishlists = db.relationship('Wishlist', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'avatarUrl': self.avatar_url,
            'skinTone': self.skin_tone,
            'skinType': self.skin_type,
            'preferences': self.preferences,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(Text)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    image_url = db.Column(Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    products = db.relationship('Product', backref='category', lazy=True)
    subcategories = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))

    def to_dict(self, include_subs=False):
        d = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'parentId': self.parent_id,
            'imageUrl': self.image_url,
        }
        if include_subs:
            d['subcategories'] = [s.to_dict() for s in self.subcategories]
        return d


class Brand(db.Model):
    __tablename__ = 'brands'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    logo_url = db.Column(Text)
    description = db.Column(Text)
    country = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    products = db.relationship('Product', backref='brand', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'logoUrl': self.logo_url,
            'description': self.description,
            'country': self.country
        }


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = db.Column(db.Integer, db.ForeignKey('brands.id'))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(Text)
    short_description = db.Column(db.String(500))
    price = db.Column(db.Numeric(10, 2), nullable=False)
    compare_at_price = db.Column(db.Numeric(10, 2))
    cost_price = db.Column(db.Numeric(10, 2))
    sku = db.Column(db.String(100), unique=True)
    stock_quantity = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    tags = db.Column(ARRAY(Text))
    meta = db.Column(JSONB, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    variants = db.relationship('ProductVariant', backref='product', lazy=True, cascade='all, delete-orphan')
    images = db.relationship('ProductImage', backref='product', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='product', lazy=True)

    def avg_rating(self):
        if self.reviews:
            return round(sum(r.rating for r in self.reviews) / len(self.reviews), 1)
        # Fall back to rating imported from external API
        if self.meta and self.meta.get('api_rating'):
            return self.meta['api_rating']
        return None

    def primary_image(self):
        for img in self.images:
            if img.is_primary:
                return img.url
        return self.images[0].url if self.images else None

    def to_dict(self, include_details=False):
        data = {
            'id': str(self.id),
            'name': self.name,
            'slug': self.slug,
            'shortDescription': self.short_description,
            'price': float(self.price),
            'compareAtPrice': float(self.compare_at_price) if self.compare_at_price else None,
            'sku': self.sku,
            'stockQuantity': self.stock_quantity,
            'isFeatured': self.is_featured,
            'tags': self.tags or [],
            'primaryImage': self.primary_image(),
            'avgRating': self.avg_rating(),
            'reviewCount': len(self.reviews),
            'brand': self.brand.to_dict() if self.brand else None,
            'category': self.category.to_dict() if self.category else None,
            'variants': [v.to_dict() for v in self.variants if v.is_active],
        }
        if include_details:
            data['description'] = self.description
            data['images'] = [img.to_dict() for img in self.images]
            # Expose rich fragrance metadata when present
            if self.meta:
                for key in ('notes_top', 'notes_middle', 'notes_base',
                            'longevity', 'sillage', 'votes',
                            'release_year', 'gender', 'perfume_url'):
                    if key in self.meta:
                        data[key] = self.meta[key]
            data['reviews'] = [r.to_dict() for r in self.reviews[:10]]
        return data


class ProductVariant(db.Model):
    __tablename__ = 'product_variants'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    shade_hex = db.Column(db.String(7))
    price_modifier = db.Column(db.Numeric(10, 2), default=0)
    stock_quantity = db.Column(db.Integer, default=0)
    sku = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'shadeHex': self.shade_hex,
            'priceModifier': float(self.price_modifier) if self.price_modifier else 0,
            'stockQuantity': self.stock_quantity,
            'sku': self.sku,
            'sortOrder': self.sort_order
        }


class ProductImage(db.Model):
    __tablename__ = 'product_images'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('product_variants.id'))
    url = db.Column(Text, nullable=False)
    alt_text = db.Column(db.String(255))
    is_primary = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': str(self.id),
            'url': self.url,
            'altText': self.alt_text,
            'isPrimary': self.is_primary,
            'sortOrder': self.sort_order
        }


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    rating = db.Column(db.Integer)
    title = db.Column(db.String(255))
    body = db.Column(Text)
    is_verified_purchase = db.Column(db.Boolean, default=False)
    helpful_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='reviews', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'rating': self.rating,
            'title': self.title,
            'body': self.body,
            'isVerifiedPurchase': self.is_verified_purchase,
            'helpfulCount': self.helpful_count,
            'userName': f"{self.user.first_name} {self.user.last_name[0]}." if self.user else "Anonymous",
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    session_id = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('CartItem', backref='cart', lazy=True, cascade='all, delete-orphan')

    def total(self):
        return sum(item.unit_price * item.quantity for item in self.items)

    def to_dict(self):
        return {
            'id': str(self.id),
            'items': [item.to_dict() for item in self.items],
            'itemCount': sum(item.quantity for item in self.items),
            'subtotal': float(self.total()),
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cart_id = db.Column(UUID(as_uuid=True), db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('product_variants.id'))
    quantity = db.Column(db.Integer, default=1)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', lazy=True)
    variant = db.relationship('ProductVariant', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'productId': str(self.product_id),
            'variantId': str(self.variant_id) if self.variant_id else None,
            'quantity': self.quantity,
            'unitPrice': float(self.unit_price),
            'totalPrice': float(self.unit_price * self.quantity),
            'product': self.product.to_dict() if self.product else None,
            'variant': self.variant.to_dict() if self.variant else None
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    status = db.Column(db.String(50), default='pending')
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    shipping_amount = db.Column(db.Numeric(10, 2), default=0)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='USD')
    shipping_address = db.Column(JSONB)
    billing_address = db.Column(JSONB)
    notes = db.Column(Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'orderNumber': self.order_number,
            'status': self.status,
            'subtotal': float(self.subtotal),
            'taxAmount': float(self.tax_amount),
            'shippingAmount': float(self.shipping_amount),
            'discountAmount': float(self.discount_amount),
            'total': float(self.total),
            'currency': self.currency,
            'shippingAddress': self.shipping_address,
            'billingAddress': self.billing_address,
            'items': [item.to_dict() for item in self.items],
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = db.Column(UUID(as_uuid=True), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'))
    variant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('product_variants.id'))
    product_name = db.Column(db.String(255), nullable=False)
    variant_name = db.Column(db.String(100))
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    snapshot = db.Column(JSONB, default={})

    def to_dict(self):
        return {
            'id': str(self.id),
            'productName': self.product_name,
            'variantName': self.variant_name,
            'quantity': self.quantity,
            'unitPrice': float(self.unit_price),
            'totalPrice': float(self.total_price),
            'snapshot': self.snapshot
        }


class Wishlist(db.Model):
    __tablename__ = 'wishlists'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('product_variants.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', lazy=True)


class UserInteraction(db.Model):
    __tablename__ = 'user_interactions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    interaction_type = db.Column(db.String(50))
    weight = db.Column(db.Numeric(5, 2), default=1.0)
    meta_data = db.Column('metadata', JSONB, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    session_token = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade='all, delete-orphan')


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = db.Column(UUID(as_uuid=True), db.ForeignKey('chat_sessions.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(Text, nullable=False)
    meta_data = db.Column('metadata', JSONB, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'role': self.role,
            'content': self.content,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
