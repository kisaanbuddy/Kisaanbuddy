"""WhatsApp Conversation State Machine for KisaanBuddy."""
from __future__ import annotations

import json
import logging
import time
from enum import Enum
from typing import Any, Dict, Optional, Tuple

try:
    from redis import asyncio as aioredis
except ImportError:
    aioredis = None

from core.config import settings

log = logging.getLogger(__name__)

SESSION_TTL_SECONDS = 86400  # 24 hours idle expiration


class WhatsAppState(str, Enum):
    NEW_USER = "NEW_USER"
    LANGUAGE_SELECTION = "LANGUAGE_SELECTION"
    MAIN_MENU = "MAIN_MENU"
    CROP_DOCTOR_WAITING_FOR_IMAGE = "CROP_DOCTOR_WAITING_FOR_IMAGE"
    CROP_DOCTOR_PROCESSING = "CROP_DOCTOR_PROCESSING"
    CROP_DOCTOR_RESULT = "CROP_DOCTOR_RESULT"
    AGRICULTURAL_QUESTION = "AGRICULTURAL_QUESTION"
    WEBSITE_REDIRECTION = "WEBSITE_REDIRECTION"
    HUMAN_SUPPORT = "HUMAN_SUPPORT"
    SESSION_EXPIRED = "SESSION_EXPIRED"


# Local in-memory store for dev / fallback
_LOCAL_SESSION_STORE: Dict[str, Tuple[float, Dict[str, Any]]] = {}


class ConversationStateManager:
    """Manages farmer conversation state, session expiration, and state transitions."""

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
                    log.info("WhatsApp state manager using Redis: %s", redis_url)
                except Exception as e:
                    log.warning("WhatsApp state manager Redis connection failed (%s); using in-memory.", e)
                    self._redis = None
        return self._redis

    def _make_key(self, phone_number: str) -> str:
        return f"wa_state:{phone_number}"

    async def get_state(self, phone_number: str) -> Tuple[WhatsAppState, Dict[str, Any], bool]:
        """Returns (current_state, context_data, is_expired)."""
        r = await self._get_redis()
        raw_data = None

        if r:
            try:
                raw_data = await r.get(self._make_key(phone_number))
            except Exception as e:
                log.warning("Error reading state from Redis: %s", e)

        now = time.time()
        if raw_data is None:
            # Check local in-memory
            entry = _LOCAL_SESSION_STORE.get(phone_number)
            if entry:
                exp_at, ctx = entry
                if now > exp_at:
                    return WhatsAppState.SESSION_EXPIRED, ctx, True
                state_str = ctx.get("state", WhatsAppState.MAIN_MENU.value)
                return WhatsAppState(state_str), ctx, False
            # Brand new user
            return WhatsAppState.NEW_USER, {}, False

        try:
            parsed = json.loads(raw_data)
            state_str = parsed.get("state", WhatsAppState.MAIN_MENU.value)
            last_activity = parsed.get("last_activity", now)
            if now - last_activity > SESSION_TTL_SECONDS:
                return WhatsAppState.SESSION_EXPIRED, parsed, True
            return WhatsAppState(state_str), parsed, False
        except Exception as e:
            log.warning("Failed parsing state JSON for %s: %s", phone_number, e)
            return WhatsAppState.MAIN_MENU, {}, False

    async def set_state(
        self,
        phone_number: str,
        state: WhatsAppState,
        context_updates: Optional[Dict[str, Any]] = None,
        ttl_seconds: int = SESSION_TTL_SECONDS,
    ) -> Dict[str, Any]:
        """Sets the conversation state and persists updated context."""
        now = time.time()
        _, current_ctx, _ = await self.get_state(phone_number)
        updated_ctx = dict(current_ctx)
        if context_updates:
            updated_ctx.update(context_updates)

        updated_ctx["state"] = state.value
        updated_ctx["last_activity"] = now

        r = await self._get_redis()
        serialized = json.dumps(updated_ctx)

        if r:
            try:
                await r.set(self._make_key(phone_number), serialized, ex=ttl_seconds)
            except Exception as e:
                log.warning("Error writing state to Redis: %s", e)

        _LOCAL_SESSION_STORE[phone_number] = (now + ttl_seconds, updated_ctx)
        return updated_ctx

    async def clear_state(self, phone_number: str) -> None:
        """Resets conversation state to MAIN_MENU."""
        r = await self._get_redis()
        if r:
            try:
                await r.delete(self._make_key(phone_number))
            except Exception as e:
                log.warning("Error clearing state in Redis: %s", e)
        _LOCAL_SESSION_STORE.pop(phone_number, None)


state_manager = ConversationStateManager()
