"""Security, signature verification, phone normalization and signed token utilities for WhatsApp."""
from __future__ import annotations

import hashlib
import hmac
import logging
import re
import time
from typing import Any, Dict, Optional
from urllib.parse import urlparse

from core.config import settings

log = logging.getLogger(__name__)

# Strict domain allowlist for Meta-hosted media downloads to prevent SSRF
META_MEDIA_ALLOWED_DOMAINS = {
    "lookaside.fbsbx.com",
    "graph.facebook.com",
    "whatsapp.com",
}


def verify_webhook_signature(raw_payload: bytes, signature_header: Optional[str]) -> bool:
    """Verifies the X-Hub-Signature-256 header sent by Meta Cloud API using SHA-256 HMAC."""
    if not settings.WHATSAPP_SIGNATURE_VERIFICATION:
        return True

    app_secret = (settings.WHATSAPP_APP_SECRET or "").strip()
    if not app_secret:
        if settings.DEBUG:
            log.warning("WHATSAPP_APP_SECRET not set; allowing webhook in DEBUG mode.")
            return True
        log.error("WHATSAPP_APP_SECRET missing in production; rejecting webhook.")
        return False

    if not signature_header:
        log.warning("Missing X-Hub-Signature-256 header.")
        return False

    # Signature format: "sha256=<hex_digest>"
    parts = signature_header.split("sha256=", 1)
    if len(parts) != 2:
        log.warning("Invalid X-Hub-Signature-256 header format.")
        return False

    expected_sig = parts[1].strip()
    computed_sig = hmac.new(
        key=app_secret.encode("utf-8"),
        msg=raw_payload,
        digestmod=hashlib.sha256,
    ).hexdigest()

    is_valid = hmac.compare_digest(computed_sig, expected_sig)
    if not is_valid:
        log.warning("Webhook HMAC signature verification failed.")
    return is_valid


def verify_webhook_challenge(
    mode: Optional[str],
    token: Optional[str],
    challenge: Optional[str],
) -> Optional[str]:
    """Verifies the hub.mode, hub.verify_token and returns hub.challenge if valid."""
    configured_token = (settings.WHATSAPP_VERIFY_TOKEN or "").strip()
    if mode == "subscribe" and token and configured_token and token == configured_token:
        log.info("WhatsApp webhook challenge verified successfully.")
        return challenge
    log.warning("WhatsApp webhook verification failed: mode=%s, token_match=%s", mode, token == configured_token)
    return None


def normalize_phone_number(raw_phone: str) -> str:
    """Normalizes phone numbers to standard E.164 format.

    Examples:
        '9876543210' -> '+919876543210'
        '09876543210' -> '+919876543210'
        '919876543210' -> '+919876543210'
        '+91 98765-43210' -> '+919876543210'
        '+1 (555) 123-4567' -> '+15551234567'
    """
    if not raw_phone:
        return ""

    # Strip whitespace, dashes, parens, dots
    cleaned = re.sub(r"[\s\-\(\)\.]", "", str(raw_phone))

    if cleaned.startswith("+"):
        digits_only = re.sub(r"\D", "", cleaned)
        return f"+{digits_only}"

    digits_only = re.sub(r"\D", "", cleaned)

    # 10-digit Indian mobile numbers (starts with 6, 7, 8, or 9)
    if len(digits_only) == 10 and digits_only[0] in "6789":
        return f"+91{digits_only}"

    # 11-digit starting with 0 (Indian trunk prefix)
    if len(digits_only) == 11 and digits_only.startswith("0") and digits_only[1] in "6789":
        return f"+91{digits_only[1:]}"

    # 12-digit Indian number starting with 91
    if len(digits_only) == 12 and digits_only.startswith("91"):
        return f"+{digits_only}"

    # Fallback to + prefix on digits
    return f"+{digits_only}" if digits_only else ""


def is_safe_media_url(url: str) -> bool:
    """Validates that a media download URL originates strictly from Meta's infrastructure.

    Prevents Server-Side Request Forgery (SSRF) from arbitrary external URLs.
    """
    if not url:
        return False
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("https", "http"):
            return False
        hostname = (parsed.hostname or "").lower()
        if hostname in META_MEDIA_ALLOWED_DOMAINS:
            return True
        if hostname.endswith(".fbcdn.net") or hostname.endswith(".facebook.com"):
            return True
        return False
    except Exception as e:
        log.warning("SSRF check failed to parse URL %s: %s", url, e)
        return False


def generate_secure_link_token(
    phone_number: str,
    action: str,
    target_id: Optional[str] = None,
    expires_seconds: int = 86400,
) -> str:
    """Generates an HMAC-signed tamper-evident token with embedded expiration for web links."""
    normalized_phone = normalize_phone_number(phone_number)
    target = target_id or ""
    exp_ts = int(time.time()) + expires_seconds
    payload_str = f"{normalized_phone}:{action}:{target}:{exp_ts}"

    secret = (settings.JWT_SECRET or "kisaanbuddy-link-secret").encode("utf-8")
    sig = hmac.new(secret, payload_str.encode("utf-8"), hashlib.sha256).hexdigest()[:32]
    # Format: phone_b64.action.target.exp.sig
    import base64
    b64_phone = base64.urlsafe_b64encode(normalized_phone.encode("utf-8")).decode("utf-8").rstrip("=")
    return f"{b64_phone}.{action}.{target}.{exp_ts}.{sig}"


def verify_secure_link_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies a signed token and ensures it has not expired."""
    try:
        parts = token.split(".")
        if len(parts) != 5:
            return None
        b64_phone, action, target, exp_ts_str, provided_sig = parts
        import base64
        # Add padding back if necessary
        padded = b64_phone + "=" * ((4 - len(b64_phone) % 4) % 4)
        phone = base64.urlsafe_b64decode(padded).decode("utf-8")

        exp_ts = int(exp_ts_str)
        if time.time() > exp_ts:
            log.warning("Token expired for phone %s, exp=%s", phone, exp_ts)
            return None

        secret = (settings.JWT_SECRET or "kisaanbuddy-link-secret").encode("utf-8")
        payload_str = f"{phone}:{action}:{target}:{exp_ts}"
        expected_sig = hmac.new(secret, payload_str.encode("utf-8"), hashlib.sha256).hexdigest()[:32]

        if not hmac.compare_digest(expected_sig, provided_sig):
            log.warning("Token signature mismatch.")
            return None

        return {
            "phone_number": phone,
            "action": action,
            "target_id": target if target else None,
            "expires_at": exp_ts,
        }
    except Exception as e:
        log.warning("Error verifying link token: %s", e)
        return None
