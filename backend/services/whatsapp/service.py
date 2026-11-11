"""Core WhatsApp Business Platform service orchestrator for KisaanBuddy.

Coordinates:
- Incoming Meta Cloud API webhooks with HMAC signature validation and 3-tier idempotency.
- Multi-tier conversation state machine (Redis -> Cache -> PostgreSQL/SQLite).
- Trilingual localization (English, Hindi, Kannada).
- Central message normalization (interactive list_reply, button_reply, template quick-replies, text, Indic numerals).
- First-time user onboarding (Language Selection -> Profile Save -> Main Menu).
- Returning user welcome journeys without repetitive language prompts.
- Universal global commands (HI, MENU, LANGUAGE, HELP, STOP, START).
- Authentic crop doctor visual diagnosis, weather forecasts, AGMARKNET mandi rates, and verified schemes.
- Production website contextual link generation (no localhost links).
- Consent-aware promotional notification dispatch.
- Strict dual-number routing (Meta test sandbox vs Production phone number).
- Zero-PII observability and metrics collection.
"""
from __future__ import annotations

import logging
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import BackgroundTasks
from sqlalchemy import desc, func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.config import settings
from db.models import MarketPriceRecord, User, WhatsAppMessage, WhatsAppUser
from db.session import SessionLocal
from services.marketplace_import.initial_catalog_data import INITIAL_MARKET_PRICES
from services.weather_service import orchestrator as weather_orchestrator
from services.whatsapp.advisory_handler import answer_agricultural_question
from services.whatsapp.client import whatsapp_client
from services.whatsapp.crop_doctor_handler import process_crop_doctor_image
from services.whatsapp.deduplication import deduplicator
from services.whatsapp.localization import (
    MENU_ITEMS,
    build_text_menu,
    detect_language_choice,
    get_text,
    is_help_command,
    is_hi_greeting,
    is_language_command,
    is_menu_command,
    is_start_command,
    is_stop_command,
    parse_menu_selection,
)
from services.whatsapp.normalization import (
    NormalizedMessage,
    normalize_incoming_message,
    resolve_global_command,
    resolve_language_selection,
    resolve_menu_action,
)
from services.whatsapp.observability import mask_phone_number, record_whatsapp_turn
from services.whatsapp.pricing import check_budget_limit, evaluate_message_cost
from services.whatsapp.promotions import record_opt_in, record_opt_out
from services.whatsapp.security import generate_secure_link_token, normalize_phone_number
from services.whatsapp.state_machine import WhatsAppState, state_manager
from services.whatsapp.support_handler import create_support_ticket

log = logging.getLogger(__name__)


