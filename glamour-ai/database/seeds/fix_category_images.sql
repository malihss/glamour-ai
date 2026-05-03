-- ============================================================
-- Assign category-appropriate images to all products
-- All IDs sourced from Unsplash category-specific searches
-- ============================================================

-- ── EAU-DE-PARFUM (26 products) ──────────────────────────────
-- Pool: 14 verified perfume bottle photos, cycling at most 2x
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80' WHERE product_id = 'b2f1e97e-610a-4b35-a5f2-4df01ada45cc' AND is_primary = true; -- Acqua di Gioia
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80' WHERE product_id = '485eed84-b3fe-40a2-ada1-1bd2b5f8aadf' AND is_primary = true; -- Alien
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80' WHERE product_id = 'd866dc5e-3bd3-4f39-9589-201d81dd65c8' AND is_primary = true; -- Angel
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80'    WHERE product_id = 'b5e983eb-d1a3-4f80-b86d-1afbc97ef83d' AND is_primary = true; -- Black Opium
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80' WHERE product_id = 'ef5e500a-04fa-41a0-92b8-ab1c17fcfd9b' AND is_primary = true; -- Black Orchid
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80' WHERE product_id = 'bb1a6430-a35b-4fa2-a9e6-9ef416d0bda6' AND is_primary = true; -- Bright Crystal
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80' WHERE product_id = 'cddc0077-02d8-4cc8-9664-16e142d03322' AND is_primary = true; -- Donna Born in Roma
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1458538977777-0549b2370168?w=600&q=80' WHERE product_id = '5679950e-ab53-4573-b45f-c0983a621048' AND is_primary = true; -- Gypsy Water
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=600&q=80' WHERE product_id = 'ac48494c-86e8-4e40-bf81-560b4665a2b4' AND is_primary = true; -- Her
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?w=600&q=80' WHERE product_id = '5d7c9d69-54af-44d9-bd06-99d92610b90d' AND is_primary = true; -- L'Interdit
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1585218334450-afcf929da36e?w=600&q=80' WHERE product_id = '56e30d1f-5ed8-49fc-82fe-501d756e80f9' AND is_primary = true; -- La Vie Est Belle
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1535683577427-740aaac4ec25?w=600&q=80' WHERE product_id = 'fa8c3776-67fa-4fa5-8382-ed10159dbd80' AND is_primary = true; -- Libre
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?w=600&q=80' WHERE product_id = '54ee09cf-c4bb-404c-83f6-8aee17d32e4f' AND is_primary = true; -- Light Blue
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1543422655-ac1c6ca993ed?w=600&q=80'    WHERE product_id = '09d2ae05-719a-4a65-ad9e-c4515668ebc1' AND is_primary = true; -- Lost Cherry
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80' WHERE product_id = '71ffad02-3d24-4a18-a9b6-a4e47f58dbc1' AND is_primary = true; -- Miss Dior Blooming Bouquet
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80' WHERE product_id = '0253fb82-60dc-4085-b302-40a11ac09755' AND is_primary = true; -- Mon Guerlain
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80' WHERE product_id = '8a8fc1c9-e647-4cf7-b13c-c82734642917' AND is_primary = true; -- N5
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80'    WHERE product_id = 'fe9f57cf-7ad2-4a0f-a02e-f374c6e4355e' AND is_primary = true; -- Paradoxe
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80' WHERE product_id = 'c9b3b503-8866-459c-a031-2952b24cfbd4' AND is_primary = true; -- Peony & Blush Suede
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80' WHERE product_id = '231d3e76-5f8c-42f0-9afa-23fd18aa4789' AND is_primary = true; -- Replica By The Fireplace
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80' WHERE product_id = '426db6ea-92fa-408a-a660-ea279b2136ac' AND is_primary = true; -- Replica Jazz Club
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1458538977777-0549b2370168?w=600&q=80' WHERE product_id = '2f4b6939-3860-4428-95db-250bb8e79035' AND is_primary = true; -- Shalimar
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=600&q=80' WHERE product_id = '1ad70fa1-ee6b-49fa-a2be-b33ad3b11fe5' AND is_primary = true; -- Sì
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?w=600&q=80' WHERE product_id = '7c0cccc4-0578-4b23-9124-e1c1bb97b20b' AND is_primary = true; -- Terre d'Hermès
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1585218334450-afcf929da36e?w=600&q=80' WHERE product_id = '4ff699ad-cc4c-4279-83c3-8b8e827badaf' AND is_primary = true; -- The One
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1535683577427-740aaac4ec25?w=600&q=80' WHERE product_id = '35e8191a-839e-41ad-8fa8-d758c65035ab' AND is_primary = true; -- Twilly d'Hermès

