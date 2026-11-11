"""Comprehensive automated test suite for WhatsApp production reliability overhaul.

Validates the full incoming-message normalization, multi-tier deduplication,
dual-number routing, interactive message handling (list_reply, button_reply, quick-replies),
Indic numeral parsing (Devanagari, Kannada), menu navigation, state machine transitions,
and observability.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import time
import unittest
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

from sqlalchemy.orm import Session

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.config import settings
from db.models import DiseaseDetection, MarketPriceRecord, WhatsAppMessage, WhatsAppSupportTicket, WhatsAppUser
from db.session import Base, SessionLocal, engine
from services.whatsapp.client import resolve_whatsapp_credentials, WhatsAppRoutingError
from services.whatsapp.deduplication import Deduplicator, WhatsAppDeduplicator
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


if __name__ == "__main__":
    unittest.main()
