"""Multi-tier Translation Cache for KisaanBuddy.

Architecture:
1. L1 In-Memory LRU Cache with TTL (instant lookup, thread-safe)
2. L2 Distributed Redis Cache (if REDIS_URL is configured and reachable)
3. L3 Persistent Database Storage (SQLAlchemy TranslationCacheEntry model)

Cache Key generation:
Uses SHA-256 content hashes of stripped input text + target_language + source_language.
Avoids translating identical strings repeatedly across users, pages, and workers.
"""
from __future__ import annotations

from collections import OrderedDict
from datetime import datetime, timezone
import hashlib
import logging
import threading
import time
from typing import Any, Dict, List, Optional, Tuple

from core.config import settings

log = logging.getLogger(__name__)

# Redis optional import
try:
    import redis
    _HAS_REDIS = True
except ImportError:
    redis = None  # type: ignore
    _HAS_REDIS = False

# SQLAlchemy models optional import
try:
    from db.session import SessionLocal, engine
    from db.models import TranslationCacheEntry
    _HAS_DB = True
except Exception:
    SessionLocal = None  # type: ignore
    engine = None  # type: ignore
    TranslationCacheEntry = None  # type: ignore
    _HAS_DB = False


def compute_content_hash(text: str) -> str:
    """Computes SHA-256 hash for a given text string."""
    clean = text.strip()
    return hashlib.sha256(clean.encode("utf-8")).hexdigest()


