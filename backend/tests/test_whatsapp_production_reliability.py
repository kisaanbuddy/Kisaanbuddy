"""Comprehensive automated test suite for WhatsApp production reliability overhaul.

Validates the full incoming-message normalization, multi-tier deduplication,
dual-number routing, interactive message handling (list_reply, button_reply, quick-replies),
Indic numeral parsing (Devanagari, Kannada), menu navigation, state machine transitions,
and observability.
"""
from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import os
import sys
import time
import unittest
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.config import settings
from db.models import DiseaseDetection, MarketPriceRecord, WhatsAppMessage, WhatsAppSupportTicket, WhatsAppUser
from db.session import Base, SessionLocal, engine
from main import app
from services.whatsapp.client import resolve_whatsapp_credentials, WhatsAppRoutingError
from services.whatsapp.deduplication import Deduplicator, WhatsAppDeduplicator, deduplicator
from services.whatsapp.localization import MENU_ITEMS, get_text, parse_menu_selection
from services.whatsapp.normalization import (
    NormalizedMessage,
    NormalizedWhatsAppMessage,
    normalize_incoming_message,
)
from services.whatsapp.observability import get_whatsapp_metrics, mask_phone_number, record_whatsapp_turn
from services.whatsapp.security import generate_secure_link_token, verify_secure_link_token
from services.whatsapp.service import whatsapp_service
from services.whatsapp.state_machine import WhatsAppState, state_manager


class TestWhatsAppNormalization(unittest.TestCase):
    """Test input normalization across text, interactive list, buttons, and Indic numerals."""

    def test_ascii_numerals_and_text(self):
        # Bare digit
        msg1 = normalize_incoming_message({"type": "text", "text": {"body": "4"}})
        self.assertEqual(msg1.menu_choice, "mandi")

        # Leading digit with label
        msg2 = normalize_incoming_message({"type": "text", "text": {"body": "4. Mandi Prices"}})
        self.assertEqual(msg2.menu_choice, "mandi")

        # Digit with emojis and trailing spaces
        msg3 = normalize_incoming_message({"type": "text", "text": {"body": " 1. Crop Doctor 🌿 "}})
        self.assertEqual(msg3.menu_choice, "crop_doctor")

        # Punctuation variants
        msg4 = normalize_incoming_message({"type": "text", "text": {"body": "3) Weather Forecast"}})
        self.assertEqual(msg4.menu_choice, "weather")

        msg5 = normalize_incoming_message({"type": "text", "text": {"body": "(2) Ask Agri Question"}})
        self.assertEqual(msg5.menu_choice, "guidance")

    def test_indic_numerals_hindi_kannada(self):
        # Hindi Devanagari numerals १-७
        msg_hi_1 = normalize_incoming_message({"type": "text", "text": {"body": "१. फसल डॉक्टर"}})
        self.assertEqual(msg_hi_1.menu_choice, "crop_doctor")

        msg_hi_4 = normalize_incoming_message({"type": "text", "text": {"body": "४. मंडी भाव"}})
        self.assertEqual(msg_hi_4.menu_choice, "mandi")

        msg_hi_bare = normalize_incoming_message({"type": "text", "text": {"body": "५"}})
        self.assertEqual(msg_hi_bare.menu_choice, "schemes")

        # Kannada numerals ೧-೭
        msg_kn_1 = normalize_incoming_message({"type": "text", "text": {"body": "೧. ಬೆಳೆ ವೈದ್ಯ"}})
        self.assertEqual(msg_kn_1.menu_choice, "crop_doctor")

        msg_kn_4 = normalize_incoming_message({"type": "text", "text": {"body": "೪. ಮಾರುಕಟ್ಟೆ ಬೆಲೆ"}})
        self.assertEqual(msg_kn_4.menu_choice, "mandi")

        msg_kn_bare = normalize_incoming_message({"type": "text", "text": {"body": "೩"}})
        self.assertEqual(msg_kn_bare.menu_choice, "weather")

    def test_interactive_list_reply(self):
        # Canonical ID in list_reply
        raw = {
            "type": "interactive",
            "interactive": {
                "type": "list_reply",
                "list_reply": {
                    "id": "mandi",
                    "title": "4. Mandi Prices 📊",
                    "description": "Live APMC wholesale market rates",
                },
            },
        }
        msg = normalize_incoming_message(raw)
        self.assertEqual(msg.menu_choice, "mandi")
        self.assertEqual(msg.text, "4. Mandi Prices 📊")

        # Legacy prefixed ID
        raw2 = {
            "type": "interactive",
            "interactive": {
                "type": "list_reply",
                "list_reply": {
                    "id": "menu_schemes",
                    "title": "5. Schemes 🏛️",
                },
            },
        }
        msg2 = normalize_incoming_message(raw2)
        self.assertEqual(msg2.menu_choice, "schemes")

    def test_interactive_button_reply(self):
        raw = {
            "type": "interactive",
            "interactive": {
                "type": "button_reply",
                "button_reply": {
                    "id": "crop_doctor",
                    "title": "1. Crop Doctor",
                },
            },
        }
        msg = normalize_incoming_message(raw)
        self.assertEqual(msg.menu_choice, "crop_doctor")

    def test_template_quick_reply_button(self):
        raw = {
            "type": "button",
            "button": {
                "payload": "menu_weather",
                "text": "Weather Forecast",
            },
        }
        msg = normalize_incoming_message(raw)
        self.assertEqual(msg.menu_choice, "weather")

    def test_location_and_media_normalization(self):
        # Location message
        loc_payload = {
            "type": "location",
            "location": {
                "latitude": 12.9716,
                "longitude": 77.5946,
                "name": "Bengaluru",
            },
        }
        msg_loc = normalize_incoming_message(loc_payload)
        self.assertEqual(msg_loc.message_type, "location")
        self.assertEqual(msg_loc.latitude, 12.9716)
        self.assertEqual(msg_loc.longitude, 77.5946)

        # Image message
        img_payload = {
            "type": "image",
            "image": {
                "id": "meta_img_998877",
                "mime_type": "image/jpeg",
                "caption": "Pest on leaf",
            },
        }
        msg_img = normalize_incoming_message(img_payload)
        self.assertEqual(msg_img.message_type, "image")
        self.assertEqual(msg_img.image_id, "meta_img_998877")
        self.assertEqual(msg_img.image_mime_type, "image/jpeg")
        self.assertEqual(msg_img.text, "Pest on leaf")


