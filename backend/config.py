"""
config.py — Application configuration
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(override=True)


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'glamour-ai-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:password@localhost:5432/glamour_ai'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 10,
        'max_overflow': 20
    }

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # AI Service
    AI_SERVICE_URL = os.getenv('AI_SERVICE_URL', 'http://localhost:5001')

    # Anthropic (for chatbot)
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')

    # Pagination
    DEFAULT_PAGE_SIZE = 12
    MAX_PAGE_SIZE = 100


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
