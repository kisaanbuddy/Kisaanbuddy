"""Unit tests for WhatsApp Business Platform integration components."""
from __future__ import annotations

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import hashlib
import hmac
import io
import time
import unittest
from unittest.mock import AsyncMock, patch

from PIL import Image

from core.config import settings
from services.whatsapp.crop_doctor_handler import validate_crop_image
from services.whatsapp.deduplication import Deduplicator
from services.whatsapp.localization import (
    build_text_menu,
    detect_language_choice,
    get_text,
    parse_menu_selection,
)
from services.whatsapp.pricing import check_budget_limit, evaluate_message_cost
from services.whatsapp.security import (
    generate_secure_link_token,
    is_safe_media_url,
    normalize_phone_number,
    verify_secure_link_token,
    verify_webhook_challenge,
    verify_webhook_signature,
)
from services.whatsapp.state_machine import ConversationStateManager, WhatsAppState


class TestWhatsAppSecurity(unittest.TestCase):
    def test_phone_number_normalization(self):
        """Validates normalization of diverse Indian and international phone formats."""
        self.assertEqual(normalize_phone_number("9876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("09876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("+91 98765-43210"), "+919876543210")
        self.assertEqual(normalize_phone_number("919876543210"), "+919876543210")
        self.assertEqual(normalize_phone_number("+1 (555) 019-2831"), "+15550192831")
        self.assertEqual(normalize_phone_number(""), "")

    def test_webhook_challenge_verification(self):
        """GET webhook challenge matches configured token."""
        with patch.object(settings, "WHATSAPP_VERIFY_TOKEN", "my_secret_verify_token"):
            # Valid match
            self.assertEqual(
                verify_webhook_challenge("subscribe", "my_secret_verify_token", "11223344"),
                "11223344",
            )
            # Mismatched token
            self.assertIsNone(
                verify_webhook_challenge("subscribe", "wrong_token", "11223344"),
            )
            # Wrong mode
            self.assertIsNone(
                verify_webhook_challenge("unsubscribe", "my_secret_verify_token", "11223344"),
            )

    def test_webhook_signature_verification(self):
        """HMAC-SHA256 signature validation of incoming Meta payloads."""
        secret = "meta_app_secret_12345"
        raw_body = b'{"object":"whatsapp_business_account","entry":[]}'
        valid_digest = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
        valid_header = f"sha256={valid_digest}"

        with patch.object(settings, "WHATSAPP_APP_SECRET", secret), \
             patch.object(settings, "WHATSAPP_SIGNATURE_VERIFICATION", True):
            # Valid signature
            self.assertTrue(verify_webhook_signature(raw_body, valid_header))
            # Tampered body
            self.assertFalse(verify_webhook_signature(b'tampered payload', valid_header))
            # Missing / invalid header
            self.assertFalse(verify_webhook_signature(raw_body, None))
            self.assertFalse(verify_webhook_signature(raw_body, "invalid_header_format"))

    def test_ssrf_media_url_validation(self):
        """Guards against SSRF: only Meta/Facebook media CDNs allowed."""
        self.assertTrue(is_safe_media_url("https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=123"))
        self.assertTrue(is_safe_media_url("https://graph.facebook.com/v21.0/123456"))
        self.assertTrue(is_safe_media_url("https://scontent.xx.fbcdn.net/v/t39.1997-6/123.jpg"))

        # Malicious / internal addresses rejected
        self.assertFalse(is_safe_media_url("http://localhost:8000/internal"))
        self.assertFalse(is_safe_media_url("http://169.254.169.254/latest/meta-data/"))
        self.assertFalse(is_safe_media_url("https://attacker.com/exploit.png"))
        self.assertFalse(is_safe_media_url("file:///etc/passwd"))
        self.assertFalse(is_safe_media_url(""))

    def test_signed_link_tokens(self):
        """Expiring signed token generation, validation, and tamper detection."""
        phone = "+919876543210"
        token = generate_secure_link_token(phone, action="view_diagnosis", target_id="42", expires_seconds=3600)
        self.assertIsInstance(token, str)

        parsed = verify_secure_link_token(token)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["phone_number"], phone)
        self.assertEqual(parsed["action"], "view_diagnosis")
        self.assertEqual(parsed["target_id"], "42")

        # Expired token test
        expired_token = generate_secure_link_token(phone, action="view_diagnosis", target_id="42", expires_seconds=-10)
        self.assertIsNone(verify_secure_link_token(expired_token))

        # Tampered token
        tampered_token = token[:-4] + "abcd"
        self.assertIsNone(verify_secure_link_token(tampered_token))


class TestWhatsAppLocalization(unittest.TestCase):
    def test_menu_selection_parsing(self):
        """Parses digits, keywords and multilingual aliases for menu items."""
        self.assertEqual(parse_menu_selection("1"), "crop_doctor")
        self.assertEqual(parse_menu_selection("crop doctor"), "crop_doctor")
        self.assertEqual(parse_menu_selection("डॉक्टर"), "crop_doctor")
        self.assertEqual(parse_menu_selection("2"), "guidance")
        self.assertEqual(parse_menu_selection("3"), "weather")
        self.assertEqual(parse_menu_selection("मौसम"), "weather")
        self.assertEqual(parse_menu_selection("4"), "mandi")
        self.assertEqual(parse_menu_selection("मंडी"), "mandi")
        self.assertEqual(parse_menu_selection("5"), "schemes")
        self.assertEqual(parse_menu_selection("6"), "support")
        self.assertEqual(parse_menu_selection("7"), "website")
        self.assertEqual(parse_menu_selection("help"), "support")
        self.assertEqual(parse_menu_selection("language"), "language")
        self.assertIsNone(parse_menu_selection("random query"))

    def test_language_detection(self):
        """Detects language choice for English, Hindi, Kannada."""
        self.assertEqual(detect_language_choice("1"), "en")
        self.assertEqual(detect_language_choice("English"), "en")
        self.assertEqual(detect_language_choice("2"), "hi")
        self.assertEqual(detect_language_choice("हिन्दी"), "hi")
        self.assertEqual(detect_language_choice("3"), "kn")
        self.assertEqual(detect_language_choice("ಕನ್ನಡ"), "kn")
        self.assertIsNone(detect_language_choice("unknown"))

    def test_localized_strings_rendering(self):
        """Ensures all supported languages render without missing templates."""
        for lang in ("en", "hi", "kn"):
            welcome = get_text("welcome", lang)
            self.assertTrue(len(welcome) > 10)
            self.assertIn("KisaanBuddy", welcome)

            menu = build_text_menu(lang)
            self.assertTrue(len(menu) > 50)
            self.assertIn("1.", menu)
            self.assertIn("7.", menu)


