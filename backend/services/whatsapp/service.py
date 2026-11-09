"""Core WhatsApp Business Platform service orchestrator."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from core.config import settings
from db.models import User, WhatsAppMessage, WhatsAppUser
from db.session import SessionLocal
from services.whatsapp.advisory_handler import answer_agricultural_question
from services.whatsapp.client import whatsapp_client
from services.whatsapp.crop_doctor_handler import process_crop_doctor_image
from services.whatsapp.deduplication import deduplicator
from services.whatsapp.localization import (
    MENU_ITEMS,
    build_text_menu,
    detect_language_choice,
    get_text,
    parse_menu_selection,
)
from services.whatsapp.pricing import check_budget_limit, evaluate_message_cost
from services.whatsapp.security import generate_secure_link_token, normalize_phone_number
from services.whatsapp.state_machine import WhatsAppState, state_manager
from services.whatsapp.support_handler import create_support_ticket

log = logging.getLogger(__name__)


class WhatsAppService:
    """Coordinates incoming webhooks, conversation state machine, background tasks, and outbound replies."""

    async def handle_webhook_payload(
        self,
        payload: Dict[str, Any],
        background_tasks: BackgroundTasks,
        db: Session,
    ) -> Dict[str, str]:
        """Entry point for incoming Meta webhooks.

        Acknowledges webhooks promptly and delegates processing to background tasks.
        Extracts incoming phone_number_id from metadata to ensure strict sender routing.
        """
        entries = payload.get("entry", [])
        for entry in entries:
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                # Extract incoming phone_number_id from Meta webhook metadata
                metadata = value.get("metadata", {})
                incoming_phone_number_id = metadata.get("phone_number_id")

                # 1. Process delivery & message status updates
                statuses = value.get("statuses", [])
                for status in statuses:
                    self._handle_status_update(status, db)

                # 2. Process incoming farmer messages
                messages = value.get("messages", [])
                contacts = value.get("contacts", [])
                contact_map = {c.get("wa_id"): c.get("profile", {}).get("name") for c in contacts}

                for msg in messages:
                    msg_id = msg.get("id")
                    if not msg_id:
                        continue

                    # Idempotency check: discard duplicate webhook retries
                    is_dup = await deduplicator.is_duplicate(msg_id)
                    if is_dup:
                        log.info("Discarding duplicate webhook message ID %s", msg_id)
                        continue

                    raw_from = msg.get("from", "")
                    phone_number = normalize_phone_number(raw_from)
                    contact_name = contact_map.get(raw_from) or contact_map.get(phone_number.lstrip("+"))

                    # Mark message as read asynchronously using matching incoming phone_number_id
                    background_tasks.add_task(
                        whatsapp_client.mark_message_as_read,
                        msg_id,
                        sender_phone_number_id=incoming_phone_number_id,
                    )

                    # Persist inbound message audit record
                    self._record_inbound_message(msg, phone_number, db)

                    # Dispatch background task for conversation logic and AI inference
                    background_tasks.add_task(
                        self.process_message_turn_background,
                        msg=msg,
                        phone_number=phone_number,
                        contact_name=contact_name,
                        sender_phone_number_id=incoming_phone_number_id,
                    )

        return {"status": "accepted"}

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

    def _record_inbound_message(self, msg: Dict[str, Any], phone_number: str, db: Session) -> None:
        """Stores incoming message audit record."""
        try:
            msg_type = msg.get("type", "unknown")
            body = None
            media_id = None

            if msg_type == "text":
                body = msg.get("text", {}).get("body")
            elif msg_type == "interactive":
                interactive = msg.get("interactive", {})
                itype = interactive.get("type")
                if itype == "button_reply":
                    body = interactive.get("button_reply", {}).get("id")
                elif itype == "list_reply":
                    body = interactive.get("list_reply", {}).get("id")
            elif msg_type == "image":
                image_info = msg.get("image", {})
                media_id = image_info.get("id")
                body = image_info.get("caption")

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
                message_id=msg.get("id"),
                phone_number=phone_number,
                direction="inbound",
                message_type=msg_type,
                body=body,
                media_id=media_id,
                category="service",
                status="received",
                is_chargeable=False,
                estimated_cost_inr=0.0,
                created_at=datetime.utcnow(),
            )
            db.add(inbound_audit)
            db.commit()
        except Exception as e:
            db.rollback()
            log.warning("Error recording inbound message: %s", e)

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
        # 1. Fetch user record and language preference
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
            db.commit()
            db.refresh(wa_user)

        language = wa_user.language if wa_user and wa_user.language else "en"
        if contact_name and wa_user and not wa_user.name:
            wa_user.name = contact_name
            db.commit()

        # 2. Extract input text or interactive payload
        msg_type = msg.get("type", "unknown")
        user_text = ""
        image_id = None
        mime_type = "image/jpeg"

        if msg_type == "text":
            user_text = (msg.get("text", {}).get("body") or "").strip()
        elif msg_type == "interactive":
            interactive = msg.get("interactive", {})
            itype = interactive.get("type")
            if itype == "button_reply":
                user_text = interactive.get("button_reply", {}).get("id") or ""
            elif itype == "list_reply":
                user_text = interactive.get("list_reply", {}).get("id") or ""
        elif msg_type == "image":
            image_info = msg.get("image", {})
            image_id = image_info.get("id")
            mime_type = image_info.get("mime_type", "image/jpeg")
            user_text = (image_info.get("caption") or "").strip()

        # 3. Retrieve conversation state
        current_state, ctx, is_expired = await state_manager.get_state(phone_number)
        clean_input = user_text.lower().strip()

        # 4. Universal Commands
        if clean_input in ("menu", "main menu", "home", "0", "मेनू", "ಮೆನು"):
            await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU)
            await self._send_menu(phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
            return

        if clean_input in ("language", "lang", "भाषा", "ಭಾಷೆ"):
            await state_manager.set_state(phone_number, WhatsAppState.LANGUAGE_SELECTION)
            prompt = get_text("language_selection_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)
            return

        # 5. Handle Session Expiration
        if is_expired:
            await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU)
            expired_notice = get_text("session_expired", language)
            await self._send_text(phone_number, expired_notice, db, sender_phone_number_id=sender_phone_number_id)
            await self._send_menu(phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
            return

        # 6. State Machine Processing
        if current_state == WhatsAppState.NEW_USER:
            # First-time user: send welcome and main menu
            await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU)
            await self._send_menu(phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
            return

        if current_state == WhatsAppState.LANGUAGE_SELECTION:
            selected_lang = detect_language_choice(user_text)
            if selected_lang:
                if wa_user:
                    wa_user.language = selected_lang
                    db.commit()
                language = selected_lang
                await state_manager.set_state(phone_number, WhatsAppState.MAIN_MENU, {"language": selected_lang})
                conf_msg = get_text("language_updated", selected_lang)
                await self._send_text(phone_number, conf_msg, db, sender_phone_number_id=sender_phone_number_id)
                await self._send_menu(phone_number, selected_lang, db, sender_phone_number_id=sender_phone_number_id)
                return
            else:
                prompt = get_text("language_selection_prompt", language)
                await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)
                return

        if current_state == WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE:
            if msg_type == "image" and image_id:
                # Analyzing feedback
                analyzing_text = get_text("crop_doctor_analyzing", language)
                await self._send_text(phone_number, analyzing_text, db, sender_phone_number_id=sender_phone_number_id)

                # Download media binary securely using matching sender phone_number_id
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
                    await state_manager.set_state(phone_number, WhatsAppState.CROP_DOCTOR_RESULT, {"last_diagnosis_id": res.get("diagnosis_id")})
                except Exception as exc:
                    log.exception("Crop Doctor processing exception: %s", exc)
                    err_msg = get_text("crop_doctor_inference_error", language)
                    await self._send_text(phone_number, err_msg, db, sender_phone_number_id=sender_phone_number_id)
                return
            else:
                # Text received instead of image
                menu_choice = parse_menu_selection(user_text)
                if menu_choice:
                    await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                    return
                # Remind farmer to upload photo
                prompt = get_text("crop_doctor_prompt", language)
                await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)
                return

        if current_state == WhatsAppState.AGRICULTURAL_QUESTION:
            # Check if user selected a menu option instead
            menu_choice = parse_menu_selection(user_text)
            if menu_choice and menu_choice != "guidance":
                await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                return

            # Answer question
            answer = await answer_agricultural_question(
                question=user_text,
                phone_number=phone_number,
                language=language,
            )
            await self._send_text(phone_number, answer, db, sender_phone_number_id=sender_phone_number_id)
            return

        if current_state == WhatsAppState.HUMAN_SUPPORT:
            # Check for menu command
            menu_choice = parse_menu_selection(user_text)
            if menu_choice and menu_choice != "support":
                await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
                return

            ticket_id = create_support_ticket(
                phone_number=phone_number,
                query_summary=user_text,
                db=db,
                farmer_name=contact_name,
                language=language,
            )
            resp = get_text("support_created", language, ticket_id=ticket_id)
            await self._send_text(phone_number, resp, db, sender_phone_number_id=sender_phone_number_id)
            return

        # Default / MAIN_MENU state
        menu_choice = parse_menu_selection(user_text)
        if menu_choice:
            await self._handle_menu_choice(menu_choice, phone_number, language, db, sender_phone_number_id=sender_phone_number_id)
            return

        # Check if user sent an image directly from main menu
        if msg_type == "image" and image_id:
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
                await state_manager.set_state(phone_number, WhatsAppState.CROP_DOCTOR_RESULT)
            except Exception as exc:
                log.exception("Crop Doctor processing error: %s", exc)
                err_msg = get_text("crop_doctor_inference_error", language)
                await self._send_text(phone_number, err_msg, db, sender_phone_number_id=sender_phone_number_id)
            return

        # If natural language question asked on main menu, answer directly
        if len(user_text.split()) >= 3 or "?" in user_text:
            answer = await answer_agricultural_question(
                question=user_text,
                phone_number=phone_number,
                language=language,
            )
            await self._send_text(phone_number, answer, db, sender_phone_number_id=sender_phone_number_id)
            await state_manager.set_state(phone_number, WhatsAppState.AGRICULTURAL_QUESTION)
            return

        # Unknown message fallback
        fallback = get_text("unknown_input", language)
        await self._send_text(phone_number, fallback, db, sender_phone_number_id=sender_phone_number_id)

    async def _handle_menu_choice(
        self,
        choice: str,
        phone_number: str,
        language: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Dispatches action for selected menu option."""
        frontend_base = settings.FRONTEND_BASE_URL.rstrip("/")

        if choice == "crop_doctor":
            await state_manager.set_state(phone_number, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE)
            prompt = get_text("crop_doctor_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

        elif choice == "weather":
            token = generate_secure_link_token(phone_number, action="weather")
            weather_url = f"{frontend_base}/weather?token={token}"
            msg = get_text("weather_info", language, url=weather_url)
            await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)

        elif choice == "guidance":
            await state_manager.set_state(phone_number, WhatsAppState.AGRICULTURAL_QUESTION)
            prompt = get_text("agri_question_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

        elif choice == "mandi":
            token = generate_secure_link_token(phone_number, action="mandi")
            mandi_url = f"{frontend_base}/mandi?token={token}"
            msg = get_text("mandi_info", language, url=mandi_url)
            await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)

        elif choice == "schemes":
            token = generate_secure_link_token(phone_number, action="schemes")
            schemes_url = f"{frontend_base}/schemes?token={token}"
            msg = get_text("schemes_info", language, url=schemes_url)
            await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)

        elif choice == "support":
            await state_manager.set_state(phone_number, WhatsAppState.HUMAN_SUPPORT)
            ticket_id = create_support_ticket(
                phone_number=phone_number,
                query_summary="Farmer requested assistance via menu option 6.",
                db=db,
                language=language,
            )
            msg = get_text("support_created", language, ticket_id=ticket_id)
            await self._send_text(phone_number, msg, db, sender_phone_number_id=sender_phone_number_id)

        elif choice == "language":
            await state_manager.set_state(phone_number, WhatsAppState.LANGUAGE_SELECTION)
            prompt = get_text("language_selection_prompt", language)
            await self._send_text(phone_number, prompt, db, sender_phone_number_id=sender_phone_number_id)

    async def _send_menu(
        self,
        phone_number: str,
        language: str,
        db: Session,
        sender_phone_number_id: Optional[str] = None,
    ) -> None:
        """Sends interactive list menu or clean fallback text menu."""
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
            wamid = res.get("messages", [{}])[0].get("id")
            self._record_outbound_message(phone_number, body_text, "interactive", wamid, db)
        except Exception as e:
            log.warning("Interactive list delivery failed (%s); falling back to text menu.", e)
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
            wamid = res.get("messages", [{}])[0].get("id")
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

            # Verify monthly budget
            total_spent = db.query(WhatsAppMessage.estimated_cost_inr).all()
            total_inr = sum(r[0] or 0.0 for r in total_spent)
            check_budget_limit(total_inr)
        except Exception as e:
            db.rollback()
            log.warning("Error saving outbound message record: %s", e)


whatsapp_service = WhatsAppService()
