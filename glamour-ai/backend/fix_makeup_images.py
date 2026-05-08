"""
fix_makeup_images.py
————————————————————
Replaces the generic Unsplash stock photos on every makeup product in
the database with REAL brand product photos pulled live from the free
Makeup API (makeup-api.herokuapp.com).

Category mapping
  lip   ← lipstick images
  eyes  ← eyeshadow + eyeliner + mascara images
  face  ← foundation + blush + bronzer images

Products in other categories (skincare, fragrance, tools) are untouched.

Run from the backend directory:
    ./venv/bin/python fix_makeup_images.py
"""

import sys, random, requests
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from extensions import db
from models import Product, ProductImage, Category

# ── Makeup-API product types → our category slugs ───────────────────────────
FETCH_MAP = {
    "lip":  ["lipstick", "lip_liner"],
    "eyes": ["eyeshadow", "eyeliner", "mascara", "eyebrow"],
    "face": ["foundation", "blush", "bronzer", "blush"],
}

API_BASE = "http://makeup-api.herokuapp.com/api/v1/products.json"


def fetch_images(product_type: str) -> list[str]:
    """Return a de-duplicated list of valid image URLs for a product_type."""
    try:
        r = requests.get(API_BASE, params={"product_type": product_type}, timeout=25)
        r.raise_for_status()
        products = r.json()
    except Exception as e:
        print(f"  [warn] Could not fetch {product_type}: {e}")
        return []

    urls = []
    seen = set()
    for p in products:
        url = (p.get("image_link") or "").strip()
        if (
            url
            and url.startswith("http")
            and "donovanbailey" not in url
            and "open-uri" not in url
            and url not in seen
        ):
            urls.append(url)
            seen.add(url)
    return urls


def build_pools() -> dict[str, list[str]]:
    """Fetch and merge image pools for each of our three makeup categories."""
    pools: dict[str, list[str]] = {}

    for cat_slug, types in FETCH_MAP.items():
        combined: list[str] = []
        for ptype in types:
            print(f"  Fetching {ptype} …", end=" ", flush=True)
            imgs = fetch_images(ptype)
            print(f"{len(imgs)} images")
            combined.extend(imgs)

        # Deduplicate and shuffle so products get varied images
        unique = list(dict.fromkeys(combined))
        random.shuffle(unique)
        pools[cat_slug] = unique
        print(f"  Pool for '{cat_slug}': {len(unique)} unique URLs\n")

    return pools


def update_category(cat_slug: str, image_pool: list[str]) -> int:
    """
    Replace primary images for all active products in cat_slug and its
    sub-categories with images cycled from image_pool.
    Returns the number of products updated.
    """
    if not image_pool:
        print(f"  [skip] Empty pool for {cat_slug}")
        return 0

    cat = Category.query.filter_by(slug=cat_slug).first()
    if not cat:
        print(f"  [skip] Category '{cat_slug}' not in DB")
        return 0

    # Include the root category AND all its sub-categories
    cat_ids = [cat.id] + [s.id for s in cat.subcategories]

    products = (
        Product.query
        .filter(Product.category_id.in_(cat_ids), Product.is_active == True)
        .all()
    )

    pool_size = len(image_pool)
    updated = 0

    for idx, product in enumerate(products):
        new_url = image_pool[idx % pool_size]

        # Update or create the primary image record
        primary_img = next((img for img in product.images if img.is_primary), None)

        if primary_img:
            primary_img.url = new_url
        else:
            db.session.add(ProductImage(
                product_id=product.id,
                url=new_url,
                alt_text=product.name,
                is_primary=True,
                sort_order=1,
            ))
        updated += 1

    db.session.commit()
    return updated


def run():
    print("=" * 55)
    print("Makeup Image Updater — Real Brand Product Photos")
    print("=" * 55, "\n")

    print("Step 1: Fetching image pools from Makeup API …\n")
    pools = build_pools()

    total_images_available = sum(len(v) for v in pools.values())
    print(f"Total real product images collected: {total_images_available}\n")

    app = create_app()
    with app.app_context():
        print("Step 2: Updating product images in database …\n")

        grand_total = 0
        for cat_slug, image_pool in pools.items():
            print(f"  Updating '{cat_slug}' products …")
            n = update_category(cat_slug, image_pool)
            print(f"    ✓ {n} products updated")
            grand_total += n

        print(f"\n{'=' * 55}")
        print(f"Done. {grand_total} makeup products now have real brand photos.")
        print("=" * 55)


if __name__ == "__main__":
    run()
