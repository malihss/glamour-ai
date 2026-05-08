-- ============================================================
-- Replace all makeup & skincare product images with
-- elegant, category-matched Unsplash photos.
-- Uses ROW_NUMBER() % N to cycle through verified photo pools.
-- ============================================================

-- ── LIP (173 products, 13-photo pool) ───────────────────────
WITH ranked AS (
  SELECT pi.id AS img_id,
         ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 13)::int AS n
  FROM product_images pi
  JOIN products p ON p.id = pi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug = 'lip' AND pi.is_primary = true
)
UPDATE product_images pi
SET url = CASE n.n
  WHEN 0  THEN 'https://images.unsplash.com/photo-1709477542145-868afa3d298b?w=600&q=80'
  WHEN 1  THEN 'https://images.unsplash.com/photo-1709477542157-9c9249ca2cb6?w=600&q=80'
  WHEN 2  THEN 'https://images.unsplash.com/photo-1613255348289-1407e4f2f980?w=600&q=80'
  WHEN 3  THEN 'https://images.unsplash.com/photo-1770981773328-63c2ad10013d?w=600&q=80'
  WHEN 4  THEN 'https://images.unsplash.com/photo-1770981667014-677a0bf91663?w=600&q=80'
  WHEN 5  THEN 'https://images.unsplash.com/photo-1615502589579-2e829b92a6ce?w=600&q=80'
  WHEN 6  THEN 'https://images.unsplash.com/photo-1706821724724-228649ad1254?w=600&q=80'
  WHEN 7  THEN 'https://images.unsplash.com/photo-1584013544071-caee786e105b?w=600&q=80'
  WHEN 8  THEN 'https://images.unsplash.com/photo-1590156352745-1cb2758c36b9?w=600&q=80'
  WHEN 9  THEN 'https://images.unsplash.com/photo-1590156576841-033939aa8c43?w=600&q=80'
  WHEN 10 THEN 'https://images.unsplash.com/photo-1590156423742-3c58d6b9d605?w=600&q=80'
  WHEN 11 THEN 'https://images.unsplash.com/photo-1654973433534-1238e06f6b38?w=600&q=80'
  WHEN 12 THEN 'https://images.unsplash.com/photo-1770981667079-d59bbacc0739?w=600&q=80'
  ELSE pi.url
END
FROM ranked n
WHERE pi.id = n.img_id;

-- ── EYES (347 products, 12-photo pool) ──────────────────────
WITH ranked AS (
  SELECT pi.id AS img_id,
         ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 12)::int AS n
  FROM product_images pi
  JOIN products p ON p.id = pi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug = 'eyes' AND pi.is_primary = true
)
UPDATE product_images pi
SET url = CASE n.n
  WHEN 0  THEN 'https://images.unsplash.com/photo-1606158582120-b4fc196bffad?w=600&q=80'
  WHEN 1  THEN 'https://images.unsplash.com/photo-1570411004091-f33db096d9da?w=600&q=80'
  WHEN 2  THEN 'https://images.unsplash.com/photo-1707724931575-e952378140d9?w=600&q=80'
  WHEN 3  THEN 'https://images.unsplash.com/photo-1707724931643-98d0445e9db8?w=600&q=80'
  WHEN 4  THEN 'https://images.unsplash.com/photo-1680474557611-988b50247c66?w=600&q=80'
  WHEN 5  THEN 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80'
  WHEN 6  THEN 'https://images.unsplash.com/photo-1587055682234-853183f4523c?w=600&q=80'
  WHEN 7  THEN 'https://images.unsplash.com/photo-1583334418819-13c7a1556e4f?w=600&q=80'
  WHEN 8  THEN 'https://images.unsplash.com/photo-1627037118727-cd7095b7ef02?w=600&q=80'
  WHEN 9  THEN 'https://images.unsplash.com/photo-1610067762007-1ca5a93f72b3?w=600&q=80'
  WHEN 10 THEN 'https://images.unsplash.com/photo-1594903696739-2551e8c2d0f1?w=600&q=80'
  WHEN 11 THEN 'https://images.unsplash.com/photo-1571332283201-99c82a8b3046?w=600&q=80'
  ELSE pi.url
