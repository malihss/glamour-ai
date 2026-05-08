"""
recommendation/engine.py — TensorFlow-based recommendation system
Uses collaborative filtering + content-based hybrid approach
"""

import numpy as np
import os
import json
import logging
from typing import List, Optional, Dict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

try:
    import tensorflow as tf
    from tensorflow import keras
    TF_AVAILABLE = True
    logger.info("TensorFlow loaded successfully")
except ImportError:
    TF_AVAILABLE = False
    logger.warning("TensorFlow not available, using fallback recommendations")


class RecommendationEngine:
    """
    Hybrid recommendation system combining:
    1. Collaborative filtering (user-item interactions)
    2. Content-based filtering (product attributes)
    3. Popularity-based fallback
    """

    # Product data (in production, this would come from DB)
    PRODUCT_FEATURES = {
        # product_id: [category_vec, price_range, skin_tone_range, tags_vec]
        # Encoded as feature vectors for ML model
    }

    # Interaction weights
    INTERACTION_WEIGHTS = {
        'view': 0.5,
        'wishlist': 1.5,
        'cart_add': 2.0,
        'purchase': 3.0,
        'review': 2.5
    }

    def __init__(self, model_path: str = None):
        self.model = None
        self.user_embeddings: Dict[str, np.ndarray] = {}
        self.product_embeddings: Dict[str, np.ndarray] = {}
        self.product_popularity: Dict[str, float] = {}
        self.interaction_matrix: Dict[str, Dict[str, float]] = {}

        if TF_AVAILABLE and model_path and os.path.exists(model_path):
            self._load_model(model_path)
        else:
            self._initialize_default_model()

        # Load cached product data
        self._load_product_data()

    def _initialize_default_model(self):
        """Build a simple neural collaborative filtering model"""
        if not TF_AVAILABLE:
            return

        try:
            embedding_dim = 32
            num_users = 1000   # placeholder size
            num_products = 500

            # User tower
            user_input = keras.Input(shape=(1,), name='user_input')
            user_embedding = keras.layers.Embedding(
                num_users, embedding_dim, name='user_embedding'
            )(user_input)
            user_vec = keras.layers.Flatten()(user_embedding)

            # Product tower
            product_input = keras.Input(shape=(1,), name='product_input')
            product_embedding = keras.layers.Embedding(
                num_products, embedding_dim, name='product_embedding'
            )(product_input)
            product_vec = keras.layers.Flatten()(product_embedding)

            # Interaction
            dot = keras.layers.Dot(axes=1)([user_vec, product_vec])
            output = keras.layers.Activation('sigmoid')(dot)

            self.model = keras.Model(
                inputs=[user_input, product_input],
                outputs=output
            )
            self.model.compile(
                optimizer='adam',
                loss='binary_crossentropy',
                metrics=['accuracy']
            )
            logger.info("Neural collaborative filtering model initialized")
        except Exception as e:
            logger.error(f"Failed to initialize TF model: {e}")
            self.model = None

    def _load_model(self, model_path: str):
        """Load pre-trained model"""
        try:
            self.model = keras.models.load_model(model_path)
            logger.info(f"Loaded model from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self._initialize_default_model()

    def _load_product_data(self):
        """Load product metadata for content-based filtering"""
        # In production, this fetches from database
        # For now, we use hardcoded product popularity scores
        self.product_popularity = {
            # These IDs would be real UUIDs from DB in production
            'lipstick': 0.95,
            'eyeshadow': 0.88,
            'foundation': 0.92,
            'moisturizer': 0.85,
            'serum': 0.78
        }

    def update_interaction(self, user_id: str, product_id: str, interaction_type: str):
        """Update the interaction matrix with new user-product interaction"""
        weight = self.INTERACTION_WEIGHTS.get(interaction_type, 1.0)

        if user_id not in self.interaction_matrix:
            self.interaction_matrix[user_id] = {}

        current = self.interaction_matrix[user_id].get(product_id, 0.0)
        self.interaction_matrix[user_id][product_id] = min(current + weight, 10.0)

        logger.debug(f"Updated interaction: user={user_id}, product={product_id}, type={interaction_type}")

    def recommend(self, user_id: Optional[str], limit: int = 8, context: str = 'homepage') -> List[str]:
        """
        Generate product recommendations for a user.
        Falls back gracefully: neural CF -> item-based CF -> popularity
        """
        if not user_id:
            return self._popularity_based(limit)

        # Try neural CF first
        if self.model is not None and TF_AVAILABLE:
            try:
                return self._neural_cf_recommend(user_id, limit)
            except Exception as e:
                logger.warning(f"Neural CF failed: {e}, falling back")

        # Try interaction-based CF
        user_history = self.interaction_matrix.get(user_id, {})
        if user_history:
            return self._interaction_based_recommend(user_id, user_history, limit)

        # Final fallback: popularity
        return self._popularity_based(limit)

    def _neural_cf_recommend(self, user_id: str, limit: int) -> List[str]:
        """Neural collaborative filtering recommendations"""
        # Get user index (hash-based for demo)
        user_idx = abs(hash(user_id)) % 1000

        # Score all products
        product_indices = list(range(min(500, limit * 10)))
        user_ids = np.array([user_idx] * len(product_indices))
        product_ids_arr = np.array(product_indices)

        scores = self.model.predict(
            [user_ids, product_ids_arr],
            verbose=0
        ).flatten()

        # Get top products (skip already interacted)
        seen_products = set(self.interaction_matrix.get(user_id, {}).keys())
        top_indices = np.argsort(scores)[::-1]

        results = []
        for idx in top_indices:
            product_key = str(product_indices[idx])
            if product_key not in seen_products:
                # Map index to real product ID in production
                results.append(product_key)
            if len(results) >= limit:
                break

        return results

    def _interaction_based_recommend(
        self, user_id: str, user_history: Dict[str, float], limit: int
    ) -> List[str]:
        """Item-based collaborative filtering using interaction history"""
        # Find similar users
        similar_users = []
        for other_user, other_history in self.interaction_matrix.items():
            if other_user == user_id:
                continue

            # Cosine similarity between user interaction vectors
            common_products = set(user_history.keys()) & set(other_history.keys())
            if not common_products:
                continue

            u1 = np.array([user_history[p] for p in common_products])
            u2 = np.array([other_history[p] for p in common_products])

            norm1, norm2 = np.linalg.norm(u1), np.linalg.norm(u2)
            if norm1 == 0 or norm2 == 0:
                continue

            similarity = np.dot(u1, u2) / (norm1 * norm2)
            similar_users.append((other_user, similarity))

        similar_users.sort(key=lambda x: x[1], reverse=True)
        top_similar = similar_users[:10]

        # Aggregate products from similar users
        candidate_scores: Dict[str, float] = {}
        seen = set(user_history.keys())

        for similar_user_id, similarity in top_similar:
            for product_id, interaction_score in self.interaction_matrix[similar_user_id].items():
                if product_id not in seen:
                    candidate_scores[product_id] = (
                        candidate_scores.get(product_id, 0) + similarity * interaction_score
                    )

        # Sort and return top candidates
        sorted_candidates = sorted(
            candidate_scores.items(), key=lambda x: x[1], reverse=True
        )

        return [pid for pid, _ in sorted_candidates[:limit]]

    def _popularity_based(self, limit: int) -> List[str]:
        """Return most popular products as fallback"""
        sorted_products = sorted(
            self.product_popularity.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [pid for pid, _ in sorted_products[:limit]]

    def similar(self, product_id: str, limit: int = 4) -> List[str]:
        """Find products similar to a given product"""
        # Build co-occurrence matrix from interactions
        product_cooccurrence: Dict[str, Dict[str, int]] = {}

        for user_id, user_history in self.interaction_matrix.items():
            products = list(user_history.keys())
            if product_id not in products:
                continue

            for other_product in products:
                if other_product == product_id:
                    continue

                if product_id not in product_cooccurrence:
                    product_cooccurrence[product_id] = {}

                product_cooccurrence[product_id][other_product] = (
                    product_cooccurrence[product_id].get(other_product, 0) + 1
                )

        if product_id in product_cooccurrence:
            similar = sorted(
                product_cooccurrence[product_id].items(),
                key=lambda x: x[1],
                reverse=True
            )
            return [pid for pid, _ in similar[:limit]]

        # Fallback: return some popular products
        return self._popularity_based(limit)

    def train_from_interactions(self, interactions: List[Dict]):
        """
        Incremental training from new interactions.
        In production, this would run as a batch job.
        """
        if not TF_AVAILABLE or self.model is None:
            # Just update interaction matrix
            for interaction in interactions:
                self.update_interaction(
                    interaction['user_id'],
                    interaction['product_id'],
                    interaction['type']
                )
            return

        # Build training data
        user_ids, product_ids, labels = [], [], []

        for interaction in interactions:
            user_idx = abs(hash(interaction['user_id'])) % 1000
            product_idx = abs(hash(interaction['product_id'])) % 500
            weight = self.INTERACTION_WEIGHTS.get(interaction['type'], 1.0)

            user_ids.append(user_idx)
            product_ids.append(product_idx)
            labels.append(min(weight / 3.0, 1.0))  # Normalize to [0,1]

            self.update_interaction(
                interaction['user_id'],
                interaction['product_id'],
                interaction['type']
            )

        if user_ids:
            X_users = np.array(user_ids)
            X_products = np.array(product_ids)
            y = np.array(labels)

            self.model.fit(
                [X_users, X_products], y,
                epochs=5,
                batch_size=32,
                verbose=0
            )
            logger.info(f"Model updated with {len(interactions)} interactions")