class TestMetaLimitsCompliance(unittest.TestCase):
    """Verify that all strings sent to Meta interactive components strictly comply with limits."""

    def test_menu_row_titles_within_24_chars(self):
        for lang in ("en", "hi", "kn"):
            self.assertEqual(len(MENU_ITEMS), 7, "Menu items must have exactly 7 options")
            for item in MENU_ITEMS:
                title = item["title"].get(lang, item["title"]["en"])
                self.assertLessEqual(
                    len(title),
                    24,
                    f"Row title '{title}' for lang '{lang}' exceeds Meta 24-character list limit (len={len(title)})",
                )
                desc = item["desc"].get(lang, item["desc"]["en"])
                self.assertLessEqual(
                    len(desc),
                    72,
                    f"Row description '{desc}' for lang '{lang}' exceeds Meta 72-character limit",
                )


class TestWhatsAppDeduplication(unittest.IsolatedAsyncioTestCase):
    """Verify 3-tier deduplication (Redis -> In-Memory LRU -> Database)."""

    async def asyncSetUp(self):
        if engine:
            Base.metadata.create_all(bind=engine)
        self.db: Session = SessionLocal()
        self.test_phone = "+919876543299"
        self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == self.test_phone).delete()
        self.db.commit()

    async def asyncTearDown(self):
        self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == self.test_phone).delete()
        self.db.commit()
        self.db.close()

    async def test_in_memory_and_db_deduplication(self):
        dedup = Deduplicator()
        msg_id = f"wamid.test_{int(time.time() * 1000)}"

        # First arrival: not duplicate
        is_dup_1 = await dedup.is_duplicate(msg_id, db=self.db)
        self.assertFalse(is_dup_1)

        # Mark processed in-memory
        await dedup.mark_processed(msg_id)

        # Second arrival: recognized as duplicate from in-memory cache
        is_dup_2 = await dedup.is_duplicate(msg_id, db=self.db)
        self.assertTrue(is_dup_2)

        # Clear in-memory LRU cache to simulate process restart
        dedup._lru_cache.clear()

        # Without DB record, cleared cache returns False
        is_dup_cleared = await dedup.is_duplicate(msg_id, db=self.db)
        self.assertFalse(is_dup_cleared)

        # Now save to DB as would happen during turn execution
        db_msg = WhatsAppMessage(
            message_id=msg_id,
            phone_number=self.test_phone,
            direction="inbound",
            message_type="text",
            body="test",
        )
        self.db.add(db_msg)
        self.db.commit()

        # Cleared in-memory cache now catches duplicate via Tier 3 (Database check)
        dedup._lru_cache.clear()
        is_dup_db = await dedup.is_duplicate(msg_id, db=self.db)
        self.assertTrue(is_dup_db)