END
FROM ranked n
WHERE pi.id = n.img_id;

-- ── FACE (298 products, 13-photo pool) ──────────────────────
WITH ranked AS (
  SELECT pi.id AS img_id,
         ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 13)::int AS n
  FROM product_images pi
  JOIN products p ON p.id = pi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug = 'face' AND pi.is_primary = true
)
UPDATE product_images pi
SET url = CASE n.n
  WHEN 0  THEN 'https://images.unsplash.com/photo-1512207576147-99bc3066b621?w=600&q=80'
  WHEN 1  THEN 'https://images.unsplash.com/photo-1453761816053-ed5ba727b5b7?w=600&q=80'
  WHEN 2  THEN 'https://images.unsplash.com/photo-1521840233161-295ed621e056?w=600&q=80'
  WHEN 3  THEN 'https://images.unsplash.com/photo-1560879311-370fd4561a0d?w=600&q=80'
  WHEN 4  THEN 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&q=80'
  WHEN 5  THEN 'https://images.unsplash.com/photo-1512207855369-643452a63d46?w=600&q=80'
  WHEN 6  THEN 'https://images.unsplash.com/photo-1550281378-521929a11c42?w=600&q=80'
  WHEN 7  THEN 'https://images.unsplash.com/photo-1566733015703-b89a6389ff18?w=600&q=80'
  WHEN 8  THEN 'https://images.unsplash.com/photo-1512495967160-4e815a64fba6?w=600&q=80'
  WHEN 9  THEN 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80'
  WHEN 10 THEN 'https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=600&q=80'
  WHEN 11 THEN 'https://images.unsplash.com/photo-1530863138121-03aea5f46fd4?w=600&q=80'
  WHEN 12 THEN 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&q=80'
  ELSE pi.url
END
FROM ranked n
WHERE pi.id = n.img_id;

-- ── SKINCARE: moisturizers (100 products, 14-photo pool) ────
WITH ranked AS (
  SELECT pi.id AS img_id,
         ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 14)::int AS n
  FROM product_images pi
  JOIN products p ON p.id = pi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug = 'moisturizers' AND pi.is_primary = true
)
UPDATE product_images pi
SET url = CASE n.n
  WHEN 0  THEN 'https://images.unsplash.com/photo-1686831757659-a7528ec36e24?w=600&q=80'
  WHEN 1  THEN 'https://images.unsplash.com/photo-1585945037805-5fd82c2e60b1?w=600&q=80'
  WHEN 2  THEN 'https://images.unsplash.com/photo-1641130290711-01c4c4558562?w=600&q=80'
  WHEN 3  THEN 'https://images.unsplash.com/photo-1635847417488-fb910da0f82a?w=600&q=80'
  WHEN 4  THEN 'https://images.unsplash.com/photo-1646683872419-d5a50258d4d9?w=600&q=80'
  WHEN 5  THEN 'https://images.unsplash.com/photo-1605204768985-81bad5fd9d79?w=600&q=80'
  WHEN 6  THEN 'https://images.unsplash.com/photo-1609097164673-7cfafb51b926?w=600&q=80'
  WHEN 7  THEN 'https://images.unsplash.com/photo-1629732047847-50219e9c5aef?w=600&q=80'
  WHEN 8  THEN 'https://images.unsplash.com/photo-1598282674886-81688e202188?w=600&q=80'
  WHEN 9  THEN 'https://images.unsplash.com/photo-1609357912333-27872db33d5c?w=600&q=80'
  WHEN 10 THEN 'https://images.unsplash.com/photo-1630398778586-2d3104219390?w=600&q=80'
  WHEN 11 THEN 'https://images.unsplash.com/photo-1594403032032-ad7ef5de664b?w=600&q=80'
  WHEN 12 THEN 'https://images.unsplash.com/photo-1679394042175-717ca34ef0f2?w=600&q=80'
  WHEN 13 THEN 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80'
  ELSE pi.url
