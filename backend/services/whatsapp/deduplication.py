"""Webhook event deduplication and idempotency protection."""
from __future__ import annotations

import logging
import time
from typing import Optional

try:
    from redis import asyncio as aioredis
except ImportError:
    aioredis = None

from core.config import settings

log = logging.getLogger(__name__)

# Fallback in-memory cache when Redis is unavailable
_IN_MEMORY_DEDUP_CACHE: dict[str, float] = {}
_MAX_IN_MEMORY_KEYS = 5000


class Deduplicator:
    def __init__(self) -> None:
        self._redis = None
        self._redis_checked = False

    async def _get_redis(self):
        if not self._redis_checked:
            self._redis_checked = True
            redis_url = settings.REDIS_URL
            if redis_url and aioredis:
                try:
                    client = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
                    await client.ping()
                    self._redis = client
                    log.info("WhatsApp deduplication using Redis: %s", redis_url)
                except Exception as e:
                    log.warning("WhatsApp deduplication Redis connection failed (%s); falling back to in-memory.", e)
                    self._redis = None
        return self._redis

    async def is_duplicate(self, event_id: str, ttl_seconds: int = 86400) -> bool:
        """Returns True if event_id was already processed within ttl_seconds; otherwise records it and returns False."""
        if not event_id:
            return False

        r = await self._get_redis()
        if r:
            try:
                key = f"wa_dedup:{event_id}"
                # SET key 1 EX ttl NX returns True if key was set, None if key already existed
                was_set = await r.set(key, "1", ex=ttl_seconds, nx=True)
                return not bool(was_set)
            except Exception as e:
                log.warning("Redis dedup check error (%s); falling back to in-memory.", e)

        # In-memory fallback
        now = time.time()
        # Clean expired keys if cache grows large
        if len(_IN_MEMORY_DEDUP_CACHE) > _MAX_IN_MEMORY_KEYS:
            expired = [k for k, exp in _IN_MEMORY_DEDUP_CACHE.items() if now > exp]
            for k in expired:
                _IN_MEMORY_DEDUP_CACHE.pop(k, None)

        if event_id in _IN_MEMORY_DEDUP_CACHE:
            if now < _IN_MEMORY_DEDUP_CACHE[event_id]:
                return True

        _IN_MEMORY_DEDUP_CACHE[event_id] = now + ttl_seconds
        return False


deduplicator = Deduplicator()
