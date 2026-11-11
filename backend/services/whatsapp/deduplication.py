"""Webhook event deduplication and idempotency protection.

Three-tier deduplication:
Tier 1: Redis cache (atomic SET NX with TTL).
Tier 2: In-memory LRU cache.
Tier 3: Relational DB (whatsapp_messages table check) for persistent cross-restart deduplication.
"""
from __future__ import annotations

import logging
import time
from typing import Optional

from sqlalchemy.orm import Session

try:
    from redis import asyncio as aioredis
except ImportError:
    aioredis = None

from core.config import settings
from db.models import WhatsAppMessage
from db.session import SessionLocal

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

    async def is_duplicate(
        self,
        event_id: str,
        ttl_seconds: int = 86400,
        db: Optional[Session] = None,
    ) -> bool:
        """Returns True if event_id was already processed within ttl_seconds; otherwise records it and returns False."""
        if not event_id:
            return False

        # Tier 1: Redis
        r = await self._get_redis()
        if r:
            try:
                key = f"wa_dedup:{event_id}"
                was_set = await r.set(key, "1", ex=ttl_seconds, nx=True)
                if not bool(was_set):
                    return True
            except Exception as e:
                log.warning("Redis dedup check error (%s); falling back to memory/db.", e)

        # Tier 2: In-memory fallback
        now = time.time()
        if len(_IN_MEMORY_DEDUP_CACHE) > _MAX_IN_MEMORY_KEYS:
            expired = [k for k, exp in _IN_MEMORY_DEDUP_CACHE.items() if now > exp]
            for k in expired:
                _IN_MEMORY_DEDUP_CACHE.pop(k, None)

        if event_id in _IN_MEMORY_DEDUP_CACHE:
            if now < _IN_MEMORY_DEDUP_CACHE[event_id]:
                return True

        # Tier 3: Relational Database check (ensures zero duplicates across restarts)
        session = db
        should_close = False
        if session is None and SessionLocal:
            try:
                session = SessionLocal()
                should_close = True
            except Exception:
                session = None

        if session:
            try:
                exists = session.query(WhatsAppMessage.id).filter(WhatsAppMessage.message_id == event_id).first()
                if exists:
                    _IN_MEMORY_DEDUP_CACHE[event_id] = now + ttl_seconds
                    return True
            except Exception as e:
                log.warning("DB dedup check error for %s: %s", event_id, e)
            finally:
                if should_close and session:
                    session.close()

        _IN_MEMORY_DEDUP_CACHE[event_id] = now + ttl_seconds
        return False

    async def mark_processed(self, event_id: str, ttl_seconds: int = 86400) -> None:
        """Explicitly mark event_id as processed in Redis and memory."""
        if not event_id:
            return
        r = await self._get_redis()
        if r:
            try:
                await r.set(f"wa_dedup:{event_id}", "1", ex=ttl_seconds)
            except Exception:
                pass
        _IN_MEMORY_DEDUP_CACHE[event_id] = time.time() + ttl_seconds

    async def release(self, event_id: str) -> None:
        """Removes event_id from deduplication cache so it can be retried if persistence failed."""
        if not event_id:
            return
        _IN_MEMORY_DEDUP_CACHE.pop(event_id, None)
        r = await self._get_redis()
        if r:
            try:
                await r.delete(f"wa_dedup:{event_id}")
            except Exception:
                pass

    @property
    def _lru_cache(self) -> dict:
        return _IN_MEMORY_DEDUP_CACHE


deduplicator = Deduplicator()
WhatsAppDeduplicator = Deduplicator
