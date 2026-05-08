"""
import_tools_api.py — Import beauty tools & accessories into the DB.

Sources:
  - Curated catalog of professional brushes, sponges, devices, and accessories
  - Realistic brands, descriptions, and pricing

Adds products to the 'brushes' and 'devices' sub-categories under 'tools'.
Also ensures a 'sponges' and 'accessories' sub-category exist.

Run from the backend directory:
    ./venv/bin/python import_tools_api.py
"""

import sys, re, random
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from extensions import db
from models import Category, Brand, Product, ProductImage

# ── Unsplash images by sub-category ─────────────────────────────────────────
IMAGES = {
    "brushes": [
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=90",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90",
        "https://images.unsplash.com/photo-1562887189-8308b5a3d0ed?w=700&q=90",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=90",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=700&q=90",
    ],
    "sponges": [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=90",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90",
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=90",
    ],
    "devices": [
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=700&q=90",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=90",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=90",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&q=90",
    ],
    "accessories": [
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=90",
        "https://images.unsplash.com/photo-1562887189-8308b5a3d0ed?w=700&q=90",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90",
    ],
}

# ── Curated tool catalog ──────────────────────────────────────────────────────
# Each entry: (brand_slug, brand_name, brand_country, cat_slug, name, sku, price, compare, featured, tags, description, short_desc)

