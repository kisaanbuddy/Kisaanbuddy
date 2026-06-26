"""Centralized rate limiting decorator for the KisaanBuddy FastAPI app."""
from __future__ import annotations

import logging
from core.config import settings

log = logging.getLogger(__name__)

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    _HAS_SLOWAPI = True
except ImportError:
    _HAS_SLOWAPI = False

# Module-level limiter instance used for decorators
if _HAS_SLOWAPI:
    limiter = Limiter(key_func=get_remote_address, default_limits=[])
else:
    limiter = None


def rate_limit(spec: str):
    """Decorator that limits endpoint access per-IP or no-ops if slowapi is missing."""
    def wrap(fn):
        if limiter is None:
            return fn
        return limiter.limit(spec)(fn)
    return wrap
