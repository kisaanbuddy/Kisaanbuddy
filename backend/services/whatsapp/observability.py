"""Observability, Metrics, and Safe Structured Logging for WhatsApp Integration.

Ensures complete auditability without ever logging:
- Plaintext access tokens, app secrets, or verify tokens
- Unmasked phone numbers
- Sensitive farmer details
"""
from __future__ import annotations

import logging
import re
import time
from collections import defaultdict
from typing import Any, Dict, Optional

log = logging.getLogger("krishiai.whatsapp.audit")


def mask_phone_number(phone: Optional[str]) -> str:
    """Masks a phone number for safe observability logging. E.g. +91 98*** **321."""
    if not phone:
        return "[empty]"
    digits = re.sub(r"[^\d+]", "", str(phone))
    if digits.startswith("+91") and len(digits) == 13:
        return f"+91 {digits[3:5]}*** **{digits[-3:]}"
    elif len(digits) >= 10:
        return f"{digits[:2]}*** **{digits[-3:]}"
    return "***"


class WhatsAppMetrics:
    """Thread-safe in-memory counters for WhatsApp runtime events."""

    def __init__(self) -> None:
        self._counters: Dict[str, int] = defaultdict(int)

    def increment(self, metric: str, amount: int = 1) -> None:
        self._counters[metric] += amount

    def get_all(self) -> Dict[str, Any]:
        return dict(self._counters)

    def reset(self) -> None:
        self._counters.clear()


metrics = WhatsAppMetrics()


def get_whatsapp_metrics() -> Dict[str, Any]:
    """Returns all collected WhatsApp metrics."""
    return metrics.get_all()


def record_whatsapp_turn(
    message_id: str,
    phone_number: str,
    phone_number_id: Optional[str],
    message_type: str,
    normalized_action: Optional[str],
    state_before: str,
    state_after: str,
    handler_invoked: Optional[str],
    duration_ms: float,
    status: str = "success",
    error_detail: Optional[str] = None,
) -> None:
    """Logs a safe, structured record of the completed WhatsApp message turn."""
    masked_phone = mask_phone_number(phone_number)
    safe_phone_id = phone_number_id or "UNRESOLVED"

    metrics.increment("incoming_messages")
    if message_type in ("interactive_list", "interactive_button"):
        metrics.increment("interactive_selections")
    elif message_type == "text":
        metrics.increment("text_selections")

    if status == "success":
        metrics.increment("handler_success")
    else:
        metrics.increment("handler_failures")

    if error_detail:
        log.warning(
            "WhatsApp Turn FAILED | msg_id=%s | phone=%s | phone_id=%s | type=%s | action=%s | state=%s->%s | handler=%s | time=%.1fms | error=%s",
            message_id,
            masked_phone,
            safe_phone_id,
            message_type,
            normalized_action or "NONE",
            state_before,
            state_after,
            handler_invoked or "NONE",
            duration_ms,
            error_detail,
        )
    else:
        log.info(
            "WhatsApp Turn SUCCESS | msg_id=%s | phone=%s | phone_id=%s | type=%s | action=%s | state=%s->%s | handler=%s | time=%.1fms",
            message_id,
            masked_phone,
            safe_phone_id,
            message_type,
            normalized_action or "NONE",
            state_before,
            state_after,
            handler_invoked or "NONE",
            duration_ms,
        )
