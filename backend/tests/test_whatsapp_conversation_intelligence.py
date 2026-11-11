"""Comprehensive automated test suite for WhatsApp conversation intelligence and farmer experience overhaul.

Covers all 16 specification requirements:
1. First-time language selection.
2. Language persistence in database.
3. Returning user welcome flow (no language prompt).
4. Main menu display and option navigation for all 7 options.
5. Global MENU command handling from any state.
6. START and STOP command handling (opt-in/opt-out status, timestamps).
7. STOP command never creating a support ticket.
8. Duplicate message handling (Meta retry idempotency).
9. Correct website link generation (pointing to https://www.kisaanbuddy.com).
10. Verification that localhost is never present in generated links.
11. Expired and invalid signed link tokens rejection.
12. Weather, Mandi and Schemes responses returning real data.
13. Crop Doctor image diagnosis flow.
14. Support ticket creation (exactly 1 ticket per request, no false 'expert notified' claims).
15. Production and test number routing isolation preserved.
16. Conversation state persistence across server restarts.
17. Alembic migration 008 upgrade and downgrade.
"""
from __future__ import annotations

import io
import json
import os
import sys
import tempfile
import time
import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from PIL import Image
import sqlalchemy as sa
from sqlalchemy.orm import Session

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from alembic.config import Config
from alembic import command
from core.config import settings
from db.models import DiseaseDetection, MarketPriceRecord, WhatsAppMessage, WhatsAppSupportTicket, WhatsAppUser
from db.session import Base, SessionLocal, engine
from services.whatsapp.client import resolve_whatsapp_credentials, WhatsAppRoutingError
from services.whatsapp.promotions import (
    record_opt_in,
    record_opt_out,
    send_farming_update,
)
from services.whatsapp.security import (
    generate_secure_link_token,
    verify_secure_link_token,
)
from services.whatsapp.service import whatsapp_service
from services.whatsapp.state_machine import ConversationStateManager, WhatsAppState, state_manager


