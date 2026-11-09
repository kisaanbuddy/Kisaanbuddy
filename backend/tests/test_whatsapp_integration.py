"""Integration tests for WhatsApp Business Platform endpoints."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.config import settings
from db.models import DiseaseDetection, User, WhatsAppMessage, WhatsAppSupportTicket, WhatsAppUser
from db.session import SessionLocal, engine, Base
from main import app
from services.whatsapp.security import generate_secure_link_token


class TestWhatsAppAPIIntegration(unittest.TestCase):
    def setUp(self):
        if engine:
            Base.metadata.create_all(bind=engine)
        self.client = TestClient(app)
        self.verify_token = "test_webhook_verify_token_123"
        self.app_secret = "test_meta_app_secret_987"
        settings.WHATSAPP_VERIFY_TOKEN = self.verify_token
        settings.WHATSAPP_APP_SECRET = self.app_secret
        settings.WHATSAPP_SIGNATURE_VERIFICATION = True

    def test_webhook_get_verification_success(self):
        """GET /api/whatsapp/webhook returns hub.challenge when token matches."""
        challenge = "random_challenge_string_998877"
        resp = self.client.get(
            f"/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token={self.verify_token}&hub.challenge={challenge}"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.text, challenge)

    def test_webhook_get_verification_forbidden(self):
        """GET /api/whatsapp/webhook rejects invalid verify token."""
        resp = self.client.get(
            "/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=12345"
        )
        self.assertEqual(resp.status_code, 403)

    def test_webhook_post_signature_rejection(self):
        """POST /api/whatsapp/webhook rejects invalid HMAC signature with 403."""
        payload = {"object": "whatsapp_business_account", "entry": []}
        resp = self.client.post(
            "/api/whatsapp/webhook",
            json=payload,
            headers={"X-Hub-Signature-256": "sha256=invalid_hex_digest"},
        )
        self.assertEqual(resp.status_code, 403)

    def test_webhook_post_valid_payload_accepted(self):
        """POST /api/whatsapp/webhook accepts valid HMAC signature promptly."""
        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "123456789",
                    "changes": [
                        {
                            "field": "messages",
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {"display_phone_number": "1555000", "phone_number_id": "111222"},
                                "contacts": [{"wa_id": "919876543210", "profile": {"name": "Ramesh Kumar"}}],
                                "messages": [
                                    {
                                        "from": "919876543210",
                                        "id": f"wamid.test_{os.urandom(6).hex()}",
                                        "timestamp": "1710000000",
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
        body_bytes = json.dumps(payload).encode("utf-8")
        sig = hmac.new(self.app_secret.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()

        resp = self.client.post(
            "/api/whatsapp/webhook",
            content=body_bytes,
            headers={
                "Content-Type": "application/json",
                "X-Hub-Signature-256": f"sha256={sig}",
            },
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get("status"), "accepted")

    def test_verify_link_token_endpoint(self):
        """GET /api/whatsapp/auth/verify-link validates tokens correctly."""
        phone = "+919876543210"
        valid_token = generate_secure_link_token(phone, action="view_diagnosis", target_id="101", expires_seconds=600)
        resp = self.client.get(f"/api/whatsapp/auth/verify-link?token={valid_token}")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get("valid"))
        self.assertEqual(data.get("phone_number"), phone)
        self.assertEqual(data.get("action"), "view_diagnosis")
        self.assertEqual(data.get("target_id"), "101")

        # Invalid token
        resp_invalid = self.client.get("/api/whatsapp/auth/verify-link?token=corrupt.token.value")
        self.assertEqual(resp_invalid.status_code, 200)
        self.assertFalse(resp_invalid.json().get("valid"))

    def test_health_endpoint(self):
        """GET /api/whatsapp/health reports integration status."""
        resp = self.client.get("/api/whatsapp/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("status", data)
        self.assertIn("configured", data)
        self.assertIn("message_count_24h", data)

    def test_admin_stats_and_tickets(self):
        """GET /api/whatsapp/admin/stats and tickets."""
        stats_resp = self.client.get("/api/whatsapp/admin/stats")
        self.assertEqual(stats_resp.status_code, 200)
        stats = stats_resp.json()
        self.assertIn("total_messages_received", stats)
        self.assertIn("total_messages_sent", stats)
        self.assertIn("estimated_cost_inr", stats)
        self.assertIn("monthly_budget_inr", stats)

        tickets_resp = self.client.get("/api/whatsapp/admin/tickets")
        self.assertEqual(tickets_resp.status_code, 200)
        self.assertIsInstance(tickets_resp.json(), list)

    def test_dpdp_privacy_erasure(self):
        """POST /api/whatsapp/privacy/request-erasure removes farmer data on request."""
        phone = "+919777700001"
        with SessionLocal() as db:
            u = WhatsAppUser(phone_number=phone, language="hi")
            db.add(u)
            db.commit()

        resp = self.client.post(f"/api/whatsapp/privacy/request-erasure?phone_number={phone}")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "erased")


if __name__ == "__main__":
    unittest.main()