TOOLS_CATALOG = [

    # ── BRUSHES ──────────────────────────────────────────────────────────────

    ("sigma-beauty", "Sigma Beauty", "USA", "brushes",
     "F80 Flat Kabuki Brush", "SIG-B-001", 24.00, None, True,
     ["brushes", "kabuki", "foundation", "professional"],
     "The Sigma F80 is the gold standard for liquid and cream foundation application. Its dense, flat-topped fibres buffer product seamlessly into skin, achieving an airbrushed, medium-to-full coverage finish with minimal product waste.",
     "Dense flat-top kabuki for flawless liquid foundation"),

    ("sigma-beauty", "Sigma Beauty", "USA", "brushes",
     "E25 Blending Brush", "SIG-B-002", 18.00, None, False,
     ["brushes", "eyeshadow", "blending", "professional"],
     "The E25 is Sigma's best-selling eye blending brush. The tapered, dome-shaped head of ultra-soft fibres diffuses eyeshadow effortlessly, creating seamless transitions and a professional smoke effect.",
     "Dome-shaped brush for seamless eyeshadow blending"),

    ("sigma-beauty", "Sigma Beauty", "USA", "brushes",
     "Complete Eye Brush Set (12-Piece)", "SIG-B-003", 119.00, 149.00, True,
     ["brushes", "eye", "set", "professional", "gift"],
     "A comprehensive 12-piece eye brush set with everything needed for any eye look — from precise liner to diffused smoke. Each brush is handcrafted with SigmaTech fibres for superior softness, pick-up and blend-out.",
     "12-piece pro eye set — liner, blend, shade & more"),

    ("real-techniques", "Real Techniques", "USA", "brushes",
     "Miracle Complexion Sponge", "RT-B-001", 12.00, None, False,
     ["sponge", "blending", "foundation", "affordable"],
     "The Real Techniques Miracle Complexion Sponge features a flat edge for blending in hard-to-reach areas and a rounded bottom for full-face blending. Lightly dampen for a flawless, streak-free foundation finish.",
     "Dual-edge sponge for streak-free foundation"),

    ("real-techniques", "Real Techniques", "USA", "brushes",
     "Core Collection 5-Piece Brush Set", "RT-B-002", 29.00, 36.00, True,
     ["brushes", "set", "face", "affordable", "bestseller"],
     "The Core Collection is Real Techniques' best-selling brush set, containing five essential face brushes: a pointed foundation brush, contour brush, stipple brush, buffing brush and setting brush. Ultra-soft synthetic fibres and ergonomic aluminium ferrules.",
     "5-piece essential face brush set — the ultimate starter"),

    ("real-techniques", "Real Techniques", "USA", "brushes",
     "Eye Shading Brush", "RT-B-003", 9.00, None, False,
     ["brushes", "eyeshadow", "shading", "affordable"],
     "The Real Techniques Eye Shading Brush has a compact, flat head that picks up and packs eyeshadow onto the lid precisely and evenly. The synthetic fibres ensure vivid colour payoff with no shedding.",
     "Flat-head brush for precise, vivid lid colour"),

    ("zoeva", "ZOEVA", "Germany", "brushes",
     "Luxe Soft Definer Brush 317", "ZV-B-001", 19.00, None, False,
     ["brushes", "eyeshadow", "defining", "luxury"],
     "ZOEVA's Luxe Soft Definer 317 is an angled brush with a slightly domed shape, perfect for defining and diffusing eyeshadow in the crease and outer corner. Extraordinarily soft natural and synthetic blend fibres.",
     "Angled definer for precise crease and outer-corner work"),

    ("zoeva", "ZOEVA", "Germany", "brushes",
     "Luxe Complete Eye Set (8-Piece)", "ZV-B-002", 99.00, 125.00, True,
     ["brushes", "eye", "set", "luxury", "gift"],
     "ZOEVA's Luxe Complete Eye Set brings eight essential eye brushes together in a premium roll-up brush case. From fluffy blending brushes to fine liner brushes, each tool is crafted with hand-bound fibres for impeccable performance.",
     "8-piece luxury eye set with premium roll-up case"),

    ("it-cosmetics", "IT Cosmetics", "USA", "brushes",
     "Heavenly Luxe Wand Ball Powder Brush", "ITC-B-001", 48.00, None, True,
     ["brushes", "powder", "face", "luxury", "complexion"],
     "IT Cosmetics' Heavenly Luxe Wand Ball Brush features 30,000 luxe synthetic bristles that feel like cashmere on skin. The extra-large, rounded ball head applies, blends and buffs powder, contour and bronzer with unparalleled softness.",
     "30,000 ultra-soft bristles for luxurious powder application"),

    ("it-cosmetics", "IT Cosmetics", "USA", "brushes",
     "Heavenly Luxe Flat Top Buffing Foundation Brush", "ITC-B-002", 52.00, None, False,
     ["brushes", "foundation", "buffing", "luxury"],
     "The flat-top buffing brush applies liquid and cream foundation with a seamless, second-skin finish. IT Cosmetics' proprietary ultra-luxe synthetic bristles mimic the softness of high-end natural hair without any shedding.",
     "Ultra-luxe flat-top brush for second-skin foundation"),

    ("morphe", "Morphe", "USA", "brushes",
     "Y12 Define & Blend Brush", "MRP-B-001", 14.00, None, False,
     ["brushes", "eyeshadow", "blending", "crease"],
     "The Morphe Y12 is a tapered pencil brush with a pointed tip ideal for precise shadow application in the crease and inner corner. The densely packed, soft synthetic fibres ensure effortless blending.",
     "Tapered pencil brush for precise crease blending"),

    ("morphe", "Morphe", "USA", "brushes",
     "Master Class 12-Piece Deluxe Brush Collection", "MRP-B-002", 59.00, 80.00, True,
     ["brushes", "set", "pro", "complete", "bestseller"],
     "Morphe's Master Class Collection brings together 12 professionally designed brushes for face and eyes — everything from a large powder brush to a precise liner brush. Premium vegan synthetic fibres with rose-gold ferrules.",
     "12-piece pro brush set — face & eyes, rose-gold ferrules"),

    ("elf-cosmetics", "e.l.f. Cosmetics", "USA", "brushes",
     "Stipple Brush", "ELF-B-001", 10.00, None, False,
     ["brushes", "stipple", "foundation", "affordable"],
     "e.l.f.'s Stipple Brush features a duo-fibre head that picks up just the right amount of foundation or blush, stippling it into skin for a natural, airbrushed finish. Perfect for layering sheer products.",
     "Duo-fibre stipple for a natural airbrushed base"),

    ("elf-cosmetics", "e.l.f. Cosmetics", "USA", "brushes",
     "Total Face Brush", "ELF-B-002", 9.00, None, False,
     ["brushes", "powder", "face", "affordable"],
     "The e.l.f. Total Face Brush has a large, rounded head for applying and blending powder, bronzer and blush across the entire face. Lightweight with tapered, ultra-soft fibres.",
     "Large rounded brush for quick all-over powder blending"),

    ("mac", "MAC", "Canada", "brushes",
     "#168 Large Fan Brush", "MAC-B-001", 38.00, None, False,
     ["brushes", "fan", "highlighter", "face", "professional"],
     "MAC's #168 Large Fan Brush is a multi-tasking staple used by professional makeup artists worldwide. The fan-shaped head sweeps on highlighter or blush and removes excess powder for a polished finish.",
     "Fan-shaped brush for highlight and excess powder removal"),

    ("mac", "MAC", "Canada", "brushes",
     "#217S Blending Brush", "MAC-B-002", 38.00, None, True,
     ["brushes", "blending", "eye", "professional", "iconic"],
     "The iconic MAC #217S is the world's best-selling eye blending brush, used by makeup artists on every major runway and red carpet. The fluffy, tapered shape blends eyeshadow seamlessly in the crease for a professional finish.",
     "The iconic MAC eye blending brush — used on every runway"),

    ("artis", "Artis", "USA", "brushes",
     "Elite Mirror Oval 7 Brush", "ART-B-001", 46.00, None, False,
     ["brushes", "oval", "foundation", "luxury", "innovative"],
     "The Artis Oval 7 features an innovative oval head with thousands of ultra-fine fibres that apply, buff and blend liquid or cream foundation with minimal effort. The mirrored handle reflects its luxury positioning.",
     "Innovative oval brush for effortless foundation blending"),

    ("artis", "Artis", "USA", "brushes",
     "Elite Mirror 5 Brush Set", "ART-B-002", 175.00, 220.00, True,
     ["brushes", "set", "luxury", "oval", "gift"],
     "The Artis Elite Mirror 5-piece set brings together the brand's most coveted oval brushes — from a concealer brush to a full foundation brush. Housed in a luxe mirror-finish stand, it's the ultimate vanity statement.",
     "5-piece oval brush set in mirrored stand — vanity statement"),

    ("bobbi-brown", "Bobbi Brown", "USA", "brushes",
     "Eye Blending Brush", "BB-B-001", 40.00, None, False,
     ["brushes", "eye", "blending", "luxury"],
     "Bobbi Brown's Eye Blending Brush has a large, fluffy dome head ideal for sweeping eyeshadow across the lid and diffusing colour in the crease. Its professional-grade fibres provide seamless blending for a polished finish.",
     "Large dome brush for seamless lid-to-crease shadow"),

    # ── SPONGES & APPLICATORS ─────────────────────────────────────────────────

    ("beautyblender", "Beautyblender", "USA", "sponges",
     "Original Beautyblender", "BB-S-001", 22.00, None, True,
     ["sponge", "blending", "foundation", "iconic", "bestseller"],
     "The original Beautyblender revolutionised foundation application. Dampen this iconic egg-shaped sponge and bounce it across skin for a streak-free, airbrushed finish with zero excess product. Works with liquid, cream and powder.",
     "The original egg-shaped sponge for airbrushed makeup"),

    ("beautyblender", "Beautyblender", "USA", "sponges",
     "Beautyblender Pro (Black)", "BB-S-002", 22.00, None, False,
     ["sponge", "blending", "professional", "black"],
     "The Beautyblender Pro in Velvety Black delivers the same flawless finish as the original but is designed to hide product staining for professionals who work with bold colours and dark foundations.",
     "Pro version for professionals working with bold colours"),

    ("beautyblender", "Beautyblender", "USA", "sponges",
     "Micro.Mini Beautyblender 2-Pack", "BB-S-003", 16.00, None, False,
     ["sponge", "mini", "concealer", "precision"],
     "The Micro.Mini is Beautyblender's smallest sponge — designed for precise concealer application under the eye, around the nose and on blemishes. The two-pack includes one blush pink and one cool purple micro sponge.",
     "Tiny precision sponge for concealer and under-eye application"),

    ("real-techniques", "Real Techniques", "USA", "sponges",
     "Miracle Powder Sponge", "RT-S-001", 12.00, None, False,
     ["sponge", "powder", "setting", "reusable"],
     "Real Techniques' Miracle Powder Sponge features a unique dome shape that applies and blends loose and pressed powder with a natural, no-cake finish. The porous surface picks up the ideal amount of powder in every use.",
     "Dome-shaped sponge for seamless powder application"),

    ("fenty-beauty", "Fenty Beauty", "USA", "sponges",
     "Precision Makeup Sponge", "FB-S-001", 26.00, None, False,
     ["sponge", "precision", "contour", "foundation"],
     "Fenty Beauty's Precision Makeup Sponge has a pointed tip that precisely applies and blends contour, concealer and foundation in targeted areas. Vegan-friendly and easy to clean.",
     "Pointed tip sponge for precise contour and concealer"),

    ("elf-cosmetics", "e.l.f. Cosmetics", "USA", "sponges",
     "Total Face Sponge", "ELF-S-001", 8.00, None, False,
     ["sponge", "blending", "foundation", "affordable"],
     "e.l.f.'s Total Face Sponge delivers a smooth, seamless finish when slightly dampened. Its teardrop shape blends foundation naturally while the flat edge covers larger areas. One of the best affordable sponges on the market.",
     "Affordable teardrop sponge for a smooth, seamless base"),

    # ── DEVICES ──────────────────────────────────────────────────────────────

    ("foreo", "FOREO", "Sweden", "devices",
     "LUNA 4 Facial Cleansing Device", "FRO-D-001", 199.00, 249.00, True,
     ["device", "cleansing", "sonic", "silicone", "smart"],
     "FOREO's LUNA 4 uses T-Sonic pulsations to remove 99.5% of dirt, oil and makeup residue in 60 seconds. The ultra-hygienic silicone never harbours bacteria and is 35x more hygienic than traditional cleansing brushes. App-connected for personalised routines.",
     "Smart sonic cleansing device — 99.5% bacteria-free silicone"),

    ("foreo", "FOREO", "Sweden", "devices",
     "BEAR Mini Facial Toning Device", "FRO-D-002", 179.00, 219.00, True,
     ["device", "toning", "microcurrent", "anti-aging", "smart"],
     "FOREO BEAR Mini delivers FDA-cleared microcurrent technology to firm, lift and tone facial muscles. The 5 microcurrent intensities mimic the effects of 10,000+ facial exercises in just 2 minutes. Anti-shock system for safe daily use.",
     "FDA-cleared microcurrent device — lifts and tones in 2 minutes"),

    ("foreo", "FOREO", "Sweden", "devices",
     "UFO 3 Smart Face Mask Device", "FRO-D-003", 279.00, None, False,
     ["device", "mask", "led", "sonic", "smart"],
     ["FOREO UFO 3 combines full-spectrum LED light therapy, T-Sonic pulsations and cryotherapy to activate sheet masks in just 2 minutes — delivering 8x better absorption of mask actives. Syncs with the FOREO app for personalised treatments.",
     "Smart mask device — 8x better absorption in 2 minutes"][1],
     "Smart mask device — 8x better absorption in 2 minutes"),

    ("nuface", "NuFACE", "USA", "devices",
     "Trinity Facial Toning Device", "NUF-D-001", 339.00, None, True,
     ["device", "microcurrent", "toning", "anti-aging", "fda-cleared"],
     "NuFACE Trinity is the #1 microcurrent device recommended by dermatologists. FDA-cleared to improve facial contour, tone and reduce wrinkles in as little as 5 minutes a day. Interchangeable attachment heads address specific concerns from lifting to eye treatment.",
     "#1 derm-recommended microcurrent device — 5 min/day"),

    ("nuface", "NuFACE", "USA", "devices",
     "FIX Line Smoothing Device", "NUF-D-002", 129.00, 159.00, False,
     ["device", "microcurrent", "fine-lines", "targeted"],
     "The NuFACE FIX targets fine lines and wrinkles in specific areas like crow's feet, lip lines and forehead furrows. The precision, pen-shaped microcurrent device delivers concentrated energy for visible smoothing in just 3-minute daily sessions.",
     "Targeted microcurrent pen for fine lines and wrinkles"),

    ("pmd-beauty", "PMD Beauty", "USA", "devices",
     "Personal Microderm Elite Pro", "PMD-D-001", 189.00, 229.00, True,
     ["device", "microderm", "exfoliation", "anti-aging", "clinical"],
     "PMD Beauty's Personal Microderm Elite Pro brings clinical-grade microdermabrasion home. The spinning disc removes dead skin cells and unclogs pores while the suction activates collagen production — revealing smoother, brighter skin in just one treatment.",
     "Clinical-grade at-home microdermabrasion — visible in one use"),

    ("pmd-beauty", "PMD Beauty", "USA", "devices",
     "Clean Smart Facial Cleansing Device", "PMD-D-002", 79.00, None, False,
     ["device", "cleansing", "sonic", "vibration"],
     "PMD Clean uses SonicGlow technology — 7,000 vibrations per minute — to deeply cleanse, tone and massage skin. The soft silicone brush side cleans while the smooth back side massages facial muscles for improved circulation.",
     "SonicGlow cleansing device — 7,000 vibrations per minute"),

    ("dr-dennis-gross", "Dr. Dennis Gross Skincare", "USA", "devices",
     "DRx SpectraLite FaceWare Pro", "DDG-D-001", 455.00, None, True,
     ["device", "led", "light-therapy", "anti-aging", "acne", "clinical"],
     "The DRx SpectraLite FaceWare Pro is the most powerful at-home LED device on the market. FDA-cleared with 162 red + blue LEDs, it targets wrinkles and acne simultaneously in just 3 minutes. Clinical studies show 80% improvement in wrinkles after 12 weeks.",
     "FDA-cleared LED mask — 162 LEDs target wrinkles and acne"),

    ("currentbody", "CurrentBody Skin", "UK", "devices",
     "LED Light Therapy Mask", "CB-D-001", 380.00, 450.00, True,
     ["device", "led", "light-therapy", "anti-aging", "flexible"],
     "CurrentBody Skin's LED mask uses flexible, medical-grade LEDs to target fine lines, wrinkles and pigmentation. The flexible silicone mask conforms to all face shapes for optimal light delivery, combining 633nm red and 830nm near-infrared wavelengths.",
     "Medical-grade flexible LED mask — red + near-infrared therapy"),

    ("gua-sha-co", "Gua Sha Co.", "USA", "devices",
     "Jade Gua Sha Facial Lifting Stone", "GSC-D-001", 28.00, None, False,
     ["device", "gua sha", "jade", "lymphatic", "manual"],
     "Crafted from genuine Grade-A jade, this traditional Chinese gua sha tool promotes lymphatic drainage, reduces puffiness and improves skin elasticity through facial massage. Use with facial oil for a lifting, sculpting routine that relieves tension.",
     "Grade-A jade gua sha — lymphatic drainage and facial lifting"),

    ("gua-sha-co", "Gua Sha Co.", "USA", "devices",
     "Rose Quartz Roller", "GSC-D-002", 24.00, None, False,
     ["device", "roller", "rose quartz", "lymphatic", "depuff"],
     "The Rose Quartz Roller reduces puffiness and promotes lymphatic drainage with a dual-ended roller — large for cheeks and forehead, small for under-eye and jawline. Cool the stone in the fridge for an even more refreshing morning ritual.",
     "Rose quartz roller — dual-ended depuff and glow ritual"),

    ("foreo", "FOREO", "Sweden", "devices",
     "PEACH 2 IPL Hair Removal Device", "FRO-D-004", 499.00, 599.00, False,
     ["device", "ipl", "hair removal", "professional", "long-lasting"],
     "FOREO PEACH 2 delivers app-controlled IPL hair removal with glide mode for large body areas and precise mode for sensitive zones. The Intense Pulse Light permanently reduces hair in as few as 3 sessions with UV-filter safety technology.",
     "Smart IPL hair removal — permanent reduction in 3 sessions"),

    ("michael-todd-beauty", "Michael Todd Beauty", "USA", "devices",
     "Sonicsmooth 5-in-1 Dermaplaning System", "MTB-D-001", 99.00, 129.00, True,
     ["device", "dermaplaning", "exfoliation", "peach-fuzz", "brightening"],
     "The Sonicsmooth uses sonic vibrations to safely remove peach fuzz and dead skin cells via dermaplaning — revealing instantly smoother, brighter skin and enabling deeper product penetration. Includes 4 replacement blades and nourishing serum.",
     "Sonic dermaplaning — removes peach fuzz for instant glow"),

    ("tria-beauty", "Tria Beauty", "USA", "devices",
     "Age-Defying Laser", "TRI-D-001", 449.00, None, False,
     ["device", "laser", "anti-aging", "clinical", "fractional"],
     "The Tria Age-Defying Laser is the first FDA-cleared, at-home fractional laser. It reduces the appearance of fine lines, wrinkles and sun damage with the same diode laser technology used by dermatologists — delivering clinical results from your own home.",
     "First FDA-cleared at-home fractional laser device"),

    # ── ACCESSORIES ──────────────────────────────────────────────────────────

    ("tweezerman", "Tweezerman", "USA", "accessories",
     "Slant Tweezer", "TWZ-A-001", 30.00, None, True,
     ["accessories", "tweezers", "brows", "precision", "bestseller"],
     "The Tweezerman Slant Tweezer is the beauty industry's gold standard in brow grooming. Hand-filed to a calibrated precision, the slanted tip grips even the finest hairs effortlessly. Backed by a lifetime guarantee — send them back any time for a free resharpening.",
     "Gold-standard slant tweezer with lifetime guarantee"),

    ("tweezerman", "Tweezerman", "USA", "accessories",
     "Brow Shaping Scissors & Brush", "TWZ-A-002", 22.00, None, False,
     ["accessories", "brows", "scissors", "trimming", "grooming"],
     "Tweezerman's Brow Shaping Scissors feature a micro-serrated blade that trims long brow hairs with precision control. The attached spoolie brush combs hairs into place before and after trimming for perfectly groomed brows.",
     "Micro-serrated scissors and spoolie for groomed brows"),

    ("japonesque", "Japonesque", "USA", "accessories",
     "Pro Performance Eyelash Curler", "JPN-A-001", 24.00, None, True,
     ["accessories", "lash curler", "eye", "professional"],
     "Japonesque's Pro Performance Eyelash Curler is engineered with a Japanese-quality curved bar that perfectly cradles the lash line for a uniform curl from corner to corner. The ergonomic spring mechanism prevents pinching for comfortable, precise curling.",
     "Japanese-engineered curler — uniform curl with no pinching"),

    ("shiseido", "Shiseido", "Japan", "accessories",
     "Eyelash Curler", "SHS-A-001", 24.00, None, False,
     ["accessories", "lash curler", "eye", "professional", "japanese"],
     "The Shiseido Eyelash Curler has been a professional makeup artist staple since 1933. Its unique curved design fits all eye shapes, and the extra-thick silicone pad prevents breakage while delivering a long-lasting, dramatic curl.",
     "Cult Japanese lash curler — fits all eye shapes since 1933"),

    ("ecotools", "EcoTools", "USA", "accessories",
     "Facial Cleansing Pad Set", "ECO-A-001", 16.00, None, False,
     ["accessories", "cleansing", "reusable", "eco-friendly", "pads"],
     "EcoTools' reusable facial cleansing pads replace single-use cotton rounds. Made from ultra-soft bamboo fibres, these 5 washable pads remove makeup and apply toner gently without irritating sensitive skin. Machine washable and built to last 1,000+ uses.",
     "Reusable bamboo pads — replaces 1,000+ cotton rounds"),

    ("charlotte-tilbury", "Charlotte Tilbury", "UK", "accessories",
     "Powder & Sculpt Brush Duo", "CT-A-001", 52.00, None, False,
     ["accessories", "brushes", "set", "luxury", "face"],
     "Charlotte Tilbury's Powder & Sculpt Brush Duo pairs two essential face brushes: a large, fluffy powder brush for all-over setting and a tapered contour brush for precise sculpting. Both feature CT's signature rose-gold ferrules and ergonomic handles.",
     "Rose-gold duo — fluffy powder brush + precision contour"),

    ("mac", "MAC", "Canada", "accessories",
     "Brush Cleanser", "MAC-A-001", 26.00, None, False,
     ["accessories", "brush care", "cleanser", "professional"],
     "MAC's Brush Cleanser quickly breaks down product build-up from all brush types without water. The fast-drying, conditioning formula maintains fibre shape and softness, making it the professional's go-to for quick between-colour cleaning.",
     "Fast-dry brush cleanser — maintains fibre shape and softness"),

    ("sigma-beauty", "Sigma Beauty", "USA", "accessories",
     "Dry'n Shape Tower", "SIG-A-001", 39.00, None, False,
     ["accessories", "brush care", "drying", "storage"],
     "The Sigma Dry'n Shape Tower dries and reshapes makeup brushes in the correct downward position to prevent water damage to the ferrule and handle. Holds up to 18 brushes simultaneously on collapsible arms.",
     "Brush drying tower — holds 18 brushes in correct position"),

    ("real-techniques", "Real Techniques", "USA", "accessories",
     "Brush Cleansing Palette", "RT-A-001", 14.00, None, False,
     ["accessories", "brush care", "cleaning", "mat"],
     "Real Techniques' Brush Cleansing Palette features textured ridges that work with any liquid cleanser to deep-clean brushes in seconds. The ergonomic silicone ring fits snugly around the hand for effortless scrubbing.",
     "Silicone scrubbing palette for deep-cleaning brushes"),

    ("tatcha", "Tatcha", "Japan", "accessories",
     "Washi Eye Patches (20 pairs)", "TAT-A-001", 60.00, None, True,
     ["accessories", "eye patches", "hydrating", "japanese", "de-puff"],
     "Tatcha's Washi Eye Patches are infused with Japanese Hadasei-3 actives to hydrate, smooth and de-puff the under-eye area in 20 minutes. The ultra-thin washi paper sticks perfectly to skin, delivering actives deep into the delicate eye area.",
     "Japanese washi eye patches — hydrate and de-puff in 20 min"),

    ("glow-recipe", "Glow Recipe", "USA", "accessories",
     "Watermelon Glow Niacinamide Pore Strips", "GR-A-001", 25.00, None, False,
     ["accessories", "pore strips", "cleansing", "niacinamide", "brightening"],
     "Glow Recipe's Watermelon Pore Strips are infused with niacinamide and hyaluronic acid to unclog pores while treating skin with brightening and hydrating actives — unlike traditional pore strips that just strip skin of moisture.",
     "Niacinamide-infused pore strips that brighten while they clear"),

    ("foreo", "FOREO", "Sweden", "accessories",
     "Luna Fofo Smart Skin Analyser", "FRO-A-001", 69.00, None, False,
     ["accessories", "skin analysis", "smart", "personalized"],
     "FOREO Luna Fofo is a smart skin analyser that measures your skin's moisture level in real time. Paired with the FOREO app, it delivers a personalised daily skincare routine based on your skin's current hydration status and environmental conditions.",
     "Smart skin analyser — personalised routine from real-time data"),

]