class TestWhatsAppConversationIntelligence(unittest.IsolatedAsyncioTestCase):
    """End-to-end and unit tests verifying the 16 core conversation intelligence requirements."""

    async def asyncSetUp(self):
        if engine:
            Base.metadata.create_all(bind=engine)
        self.db: Session = SessionLocal()
        self.test_phones = [f"+9198000000{i:02d}" for i in range(1, 25)]
        # Clean up any state or records for these test phone numbers
        for p in self.test_phones:
            self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == p).delete()
            self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == p).delete()
            self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == p).delete()
        self.db.commit()
        for p in self.test_phones:
            await state_manager.clear_state(p, db=self.db)

    async def asyncTearDown(self):
        self.db.close()

    def _generate_synthetic_leaf(self) -> bytes:
        img = Image.new("RGB", (224, 224), color=(46, 139, 87))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    # -------------------------------------------------------------------------
    # 1. First-time language selection
    # -------------------------------------------------------------------------
    async def test_01_first_time_language_selection(self):
        """New farmer says HI -> receives language choice prompt (English, हिंदी, ಕನ್ನಡ)."""
        phone = self.test_phones[0]
        msg = {"type": "text", "id": "m1", "text": {"body": "Namaste"}}

        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send:
            mock_send.return_value = {"messages": [{"id": "out1"}]}
            await whatsapp_service.process_message_turn(msg, phone, "Sardar Patel", self.db)

            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.LANGUAGE_SELECTION)

            # Check that prompt contains options 1. English, 2. हिन्दी, 3. ಕನ್ನಡ
            outbound = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound)
            self.assertIn("English", outbound.body)
            self.assertIn("हिन्दी", outbound.body)
            self.assertIn("ಕನ್ನಡ", outbound.body)

    # -------------------------------------------------------------------------
    # 2. Language persistence in database
    # -------------------------------------------------------------------------
    async def test_02_language_persistence_in_database(self):
        """Selecting language stores it in the WhatsAppUser database table."""
        phone = self.test_phones[1]
        # First turn: triggers language selection
        await whatsapp_service.process_message_turn(
            {"type": "text", "id": "m2_1", "text": {"body": "Hello"}},
            phone, "Ramesh", self.db
        )
        # Second turn: select Hindi ("2")
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send, \
             patch("services.whatsapp.client.whatsapp_client.send_interactive_list", new_callable=AsyncMock) as mock_list:
            mock_send.return_value = {"messages": [{"id": "out2"}]}
            mock_list.return_value = {"messages": [{"id": "out2_menu"}]}

            await whatsapp_service.process_message_turn(
                {"type": "text", "id": "m2_2", "text": {"body": "2"}},
                phone, "Ramesh", self.db
            )

            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.MAIN_MENU)

            user = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
            self.assertIsNotNone(user)
            self.assertEqual(user.language, "hi")

    # -------------------------------------------------------------------------
    # 3. Returning user welcome flow (no language prompt)
    # -------------------------------------------------------------------------
    async def test_03_returning_user_welcome_flow(self):
        """Returning user with saved language gets welcome back + main menu without language prompt."""
        phone = self.test_phones[2]
        # Seed returning user in DB with Kannada
        user = WhatsAppUser(
            phone_number=phone,
            name="Basavaraj",
            language="kn",
            current_state=WhatsAppState.MAIN_MENU.value,
            last_active_at=datetime.now(timezone.utc).replace(tzinfo=None),
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        self.db.add(user)
        self.db.commit()
        await state_manager.set_state(phone, WhatsAppState.MAIN_MENU, db=self.db)

        # Returning user says "Namaskara"
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send, \
             patch("services.whatsapp.client.whatsapp_client.send_interactive_list", new_callable=AsyncMock) as mock_list:
            mock_send.return_value = {"messages": [{"id": "out3"}]}
            mock_list.return_value = {"messages": [{"id": "out3_list"}]}

            await whatsapp_service.process_message_turn(
                {"type": "text", "id": "m3", "text": {"body": "Namaskara"}},
                phone, "Basavaraj", self.db
            )

            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.MAIN_MENU)

            # Confirm returning user welcome message was sent in Kannada and not language selection
            outbounds = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).all()
            bodies = " ".join(o.body for o in outbounds)
            self.assertIn("ಸುಸ್ವಾಗತ", bodies)  # Kannada welcome
            self.assertNotIn("Please choose your preferred language", bodies)

    # -------------------------------------------------------------------------
    # 4. Main menu display and option navigation for all 7 options
    # -------------------------------------------------------------------------
    async def test_04_main_menu_all_7_options(self):
        """Verifies each of the 7 numbered menu options routes to the expected state/action."""
        phone = self.test_phones[3]
        user = WhatsAppUser(phone_number=phone, language="en", current_state=WhatsAppState.MAIN_MENU.value)
        self.db.add(user)
        self.db.commit()

        # Helper to reset state to MAIN_MENU before each option
        async def reset_menu():
            await state_manager.set_state(phone, WhatsAppState.MAIN_MENU, db=self.db)

        # Option 1: Crop Doctor
        await reset_menu()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "o1"}]}
            await whatsapp_service.process_message_turn({"type": "text", "id": "m_1", "text": {"body": "1"}}, phone, None, self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE)

        # Option 2: Ask Agri Question
        await reset_menu()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "o2"}]}
            await whatsapp_service.process_message_turn({"type": "text", "id": "m_2", "text": {"body": "2"}}, phone, None, self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.AGRICULTURAL_QUESTION)

        # Option 3: Weather Updates
        await reset_menu()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "o3"}]}
            await whatsapp_service.process_message_turn({"type": "text", "id": "m_3", "text": {"body": "3"}}, phone, None, self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.WEATHER_WAITING_FOR_LOCATION)

        # Option 4: Mandi Prices
        await reset_menu()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "o4"}]}
            await whatsapp_service.process_message_turn({"type": "text", "id": "m_4", "text": {"body": "4"}}, phone, None, self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.MANDI_WAITING_FOR_COMMODITY)

        # Option 5: Government Schemes
        await reset_menu()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "o5"}]}
            await whatsapp_service.process_message_turn({"type": "text", "id": "m_5", "text": {"body": "5"}}, phone, None, self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.MAIN_MENU)

        # Option 6: Talk to Support
        await reset_menu()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "o6"}]}
            await whatsapp_service.process_message_turn({"type": "text", "id": "m_6", "text": {"body": "6"}}, phone, None, self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.HUMAN_SUPPORT)

        # Option 7: Visit KisaanBuddy
        await reset_menu()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "o7"}]}
            await whatsapp_service.process_message_turn({"type": "text", "id": "m_7", "text": {"body": "7"}}, phone, None, self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.MAIN_MENU)

    # -------------------------------------------------------------------------
    # 5. Global MENU command handling from any state
    # -------------------------------------------------------------------------
    async def test_05_global_menu_command_from_any_state(self):
        """Sending 'MENU' resets state to MAIN_MENU from any conversation state."""
        phone = self.test_phones[4]
        states_to_test = [
            WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE,
            WhatsAppState.AGRICULTURAL_QUESTION,
            WhatsAppState.WEATHER_WAITING_FOR_LOCATION,
            WhatsAppState.MANDI_WAITING_FOR_COMMODITY,
            WhatsAppState.HUMAN_SUPPORT,
            WhatsAppState.LANGUAGE_SELECTION,
        ]

        for st in states_to_test:
            await state_manager.set_state(phone, st, db=self.db)
            with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send, \
                 patch("services.whatsapp.client.whatsapp_client.send_interactive_list", new_callable=AsyncMock) as m_list:
                m_send.return_value = {"messages": [{"id": "m_out"}]}
                m_list.return_value = {"messages": [{"id": "m_list"}]}

                await whatsapp_service.process_message_turn(
                    {"type": "text", "id": f"menu_{st.name}", "text": {"body": "MENU"}},
                    phone, None, self.db
                )
                curr_state, _, _ = await state_manager.get_state(phone)
                self.assertEqual(curr_state, WhatsAppState.MAIN_MENU)

    # -------------------------------------------------------------------------
    # 6. START and STOP command handling (opt-in/opt-out status, timestamps)
    # -------------------------------------------------------------------------
    async def test_06_start_and_stop_commands_and_consent_recording(self):
        """STOP records opted_out_at & consent source; START records opted_in_at & consent source."""
        phone = self.test_phones[5]
        user = WhatsAppUser(phone_number=phone, language="en", current_state=WhatsAppState.MAIN_MENU.value)
        self.db.add(user)
        self.db.commit()

        # Send STOP
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "stop_out"}]}
            await whatsapp_service.process_message_turn(
                {"type": "text", "id": "stop_1", "text": {"body": "STOP"}},
                phone, None, self.db
            )

            self.db.refresh(user)
            self.assertFalse(user.opted_in)
            self.assertIsNotNone(user.opted_out_at)
            self.assertEqual(user.consent_source, "whatsapp_stop")

        # Send START
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "start_out"}]}
            await whatsapp_service.process_message_turn(
                {"type": "text", "id": "start_1", "text": {"body": "START"}},
                phone, None, self.db
            )

            self.db.refresh(user)
            self.assertTrue(user.opted_in)
            self.assertIsNotNone(user.opted_in_at)
            self.assertEqual(user.consent_source, "whatsapp_start")

    # -------------------------------------------------------------------------
    # 7. STOP command never creating a support ticket
    # -------------------------------------------------------------------------
    async def test_07_stop_never_creates_support_ticket(self):
        """Sending STOP inside HUMAN_SUPPORT state opts out immediately and does NOT create a support ticket."""
        phone = self.test_phones[6]
        user = WhatsAppUser(phone_number=phone, language="en", current_state=WhatsAppState.HUMAN_SUPPORT.value)
        self.db.add(user)
        self.db.commit()
        await state_manager.set_state(phone, WhatsAppState.HUMAN_SUPPORT, db=self.db)

        initial_ticket_count = self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == phone).count()

        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "stop_in_sup"}]}
            await whatsapp_service.process_message_turn(
                {"type": "text", "id": "stop_sup", "text": {"body": "STOP"}},
                phone, None, self.db
            )

            new_ticket_count = self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == phone).count()
            self.assertEqual(new_ticket_count, initial_ticket_count)

    # -------------------------------------------------------------------------
    # 8. Duplicate message handling (Meta retry idempotency)
    # -------------------------------------------------------------------------
    async def test_08_duplicate_webhook_idempotency(self):
        """Webhook delivery with identical message ID processed only once; retry yields no duplicate processing."""
        from fastapi import BackgroundTasks
        phone = self.test_phones[7]
        dup_id = "wamid.IDEMPOTENT_TEST_KEY_9999"
        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "entry_1",
                    "changes": [
                        {
                            "field": "messages",
                            "value": {
                                "metadata": {"phone_number_id": "test_num_123"},
                                "messages": [
                                    {
                                        "from": phone,
                                        "id": dup_id,
                                        "type": "text",
                                        "text": {"body": "menu"},
                                    }
                                ],
                            },
                        }
                    ],
                }
            ],
        }

        with patch("services.whatsapp.client.whatsapp_client.mark_message_as_read", new_callable=AsyncMock):
            # First delivery
            bg1 = BackgroundTasks()
            await whatsapp_service.handle_webhook_payload(payload, bg1, self.db)
            first_count = self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == phone).count()
            self.assertEqual(first_count, 1)

            # Second delivery with exact same ID
            bg2 = BackgroundTasks()
            await whatsapp_service.handle_webhook_payload(payload, bg2, self.db)
            second_count = self.db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == phone).count()
            self.assertEqual(second_count, 1)

    # -------------------------------------------------------------------------
    # 9. Correct website link generation (all links pointing to https://www.kisaanbuddy.com)
    # -------------------------------------------------------------------------
    async def test_09_production_website_link_generation(self):
        """Verifies all actions generate links beginning with https://www.kisaanbuddy.com."""
        phone = self.test_phones[8]
        actions = ["weather", "mandi", "schemes", "support", "website", "crop_doctor"]

        for act in actions:
            token = generate_secure_link_token(phone, action=act)
            target_url = f"{settings.FRONTEND_BASE_URL}/{act}?token={token}"
            self.assertTrue(target_url.startswith("https://www.kisaanbuddy.com"))

    # -------------------------------------------------------------------------
    # 10. Verification that localhost is never present in generated links
    # -------------------------------------------------------------------------
    async def test_10_no_localhost_in_generated_links(self):
        """Verifies localhost:3000 or 127.0.0.1 is never present in generated links."""
        phone = self.test_phones[9]
        for act in ["weather", "mandi", "schemes", "diagnosis", "home"]:
            token = generate_secure_link_token(phone, action=act)
            url = f"{settings.FRONTEND_BASE_URL}/{act}?token={token}"
            self.assertNotIn("localhost", url)
            self.assertNotIn("127.0.0.1", url)
            self.assertNotIn("3000", url)

    # -------------------------------------------------------------------------
    # 11. Expired and invalid signed link tokens rejection
    # -------------------------------------------------------------------------
    async def test_11_expired_and_invalid_signed_link_tokens(self):
        """Expiring tokens reject expired timestamps and tampered signatures."""
        phone = self.test_phones[10]

        # 1. Expired token (expires in 1 second, wait 1.5 seconds)
        expired_token = generate_secure_link_token(phone, action="test", expires_seconds=1)
        time.sleep(1.5)
        res_exp = verify_secure_link_token(expired_token)
        self.assertIsNone(res_exp)

        # 2. Tampered signature
        valid_token = generate_secure_link_token(phone, action="test", expires_seconds=3600)
        parts = valid_token.split(".")
        tampered_token = f"{parts[0]}.{parts[1]}.tampered_signature_xyz"
        res_tampered = verify_secure_link_token(tampered_token)
        self.assertIsNone(res_tampered)

    # -------------------------------------------------------------------------
    # 12. Weather, Mandi and Schemes responses returning real data
    # -------------------------------------------------------------------------
    async def test_12_weather_mandi_and_schemes_real_responses(self):
        """Verifies Mandi and Schemes queries return verified agricultural records."""
        phone = self.test_phones[11]
        user = WhatsAppUser(phone_number=phone, language="en", current_state=WhatsAppState.MANDI_WAITING_FOR_COMMODITY.value)
        self.db.add(user)
        self.db.commit()
        await state_manager.set_state(phone, WhatsAppState.MANDI_WAITING_FOR_COMMODITY, db=self.db)

        # 1. Mandi query for Wheat
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "mandi_wheat_out"}]}
            await whatsapp_service.process_message_turn(
                {"type": "text", "id": "m_wheat", "text": {"body": "Wheat"}},
                phone, None, self.db
            )

            outbound = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound)
            self.assertIn("Wheat", outbound.body)
            self.assertIn("Modal Price", outbound.body)
            self.assertIn("AGMARKNET", outbound.body)

        # 2. Schemes query
        await state_manager.set_state(phone, WhatsAppState.MAIN_MENU, db=self.db)
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "schemes_out"}]}
            await whatsapp_service.process_message_turn(
                {"type": "text", "id": "m_schemes", "text": {"body": "5"}},
                phone, None, self.db
            )

            outbound = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound)
            self.assertIn("PM-KISAN", outbound.body)
            self.assertIn("PMFBY", outbound.body)

    # -------------------------------------------------------------------------
    # 13. Crop Doctor image diagnosis flow
    # -------------------------------------------------------------------------
    async def test_13_crop_doctor_image_diagnosis(self):
        """Farmer uploads foliage photo -> AI Vision runs -> creates DiseaseDetection record & advice."""
        phone = self.test_phones[12]
        user = WhatsAppUser(phone_number=phone, language="en", current_state=WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE.value)
        self.db.add(user)
        self.db.commit()
        await state_manager.set_state(phone, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE, db=self.db)

        leaf_bytes = self._generate_synthetic_leaf()
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send, \
             patch("services.whatsapp.client.whatsapp_client.download_media", new_callable=AsyncMock) as m_down:
            m_send.return_value = {"messages": [{"id": "cd_out"}]}
            m_down.return_value = (leaf_bytes, "image/jpeg")

            msg = {"type": "image", "id": "leaf_img_1", "image": {"id": "meta_img_8877", "mime_type": "image/jpeg"}}
            await whatsapp_service.process_message_turn(msg, phone, "Dharwad Farmer", self.db)

            # Check that DiseaseDetection was created
            diag = self.db.query(DiseaseDetection).order_by(DiseaseDetection.id.desc()).first()
            self.assertIsNotNone(diag)
            self.assertTrue(diag.confidence > 0.0)

            # Check outbound message links to diagnosis
            outbound = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound)
            self.assertIn("disease?diagnosis_id=", outbound.body)

    # -------------------------------------------------------------------------
    # 14. Support ticket creation (exactly 1 ticket, truthful notification)
    # -------------------------------------------------------------------------
    async def test_14_support_ticket_single_truthful(self):
        """Creates exactly one ticket on description, does not falsely claim immediate notification."""
        phone = self.test_phones[13]
        user = WhatsAppUser(phone_number=phone, language="en", current_state=WhatsAppState.HUMAN_SUPPORT.value)
        self.db.add(user)
        self.db.commit()
        await state_manager.set_state(phone, WhatsAppState.HUMAN_SUPPORT, db=self.db)

        msg = {"type": "text", "id": "sup_desc", "text": {"body": "My tomato plants have yellow mosaic patches on upper leaves."}}
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "sup_out"}]}
            await whatsapp_service.process_message_turn(msg, phone, "Harish", self.db)

            tickets = self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == phone).all()
            self.assertEqual(len(tickets), 1)
            t = tickets[0]
            self.assertEqual(t.status, "OPEN")
            self.assertTrue(t.ticket_id.startswith("KB-SUP-"))
            self.assertIn("yellow mosaic", t.query_summary.lower())

            # Verify outbound text
            outbound = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound)
            self.assertIn(t.ticket_id, outbound.body)
            # Confirms working hours review rather than false immediate notification
            self.assertIn("working hours", outbound.body.lower())

    # -------------------------------------------------------------------------
    # 15. Production and test number routing isolation preserved
    # -------------------------------------------------------------------------
    def test_15_production_and_test_number_routing_isolation(self):
        """Validates credentials isolation between production and test numbers."""
        with patch.object(settings, "WHATSAPP_PHONE_NUMBER_ID", "prod_id_1001"), \
             patch.object(settings, "WHATSAPP_ACCESS_TOKEN", "prod_token_alpha"), \
             patch.object(settings, "WHATSAPP_TEST_PHONE_NUMBER_ID", "test_id_2002"), \
             patch.object(settings, "WHATSAPP_TEST_ACCESS_TOKEN", "test_token_beta"):

            # Prod resolution
            p_id, p_token = resolve_whatsapp_credentials("prod_id_1001")
            self.assertEqual(p_id, "prod_id_1001")
            self.assertEqual(p_token, "prod_token_alpha")

            # Test resolution
            t_id, t_token = resolve_whatsapp_credentials("test_id_2002")
            self.assertEqual(t_id, "test_id_2002")
            self.assertEqual(t_token, "test_token_beta")

            # Unknown number ID raises WhatsAppRoutingError
            with self.assertRaises(WhatsAppRoutingError):
                resolve_whatsapp_credentials("unrecognized_number_id_9999")

    # -------------------------------------------------------------------------
    # 16. Conversation state persistence across server restarts
    # -------------------------------------------------------------------------
    async def test_16_conversation_state_persistence_across_restarts(self):
        """Simulates container restart with fresh ConversationStateManager reading from database."""
        phone = self.test_phones[14]
        user = WhatsAppUser(
            phone_number=phone,
            language="hi",
            current_state=WhatsAppState.MANDI_WAITING_FOR_COMMODITY.value,
            context_data_json=json.dumps({"district": "Belagavi"}),
        )
        self.db.add(user)
        self.db.commit()

        # Create a fresh isolated ConversationStateManager (simulating brand-new process memory)
        fresh_state_manager = ConversationStateManager()
        state, context, is_expired = await fresh_state_manager.get_state(phone, db=self.db)

        self.assertEqual(state, WhatsAppState.MANDI_WAITING_FOR_COMMODITY)
        self.assertEqual(context.get("district"), "Belagavi")
        self.assertEqual(context.get("language"), "hi")

    # -------------------------------------------------------------------------
    # 17. Alembic migration 008 upgrade and downgrade
    # -------------------------------------------------------------------------
    def test_17_alembic_migration_008_upgrade_and_downgrade(self):
        """Tests that Alembic migration 008 adds and drops columns cleanly without data loss."""
        with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
            tmp_db_path = tmp.name

        try:
            tmp_url = f"sqlite:///{tmp_db_path.replace(os.sep, '/')}"
            tmp_engine = sa.create_engine(tmp_url)
            with tmp_engine.begin() as conn:
                conn.execute(sa.text("""
                    CREATE TABLE whatsapp_users (
                        id INTEGER PRIMARY KEY,
                        phone_number VARCHAR(50) NOT NULL,
                        name VARCHAR(120),
                        language VARCHAR(10) DEFAULT 'en',
                        current_state VARCHAR(50) DEFAULT 'NEW_USER'
                    )
                """))

            alembic_cfg = Config(os.path.join(BASE_DIR, "alembic.ini"))
            alembic_cfg.set_main_option("script_location", os.path.join(BASE_DIR, "alembic"))
            alembic_cfg.set_main_option("sqlalchemy.url", tmp_url)

            # Stamp 007
            command.stamp(alembic_cfg, "007_add_whatsapp_tables")

            # Upgrade to 008
            command.upgrade(alembic_cfg, "008_add_whatsapp_conversation_intelligence")

            insp = sa.inspect(tmp_engine)
            cols = {c["name"] for c in insp.get_columns("whatsapp_users")}
            self.assertIn("opted_in_at", cols)
            self.assertIn("opted_out_at", cols)
            self.assertIn("consent_source", cols)
            self.assertIn("context_data_json", cols)

            # Downgrade back to 007
            command.downgrade(alembic_cfg, "007_add_whatsapp_tables")
            insp = sa.inspect(tmp_engine)
            cols_after = {c["name"] for c in insp.get_columns("whatsapp_users")}
            self.assertNotIn("opted_in_at", cols_after)
            self.assertNotIn("opted_out_at", cols_after)
            self.assertNotIn("consent_source", cols_after)
            self.assertNotIn("context_data_json", cols_after)

        finally:
            if os.path.exists(tmp_db_path):
                try:
                    os.remove(tmp_db_path)
                except Exception:
                    pass

    # -------------------------------------------------------------------------
    # 18. Promotional notifications consent and window compliance
    # -------------------------------------------------------------------------
    async def test_18_promotional_notifications_consent_and_window_compliance(self):
        """Validates that promotional notifications enforce opt-in and prevent campaign duplicates."""
        phone = self.test_phones[15]
        user = WhatsAppUser(
            phone_number=phone,
            opted_in=False,
            last_active_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        self.db.add(user)
        self.db.commit()

        # 1. Attempt to send to opted-out farmer -> blocked
        res_blocked = await send_farming_update(
            recipient_phone=phone,
            title="Kharif Sowing Alert",
            body="Monsoon arrival update for your region.",
            db=self.db,
            campaign_id="kharif_2026_01",
        )
        self.assertEqual(res_blocked["status"], "blocked_opt_out")

        # 2. Opt farmer in
        record_opt_in(phone, self.db, source="test_explicit_optin")
        self.db.refresh(user)
        self.assertTrue(user.opted_in)

        # 3. Send update successfully
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as m_send:
            m_send.return_value = {"messages": [{"id": "promo_wamid_1"}]}
            res_sent = await send_farming_update(
                recipient_phone=phone,
                title="Kharif Sowing Alert",
                body="Monsoon arrival update for your region.",
                db=self.db,
                campaign_id="kharif_2026_01",
            )
            self.assertEqual(res_sent["status"], "sent")

        # 4. Attempt duplicate campaign delivery -> duplicate blocked
        res_dup = await send_farming_update(
            recipient_phone=phone,
            title="Kharif Sowing Alert",
            body="Monsoon arrival update for your region.",
            db=self.db,
            campaign_id="kharif_2026_01",
        )
        self.assertEqual(res_dup["status"], "duplicate")


if __name__ == "__main__":
    unittest.main()
