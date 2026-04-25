"""Conversation memory for the KrishiAI assistant.

Identical dual-backend pattern as services/weather_cache.py:
  * Redis (if REDIS_URL is set) — shared across replicas, survives restarts.
  * In-memory TTL dict — zero-infra fallback for dev.

Each session:
  * 30-minute sliding TTL — TTL resets on every touch.
  * Hard cap of MAX_TURNS kept in the in-prompt history (full log archived
    only in Redis if you wire up a DB later).
  * Stores Message objects as serialised JSON.
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from core.config import settings
from schemas.chatbot import LocationHint, Message, SessionState

log = logging.getLogger(__name__)

SESSION_TTL_SECONDS = 60 * 30  # 30 min sliding
MAX_TURNS_IN_PROMPT = 12       # keep last N (user+assistant) messages in prompt
MAX_SESSIONS_MEMORY = 2000     # cap for in-memory backend


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# In-memory backend
# ---------------------------------------------------------------------------
class _MemoryBackend:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._store: Dict[str, Dict[str, Any]] = {}
        self._expiry: Dict[str, float] = {}

    async def _evict(self) -> None:
        now = time.time()
        # Evict expired entries first.
        expired = [k for k, exp in self._expiry.items() if exp <= now]
        for k in expired:
            self._store.pop(k, None)
            self._expiry.pop(k, None)
        # Hard cap.
        while len(self._store) > MAX_SESSIONS_MEMORY:
            oldest = min(self._expiry.items(), key=lambda kv: kv[1])[0]
            self._store.pop(oldest, None)
            self._expiry.pop(oldest, None)

    async def get(self, sid: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            await self._evict()
            exp = self._expiry.get(sid)
            if not exp or exp <= time.time():
                self._store.pop(sid, None)
                self._expiry.pop(sid, None)
                return None
            return self._store[sid]

    async def set(self, sid: str, data: Dict[str, Any]) -> None:
        async with self._lock:
            self._store[sid] = data
            self._expiry[sid] = time.time() + SESSION_TTL_SECONDS
            await self._evict()

    async def delete(self, sid: str) -> None:
        async with self._lock:
            self._store.pop(sid, None)
            self._expiry.pop(sid, None)

    @property
    def name(self) -> str:
        return "memory"


# ---------------------------------------------------------------------------
# Redis backend (optional)
# ---------------------------------------------------------------------------
class _RedisBackend:
    """Thin async Redis client. Graceful on failure — callers get None."""

    def __init__(self, url: str) -> None:
        import redis.asyncio as redis_asyncio  # type: ignore

        self._redis = redis_asyncio.from_url(url, decode_responses=True)
        self._url = url

    @staticmethod
    def _key(sid: str) -> str:
        return f"krishiai:chat:session:{sid}"

    async def get(self, sid: str) -> Optional[Dict[str, Any]]:
        try:
            raw = await self._redis.get(self._key(sid))
            if not raw:
                return None
            # Refresh TTL on touch (sliding).
            await self._redis.expire(self._key(sid), SESSION_TTL_SECONDS)
            return json.loads(raw)
        except Exception as e:  # pragma: no cover
            log.warning("Redis session GET failed: %s", e)
            return None

    async def set(self, sid: str, data: Dict[str, Any]) -> None:
        try:
            await self._redis.set(
                self._key(sid), json.dumps(data, default=str), ex=SESSION_TTL_SECONDS
            )
        except Exception as e:  # pragma: no cover
            log.warning("Redis session SET failed: %s", e)

    async def delete(self, sid: str) -> None:
        try:
            await self._redis.delete(self._key(sid))
        except Exception:  # pragma: no cover
            pass

    @property
    def name(self) -> str:
        return f"redis({self._url.split('@')[-1]})"


def _build_backend():
    if settings.REDIS_URL:
        try:
            return _RedisBackend(settings.REDIS_URL)
        except Exception as e:
            log.warning("Failed to init Redis for chat memory: %s — using in-memory", e)
    return _MemoryBackend()


# ---------------------------------------------------------------------------
# Public facade — what callers use
# ---------------------------------------------------------------------------
class SessionStore:
    def __init__(self) -> None:
        self._backend = _build_backend()

    @property
    def backend_name(self) -> str:
        return self._backend.name

    async def create(
        self, language: str = "auto", location: Optional[LocationHint] = None
    ) -> SessionState:
        now = datetime.now(timezone.utc)
        sid = uuid.uuid4().hex
        state = SessionState(
            id=sid,
            language=language,  # type: ignore[arg-type]
            location=location,
            messages=[],
            created_at=now,
            updated_at=now,
        )
        await self._backend.set(sid, state.model_dump(mode="json"))
        return state

    async def get(self, sid: str) -> Optional[SessionState]:
        raw = await self._backend.get(sid)
        if not raw:
            return None
        try:
            return SessionState.model_validate(raw)
        except Exception as e:  # pragma: no cover
            log.warning("Failed to parse session %s: %s", sid, e)
            return None

    async def append(self, sid: str, message: Message) -> SessionState:
        state = await self.get(sid)
        if not state:
            # Expired/missing — reincarnate with the same id so the widget
            # doesn't lose continuity in the middle of a burst.
            now = datetime.now(timezone.utc)
            state = SessionState(
                id=sid,
                language="auto",
                messages=[],
                created_at=now,
                updated_at=now,
            )
        state.messages.append(message)
        state.updated_at = datetime.now(timezone.utc)
        await self._backend.set(sid, state.model_dump(mode="json"))
        return state

    async def delete(self, sid: str) -> None:
        await self._backend.delete(sid)

    @staticmethod
    def trim_for_prompt(messages: List[Message], max_turns: int = MAX_TURNS_IN_PROMPT) -> List[Message]:
        """Keep at most max_turns most recent user/assistant messages (in order)."""
        # System messages aren't stored here (they're injected fresh each turn).
        recent = [m for m in messages if m.role in ("user", "assistant", "tool")]
        return recent[-max_turns:]


# Module-level singleton, imported by chat_service and the API layer.
sessions = SessionStore()
