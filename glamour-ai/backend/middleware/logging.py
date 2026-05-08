"""
middleware/logging.py — Request/response logging and rate limiting
"""

import time
import logging
from functools import wraps
from flask import request, jsonify, g
from collections import defaultdict

logger = logging.getLogger(__name__)

# Simple in-memory rate limiter (use Redis in production)
_rate_limit_store: dict = defaultdict(list)

RATE_LIMITS = {
    'auth': (10, 60),       # 10 requests per 60 seconds for auth routes
    'default': (100, 60),   # 100 requests per 60 seconds for other routes
}


def rate_limit(limit: int = 100, window: int = 60):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr or 'unknown'
            key = f"{client_ip}:{request.endpoint}"
            now = time.time()

            # Clean expired entries
            _rate_limit_store[key] = [
                t for t in _rate_limit_store[key]
                if now - t < window
            ]

            if len(_rate_limit_store[key]) >= limit:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retryAfter': window
                }), 429

            _rate_limit_store[key].append(now)
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def setup_logging(app):
    """Configure request logging"""

    @app.before_request
    def before_request():
        g.start_time = time.time()

    @app.after_request
    def after_request(response):
        if hasattr(g, 'start_time'):
            duration = (time.time() - g.start_time) * 1000
            logger.info(
                f"{request.method} {request.path} "
                f"{response.status_code} {duration:.1f}ms"
            )
        return response

    return app
