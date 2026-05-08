-- ============================================================
-- Luxury Makeup & Skincare Products
-- Featured products for homepage tabs
-- ============================================================

-- ── LIP PRODUCTS ────────────────────────────────────────────
INSERT INTO products (id, name, slug, short_description, price, compare_at_price, category_id, brand_id, is_active, is_featured, sku)
VALUES
  (gen_random_uuid(), 'Matte Revolution Lipstick in Pillow Talk', 'ct-lip-pillow-talk',
   'The cult nude-pink lipstick worn by everyone. Universally flattering, intensely pigmented.',
   34.00, NULL, 5, 1, true, true, 'CT-LIP-PT-001'),

  (gen_random_uuid(), 'Matte Revolution Lipstick in So Marilyn', 'ct-lip-so-marilyn',
   'A bold, screen-siren red with ultra-matte finish. Iconic Charlotte Tilbury.',
   34.00, NULL, 5, 1, true, true, 'CT-LIP-SM-001'),

  (gen_random_uuid(), 'Audacious Lipstick in Dragon Girl', 'nars-lip-dragon',
   'A vivid poppy red with a satin finish. Full-coverage colour that lasts all day.',
   38.00, NULL, 5, 2, true, true, 'NARS-LIP-DG-001'),

  (gen_random_uuid(), 'Audacious Lipstick in Bette', 'nars-lip-bette',
   'A deep berry rose with rich satin finish. Effortlessly glamorous.',
   38.00, NULL, 5, 2, true, true, 'NARS-LIP-BT-001'),

  (gen_random_uuid(), 'Rouge Dior Couture Lip Colour in 999', 'dior-lip-999',
   'The legendary rouge. Intense, couture-inspired red in silky satin.',
   42.00, NULL, 5, 4, true, true, 'DIOR-LIP-999-001'),

  (gen_random_uuid(), 'Rouge Dior Velvet in 100 Nude Look', 'dior-lip-nude-look',
   'A sophisticated nude with velvety matte finish. Smooth, comfortable wear.',
   42.00, NULL, 5, 4, true, true, 'DIOR-LIP-NL-001'),

  (gen_random_uuid(), 'Lipglass in Myth', 'mac-lip-myth',
   'The universally flattering pale pink gloss. Ultra-glossy, high-shine finish.',
   22.00, NULL, 5, 12, true, true, 'MAC-LIP-MYTH-001'),

  (gen_random_uuid(), 'Lipstick in Ruby Woo', 'mac-lip-ruby-woo',
   'The world''s most iconic red lipstick. Retro matte, vivid, and boldly pigmented.',
   22.00, NULL, 5, 12, true, true, 'MAC-LIP-RW-001')

ON CONFLICT (slug) DO NOTHING;

-- ── EYE PRODUCTS ────────────────────────────────────────────
INSERT INTO products (id, name, slug, short_description, price, compare_at_price, category_id, brand_id, is_active, is_featured, sku)
VALUES
  (gen_random_uuid(), 'Luxury Palette in Pillow Talk', 'ct-eye-pillow-talk',
   'Nine dreamy nudes and rose-golds in an elegant compact. Day to night effortlessly.',
   75.00, NULL, 6, 1, true, true, 'CT-EYE-PT-001'),

  (gen_random_uuid(), 'Luxury Palette in Smokey Eye', 'ct-eye-smokey',
   'Velvety charcoals, deep plums and champagne. Master the perfect smoky eye.',
   75.00, NULL, 6, 1, true, true, 'CT-EYE-SE-001'),

  (gen_random_uuid(), 'Narsissist Eyeshadow Palette', 'nars-eye-narsissist',
   'Twelve of the most universally flattering shades from the NARS archives.',
   69.00, NULL, 6, 2, true, true, 'NARS-EYE-NAR-001'),

  (gen_random_uuid(), '5 Couleurs Couture Eyeshadow Palette in 279 Dune', 'dior-eye-5c-dune',
   'Five shades to create infinite looks — from subtle daytime to dramatic evening.',
   82.00, NULL, 6, 4, true, true, 'DIOR-EYE-5C-001'),

  (gen_random_uuid(), 'Diorshow Iconic Overcurl Mascara', 'dior-eye-overcurl',
   'Extreme curl and volume. Spectacular lashes that curl from root to tip.',
   34.00, NULL, 6, 4, true, true, 'DIOR-EYE-OC-001'),

  (gen_random_uuid(), 'Eye Kohl in Smolder', 'mac-eye-smolder',
   'Intensely pigmented kohl liner for smoky, sultry definition. Waterproof and blendable.',
   22.00, NULL, 6, 12, true, true, 'MAC-EYE-SMO-001'),

  (gen_random_uuid(), 'Soft Touch Shadow Stick', 'mac-eye-shadow-stick',
   'Effortless, blendable shadow stick. Glides on smoothly for a wash of colour.',
   26.00, NULL, 6, 12, true, true, 'MAC-EYE-STS-001'),

  (gen_random_uuid(), 'Velvet Noir Major Volume Mascara', 'nars-eye-mascara',
   'Velvet-black mascara that delivers major volume and dramatic length.',
   30.00, NULL, 6, 2, true, true, 'NARS-EYE-VN-001')

