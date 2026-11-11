"""WhatsApp Conversation State Machine for KisaanBuddy.

Provides hybrid multi-tier persistence (Redis -> In-Memory Cache -> PostgreSQL/SQLite).
Guarantees conversation state and language preference survive process restarts.
"""
from __future__ import annotations

import json
import logging
import time
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional, Tuple

from sqlalchemy.orm import Session

try:
    from redis import asyncio as aioredis
except ImportError:
    aioredis = None

from core.config import settings
from db.models import WhatsAppUser
from db.session import SessionLocal

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
    WEATHER_WAITING_FOR_LOCATION = "WEATHER_WAITING_FOR_LOCATION"
    MANDI_WAITING_FOR_COMMODITY = "MANDI_WAITING_FOR_COMMODITY"
    SCHEMES_SEARCH = "SCHEMES_SEARCH"
    WEBSITE_REDIRECTION = "WEBSITE_REDIRECTION"
    HUMAN_SUPPORT = "HUMAN_SUPPORT"
    SESSION_EXPIRED = "SESSION_EXPIRED"


# Local in-memory session cache for fast worker lookup
_LOCAL_SESSION_STORE: Dict[str, Tuple[float, Dict[str, Any]]] = {}


class ConversationStateManager:
    """Manages farmer conversation state, session expiration, and state transitions.

    Tier 1: Redis cache (if configured and reachable).
    Tier 2: In-memory session store (fast worker cache).
    Tier 3: Relational DB (whatsapp_users table) for cross-restart durable state.
    """

    def __init__(self) -> None:
        self._redis = None
        self._redis_checked = False

    def clear_cache(self, phone_number: Optional[str] = None) -> None:
        """Clears local in-memory state cache for a phone number or all users."""
        if phone_number:
            _LOCAL_SESSION_STORE.pop(phone_number, None)
        else:
            _LOCAL_SESSION_STORE.clear()

    async def _get_redis(self):
        if not self._redis_checked:
            self._redis_checked = True
            redis_url = settings.REDIS_URL
            if redis_url and aioredis:
                try:
                    client = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
                    await client.ping()
                    self._redis = client
                    log.info("WhatsApp state manager connected to Redis: %s", redis_url)
                except Exception as e:
                    log.warning("WhatsApp state manager Redis connection failed (%s); using DB/in-memory fallback.", e)
                    self._redis = None
        return self._redis

    def _make_key(self, phone_number: str) -> str:
        return f"wa_state:{phone_number}"

    async def get_state(
        self,
        phone_number: str,
        db: Optional[Session] = None,
    ) -> Tuple[WhatsAppState, Dict[str, Any], bool]:
        """Returns (current_state, context_data, is_expired)."""
        now = time.time()

        # 1. Check Redis
        r = await self._get_redis()
        if r:
            try:
                raw_data = await r.get(self._make_key(phone_number))
                if raw_data:
                    parsed = json.loads(raw_data)
                    state_str = parsed.get("state", WhatsAppState.MAIN_MENU.value)
                    last_activity = parsed.get("last_activity", now)
                    if now - last_activity > SESSION_TTL_SECONDS:
                        return WhatsAppState.SESSION_EXPIRED, parsed, True
                    try:
                        state_enum = WhatsAppState(state_str)
                    except ValueError:
                        state_enum = WhatsAppState.MAIN_MENU
                    return state_enum, parsed, False
            except Exception as e:
                log.warning("Error reading state from Redis for %s: %s", phone_number, e)

        # 2. Check local in-memory store
        entry = _LOCAL_SESSION_STORE.get(phone_number)
        if entry:
            exp_at, ctx = entry
            if now > exp_at:
                return WhatsAppState.SESSION_EXPIRED, ctx, True
            state_str = ctx.get("state", WhatsAppState.MAIN_MENU.value)
            try:
                state_enum = WhatsAppState(state_str)
            except ValueError:
                state_enum = WhatsAppState.MAIN_MENU
            return state_enum, ctx, False

        # 3. Durable fallback: query relational database
        session = db
        should_close = False
        if session is None and SessionLocal:
            session = SessionLocal()
            should_close = True

        if session:
            try:
                wa_user = session.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone_number).first()
                if wa_user:
                    state_str = wa_user.current_state or WhatsAppState.MAIN_MENU.value
                    ctx: Dict[str, Any] = {}
                    if getattr(wa_user, "context_data_json", None):
                        try:
                            ctx = json.loads(wa_user.context_data_json)
                        except Exception:
                            ctx = {}
                    ctx["language"] = wa_user.language or "en"
                    ctx["opted_in"] = wa_user.opted_in

                    last_active = wa_user.last_active_at
                    last_ts = last_active.timestamp() if last_active else now
                    is_expired = (now - last_ts) > SESSION_TTL_SECONDS

                    try:
                        state_enum = WhatsAppState(state_str)
                    except ValueError:
                        state_enum = WhatsAppState.MAIN_MENU

                    # Warm local cache
                    _LOCAL_SESSION_STORE[phone_number] = (now + SESSION_TTL_SECONDS, ctx)

                    if is_expired:
                        return WhatsAppState.SESSION_EXPIRED, ctx, True
                    return state_enum, ctx, False
            except Exception as e:
                log.warning("Database fallback state query failed for %s: %s", phone_number, e)
            finally:
                if should_close and session:
                    session.close()

        # 4. Brand new user (no record in Redis, cache or DB)
        return WhatsAppState.NEW_USER, {}, False

    async def set_state(
        self,
        phone_number: str,
        state: WhatsAppState,
        context_updates: Optional[Dict[str, Any]] = None,
        ttl_seconds: int = SESSION_TTL_SECONDS,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Sets the conversation state and persists updated context across Redis, memory, and database."""
        now = time.time()
        _, current_ctx, _ = await self.get_state(phone_number, db=db)
        updated_ctx = dict(current_ctx)
        if context_updates:
            updated_ctx.update(context_updates)

        updated_ctx["state"] = state.value
        updated_ctx["last_activity"] = now

        # Tier 1: Redis
        r = await self._get_redis()
        serialized = json.dumps(updated_ctx)
        if r:
            try:
                await r.set(self._make_key(phone_number), serialized, ex=ttl_seconds)
            except Exception as e:
                log.warning("Error writing state to Redis for %s: %s", phone_number, e)

        # Tier 2: In-memory cache
        _LOCAL_SESSION_STORE[phone_number] = (now + ttl_seconds, updated_ctx)

        # Tier 3: Relational database persistence
        session = db
        should_close = False
        if session is None and SessionLocal:
            session = SessionLocal()
            should_close = True

        if session:
            try:
                wa_user = session.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone_number).first()
                if wa_user:
                    wa_user.current_state = state.value
                    if hasattr(wa_user, "context_data_json"):
                        wa_user.context_data_json = serialized
                    wa_user.last_active_at = datetime.utcnow()
                    session.commit()
            except Exception as e:
                try:
                    session.rollback()
                except Exception:
                    pass
                log.warning("Failed persisting WhatsApp state to DB for %s: %s", phone_number, e)
            finally:
                if should_close and session:
                    session.close()

        return updated_ctx

    async def clear_state(self, phone_number: str, db: Optional[Session] = None) -> None:
        """Resets conversation state to MAIN_MENU."""
        r = await self._get_redis()
        if r:
            try:
                await r.delete(self._make_key(phone_number))
            except Exception as e:
                log.warning("Error clearing state in Redis for %s: %s", phone_number, e)

        _LOCAL_SESSION_STORE.pop(phone_number, None)

        session = db
        should_close = False
        if session is None and SessionLocal:
            session = SessionLocal()
            should_close = True

        if session:
            try:
                wa_user = session.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone_number).first()
                if wa_user:
                    wa_user.current_state = WhatsAppState.MAIN_MENU.value
                    if hasattr(wa_user, "context_data_json"):
                        wa_user.context_data_json = "{}"
                    session.commit()
            except Exception as e:
                try:
                    session.rollback()
                except Exception:
                    pass
                log.warning("Failed clearing WhatsApp state in DB for %s: %s", phone_number, e)
            finally:
                if should_close and session:
                    session.close()


state_manager = ConversationStateManager()