class TestWhatsAppObservability(unittest.TestCase):
    """Verify phone masking and metric recording."""

    def test_phone_masking(self):
        self.assertEqual(mask_phone_number("+919876543210"), "+91 98*** **210")
        self.assertEqual(mask_phone_number("9876543210"), "98*** **210")
        self.assertEqual(mask_phone_number("123"), "***")
        self.assertEqual(mask_phone_number(""), "[empty]")

    def test_metrics_collection(self):
        record_whatsapp_turn(
            message_id="wamid.obs_test",
            phone_number="+919876543210",
            phone_number_id="1451545484689306",
            message_type="text",
            normalized_action="menu_mandi",
            state_before="main_menu",
            state_after="mandi_waiting_for_commodity",
            handler_invoked="handle_menu_choice",
            duration_ms=45.2,
            status="success",
        )
        metrics = get_whatsapp_metrics()
        self.assertGreaterEqual(metrics.get("incoming_messages", 0), 1)
        self.assertGreaterEqual(metrics.get("text_selections", 0), 1)
        self.assertGreaterEqual(metrics.get("handler_success", 0), 1)


class TestWhatsAppProductionReliabilityFlows(unittest.IsolatedAsyncioTestCase):
    """Full end-to-end webhook turn simulations testing production failure scenarios."""

    async def asyncSetUp(self):
        if engine:
            Base.metadata.create_all(bind=engine)
        self.db: Session = SessionLocal()
        self.test_phones = [f"+9198111111{i:02d}" for i in range(1, 15)]
        for p in self.test_phones:
            self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == p).delete()
            self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == p).delete()
            self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == p).delete()
        self.db.commit()

        for p in self.test_phones:
            await state_manager.clear_state(p, db=self.db)

    async def asyncTearDown(self):
        for p in self.test_phones:
            self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == p).delete()
            self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == p).delete()
            self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == p).delete()
            await state_manager.clear_state(p, db=self.db)
        self.db.commit()
        self.db.close()

    def _build_webhook_payload(
        self,
        phone_number: str,
        phone_number_id: str,
        message_obj: Dict[str, Any],
        wamid: str = "wamid.HBgL...",
    ) -> Dict[str, Any]:
        """Constructs a valid Meta WhatsApp Cloud API webhook payload."""
        message_obj["id"] = wamid
        message_obj["from"] = phone_number
        message_obj["timestamp"] = str(int(time.time()))
        return {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "2180741169197298",
                    "changes": [
                        {
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {
                                    "display_phone_number": "15551234567",
                                    "phone_number_id": phone_number_id,
                                },
                                "contacts": [{"profile": {"name": "Farmer Ramesh"}, "wa_id": phone_number}],
                                "messages": [message_obj],
                            },
                            "field": "messages",
                        }
                    ],
                }
            ],
        }

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    @patch("services.whatsapp.service.whatsapp_client.send_interactive_list", new_callable=AsyncMock)
    async def test_full_text_menu_options_do_not_trigger_unknown_input(self, mock_list, mock_text):
        """Reproduces and verifies fix for the production failure where '4. Mandi Prices'

        was rejected with 'I didn't quite catch that'.
        """
        phone = self.test_phones[0]
        phone_id = "1451545484689306"

        # Onboard user in English
        user = WhatsAppUser(
            phone_number=phone,
            language="en",
            opted_in=True,
            current_state=WhatsAppState.MAIN_MENU.value,
        )
        self.db.add(user)
        self.db.commit()

        # Farmer sends "4. Mandi Prices"
        payload = self._build_webhook_payload(
            phone_number=phone,
            phone_number_id=phone_id,
            message_obj={"type": "text", "text": {"body": "4. Mandi Prices"}},
            wamid=f"wamid.mandi_{int(time.time()*1000)}",
        )

        mock_text.return_value = {"messages": [{"id": "wamid.mandi_reply"}]}
        res = await whatsapp_service.handle_webhook_payload(payload, db=self.db)
        self.assertTrue(res.get("processed"))

        # Verify bot replied with the Mandi prompt, NOT unknown_input fallback
        mock_text.assert_called()
        sent_body = mock_text.call_args.kwargs.get("body", "")
        self.assertNotIn("I didn't quite catch that", sent_body)
        self.assertIn("Mandi", sent_body)

        # Verify state transitioned to MANDI_WAITING_FOR_COMMODITY
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.MANDI_WAITING_FOR_COMMODITY.value)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    @patch("services.whatsapp.service.whatsapp_client.send_interactive_list", new_callable=AsyncMock)
    async def test_crop_doctor_full_text_and_indic_numeral(self, mock_list, mock_text):
        """Verifies '1. Crop Doctor' and Hindi '१. फसल डॉक्टर' transition to image waiting state."""
        phone = self.test_phones[1]
        phone_id = "1451545484689306"

        user = WhatsAppUser(
            phone_number=phone,
            language="hi",
            opted_in=True,
            current_state=WhatsAppState.MAIN_MENU.value,
        )
        self.db.add(user)
        self.db.commit()

        # Farmer sends "१. फसल डॉक्टर" in Hindi
        payload = self._build_webhook_payload(
            phone_number=phone,
            phone_number_id=phone_id,
            message_obj={"type": "text", "text": {"body": "१. फसल डॉक्टर"}},
            wamid=f"wamid.crop_{int(time.time()*1000)}",
        )

        mock_text.return_value = {"messages": [{"id": "wamid.crop_reply"}]}
        res = await whatsapp_service.handle_webhook_payload(payload, db=self.db)
        self.assertTrue(res.get("processed"))

        sent_body = mock_text.call_args.kwargs.get("body", "")
        self.assertNotIn("मुझे समझ नहीं आया", sent_body)
        self.assertIn("क्रॉप डॉक्टर", sent_body)

        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE.value)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    @patch("services.whatsapp.service.whatsapp_client.send_interactive_list", new_callable=AsyncMock)
    async def test_invalid_input_shows_clean_7_option_guide(self, mock_list, mock_text):
        """Verifies that an unknown phrase displays the clean 7-option fallback in current language."""
        phone = self.test_phones[2]
        phone_id = "1451545484689306"

        user = WhatsAppUser(
            phone_number=phone,
            language="en",
            opted_in=True,
            current_state=WhatsAppState.MAIN_MENU.value,
        )
        self.db.add(user)
        self.db.commit()

        payload = self._build_webhook_payload(
            phone_number=phone,
            phone_number_id=phone_id,
            message_obj={"type": "text", "text": {"body": "xyz123"}},
            wamid=f"wamid.invalid_{int(time.time()*1000)}",
        )

        mock_text.return_value = {"messages": [{"id": "wamid.invalid_reply"}]}
        res = await whatsapp_service.handle_webhook_payload(payload, db=self.db)
        self.assertTrue(res.get("processed"))

        sent_body = mock_text.call_args.kwargs.get("body", "")
        self.assertIn("1. Crop Doctor", sent_body)
        self.assertIn("4. Mandi Prices", sent_body)
        self.assertIn("7. Visit KisaanBuddy", sent_body)
        self.assertNotIn("• Type '6' for support", sent_body)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    @patch("services.whatsapp.service.whatsapp_client.send_interactive_list", new_callable=AsyncMock)
    async def test_global_commands_escape_trapped_states(self, mock_list, mock_text):
        """Verifies that MENU, LANGUAGE, HELP, STOP, START work from within any sub-state."""
        phone = self.test_phones[3]
        phone_id = "1451545484689306"

        # Trap farmer in CROP_DOCTOR_WAITING_FOR_IMAGE
        user = WhatsAppUser(
            phone_number=phone,
            language="en",
            opted_in=True,
            current_state=WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE.value,
        )
        self.db.add(user)
        self.db.commit()

        # Farmer decides to type 'MENU' instead of sending a photo
        payload = self._build_webhook_payload(
            phone_number=phone,
            phone_number_id=phone_id,
            message_obj={"type": "text", "text": {"body": "MENU"}},
            wamid=f"wamid.menu_cmd_{int(time.time()*1000)}",
        )

        res = await whatsapp_service.handle_webhook_payload(payload, db=self.db)
        self.assertTrue(res.get("processed"))

        # State must return to MAIN_MENU
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.MAIN_MENU.value)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    @patch("services.whatsapp.service.whatsapp_client.send_interactive_list", new_callable=AsyncMock)
    async def test_direct_numerical_switch_from_substate(self, mock_list, mock_text):
        """Verifies that typing '4' while in AGRICULTURAL_QUESTION switches to Mandi directly."""
        phone = self.test_phones[4]
        phone_id = "1451545484689306"

        user = WhatsAppUser(
            phone_number=phone,
            language="en",
            opted_in=True,
            current_state=WhatsAppState.AGRICULTURAL_QUESTION.value,
        )
        self.db.add(user)
        self.db.commit()

        # Farmer types '4' to check Mandi prices
        payload = self._build_webhook_payload(
            phone_number=phone,
            phone_number_id=phone_id,
            message_obj={"type": "text", "text": {"body": "4"}},
            wamid=f"wamid.direct_mandi_{int(time.time()*1000)}",
        )

        res = await whatsapp_service.handle_webhook_payload(payload, db=self.db)
        self.assertTrue(res.get("processed"))

        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.MANDI_WAITING_FOR_COMMODITY.value)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    async def test_stop_opt_out_command_never_creates_ticket(self, mock_text):
        """Verifies STOP records opt-out and never leaves farmer stranded in ticket state."""
        phone = self.test_phones[5]
        phone_id = "1451545484689306"

        user = WhatsAppUser(
            phone_number=phone,
            language="en",
            opted_in=True,
            current_state=WhatsAppState.MAIN_MENU.value,
        )
        self.db.add(user)
        self.db.commit()

        payload = self._build_webhook_payload(
            phone_number=phone,
            phone_number_id=phone_id,
            message_obj={"type": "text", "text": {"body": "STOP"}},
            wamid=f"wamid.stop_{int(time.time()*1000)}",
        )

        res = await whatsapp_service.handle_webhook_payload(payload, db=self.db)
        self.assertTrue(res.get("processed"))

        # Check DB user is opted-out
        self.db.expire_all()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
        self.assertFalse(user_db.opted_in)
        self.assertIsNotNone(user_db.opted_out_at)

        # Confirm no support tickets were created
        tickets = self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == phone).all()
        self.assertEqual(len(tickets), 0)