ON CONFLICT (slug) DO NOTHING;

-- ── FACE PRODUCTS ───────────────────────────────────────────
INSERT INTO products (id, name, slug, short_description, price, compare_at_price, category_id, brand_id, is_active, is_featured, sku)
VALUES
  (gen_random_uuid(), 'Flawless Filter in Shade 3', 'ct-face-flawless-filter',
   'The cult complexion booster. Blurs imperfections and adds a luminous glow.',
   49.00, NULL, 7, 1, true, true, 'CT-FACE-FF-001'),

  (gen_random_uuid(), 'Airbrush Flawless Foundation in 5 Neutral', 'ct-face-airbrush',
   'Full-coverage, transfer-resistant formula. Flawless finish that lasts 24 hours.',
   56.00, NULL, 7, 1, true, true, 'CT-FACE-AF-001'),

  (gen_random_uuid(), 'Sheer Glow Foundation in Syracuse', 'nars-face-sheer-glow',
   'Buildable, luminous coverage. A second-skin finish with a natural glow.',
   52.00, NULL, 7, 2, true, true, 'NARS-FACE-SG-001'),

  (gen_random_uuid(), 'Radiant Creamy Concealer in Vanilla', 'nars-face-concealer',
   'Creamy, luminous concealer. Covers and brightens with a soft-focus finish.',
   34.00, NULL, 7, 2, true, true, 'NARS-FACE-CC-001'),

  (gen_random_uuid(), 'Backstage Face & Body Foundation in 1N', 'dior-face-backstage',
   'Lightweight, buildable coverage. Professional-finish foundation inspired by runway.',
   52.00, NULL, 7, 4, true, true, 'DIOR-FACE-BF-001'),

  (gen_random_uuid(), 'Dior Forever Skin Glow Foundation in 2N', 'dior-face-forever',
   '24-hour wear with a radiant glow. SPF 35. Hydrating, luminous perfection.',
   52.00, NULL, 7, 4, true, true, 'DIOR-FACE-FG-001'),

  (gen_random_uuid(), 'Studio Fix Fluid Foundation SPF 15', 'mac-face-studio-fix',
   'Natural matte finish with buildable, medium-to-full coverage. Classic MAC.',
   38.00, NULL, 7, 12, true, true, 'MAC-FACE-SF-001'),

  (gen_random_uuid(), 'Prep + Prime Fix+ Setting Spray', 'mac-face-fix',
   'Coconut water-infused mist. Sets makeup and gives skin an instant radiant finish.',
   33.00, NULL, 7, 12, true, true, 'MAC-FACE-FX-001')

ON CONFLICT (slug) DO NOTHING;

-- ── SKINCARE: MOISTURIZERS ──────────────────────────────────
INSERT INTO products (id, name, slug, short_description, price, compare_at_price, category_id, brand_id, is_active, is_featured, sku)
VALUES
  (gen_random_uuid(), 'The Dewy Skin Cream', 'tatcha-dsc-v2',
   'Rich Japanese plum and hyaluronic acid. Plumps and smooths for glass-skin radiance.',
   69.00, NULL, 8, 7, true, true, 'TCH-MOIST-DS-001'),

  (gen_random_uuid(), 'The Water Cream', 'tatcha-twc-v2',
   'Oil-free anti-ageing water cream with wild rose. Lightweight hydration, visible pores minimised.',
   69.00, NULL, 8, 7, true, true, 'TCH-MOIST-WC-001'),

  (gen_random_uuid(), 'Crème de la Mer Moisturizing Cream', 'la-mer-creme-v2',
   'The legendary luxury cream. Heals, hydrates and transforms with Miracle Broth.',
   190.00, 215.00, 8, 3, true, true, 'LM-MOIST-CR-001'),

  (gen_random_uuid(), 'Soft Moisture Lotion', 'la-mer-sml',
   'A lighter, fluid version of the iconic Crème. Silky texture for all skin types.',
   145.00, NULL, 8, 3, true, true, 'LM-MOIST-SML-001')

