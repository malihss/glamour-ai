-- Fix product images: assign unique, category-appropriate photos to each product
-- Run: psql glamour_ai -f fix_images.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- BRUSHES — distribute among 3 distinct brush photos
-- Brush sets:   1522335789203-aabd1fc54bc9
-- Single brush: 1562887245-a1e66e05cf95
-- Eye/blending: 1571781926291-c5e941e1f4bd (eyeshadow+brush close-up)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE product_images SET url='https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'bobbi-classic-brush-collection','sigma-complete-kit-12','rt-everyday-essentials',
    'tomford-eye-brush-set','rt-eye-shade-blend-set','itc-heavenly-luxe-8pc',
    'morphe-jaclyn-hill-vault','ct-brush-collection'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1571781926291-c5e941e1f4bd?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'mac-217s-blending','sigma-e25-blending','ct-eye-blend-brush',
    'ud-good-karma-brush','morphe-m330-fluff','rt-eye-shade-blend-set'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'mac-168s-contour-brush','mac-170-slant-brush','ct-powder-sculpt-brush',
    'sigma-f35-highlighter','sigma-f80-kabuki','itc-heavenly-luxe-buffer',
    'morphe-m439-buffer','bobbi-face-blender-brush','rt-expert-face-brush'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1625166327861-7c6fbd66f41b?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('mac-316-lip-brush','sigma-l05-lip-brush','tomford-powder-brush-01')
) AND is_primary=true;

-- ─────────────────────────────────────────────────────────────────────────────
-- ACCESSORIES — eyelash curlers / tweezers should NOT use brush image
-- Use beauty tools flat-lay: 1512496015851-a90fb38ba796
-- Sponges keep their own image
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE product_images SET url='https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'tweezerman-slant','shiseido-eyelash-curler','ct-mesh-eyelash-curler','shu-uemura-s-curler'
  )
) AND is_primary=true;

-- Brush cleaning palette → keep brush-set image
UPDATE product_images SET url='https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug = 'rt-brush-cleansing-palette'
) AND is_primary=true;

-- ─────────────────────────────────────────────────────────────────────────────
-- FRAGRANCES — assign bottle images matching brand/gender aesthetic
-- ─────────────────────────────────────────────────────────────────────────────

-- Feminine / Floral (light pink/floral bottles)
UPDATE product_images SET url='https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'chanel-coco-mademoiselle','chanel-chance-eau-tendre','viktor-rolf-flowerbomb',
    'gucci-bloom-edp','prada-candy-edp','lancome-idole-edp',
    'versace-bright-crystal-edt','chanel-chance-tendre-edt','marc-jacobs-daisy-edt',
    'dg-light-blue-edt','mon-guerlain-edp'
  )
) AND is_primary=true;

-- Classic / Iconic (clear/gold bottles — Chanel No.5 style)
UPDATE product_images SET url='https://images.unsplash.com/photo-1615875221249-7ec7b2b21c4f?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'chanel-no5-edp','chanel-n5-edp'
  )
) AND is_primary=true;

-- Tall elegant / golden
UPDATE product_images SET url='https://images.unsplash.com/photo-1541643600914-78b084683702?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'dior-jadore-edp','ysl-libre-edp','hermes-twilly-edp','lancome-la-vie-est-belle'
  )
) AND is_primary=true;

-- Floral/romantic pink
UPDATE product_images SET url='https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'dior-miss-dior-edp','dior-miss-dior-blooming','marc-jacobs-daisy-edt',
    'mm-replica-lazy-sunday','guerlain-mon-guerlain'
  )
) AND is_primary=true;

-- Elegant / modern (light angular bottle)
UPDATE product_images SET url='https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'valentino-donna-born-roma','armani-si-fiori','burberry-her-edp',
    'ysl-mon-paris'
  )
) AND is_primary=true;

-- Dark / intense / masculine
UPDATE product_images SET url='https://images.unsplash.com/photo-1547887538-047f5d4b6a2c?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'ysl-black-opium','ysl-black-opium-edp2','mugler-angel-edp',
    'tomford-lost-cherry','dior-sauvage-edt','hermes-h24-edt',
    'versace-eros-edt','dg-the-one-edp'
  )
) AND is_primary=true;

-- Very dark / noir masculine
UPDATE product_images SET url='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'tomford-black-orchid','tomford-black-orchid-edp2','dior-homme-intense',
    'carolina-herrera-good-girl','gucci-guilty-edt','ysl-y-men-edp'
  )
) AND is_primary=true;

-- Tobacco Vanille / warm/amber
UPDATE product_images SET url='https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'tomford-tobacco-vanille','chanel-bleu-de-chanel','armani-acqua-di-gio',
    'creed-aventus-edp','creed-silver-mountain-water','le-labo-santal-33',
    'byredo-bal-dafrique','byredo-gypsy-water','ysl-y-men-edp',
    'mm-replica-by-fireplace'
  )
) AND is_primary=true;

-- Jo Malone (minimal angular bottle)
UPDATE product_images SET url='https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'jo-malone-lime-basil','jo-malone-peony-blush-suede','jo-malone-wood-sage',
    'jo-malone-peony-blush','diptyque-do-son-edt','armani-si-edp-new'
  )
) AND is_primary=true;

-- ─────────────────────────────────────────────────────────────────────────────
-- MAKEUP — ensure correct category images
-- ─────────────────────────────────────────────────────────────────────────────