END
FROM ranked n
WHERE pi.id = n.img_id;

-- ── SKINCARE: cleansers (10 products, 8-photo pool) ─────────
WITH ranked AS (
  SELECT pi.id AS img_id,
         ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 8)::int AS n
  FROM product_images pi
  JOIN products p ON p.id = pi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug = 'cleansers' AND pi.is_primary = true
)
UPDATE product_images pi
SET url = CASE n.n
  WHEN 0 THEN 'https://images.unsplash.com/photo-1598282674886-81688e202188?w=600&q=80'
  WHEN 1 THEN 'https://images.unsplash.com/photo-1629732047847-50219e9c5aef?w=600&q=80'
  WHEN 2 THEN 'https://images.unsplash.com/photo-1605204768985-81bad5fd9d79?w=600&q=80'
  WHEN 3 THEN 'https://images.unsplash.com/photo-1641130290711-01c4c4558562?w=600&q=80'
  WHEN 4 THEN 'https://images.unsplash.com/photo-1635847417488-fb910da0f82a?w=600&q=80'
  WHEN 5 THEN 'https://images.unsplash.com/photo-1686831757659-a7528ec36e24?w=600&q=80'
  WHEN 6 THEN 'https://images.unsplash.com/photo-1609357912333-27872db33d5c?w=600&q=80'
  WHEN 7 THEN 'https://images.unsplash.com/photo-1594403032032-ad7ef5de664b?w=600&q=80'
  ELSE pi.url
END
FROM ranked n
WHERE pi.id = n.img_id;

-- ── SKINCARE: serums (7 products, 7-photo pool) ──────────────
WITH ranked AS (
  SELECT pi.id AS img_id,
         ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 7)::int AS n
  FROM product_images pi
  JOIN products p ON p.id = pi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug = 'serums' AND pi.is_primary = true
)
UPDATE product_images pi
SET url = CASE n.n
  WHEN 0 THEN 'https://images.unsplash.com/photo-1646683872419-d5a50258d4d9?w=600&q=80'
  WHEN 1 THEN 'https://images.unsplash.com/photo-1609097164673-7cfafb51b926?w=600&q=80'
  WHEN 2 THEN 'https://images.unsplash.com/photo-1630398778586-2d3104219390?w=600&q=80'
  WHEN 3 THEN 'https://images.unsplash.com/photo-1679394042175-717ca34ef0f2?w=600&q=80'
  WHEN 4 THEN 'https://images.unsplash.com/photo-1585945037805-5fd82c2e60b1?w=600&q=80'
  WHEN 5 THEN 'https://images.unsplash.com/photo-1641130290711-01c4c4558562?w=600&q=80'
  WHEN 6 THEN 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80'
  ELSE pi.url
END
FROM ranked n
WHERE pi.id = n.img_id;

-- ── SKINCARE: spf (4 products, 4-photo pool) ─────────────────
WITH ranked AS (
  SELECT pi.id AS img_id,
         ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 4)::int AS n
  FROM product_images pi
  JOIN products p ON p.id = pi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug = 'spf' AND pi.is_primary = true
)
UPDATE product_images pi
SET url = CASE n.n
  WHEN 0 THEN 'https://images.unsplash.com/photo-1635847417488-fb910da0f82a?w=600&q=80'
  WHEN 1 THEN 'https://images.unsplash.com/photo-1598282674886-81688e202188?w=600&q=80'
  WHEN 2 THEN 'https://images.unsplash.com/photo-1686831757659-a7528ec36e24?w=600&q=80'
  WHEN 3 THEN 'https://images.unsplash.com/photo-1609097164673-7cfafb51b926?w=600&q=80'
  ELSE pi.url
END
FROM ranked n
WHERE pi.id = n.img_id;