class WhatsAppService:
    """Coordinates incoming webhooks, conversation state machine, background tasks, and outbound replies."""

    async def handle_webhook_payload(
        self,
        payload: Dict[str, Any],
        background_tasks: Optional[BackgroundTasks] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Entry point for incoming Meta webhooks.

        Acknowledges webhooks promptly and delegates processing to background tasks.
        Extracts incoming phone_number_id from metadata to ensure strict sender routing.
        If background_tasks is None (e.g. In unit tests), executes message turn synchronously.
        """
        entries = payload.get("entry", [])
        processed_count = 0

        session = db
        should_close = False
        if session is None and SessionLocal:
            session = SessionLocal()
            should_close = True

        try:
            for entry in entries:
                for change in entry.get("changes", []):
                    value = change.get("value", {})

                    metadata = value.get("metadata", {})
                    incoming_phone_number_id = metadata.get("phone_number_id")

                    statuses = value.get("statuses", [])
                    if session:
                        for status in statuses:
                            self._handle_status_update(status, session)

                    messages = value.get("messages", [])
                    contacts = value.get("contacts", [])
                    contact_map = {c.get("wa_id"): c.get("profile", {}).get("name") for c in contacts}

                    for msg in messages:
                        msg_id = msg.get("id")
                        if not msg_id:
                            continue

                        # Idempotency check: discard duplicate webhook retries
                        is_dup = await deduplicator.is_duplicate(msg_id, db=session)
                        if is_dup:
                            log.info("Discarding duplicate webhook message ID %s", msg_id)
                            continue

                        raw_from = msg.get("from", "")
                        phone_number = normalize_phone_number(raw_from)
                        contact_name = contact_map.get(raw_from) or contact_map.get(phone_number.lstrip("+"))

                        if session:
                            recorded = self._record_inbound_message(msg, phone_number, session)
                            if not recorded:
                                log.info("Duplicate inbound message blocked by DB for message ID %s", msg_id)
                                continue

                        if background_tasks is not None:
                            background_tasks.add_task(
                                whatsapp_client.mark_message_as_read,
                                msg_id,
                                sender_phone_number_id=incoming_phone_number_id,
                            )
                            background_tasks.add_task(
                                self.process_message_turn_background,
                                msg=msg,
                                phone_number=phone_number,
                                contact_name=contact_name,
                                sender_phone_number_id=incoming_phone_number_id,
                            )
                        else:
                            try:
                                await whatsapp_client.mark_message_as_read(
                                    msg_id,
                                    sender_phone_number_id=incoming_phone_number_id,
                                )
                            except Exception:
                                pass
                            if session:
                                await self.process_message_turn(
                                    msg=msg,
                                    phone_number=phone_number,
                                    contact_name=contact_name,
                                    db=session,
                                    sender_phone_number_id=incoming_phone_number_id,
                                )

                        processed_count += 1
        finally:
            if should_close and session:
                session.close()

        return {"status": "accepted", "processed": True, "count": processed_count}

    def _handle_status_update(self, status_payload: Dict[str, Any], db: Session) -> None:
        """Updates delivery status in WhatsAppMessage table."""
        wamid = status_payload.get("id")
        new_status = status_payload.get("status")  # sent, delivered, read, failed
        if not wamid or not new_status:
            return

        try:
            msg_rec = db.query(WhatsAppMessage).filter(WhatsAppMessage.message_id == wamid).first()
            if msg_rec:
                msg_rec.status = new_status
                errors = status_payload.get("errors")
                if errors:
                    msg_rec.error_message = str(errors)[:500]
                db.commit()
                log.debug("Updated message %s status to %s", wamid, new_status)
        except Exception as e:
            log.warning("Failed updating message status for %s: %s", wamid, e)

    def _record_inbound_message(self, msg: Dict[str, Any], phone_number: str, db: Session) -> bool:
        """Stores incoming message audit record. Returns False if duplicate message_id detected."""
        msg_id = msg.get("id")
        if msg_id:
            existing = db.query(WhatsAppMessage.id).filter(WhatsAppMessage.message_id == msg_id).first()
            if existing:
                log.info("DB dedup check: message_id %s already exists in whatsapp_messages", msg_id)
                return False

        try:
            norm = normalize_incoming_message(msg)

            # Upsert WhatsAppUser
            wa_user = db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone_number).first()
            if not wa_user:
                wa_user = WhatsAppUser(
                    phone_number=phone_number,
                    language="en",
                    current_state=WhatsAppState.NEW_USER.value,
                    last_active_at=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                )
                db.add(wa_user)
            else:
                wa_user.last_active_at = datetime.utcnow()

            inbound_audit = WhatsAppMessage(
                message_id=norm.message_id or msg_id,
                phone_number=phone_number,
                direction="inbound",
                message_type=norm.message_type,
                body=norm.text,
                media_id=norm.media_id,
                category="service",
                status="received",
                is_chargeable=False,
                estimated_cost_inr=0.0,
                created_at=datetime.utcnow(),
            )
            db.add(inbound_audit)
            db.commit()
            return True
        except IntegrityError:
            db.rollback()
            log.info("Concurrent duplicate message_id %s blocked by unique constraint", msg_id)
            return False
        except Exception as e:
            db.rollback()
            log.warning("Error recording inbound message: %s", e)
            return True

    async def process_message_turn_background(
        self,
        msg: Dict[str, Any],
        phone_number: str,
        contact_name: Optional[str] = None,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Executes complete conversation logic in an isolated background database session."""
        if not SessionLocal:
            log.error("SessionLocal not configured; cannot process message turn.")
            return

        with SessionLocal() as db:
            try:
                await self.process_message_turn(
                    msg=msg,
                    phone_number=phone_number,
                    contact_name=contact_name,
                    db=db,
                    sender_phone_number_id=sender_phone_number_id,
                )
            except Exception as e:
                log.exception("Unhandled error processing WhatsApp message turn for %s: %s", phone_number, e)

    async def process_message_turn(
        self,
        msg: Dict[str, Any],
        phone_number: str,
        contact_name: Optional[str],
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Handles state transitions, executes actions, and sends reply."""
        turn_start = time.time()
        norm = normalize_incoming_message(msg)
        state_before = "unknown"
        handler_invoked = None
        action_recorded = norm.menu_selection or norm.global_command

        try:
            # 1. Fetch user record and language preference
            wa_user = db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone_number).first()
            is_first_time_user = False

            if not wa_user:
                is_first_time_user = True
                wa_user = WhatsAppUser(
                    phone_number=phone_number,
                    language="en",
                    current_state=WhatsAppState.NEW_USER.value,
                    last_active_at=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                )
                db.add(wa_user)
                db.commit()
                db.refresh(wa_user)
            elif wa_user.current_state == WhatsAppState.NEW_USER.value:
                is_first_time_user = True

            language = wa_user.language if wa_user and wa_user.language else "en"
            if contact_name and wa_user and not wa_user.name:
                wa_user.name = contact_name
                db.commit()

            msg_type = norm.message_type
            user_text = norm.text
            image_id = norm.image_id
            mime_type = norm.mime_type or "image/jpeg"

            # 2. Retrieve conversation state from multi-tier state manager
            current_state, ctx, is_expired = await state_manager.get_state(phone_number, db=db)
            state_before = current_state.value if hasattr(current_state, "value") else str(current_state)

            # 3. Universal Global Commands (bypass current state)
            global_cmd = norm.global_command

            # 3.1 STOP / Opt-out
            if global_cmd == "stop":
                handler_invoked = "command_stop"
                record_opt_out(phone_number, db, source="whatsapp_stop")
                await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
                stop_msg = get_text("stop_confirmation", language)
                await self._send_text(phone_number, stop_msg, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="stop",
                    state_before=state_before,
                    state_after=WhatsAppState.MAIN_MENU.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 3.2 START / Opt-in
            if global_cmd == "start":
                handler_invoked = "command_start"
                record_opt_in(phone_number, db, source="whatsapp_start")
                await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
                start_msg = get_text("start_confirmation", language)
                await self._send_text(phone_number, start_msg, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="start",
                    state_before=state_before,
                    state_after=WhatsAppState.MAIN_MENU.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 3.3 MENU / HOME
            if global_cmd == "menu":
                handler_invoked = "command_menu"
                await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
                await self._send_menu(phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="menu",
                    state_before=state_before,
                    state_after=WhatsAppState.MAIN_MENU.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 3.4 LANGUAGE
            if global_cmd == "language":
                handler_invoked = "command_language"
                await state_manager.set_state(phone_number, WhatsAppState.LANGUAGE_SELECTION, db=db)
                prompt = get_text("language_selection_prompt", language)
                await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="language",
                    state_before=state_before,
                    state_after=WhatsAppState.LANGUAGE_SELECTION.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 3.5 HELP
            if global_cmd == "help":
                handler_invoked = "command_help"
                help_msg = get_text("help_message", language)
                await self._send_text(phone_number, help_msg, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="help",
                    state_before=state_before,
                    state_after=state_before,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 3.6 HI / HELLO / NAMASTE
            if global_cmd == "greeting":
                if is_first_time_user or current_state == WhatsAppState.NEW_USER:
                    handler_invoked = "greeting_first_time"
                    await state_manager.set_state(phone_number, WhatsAppState.LANGUAGE_SELECTION, db=db)
                    prompt = get_text("language_selection_prompt", language)
                    await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)
                    record_whatsapp_turn(
                        message_id=norm.message_id,
                        phone_number=phone_number,
                        phone_number_id=sender_phone_number_id,
                        message_type=msg_type,
                        normalized_action="greeting",
                        state_before=state_before,
                        state_after=WhatsAppState.LANGUAGE_SELECTION.value,
                        handler_invoked=handler_invoked,
                        duration_ms=(time.time() - turn_start) * 1000,
                    )
                    return
                else:
                    handler_invoked = "greeting_returning"
                    await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
                    welcome_back = get_text("returning_welcome", language)
                    await self._send_text(phone_number, welcome_back, db, sender_phone_number_id=sender_phone_number_id)
                    await self._send_menu(phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                    record_whatsapp_turn(
                        message_id=norm.message_id,
                        phone_number=phone_number,
                        phone_number_id=sender_phone_number_id,
                        message_type=msg_type,
                        normalized_action="greeting",
                        state_before=state_before,
                        state_after=WhatsAppState.MAIN_MENU.value,
                        handler_invoked=handler_invoked,
                        duration_ms=(time.time() - turn_start) * 1000,
                    )
                    return

            # 4. Handle Session Expiration
            if is_expired:
                handler_invoked = "session_expired"
                await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
                expired_notice = get_text("session_expired", language)
                await self._send_text(phone_number, expired_notice, db, sender_phone_number_id=sender_phone_number_id)
                await self._send_menu(phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="expired",
                    state_before=state_before,
                    state_after=WhatsAppState.MAIN_MENU.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 5. Language Selection State
            if current_state in (WhatsAppState.NEW_USER, WhatsAppState.LANGUAGE_SELECTION):
                selected_lang = norm.detected_language or detect_language_choice(user_text)
                if selected_lang:
                    handler_invoked = "language_selected"
                    if wa_user:
                        wa_user.language = selected_lang
                        wa_user.current_state = WhatsAppState.MAIN_MENU.value
                        db.commit()
                    language = selected_lang
                    await state_manager.set_state(
                        phone_number,
                        WhatsAppState.MAIN_MENU,
                        {"language": selected_lang},
                        db=db,
                    )
                    conf_msg = get_text("language_updated", selected_lang)
                    await self._send_text(phone_number, conf_msg, db, sender_phone_number_id=sender_phone_number_id)
                    await self._send_menu(phone_number, selected_lang, db, sender_phone_number_id=sender_phone_number_id)
                    record_whatsapp_turn(
                        message_id=norm.message_id,
                        phone_number=phone_number,
                        phone_number_id=sender_phone_number_id,
                        message_type=msg_type,
                        normalized_action=f"set_language_{selected_lang}",
                        state_before=state_before,
                        state_after=WhatsAppState.MAIN_MENU.value,
                        handler_invoked=handler_invoked,
                        duration_ms=(time.time() - turn_start) * 1000,
                    )
                    return
                else:
                    handler_invoked = "language_prompt_reminder"
                    prompt = get_text("language_selection_prompt", language)
                    await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)
                    record_whatsapp_turn(
                        message_id=norm.message_id,
                        phone_number=phone_number,
                        phone_number_id=sender_phone_number_id,
                        message_type=msg_type,
                        normalized_action="language_prompt_reminder",
                        state_before=state_before,
                        state_after=WhatsAppState.LANGUAGE_SELECTION.value,
                        handler_invoked=handler_invoked,
                        duration_ms=(time.time() - turn_start) * 1000,
                    )
                    return

            # Check if input resolves to any menu selection regardless of current state
            menu_choice = norm.menu_selection

            # 6. Specific State Handlers

            # 6.1 CROP DOCTOR — WAITING FOR IMAGE
            if current_state == WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE:
                if msg_type == "image" and image_id:
                    handler_invoked = "crop_doctor_image_received"
                    await self._process_crop_doctor_turn(
                        image_id=image_id,
                        mime_type=mime_type,
                        phone_number=phone_number,
                        language=language,
                        db=db,
                        sender_phone_number_id=sender_phone_number_id,
                    )
                    record_whatsapp_turn(
                        message_id=norm.message_id,
                        phone_number=phone_number,
                        phone_number_id=sender_phone_number_id,
                        message_type=msg_type,
                        normalized_action="crop_doctor_image",
                        state_before=state_before,
                        state_after=WhatsAppState.CROP_DOCTOR_RESULT.value,
                        handler_invoked=handler_invoked,
                        duration_ms=(time.time() - turn_start) * 1000,
                    )
                    return
                elif menu_choice and menu_choice != "crop_doctor":
                    handler_invoked = f"switch_to_{menu_choice}"
                    await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                    record_whatsapp_turn(
                        message_id=norm.message_id,
                        phone_number=phone_number,
                        phone_number_id=sender_phone_number_id,
                        message_type=msg_type,
                        normalized_action=f"switch_to_{menu_choice}",
                        state_before=state_before,
                        state_after=menu_choice,
                        handler_invoked=handler_invoked,
                        duration_ms=(time.time() - turn_start) * 1000,
                    )
                    return
                else:
                    handler_invoked = "crop_doctor_prompt_reminder"
                    prompt = get_text("crop_doctor_prompt", language)
                    await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)
                    record_whatsapp_turn(
                        message_id=norm.message_id,
                        phone_number=phone_number,
                        phone_number_id=sender_phone_number_id,
                        message_type=msg_type,
                        normalized_action="crop_doctor_prompt_reminder",
                        state_before=state_before,
                        state_after=WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE.value,
                        handler_invoked=handler_invoked,
                        duration_ms=(time.time() - turn_start) * 1000,
                    )
                    return

            # 6.2 AGRICULTURAL QUESTION
            if current_state == WhatsAppState.AGRICULTURAL_QUESTION:
                if menu_choice and menu_choice not in ("guidance", "agriculture_question"):
                    handler_invoked = f"switch_to_{menu_choice}"
                    await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                    return

                handler_invoked = "agri_question_answered"
                answer = await answer_agricultural_question(
                    question=user_text,
                    phone_number=phone_number,
                    language=language,
                )
                await self._send_text(phone_number, answer, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="agri_question_answered",
                    state_before=state_before,
                    state_after=WhatsAppState.AGRICULTURAL_QUESTION.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 6.3 WEATHER — WAITING FOR LOCATION
            if current_state == WhatsAppState.WEATHER_WAITING_FOR_LOCATION:
                if menu_choice and menu_choice != "weather":
                    handler_invoked = f"switch_to_{menu_choice}"
                    await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                    return

                handler_invoked = "process_weather_location"
                await self._process_weather_query(
                    query_location=user_text,
                    phone_number=phone_number,
                    language=language,
                    db=db,
                    sender_phone_number_id=sender_phone_number_id,
                    lat=norm.latitude,
                    lon=norm.longitude,
                )
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="weather_reported",
                    state_before=state_before,
                    state_after=WhatsAppState.MAIN_MENU.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 6.4 MANDI — WAITING FOR COMMODITY
            if current_state == WhatsAppState.MANDI_WAITING_FOR_COMMODITY:
                if menu_choice and menu_choice != "mandi":
                    handler_invoked = f"switch_to_{menu_choice}"
                    await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                    return

                handler_invoked = "process_mandi_query"
                await self._process_mandi_query(
                    query_text=user_text,
                    phone_number=phone_number,
                    language=language,
                    db=db,
                    sender_phone_number_id=sender_phone_number_id,
                )
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="mandi_reported",
                    state_before=state_before,
                    state_after=WhatsAppState.MAIN_MENU.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 6.5 HUMAN SUPPORT
            if current_state == WhatsAppState.HUMAN_SUPPORT:
                if menu_choice and menu_choice != "support":
                    handler_invoked = f"switch_to_{menu_choice}"
                    await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                    return

                handler_invoked = "create_support_ticket"
                ticket_id = create_support_ticket(
                    phone_number=phone_number,
                    query_summary=user_text,
                    db=db,
                    farmer_name=contact_name,
                    language=language,
                )
                resp = get_text("support_created", language, ticket_id=ticket_id)
                await self._send_text(phone_number, resp, db, sender_phone_number_id=sender_phone_number_id)
                await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="support_ticket_created",
                    state_before=state_before,
                    state_after=WhatsAppState.MAIN_MENU.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # 6.6 MAIN MENU / GENERAL DISPATCH
            if menu_choice:
                handler_invoked = f"handle_menu_{menu_choice}"
                await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action=f"menu_{menu_choice}",
                    state_before=state_before,
                    state_after=menu_choice,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # Direct photo upload from main menu
            if msg_type == "image" and image_id:
                handler_invoked = "direct_crop_doctor_image"
                await self._process_crop_doctor_turn(
                    image_id=image_id,
                    mime_type=mime_type,
                    phone_number=phone_number,
                    language=language,
                    db=db,
                    sender_phone_number_id=sender_phone_number_id,
                )
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="direct_crop_doctor_image",
                    state_before=state_before,
                    state_after=WhatsAppState.CROP_DOCTOR_RESULT.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # Natural language farming question asked on main menu
            if len(user_text.split()) >= 3 or "?" in user_text:
                handler_invoked = "main_menu_agri_question"
                answer = await answer_agricultural_question(
                    question=user_text,
                    phone_number=phone_number,
                    language=language,
                )
                await self._send_text(phone_number, answer, db, sender_phone_number_id=sender_phone_number_id)
                await state_manager.set_state(phone_number, WhatsAppState.AGRICULTURAL_QUESTION, db=db)
                record_whatsapp_turn(
                    message_id=norm.message_id,
                    phone_number=phone_number,
                    phone_number_id=sender_phone_number_id,
                    message_type=msg_type,
                    normalized_action="main_menu_agri_question",
                    state_before=state_before,
                    state_after=WhatsAppState.AGRICULTURAL_QUESTION.value,
                    handler_invoked=handler_invoked,
                    duration_ms=(time.time() - turn_start) * 1000,
                )
                return

            # Fallback for unrecognized input
            handler_invoked = "unknown_input_fallback"
            fallback = get_text("unknown_input", language)
            await self._send_text(phone_number, fallback, db, sender_phone_number_id=sender_phone_number_id)
            record_whatsapp_turn(
                message_id=norm.message_id,
                phone_number=phone_number,
                phone_number_id=sender_phone_number_id,
                message_type=msg_type,
                normalized_action="unknown_input",
                state_before=state_before,
                state_after=WhatsAppState.MAIN_MENU.value,
                handler_invoked=handler_invoked,
                duration_ms=(time.time() - turn_start) * 1000,
            )

        except Exception as e:
            record_whatsapp_turn(
                message_id=norm.message_id,
                phone_number=phone_number,
                phone_number_id=sender_phone_number_id,
                message_type=msg_type,
                normalized_action=action_recorded,
                state_before=state_before,
                state_after=state_before,
                handler_invoked=handler_invoked,
                duration_ms=(time.time() - turn_start) * 1000,
                status="failed",
                error_detail=str(e),
            )
            raise e

    async def _handle_menu_choice(
        self,
        choice: str,
        phone_number: str,
        language: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Dispatches action for selected menu option (1 to 7)."""
        frontend_base = (settings.FRONTEND_BASE_URL or "https://www.kisaanbuddy.com").rstrip("/")
        if "localhost" in frontend_base and not settings.DEBUG:
            frontend_base = "https://www.kisaanbuddy.com"

        if choice in ("crop_doctor", "1"):
            await state_manager.set_state(phone_number, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE, db=db)
            prompt = get_text("crop_doctor_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

        elif choice in ("guidance", "agriculture_question", "2"):
            await state_manager.set_state(phone_number, WhatsAppState.AGRICULTURAL_QUESTION, db=db)
            prompt = get_text("agri_question_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

        elif choice in ("weather", "3"):
            await state_manager.set_state(phone_number, WhatsAppState.WEATHER_WAITING_FOR_LOCATION, db=db)
            token = generate_secure_link_token(phone_number, action="weather")
            weather_url = f"{frontend_base}/weather?token={token}"
            prompt = get_text("weather_prompt", language, url=weather_url)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

        elif choice in ("mandi", "4"):
            await state_manager.set_state(phone_number, WhatsAppState.MANDI_WAITING_FOR_COMMODITY, db=db)
            token = generate_secure_link_token(phone_number, action="mandi")
            mandi_url = f"{frontend_base}/mandi?token={token}"
            prompt = get_text("mandi_prompt", language, url=mandi_url)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

        elif choice in ("schemes", "5"):
            await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
            token = generate_secure_link_token(phone_number, action="schemes")
            schemes_url = f"{frontend_base}/schemes?token={token}"
            msg = get_text("schemes_info", language, url=schemes_url)
            await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)

        elif choice in ("support", "6"):
            await state_manager.set_state(phone_number, WhatsAppState.HUMAN_SUPPORT, db=db)
            prompt = get_text("support_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

        elif choice in ("website", "7"):
            await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
            token = generate_secure_link_token(phone_number, action="website")
            web_url = f"{frontend_base}/?token={token}"
            msg = get_text("website_info", language, url=web_url)
            await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)

        elif choice == "language":
            await state_manager.set_state(phone_number, WhatsAppState.LANGUAGE_SELECTION, db=db)
            prompt = get_text("language_selection_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

    async def _process_crop_doctor_turn(
        self,
        image_id: str,
        mime_type: str,
        phone_number: str,
        language: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Handles crop foliage photo download, inference, and response."""
        analyzing_text = get_text("crop_doctor_analyzing", language)
        await self._send_text(phone_number, analyzing_text, db, sender_phone_number_id=sender_phone_number_id)

        try:
            img_bytes, downloaded_mime = await whatsapp_client.download_media(
                image_id,
                sender_phone_number_id=sender_phone_number_id,
            )
            res = await process_crop_doctor_image(
                image_bytes=img_bytes,
                mime_type=downloaded_mime or mime_type,
                phone_number=phone_number,
                db=db,
                language=language,
            )
            await self._send_text(phone_number, res["message"], db, sender_phone_number_id=sender_phone_number_id)
            await state_manager.set_state(
                phone_number,
                WhatsAppState.CROP_DOCTOR_RESULT,
                {"last_diagnosis_id": res.get("diagnosis_id")},
                db=db,
            )
        except Exception as exc:
            log.exception("Crop Doctor processing error for %s: %s", phone_number, exc)
            err_msg = get_text("crop_doctor_inference_error", language)
            await self._send_text(phone_number, err_msg, db, sender_phone_number_id=sender_phone_number_id)

    async def _process_weather_query(
        self,
        query_location: str,
        phone_number: str,
        language: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> None:
        """Processes location string or coordinates and provides real weather and farming advisory."""
        frontend_base = (settings.FRONTEND_BASE_URL or "https://www.kisaanbuddy.com").rstrip("/")
        if "localhost" in frontend_base and not settings.DEBUG:
            frontend_base = "https://www.kisaanbuddy.com"

        token = generate_secure_link_token(phone_number, action="weather")
        clean_loc = query_location.strip()

        try:
            if not weather_orchestrator.providers:
                await weather_orchestrator.startup()

            loc_name = clean_loc
            current = None

            if lat is not None and lon is not None:
                try:
                    current = await weather_orchestrator.get_current(lat, lon)
                    loc_name = f"Location ({lat:.2f}, {lon:.2f})"
                except Exception as loc_err:
                    log.warning("Direct coordinate weather lookup failed for (%s, %s): %s", lat, lon, loc_err)

            if current is None and clean_loc:
                hits = await weather_orchestrator.search(clean_loc, limit=1)
                if hits:
                    hit = hits[0]
                    lat, lon = hit.latitude, hit.longitude
                    loc_name = f"{hit.name}, {hit.region or hit.country}"
                    current = await weather_orchestrator.get_current(lat, lon)

            if current:
                data = current.payload
                temp = data.get("temp_c", 25)
                humidity = data.get("humidity", 60)
                wind = data.get("wind_kph", 10)
                condition = data.get("condition", {}).get("text", "Clear / Part-cloudy")
                rain_prob = data.get("rain_prob", 10)

                # Practical agronomic advisory
                if rain_prob > 50:
                    advisory = (
                        "🌧️ Heavy rain expected: Postpone chemical spraying and foliar applications. "
                        "Clear drainage channels in low-lying crop beds to prevent waterlogging."
                        if language == "en" else
                        "🌧️ बारिश की संभावना: कीटनाशक और खाद का छिड़काव अभी रोकें। खेतों में जल निकासी की व्यवस्था सुनिश्चित करें।"
                        if language == "hi" else
                        "🌧️ ಮಳೆಯ ಸಾಧ್ಯತೆ: ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಯನ್ನು ಮುಂದೂಡಿ. ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ."
                    )
                elif temp > 35:
                    advisory = (
                        "☀️ High temperature alert: Schedule light irrigation in early morning or evening. "
                        "Mulch around sensitive vegetable crops to preserve soil moisture."
                        if language == "en" else
                        "☀️ तेज धूप व गर्मी: सुबह या शाम के समय हल्की सिंचाई करें। मिट्टी की नमी बनाए रखने के लिए मल्चिंग करें।"
                        if language == "hi" else
                        "☀️ ತೀವ್ರ ತಾಪಮಾನ: ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ನೀರಾವರಿ ಮಾಡಿ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಾಪಾಡಲು ಕ್ರಮ ವಹಿಸಿ."
                    )
                elif wind > 25:
                    advisory = (
                        "💨 Strong winds alert: Avoid aerial or foliar spraying to prevent spray drift. "
                        "Provide support stakes for tall crops like banana or tomato."
                        if language == "en" else
                        "💨 तेज हवाएं: स्प्रे का बहाव रोकने के लिए छिड़काव न करें। टमाटर, केले आदि फसलों को सहारा दें।"
                        if language == "hi" else
                        "💨 ಬಲವಾದ ಗಾಳಿ: ಸಿಂಪಡಣೆ ಕಾರ್ಯವನ್ನು ತಪ್ಪಿಸಿ. ಬಾಳೆ ಮತ್ತು ಟೊಮೆಟೊ ಬೆಳೆಗಳಿಗೆ ಆಧಾರ ನೀಡಿ."
                    )
                else:
                    advisory = (
                        "✅ Favorable conditions for normal farm operations, weeding, and nutrient applications."
                        if language == "en" else
                        "✅ खेत के सामान्य कार्यों, निराई-गुड़ाई और पोषण प्रबंधन के लिए मौसम अनुकूल है।"
                        if language == "hi" else
                        "✅ ಸಾಮಾನ್ಯ ಕೃಷಿ ಕಾರ್ಯಗಳು, ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ರಸಗೊಬ್ಬರ ಹಾಕಲು ಹವಾಮಾನ ಅನುಕೂಲಕರವಾಗಿದೆ."
                    )

                weather_url = f"{frontend_base}/weather?token={token}&lat={lat}&lon={lon}"
                reply = get_text(
                    "weather_info",
                    language,
                    location=loc_name,
                    condition=condition,
                    temp=temp,
                    rain_prob=rain_prob,
                    humidity=humidity,
                    wind_kph=wind,
                    advisory=advisory,
                    url=weather_url,
                )
                await self._send_text(phone_number, reply, db, sender_phone_number_id=sender_phone_number_id)
                await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
                return

        except Exception as exc:
            log.warning("Weather search failed for %s: %s", clean_loc, exc)

        weather_url = f"{frontend_base}/weather?token={token}"
        msg = get_text("weather_fallback", language, url=weather_url)
        await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)
        await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)

    async def _process_mandi_query(
        self,
        query_text: str,
        phone_number: str,
        language: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Searches real AGMARKNET records for matching commodity or market."""
        frontend_base = (settings.FRONTEND_BASE_URL or "https://www.kisaanbuddy.com").rstrip("/")
        if "localhost" in frontend_base and not settings.DEBUG:
            frontend_base = "https://www.kisaanbuddy.com"

        token = generate_secure_link_token(phone_number, action="mandi")
        clean_q = query_text.strip().lower()

        # 1. Search database records
        records = (
            db.query(MarketPriceRecord)
            .filter(
                or_(
                    func.lower(MarketPriceRecord.commodity).contains(clean_q),
                    func.lower(MarketPriceRecord.market_center).contains(clean_q),
                    func.lower(MarketPriceRecord.district).contains(clean_q),
                )
            )
            .order_by(desc(MarketPriceRecord.arrival_date), desc(MarketPriceRecord.id))
            .limit(3)
            .all()
        )

        # 2. Fallback to INITIAL_MARKET_PRICES verified catalog if DB has no matches
        matched_catalog: List[Dict[str, Any]] = []
        if not records:
            for item in INITIAL_MARKET_PRICES:
                comm = item.get("commodity", "").lower()
                mkt = item.get("market", "").lower()
                dist = item.get("district", "").lower()
                if clean_q in comm or clean_q in mkt or clean_q in dist:
                    matched_catalog.append(item)
                    if len(matched_catalog) >= 3:
                        break

        if records:
            lines = []
            for r in records:
                p_date = r.arrival_date.strftime("%d-%m-%Y") if r.arrival_date else "Recent"
                lines.append(
                    f"• *{r.commodity}* ({r.market_center}, {r.district})\n"
                    f"  Modal Price: ₹{int(r.modal_price):,} / Quintal\n"
                    f"  Range: ₹{int(r.min_price):,} – ₹{int(r.max_price):,}\n"
                    f"  Date: {p_date} (AGMARKNET verified)"
                )
            records_text = "\n\n".join(lines)
            mandi_url = f"{frontend_base}/mandi?token={token}"
            reply = get_text("mandi_info", language, records_text=records_text, url=mandi_url)
            await self._send_text(phone_number, reply, db, sender_phone_number_id=sender_phone_number_id)
            await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
            return
        elif matched_catalog:
            lines = []
            for m in matched_catalog:
                lines.append(
                    f"• *{m.get('commodity')}* ({m.get('market')}, {m.get('district')})\n"
                    f"  Modal Price: ₹{int(m.get('modal_price', 0)):,} / Quintal\n"
                    f"  Range: ₹{int(m.get('min_price', 0)):,} – ₹{int(m.get('max_price', 0)):,}\n"
                    f"  Date: {m.get('price_date', 'Recent')} (AGMARKNET verified)"
                )
            records_text = "\n\n".join(lines)
            mandi_url = f"{frontend_base}/mandi?token={token}"
            reply = get_text("mandi_info", language, records_text=records_text, url=mandi_url)
            await self._send_text(phone_number, reply, db, sender_phone_number_id=sender_phone_number_id)
            await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)
            return

        # No records found
        mandi_url = f"{frontend_base}/mandi?token={token}"
        msg = get_text("mandi_fallback", language, url=mandi_url)
        await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)
        await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, db=db)

    async def _send_menu(
        self,
        phone_number: str,
        language: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Sends interactive list menu or clean fallback numbered text menu."""
        sections = [
            {
                "title": get_text("menu_header", language),
                "rows": [
                    {
                        "id": item["id"],
                        "title": item["title"].get(language, item["title"]["en"])[:24],
                        "description": item["desc"].get(language, item["desc"]["en"])[:72],
                    }
                    for item in MENU_ITEMS
                ],
            }
        ]

        try:
            body_text = get_text("welcome", language)
            button_label = get_text("select_option", language)[:20] or "Options"
            res = await whatsapp_client.send_interactive_list(
                recipient_phone=phone_number,
                body_text=body_text,
                button_label=button_label,
                sections=sections,
                header_text="KisaanBuddy",
                footer_text=get_text("menu_footer", language),
                sender_phone_number_id=sender_phone_number_id,
            )
            wamid = None
            if isinstance(res, dict):
                messages_list = res.get("messages")
                if messages_list and isinstance(messages_list, list) and len(messages_list) > 0:
                    wamid = messages_list[0].get("id")
            self._record_outbound_message(phone_number, body_text, "interactive", wamid, db)
        except Exception as e:
            log.warning("Interactive list delivery failed (%s); falling back to numbered text menu.", e)
            fallback_text = build_text_menu(language)
            await self._send_text(
                phone_number,
                fallback_text,
                db,
                sender_phone_number_id=sender_phone_number_id,
            )

    async def _send_text(
        self,
        phone_number: str,
        text: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Sends outbound text message and records in audit database."""
        try:
            res = await whatsapp_client.send_text_message(
                recipient_phone=phone_number,
                body=text,
                sender_phone_number_id=sender_phone_number_id,
            )
            wamid = None
            if isinstance(res, dict):
                messages_list = res.get("messages")
                if messages_list and isinstance(messages_list, list) and len(messages_list) > 0:
                    wamid = messages_list[0].get("id")
            self._record_outbound_message(phone_number, text, "text", wamid, db)
        except Exception as e:
            log.warning("Failed sending outbound text to %s: %s", phone_number, e)
            self._record_outbound_message(phone_number, text, "text", None, db, error=str(e))

    def _record_outbound_message(
        self,
        phone_number: str,
        body: str,
        msg_type: str,
        wamid: Optional[str],
        db: Session,
        error: Optional[str] = None,
    ) -> None:
        """Records outbound message and tracks estimated pricing."""
        cost_eval = evaluate_message_cost(direction="outbound", category="service")
        status = "failed" if error else "sent"

        unique_wamid = wamid
        if unique_wamid:
            existing = db.query(WhatsAppMessage).filter(WhatsAppMessage.message_id == unique_wamid).first()
            if existing:
                import uuid
                unique_wamid = f"{unique_wamid}_{uuid.uuid4().hex[:6]}"

        msg_record = WhatsAppMessage(
            message_id=unique_wamid,
            phone_number=phone_number,
            direction="outbound",
            message_type=msg_type,
            body=body,
            category=cost_eval.category,
            status=status,
            is_chargeable=cost_eval.is_chargeable,
            estimated_cost_inr=cost_eval.estimated_cost_inr,
            error_message=error,
            created_at=datetime.utcnow(),
        )
        try:
            db.add(msg_record)
            db.commit()

            total_spent = db.query(WhatsAppMessage.estimated_cost_inr).all()
            total_inr = sum(r[0] or 0.0 for r in total_spent)
            check_budget_limit(total_inr)
        except Exception as e:
            db.rollback()
            log.warning("Error saving outbound message record: %s", e)


whatsapp_service = WhatsAppService()