-- Foundations → natural base/skin texture
UPDATE product_images SET url='https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'armani-luminous-silk','mac-studio-fix-fluid','lancome-teint-idole'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'fenty-pro-filtr-foundation','nars-light-reflecting-foundation','nars-natural-radiant-foundation'
  )
) AND is_primary=true;

-- Concealers
UPDATE product_images SET url='https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'nars-radiant-creamy-concealer','tarte-shape-tape-concealer',
    'ct-magic-away-concealer','ud-naked-skin-concealer'
  )
) AND is_primary=true;

-- Eyeshadow palettes — keep variety, ensure no duplicates
UPDATE product_images SET url='https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'ct-luxury-palette-golden','ct-luxury-pillow-talk','mac-smoky-eye-palette',
    'nd-mini-gold-palette','hourglass-curator-palette'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1571781926291-c5e941e1f4bd?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'pgm-mothership-i','pgm-mothership-ix','ud-naked3-palette',
    'nars-narsissist-wanted','fenty-snap-shadows'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1625166327861-7c6fbd66f41b?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'huda-rose-gold-palette','toofaced-sweet-peach','chanel-les-4-ombres-rose'
  )
) AND is_primary=true;

-- Mascaras — dark close-up eye
UPDATE product_images SET url='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'toofaced-better-than-sex','dior-diorshow-overcurl','lancome-hypnose-drama',
    'ysl-mascara-volume-faux-cils','mac-extended-play-mascara',
    'ct-pillow-talk-mascara','dior-diorshow-pump','lancome-monsieur-big',
    'maybelline-sky-high'
  )
) AND is_primary=true;

-- Eyeliners → eye liner close-up
UPDATE product_images SET url='https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'ud-247-glide-on-pencil','mac-fluidline-gel-liner','stila-stay-all-day-liner',
    'lancome-le-stylo-eyeliner'
  )
) AND is_primary=true;

-- Brow products
UPDATE product_images SET url='https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'abh-brow-wiz','benefit-precisely-brow','ct-brow-lift','benefit-gimme-brow'
  )
) AND is_primary=true;

-- Blush / bronzer / highlighter
UPDATE product_images SET url='https://images.unsplash.com/photo-1597225244516-8b9a3a8b4a4a?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'ct-cheek-to-chic-pillow-talk','ct-filmstar-bronze-glow',
    'benefit-hoola-bronzer','nars-orgasm-blush','rare-soft-pinch-blush',
    'becca-shimmering-skin-perfector','fenty-killawatt-highlighter',
    'hourglass-ambient-lighting-powder'
  )
) AND is_primary=true;

-- Primers / setting products
UPDATE product_images SET url='https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'smashbox-photo-finish-primer','ct-magic-primer','ct-flawless-filter',
    'ud-all-nighter-spray','laura-mercier-translucent-powder'
  )
) AND is_primary=true;

-- Lipsticks — keep variety across lipstick products
UPDATE product_images SET url='https://images.unsplash.com/photo-1614875555888-6b9b5a54c32d?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'dior-rouge-dior-couture','dior-rouge-forever','chanel-rouge-allure-velvet'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('mac-ruby-woo','mac-ruby-woo-retro')
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1599733589046-833baccbfc2e?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'nars-audacious-lipstick','ysl-rouge-pur-couture-bold','ysl-rouge-pur-couture-bold2'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1571875257727-256c39da42af?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'givenchy-le-rouge-velvet','armani-rouge-matte'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('pgm-mattetrance')
) AND is_primary=true;

-- Lip stains / oils
UPDATE product_images SET url='https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'fenty-poutsicle-lip-stain','fenty-stunna-lip-paint','rare-soft-pinch-lip-oil'
  )
) AND is_primary=true;

-- ─────────────────────────────────────────────────────────────────────────────
-- SKINCARE
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE product_images SET url='https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('drunk-elephant-beste-cleanser')
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('la-mer-cleansing-foam')
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('tatcha-rice-wash')
) AND is_primary=true;

-- Serums — gradient close-ups / pipette shots
UPDATE product_images SET url='https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'skinceuticals-ce-ferulic','ct-magic-serum','la-mer-brilliance-serum'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'the-ordinary-ha-b5','the-ordinary-niacinamide'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'drunk-elephant-tlc-framboos','tatcha-the-essence','tatcha-violet-radiance-mask'
  )
) AND is_primary=true;

-- Moisturisers
UPDATE product_images SET url='https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('la-mer-creme')
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('drunk-elephant-lala-retro')
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('tatcha-dewy-skin-cream')
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('armani-crema-nera','ct-magic-cream')
) AND is_primary=true;

-- Eye care
UPDATE product_images SET url='https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('tatcha-kissu-eye-mask','la-mer-eye-concentrate')
) AND is_primary=true;

-- ─────────────────────────────────────────────────────────────────────────────
-- DEVICES — skincare devices
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE product_images SET url='https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'foreo-luna-3','foreo-luna-4','clarisonic-mia-smart'
  )
) AND is_primary=true;

UPDATE product_images SET url='https://images.unsplash.com/photo-1531895861208-cf5571d36b9e?w=700&q=90'
WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'beautyblender-3-pack','beautyblender-bounce-airbrush'
  )
) AND is_primary=true;