class TestFastAPIWebhookExecution(unittest.TestCase):
    """End-to-end FastAPI webhook endpoint verification with real Meta JSON payloads."""

    def setUp(self):
        self._orig_settings = {
            "WHATSAPP_PHONE_NUMBER_ID": settings.WHATSAPP_PHONE_NUMBER_ID,
            "WHATSAPP_ACCESS_TOKEN": settings.WHATSAPP_ACCESS_TOKEN,
            "WHATSAPP_APP_SECRET": settings.WHATSAPP_APP_SECRET,
            "WHATSAPP_SIGNATURE_VERIFICATION": settings.WHATSAPP_SIGNATURE_VERIFICATION,
            "FRONTEND_BASE_URL": settings.FRONTEND_BASE_URL,
            "DEBUG": settings.DEBUG,
        }
        self.addCleanup(self._restore_settings)

        settings.WHATSAPP_PHONE_NUMBER_ID = "1451545484689306"
        settings.WHATSAPP_ACCESS_TOKEN = "test_meta_prod_token"
        settings.WHATSAPP_APP_SECRET = "test_prod_app_secret_abc123"
        settings.WHATSAPP_SIGNATURE_VERIFICATION = True
        settings.FRONTEND_BASE_URL = "https://www.kisaanbuddy.com"
        settings.DEBUG = False

        if engine:
            Base.metadata.create_all(bind=engine)
        self.client = TestClient(app)
        self.db = SessionLocal()
        self.phone = "+919876543299"
        self._clean_db()

    def _restore_settings(self):
        for k, v in self._orig_settings.items():
            setattr(settings, k, v)

    def _clean_db(self):
        state_manager.clear_cache(self.phone)
        if self.db:
            self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == self.phone).delete()
            self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == self.phone).delete()
            self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).delete()
            self.db.commit()

    def tearDown(self):
        self._clean_db()
        if self.db:
            self.db.close()
        self._restore_settings()

    def _init_user_at_menu(self):
        state_manager.clear_cache(self.phone)
        user = WhatsAppUser(
            phone_number=self.phone,
            language="en",
            opted_in=True,
            current_state=WhatsAppState.MAIN_MENU.value,
        )
        self.db.add(user)
        self.db.commit()

    def _send_signed_webhook(self, message_obj: Dict[str, Any], wamid: str) -> Any:
        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "2180741169197298",
                    "changes": [
                        {
                            "field": "messages",
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {
                                    "display_phone_number": "911451545484689",
                                    "phone_number_id": "1451545484689306",
                                },
                                "contacts": [
                                    {
                                        "profile": {"name": "Test Farmer"},
                                        "wa_id": "919876543299",
                                    }
                                ],
                                "messages": [
                                    {
                                        "from": "919876543299",
                                        "id": wamid,
                                        "timestamp": str(int(time.time())),
                                        **message_obj,
                                    }
                                ],
                            },
                        }
                    ],
                }
            ],
        }
        body_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        sig = hmac.new(settings.WHATSAPP_APP_SECRET.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()
        return self.client.post(
            "/api/whatsapp/webhook",
            data=body_bytes,
            headers={
                "Content-Type": "application/json",
                "X-Hub-Signature-256": f"sha256={sig}",
            },
        )

    def _get_sent_body(self, mock_text) -> str:
        if not mock_text.call_args:
            return ""
        if "body" in mock_text.call_args.kwargs:
            return mock_text.call_args.kwargs["body"]
        args = mock_text.call_args[0]
        if len(args) > 1:
            return args[1]
        return ""

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_1_crop_doctor_interactive_list(self, mock_text):
        """Option 1 via Meta interactive list_reply."""
        self._init_user_at_menu()
        msg_obj = {
            "type": "interactive",
            "interactive": {
                "type": "list_reply",
                "list_reply": {
                    "id": "crop_doctor",
                    "title": "1. Crop Doctor 🌿",
                    "description": "Upload crop leaf photo",
                },
            },
        }
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt1_list_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get("processed"))

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE.value)
        mock_text.assert_called_once()
        self.assertIn("Crop Doctor", self._get_sent_body(mock_text))

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_1_crop_doctor_interactive_button(self, mock_text):
        """Option 1 via Meta interactive button_reply."""
        self._init_user_at_menu()
        msg_obj = {
            "type": "interactive",
            "interactive": {
                "type": "button_reply",
                "button_reply": {
                    "id": "crop_doctor",
                    "title": "Crop Doctor",
                },
            },
        }
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt1_btn_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE.value)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_2_guidance_ordinary_text(self, mock_text):
        """Option 2 via ordinary text '2. Ask Agri Question'."""
        self._init_user_at_menu()
        msg_obj = {"type": "text", "text": {"body": "2. Ask Agri Question"}}
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt2_text_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.AGRICULTURAL_QUESTION.value)
        mock_text.assert_called_once()
        self.assertIn("crop", self._get_sent_body(mock_text).lower())

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_3_weather_ordinary_text_and_link(self, mock_text):
        """Option 3 via ordinary text '3'."""
        self._init_user_at_menu()
        msg_obj = {"type": "text", "text": {"body": "3"}}
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt3_text_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.WEATHER_WAITING_FOR_LOCATION.value)
        mock_text.assert_called_once()
        reply_text = self._get_sent_body(mock_text)
        self.assertIn("https://www.kisaanbuddy.com/weather?token=", reply_text)
        self.assertNotIn("localhost", reply_text)
        self.assertNotIn("kisaanbuddy.co/", reply_text)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_4_mandi_interactive_list_and_link(self, mock_text):
        """Option 4 via Meta interactive list_reply."""
        self._init_user_at_menu()
        msg_obj = {
            "type": "interactive",
            "interactive": {
                "type": "list_reply",
                "list_reply": {
                    "id": "mandi",
                    "title": "4. Mandi Prices 📊",
                },
            },
        }
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt4_list_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.MANDI_WAITING_FOR_COMMODITY.value)
        mock_text.assert_called_once()
        reply_text = self._get_sent_body(mock_text)
        self.assertIn("https://www.kisaanbuddy.com/mandi?token=", reply_text)
        self.assertNotIn("localhost", reply_text)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_5_schemes_ordinary_text_and_link(self, mock_text):
        """Option 5 via ordinary text '5'."""
        self._init_user_at_menu()
        msg_obj = {"type": "text", "text": {"body": "5. Govt Schemes"}}
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt5_text_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.MAIN_MENU.value)
        mock_text.assert_called_once()
        reply_text = self._get_sent_body(mock_text)
        self.assertIn("https://www.kisaanbuddy.com/schemes?token=", reply_text)
        self.assertNotIn("localhost", reply_text)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_6_support_ordinary_text(self, mock_text):
        """Option 6 via text '6'."""
        self._init_user_at_menu()
        msg_obj = {"type": "text", "text": {"body": "6"}}
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt6_text_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.HUMAN_SUPPORT.value)
        mock_text.assert_called_once()
        self.assertIn("support", self._get_sent_body(mock_text).lower())

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_option_7_website_template_button_and_link(self, mock_text):
        """Option 7 via template quick reply button."""
        self._init_user_at_menu()
        msg_obj = {
            "type": "button",
            "button": {
                "payload": "website",
                "text": "Visit Website",
            },
        }
        resp = self._send_signed_webhook(msg_obj, wamid=f"wamid.opt7_btn_{int(time.time()*1000)}")
        self.assertEqual(resp.status_code, 200)

        self.db.close()
        self.db = SessionLocal()
        user_db = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == self.phone).first()
        self.assertEqual(user_db.current_state, WhatsAppState.MAIN_MENU.value)
        mock_text.assert_called_once()
        reply_text = self._get_sent_body(mock_text)
        self.assertIn("https://www.kisaanbuddy.com/?token=", reply_text)
        self.assertNotIn("localhost", reply_text)

    @patch("services.whatsapp.service.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_concurrent_duplicate_webhook_deduplication(self, mock_text):
        """Duplicate message IDs are caught by multi-tier deduplication and DB unique constraint."""
        self._init_user_at_menu()
        wamid = f"wamid.concurrent_dup_{int(time.time()*1000)}"
        msg_obj = {"type": "text", "text": {"body": "6. Support"}}

        # First delivery: accepted and processed
        resp1 = self._send_signed_webhook(msg_obj, wamid=wamid)
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp1.json().get("count"), 1)
        self.assertEqual(mock_text.call_count, 1)

        # Immediate second delivery: caught by tier 1/2 deduplicator
        resp2 = self._send_signed_webhook(msg_obj, wamid=wamid)
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json().get("count"), 0)
        # No additional outbound message sent
        self.assertEqual(mock_text.call_count, 1)

        # Clear in-memory deduplication cache to simulate a completely different worker process
        deduplicator._lru_cache.clear()

        # Third delivery across new worker: caught by DB unique constraint / DB check
        resp3 = self._send_signed_webhook(msg_obj, wamid=wamid)
        self.assertEqual(resp3.status_code, 200)
        self.assertEqual(resp3.json().get("count"), 0)
        self.assertEqual(mock_text.call_count, 1)

        # Confirm exactly 1 WhatsAppMessage record in DB for this wamid
        db_records = self.db.query(WhatsAppMessage).filter(WhatsAppMessage.message_id == wamid).all()
        self.assertEqual(len(db_records), 1)

    def test_strict_production_domain_validation(self):
        """Verifies that all generated links strictly use https://www.kisaanbuddy.com and zero localhost."""
        token_weather = generate_secure_link_token(self.phone, action="weather")
        token_mandi = generate_secure_link_token(self.phone, action="mandi")
        token_schemes = generate_secure_link_token(self.phone, action="schemes")
        token_web = generate_secure_link_token(self.phone, action="website")

        urls = [
            f"{settings.FRONTEND_BASE_URL}/weather?token={token_weather}",
            f"{settings.FRONTEND_BASE_URL}/mandi?token={token_mandi}",
            f"{settings.FRONTEND_BASE_URL}/schemes?token={token_schemes}",
            f"{settings.FRONTEND_BASE_URL}/?token={token_web}",
        ]

        for url in urls:
            self.assertTrue(url.startswith("https://www.kisaanbuddy.com"), f"URL {url} must start with canonical domain")
            self.assertNotIn("localhost", url)
            self.assertNotIn("127.0.0.1", url)
            self.assertNotIn(".co/", url)
            self.assertNotIn("http://", url)


if __name__ == "__main__":
    unittest.main()