ON CONFLICT (slug) DO NOTHING;

-- ── SKINCARE: SERUMS ────────────────────────────────────────
INSERT INTO products (id, name, slug, short_description, price, compare_at_price, category_id, brand_id, is_active, is_featured, sku)
VALUES
  (gen_random_uuid(), 'C E Ferulic Serum', 'skc-cef-v2',
   'The gold-standard vitamin C serum. Unrivalled antioxidant protection and radiance.',
   182.00, NULL, 9, 16, true, true, 'SKC-SER-CEF-001'),

  (gen_random_uuid(), 'Metacell Renewal B3 Serum', 'skc-meta-b3',
   'Smooths fine lines and repairs the skin barrier with 5% niacinamide and peptides.',
   128.00, NULL, 9, 16, true, true, 'SKC-SER-MB3-001')

ON CONFLICT (slug) DO NOTHING;

-- ── ASSIGN IMAGES TO NEW LIP PRODUCTS ──────────────────────
INSERT INTO product_images (id, product_id, url, is_primary, sort_order)
SELECT gen_random_uuid(), p.id,
  CASE p.slug
    WHEN 'ct-lip-pillow-talk'  THEN 'https://images.unsplash.com/photo-1709477542145-868afa3d298b?w=600&q=80'
    WHEN 'ct-lip-so-marilyn'   THEN 'https://images.unsplash.com/photo-1615502589579-2e829b92a6ce?w=600&q=80'
    WHEN 'nars-lip-dragon'     THEN 'https://images.unsplash.com/photo-1770981773328-63c2ad10013d?w=600&q=80'
    WHEN 'nars-lip-bette'      THEN 'https://images.unsplash.com/photo-1584013544071-caee786e105b?w=600&q=80'
    WHEN 'dior-lip-999'        THEN 'https://images.unsplash.com/photo-1613255348289-1407e4f2f980?w=600&q=80'
    WHEN 'dior-lip-nude-look'  THEN 'https://images.unsplash.com/photo-1590156352745-1cb2758c36b9?w=600&q=80'
    WHEN 'mac-lip-myth'        THEN 'https://images.unsplash.com/photo-1654973433534-1238e06f6b38?w=600&q=80'
    WHEN 'mac-lip-ruby-woo'    THEN 'https://images.unsplash.com/photo-1770981667014-677a0bf91663?w=600&q=80'
  END,
  true, 0
FROM products p
WHERE p.slug IN ('ct-lip-pillow-talk','ct-lip-so-marilyn','nars-lip-dragon','nars-lip-bette',
                 'dior-lip-999','dior-lip-nude-look','mac-lip-myth','mac-lip-ruby-woo')
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true);

-- ── ASSIGN IMAGES TO NEW EYE PRODUCTS ──────────────────────
INSERT INTO product_images (id, product_id, url, is_primary, sort_order)
SELECT gen_random_uuid(), p.id,
  CASE p.slug
    WHEN 'ct-eye-pillow-talk'    THEN 'https://images.unsplash.com/photo-1680474557611-988b50247c66?w=600&q=80'
    WHEN 'ct-eye-smokey'         THEN 'https://images.unsplash.com/photo-1707724931643-98d0445e9db8?w=600&q=80'
    WHEN 'nars-eye-narsissist'   THEN 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80'
    WHEN 'dior-eye-5c-dune'      THEN 'https://images.unsplash.com/photo-1570411004091-f33db096d9da?w=600&q=80'
    WHEN 'dior-eye-overcurl'     THEN 'https://images.unsplash.com/photo-1587055682234-853183f4523c?w=600&q=80'
    WHEN 'mac-eye-smolder'       THEN 'https://images.unsplash.com/photo-1583334418819-13c7a1556e4f?w=600&q=80'
    WHEN 'mac-eye-shadow-stick'  THEN 'https://images.unsplash.com/photo-1610067762007-1ca5a93f72b3?w=600&q=80'
    WHEN 'nars-eye-mascara'      THEN 'https://images.unsplash.com/photo-1606158582120-b4fc196bffad?w=600&q=80'
  END,
  true, 0
