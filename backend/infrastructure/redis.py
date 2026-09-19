"""Redis Infrastructure Client for KisaanBuddy Backend V2.

Provides connection pooling, lifecycle management, and graceful degradation
fallback to in-memory dictionary cache if Redis instance is unavailable.
"""
from typing import Optional, Any
import os
import json
import logging
import time

log = logging.getLogger("krishiai.redis")

REDIS_URL = os.getenv("REDIS_URL", "").strip()


class RedisClient:
    def __init__(self, url: Optional[str] = None):
        self.url = url or REDIS_URL
        self._client = None
        self._fallback_memory: dict = {}
        self._fallback_ttl: dict = {}
        self._is_connected = False
        self._connect()

    def _connect(self):
        if not self.url:
            log.info("REDIS_URL not configured. Running with in-memory state fallback.")
            return

        try:
            import redis
            self._client = redis.Redis.from_url(
                self.url,
                decode_responses=True,
                socket_timeout=3.0,
                socket_connect_timeout=3.0,
                retry_on_timeout=True
            )
            self._client.ping()
            self._is_connected = True
            log.info("Successfully connected to Redis instance at %s", self.url)
        except Exception as e:
            log.warning("Failed to connect to Redis (%s). Falling back to in-memory state.", e)
            self._client = None
            self._is_connected = False

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    def get(self, key: str) -> Optional[str]:
        if self._is_connected and self._client:
            try:
                return self._client.get(key)
            except Exception as e:
                log.error("Redis GET error for key %s: %s", key, e)
                return self._memory_get(key)
        return self._memory_get(key)

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        if self._is_connected and self._client:
            try:
                self._client.set(key, value, ex=ex)
                return True
            except Exception as e:
                log.error("Redis SET error for key %s: %s", key, e)
                return self._memory_set(key, value, ex=ex)
        return self._memory_set(key, value, ex=ex)

    def delete(self, key: str) -> bool:
        if self._is_connected and self._client:
            try:
                self._client.delete(key)
                return True
            except Exception as e:
                log.error("Redis DELETE error for key %s: %s", key, e)
                return self._memory_delete(key)
        return self._memory_delete(key)

    def set_json(self, key: str, data: Any, ex: Optional[int] = None) -> bool:
        payload = json.dumps(data)
        return self.set(key, payload, ex=ex)

    def get_json(self, key: str) -> Optional[Any]:
        val = self.get(key)
        if val:
            try:
                return json.loads(val)
            except Exception as e:
                log.error("Failed to parse JSON for Redis key %s: %s", key, e)
                return None
        return None

    # --- In-memory Fallback Helpers ---
    def _memory_get(self, key: str) -> Optional[str]:
        if key in self._fallback_ttl:
            if time.time() > self._fallback_ttl[key]:
                del self._fallback_memory[key]
                del self._fallback_ttl[key]
                return None
        return self._fallback_memory.get(key)

    def _memory_set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        self._fallback_memory[key] = value
        if ex:
            self._fallback_ttl[key] = time.time() + ex
        elif key in self._fallback_ttl:
            del self._fallback_ttl[key]
        return True

    def _memory_delete(self, key: str) -> bool:
        self._fallback_memory.pop(key, None)
        self._fallback_ttl.pop(key, None)
        return True


redis_client = RedisClient()