-- ── BRUSHES (13 products) ────────────────────────────────────
-- Pool: 10 verified makeup brush photos from Unsplash makeup-brushes search
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1620464003286-a5b0d79f32c2?w=600&q=80' WHERE product_id = 'fca94439-9c32-40dd-b785-14b69a339295' AND is_primary = true; -- #15 Full Powder Brush
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1678695692040-e9a39502c357?w=600&q=80' WHERE product_id = 'dbae94d0-406e-440d-a8a4-edbeb4a1cf11' AND is_primary = true; -- 105 Luxe Face Definer Brush
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1607774000480-de3f239fdd4c?w=600&q=80' WHERE product_id = '1e451461-57f0-4fb2-baa7-96142c208b0a' AND is_primary = true; -- 168S Large Angled Contour Brush
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1622364649682-e7af9fecc43d?w=600&q=80' WHERE product_id = '1481dab0-9a89-4bbb-a9b5-87a19718abea' AND is_primary = true; -- 217S Blending Brush
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1704621354138-e124277356f2?w=600&q=80' WHERE product_id = 'a41f14f7-4e8f-4202-9617-ffde2eedb019' AND is_primary = true; -- Complete Eye Brush Set
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1679307658813-da95b901ecd9?w=600&q=80' WHERE product_id = '212753d3-161a-4a8f-8e3e-d964cc970d1b' AND is_primary = true; -- Core Collection Brush Set
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1600228390270-970186129936?w=600&q=80' WHERE product_id = '63dec88f-0947-4cba-88c6-6ebe8b7d23e1' AND is_primary = true; -- F80 Flat Kabuki Brush
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1667369039699-f30c4b863e51?w=600&q=80' WHERE product_id = 'a387b973-564a-4443-9459-2269b9f56f69' AND is_primary = true; -- Heavenly Luxe Flawless Foundation Brush
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1507092183626-4e8793315843?w=600&q=80' WHERE product_id = '5f3bf746-b470-4882-a85d-c2cd7e2b38eb' AND is_primary = true; -- Miracle Complexion Sponge Duo
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80' WHERE product_id = '9b40b927-2e13-415c-bd5a-7e843e4a4b29' AND is_primary = true; -- Original Beautyblender 3-Pack
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1620464003286-a5b0d79f32c2?w=600&q=80' WHERE product_id = 'c9f41087-904c-4943-a108-149c9186b255' AND is_primary = true; -- Powder & Sculpt Dual Brush
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1678695692040-e9a39502c357?w=600&q=80' WHERE product_id = 'd1029aa3-cedc-4e56-97db-49fcad059949' AND is_primary = true; -- Professional Brush Set
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1607774000480-de3f239fdd4c?w=600&q=80' WHERE product_id = '08f05279-dad0-47a8-be50-25ba126e7096' AND is_primary = true; -- Rose Golden Luxury Set

-- ── DEVICES (6 products, each unique image) ──────────────────
-- Pool: 6 verified facial beauty device photos from Unsplash
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1710839006592-4fdfc6caca80?w=600&q=80' WHERE product_id = 'aefaafb5-d01e-416c-bc68-5bfc13e66260' AND is_primary = true; -- PMD Clean Pro
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1702261952308-6492b50a0022?w=600&q=80' WHERE product_id = 'd2ee43b4-7147-41df-8088-5df190b896d6' AND is_primary = true; -- Fix Line Smoothing Device
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1711563658862-d1ff34849176?w=600&q=80' WHERE product_id = '688e09cd-8a6f-400e-bdca-56259e1eb6d4' AND is_primary = true; -- LUNA Mini 3
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1710839422734-de9f105bfce0?w=600&q=80' WHERE product_id = 'fb65cf96-0520-4834-a415-dd5cbc9c4a20' AND is_primary = true; -- Pro-Collagen Sculpting Tool
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1702261952318-241e4594b2f5?w=600&q=80' WHERE product_id = '1e9f31a6-95f0-43b5-b6b5-67783589d4e1' AND is_primary = true; -- Trinity Facial Toning Device
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1710839290079-62ee20333f6b?w=600&q=80' WHERE product_id = '8b04c1c2-95ed-4811-ba9a-7234aad222ce' AND is_primary = true; -- UFO 2 Smart Mask Device
