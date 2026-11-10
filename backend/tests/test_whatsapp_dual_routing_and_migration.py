"""Tests for dynamic dual-number routing, token isolation, and Alembic migration 007."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import sys
import tempfile
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from alembic.config import Config
from alembic import command
import sqlalchemy as sa
from sqlalchemy.orm import Session

from core.config import settings
from db.session import Base, SessionLocal, engine
from main import app
from services.whatsapp.client import (
    WhatsAppRoutingError,
    resolve_whatsapp_credentials,
    whatsapp_client,
)
from services.whatsapp.service import whatsapp_service


class TestWhatsAppDualNumberRouting(unittest.IsolatedAsyncioTestCase):
    """Validates dynamic routing and isolation between Meta test and production numbers."""

    def setUp(self):
        self._orig_settings = {
            "WHATSAPP_PHONE_NUMBER_ID": settings.WHATSAPP_PHONE_NUMBER_ID,
            "WHATSAPP_ACCESS_TOKEN": settings.WHATSAPP_ACCESS_TOKEN,
            "WHATSAPP_TEST_PHONE_NUMBER_ID": settings.WHATSAPP_TEST_PHONE_NUMBER_ID,
            "WHATSAPP_TEST_ACCESS_TOKEN": settings.WHATSAPP_TEST_ACCESS_TOKEN,
            "WHATSAPP_API_VERSION": settings.WHATSAPP_API_VERSION,
            "WHATSAPP_APP_SECRET": settings.WHATSAPP_APP_SECRET,
            "WHATSAPP_VERIFY_TOKEN": settings.WHATSAPP_VERIFY_TOKEN,
            "WHATSAPP_SIGNATURE_VERIFICATION": settings.WHATSAPP_SIGNATURE_VERIFICATION,
        }
        self.addCleanup(self._restore_settings)

        self.prod_id = "prod_num_111111"
        self.prod_token = "prod_access_token_alpha"
        self.test_id = "test_num_222222"
        self.test_token = "test_access_token_beta"

        # Apply settings
        settings.WHATSAPP_PHONE_NUMBER_ID = self.prod_id
        settings.WHATSAPP_ACCESS_TOKEN = self.prod_token
        settings.WHATSAPP_TEST_PHONE_NUMBER_ID = self.test_id
        settings.WHATSAPP_TEST_ACCESS_TOKEN = self.test_token
        settings.WHATSAPP_API_VERSION = "v21.0"

    def _restore_settings(self):
        for k, v in self._orig_settings.items():
            setattr(settings, k, v)

    def tearDown(self):
        self._restore_settings()

    def test_routing_to_production_number(self):
        """Routing with production phone number ID resolves to production credentials."""
        phone_id, token = resolve_whatsapp_credentials(self.prod_id)
        self.assertEqual(phone_id, self.prod_id)
        self.assertEqual(token, self.prod_token)

    def test_routing_to_test_number(self):
        """Routing with test phone number ID resolves to test credentials."""
        phone_id, token = resolve_whatsapp_credentials(self.test_id)
        self.assertEqual(phone_id, self.test_id)
        self.assertEqual(token, self.test_token)

    def test_test_number_token_fallback(self):
        """Test number falls back safely to primary token when separate test token is unset."""
        settings.WHATSAPP_TEST_ACCESS_TOKEN = None
        phone_id, token = resolve_whatsapp_credentials(self.test_id)
        self.assertEqual(phone_id, self.test_id)
        self.assertEqual(token, self.prod_token)

    def test_unknown_phone_number_id_strictly_rejected(self):
        """Unknown sender_phone_number_id raises WhatsAppRoutingError to prevent cross-number delivery."""
        with self.assertRaises(WhatsAppRoutingError) as ctx:
            resolve_whatsapp_credentials("unknown_sender_999999")
        self.assertIn("Cross-number delivery blocked", str(ctx.exception))

    def test_backward_compatibility_none_defaults_to_primary(self):
        """When sender_phone_number_id is omitted (None), defaults to production number for back-compat."""
        phone_id, token = resolve_whatsapp_credentials(None)
        self.assertEqual(phone_id, self.prod_id)
        self.assertEqual(token, self.prod_token)

    def test_backward_compatibility_only_test_configured(self):
        """When only test phone number ID is configured, sender_phone_number_id=None defaults to test."""
        settings.WHATSAPP_PHONE_NUMBER_ID = None
        phone_id, token = resolve_whatsapp_credentials(None)
        self.assertEqual(phone_id, self.test_id)
        self.assertEqual(token, self.test_token)

    @patch("services.whatsapp.client.WhatsAppClient._post_with_retry", new_callable=AsyncMock)
    async def test_client_outbound_dispatches_with_correct_id_and_token(self, mock_post):
        """WhatsAppClient sends requests with the exact phone_number_id and token resolved."""
        mock_post.return_value = {"messages": [{"id": "wamid.123"}]}

        # Outbound via test number
        await whatsapp_client.send_text_message(
            recipient_phone="+919876543210",
            body="Test Message",
            sender_phone_number_id=self.test_id,
        )
        self.assertEqual(mock_post.call_count, 1)
        call_url = mock_post.call_args[0][0]
        call_headers = mock_post.call_args[1]["headers"]
        self.assertIn(f"/v21.0/{self.test_id}/messages", call_url)
        self.assertEqual(call_headers["Authorization"], f"Bearer {self.test_token}")

        # Outbound via production number
        await whatsapp_client.send_text_message(
            recipient_phone="+919876543210",
            body="Prod Message",
            sender_phone_number_id=self.prod_id,
        )
        self.assertEqual(mock_post.call_count, 2)
        call_url_prod = mock_post.call_args[0][0]
        call_headers_prod = mock_post.call_args[1]["headers"]
        self.assertIn(f"/v21.0/{self.prod_id}/messages", call_url_prod)
        self.assertEqual(call_headers_prod["Authorization"], f"Bearer {self.prod_token}")

    @patch("services.whatsapp.client.WhatsAppClient._post_with_retry", new_callable=AsyncMock)
    async def test_client_blocks_outbound_when_unknown_number(self, mock_post):
        """WhatsAppClient aborts outbound transmission if an unregistered phone number ID is supplied."""
        with self.assertRaises(WhatsAppRoutingError):
            await whatsapp_client.send_text_message(
                recipient_phone="+919876543210",
                body="Spoofed Message",
                sender_phone_number_id="attacker_phone_999",
            )
        mock_post.assert_not_called()


class TestWhatsAppWebhookEndToEndRouting(unittest.TestCase):
    """Verifies full end-to-end webhook routing, signature checks, and cross-number isolation."""

    def setUp(self):
        self._orig_settings = {
            "WHATSAPP_PHONE_NUMBER_ID": settings.WHATSAPP_PHONE_NUMBER_ID,
            "WHATSAPP_ACCESS_TOKEN": settings.WHATSAPP_ACCESS_TOKEN,
            "WHATSAPP_TEST_PHONE_NUMBER_ID": settings.WHATSAPP_TEST_PHONE_NUMBER_ID,
            "WHATSAPP_TEST_ACCESS_TOKEN": settings.WHATSAPP_TEST_ACCESS_TOKEN,
            "WHATSAPP_API_VERSION": settings.WHATSAPP_API_VERSION,
            "WHATSAPP_APP_SECRET": settings.WHATSAPP_APP_SECRET,
            "WHATSAPP_VERIFY_TOKEN": settings.WHATSAPP_VERIFY_TOKEN,
            "WHATSAPP_SIGNATURE_VERIFICATION": settings.WHATSAPP_SIGNATURE_VERIFICATION,
        }
        self.addCleanup(self._restore_settings)

        if engine:
            Base.metadata.create_all(bind=engine)
        self.client = TestClient(app)
        self.app_secret = "test_meta_webhook_secret_key_123"
        self.prod_id = "prod_id_55555"
        self.test_id = "test_id_77777"
        self.prod_token = "prod_token_555"
        self.test_token = "test_token_777"

        settings.WHATSAPP_APP_SECRET = self.app_secret
        settings.WHATSAPP_VERIFY_TOKEN = "verify_token_abc"
        settings.WHATSAPP_SIGNATURE_VERIFICATION = True
        settings.WHATSAPP_PHONE_NUMBER_ID = self.prod_id
        settings.WHATSAPP_ACCESS_TOKEN = self.prod_token
        settings.WHATSAPP_TEST_PHONE_NUMBER_ID = self.test_id
        settings.WHATSAPP_TEST_ACCESS_TOKEN = self.test_token

    def _restore_settings(self):
        for k, v in self._orig_settings.items():
            setattr(settings, k, v)

    def tearDown(self):
        self._restore_settings()

    def _sign_payload(self, payload_dict: dict) -> tuple[bytes, dict]:
        body_bytes = json.dumps(payload_dict).encode("utf-8")
        sig = hmac.new(self.app_secret.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()
        headers = {
            "Content-Type": "application/json",
            "X-Hub-Signature-256": f"sha256={sig}",
        }
        return body_bytes, headers

    def test_webhook_signature_verification_enforced(self):
        """Webhook verifies HMAC signature and rejects invalid or missing signatures with 403."""
        payload = {"object": "whatsapp_business_account", "entry": []}

        # 1. Missing signature header
        resp = self.client.post("/api/whatsapp/webhook", json=payload)
        self.assertEqual(resp.status_code, 403)

        # 2. Tampered signature header
        resp = self.client.post(
            "/api/whatsapp/webhook",
            json=payload,
            headers={"X-Hub-Signature-256": "sha256=invalid_tampered_signature_hex"},
        )
        self.assertEqual(resp.status_code, 403)

        # 3. Valid signature header
        body_bytes, headers = self._sign_payload(payload)
        resp = self.client.post("/api/whatsapp/webhook", content=body_bytes, headers=headers)
        self.assertEqual(resp.status_code, 200)

    @patch("services.whatsapp.client.whatsapp_client.send_interactive_list", new_callable=AsyncMock)
    @patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_incoming_test_number_routes_to_test_sender(self, mock_text, mock_list):
        """Inbound webhook on test number triggers outbound turn with test sender_phone_number_id."""
        mock_list.return_value = {"messages": [{"id": "wamid.list.1"}]}
        mock_text.return_value = {"messages": [{"id": "wamid.text.1"}]}

        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "entry_1",
                    "changes": [
                        {
                            "field": "messages",
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {"phone_number_id": self.test_id, "display_phone_number": "1555777"},
                                "contacts": [{"wa_id": "919900000001", "profile": {"name": "Test Farmer"}}],
                                "messages": [
                                    {
                                        "from": "919900000001",
                                        "id": f"wamid.test_{os.urandom(4).hex()}",
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

        body_bytes, headers = self._sign_payload(payload)
        resp = self.client.post("/api/whatsapp/webhook", content=body_bytes, headers=headers)
        self.assertEqual(resp.status_code, 200)

        # Check that outbound call used test sender_phone_number_id
        if mock_list.called:
            self.assertEqual(mock_list.call_args[1].get("sender_phone_number_id"), self.test_id)
        elif mock_text.called:
            self.assertEqual(mock_text.call_args[1].get("sender_phone_number_id"), self.test_id)

    @patch("services.whatsapp.client.whatsapp_client.send_interactive_list", new_callable=AsyncMock)
    @patch("services.whatsapp.client.whatsapp_client.send_text_message", new_callable=AsyncMock)
    def test_incoming_production_number_routes_to_prod_sender(self, mock_text, mock_list):
        """Inbound webhook on production number triggers outbound turn with prod sender_phone_number_id."""
        mock_list.return_value = {"messages": [{"id": "wamid.list.2"}]}
        mock_text.return_value = {"messages": [{"id": "wamid.text.2"}]}

        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "entry_2",
                    "changes": [
                        {
                            "field": "messages",
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {"phone_number_id": self.prod_id, "display_phone_number": "919876543210"},
                                "contacts": [{"wa_id": "919900000002", "profile": {"name": "Real Farmer"}}],
                                "messages": [
                                    {
                                        "from": "919900000002",
                                        "id": f"wamid.prod_{os.urandom(4).hex()}",
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

        body_bytes, headers = self._sign_payload(payload)
        resp = self.client.post("/api/whatsapp/webhook", content=body_bytes, headers=headers)
        self.assertEqual(resp.status_code, 200)

        # Check that outbound call used production sender_phone_number_id
        if mock_list.called:
            self.assertEqual(mock_list.call_args[1].get("sender_phone_number_id"), self.prod_id)
        elif mock_text.called:
            self.assertEqual(mock_text.call_args[1].get("sender_phone_number_id"), self.prod_id)


class TestAlembicWhatsAppMigration(unittest.TestCase):
    """Tests Alembic migration 007_add_whatsapp_tables upgrade and downgrade."""

    def setUp(self):
        # Create an isolated temporary SQLite DB for migration testing
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db.close()
        self.db_url = f"sqlite:///{self.temp_db.name.replace(os.sep, '/')}"

        # Initialize alembic config
        alembic_ini_path = os.path.join(BASE_DIR, "alembic.ini")
        self.alembic_cfg = Config(alembic_ini_path)
        self.alembic_cfg.set_main_option("sqlalchemy.url", self.db_url)
        self.alembic_cfg.set_main_option("script_location", os.path.join(BASE_DIR, "alembic"))

        # Stamp the database at revision 006_add_field_pilot_fields (simulating pre-existing deployment state)
        # Create users table for FK reference
        test_engine = sa.create_engine(self.db_url)
        with test_engine.connect() as conn:
            conn.execute(sa.text("""
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY,
                    phone VARCHAR(20),
                    name VARCHAR(100)
                )
            """))
            conn.commit()
        test_engine.dispose()
        command.stamp(self.alembic_cfg, "006_add_field_pilot_fields")

    def tearDown(self):
        if os.path.exists(self.temp_db.name):
            try:
                os.remove(self.temp_db.name)
            except Exception:
                pass

    def test_alembic_migration_007_upgrade_and_downgrade(self):
        """Verifies full upgrade to 007_add_whatsapp_tables and clean downgrade."""
        # 1. Upgrade from 006 to 007
        command.upgrade(self.alembic_cfg, "007_add_whatsapp_tables")

        engine = sa.create_engine(self.db_url)
        inspector = sa.inspect(engine)
        table_names = set(inspector.get_table_names())

        required_tables = {
            "whatsapp_users",
            "whatsapp_messages",
            "whatsapp_support_tickets",
            "whatsapp_link_tokens",
        }
        for table in required_tables:
            self.assertIn(table, table_names, f"Expected table {table} to be created by migration 007")

        # Verify key columns in whatsapp_users
        user_cols = {col["name"] for col in inspector.get_columns("whatsapp_users")}
        self.assertTrue({"id", "phone_number", "user_id", "language", "current_state", "opted_in"}.issubset(user_cols))

        # Verify key columns in whatsapp_messages
        msg_cols = {col["name"] for col in inspector.get_columns("whatsapp_messages")}
        self.assertTrue({"id", "message_id", "phone_number", "direction", "category", "status", "estimated_cost_inr"}.issubset(msg_cols))

        # 2. Test downgrade back to 006_add_field_pilot_fields
        command.downgrade(self.alembic_cfg, "006_add_field_pilot_fields")
        inspector_after = sa.inspect(engine)
        tables_after = set(inspector_after.get_table_names())
        for table in required_tables:
            self.assertNotIn(table, tables_after, f"Expected table {table} to be dropped on downgrade")

        # 3. Test upgrade again (verifies re-creation)
        command.upgrade(self.alembic_cfg, "007_add_whatsapp_tables")
        inspector_reup = sa.inspect(engine)
        tables_reup = set(inspector_reup.get_table_names())
        for table in required_tables:
            self.assertIn(table, tables_reup, f"Expected table {table} to be re-created on second upgrade")

    def test_avoid_duplicate_table_creation_conflict(self):
        """Verifies migration 007 handles pre-existing tables from Base.metadata.create_all without error."""
        # Pre-create one of the tables to simulate Base.metadata.create_all already having run
        engine = sa.create_engine(self.db_url)
        with engine.connect() as conn:
            conn.execute(sa.text("""
                CREATE TABLE IF NOT EXISTS whatsapp_users (
                    id INTEGER PRIMARY KEY,
                    phone_number VARCHAR(50) UNIQUE NOT NULL,
                    user_id INTEGER,
                    name VARCHAR(100),
                    language VARCHAR(10) DEFAULT 'en',
                    current_state VARCHAR(50) DEFAULT 'NEW_USER',
                    last_active_at DATETIME,
                    opted_in BOOLEAN DEFAULT 1,
                    created_at DATETIME,
                    updated_at DATETIME
                )
            """))
            conn.commit()
        engine.dispose()

        # Running upgrade should not raise an error even though whatsapp_users already exists
        command.upgrade(self.alembic_cfg, "007_add_whatsapp_tables")
        engine = sa.create_engine(self.db_url)
        inspector = sa.inspect(engine)
        self.assertIn("whatsapp_users", inspector.get_table_names())
        self.assertIn("whatsapp_messages", inspector.get_table_names())
