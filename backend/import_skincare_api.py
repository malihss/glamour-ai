"""
import_skincare_api.py — Import ~1,700 skincare products from LauraAddams/skincareAPI
GitHub seed CSVs into the DB.

CSV columns: brand, product_name, ingredient1, ingredient2, ...
(ingredients are NOT quoted — everything after col 2 is one ingredient each)

Run from the backend directory:
    ./venv/bin/python import_skincare_api.py
"""

import sys, re, random, base64, requests
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from extensions import db
from models import Category, Brand, Product, ProductVariant, ProductImage

# ── CSV sources ──────────────────────────────────────────────────────────────
GITHUB_API = "https://api.github.com/repos/LauraAddams/skincareAPI/contents/db/seed_data/{}.csv"
CSV_FILES  = ["Prod1", "Prod2", "AB1", "AB2", "red1"]

# ── Product-type inference: keyword → category slug ──────────────────────────
TYPE_MAP = [
    (["cleanser","cleansing","foaming","foam","face wash","micellar",
      "cleanse","cleansing oil","cleansing balm"],        "cleansers"),
    (["serum","ampoule","booster","essence","concentrate",
      "treatment","acid","peeling","retinol","vitamin c",
      "niacinamide","exfoliant","exfoliating"],           "serums"),
    (["eye cream","eye gel","eye serum","eye balm",
      "eye concentrate","eye contour","eye lift",
      "eye treatment","under eye","undereye"],            "eye-care"),
    (["sunscreen","spf","sun screen","sun block","sun protection",
      "uv","pa+","broad spectrum"],                       "spf"),
    (["toner","mist","spray","essence toner",
      "lotion toner","skin toner","softener"],            "serums"),   # map toners→serums
    (["mask","masque","sheet mask","sleeping mask",
      "sleeping pack","overnight","night mask"],          "serums"),   # masks→serums
    (["moistur","cream","lotion","emulsion","gel cream",
      "day cream","night cream","hydrating","hydration",
      "oil","face oil","dry oil","balm"],                 "moisturizers"),
]

# ── Unsplash images by category ───────────────────────────────────────────────
CATEGORY_IMAGES = {
    "cleansers":     [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&q=90",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=90",
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=700&q=90",
    ],
    "serums":        [
        "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&q=90",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=90",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=90",
    ],
    "moisturizers":  [
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=90",
        "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=700&q=90",
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=700&q=90",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90",
    ],
    "eye-care":      [
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=90",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90",
    ],
    "spf":           [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=90",
        "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&q=90",
    ],
}
DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=90",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=90",
]

# ── Brand pricing (USD): (min, max) ─────────────────────────────────────────
BRAND_PRICING = {
    # Ultra-luxury
    "la mer":           (90, 380), "la prairie":      (120, 500),
    "sisley":           (80, 320), "augustinus bader": (90, 280),
    "cle de peau":      (80, 350), "sk-ii":            (60, 280),
    # Luxury
    "estee lauder":     (45, 180), "lancome":          (45, 160),
    "clinique":         (25, 110), "shiseido":         (30, 150),
    "tatcha":           (30, 150), "drunk elephant":   (30, 140),
    "sunday riley":     (35, 160), "kiehl's":          (25, 100),
    "origins":          (20,  90), "fresh":            (25, 120),
    "dior":             (60, 200), "chanel":           (60, 220),
    "tom ford":         (80, 250), "ysl":              (55, 180),
    "murad":            (30, 110), "peter thomas roth": (25, 100),
    "mario badescu":    (10,  45), "philosophy":       (15,  60),
    # Niche / indie
    "paula's choice":   (20,  80), "the inkey list":   (10,  30),
    "byoma":            (10,  25), "glow recipe":      (25,  80),
    "farmacy":          (25,  90), "olehenriksen":     (25,  85),
    # K-Beauty
    "cosrx":            (12,  45), "some by mi":       (12,  40),
    "innisfree":        (10,  40), "laneige":          (18,  70),
    "etude house":       (8,  35), "missha":           (10,  40),
    "tosowoong":        (10,  35), "klairs":           (15,  50),
    "benton":           (12,  45), "the face shop":    (10,  40),
    "snp":              (10,  35), "mizon":            (10,  40),
    "its skin":         (10,  35), "skin food":        (10,  40),
    "tony moly":        (10,  35), "holika holika":    (10,  35),
    "nature republic": (10,  35),  "erborian":         (20,  80),
    "amorepacific":     (40, 200), "sulwhasoo":        (50, 250),
    "hera":             (35, 150), "iope":             (30, 120),
    # J-Beauty
    "hada labo":        (12,  40), "dhc":              (10,  45),
    "kose":             (20,  80), "fancl":            (15,  70),
    "canmake":          (10,  35), "bioderma":         (12,  50),
    # Affordable / drugstore
    "cerave":           (12,  30), "neutrogena":       (10,  35),
    "the ordinary":     (5,   30), "olay":             (15,  55),
    "l'oreal":          (15,  50), "garnier":          (10,  35),
    "vichy":            (20,  65), "la roche-posay":   (18,  65),
    "eucerin":          (12,  40), "avene":            (18,  60),
    "nip + fab":        (10,  35), "ren":              (20,  80),
}
DEFAULT_PRICE_RANGE = (15, 65)