FROM products p
WHERE p.slug IN ('ct-eye-pillow-talk','ct-eye-smokey','nars-eye-narsissist','dior-eye-5c-dune',
                 'dior-eye-overcurl','mac-eye-smolder','mac-eye-shadow-stick','nars-eye-mascara')
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true);

-- ── ASSIGN IMAGES TO NEW FACE PRODUCTS ─────────────────────
INSERT INTO product_images (id, product_id, url, is_primary, sort_order)
SELECT gen_random_uuid(), p.id,
  CASE p.slug
    WHEN 'ct-face-flawless-filter' THEN 'https://images.unsplash.com/photo-1512207576147-99bc3066b621?w=600&q=80'
    WHEN 'ct-face-airbrush'        THEN 'https://images.unsplash.com/photo-1550281378-521929a11c42?w=600&q=80'
    WHEN 'nars-face-sheer-glow'    THEN 'https://images.unsplash.com/photo-1560879311-370fd4561a0d?w=600&q=80'
    WHEN 'nars-face-concealer'     THEN 'https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=600&q=80'
    WHEN 'dior-face-backstage'     THEN 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80'
    WHEN 'dior-face-forever'       THEN 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&q=80'
    WHEN 'mac-face-studio-fix'     THEN 'https://images.unsplash.com/photo-1512495967160-4e815a64fba6?w=600&q=80'
    WHEN 'mac-face-fix'            THEN 'https://images.unsplash.com/photo-1453761816053-ed5ba727b5b7?w=600&q=80'
  END,
  true, 0
FROM products p
WHERE p.slug IN ('ct-face-flawless-filter','ct-face-airbrush','nars-face-sheer-glow','nars-face-concealer',
                 'dior-face-backstage','dior-face-forever','mac-face-studio-fix','mac-face-fix')
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true);

-- ── ASSIGN IMAGES TO NEW SKINCARE PRODUCTS ─────────────────
INSERT INTO product_images (id, product_id, url, is_primary, sort_order)
SELECT gen_random_uuid(), p.id,
  CASE p.slug
    WHEN 'tatcha-dsc-v2'    THEN 'https://images.unsplash.com/photo-1598282674886-81688e202188?w=600&q=80'
    WHEN 'tatcha-twc-v2'    THEN 'https://images.unsplash.com/photo-1609097164673-7cfafb51b926?w=600&q=80'
    WHEN 'la-mer-creme-v2'  THEN 'https://images.unsplash.com/photo-1635847417488-fb910da0f82a?w=600&q=80'
    WHEN 'la-mer-sml'       THEN 'https://images.unsplash.com/photo-1641130290711-01c4c4558562?w=600&q=80'
    WHEN 'skc-cef-v2'       THEN 'https://images.unsplash.com/photo-1646683872419-d5a50258d4d9?w=600&q=80'
    WHEN 'skc-meta-b3'      THEN 'https://images.unsplash.com/photo-1679394042175-717ca34ef0f2?w=600&q=80'
  END,
  true, 0
FROM products p
WHERE p.slug IN ('tatcha-dsc-v2','tatcha-twc-v2','la-mer-creme-v2','la-mer-sml','skc-cef-v2','skc-meta-b3')
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true);

-- ── FIX HTML ENTITIES IN ALL PRODUCT NAMES ─────────────────
UPDATE products SET name = REPLACE(name, '&trade;', '™')  WHERE name LIKE '%&trade;%';
UPDATE products SET name = REPLACE(name, '&amp;',  '&')   WHERE name LIKE '%&amp;%';
UPDATE products SET name = REPLACE(name, '&reg;',  '®')   WHERE name LIKE '%&reg;%';
UPDATE products SET name = REPLACE(name, '&#8482;','™')   WHERE name LIKE '%&#8482;%';
UPDATE products SET name = REPLACE(name, '&#174;', '®')   WHERE name LIKE '%&#174;%';
UPDATE products SET name = REPLACE(name, '&copy;', '©')   WHERE name LIKE '%&copy;%';

-- ── CLEAN UP DATE-STAMPED / PROMOTIONAL NAMES ───────────────
UPDATE products SET name = REGEXP_REPLACE(name, ' [-–] (Christmas|Holiday|Limited Edition|Spring|Summer|Fall|Winter|Autumn) \d{4}.*$', '', 'gi')
WHERE name ~* '(Christmas|Holiday|Limited Edition|Spring|Summer|Fall|Winter) \d{4}';
