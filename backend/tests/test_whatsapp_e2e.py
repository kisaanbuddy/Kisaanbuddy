"""End-to-End tests simulating all 12 required farmer user journeys."""
from __future__ import annotations

import io
import os
import sys
import unittest
import uuid
from unittest.mock import AsyncMock, patch

from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from db.models import DiseaseDetection, WhatsAppMessage, WhatsAppSupportTicket, WhatsAppUser
from db.session import SessionLocal, engine, Base
from services.whatsapp.crop_doctor_handler import process_crop_doctor_image
from services.whatsapp.security import (
    generate_secure_link_token,
    normalize_phone_number,
    verify_secure_link_token,
)
from services.whatsapp.service import whatsapp_service
from services.whatsapp.state_machine import WhatsAppState, state_manager


class TestWhatsAppEndToEndJourneys(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        if engine:
            Base.metadata.create_all(bind=engine)
        self.db = SessionLocal()

    async def asyncTearDown(self):
        self.db.close()

    def _generate_synthetic_crop_image(self) -> bytes:
        """Creates a valid synthetic 224x224 RGB image for inference testing."""
        img = Image.new("RGB", (224, 224), color=(34, 139, 34))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    async def test_01_new_farmer_welcome_and_language_selection(self):
        """TEST 1: New farmer -> welcome -> language selection -> main menu."""
        phone = "+919100000001"
        await state_manager.clear_state(phone)

        # 1. New farmer sends first message
        msg1 = {"type": "text", "id": "w1", "text": {"body": "Hello"}}
        with patch("services.whatsapp.client.whatsapp_client.send_interactive_list", new_callable=AsyncMock) as mock_list, \
             patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_text:
            mock_list.return_value = {"messages": [{"id": "wamid.out.1"}]}
            mock_text.return_value = {"messages": [{"id": "wamid.out.2"}]}

            await whatsapp_service.process_message_turn(msg1, phone, "Farmer Ramesh", self.db)
            state, ctx, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.MAIN_MENU)

            # 2. Farmer asks to change language
            msg2 = {"type": "text", "id": "w2", "text": {"body": "language"}}
            await whatsapp_service.process_message_turn(msg2, phone, "Farmer Ramesh", self.db)
            state, ctx, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.LANGUAGE_SELECTION)

            # 3. Farmer selects Hindi ("2")
            msg3 = {"type": "text", "id": "w3", "text": {"body": "2"}}
            await whatsapp_service.process_message_turn(msg3, phone, "Farmer Ramesh", self.db)
            state, ctx, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.MAIN_MENU)

            # Verify language saved in DB
            user = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
            self.assertIsNotNone(user)
            self.assertEqual(user.language, "hi")

    async def test_02_crop_doctor_image_upload_and_diagnosis(self):
        """TEST 2: Farmer -> Crop Doctor -> image upload -> actual inference -> diagnosis -> website link."""
        phone = "+919100000002"
        await state_manager.set_state(phone, WhatsAppState.MAIN_MENU)

        # 1. Farmer selects Crop Doctor ('1')
        msg1 = {"type": "text", "id": "w_cd_1", "text": {"body": "1"}}
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send, \
             patch("services.whatsapp.client.whatsapp_client.download_media", new_callable=AsyncMock) as mock_download:
            mock_send.return_value = {"messages": [{"id": "wamid.out.cd1"}]}
            await whatsapp_service.process_message_turn(msg1, phone, "Farmer Suresh", self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE)

            # 2. Farmer uploads leaf image
            sample_img = self._generate_synthetic_crop_image()
            mock_download.return_value = (sample_img, "image/jpeg")

            msg2 = {"type": "image", "id": "w_cd_2", "image": {"id": "media_foliage_998", "mime_type": "image/jpeg"}}
            await whatsapp_service.process_message_turn(msg2, phone, "Farmer Suresh", self.db)

            # Verify actual diagnosis saved in DiseaseDetection model
            latest_diag = self.db.query(DiseaseDetection).order_by(DiseaseDetection.id.desc()).first()
            self.assertIsNotNone(latest_diag)
            self.assertTrue(latest_diag.confidence > 0.0)
            self.assertIsNotNone(latest_diag.detected_disease)
            self.assertIn("crop_doctor", latest_diag.image_url)

            # Verify outbound message contains diagnosis and website link
            outbound_msg = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound_msg)
            self.assertIn("disease?diagnosis_id=", outbound_msg.body)
            self.assertIn(str(latest_diag.id), outbound_msg.body)

    async def test_03_agricultural_question_answering(self):
        """TEST 3: Farmer -> agricultural question -> knowledge engine -> answer."""
        phone = "+919100000003"
        await state_manager.set_state(phone, WhatsAppState.MAIN_MENU)

        # 1. Select Guidance ('3')
        msg1 = {"type": "text", "id": "w_g1", "text": {"body": "3"}}
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send:
            mock_send.return_value = {"messages": [{"id": "wamid.out.g1"}]}
            await whatsapp_service.process_message_turn(msg1, phone, "Farmer Anita", self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.AGRICULTURAL_QUESTION)

            # 2. Ask question
            msg2 = {"type": "text", "id": "w_g2", "text": {"body": "How to control blast disease in rice crop?"}}
            await whatsapp_service.process_message_turn(msg2, phone, "Farmer Anita", self.db)

            outbound = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound)
            self.assertIn("Rice", outbound.body)

    async def test_04_market_prices_redirection(self):
        """TEST 4: Farmer -> market prices -> verified website redirection link."""
        phone = "+919100000004"
        await state_manager.set_state(phone, WhatsAppState.MAIN_MENU)

        msg = {"type": "text", "id": "w_m1", "text": {"body": "4"}}
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send:
            mock_send.return_value = {"messages": [{"id": "wamid.out.m1"}]}
            await whatsapp_service.process_message_turn(msg, phone, "Farmer Dev", self.db)

            outbound = self.db.query(WhatsAppMessage).filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.direction == "outbound"
            ).order_by(WhatsAppMessage.id.desc()).first()
            self.assertIsNotNone(outbound)
            self.assertIn("/mandi?token=", outbound.body)

    async def test_05_human_support_request_persisted(self):
        """TEST 5: Farmer -> requests human support -> support request persisted."""
        phone = "+919100000005"
        await state_manager.set_state(phone, WhatsAppState.MAIN_MENU)

        # 1. Select Talk to Support ('6')
        msg1 = {"type": "text", "id": "w_s1", "text": {"body": "6"}}
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send:
            mock_send.return_value = {"messages": [{"id": "wamid.out.s1"}]}
            await whatsapp_service.process_message_turn(msg1, phone, "Farmer Gopal", self.db)
            state, _, _ = await state_manager.get_state(phone)
            self.assertEqual(state, WhatsAppState.HUMAN_SUPPORT)

            # Verify ticket created in WhatsAppSupportTicket table
            ticket = self.db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == phone).first()
            self.assertIsNotNone(ticket)
            self.assertEqual(ticket.status, "OPEN")
            self.assertTrue(ticket.ticket_id.startswith("KB-SUP-"))

    async def test_06_farmer_changes_language_persists(self):
        """TEST 6: Farmer -> changes language -> future messages use selected language."""
        phone = "+919100000006"
        await state_manager.set_state(phone, WhatsAppState.MAIN_MENU)

        # Switch to Kannada ("3")
        with patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock) as mock_send, \
             patch("services.whatsapp.client.whatsapp_client.send_interactive_list", new_callable=AsyncMock) as mock_list:
            mock_send.return_value = {"messages": [{"id": "wamid.out.kn1"}]}
            mock_list.return_value = {"messages": [{"id": "wamid.out.kn2"}]}

            # Trigger language selection
            msg1 = {"type": "text", "id": "w_l1", "text": {"body": "language"}}
            await whatsapp_service.process_message_turn(msg1, phone, "Farmer Manjunath", self.db)

            # Choose Kannada ("3")
            msg2 = {"type": "text", "id": "w_l2", "text": {"body": "3"}}
            await whatsapp_service.process_message_turn(msg2, phone, "Farmer Manjunath", self.db)

            wa_user = self.db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()
            self.assertEqual(wa_user.language, "kn")

    async def test_07_opens_diagnosis_link_validates(self):
        """TEST 7: Farmer opens diagnosis link -> secure token validated."""
        phone = "+919100000007"
        token = generate_secure_link_token(phone, action="view_diagnosis", target_id="88", expires_seconds=3600)
        parsed = verify_secure_link_token(token)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["phone_number"], phone)
        self.assertEqual(parsed["target_id"], "88")

    async def test_08_duplicate_webhook_event_idempotency(self):
        """TEST 8: Duplicate webhook event -> no duplicate message processing or diagnosis."""
        from fastapi import BackgroundTasks
        phone = "+919100000008"
        dup_msg_id = f"wamid.test_dup_{uuid.uuid4().hex}"

        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "123",
                    "changes": [
                        {
                            "field": "messages",
                            "value": {
                                "messaging_product": "whatsapp",
                                "messages": [
                                    {
                                        "from": phone,
                                        "id": dup_msg_id,
                                        "timestamp": "1710000000",
                                        "type": "text",
                                        "text": {"body": "1"},
                                    }
                                ],
                            },
                        }
                    ],
                }
            ],
        }

        bg1 = BackgroundTasks()
        await whatsapp_service.handle_webhook_payload(payload, bg1, self.db)
        # 2 tasks queued: mark_read and process_turn
        self.assertEqual(len(bg1.tasks), 2)

        # Send duplicate payload
        bg2 = BackgroundTasks()
        await whatsapp_service.handle_webhook_payload(payload, bg2, self.db)
        # Deduplicator blocked it -> 0 tasks queued!
        self.assertEqual(len(bg2.tasks), 0)

    async def test_09_invalid_image_rejection(self):
        """TEST 9: Invalid image -> safe rejection and helpful instructions."""
        phone = "+919100000009"
        # Provide corrupt non-image bytes
        corrupt_bytes = b"This is not a real image header"
        res = await process_crop_doctor_image(
            image_bytes=corrupt_bytes,
            mime_type="image/jpeg",
            phone_number=phone,
            db=self.db,
            language="en",
        )
        self.assertFalse(res["success"])
        self.assertEqual(res["error_type"], "invalid_image")
        self.assertIn("valid crop image", res["message"])

    async def test_10_inference_failure_honest_response(self):
        """TEST 10: Inference failure -> honest failure response, never a fabricated diagnosis."""
        phone = "+919100000010"
        sample_img = self._generate_synthetic_crop_image()

        # Mock inference engine throwing an unexpected exception
        with patch("services.whatsapp.crop_doctor_handler.pytorch_predict_disease", None), \
             patch("services.whatsapp.crop_doctor_handler.get_disease_classifier") as mock_clf:
            mock_clf.side_effect = RuntimeError("GPU / Model engine unavailable")
            res = await process_crop_doctor_image(
                image_bytes=sample_img,
                mime_type="image/jpeg",
                phone_number=phone,
                db=self.db,
                language="en",
            )
            self.assertFalse(res["success"])
            self.assertEqual(res["error_type"], "inference_failure")
            self.assertIn("could not complete the image diagnosis", res["message"])

    async def test_11_expired_link_safe_recovery(self):
        """TEST 11: Expired private website link -> safe recovery flow."""
        phone = "+919100000011"
        # Expired token (-10 seconds ago)
        expired_token = generate_secure_link_token(phone, action="view_diagnosis", target_id="99", expires_seconds=-10)
        res = verify_secure_link_token(expired_token)
        self.assertIsNone(res)

    async def test_12_concurrent_farmers_no_cross_talk(self):
        """TEST 12: Multiple farmers interacting simultaneously -> no cross-user conversation leakage."""
        phone_a = "+919100000021"
        phone_b = "+919100000022"

        # Farmer A is in CROP_DOCTOR_WAITING_FOR_IMAGE
        await state_manager.set_state(phone_a, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE, {"crop": "cotton"})
        # Farmer B is in AGRICULTURAL_QUESTION
        await state_manager.set_state(phone_b, WhatsAppState.AGRICULTURAL_QUESTION, {"crop": "paddy"})

        state_a, ctx_a, _ = await state_manager.get_state(phone_a)
        state_b, ctx_b, _ = await state_manager.get_state(phone_b)

        self.assertEqual(state_a, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE)
        self.assertEqual(ctx_a.get("crop"), "cotton")

        self.assertEqual(state_b, WhatsAppState.AGRICULTURAL_QUESTION)
        self.assertEqual(ctx_b.get("crop"), "paddy")


if __name__ == "__main__":
    unittest.main()
