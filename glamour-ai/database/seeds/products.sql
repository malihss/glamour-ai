-- =============================================================
-- Glamour AI — Master Product Seed
-- Real brands · Real products · Curated images
-- Run: psql $DATABASE_URL -f database/seeds/products.sql
-- =============================================================

TRUNCATE TABLE reviews, product_images, product_variants,
              wishlists, user_interactions, cart_items, order_items,
              orders, carts, products, brands, categories
RESTART IDENTITY CASCADE;

-- ═════════════════════════════════════════════════════════════
-- CATEGORIES
-- ═════════════════════════════════════════════════════════════
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Makeup',    'makeup',    'Lips, eyes, face colour and more',           'https://images.unsplash.com/photo-1583241800698-e8ab01831983?w=700&q=85'),
  ('Skincare',  'skincare',  'Serums, moisturisers and treatments',        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=85'),
  ('Fragrance', 'fragrance', 'Luxury perfumes and body mists',             'https://images.unsplash.com/photo-1541643600914-78b084683702?w=700&q=85'),
  ('Tools',     'tools',     'Professional brushes, devices & accessories','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=85');

INSERT INTO categories (name, slug, description, parent_id) VALUES
  ('Lips',         'lip',          'Lipsticks, glosses and liners',     (SELECT id FROM categories WHERE slug='makeup')),
  ('Eyes',         'eyes',         'Eyeshadow, mascara and liner',      (SELECT id FROM categories WHERE slug='makeup')),
  ('Face',         'face',         'Foundation, blush and contour',     (SELECT id FROM categories WHERE slug='makeup')),
  ('Moisturisers', 'moisturizers', 'Face moisturisers and creams',      (SELECT id FROM categories WHERE slug='skincare')),
  ('Serums',       'serums',       'Treatment serums and essences',     (SELECT id FROM categories WHERE slug='skincare')),
  ('Cleansers',    'cleansers',    'Face cleansers and micellar water', (SELECT id FROM categories WHERE slug='skincare')),
  ('Eye Care',     'eye-care',     'Eye creams and patches',            (SELECT id FROM categories WHERE slug='skincare')),
  ('SPF',          'spf',          'Sun protection for face',           (SELECT id FROM categories WHERE slug='skincare')),
  ('Eau de Parfum','eau-de-parfum','Intense fragrance concentration',   (SELECT id FROM categories WHERE slug='fragrance')),
  ('Brushes',      'brushes',      'Makeup brushes and applicators',   (SELECT id FROM categories WHERE slug='tools')),
  ('Devices',      'devices',      'Cleansing and beauty devices',     (SELECT id FROM categories WHERE slug='tools'));

-- ═════════════════════════════════════════════════════════════
-- BRANDS
-- ═════════════════════════════════════════════════════════════
INSERT INTO brands (name, slug, description, country) VALUES
  ('Charlotte Tilbury', 'charlotte-tilbury', 'Iconic British luxury makeup by celebrity MUA Charlotte Tilbury', 'UK'),
  ('NARS',              'nars',              'Bold, provocative cosmetics founded by François Nars',           'USA'),
  ('La Mer',            'la-mer',            'Transformative skincare powered by the sea',                     'USA'),
  ('Dior Beauty',       'dior-beauty',       'Haute couture cosmetics from the house of Christian Dior',       'France'),
  ('Fenty Beauty',      'fenty-beauty',      'Inclusive beauty for all skin tones, by Rihanna',               'USA'),
  ('YSL Beauty',        'ysl-beauty',        'Iconic French luxury beauty from Yves Saint Laurent',           'France'),
  ('Tatcha',            'tatcha',            'Japanese-inspired skincare rooted in ancient rituals',           'USA'),
  ('Pat McGrath Labs',  'pat-mcgrath-labs',  'Ultra-luxury makeup by the world''s most in-demand MUA',        'UK'),
  ('Drunk Elephant',    'drunk-elephant',    'Clean biocompatible skincare',                                   'USA'),
  ('The Ordinary',      'the-ordinary',      'Clinical formulations at accessible prices',                    'Canada'),
  ('Rare Beauty',       'rare-beauty',       'Inclusive, joyful beauty by Selena Gomez',                      'USA'),
  ('MAC',               'mac',               'Professional makeup for all races, all sexes, all ages',        'Canada'),
  ('Chanel',            'chanel',            'The legendary French luxury house',                             'France'),
  ('Byredo',            'byredo',            'Artisanal Swedish niche fragrance',                             'Sweden'),
  ('Jo Malone London',  'jo-malone',         'British luxury fragrance and bath house',                      'UK'),
  ('Tom Ford Beauty',   'tom-ford-beauty',   'Ultra-luxurious beauty from the iconic American designer',      'USA'),
  ('Armani Beauty',     'armani-beauty',     'Italian luxury cosmetics and fragrance',                        'Italy'),
  ('Lancôme',           'lancome',           'French luxury beauty for skincare and cosmetics',               'France'),
  ('Hourglass',         'hourglass',         'Luxury cruelty-free cosmetics',                                 'USA'),
  ('Skinceuticals',     'skinceuticals',     'Science-backed antioxidant and corrective skincare',            'USA'),
  ('Beautyblender',     'beautyblender',     'The original iconic makeup applicator sponge',                  'USA'),
  ('FOREO',             'foreo',             'Swedish beauty technology and skincare devices',                 'Sweden'),
  ('Bobbi Brown',       'bobbi-brown',       'Artistry-driven luxury makeup and skincare',                    'USA');

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — LIPS
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='charlotte-tilbury'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Matte Revolution Lipstick',
 'ct-matte-revolution',
 'The original cult matte lipstick enriched with Charlotte''s Hydra-Lip Complex. Delivers full-coverage velvet-matte colour in a single swipe that lasts 12 hours without drying or feathering. Available in 50+ iconic shades from universally flattering nudes to bold reds. The Pillow Talk shade is worn by celebrities worldwide.',
 'Iconic 12-hour velvet-matte lipstick — 50+ shades',
 34.00, NULL, 'CT-LIP-001', 200, TRUE, ARRAY['lipstick','matte','long-wear','bestseller','luxury']),

