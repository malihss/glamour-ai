"""
init_db.py — Create tables and load seed data.
Run once from the backend directory:
    python init_db.py
"""

import os
import sys
from pathlib import Path

# Ensure we can import project modules when run directly
sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from extensions import db

# Import all models so SQLAlchemy registers them before create_all
from models import (
    User, Category, Brand, Product, ProductVariant, ProductImage,
    Review, Cart, CartItem, Order, OrderItem, Wishlist,
    UserInteraction, ChatSession, ChatMessage
)


def init_db():
    app = create_app()
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Tables created.")

        seed_path = Path(__file__).parent.parent / "database" / "seeds" / "products.sql"
        if not seed_path.exists():
            print(f"Seed file not found at {seed_path}")
            return

        print(f"Loading seed data from {seed_path}...")
        from sqlalchemy import text
        with open(seed_path, "r", encoding="utf-8") as f:
            sql = f.read()

        try:
            with db.engine.connect() as conn:
                # Execute as individual statements split on semicolons
                for statement in sql.split(";"):
                    stmt = statement.strip()
                    if stmt and not stmt.startswith("--"):
                        conn.execute(text(stmt))
                conn.commit()
            print("Seed data loaded successfully.")
            print("\nDatabase ready. You can now start the backend: python app.py")
        except Exception as e:
            print(f"\nSeed error: {e}")
            print("Tables were created. You may run the seed manually:")
            print(f"  psql $DATABASE_URL -f {seed_path}")


if __name__ == "__main__":
    init_db()
