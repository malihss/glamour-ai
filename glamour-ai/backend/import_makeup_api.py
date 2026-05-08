"""
import_makeup_api.py — Fetch products from makeup-api and load into the DB.
Run from the backend directory with the venv active:
    python import_makeup_api.py
"""

import sys, re, requests
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from extensions import db
from models import Category, Brand, Product, ProductVariant, ProductImage

API_BASE = "http://makeup-api.herokuapp.com/api/v1/products.json"

# makeup-api product_type → our category slug
CATEGORY_MAP = {
    "lipstick":   "lip",
    "lip_liner":  "lip",
    "eyeshadow":  "eyes",
    "eyeliner":   "eyes",
    "eyebrow":    "eyes",
    "mascara":    "eyes",
    "foundation": "face",
    "blush":      "face",
    "bronzer":    "face",
    "concealer":  "face",
    "skincare":   "moisturizers",
    "moisturizer":"moisturizers",
    "serum":      "serums",
}

# Fetch these types in order
PRODUCT_TYPES = [
    "lipstick", "eyeshadow", "foundation", "blush",
    "mascara", "eyeliner", "bronzer", "concealer",
    "lip_liner", "eyebrow", "skincare",
]


def slugify(text: str) -> str:
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")


def fix_image(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if url.startswith("//"):
        url = "https:" + url
    if not url.startswith("http"):
        return None
    # Skip tiny placeholder images
    if "open-uri" in url and "donovanbailey" in url:
        return None
    return url


def fetch_type(product_type: str) -> list:
    try:
        r = requests.get(API_BASE, params={"product_type": product_type}, timeout=20)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  [warn] Could not fetch {product_type}: {e}")
        return []


def run():
    app = create_app()
    with app.app_context():
        # Cache category lookups
        cat_cache: dict[str, Category] = {
            c.slug: c for c in Category.query.all()
        }
        brand_cache: dict[str, Brand] = {
            b.slug: b for b in Brand.query.all()
        }
        used_slugs: set[str] = {p.slug for p in Product.query.all()}

        total_added = 0

        for ptype in PRODUCT_TYPES:
            cat_slug = CATEGORY_MAP.get(ptype)
            if not cat_slug or cat_slug not in cat_cache:
                print(f"  [skip] No category mapped for {ptype}")
                continue

            category = cat_cache[cat_slug]
            print(f"\nFetching {ptype} -> category '{cat_slug}' ...")
            items = fetch_type(ptype)
            print(f"  {len(items)} items returned by API")

            added = 0
            for item in items:
                # ── Validate ─────────────────────────────────────────
                try:
                    price = float(item.get("price") or 0)
                except (ValueError, TypeError):
                    price = 0.0
                if price <= 0:
                    continue

                image_url = fix_image(item.get("image_link"))
                if not image_url:
                    image_url = fix_image(item.get("api_featured_image"))
                if not image_url:
                    continue  # skip products with no usable image

                name = (item.get("name") or "").strip()
                if not name:
                    continue

                # ── Brand ─────────────────────────────────────────────
                brand_raw = (item.get("brand") or "unknown").strip()
                brand_slug = slugify(brand_raw)
                if brand_slug not in brand_cache:
                    brand = Brand(
                        name=brand_raw.title(),
                        slug=brand_slug,
                        description=f"{brand_raw.title()} cosmetics",
                        country="USA",
                    )
                    db.session.add(brand)
                    db.session.flush()
                    brand_cache[brand_slug] = brand
                brand = brand_cache[brand_slug]

                # ── Slug (unique) ─────────────────────────────────────
                base_slug = slugify(name)[:90]
                slug = base_slug
                counter = 2
                while slug in used_slugs:
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                used_slugs.add(slug)

                # ── SKU ───────────────────────────────────────────────
                sku = f"API-{item['id']}"

                # ── Description ───────────────────────────────────────
                description = (item.get("description") or "").strip() or name
                short_desc   = description[:160].rsplit(" ", 1)[0] + "..." \
                               if len(description) > 160 else description

                # ── Rating ────────────────────────────────────────────
                try:
                    api_rating = round(float(item.get("rating")), 1) if item.get("rating") else None
                except (ValueError, TypeError):
                    api_rating = None

                # ── Tags ─────────────────────────────────────────────
                tags = [t.strip() for t in (item.get("tag_list") or []) if t.strip()]
                tags.append(ptype.replace("_", "-"))

                # ── Meta ─────────────────────────────────────────────
                meta = {}
                if api_rating:
                    meta['api_rating'] = api_rating
                if item.get("product_link"):
                    meta['product_link'] = item['product_link']

                # ── Product ───────────────────────────────────────────
                product = Product(
                    brand_id=brand.id,
                    category_id=category.id,
                    name=name,
                    slug=slug,
                    description=description,
                    short_description=short_desc,
                    price=round(price, 2),
                    sku=sku,
                    stock_quantity=50,
                    is_active=True,
                    is_featured=False,
                    tags=tags,
                    meta=meta,
                )
                db.session.add(product)
                db.session.flush()  # get product.id

                # ── Image ─────────────────────────────────────────────
                img = ProductImage(
                    product_id=product.id,
                    url=image_url,
                    alt_text=name,
                    is_primary=True,
                    sort_order=1,
                )
                db.session.add(img)

                # ── Shade variants ────────────────────────────────────
                colors = item.get("product_colors") or []
                for i, color in enumerate(colors[:12], start=1):
                    hex_val = (color.get("hex_value") or "").strip()
                    color_name = (color.get("colour_name") or f"Shade {i}").strip()
                    if not hex_val.startswith("#"):
                        continue
                    variant = ProductVariant(
                        product_id=product.id,
                        name=color_name,
                        shade_hex=hex_val[:7],
                        stock_quantity=20,
                        sort_order=i,
                    )
                    db.session.add(variant)

                added += 1

            db.session.commit()
            print(f"  + {added} products added")
            total_added += added

        print(f"\n{'='*40}")
        print(f"Total products added: {total_added}")
        print(f"Total products in DB: {Product.query.count()}")


if __name__ == "__main__":
    run()