((SELECT id FROM brands WHERE slug='ysl-beauty'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Rouge Pur Couture The Bold Lipstick',
 'ysl-rouge-pur-couture-bold',
 'YSL''s boldest lipstick formula with intense, full-coverage colour in a satiny-matte finish. The creamy texture glides on effortlessly, delivering buildable opacity that transforms lips with one stroke. Enriched with moisturising hyaluronic acid and sweet almond oil for all-day comfort. The iconic YSL gold case is a beauty staple.',
 'Iconic YSL satiny-matte lipstick with gold case',
 40.00, NULL, 'YSL-LIP-001', 170, TRUE, ARRAY['lipstick','ysl','luxury','satin','iconic']),

((SELECT id FROM brands WHERE slug='dior-beauty'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Rouge Dior Forever Lipstick',
 'dior-rouge-forever',
 'Dior''s long-wearing matte lip colour with a comfortable, velvety texture and intense floral pigments. Lasts up to 24 hours without cracking or drying. The refillable couture case — available in multiple finishes — represents Dior''s commitment to sustainability. Each shade is named after iconic Dior runway looks.',
 'Refillable 24-hour long-wear matte lipstick',
 42.00, NULL, 'DIOR-LIP-001', 140, TRUE, ARRAY['lipstick','matte','dior','refillable','24hr','luxury']),

((SELECT id FROM brands WHERE slug='mac'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Retro Matte Lipstick — Ruby Woo',
 'mac-ruby-woo',
 'The world''s most iconic red lipstick. MAC''s Retro Matte formula delivers an intensely pigmented, true retro-matte finish in vivid Ruby Woo — a universally flattering blue-red that photographs brilliantly on every skin tone. Comfortable wear with all-day staying power. Voted best red lipstick by Vogue, Harper''s Bazaar and Allure.',
 'The world''s most iconic retro-matte red lipstick',
 22.00, NULL, 'MAC-LIP-001', 300, TRUE, ARRAY['lipstick','matte','red','iconic','mac','bestseller']),

((SELECT id FROM brands WHERE slug='fenty-beauty'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Poutsicle Hydrating Lip Stain',
 'fenty-poutsicle-lip-stain',
 'A juicy, doe-foot lip stain that delivers a sheer-to-medium wash of buildable colour with a glossy, hydrating finish. Formulated with moisturising hyaluronic acid and vitamin E for plump, comfortable lips all day. The lightweight water-based formula won''t bleed or feather, and dries down to a sheer stain that lasts for hours.',
 'Glossy hydrating lip stain with hyaluronic acid',
 26.00, NULL, 'FENTY-LIP-001', 250, TRUE, ARRAY['lip-stain','glossy','hydrating','fenty','sheer']),

((SELECT id FROM brands WHERE slug='rare-beauty'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Soft Pinch Tinted Lip Oil',
 'rare-soft-pinch-lip-oil',
 'Selena Gomez''s everyday lip must-have. A lightweight, non-sticky tinted lip oil that gives a sheer flush of colour with a glossy, plumping effect. Infused with jojoba oil, plant-based squalane and vitamin E to nourish and hydrate. The dropper applicator allows precise, buildable application for your perfect level of colour.',
 'Non-sticky tinted lip oil with jojoba and squalane',
 22.00, NULL, 'RB-LIP-001', 280, TRUE, ARRAY['lip-oil','glossy','hydrating','rare-beauty','natural','viral']),

((SELECT id FROM brands WHERE slug='pat-mcgrath-labs'),
 (SELECT id FROM categories WHERE slug='lip'),
 'MatteTrance Lipstick',
 'pgm-mattetrance',
 'Pat McGrath''s most transcendent lipstick formula. MatteTrance delivers ultra-saturated colour in an impossibly weightless matte finish that wears for hours without drying. Formulated with Pat''s exclusive TrioGel Technology for a second-skin matte that photographs beautifully under any light. The pigments are unlike anything else in the industry.',
 'Ultra-pigmented weightless matte — editorial artistry',
 45.00, NULL, 'PGM-LIP-001', 90, TRUE, ARRAY['lipstick','matte','luxury','editorial','pigmented']),

((SELECT id FROM brands WHERE slug='chanel'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Rouge Allure Velvet Nuit Blanche',
 'chanel-rouge-allure-velvet',
 'Chanel''s most sensual lipstick formula — a velvet matte with a soft, luminous veil of colour. The unique formula moisturises and protects lips for a perfectly comfortable matte that never feels dry or heavy. Each of the 45 carefully curated shades embodies the spirit of a Chanel woman: bold, elegant and effortlessly chic.',
 'Chanel velvet-matte with luminous soft finish',
 42.00, NULL, 'CHANEL-LIP-001', 120, FALSE, ARRAY['lipstick','chanel','velvet','matte','luxury']),

((SELECT id FROM brands WHERE slug='armani-beauty'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Rouge d''Armani Matte Lipstick',
 'armani-rouge-matte',
 'Giorgio Armani''s definitive matte lipstick — the Rouge d''Armani Matte delivers intense, full-coverage pigment with a supremely comfortable, non-drying formula. The luxurious satin-matte texture has been engineered for maximum wearability and minimised feathering. Available in 25 sophisticated shades.',
 'Armani satin-matte with intense full-coverage pigment',
 38.00, NULL, 'ARMANI-LIP-001', 100, FALSE, ARRAY['lipstick','matte','armani','luxury','Italian']),

((SELECT id FROM brands WHERE slug='hourglass'),
 (SELECT id FROM categories WHERE slug='lip'),
 'Confession Ultra Slim High Intensity Lipstick',
 'hourglass-confession-lipstick',
 'Hourglass''s groundbreaking ultra-slim lipstick with high-intensity pigment in a weightless formula. The innovative silky texture delivers full coverage with a soft, natural finish that lasts up to 8 hours. 100% cruelty-free and vegan — available in 60+ shades with refillable bullet options.',
 'Ultra-slim high-intensity cruelty-free lipstick',
 36.00, NULL, 'HG-LIP-001', 80, FALSE, ARRAY['lipstick','cruelty-free','vegan','slim','luxury']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — EYES
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='charlotte-tilbury'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Luxury Palette — The Golden Goddess',
 'ct-luxury-palette-golden',
 'Charlotte Tilbury''s iconic 12-pan eyeshadow palette curated for the ultimate golden smoky eye. Features an expertly balanced mix of satin, shimmer and glitter finishes in warm champagne, bronze and rose-gold tones. Each shade is deeply pigmented and blendable, taking you from a subtle day look to dramatic editorial glamour.',
 '12-shade golden eye palette — day to evening glam',
 75.00, NULL, 'CT-EYE-001', 85, TRUE, ARRAY['eyeshadow','palette','golden','glam','bestseller']),

((SELECT id FROM brands WHERE slug='pat-mcgrath-labs'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Mothership IX Eyeshadow Palette — Velvet Rose',
 'pgm-mothership-ix',
 'Pat McGrath''s most coveted eyeshadow palette — 10 transcendent shades of velvety mattes, glitters and iridescent metallics. The Velvet Rose edition features deep wine, dusty rose, burnished copper and midnight black in Pat''s exclusive Ultra-Pigment Technology. Considered the finest eyeshadow palette in the world.',
 'Iconic 10-shade palette — transcendent pigments',
 125.00, NULL, 'PGM-EYE-001', 60, TRUE, ARRAY['eyeshadow','palette','luxury','editorial','metallic','velvet']),

((SELECT id FROM brands WHERE slug='nars'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Narsissist Wanted Eyeshadow Palette',
 'nars-narsissist-wanted',
 'NARS''s most versatile 10-shade eyeshadow palette featuring both everyday neutrals and statement colours across matte, shimmer and satin finishes. The curated shade selection allows you to create infinite looks — from barely-there daytime definition to NARS''s signature smoky glamour.',
 'Versatile 10-shade palette — every occasion',
 65.00, NULL, 'NARS-EYE-001', 110, FALSE, ARRAY['eyeshadow','palette','neutral','versatile','nars']),

((SELECT id FROM brands WHERE slug='fenty-beauty'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Snap Shadows Mix & Match Eyeshadow Palette',
 'fenty-snap-shadows',
 'Fenty Beauty''s magnetic snap palette with six curated eyeshadow shades — mix, match and snap palettes together for a fully customisable beauty routine. Combines high-impact mattes and metallic shimmers in complementary tones. Perfect for travel and buildable looks from subtle to bold.',
 'Six-shade magnetic snap palette — matte + metallic',
 29.00, NULL, 'FENTY-EYE-001', 200, TRUE, ARRAY['eyeshadow','palette','fenty','metallic','magnetic']),

((SELECT id FROM brands WHERE slug='dior-beauty'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Diorshow Iconic Overcurl Mascara',
 'dior-diorshow-overcurl',
 'Dior''s professional-grade mascara with a unique overcurl brush that wraps around every lash to lift, separate and intensely curl from root to tip. The buildable formula delivers extraordinary volume and length with a lasting curve hold. Available in intense black and deep black with a smudge-proof, all-day formula.',
 'Extreme curl professional mascara — volumising & lengthening',
 32.00, NULL, 'DIOR-EYE-001', 220, FALSE, ARRAY['mascara','volume','curl','dior','professional']),

((SELECT id FROM brands WHERE slug='mac'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Extended Play Gigablack Lash Mascara',
 'mac-extended-play-mascara',
 'MAC''s cult mascara that builds serious length and volume with a lengthening brush for lashes that look extended and separated. The smudge-proof, crumble-proof formula lasts all day without flaking. Available in the iconic jet black that MAC artists worldwide swear by.',
 'Length-building mascara — no-smudge, no-flake formula',
 24.00, NULL, 'MAC-EYE-001', 180, FALSE, ARRAY['mascara','lengthening','mac','smudge-proof','professional']),

((SELECT id FROM brands WHERE slug='lancome'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Monsieur Big Mascara',
 'lancome-monsieur-big',
 'Lancôme''s bestselling mascara with the biggest brush in the Lancôme collection for super volumised, dramatic lashes. The XXL fibre-infused formula delivers 6× more volume and lasts up to 24 hours without smudging. Beloved by makeup artists and beauty editors globally as the most dramatic mascara available.',
 'Ultra-volumising mascara — 6× more volume in one coat',
 30.00, NULL, 'LANCOME-EYE-001', 190, TRUE, ARRAY['mascara','volume','lancome','dramatic','bestseller']),

((SELECT id FROM brands WHERE slug='chanel'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Les 4 Ombres Eyeshadow Palette — Rose Gabrielle',
 'chanel-les-4-ombres-rose',
 'Chanel''s legendary four-shadow palette in the dreamy Rose Gabrielle edit — a harmony of soft rose, champagne, matte taupe and deep burgundy. The velvety textures blend seamlessly with Chanel''s exclusive Pigment Color Technology for buildable, skin-true colour that lasts all day. The elegant palette is as beautiful on your vanity as on your eyes.',
 'Chanel 4-shade palette — Rose Gabrielle',
 69.00, NULL, 'CHANEL-EYE-001', 75, TRUE, ARRAY['eyeshadow','palette','chanel','luxury','rose']),

((SELECT id FROM brands WHERE slug='hourglass'),
 (SELECT id FROM categories WHERE slug='eyes'),
 'Curator Eyeshadow Palette',
 'hourglass-curator-palette',
 'Hourglass''s most editorial 10-shade eyeshadow palette featuring a cohesive range of buildable intensities across warm neutrals to deep smoky shades. 100% cruelty-free with vegan-friendly formula. Every shade performs both wet and dry for maximum versatility.',
 '10-shade cruelty-free editorial palette',
 68.00, NULL, 'HG-EYE-001', 65, FALSE, ARRAY['eyeshadow','palette','cruelty-free','vegan','hourglass']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — FACE
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='fenty-beauty'),
 (SELECT id FROM categories WHERE slug='face'),
 'Pro Filt''r Soft Matte Longwear Foundation',
 'fenty-pro-filtr-foundation',
 'The foundation that changed the beauty industry. Fenty Beauty''s Pro Filt''r delivers oil-free, medium-to-full coverage with a soft matte finish that blurs pores and controls shine for up to 24 hours. Available in a groundbreaking 50 shades across all undertones — from the palest fair to the deepest rich tones. The formula is transfer-resistant, humidity-proof and built to last.',
 'Oil-free soft matte foundation — 50 inclusive shades',
 40.00, NULL, 'FENTY-FDN-001', 350, TRUE, ARRAY['foundation','matte','inclusive','longwear','bestseller','oil-free','24hr']),

((SELECT id FROM brands WHERE slug='armani-beauty'),
 (SELECT id FROM categories WHERE slug='face'),
 'Luminous Silk Foundation',
 'armani-luminous-silk',
 'The world''s most award-winning foundation. Armani''s Luminous Silk has been voted best foundation by beauty editors for over a decade. The micro-fil technology creates a weightless, breathable fabric of colour that looks like your skin — only better. Medium buildable coverage with a luminous, natural satin finish that photographs beautifully in any light.',
 'Award-winning luminous silk foundation — natural radiance',
 68.00, NULL, 'ARMANI-FDN-001', 160, TRUE, ARRAY['foundation','luminous','natural','award-winning','satin','armani','bestseller']),

((SELECT id FROM brands WHERE slug='charlotte-tilbury'),
 (SELECT id FROM categories WHERE slug='face'),
 'Flawless Filter Complexion Booster',
 'ct-flawless-filter',
 'Charlotte Tilbury''s award-winning complexion booster that works as a primer, foundation or luminous highlighter for a real-life filter effect. The buildable, multi-tasking formula diffuses imperfections and adds radiant luminosity for skin that glows from within. Mix with your foundation or wear alone for the ultimate no-makeup-makeup look.',
 'Award-winning primer, foundation & glow filter',
 49.00, 58.00, 'CT-FACE-001', 180, TRUE, ARRAY['primer','highlighter','glow','filter','bestseller','multi-use']),

((SELECT id FROM brands WHERE slug='nars'),
 (SELECT id FROM categories WHERE slug='face'),
 'Light Reflecting Advanced Skincare Foundation',
 'nars-light-reflecting-foundation',
 'NARS''s most skin-loving foundation yet — a skincare-makeup hybrid that delivers medium-to-full coverage with a natural, healthy-looking finish. Formulated with niacinamide, hyaluronic acid and Chronolux™ Power Signal Technology to improve skin''s texture and radiance over time. Weightless, transfer-resistant and suitable for all skin types.',
 'Skincare-hybrid foundation with niacinamide & hyaluronic acid',
 55.00, NULL, 'NARS-FDN-001', 130, FALSE, ARRAY['foundation','skincare','niacinamide','hyaluronic','natural']),

((SELECT id FROM brands WHERE slug='rare-beauty'),
 (SELECT id FROM categories WHERE slug='face'),
 'Soft Pinch Liquid Blush',
 'rare-soft-pinch-blush',
 'The viral two-drop blush by Selena Gomez. Rare Beauty''s Soft Pinch Liquid Blush delivers an ultra-natural, skin-like flush of colour that lasts all day without caking or creasing. The highly concentrated pigment means just two drops are enough for a glowing, diffused effect. Available in 14 shade families from soft nudes to bold berries.',
 'Viral highly-pigmented liquid blush — just 2 drops needed',
 22.00, NULL, 'RB-FACE-001', 310, TRUE, ARRAY['blush','liquid','pigmented','natural','viral','rare-beauty','bestseller']),

((SELECT id FROM brands WHERE slug='hourglass'),
 (SELECT id FROM categories WHERE slug='face'),
 'Ambient Lighting Powder — Ethereal Light',
 'hourglass-ambient-lighting-powder',
 'Hourglass''s iconic Ambient Lighting Powder uses photoluminescent technology to modify light reflecting off your face for a genuinely otherworldly glow. The Ethereal Light shade adds a soft, warm luminosity that blurs imperfections and smooths skin''s appearance. Used by makeup artists worldwide for the perfect lit-from-within finish.',
 'Photoluminescent powder for an ethereal glow',
 58.00, NULL, 'HG-FACE-001', 95, TRUE, ARRAY['setting-powder','luminous','glow','hourglass','luxury','editorial']),

((SELECT id FROM brands WHERE slug='mac'),
 (SELECT id FROM categories WHERE slug='face'),
 'Studio Fix Fluid SPF 15 Foundation',
 'mac-studio-fix-fluid',
 'The backstage foundation trusted by professional makeup artists worldwide. MAC Studio Fix Fluid delivers medium-to-full buildable coverage with a natural matte finish and SPF 15 protection. Oil-controlling, long-wearing and transfer-resistant — available in 68 shades to match every skin tone precisely.',
 'Professional matte foundation SPF 15 — 68 shades',
 35.00, NULL, 'MAC-FDN-001', 240, FALSE, ARRAY['foundation','matte','spf','professional','mac','68-shades']),

((SELECT id FROM brands WHERE slug='lancome'),
 (SELECT id FROM categories WHERE slug='face'),
 'Teint Idole Ultra Wear Foundation',
 'lancome-teint-idole',
 'Lancôme''s most iconic foundation — a full-coverage, 24-hour foundation with a natural matte finish that doesn''t oxidise. The lightweight formula is comfortable and weightless, yet offers flawless coverage that lasts through humidity, heat and long days. Dermatologist-tested, suitable for all skin types including sensitive.',
 'Full-coverage 24-hour non-oxidising matte foundation',
 52.00, NULL, 'LANCOME-FDN-001', 150, FALSE, ARRAY['foundation','full-coverage','24hr','matte','lancome']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — SKINCARE: MOISTURISERS
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='la-mer'),
 (SELECT id FROM categories WHERE slug='moisturizers'),
 'Crème de la Mer Moisturising Cream',
 'la-mer-creme',
 'The legendary moisturiser born from a scientist''s quest to heal his own skin. La Mer''s Crème de la Mer is powered by the Miracle Broth™ — a proprietary fermented sea kelp formula that transforms the skin visibly over time. Rich, enveloping texture soothes, heals and restores. Used by supermodels, dermatologists and beauty connoisseurs for decades. A true luxury investment in your skin.',
 'The legendary moisturiser powered by Miracle Broth™',
 195.00, NULL, 'LMR-SKN-001', 80, TRUE, ARRAY['moisturizer','luxury','la-mer','healing','anti-aging','iconic']),

((SELECT id FROM brands WHERE slug='tatcha'),
 (SELECT id FROM categories WHERE slug='moisturizers'),
 'The Dewy Skin Cream',
 'tatcha-dewy-skin-cream',
 'Tatcha''s plushest, most indulgent moisturiser — inspired by the Japanese skincare ritual of preserving youthful, dewy skin. Formulated with Okinawa Red Algae, Japanese purple rice and hyaluronic acid for deep, lasting hydration that gives skin a healthy, bouncy, glass-skin finish. Plumps fine lines and restores radiance overnight.',
 'Japanese plush moisturiser for dewy glass skin',
 68.00, NULL, 'TATCHA-SKN-001', 100, TRUE, ARRAY['moisturizer','dewy','glass-skin','tatcha','japanese','plumping']),

((SELECT id FROM brands WHERE slug='drunk-elephant'),
 (SELECT id FROM categories WHERE slug='moisturizers'),
 'Lala Retro Whipped Cream',
 'drunk-elephant-lala-retro',
 'Drunk Elephant''s deeply nourishing, restorative moisturiser formulated with six African oils and a ceramide cocktail to firm, soften and replenish skin''s moisture barrier. The whipped, cloud-like texture melts into skin instantly for plump, smooth, radiant results. Free from the ''Suspicious 6'' irritants — clean, biocompatible and suitable for all skin types.',
 'Ceramide-rich whipped moisturiser with six African oils',
 64.00, NULL, 'DE-SKN-001', 110, TRUE, ARRAY['moisturizer','ceramide','clean','drunk-elephant','nourishing']),

((SELECT id FROM brands WHERE slug='charlotte-tilbury'),
 (SELECT id FROM categories WHERE slug='moisturizers'),
 'Magic Cream Moisturiser',
 'ct-magic-cream',
 'Charlotte Tilbury''s award-winning celebrity skincare secret — a rich, luxurious moisturiser that plumps, brightens and conditions skin for an instant healthy glow. Formulated with hyaluronic acid, vitamins C and E, and Charlotte''s exclusive anti-aging complex. Used on models backstage at every major fashion show.',
 'Celebrity''s secret — plumping, brightening luxury cream',
 105.00, 120.00, 'CT-SKN-001', 90, TRUE, ARRAY['moisturizer','luxury','anti-aging','celebrity','backstage','award-winning']),

((SELECT id FROM brands WHERE slug='armani-beauty'),
 (SELECT id FROM categories WHERE slug='moisturizers'),
 'Crema Nera Supreme Reviving Cream',
 'armani-crema-nera',
 'Inspired by the black volcanic sand of Stromboli, Armani''s most luxurious skincare creation. The Crema Nera Supreme uses Regenessence™ technology and black volcanic extract to regenerate, firm and deeply renew the complexion. Rich yet non-greasy texture for a revived, radiant appearance.',
 'Volcanic extract luxury reviving face cream',
 310.00, NULL, 'ARMANI-SKN-001', 40, FALSE, ARRAY['moisturizer','luxury','anti-aging','italian','volcanic','premium']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — SKINCARE: SERUMS
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='skinceuticals'),
 (SELECT id FROM categories WHERE slug='serums'),
 'C E Ferulic Antioxidant Serum',
 'skinceuticals-ce-ferulic',
 'The gold standard of vitamin C serums — clinically proven to neutralise free radicals and provide advanced environmental protection. The patented formula of 15% L-ascorbic acid, vitamin E and ferulic acid boosts the skin''s natural defences, fades hyperpigmentation and stimulates collagen synthesis for visibly firmer, brighter skin. Dermatologist''s first choice.',
 'The gold standard vitamin C serum — clinically proven',
 182.00, NULL, 'SC-SRM-001', 70, TRUE, ARRAY['serum','vitamin-c','antioxidant','brightening','anti-aging','clinical']),

((SELECT id FROM brands WHERE slug='tatcha'),
 (SELECT id FROM categories WHERE slug='serums'),
 'The Essence Plumping Skin Softener',
 'tatcha-the-essence',
 'Tatcha''s Japanese-inspired skin-softening essence that bridges the gap between toner and serum. Formulated with 98% concentration of HADASEI-3™ — a Japanese anti-aging complex of green tea, rice and algae — to boost skin''s radiance and improve the absorption of subsequent skincare. Skin visibly plumper, softer and more luminous.',
 'HADASEI-3™ plumping Japanese skin softener',
 95.00, NULL, 'TATCHA-SRM-001', 85, FALSE, ARRAY['serum','essence','japanese','plumping','tatcha','glow']),

((SELECT id FROM brands WHERE slug='drunk-elephant'),
 (SELECT id FROM categories WHERE slug='serums'),
 'T.L.C. Framboos Glycolic Night Serum',
 'drunk-elephant-tlc-framboos',
 'Drunk Elephant''s transformative AHA/BHA night serum with a potent 12% glycolic, tartaric, citric and salicylic acid blend. Resurfaces and refines skin overnight for visibly smoother, clearer and more even-toned skin by morning. Formulated with raspberry extract and horse chestnut to soothe and protect.',
 '12% AHA/BHA overnight resurfacing serum',
 90.00, NULL, 'DE-SRM-001', 95, TRUE, ARRAY['serum','aha','bha','glycolic','resurfacing','drunk-elephant','night']),

((SELECT id FROM brands WHERE slug='la-mer'),
 (SELECT id FROM categories WHERE slug='serums'),
 'The Brilliance Brightening Serum',
 'la-mer-brilliance-serum',
 'La Mer''s most targeted brightening treatment. Powered by the brand''s exclusive Miracle Broth™ and Fermented Brightening Complex, this daily serum visibly reduces the appearance of dark spots, uneven tone and dullness. After 4 weeks, skin looks noticeably more radiant and luminous with a deep, healthy glow.',
 'Miracle Broth™ brightening serum for deep luminosity',
 325.00, NULL, 'LMR-SRM-001', 45, FALSE, ARRAY['serum','brightening','la-mer','luxury','dark-spots','radiance']),

((SELECT id FROM brands WHERE slug='the-ordinary'),
 (SELECT id FROM categories WHERE slug='serums'),
 'Hyaluronic Acid 2% + B5',
 'the-ordinary-ha-b5',
 'The Ordinary''s most popular product worldwide — a multi-molecular hyaluronic acid formulation combined with vitamin B5 for multi-depth hydration at every layer of the skin. The lightweight serum instantly plumps and softens the appearance of fine lines with continued use. Science-backed efficacy at a fraction of the luxury price.',
 'Multi-depth hyaluronic acid plumping serum',
 12.00, NULL, 'TO-SRM-001', 500, TRUE, ARRAY['serum','hyaluronic-acid','hydrating','affordable','the-ordinary','bestseller']),

((SELECT id FROM brands WHERE slug='the-ordinary'),
 (SELECT id FROM categories WHERE slug='serums'),
 'Niacinamide 10% + Zinc 1%',
 'the-ordinary-niacinamide',
 'A high-strength vitamin and mineral blemish formula. Niacinamide (vitamin B3) at 10% concentration reduces the appearance of blemishes and congestion, regulates sebum activity and visibly minimises pore appearance. Combined with zinc for oil control. One of the most recommended serums by dermatologists worldwide.',
 '10% niacinamide + zinc for pores and blemishes',
 12.00, NULL, 'TO-SRM-002', 500, TRUE, ARRAY['serum','niacinamide','pores','blemish','affordable','bestseller','the-ordinary']),

((SELECT id FROM brands WHERE slug='charlotte-tilbury'),
 (SELECT id FROM categories WHERE slug='serums'),
 'Magic Serum Crystal Elixir',
 'ct-magic-serum',
 'Charlotte Tilbury''s bestselling serum that combines 9 skin-perfecting complex actives — including peptides, hyaluronic acid, niacinamide and Crystal Elixir — to target all signs of aging. Clinically tested to plump fine lines, brighten, firm and improve elasticity in 2 weeks. Wear alone or mix into foundation for a luminous, glass-skin base.',
 '9-complex anti-aging elixir — clinically proven in 2 weeks',
 85.00, NULL, 'CT-SRM-001', 120, FALSE, ARRAY['serum','anti-aging','peptides','charlotte-tilbury','luxury','brightening']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — SKINCARE: CLEANSERS & EYE CARE
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='tatcha'),
 (SELECT id FROM categories WHERE slug='cleansers'),
 'The Rice Wash Soft Cream Cleanser',
 'tatcha-rice-wash',
 'A gentle, softening cream cleanser inspired by the Japanese tradition of washing with rice water. Formulated with Tatcha''s HADASEI-3™ complex of green tea, rice and algae, this daily cleanser melts away impurities without stripping skin''s moisture barrier. Leaves skin velvety soft, balanced and glowing.',
 'Gentle rice water cream cleanser — HADASEI-3™',
 38.00, NULL, 'TATCHA-CLN-001', 130, FALSE, ARRAY['cleanser','gentle','rice','tatcha','japanese','cream']),

((SELECT id FROM brands WHERE slug='drunk-elephant'),
 (SELECT id FROM categories WHERE slug='cleansers'),
 'Beste No. 9 Jelly Cleanser',
 'drunk-elephant-beste-cleanser',
 'A luxuriously gentle gel-to-jelly cleanser that removes all traces of makeup, SPF and daily grime without over-cleansing or stripping skin. Free from the ''Suspicious 6'' and formulated with mild cleansing agents and glycerin for a deeply clean, perfectly balanced complexion. Suitable even for sensitive skin.',
 'Gel-to-jelly makeup-removing cleanser — ultra-gentle',
 34.00, NULL, 'DE-CLN-001', 150, FALSE, ARRAY['cleanser','gentle','gel','drunk-elephant','sensitive','makeup-removing']),

((SELECT id FROM brands WHERE slug='la-mer'),
 (SELECT id FROM categories WHERE slug='cleansers'),
 'The Cleansing Foam',
 'la-mer-cleansing-foam',
 'La Mer''s luxurious daily cleansing foam — infused with Miracle Broth™ to gently lift impurities while bathing skin in sea-powered nutrients. The creamy foam melts away makeup and environmental pollution without disturbing skin''s natural moisture. Skin is left soft, soothed and visibly luminous after every use.',
 'Miracle Broth™ luxury cleansing foam',
 90.00, NULL, 'LMR-CLN-001', 70, FALSE, ARRAY['cleanser','foam','la-mer','luxury','miracle-broth']),

((SELECT id FROM brands WHERE slug='la-mer'),
 (SELECT id FROM categories WHERE slug='eye-care'),
 'The Eye Concentrate',
 'la-mer-eye-concentrate',
 'La Mer''s most targeted eye treatment — a potent, silky concentrate powered by Miracle Broth™ to address all signs of eye aging. Visibly reduces the appearance of dark circles, puffiness and crow''s feet. The precision applicator massages treatment deep into the delicate orbital area for maximum absorption and efficacy.',
 'Miracle Broth™ eye concentrate — dark circles & lines',
 225.00, NULL, 'LMR-EYE-001', 55, FALSE, ARRAY['eye-cream','dark-circles','anti-aging','la-mer','luxury']),

((SELECT id FROM brands WHERE slug='tatcha'),
 (SELECT id FROM categories WHERE slug='eye-care'),
 'Kissu Lip Mask',
 'tatcha-kissu-eye-mask',
 'Tatcha''s intensely nourishing overnight eye treatment — peony-infused patches that hydrate and de-puff the eye area while you sleep. Formulated with Japanese peony extract and hyaluronic acid to visibly plump, brighten and smooth fine lines. Wake up to eyes that look refreshed, lifted and wide-awake.',
 'Overnight peony eye patches — de-puffing & brightening',
 59.00, NULL, 'TATCHA-EYE-001', 80, FALSE, ARRAY['eye-mask','patches','tatcha','de-puffing','overnight']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — FRAGRANCE
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='dior-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Miss Dior Blooming Bouquet EDP',
 'dior-miss-dior-blooming',
 'Dior''s most romantic feminine fragrance — a delicate bouquet of peony, rose and pink grapefruit with a soft musk base. Miss Dior Blooming Bouquet is an ode to freedom and feminine joy with a fresh, floral and playful character that blooms on the skin all day. The iconic bow-adorned bottle is inspired by Dior''s haute couture spirit.',
 'Romantic floral — peony, rose & pink grapefruit',
 132.00, NULL, 'DIOR-FRG-001', 90, TRUE, ARRAY['fragrance','floral','feminine','dior','romantic','iconic']),

((SELECT id FROM brands WHERE slug='ysl-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Libre Eau de Parfum',
 'ysl-libre-edp',
 'YSL''s most daring feminine fragrance — a bold statement of freedom and duality. Libre opens with aromatic lavender and clary sage essence, blooms into mandarin orange and jasmine, and dries down to a warm, captivating base of Madagascan vanilla and musks. The iconic glass bottle with YSL monogram is a collector''s piece.',
 'Bold, daring EDP — lavender, jasmine & vanilla',
 135.00, NULL, 'YSL-FRG-001', 100, TRUE, ARRAY['fragrance','floral','woody','ysl','feminine','iconic']),

((SELECT id FROM brands WHERE slug='ysl-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Black Opium Eau de Parfum',
 'ysl-black-opium',
 'The addictive night-time fragrance by YSL. Black Opium opens with a sparkling duet of pink pepper and pear, blooms into jasmine and orange blossom, then settles into a deep, addictive base of coffee, cedarwood and vanilla. Dark, bold and seductive — the perfect scent for going out after dark.',
 'Addictive dark floral — coffee, jasmine & vanilla',
 142.00, NULL, 'YSL-FRG-002', 85, TRUE, ARRAY['fragrance','oriental','dark','ysl','night','coffee','bestseller']),

((SELECT id FROM brands WHERE slug='chanel'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'N°5 Eau de Parfum',
 'chanel-n5-edp',
 'The world''s most famous perfume — Chanel N°5 remains the ultimate icon of femininity over 100 years after its creation. A luminous, abstract floral-aldehyde composition with top notes of aldehydes and neroli, a heart of rose, jasmine and iris, and a lingering base of vetiver, sandalwood and vanilla. Worn by Marilyn Monroe, among millions of other admirers.',
 'The world''s most iconic perfume — a century of legends',
 165.00, NULL, 'CHANEL-FRG-001', 75, TRUE, ARRAY['fragrance','iconic','chanel','floral','aldehyde','classic','luxury']),

((SELECT id FROM brands WHERE slug='chanel'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Chance Eau Tendre EDP',
 'chanel-chance-eau-tendre',
 'The softest, freshest expression in the Chance family — Chance Eau Tendre opens with grapefruit and quince, blooms into jasmine and iris, and settles into a delicate white musks and amber base. Fresh, feminine and spontaneous — bottled in Chanel''s iconic round bottle that represents luck and the unexpected.',
 'Fresh, feminine EDP — grapefruit, jasmine & iris',
 152.00, NULL, 'CHANEL-FRG-002', 70, FALSE, ARRAY['fragrance','fresh','floral','chanel','feminine','tender']),

((SELECT id FROM brands WHERE slug='tom-ford-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Black Orchid Eau de Parfum',
 'tomford-black-orchid',
 'Tom Ford''s most iconic, provocative fragrance — a rich, dark floral-oriental with black truffle, ylang-ylang, black orchid, lotus wood and dark chocolate. Black Orchid is simultaneously feminine and masculine, subtle and provocative — a scent that makes a lasting impression wherever you go. The dark lacquer bottle is unmistakably luxurious.',
 'Dark, seductive floral-oriental — black orchid & truffle',
 210.00, NULL, 'TF-FRG-001', 55, TRUE, ARRAY['fragrance','oriental','dark','tom-ford','unisex','luxury','orchid']),

((SELECT id FROM brands WHERE slug='byredo'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Gypsy Water Eau de Parfum',
 'byredo-gypsy-water',
 'Byredo''s most beloved cult fragrance — a romantic ode to Romani nomad culture. Gypsy Water opens with bergamot, lemon and pepper, blooms into juniper berries, pine needles and incense, and settles into a warm, earthy base of sandalwood, vanilla and amber. Understated, intellectual and deeply captivating.',
 'Cult nomadic EDP — bergamot, pine needles & sandalwood',
 295.00, NULL, 'BYREDO-FRG-001', 50, FALSE, ARRAY['fragrance','woody','cult','byredo','niche','unisex','vanilla']),

((SELECT id FROM brands WHERE slug='jo-malone'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Peony & Blush Suede Cologne',
 'jo-malone-peony-blush',
 'Jo Malone''s bestselling romantic floral — the lush, voluptuous bloom of peony paired with the luxury of blush suede. A bouquet of red apple, peony, jasmine and gillyflower rests on a base of cedarwood and blush suede. Designed to be layered with other Jo Malone scents for a personalised fragrance experience.',
 'Romantic peony & suede — Jo Malone''s bestseller',
 156.00, NULL, 'JM-FRG-001', 80, TRUE, ARRAY['fragrance','floral','romantic','jo-malone','peony','suede','bestseller']),

((SELECT id FROM brands WHERE slug='armani-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Sì Fiori Eau de Parfum',
 'armani-si-fiori',
 'Giorgio Armani''s most radiant expression of feminine freedom. Sì Fiori opens with a vibrant burst of Sorrento lemon, blooms into a luminous bouquet of jasmine and orange blossom, and dries down to a warm base of vanilla and musks. Bottled in Armani''s signature minimalist flacon with silver hardware — elegant and modern.',
 'Radiant feminine EDP — lemon, jasmine & vanilla musks',
 122.00, NULL, 'ARMANI-FRG-001', 85, FALSE, ARRAY['fragrance','floral','armani','feminine','citrus','jasmine']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCTS — TOOLS
-- ═════════════════════════════════════════════════════════════
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='charlotte-tilbury'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'Professional Brush Collection',
 'ct-brush-collection',
 'Charlotte Tilbury''s award-winning 5-piece professional brush collection — the exact tools used backstage at every major fashion show. Includes Face & Body Brush, Powder & Sculpt Brush, Eye Blending Brush, Eye Liner Brush and Complexion Brush. Ultra-soft, cruelty-free synthetic bristles for flawless blending and application.',
 '5-piece cruelty-free professional brush set',
 125.00, 145.00, 'CT-TOOL-001', 70, TRUE, ARRAY['brushes','professional','set','cruelty-free','charlotte-tilbury']),

((SELECT id FROM brands WHERE slug='mac'),
 (SELECT id FROM categories WHERE slug='brushes'),
 '168S Angled Contour Brush',
 'mac-168s-contour-brush',
 'MAC''s iconic angled contour brush — the professional''s tool of choice for sculpting, defining and highlighting. The uniquely angled bristle design perfectly fits the curve of the cheekbone for precise, buildable contour application. Used by MAC Artists globally for that signature sharp, defined look.',
 'Professional angled contour and sculpting brush',
 34.00, NULL, 'MAC-TOOL-001', 160, FALSE, ARRAY['brush','contour','mac','professional','angled']),

((SELECT id FROM brands WHERE slug='beautyblender'),
 (SELECT id FROM categories WHERE slug='devices'),
 'Original Beautyblender — 3 Pack',
 'beautyblender-3-pack',
 'The original makeup sponge that changed the beauty industry. The beautyblender''s unique egg shape and aqua-activated formula bounces product onto skin for a seamless, airbrushed finish that no brush can replicate. The 3-pack includes classic pink, designer colors and a travel-friendly carrying case. Reusable, washable and loved by makeup artists worldwide.',
 'Original egg sponge — airbrushed finish every time',
 38.00, NULL, 'BB-TOOL-001', 200, TRUE, ARRAY['sponge','blending','beautyblender','airbrushed','bestseller']),

((SELECT id FROM brands WHERE slug='foreo'),
 (SELECT id FROM categories WHERE slug='devices'),
 'LUNA 3 Facial Cleansing Device',
 'foreo-luna-3',
 'FOREO''s award-winning silicone facial cleansing device that removes 99.5% of dirt, oil and makeup residue in 60 seconds. The soft silicone T-Sonic™ pulsations deeply cleanse without spreading bacteria or irritating skin. 100× more hygienic than traditional cleansing brushes — waterproof, long-lasting and suitable for all skin types.',
 'Award-winning T-Sonic™ 60-second deep facial cleanse',
 219.00, 259.00, 'FOREO-TOOL-001', 65, TRUE, ARRAY['device','cleansing','foreo','sonic','silicone','award-winning','anti-aging']),

((SELECT id FROM brands WHERE slug='beautyblender'),
 (SELECT id FROM categories WHERE slug='devices'),
 'BOUNCE Airbrush Foundation System',
 'beautyblender-bounce-airbrush',
 'beautyblender''s most innovative product — a foundation applicator system that uses micro-air technology to bounce and blend liquid foundation for a true airbrushed finish without the machine. The specially designed applicator deposits foundation in thin, buildable layers for medium-to-full coverage that looks impossibly skin-like.',
 'Micro-air technology airbrushed foundation applicator',
 52.00, NULL, 'BB-TOOL-002', 85, FALSE, ARRAY['applicator','airbrushed','foundation','beautyblender','tech']),

((SELECT id FROM brands WHERE slug='tatcha'),
 (SELECT id FROM categories WHERE slug='devices'),
 'Violet-C Radiance Mask',
 'tatcha-violet-radiance-mask',
 'Tatcha''s weekly brightening treatment mask — a 2-in-1 exfoliant and vitamin C mask that reveals visibly brighter, smoother skin in 15 minutes. Powered by a blend of Japanese violet extract, AHAs and vitamin C to gently dissolve dead skin cells and deliver intense antioxidant brightness. Skin is left luminous, soft and dramatically more even-toned.',
 '2-in-1 AHA + vitamin C brightening treatment mask',
 75.00, NULL, 'TATCHA-TOOL-001', 90, FALSE, ARRAY['mask','brightening','vitamin-c','aha','tatcha','weekly-treatment']);

-- ═════════════════════════════════════════════════════════════
-- PRODUCT IMAGES  (carefully matched to each product)
-- ═════════════════════════════════════════════════════════════
INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES

-- LIPS
((SELECT id FROM products WHERE sku='CT-LIP-001'),    'https://images.unsplash.com/photo-1586495777744-4e6232bf4796?w=700&q=90',  'Charlotte Tilbury Matte Revolution Lipstick', TRUE, 1),
((SELECT id FROM products WHERE sku='YSL-LIP-001'),   'https://images.unsplash.com/photo-1599733589046-833baccbfc2e?w=700&q=90',  'YSL Rouge Pur Couture Bold Lipstick',         TRUE, 1),
((SELECT id FROM products WHERE sku='DIOR-LIP-001'),  'https://images.unsplash.com/photo-1631214503851-25e39b28ea05?w=700&q=90',  'Dior Rouge Forever Lipstick',                 TRUE, 1),
((SELECT id FROM products WHERE sku='MAC-LIP-001'),   'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=700&q=90',  'MAC Retro Matte Ruby Woo Lipstick',           TRUE, 1),
((SELECT id FROM products WHERE sku='FENTY-LIP-001'), 'https://images.unsplash.com/photo-1625166327861-7c6fbd66f41b?w=700&q=90',  'Fenty Beauty Poutsicle Lip Stain',            TRUE, 1),
((SELECT id FROM products WHERE sku='RB-LIP-001'),    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90',  'Rare Beauty Soft Pinch Tinted Lip Oil',       TRUE, 1),
((SELECT id FROM products WHERE sku='PGM-LIP-001'),   'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=700&q=90',    'Pat McGrath MatteTrance Lipstick',            TRUE, 1),
((SELECT id FROM products WHERE sku='CHANEL-LIP-001'),'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=700&q=90', 'Chanel Rouge Allure Velvet Lipstick',         TRUE, 1),
((SELECT id FROM products WHERE sku='ARMANI-LIP-001'),'https://images.unsplash.com/photo-1561972520-c6b65dd1b2f7?w=700&q=90',    'Armani Rouge d''Armani Matte Lipstick',       TRUE, 1),
((SELECT id FROM products WHERE sku='HG-LIP-001'),    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=700&q=90', 'Hourglass Confession Lipstick',               TRUE, 1),

-- EYES
((SELECT id FROM products WHERE sku='CT-EYE-001'),      'https://images.unsplash.com/photo-1583241475880-083f84372725?w=700&q=90', 'Charlotte Tilbury Golden Goddess Palette',    TRUE, 1),
((SELECT id FROM products WHERE sku='PGM-EYE-001'),     'https://images.unsplash.com/photo-1503236823255-152400b78af4?w=700&q=90', 'Pat McGrath Mothership IX Palette',           TRUE, 1),
((SELECT id FROM products WHERE sku='NARS-EYE-001'),    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=90', 'NARS Narsissist Wanted Eyeshadow Palette',    TRUE, 1),
((SELECT id FROM products WHERE sku='FENTY-EYE-001'),   'https://images.unsplash.com/photo-1526045612345-5ee39a2e9d16?w=700&q=90', 'Fenty Beauty Snap Shadows Palette',           TRUE, 1),
((SELECT id FROM products WHERE sku='DIOR-EYE-001'),    'https://images.unsplash.com/photo-1571781926291-c5e941e1f4bd?w=700&q=90', 'Dior Diorshow Iconic Overcurl Mascara',       TRUE, 1),
((SELECT id FROM products WHERE sku='MAC-EYE-001'),     'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&q=90', 'MAC Extended Play Gigablack Mascara',         TRUE, 1),
((SELECT id FROM products WHERE sku='LANCOME-EYE-001'), 'https://images.unsplash.com/photo-1571781926291-c5e941e1f4bd?w=700&q=90', 'Lancôme Monsieur Big Mascara',                TRUE, 1),
((SELECT id FROM products WHERE sku='CHANEL-EYE-001'),  'https://images.unsplash.com/photo-1617346800386-47f50f2e62da?w=700&q=90', 'Chanel Les 4 Ombres Rose Gabrielle',          TRUE, 1),
((SELECT id FROM products WHERE sku='HG-EYE-001'),      'https://images.unsplash.com/photo-1583241800698-e8ab01831983?w=700&q=90', 'Hourglass Curator Eyeshadow Palette',         TRUE, 1),

-- FACE
((SELECT id FROM products WHERE sku='FENTY-FDN-001'),   'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=700&q=90', 'Fenty Pro Filt''r Foundation',                TRUE, 1),
((SELECT id FROM products WHERE sku='ARMANI-FDN-001'),  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=90', 'Armani Luminous Silk Foundation',             TRUE, 1),
((SELECT id FROM products WHERE sku='CT-FACE-001'),     'https://images.unsplash.com/photo-1614869950218-0d56f0e30cd6?w=700&q=90', 'Charlotte Tilbury Flawless Filter',           TRUE, 1),
((SELECT id FROM products WHERE sku='NARS-FDN-001'),    'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=700&q=90', 'NARS Light Reflecting Foundation',            TRUE, 1),
((SELECT id FROM products WHERE sku='RB-FACE-001'),     'https://images.unsplash.com/photo-1571781565036-d3f759be73e4?w=700&q=90', 'Rare Beauty Soft Pinch Liquid Blush',         TRUE, 1),
((SELECT id FROM products WHERE sku='HG-FACE-001'),     'https://images.unsplash.com/photo-1597225244516-8b9a3a8b4a4a?w=700&q=90', 'Hourglass Ambient Lighting Powder',           TRUE, 1),
((SELECT id FROM products WHERE sku='MAC-FDN-001'),     'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=700&q=90', 'MAC Studio Fix Fluid Foundation',             TRUE, 1),
((SELECT id FROM products WHERE sku='LANCOME-FDN-001'), 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=90', 'Lancôme Teint Idole Ultra Wear Foundation',   TRUE, 1),

-- SKINCARE — MOISTURISERS
((SELECT id FROM products WHERE sku='LMR-SKN-001'),    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=700&q=90',  'La Mer Crème de la Mer',                      TRUE, 1),
((SELECT id FROM products WHERE sku='TATCHA-SKN-001'), 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&q=90',    'Tatcha The Dewy Skin Cream',                  TRUE, 1),
((SELECT id FROM products WHERE sku='DE-SKN-001'),     'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=700&q=90',    'Drunk Elephant Lala Retro Whipped Cream',     TRUE, 1),
((SELECT id FROM products WHERE sku='CT-SKN-001'),     'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90', 'Charlotte Tilbury Magic Cream',               TRUE, 1),
((SELECT id FROM products WHERE sku='ARMANI-SKN-001'), 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=90', 'Armani Crema Nera Supreme',                   TRUE, 1),

-- SKINCARE — SERUMS
((SELECT id FROM products WHERE sku='SC-SRM-001'),     'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&q=90',  'Skinceuticals C E Ferulic Serum',             TRUE, 1),
((SELECT id FROM products WHERE sku='TATCHA-SRM-001'), 'https://images.unsplash.com/photo-1567721913486-6585f069b3c9?w=700&q=90',  'Tatcha The Essence',                          TRUE, 1),
((SELECT id FROM products WHERE sku='DE-SRM-001'),     'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=700&q=90',  'Drunk Elephant T.L.C. Framboos Serum',        TRUE, 1),
((SELECT id FROM products WHERE sku='LMR-SRM-001'),    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=700&q=90',  'La Mer Brilliance Brightening Serum',         TRUE, 1),
((SELECT id FROM products WHERE sku='TO-SRM-001'),     'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=90',  'The Ordinary Hyaluronic Acid 2% + B5',        TRUE, 1),
((SELECT id FROM products WHERE sku='TO-SRM-002'),     'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=700&q=90',  'The Ordinary Niacinamide 10% + Zinc 1%',      TRUE, 1),
((SELECT id FROM products WHERE sku='CT-SRM-001'),     'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&q=90',  'Charlotte Tilbury Magic Serum Crystal Elixir', TRUE, 1),

-- SKINCARE — CLEANSERS & EYE CARE
((SELECT id FROM products WHERE sku='TATCHA-CLN-001'), 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=90',    'Tatcha The Rice Wash',                        TRUE, 1),
((SELECT id FROM products WHERE sku='DE-CLN-001'),     'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&q=90',    'Drunk Elephant Beste Cleanser',               TRUE, 1),
((SELECT id FROM products WHERE sku='LMR-CLN-001'),    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=700&q=90',  'La Mer The Cleansing Foam',                   TRUE, 1),
((SELECT id FROM products WHERE sku='LMR-EYE-001'),    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=90',  'La Mer The Eye Concentrate',                  TRUE, 1),
((SELECT id FROM products WHERE sku='TATCHA-EYE-001'), 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90', 'Tatcha Kissu Eye Mask',                       TRUE, 1),

-- FRAGRANCE
((SELECT id FROM products WHERE sku='DIOR-FRG-001'),   'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=700&q=90',  'Dior Miss Dior Blooming Bouquet',             TRUE, 1),
((SELECT id FROM products WHERE sku='YSL-FRG-001'),    'https://images.unsplash.com/photo-1541643600914-78b084683702?w=700&q=90',  'YSL Libre Eau de Parfum',                     TRUE, 1),
((SELECT id FROM products WHERE sku='YSL-FRG-002'),    'https://images.unsplash.com/photo-1547887538-047f5d4b6a2c?w=700&q=90',    'YSL Black Opium EDP',                         TRUE, 1),
((SELECT id FROM products WHERE sku='CHANEL-FRG-001'), 'https://images.unsplash.com/photo-1615875221249-7ec7b2b21c4f?w=700&q=90',  'Chanel N°5 Eau de Parfum',                    TRUE, 1),
((SELECT id FROM products WHERE sku='CHANEL-FRG-002'), 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=700&q=90',  'Chanel Chance Eau Tendre',                    TRUE, 1),
((SELECT id FROM products WHERE sku='TF-FRG-001'),     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=90',    'Tom Ford Black Orchid EDP',                   TRUE, 1),
((SELECT id FROM products WHERE sku='BYREDO-FRG-001'), 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&q=90',  'Byredo Gypsy Water EDP',                      TRUE, 1),
((SELECT id FROM products WHERE sku='JM-FRG-001'),     'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=700&q=90',  'Jo Malone Peony & Blush Suede',               TRUE, 1),
((SELECT id FROM products WHERE sku='ARMANI-FRG-001'), 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=700&q=90',  'Armani Sì Fiori EDP',                         TRUE, 1),

-- TOOLS
((SELECT id FROM products WHERE sku='CT-TOOL-001'),    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90',  'Charlotte Tilbury Professional Brush Collection', TRUE, 1),
((SELECT id FROM products WHERE sku='MAC-TOOL-001'),   'https://images.unsplash.com/photo-1562887245-a1e66e05cf95?w=700&q=90',    'MAC 168S Angled Contour Brush',               TRUE, 1),
((SELECT id FROM products WHERE sku='BB-TOOL-001'),    'https://images.unsplash.com/photo-1531895861208-cf5571d36b9e?w=700&q=90',  'Beautyblender Original 3 Pack',               TRUE, 1),
((SELECT id FROM products WHERE sku='FOREO-TOOL-001'), 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=90',  'FOREO LUNA 3 Cleansing Device',               TRUE, 1),
((SELECT id FROM products WHERE sku='BB-TOOL-002'),    'https://images.unsplash.com/photo-1531895861208-cf5571d36b9e?w=700&q=90',  'Beautyblender BOUNCE Airbrush System',        TRUE, 1),
((SELECT id FROM products WHERE sku='TATCHA-TOOL-001'),'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=90',  'Tatcha Violet-C Radiance Mask',               TRUE, 1);

-- ═════════════════════════════════════════════════════════════
-- SHADE VARIANTS — Lip products
-- ═════════════════════════════════════════════════════════════
INSERT INTO product_variants (product_id, name, shade_hex, price_modifier, stock_quantity, sku, is_active, sort_order) VALUES
-- Charlotte Tilbury Matte Revolution
((SELECT id FROM products WHERE sku='CT-LIP-001'), 'Pillow Talk',      '#D4808E', 0, 80, 'CT-LIP-001-PT',  TRUE, 1),
((SELECT id FROM products WHERE sku='CT-LIP-001'), 'Walk of Shame',    '#C41E3A', 0, 60, 'CT-LIP-001-WS',  TRUE, 2),
((SELECT id FROM products WHERE sku='CT-LIP-001'), 'Bond Girl',        '#B07080', 0, 55, 'CT-LIP-001-BG',  TRUE, 3),
((SELECT id FROM products WHERE sku='CT-LIP-001'), 'So Marilyn',       '#CC2244', 0, 50, 'CT-LIP-001-SM',  TRUE, 4),
((SELECT id FROM products WHERE sku='CT-LIP-001'), 'Lost Cherry',      '#8B1A4A', 0, 45, 'CT-LIP-001-LC',  TRUE, 5),
-- YSL Rouge Pur Couture Bold
((SELECT id FROM products WHERE sku='YSL-LIP-001'), 'Le Orange',       '#E8501A', 0, 60, 'YSL-LIP-001-OR', TRUE, 1),
((SELECT id FROM products WHERE sku='YSL-LIP-001'), 'Nu Inattendu',    '#C8906A', 0, 70, 'YSL-LIP-001-NU', TRUE, 2),
((SELECT id FROM products WHERE sku='YSL-LIP-001'), 'Rouge Vermillon', '#CC2211', 0, 65, 'YSL-LIP-001-RV', TRUE, 3),
((SELECT id FROM products WHERE sku='YSL-LIP-001'), 'Oxblood',         '#6B1A22', 0, 50, 'YSL-LIP-001-OB', TRUE, 4),
-- Dior Rouge Forever
((SELECT id FROM products WHERE sku='DIOR-LIP-001'), 'Dior 999',       '#CC1122', 0, 70, 'DIOR-LIP-001-999', TRUE, 1),
((SELECT id FROM products WHERE sku='DIOR-LIP-001'), 'Dior Rose',      '#D4698A', 0, 65, 'DIOR-LIP-001-RS',  TRUE, 2),
((SELECT id FROM products WHERE sku='DIOR-LIP-001'), 'Nude Look',      '#C89060', 0, 60, 'DIOR-LIP-001-NL',  TRUE, 3),
((SELECT id FROM products WHERE sku='DIOR-LIP-001'), 'Cruella',        '#8B0020', 0, 40, 'DIOR-LIP-001-CR',  TRUE, 4),
-- MAC Ruby Woo
((SELECT id FROM products WHERE sku='MAC-LIP-001'), 'Ruby Woo',        '#CC1133', 0, 120, 'MAC-LIP-001-RW',  TRUE, 1),
((SELECT id FROM products WHERE sku='MAC-LIP-001'), 'Velvet Teddy',    '#C09070', 0, 100, 'MAC-LIP-001-VT',  TRUE, 2),
((SELECT id FROM products WHERE sku='MAC-LIP-001'), 'Diva',            '#6B1A2A', 0, 80,  'MAC-LIP-001-DV',  TRUE, 3),
((SELECT id FROM products WHERE sku='MAC-LIP-001'), 'Taupe',           '#B09080', 0, 90,  'MAC-LIP-001-TP',  TRUE, 4),
-- Fenty Poutsicle
((SELECT id FROM products WHERE sku='FENTY-LIP-001'), 'Fenty Glow',    '#E09070', 0, 90, 'FENTY-LIP-001-FG', TRUE, 1),
((SELECT id FROM products WHERE sku='FENTY-LIP-001'), 'Cherry Drip',   '#B83040', 0, 80, 'FENTY-LIP-001-CD', TRUE, 2),
((SELECT id FROM products WHERE sku='FENTY-LIP-001'), 'Peach Bum',     '#E0A080', 0, 85, 'FENTY-LIP-001-PB', TRUE, 3),
-- Rare Beauty Lip Oil
((SELECT id FROM products WHERE sku='RB-LIP-001'), 'Encourage',        '#F0A090', 0, 110, 'RB-LIP-001-EN', TRUE, 1),
((SELECT id FROM products WHERE sku='RB-LIP-001'), 'Intuition',        '#D4608A', 0, 100, 'RB-LIP-001-IN', TRUE, 2),
((SELECT id FROM products WHERE sku='RB-LIP-001'), 'Together',         '#E8C080', 0, 90,  'RB-LIP-001-TG', TRUE, 3);

-- ═════════════════════════════════════════════════════════════
-- REVIEWS
-- ═════════════════════════════════════════════════════════════
INSERT INTO reviews (product_id, rating, title, body, is_verified_purchase, helpful_count) VALUES

((SELECT id FROM products WHERE sku='CT-LIP-001'), 5,
 'Pillow Talk is life-changing',
 'I have repurchased this at least 8 times. The colour is genuinely flattering on every skin tone I have seen it on — a dusty rose-pink that just makes lips look perfect. The formula lasts all day without drying and the packaging is beautiful. Worth every penny.',
 TRUE, 312),

((SELECT id FROM products WHERE sku='CT-LIP-001'), 4,
 'Beautiful but slightly drying after hours',
 'Love the pigmentation and the range of shades available. Does feel slightly drying after 6+ hours but stays looking pristine. Apply a lip balm underneath and it''s perfect. Walk of Shame is my personal favourite shade.',
 TRUE, 145),

((SELECT id FROM products WHERE sku='FENTY-FDN-001'), 5,
 'Finally a brand that ACTUALLY has my shade',
 'As a deep-skinned woman I have been dismissed by foundations my whole life. Fenty''s 490N is a perfect match with no ashy undertone. Full coverage, doesn''t oxidise in photos and lasts all day. Rihanna genuinely changed beauty with this launch.',
 TRUE, 489),

((SELECT id FROM products WHERE sku='FENTY-FDN-001'), 4,
 'Best formula, slight flashback in photos',
 'The range is unmatched and the formula is incredible for daily wear. Only gives slight flashback under flash photography. Otherwise my everyday foundation that I recommend to everyone.',
 TRUE, 167),

((SELECT id FROM products WHERE sku='ARMANI-FDN-001'), 5,
 'I understand the hype now',
 'I resisted buying the Armani Luminous Silk for years because of the price. When I finally tried it I genuinely understood why it has won every award. The finish is extraordinary — you look like yourself but a better, more luminous version. Nothing else comes close.',
 TRUE, 256),

((SELECT id FROM products WHERE sku='RB-FACE-001'), 5,
 'Two drops is genuinely all you need',
 'I was sceptical but two tiny drops of this blush blended out gives the most natural, flushed look I have ever achieved. It lasts my full 12-hour workday without touching up. I''m on my fourth bottle of Flushed — the peachy-coral shade is perfect.',
 TRUE, 378),

((SELECT id FROM products WHERE sku='LMR-SKN-001'), 5,
 'Worth every single pound',
 'Yes the price is significant. But after 4 weeks my skin is genuinely transformed. Fine lines visibly reduced, my complexion glows and people are asking if I''ve had something done. Apply at night with the patting ritual and wake up to completely different skin.',
 TRUE, 234),

((SELECT id FROM products WHERE sku='SC-SRM-001'), 5,
 'The gold standard — nothing else compares',
 'I have tried every vitamin C serum at every price point. Nothing comes close to CE Ferulic. After two months dark spots have genuinely faded, my skin texture is dramatically smoother and the firmness improvement is visible. A permanent part of my morning routine.',
 TRUE, 312),

((SELECT id FROM products WHERE sku='TO-SRM-001'), 5,
 'Why would you spend more than this',
 'The Ordinary HA is exactly what it claims to be. Works immediately to plump skin and smooth fine lines. I mix a few drops into my moisturiser every morning. The fact that it costs £5 while doing what £100 serums promise is almost insulting to the beauty industry.',
 TRUE, 445),

((SELECT id FROM products WHERE sku='YSL-FRG-002'), 5,
 'Everyone asks what I''m wearing',
 'Black Opium is the most complimented fragrance I own. It''s dark, warm and addictive without being overwhelming. The coffee note in the heart is unexpected and beautiful. I wear it every evening and get stopped regularly by strangers asking what it is.',
 TRUE, 189),

((SELECT id FROM products WHERE sku='CHANEL-FRG-001'), 5,
 'A century old and still the greatest',
 'I inherited my grandmother''s bottle of Chanel No5 and it made me understand why some things are considered timeless. I now wear it every day. The aldehydic opening is polarising but give it 10 minutes and the rose-jasmine heart is incomparably beautiful.',
 TRUE, 267),

((SELECT id FROM products WHERE sku='PGM-EYE-001'), 5,
 'The finest eyeshadow in the world',
 'I bought the Mothership IX on a whim and immediately understood why Pat McGrath is considered a genius. The pigmentation is unlike anything else — one stroke deposits a full, rich colour. The glitters are blindingly beautiful. Absolutely worth the investment.',
 TRUE, 198),

((SELECT id FROM products WHERE sku='FOREO-TOOL-001'), 5,
 'My skin has never looked better',
 'I was sceptical about the FOREO but after one month of using it every morning my pores look tighter, my skin is noticeably smoother and my moisturiser seems to absorb better. The silicone is so much more hygienic than bristle brushes. Won''t go back.',
 TRUE, 156),

((SELECT id FROM products WHERE sku='BB-TOOL-001'), 5,
 'I finally understand why everyone owns one',
 'Switched from a brush to the beautyblender and the difference is immediate. Foundation blends seamlessly with zero streaks and the finish genuinely looks like skin rather than makeup. Essential purchase for anyone wearing foundation.',
 TRUE, 334),

((SELECT id FROM products WHERE sku='TATCHA-SKN-001'), 5,
 'Glass skin is real and I have it',
 'The Dewy Skin Cream genuinely gives the bouncy, glass-skin texture I kept seeing on Korean skincare influencers. After two weeks my skin holds moisture through the whole day and has a healthy internal glow. Expensive but my skin has never looked like this before.',
 TRUE, 145);