def slugify(text: str) -> str:
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")


def infer_category(name: str) -> str:
    low = name.lower()
    for keywords, slug in TYPE_MAP:
        if any(kw in low for kw in keywords):
            return slug
    return "moisturizers"   # safe default for skincare


def price_for_brand(brand: str) -> float:
    key = brand.lower().strip()
    lo, hi = DEFAULT_PRICE_RANGE
    for k, v in BRAND_PRICING.items():
        if k in key or key in k:
            lo, hi = v
            break
    return round(random.uniform(lo, hi) / 5) * 5


def pick_image(cat_slug: str, seed: int) -> str:
    imgs = CATEGORY_IMAGES.get(cat_slug, DEFAULT_IMAGES)
    return imgs[seed % len(imgs)]


def fetch_csv(filename: str) -> list[dict]:
    """Download CSV via GitHub API and return list of {brand, name, ingredients}."""
    url = GITHUB_API.format(filename)
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        data    = r.json()
        content = base64.b64decode(data["content"]).decode("utf-8", "replace")
    except Exception as e:
        print(f"  [warn] Could not fetch {filename}: {e}")
        return []

    rows = []
    for i, line in enumerate(content.strip().split("\n")):
        if i == 0:
            continue   # skip header
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 2:
            continue
        brand       = parts[0].strip()
        product_name = parts[1].strip()
        ingredients = [p.strip() for p in parts[2:] if p.strip()]
        if brand and product_name:
            rows.append({
                "brand":       brand,
                "name":        product_name,
                "ingredients": ingredients,
                "source":      filename,
            })
    return rows


