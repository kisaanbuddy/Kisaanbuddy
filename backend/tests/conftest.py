"""Pytest fixtures and configuration for backend test suites."""
from __future__ import annotations

import pytest

from core.config import settings


@pytest.fixture(autouse=True)
def isolate_whatsapp_settings():
    """Autouse fixture ensuring that tests modifying singleton WhatsApp settings

    restore original configuration values after execution, preventing test-leakage.
    """
    orig_settings = {
        "WHATSAPP_PHONE_NUMBER_ID": settings.WHATSAPP_PHONE_NUMBER_ID,
        "WHATSAPP_ACCESS_TOKEN": settings.WHATSAPP_ACCESS_TOKEN,
        "WHATSAPP_TEST_PHONE_NUMBER_ID": settings.WHATSAPP_TEST_PHONE_NUMBER_ID,
        "WHATSAPP_TEST_ACCESS_TOKEN": settings.WHATSAPP_TEST_ACCESS_TOKEN,
        "WHATSAPP_API_VERSION": settings.WHATSAPP_API_VERSION,
        "WHATSAPP_APP_SECRET": settings.WHATSAPP_APP_SECRET,
        "WHATSAPP_VERIFY_TOKEN": settings.WHATSAPP_VERIFY_TOKEN,
        "WHATSAPP_SIGNATURE_VERIFICATION": settings.WHATSAPP_SIGNATURE_VERIFICATION,
    }
    yield
    for key, val in orig_settings.items():
        setattr(settings, key, val)