class TranslationCache:
    """Thread-safe multi-tier caching engine for machine translations."""

    def __init__(
        self,
        max_memory_entries: int = 10000,
        memory_ttl_seconds: int = 86400 * 7,  # 7 days
        redis_url: Optional[str] = None,
    ):
        self._max_memory_entries = max_memory_entries
        self._memory_ttl_seconds = memory_ttl_seconds
        self._lock = threading.RLock()
        # L1: OrderedDict as LRU cache: cache_key -> (translated_text, provider, expire_time)
        self._memory_cache: OrderedDict[str, Tuple[str, str, float]] = OrderedDict()

        # Metrics
        self.hits = 0
        self.misses = 0

        # L2: Redis client setup
        self._redis_client = None
        target_redis_url = redis_url or settings.REDIS_URL
        if _HAS_REDIS and target_redis_url:
            try:
                client = redis.Redis.from_url(
                    target_redis_url,
                    decode_responses=True,
                    socket_connect_timeout=1.5,
                    socket_timeout=1.5,
                )
                client.ping()
                self._redis_client = client
                log.info("TranslationCache connected to Redis at %s", target_redis_url)
            except Exception as e:
                log.warning("TranslationCache Redis connection failed: %s; falling back to DB/Memory", e)
                self._redis_client = None

    def _make_key(self, content_hash: str, src_lang: str, tgt_lang: str) -> str:
        return f"kb_tr:{src_lang}:{tgt_lang}:{content_hash}"

    def get(self, text: str, source_language: str, target_language: str) -> Optional[Tuple[str, str]]:
        """Retrieves cached translation.

        Returns (translated_text, provider) or None.
        """
        if not text or not text.strip():
            return text, "identity"

        chash = compute_content_hash(text)
        key = self._make_key(chash, source_language, target_language)
        now = time.time()

        # 1. Check L1 Memory Cache
        with self._lock:
            if key in self._memory_cache:
                val, prov, exp = self._memory_cache[key]
                if exp > now:
                    self._memory_cache.move_to_end(key)
                    self.hits += 1
                    return val, prov
                else:
                    del self._memory_cache[key]

        # 2. Check L2 Redis Cache
        if self._redis_client:
            try:
                cached_str = self._redis_client.get(key)
                if cached_str:
                    # Stored as "provider:::translated_text"
                    parts = cached_str.split(":::", 1)
                    prov = parts[0] if len(parts) == 2 else "cache"
                    val = parts[1] if len(parts) == 2 else parts[0]

                    # Populate back into L1
                    with self._lock:
                        self._memory_cache[key] = (val, prov, now + self._memory_ttl_seconds)
                        if len(self._memory_cache) > self._max_memory_entries:
                            self._memory_cache.popitem(last=False)
                    self.hits += 1
                    return val, prov
            except Exception as e:
                log.debug("Redis cache get error: %s", e)

        # 3. Check L3 Database
        if _HAS_DB and SessionLocal and TranslationCacheEntry:
            try:
                session = SessionLocal()
                try:
                    entry = (
                        session.query(TranslationCacheEntry)
                        .filter(
                            TranslationCacheEntry.content_hash == chash,
                            TranslationCacheEntry.target_language == target_language,
                            TranslationCacheEntry.source_language == source_language,
                        )
                        .first()
                    )
                    if entry:
                        val = entry.translated_text
                        prov = entry.provider or "db_cache"
                        # Update hit count asynchronously or locally
                        try:
                            entry.hit_count = (entry.hit_count or 1) + 1
                            session.commit()
                        except Exception:
                            session.rollback()

                        # Populate back into L1 & L2
                        with self._lock:
                            self._memory_cache[key] = (val, prov, now + self._memory_ttl_seconds)
                            if len(self._memory_cache) > self._max_memory_entries:
                                self._memory_cache.popitem(last=False)
                        if self._redis_client:
                            try:
                                self._redis_client.setex(key, self._memory_ttl_seconds, f"{prov}:::{val}")
                            except Exception:
                                pass

                        self.hits += 1
                        return val, prov
                finally:
                    session.close()
            except Exception as e:
                log.debug("Database cache query error: %s", e)

        self.misses += 1
        return None

    def set(
        self,
        text: str,
        source_language: str,
        target_language: str,
        translated_text: str,
        provider: str = "indictrans2",
    ) -> None:
        """Stores translated text across L1 memory, L2 Redis, and L3 database."""
        if not text or not text.strip() or not translated_text:
            return

        chash = compute_content_hash(text)
        key = self._make_key(chash, source_language, target_language)
        now = time.time()
        exp = now + self._memory_ttl_seconds

        # 1. Store in L1 Memory
        with self._lock:
            self._memory_cache[key] = (translated_text, provider, exp)
            if len(self._memory_cache) > self._max_memory_entries:
                self._memory_cache.popitem(last=False)

        # 2. Store in L2 Redis
        if self._redis_client:
            try:
                self._redis_client.setex(key, self._memory_ttl_seconds, f"{provider}:::{translated_text}")
            except Exception as e:
                log.debug("Redis cache set error: %s", e)

        # 3. Store in L3 Database
        if _HAS_DB and SessionLocal and TranslationCacheEntry:
            try:
                session = SessionLocal()
                try:
                    existing = (
                        session.query(TranslationCacheEntry)
                        .filter(
                            TranslationCacheEntry.content_hash == chash,
                            TranslationCacheEntry.target_language == target_language,
                            TranslationCacheEntry.source_language == source_language,
                        )
                        .first()
                    )
                    if existing:
                        existing.translated_text = translated_text
                        existing.provider = provider
                        existing.hit_count = (existing.hit_count or 1) + 1
                    else:
                        new_entry = TranslationCacheEntry(
                            content_hash=chash,
                            source_language=source_language,
                            target_language=target_language,
                            source_text=text[:4000],
                            translated_text=translated_text,
                            provider=provider,
                            hit_count=1,
                        )
                        session.add(new_entry)
                    session.commit()
                except Exception as e:
                    session.rollback()
                    log.debug("Failed to write to DB translation cache: %s", e)
                finally:
                    session.close()
            except Exception as e:
                log.debug("Database session error: %s", e)

    def get_batch(
        self,
        texts: List[str],
        source_language: str,
        target_language: str,
    ) -> Tuple[Dict[int, str], List[Tuple[int, str]]]:
        """Batch cache lookup.

        Returns:
            (cached_translations, missing_items) where cached_translations is {index: translated_text}
            and missing_items is [(index, original_text)]
        """
        cached: Dict[int, str] = {}
        missing: List[Tuple[int, str]] = []

        for idx, text in enumerate(texts):
            res = self.get(text, source_language, target_language)
            if res is not None:
                cached[idx] = res[0]
            else:
                missing.append((idx, text))

        return cached, missing

    def set_batch(
        self,
        items: List[Dict[str, Any]],
        source_language: str,
        target_language: str,
        provider: str = "indictrans2",
    ) -> None:
        """Batch cache store.

        items: List of dicts with keys {"text": str, "translated_text": str}
        """
        for item in items:
            self.set(
                text=item["text"],
                source_language=source_language,
                target_language=target_language,
                translated_text=item["translated_text"],
                provider=provider,
            )

    def get_stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        hit_ratio = (self.hits / total) if total > 0 else 0.0
        return {
            "hits": self.hits,
            "misses": self.misses,
            "total_queries": total,
            "hit_ratio": round(hit_ratio, 4),
            "memory_cache_entries": len(self._memory_cache),
            "redis_connected": self._redis_client is not None,
            "db_cache_available": _HAS_DB and SessionLocal is not None,
        }


# Global singleton instance
translation_cache = TranslationCache()
