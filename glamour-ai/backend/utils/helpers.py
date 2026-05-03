"""
utils/helpers.py — Utility functions
"""

import re
import uuid
from datetime import datetime


def slugify(text: str) -> str:
    """Convert text to URL-safe slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


def generate_sku(brand_slug: str, category: str) -> str:
    """Generate a unique SKU"""
    brand_prefix = brand_slug[:3].upper().replace('-', '')
    cat_prefix = category[:3].upper()
    unique_part = str(uuid.uuid4())[:6].upper()
    return f"{brand_prefix}-{cat_prefix}-{unique_part}"


def format_price(price: float, currency: str = 'USD') -> str:
    """Format price with currency"""
    symbols = {'USD': '$', 'EUR': '€', 'GBP': '£'}
    symbol = symbols.get(currency, '$')
    return f"{symbol}{price:.2f}"


def paginate_query(query, page: int, per_page: int):
    """Helper to paginate a SQLAlchemy query"""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        'items': pagination.items,
        'pagination': {
            'page': page,
            'perPage': per_page,
            'total': pagination.total,
            'totalPages': pagination.pages,
            'hasNext': pagination.has_next,
            'hasPrev': pagination.has_prev,
        }
    }


def validate_uuid(value: str) -> bool:
    """Check if string is a valid UUID"""
    try:
        uuid.UUID(str(value))
        return True
    except ValueError:
        return False