class TestWhatsAppPricing(unittest.TestCase):
    def test_pricing_evaluation(self):
        """Verifies calculation of service and utility conversation costs."""
        # Inbound is free to business
        inbound_eval = evaluate_message_cost("inbound", "service")
        self.assertFalse(inbound_eval.is_chargeable)
        self.assertEqual(inbound_eval.estimated_cost_inr, 0.0)

        # Outbound new session is chargeable under Meta India rate
        outbound_eval = evaluate_message_cost("outbound", "service", is_session_start=True)
        self.assertTrue(outbound_eval.is_chargeable)
        self.assertAlmostEqual(outbound_eval.estimated_cost_inr, 0.29)

        # Outbound subsequent message inside 24h window
        subsequent_eval = evaluate_message_cost("outbound", "service", is_session_start=False)
        self.assertFalse(subsequent_eval.is_chargeable)
        self.assertEqual(subsequent_eval.estimated_cost_inr, 0.0)

    def test_budget_checking(self):
        """Validates warning and exceeded flags against monthly budget."""
        with patch.object(settings, "WHATSAPP_MONTHLY_BUDGET_INR", 1000.0):
            normal = check_budget_limit(200.0)
            self.assertFalse(normal["is_warning"])
            self.assertFalse(normal["is_exceeded"])

            warning = check_budget_limit(850.0)
            self.assertTrue(warning["is_warning"])
            self.assertFalse(warning["is_exceeded"])

            exceeded = check_budget_limit(1050.0)
            self.assertTrue(exceeded["is_exceeded"])


class TestWhatsAppCropImageValidation(unittest.TestCase):
    def test_image_validation(self):
        """Tests image size, format, dimension and corruption validation."""
        # Create valid 100x100 RGB JPEG
        img = Image.new("RGB", (100, 100), color=(73, 109, 137))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        valid_bytes = buf.getvalue()

        is_valid, err = validate_crop_image(valid_bytes, "image/jpeg")
        self.assertTrue(is_valid)
        self.assertIsNone(err)

        # Empty image
        is_valid, err = validate_crop_image(b"")
        self.assertFalse(is_valid)
        self.assertIn("Empty", err)

        # Corrupted bytes
        is_valid, err = validate_crop_image(b"not_an_image_at_all", "image/jpeg")
        self.assertFalse(is_valid)

        # Too small image (e.g. 10x10)
        tiny_img = Image.new("RGB", (10, 10), color=(0, 0, 0))
        tiny_buf = io.BytesIO()
        tiny_img.save(tiny_buf, format="JPEG")
        is_valid, err = validate_crop_image(tiny_buf.getvalue(), "image/jpeg")
        self.assertFalse(is_valid)
        self.assertIn("too small", err)


class TestWhatsAppStateMachine(unittest.IsolatedAsyncioTestCase):
    async def test_state_transitions_and_expiration(self):
        """Tests user state setting, context updates, and session expiration."""
        sm = ConversationStateManager()
        phone = "+919999988888"

        # Brand new user starts at NEW_USER
        state, ctx, is_exp = await sm.get_state(phone)
        self.assertEqual(state, WhatsAppState.NEW_USER)

        # Transition to MAIN_MENU
        await sm.set_state(phone, WhatsAppState.MAIN_MENU, {"lang": "hi"})
        state, ctx, is_exp = await sm.get_state(phone)
        self.assertEqual(state, WhatsAppState.MAIN_MENU)
        self.assertEqual(ctx["lang"], "hi")
        self.assertFalse(is_exp)

        # Transition to CROP_DOCTOR_WAITING_FOR_IMAGE
        await sm.set_state(phone, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE)
        state, ctx, is_exp = await sm.get_state(phone)
        self.assertEqual(state, WhatsAppState.CROP_DOCTOR_WAITING_FOR_IMAGE)

        # Clear state
        await sm.clear_state(phone)
        state, ctx, is_exp = await sm.get_state(phone)
        self.assertEqual(state, WhatsAppState.NEW_USER)


class TestWhatsAppDeduplication(unittest.IsolatedAsyncioTestCase):
    async def test_event_deduplication(self):
        """Validates that duplicate event IDs are blocked on webhook retry."""
        dedup = Deduplicator()
        event_id = "wamid.HBgLOTE5ODc2NTQzMjEwFQIAEhgUM0EBMEZGRDZCM0U3NzU4M0I5OQA="

        # First arrival -> not duplicate
        self.assertFalse(await dedup.is_duplicate(event_id, ttl_seconds=60))
        # Second arrival -> duplicate!
        self.assertTrue(await dedup.is_duplicate(event_id, ttl_seconds=60))
        # Another distinct event -> not duplicate
        self.assertFalse(await dedup.is_duplicate("wamid.different_event_id", ttl_seconds=60))


if __name__ == "__main__":
    unittest.main()