def run():
    # Fetch all CSV data
    all_products: list[dict] = []
    for fname in CSV_FILES:
        print(f"Downloading {fname}.csv …", end=" ", flush=True)
        rows = fetch_csv(fname)
        print(f"{len(rows)} rows")
        all_products.extend(rows)

    print(f"\nTotal rows fetched: {len(all_products)}")

    app = create_app()
    with app.app_context():
        cat_cache:   dict[str, Category] = {c.slug: c for c in Category.query.all()}
        brand_cache: dict[str, Brand]    = {b.slug: b for b in Brand.query.all()}
        used_slugs:  set[str]            = {p.slug for p in Product.query.all()}
        used_skus:   set[str]            = {p.sku  for p in Product.query.all() if p.sku}

        added = skipped = dupes = 0

        for idx, item in enumerate(all_products):
            name      = item["name"].strip()
            brand_raw = item["brand"].strip()
            if not name or not brand_raw:
                skipped += 1
                continue

            # ── Category ──────────────────────────────────────────
            cat_slug = infer_category(name)
            category = cat_cache.get(cat_slug)
            if not category:
                category = cat_cache.get("moisturizers")
            if not category:
                skipped += 1
                continue

            # ── Brand ─────────────────────────────────────────────
            brand_slug = slugify(brand_raw)
            if brand_slug not in brand_cache:
                brand = Brand(
                    name        = brand_raw,
                    slug        = brand_slug,
                    description = f"{brand_raw} skincare",
                    country     = "South Korea" if item["source"].startswith("AB") else "USA",
                )
                db.session.add(brand)
                db.session.flush()
                brand_cache[brand_slug] = brand
            brand = brand_cache[brand_slug]

            # ── Slug ──────────────────────────────────────────────
            base_slug = slugify(f"{brand_raw}-{name}")[:90]
            slug      = base_slug
            n         = 2
            while slug in used_slugs:
                slug = f"{base_slug}-{n}"
                n   += 1
            used_slugs.add(slug)

            # ── SKU ───────────────────────────────────────────────
            sku_base = f"SKN-{slugify(brand_raw)[:8]}-{slugify(name)[:12]}"
            sku      = sku_base[:50]
            if sku in used_skus:
                sku = f"{sku_base[:46]}-{idx}"[:50]
            used_skus.add(sku)

            # ── Price ─────────────────────────────────────────────
            price    = price_for_brand(brand_raw)
            compare  = round(price * 1.15, 2) if random.random() < 0.2 else None

            # ── Description ───────────────────────────────────────
            key_ingredients = item["ingredients"][:5]
            if key_ingredients:
                ing_str     = ", ".join(key_ingredients[:3])
                description = (f"{name} by {brand_raw}. "
                               f"Key ingredients: {ing_str}.")
            else:
                description = f"{name} by {brand_raw}."
            short_desc = description[:160]

            # ── Tags ──────────────────────────────────────────────
            tags = ["skincare", cat_slug.replace("-", " ")]
            if item["source"].startswith("AB"):
                tags.append("k-beauty")
            # Tag key active ingredients
            ing_low = " ".join(item["ingredients"]).lower()
            for active in ["retinol","vitamin c","niacinamide","hyaluronic acid",
                           "aha","bha","glycolic","salicylic","peptide","collagen",
                           "centella","snail","ceramide","squalane"]:
                if active in ing_low:
                    tags.append(active)

            # ── Meta ──────────────────────────────────────────────
            meta: dict = {}
            if item["ingredients"]:
                meta["ingredients"] = item["ingredients"][:30]  # cap at 30 ingredients
            if item["source"].startswith("AB"):
                meta["origin"] = "k-beauty"

            # ── Image ─────────────────────────────────────────────
            image_url = pick_image(cat_slug, idx)

            # ── Product ───────────────────────────────────────────
            product = Product(
                brand_id          = brand.id,
                category_id       = category.id,
                name              = name,
                slug              = slug,
                description       = description,
                short_description = short_desc,
                price             = price,
                compare_at_price  = compare,
                sku               = sku,
                stock_quantity    = 40,
                is_active         = True,
                is_featured       = False,
                tags              = tags,
                meta              = meta,
            )
            db.session.add(product)
            db.session.flush()

            db.session.add(ProductImage(
                product_id = product.id,
                url        = image_url,
                alt_text   = name,
                is_primary = True,
                sort_order = 1,
            ))

            added += 1

            # Commit in batches of 200
            if added % 200 == 0:
                db.session.commit()
                print(f"  … {added} committed")

        db.session.commit()
        print(f"\nAdded  : {added}")
        print(f"Skipped: {skipped}")
        print(f"\nFinal DB total: {Product.query.count()} products")

        # Summary by category
        from sqlalchemy import func
        from models import Category as Cat
        rows = (db.session.query(Cat.name, func.count(Product.id))
                .join(Product, Product.category_id == Cat.id)
                .filter(Product.sku.like("SKN-%"))
                .group_by(Cat.name)
                .order_by(func.count(Product.id).desc())
                .all())
        print("\nNew skincare products by category:")
        for cat_name, cnt in rows:
            print(f"  {cnt:4d}  {cat_name}")


if __name__ == "__main__":
    run()
