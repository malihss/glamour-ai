-- Fragrance & Tools expansion — adds 20 fragrances and 15 tools
-- Run: psql $DATABASE_URL -f database/seeds/fragrance_tools.sql
-- Safe to run once; uses ON CONFLICT to skip duplicates.

-- ── NEW BRANDS ─────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, description, country) VALUES
  ('Tom Ford',             'tom-ford',         'Iconic luxury fashion and beauty',         'USA'),
  ('Maison Margiela',      'maison-margiela',   'Conceptual French luxury fragrance',       'France'),
  ('Givenchy Beauty',      'givenchy-beauty',   'Parisian haute couture beauty',            'France'),
  ('Prada Beauty',         'prada-beauty',      'Italian luxury fragrance and beauty',      'Italy'),
  ('Guerlain',             'guerlain',          'Iconic French perfumer since 1828',        'France'),
  ('Hermès',               'hermes',            'Iconic French luxury goods house',         'France'),
  ('Mugler',               'mugler',            'Bold French fragrance house',              'France'),
  ('Lancôme',              'lancome',           'Iconic French luxury beauty',              'France'),
  ('Giorgio Armani Beauty','armani-beauty',     'Italian luxury fragrance and beauty',      'Italy'),
  ('Versace',              'versace',           'Italian luxury fragrance',                 'Italy'),
  ('Dolce & Gabbana',      'dolce-gabbana',     'Italian luxury fashion and beauty',        'Italy'),
  ('Burberry Beauty',      'burberry-beauty',   'British luxury fragrance',                 'UK'),
  ('Valentino Beauty',     'valentino-beauty',  'Italian luxury fragrance',                 'Italy'),
  ('Real Techniques',      'real-techniques',   'Professional makeup brushes',              'USA'),
  ('Sigma Beauty',         'sigma-beauty',      'Professional makeup tools',                'USA'),
  ('ZOEVA',                'zoeva',             'German makeup brush artisans',             'Germany'),
  ('IT Cosmetics',         'it-cosmetics',      'Prestige beauty tools and cosmetics',      'USA'),
  ('NuFACE',               'nuface',            'FDA-cleared anti-aging devices',           'USA'),
  ('PMD Beauty',           'pmd-beauty',        'Advanced beauty devices',                  'USA'),
  ('Elemis',               'elemis',            'British luxury spa skincare and tools',    'UK')
ON CONFLICT (slug) DO NOTHING;

-- ── FRAGRANCES (20 products) ────────────────────────────────────────────────
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_active, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='tom-ford'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Black Orchid Eau de Parfum', 'tom-ford-black-orchid-edp',
 'A luxurious and sensual fragrance of rich, dark accords. Black truffle and dark florals emerge from patchouli and incense, with a dry down of black orchid, vanilla, and sandalwood — utterly magnetic and impossible to ignore.',
 'Dark sensual EDP — truffle, black orchid, patchouli',
 215.00, NULL, 'TF-FRG-001', 50, TRUE, TRUE, ARRAY['fragrance','dark','oriental','luxury','unisex']),

