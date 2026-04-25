"""Cache layer for weather responses.

Two backends, chosen automatically:
  1. Redis (production) — if settings.REDIS_URL is set and redis is importable.
  2. In-memory TTL dict (MVP / dev) — default.

API is intentionally tiny:
    await cache.get(key) -> Optional[dict]
    await cache.set(key, value, ttl)  # ttl in seconds

Values are JSON-serialized. Pydantic models must be `.model_dump(mode='json')`
before being passed in.
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any, Optional

try:
    from redis import asyncio as aioredis  # redis>=4.2 bundles async client
except ImportError:  # graceful — we fall back to in-memory
    aioredis = None  # type: ignore

from core.config import settings

log = logging.getLogger(__name__)


class InMemoryTTLCache:
    """Thread-safe (via asyncio.Lock) in-memory TTL cache.

    Not suitable for multi-worker production, but perfect for dev and single-
    instance deployments. Auto-evicts expired keys on access.
    """

    def __init__(self, max_size: int = 1024):
        self._store: dict[str, tuple[float, str]] = {}
        self._max_size = max_size
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[dict]:
        async with self._lock:
            record = self._store.get(key)
            if not record:
                return None
            expires_at, payload = record
            if time.time() > expires_at:
                self._store.pop(key, None)
                return None
            try:
                return json.loads(payload)
            except json.JSONDecodeError:
                return None

    async def set(self, key: str, value: Any, ttl: int) -> None:
        async with self._lock:
            # Simple LRU-ish cap: drop oldest if at limit
            if len(self._store) >= self._max_size:
                oldest = min(self._store.items(), key=lambda kv: kv[1][0])[0]
                self._store.pop(oldest, None)
            self._store[key] = (time.time() + ttl, json.dumps(value, default=str))

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._store.pop(key, None)

    async def ping(self) -> bool:
        return True


class RedisTTLCache:
    """Redis-backed cache. Same interface as InMemoryTTLCache."""

    def __init__(self, url: str):
        if aioredis is None:
            raise RuntimeError("redis library not installed")
        self._url = url
        self._client = aioredis.from_url(url, encoding="utf-8", decode_responses=True)

    async def get(self, key: str) -> Optional[dict]:
        try:
            raw = await self._client.get(key)
        except Exception as e:
            log.warning("redis get failed for %s: %s", key, e)
            return None
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return None

    async def set(self, key: str, value: Any, ttl: int) -> None:
        try:
            await self._client.set(key, json.dumps(value, default=str), ex=ttl)
        except Exception as e:
            log.warning("redis set failed for %s: %s", key, e)

    async def delete(self, key: str) -> None:
        try:
            await self._client.delete(key)
        except Exception as e:
            log.warning("redis delete failed for %s: %s", key, e)

    async def ping(self) -> bool:
        try:
            return bool(await self._client.ping())
        except Exception:
            return False

    async def close(self) -> None:
        try:
            await self._client.close()
        except Exception:
            pass


def _build_cache():
    url = getattr(settings, "REDIS_URL", None)
    if url and aioredis is not None:
        try:
            cache = RedisTTLCache(url)
            log.info("Weather cache: Redis backend at %s", url)
            return cache
        except Exception as e:
            log.warning("Redis init failed (%s), falling back to in-memory", e)
    log.info("Weather cache: in-memory backend")
    return InMemoryTTLCache()


# Module-level singleton the orchestrator imports.
cache = _build_cache()


def make_key(endpoint: str, lat: float, lon: float, extra: str = "") -> str:
    """Build cache key. Rounds lat/lon to 2 decimals (~1 km) to maximize hits."""
    return f"weather:{endpoint}:{round(lat, 2)}:{round(lon, 2)}:{extra}".rstrip(":")


def backend_name() -> str:
    return "redis" if isinstance(cache, RedisTTLCache) else "in-memory"