# ── Category slug aliases ────────────────────────────────────────────────────
# Some products map to 'sponges' or 'accessories' which may not yet exist
SUB_CAT_DEFS = {
    "sponges":      ("Sponges & Applicators", "Makeup sponges and applicators"),
    "accessories":  ("Accessories",           "Brushes care, tools and beauty accessories"),
}


def slugify(text: str) -> str:
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")


def ensure_sub_category(cat_cache: dict, parent_slug: str, slug: str, name: str, desc: str):
    """Create a sub-category under 'tools' if it doesn't already exist."""
    if slug in cat_cache:
        return cat_cache[slug]
    parent = cat_cache.get(parent_slug)
    if not parent:
        raise RuntimeError(f"Parent category '{parent_slug}' not found in DB.")
    cat = Category(
        name=name,
        slug=slug,
        description=desc,
        parent_id=parent.id,
    )
    db.session.add(cat)
    db.session.flush()
    cat_cache[slug] = cat
    print(f"  + Created sub-category: {name} ({slug})")
    return cat


def run():
    app = create_app()
    with app.app_context():
        cat_cache:   dict[str, Category] = {c.slug: c for c in Category.query.all()}
        brand_cache: dict[str, Brand]    = {b.slug: b for b in Brand.query.all()}
        used_slugs:  set[str]            = {p.slug for p in Product.query.all()}
        used_skus:   set[str]            = {p.sku  for p in Product.query.all() if p.sku}

        # Ensure extra sub-categories exist
        for slug, (name, desc) in SUB_CAT_DEFS.items():
            ensure_sub_category(cat_cache, "tools", slug, name, desc)

        db.session.commit()

        added = skipped = 0

        for row in TOOLS_CATALOG:
            (brand_slug, brand_name, brand_country,
             cat_slug, name, sku_base, price, compare,
             featured, tags, description, short_desc) = row

            # ── Category ──────────────────────────────────────────
            category = cat_cache.get(cat_slug)
            if not category:
                print(f"  [skip] Category '{cat_slug}' not found — {name}")
                skipped += 1
                continue

            # ── Brand ─────────────────────────────────────────────
            if brand_slug not in brand_cache:
                brand = Brand(
                    name=brand_name,
                    slug=brand_slug,
                    description=f"{brand_name} professional beauty tools",
                    country=brand_country,
                )
                db.session.add(brand)
                db.session.flush()
                brand_cache[brand_slug] = brand
            brand = brand_cache[brand_slug]

            # ── SKU dedup ─────────────────────────────────────────
            sku = sku_base
            if sku in used_skus:
                sku = f"{sku_base}-{random.randint(100, 999)}"
            used_skus.add(sku)

            # ── Slug dedup ────────────────────────────────────────
            base_slug = slugify(f"{brand_slug}-{name}")[:90]
            slug = base_slug
            n = 2
            while slug in used_slugs:
                slug = f"{base_slug}-{n}"
                n += 1
            used_slugs.add(slug)

            # ── Pick image ────────────────────────────────────────
            imgs = IMAGES.get(cat_slug, IMAGES["accessories"])
            image_url = imgs[added % len(imgs)]

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
                stock_quantity    = random.choice([25, 40, 50, 60, 75, 100]),
                is_active         = True,
                is_featured       = featured,
                tags              = tags,
                meta              = {"source": "tools_catalog"},
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

            if added % 20 == 0:
                db.session.commit()
                print(f"  … {added} committed")

        db.session.commit()

        print(f"\n{'='*45}")
        print(f"Tools added : {added}")
        print(f"Skipped     : {skipped}")
        print(f"Total in DB : {Product.query.count()}")

        # Summary by tools sub-category
        from sqlalchemy import func
        rows = (
            db.session.query(Category.name, func.count(Product.id))
            .join(Product, Product.category_id == Category.id)
            .filter(Product.meta["source"].astext == "tools_catalog")
            .group_by(Category.name)
            .order_by(func.count(Product.id).desc())
            .all()
        )
        print("\nNew tools products by sub-category:")
        for cat_name, cnt in rows:
            print(f"  {cnt:4d}  {cat_name}")


if __name__ == "__main__":
    run()