((SELECT id FROM brands WHERE slug='tom-ford'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Lost Cherry Eau de Parfum', 'tom-ford-lost-cherry-edp',
 'A seductive, heady fragrance blending sweet black cherry, kirsch and almond with dark rose and Turkish rose. Rests on tonka bean, Peru balsam and vetiver for a bold, sophisticated dry-down.',
 'Bold cherry-rose EDP — kirsch, dark rose, tonka bean',
 350.00, NULL, 'TF-FRG-002', 35, TRUE, TRUE, ARRAY['fragrance','cherry','sweet','luxury','bold']),

((SELECT id FROM brands WHERE slug='maison-margiela'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Replica Jazz Club', 'mmrg-jazz-club-edt',
 'An olfactory reconstruction of a jazz club at night. Pink pepper, vetiver, tobacco leaf, vanilla and musk conjure the late-night haze of smooth drinks and live music — warm, smoky and deeply evocative.',
 'Jazz club atmosphere — tobacco, vanilla, vetiver',
 185.00, NULL, 'MM-FRG-001', 45, TRUE, TRUE, ARRAY['fragrance','tobacco','vanilla','unisex','artisan']),

((SELECT id FROM brands WHERE slug='maison-margiela'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Replica By The Fireplace', 'mmrg-by-the-fireplace',
 'The warm glow of an autumn evening by a crackling fire. Chestnut, guaiac wood and vanilla create an enveloping, intimate warmth that feels like the ultimate winter comfort in a bottle.',
 'Fireside warmth — chestnut, guaiac wood, vanilla',
 185.00, NULL, 'MM-FRG-002', 40, TRUE, FALSE, ARRAY['fragrance','warm','vanilla','woody','artisan']),

((SELECT id FROM brands WHERE slug='givenchy-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'L''Interdit Eau de Parfum', 'givenchy-linterdit-edp',
 'Originally created for Audrey Hepburn, reborn as a daring white floral. Orange blossom and tuberose collide with dark patchouli and vetiver in a fragrance of forbidden pleasures and irresistible mystery.',
 'Forbidden floral EDP — orange blossom, tuberose, vetiver',
 145.00, NULL, 'GIV-FRG-001', 55, TRUE, TRUE, ARRAY['fragrance','floral','white-floral','mystery','feminine']),

((SELECT id FROM brands WHERE slug='prada-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Paradoxe Eau de Parfum', 'prada-paradoxe-edp',
 'Thousands of jasmine petals extracted in three distinct ways reveal musky, velvety and dry facets. Ambery sandalwood and white musk add depth to this luminous, paradoxically multifaceted floral.',
 'Modern jasmine EDP — triple jasmine extraction, sandalwood',
 165.00, NULL, 'PRA-FRG-001', 48, TRUE, FALSE, ARRAY['fragrance','floral','jasmine','modern','feminine']),

((SELECT id FROM brands WHERE slug='guerlain'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Mon Guerlain Eau de Parfum', 'guerlain-mon-edp',
 'A French lavender fragrance of ethereal beauty. Lavender from Provence is softened by Australian sandalwood, Tahitian vanilla orchid and tonka bean, creating a modern floral woody of pure radiance.',
 'Lavender-vanilla EDP — Provence lavender, sandalwood',
 125.00, NULL, 'GRL-FRG-001', 62, TRUE, FALSE, ARRAY['fragrance','floral','lavender','vanilla','feminine']),

((SELECT id FROM brands WHERE slug='guerlain'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Shalimar Eau de Parfum', 'guerlain-shalimar-edp',
 'Created in 1925, Shalimar is a timeless oriental legend. Bergamot and citrus open to iris and jasmine, deepening to a legendary base of vanilla, vetiver, incense and opoponax — the ultimate oriental classic.',
 'Legendary oriental EDP — iris, vanilla, vetiver, incense',
 130.00, NULL, 'GRL-FRG-002', 55, TRUE, TRUE, ARRAY['fragrance','oriental','vanilla','iconic','timeless']),

((SELECT id FROM brands WHERE slug='hermes'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Twilly d''Hermès Eau de Parfum', 'hermes-twilly-edp',
 'Young, bold and free-spirited. Tuberose dances with ginger and sandalwood in a playful yet deeply sensual fragrance that celebrates the vibrant energy and joyful exuberance of womanhood.',
 'Playful floral EDP — tuberose, ginger, sandalwood',
 165.00, NULL, 'HRM-FRG-001', 40, TRUE, FALSE, ARRAY['fragrance','floral','tuberose','playful','feminine']),

((SELECT id FROM brands WHERE slug='hermes'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Terre d''Hermès Eau de Parfum', 'hermes-terre-edp',
 'A manifesto of masculine elegance. Flint and orange zest evolve through pepper and vetiver to cedar and benzoin. Earthy, mineral and deeply sophisticated — the definition of refined masculinity.',
 'Earthy masculine EDP — flint, citrus, vetiver, cedar',
 165.00, NULL, 'HRM-FRG-002', 40, TRUE, FALSE, ARRAY['fragrance','woody','mineral','masculine','luxury']),

((SELECT id FROM brands WHERE slug='mugler'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Angel Eau de Parfum', 'mugler-angel-edp',
 'The original gourmand fragrance that revolutionised perfumery in 1992. Ethereal patchouli and coumarin swirl around red berries, chocolate and caramel for an addictive, celestial and truly iconic scent.',
 'Iconic gourmand EDP — patchouli, chocolate, caramel',
 128.00, NULL, 'MGL-FRG-001', 70, TRUE, TRUE, ARRAY['fragrance','gourmand','patchouli','chocolate','iconic']),

((SELECT id FROM brands WHERE slug='mugler'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Alien Eau de Parfum', 'mugler-alien-edp',
 'A solar, mineral and feminine woody fragrance. Jasmine Sambac from India, cashmere wood and white amber create an otherworldly aura of mystery, sensuality and unforgettable radiance.',
 'Solar woody EDP — jasmine Sambac, cashmere wood, amber',
 125.00, NULL, 'MGL-FRG-002', 65, TRUE, FALSE, ARRAY['fragrance','floral','woody','mysterious','feminine']),

((SELECT id FROM brands WHERE slug='lancome'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'La Vie Est Belle Eau de Parfum', 'lancome-laveb-edp',
 'A declaration of happiness. Iris and praline form an unprecedented floral gourmand accord, brightened by blackcurrant and pear. Jasmine, orange blossom and sandalwood give it timeless radiance.',
 'Joyful floral gourmand EDP — iris, praline, jasmine',
 115.00, NULL, 'LNC-FRG-001', 90, TRUE, TRUE, ARRAY['fragrance','floral','gourmand','iris','feminine']),

((SELECT id FROM brands WHERE slug='armani-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Sì Eau de Parfum', 'armani-si-edp',
 'A modern chypre of luminous sophistication. Blackcurrant nectar and rose de mai combine with ambroxan and precious woods to create a fragrance of confident femininity and effortless elegance.',
 'Modern chypre EDP — blackcurrant, rose de mai, ambroxan',
 130.00, NULL, 'ARM-FRG-001', 60, TRUE, FALSE, ARRAY['fragrance','floral','chypre','feminine','modern']),

((SELECT id FROM brands WHERE slug='armani-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Acqua di Gioia Eau de Parfum', 'armani-acqua-di-gioia-edp',
 'The joy of water reimagined as a fragrance. Fresh mint and peony open onto jasmine and lavandin, settling on cedarwood and crystalline white sugar. Pure, joyful and utterly refreshing.',
 'Fresh aquatic floral — mint, peony, jasmine, cedar',
 108.00, NULL, 'ARM-FRG-002', 75, TRUE, FALSE, ARRAY['fragrance','aquatic','floral','fresh','feminine']),

((SELECT id FROM brands WHERE slug='versace'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Bright Crystal Eau de Parfum', 'versace-bright-crystal-edp',
 'A vibrant, sensual fragrance of chilled aquatic notes and pure florals. Yuzu, pomegranate and lotus blossom into magnolia and peony, resting on musk and amber. Fresh, luminous, unmistakably Versace.',
 'Fresh floral EDP — pomegranate, peony, magnolia',
 98.00, NULL, 'VRS-FRG-001', 85, TRUE, FALSE, ARRAY['fragrance','floral','fresh','feminine','italian']),

((SELECT id FROM brands WHERE slug='dolce-gabbana'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Light Blue Eau de Parfum', 'dg-light-blue-edp',
 'A sparkling interpretation of the Mediterranean sea. Sicily cedar, Granny Smith apple and bellflower open to white rose and bamboo, finishing on amber and musk. Effortlessly fresh and timelessly elegant.',
 'Mediterranean fresh EDP — cedar, apple, white rose',
 105.00, NULL, 'DG-FRG-001', 95, TRUE, FALSE, ARRAY['fragrance','fresh','floral','aquatic','mediterranean']),

((SELECT id FROM brands WHERE slug='dolce-gabbana'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'The One Eau de Parfum', 'dg-the-one-edp',
 'A modern oriental of irresistible charm. Bergamot and peach melt into lily, plum and jasmine, resting on amber, musk and vetiver. Alluring, sophisticated and impossible to forget.',
 'Oriental floral EDP — bergamot, lily, amber, musk',
 118.00, NULL, 'DG-FRG-002', 70, TRUE, TRUE, ARRAY['fragrance','oriental','floral','feminine','sensual']),

((SELECT id FROM brands WHERE slug='burberry-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Her Eau de Parfum', 'burberry-her-edp',
 'A celebration of London girlhood. Grapefruit, lemon and blackcurrant sparkle above jasmine, violet and rose, resting on amber woods and sandalwood. Fresh, feminine and quintessentially British.',
 'Modern fruity floral — grapefruit, blackcurrant, rose',
 120.00, NULL, 'BUR-FRG-001', 60, TRUE, FALSE, ARRAY['fragrance','floral','fruity','feminine','british']),

((SELECT id FROM brands WHERE slug='valentino-beauty'),
 (SELECT id FROM categories WHERE slug='eau-de-parfum'),
 'Donna Born in Roma Eau de Parfum', 'valentino-donna-bir-edp',
 'Inspired by the eternal beauty of Rome. Blackcurrant nectar meets jasmine, davana and vanilla bourbon in a modern gourmand contrast — bold yet deeply feminine, timeless yet contemporary.',
 'Floral gourmand EDP — blackcurrant, jasmine, vanilla',
 145.00, NULL, 'VAL-FRG-001', 50, TRUE, TRUE, ARRAY['fragrance','floral','gourmand','feminine','luxury'])

ON CONFLICT (sku) DO NOTHING;

-- ── TOOLS (15 products) ────────────────────────────────────────────────────
INSERT INTO products (brand_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_active, is_featured, tags) VALUES

((SELECT id FROM brands WHERE slug='real-techniques'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'Core Collection Brush Set', 'rt-core-collection-brush-set',
 'Five essential brushes for a complete face routine, designed by Emmy Award-winning makeup artists Sam and Nic Chapman. Includes base shadow, detailer, contour, pointed foundation and flat contour — all you need.',
 '5-piece expert-designed face brush set',
 29.99, 35.00, 'RT-TOOL-001', 200, TRUE, TRUE, ARRAY['brushes','set','professional','affordable']),

((SELECT id FROM brands WHERE slug='sigma-beauty'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'F80 Flat Kabuki Brush', 'sigma-f80-flat-kabuki',
 'The cult kabuki brush that started a revolution. Ultra-fine SigmaTech fibres pick up and deposit product flawlessly, buffing foundation to an airbrushed, skin-like finish in seconds. A global must-have.',
 'Cult kabuki for airbrushed foundation',
 34.00, NULL, 'SIG-TOOL-001', 150, TRUE, TRUE, ARRAY['brush','foundation','kabuki','professional']),

((SELECT id FROM brands WHERE slug='sigma-beauty'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'Complete Eye Brush Set', 'sigma-complete-eye-brush-set',
 'Twelve precision eye brushes for any look from natural to editorial smoky. SigmaTech fibres deliver unparalleled colour payoff and seamless blending across every eye shape and size.',
 '12-piece precision eye brush set',
 109.00, 140.00, 'SIG-TOOL-002', 80, TRUE, FALSE, ARRAY['brushes','eye','set','professional']),

((SELECT id FROM brands WHERE slug='zoeva'),
 (SELECT id FROM categories WHERE slug='brushes'),
 '105 Luxe Face Definer Brush', 'zoeva-105-face-definer',
 'A flat-topped fan brush ideal for precise bronzer, blush and highlighter placement. Handcrafted with ultra-soft taklon fibres for buildable colour with exceptional precision and a flawless, sculpted finish.',
 'Flat fan brush for bronzer and highlight',
 22.00, NULL, 'ZOE-TOOL-001', 120, TRUE, FALSE, ARRAY['brush','contour','bronzer','highlight']),

((SELECT id FROM brands WHERE slug='zoeva'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'Rose Golden Luxury Set Vol 2', 'zoeva-rose-golden-set-v2',
 'Eleven luxurious brushes with rose-gold ferrules and natural-look blonde fibres. A complete face and eye collection: powder, foundation, eyeshadow, blending and liner. Breathtaking to look at, professional to use.',
 '11-piece luxury brush set with rose-gold ferrules',
 79.00, 95.00, 'ZOE-TOOL-002', 60, TRUE, TRUE, ARRAY['brushes','set','luxury','rose-gold']),

((SELECT id FROM brands WHERE slug='it-cosmetics'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'Heavenly Luxe Flawless Foundation Brush', 'itc-heavenly-foundation-brush',
 'Developed with plastic surgeons and dermatologists. Over 7 million ultra-soft taklon fibres create a flawless, skin-like finish. Dermatologist-tested and designed to work beautifully for all skin types.',
 'Dermatologist-developed ultra-soft foundation brush',
 48.00, NULL, 'ITC-TOOL-001', 100, TRUE, FALSE, ARRAY['brush','foundation','professional','soft']),

((SELECT id FROM brands WHERE slug='real-techniques'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'Miracle Complexion Sponge Duo', 'rt-miracle-complexion-sponge-duo',
 'Two of the iconic blending sponges — the flat edge evens foundation, the rounded side blends seamlessly, and the precision tip conceals blemishes and dark circles. Use damp for a flawless, streak-free finish.',
 'Two-pack multi-use complexion blending sponges',
 18.00, NULL, 'RT-TOOL-002', 300, TRUE, FALSE, ARRAY['sponge','blending','foundation','affordable']),

((SELECT id FROM brands WHERE slug='nuface'),
 (SELECT id FROM categories WHERE slug='devices'),
 'Trinity Facial Toning Device', 'nuface-trinity-device',
 'The FDA-cleared device clinically proven to lift, tone and contour in just five minutes a day. Microcurrent technology stimulates 82 facial muscles to improve contour, reduce fine lines and restore natural luminosity.',
 'FDA-cleared microcurrent facial toning device',
 339.00, 399.00, 'NUF-TOOL-001', 50, TRUE, TRUE, ARRAY['device','microcurrent','anti-aging','lifting']),

((SELECT id FROM brands WHERE slug='nuface'),
 (SELECT id FROM categories WHERE slug='devices'),
 'Fix Line Smoothing Device', 'nuface-fix-line-smoothing',
 'Targeted microcurrent treatment for fine lines and wrinkles around the eyes and lips. The precision tip delivers focused toning exactly where you need it. Visible smoothing in five minutes a day.',
 'Targeted microcurrent for fine lines and wrinkles',
 179.00, NULL, 'NUF-TOOL-002', 70, TRUE, FALSE, ARRAY['device','microcurrent','anti-aging','precision']),

((SELECT id FROM brands WHERE slug='pmd-beauty'),
 (SELECT id FROM categories WHERE slug='devices'),
 'Clean Pro Rose Cleansing Device', 'pmd-clean-pro-rose',
 'Advanced silicone cleansing with 7,000 SonicGlow pulsations per minute, removing 99.9% of dirt and oil. The built-in massager stimulates circulation for firmer, more youthful-looking skin with every cleanse.',
 'Sonic silicone facial cleansing and firming device',
 99.00, 119.00, 'PMD-TOOL-001', 90, TRUE, FALSE, ARRAY['device','cleansing','sonic','anti-aging']),

((SELECT id FROM brands WHERE slug='elemis'),
 (SELECT id FROM categories WHERE slug='devices'),
 'Pro-Collagen Sculpting Tool', 'elemis-pro-collagen-sculpting-tool',
 'The must-have companion to Elemis cleansing balms. This ergonomic facial massage tool sculpts and defines face, jaw and neck contours when used with your cleansing ritual for a spa-quality experience at home.',
 'Ergonomic facial sculpting and massage tool',
 78.00, NULL, 'ELM-TOOL-001', 80, TRUE, FALSE, ARRAY['tool','massage','sculpting','luxury','british']),

((SELECT id FROM brands WHERE slug='mac'),
 (SELECT id FROM categories WHERE slug='brushes'),
 '217S Blending Brush', 'mac-217s-blending-brush',
 'The most beloved eye brush in the MAC collection. Densely packed, ultra-soft taklon fibres blend eyeshadow to seamless perfection, eliminating harsh lines and creating effortlessly blended, professional eye looks.',
 'Essential eyeshadow blending brush',
 30.00, NULL, 'MAC-TOOL-002', 200, TRUE, FALSE, ARRAY['brush','eye','blending','professional']),

((SELECT id FROM brands WHERE slug='nars'),
 (SELECT id FROM categories WHERE slug='brushes'),
 '#15 Full Powder Brush', 'nars-15-full-powder-brush',
 'An oversized dome-shaped brush for flawless powder application. Extra-soft, densely packed fibres apply and blend loose or pressed powder with a sheer, even coverage and an exquisitely finished complexion.',
 'Oversized dome brush for flawless powder',
 52.00, NULL, 'NARS-TOOL-001', 90, TRUE, FALSE, ARRAY['brush','powder','face','professional']),

((SELECT id FROM brands WHERE slug='charlotte-tilbury'),
 (SELECT id FROM categories WHERE slug='brushes'),
 'Powder & Sculpt Dual Brush', 'ct-powder-sculpt-dual-brush',
 'A masterclass in duality: an oversized powder brush on one end for setting and blending, a sculpting brush on the other for contouring and bronzing. Two iconic shapes in one rose-gold handle — perfection.',
 'Dual-ended powder and contour brush',
 62.00, NULL, 'CT-TOOL-003', 75, TRUE, TRUE, ARRAY['brush','powder','contour','luxury','dual-ended']),

((SELECT id FROM brands WHERE slug='foreo'),
 (SELECT id FROM categories WHERE slug='devices'),
 'UFO 2 Smart Mask Device', 'foreo-ufo-2-device',
 'A full facial in two minutes at home. T-Sonic pulsations, hyper-infusion LED technology and Cryo-Technology activate the UFO-activated masks, infusing active ingredients 11x deeper than manual application. Clinically proven.',
 'Smart 2-minute LED masking device',
 239.00, 269.00, 'FOREO-TOOL-003', 45, TRUE, FALSE, ARRAY['device','mask','led','anti-aging','smart'])

ON CONFLICT (sku) DO NOTHING;

-- ── FRAGRANCE IMAGES ───────────────────────────────────────────────────────
-- Rotate through 5 verified Unsplash perfume IDs

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='TF-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='TF-FRG-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='MM-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='MM-FRG-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='GIV-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='PRA-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='GRL-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='GRL-FRG-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='HRM-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='HRM-FRG-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='MGL-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='MGL-FRG-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='LNC-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='ARM-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='ARM-FRG-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='VRS-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='DG-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='DG-FRG-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='BUR-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='VAL-FRG-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

-- ── TOOLS IMAGES ───────────────────────────────────────────────────────────
-- Rotate through 3 verified Unsplash brush/device IDs

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='RT-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='SIG-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='SIG-TOOL-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='ZOE-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='ZOE-TOOL-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='ITC-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='RT-TOOL-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='NUF-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='NUF-TOOL-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='PMD-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='ELM-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='MAC-TOOL-002' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='NARS-TOOL-001' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='CT-TOOL-003' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);

INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', p.name, TRUE, 1
FROM products p WHERE p.sku='FOREO-TOOL-003' AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=p.id);
