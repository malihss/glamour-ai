-- seeds/users.sql — Sample users (passwords are bcrypt hashed)

-- Password for all demo users: glamour123
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRdQCx9GpF5aOi6 (example)
-- In production, use your auth system to create users properly

INSERT INTO users (email, password_hash, first_name, last_name, skin_tone, skin_type, preferences)
VALUES
(
  'demo@glamour.ai',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRdQCx9GpF5aOi6',
  'Alex',
  'Morgan',
  'medium',
  'combination',
  '{"favoriteCategories": ["lip", "eyes"], "favoriteBrands": ["charlotte-tilbury", "nars"]}'
),
(
  'beauty@test.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRdQCx9GpF5aOi6',
  'Jordan',
  'Lee',
  'fair',
  'dry',
  '{"favoriteCategories": ["skincare"], "favoriteBrands": ["la-mer", "tatcha"]}'
)
ON CONFLICT (email) DO NOTHING;

-- Note: These hashes are placeholders. Run this Python snippet to generate real hashes:
-- import bcrypt
-- password = b"glamour123"
-- hash = bcrypt.hashpw(password, bcrypt.gensalt(12)).decode('utf-8')
-- print(hash)
