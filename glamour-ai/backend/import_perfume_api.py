"""
import_perfume_api.py — Import fragrances from PerfumAPI into the DB.
Run from the backend directory:
    ./venv/bin/python import_perfume_api.py
"""

import sys, re, random, requests
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from extensions import db
from models import Category, Brand, Product, ProductVariant, ProductImage

API_URL = "https://perfumapidatabase.onrender.com/perfumes?limit=500"

# Brand → realistic price range (min, max) in USD
BRAND_PRICING = {
    "chanel":                   (180, 350),
    "dior":                     (150, 320),
    "tom ford":                 (200, 420),
    "hermès":                   (180, 340),
    "hermes":                   (180, 340),
    "creed":                    (280, 520),
    "clive christian":          (320, 600),
    "roja dove":                (300, 550),
    "amouage":                  (220, 400),
    "xerjoff":                  (220, 380),
    "maison francis kurkdjian": (190, 360),
    "louis vuitton":            (240, 420),
    "by kilian":                (175, 320),
    "nasomatto":                (165, 300),
    "zoologist perfumes":       (145, 230),
    "maison martin margiela":   (140, 220),
    "yves saint laurent":       (110, 190),
    "givenchy":                 (100, 180),
    "valentino":                (100, 175),
    "versace":                   (85, 150),
    "burberry":                  (85, 145),
    "giorgio armani":            (90, 160),
    "carolina herrera":          (95, 165),
    "jean paul gaultier":        (90, 155),
    "guerlain":                 (120, 210),
    "lattafa perfumes":          (25,  55),
    "divine":                   (130, 250),
}
DEFAULT_PRICE = (90, 160)

# gender → category slug
GENDER_CATEGORY = {
    "Women": "eau-de-parfum",
    "Men":   "cologne",
    "Unisex":"eau-de-parfum",
}


def slugify(text: str) -> str:
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")


def price_for_brand(brand: str) -> float:
    key = brand.lower().strip()
    lo, hi = BRAND_PRICING.get(key, DEFAULT_PRICE)
    # Deterministic-ish but varied
    return round(random.uniform(lo, hi) / 5) * 5  # round to nearest $5


def run():
    print("Fetching perfumes from PerfumAPI …")
    try:
        r = requests.get(API_URL, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    perfumes = data.get("perfumes", [])
    print(f"Received {len(perfumes)} perfumes")

    app = create_app()
    with app.app_context():
        cat_cache:   dict[str, Category] = {c.slug: c for c in Category.query.all()}
        brand_cache: dict[str, Brand]    = {b.slug: b for b in Brand.query.all()}
        used_slugs:  set[str]            = {p.slug for p in Product.query.all()}
        used_skus:   set[str]            = {p.sku  for p in Product.query.all() if p.sku}

        added = skipped = 0

        for item in perfumes:
            name = (item.get("name") or "").strip()
            if not name:
                skipped += 1
                continue

            image_url = (item.get("image_url") or "").strip()
            if not image_url or not image_url.startswith("http"):
                skipped += 1
                continue

            # ── Category ──────────────────────────────────────────
            gender     = item.get("gender", "Unisex")
            cat_slug   = GENDER_CATEGORY.get(gender, "eau-de-parfum")
            category   = cat_cache.get(cat_slug)
            if not category:
                category = cat_cache.get("fragrance")
            if not category:
                skipped += 1
                continue

            # ── Brand ─────────────────────────────────────────────
            brand_raw  = (item.get("brand") or "Unknown").strip()
            brand_slug = slugify(brand_raw)
            if brand_slug not in brand_cache:
                brand = Brand(
                    name=brand_raw,
                    slug=brand_slug,
                    description=f"Luxury fragrance house",
                    country="France",
                )
                db.session.add(brand)
                db.session.flush()
                brand_cache[brand_slug] = brand
            brand = brand_cache[brand_slug]

            # ── Price ─────────────────────────────────────────────
            price = price_for_brand(brand_raw)

            # ── Slug ──────────────────────────────────────────────
            base_slug = slugify(name)[:90]
            slug = base_slug
            n = 2
            while slug in used_slugs:
                slug = f"{base_slug}-{n}"
                n += 1
            used_slugs.add(slug)

            # ── SKU ───────────────────────────────────────────────
            api_id = str(item.get("id", ""))
            sku = f"PFUM-{api_id[:8]}" if api_id else f"PFUM-{slugify(name)[:16]}"
            if sku in used_skus:
                # Deduplicate SKU collisions
                sku = f"PFUM-{api_id[:12]}" if api_id else f"PFUM-{slug[:16]}"
            used_skus.add(sku)

            # ── Description ───────────────────────────────────────
            description  = (item.get("description") or name).strip()
            short_desc   = description[:160].rsplit(" ", 1)[0] + "…" \
                           if len(description) > 160 else description

            # ── Notes summary for tags ────────────────────────────
            all_notes = (
                (item.get("notes_top")    or []) +
                (item.get("notes_middle") or []) +
                (item.get("notes_base")   or [])
            )
            tags = [gender.lower(), "fragrance"]
            if item.get("release_year"):
                tags.append(str(item["release_year"]))

            # ── Rating ────────────────────────────────────────────
            try:
                api_rating = round(float(item["rating"]), 1) if item.get("rating") else None
            except (ValueError, TypeError):
                api_rating = None

            # ── Meta (rich fragrance data) ────────────────────────
            meta = {}
            if api_rating:
                meta["api_rating"] = api_rating
            if item.get("votes"):
                meta["votes"] = item["votes"]
            if item.get("longevity"):
                meta["longevity"] = item["longevity"]
            if item.get("sillage"):
                meta["sillage"] = item["sillage"]
            if item.get("release_year"):
                meta["release_year"] = item["release_year"]
            if item.get("notes_top"):
                meta["notes_top"] = item["notes_top"]
            if item.get("notes_middle"):
                meta["notes_middle"] = item["notes_middle"]
            if item.get("notes_base"):
                meta["notes_base"] = item["notes_base"]
            if item.get("perfume_url"):
                meta["perfume_url"] = item["perfume_url"]
            if gender:
                meta["gender"] = gender

            # ── Compare-at price (optional sale) ──────────────────
            compare = round(price * random.choice([1.0, 1.0, 1.15, 1.20]), 2) \
                      if random.random() < 0.25 else None

            # ── Product ───────────────────────────────────────────
            product = Product(
                brand_id      = brand.id,
                category_id   = category.id,
                name          = name,
                slug          = slug,
                description   = description,
                short_description = short_desc,
                price         = price,
                compare_at_price = compare,
                sku           = sku,
                stock_quantity= 30,
                is_active     = True,
                is_featured   = (api_rating or 0) >= 4.3,
                tags          = tags,
                meta          = meta,
            )
            db.session.add(product)
            db.session.flush()

            # ── Primary image ─────────────────────────────────────
            db.session.add(ProductImage(
                product_id = product.id,
                url        = image_url,
                alt_text   = name,
                is_primary = True,
                sort_order = 1,
            ))

            # ── No shade variants for fragrances ──────────────────
            # (size variants could be added here if the API had them)

            added += 1

        db.session.commit()
        print(f"\nAdded  : {added}")
        print(f"Skipped: {skipped}")
        print(f"Total DB: {Product.query.count()} products")


if __name__ == "__main__":
    run()
