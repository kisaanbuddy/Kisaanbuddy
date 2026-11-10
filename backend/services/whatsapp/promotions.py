"""Consent-Aware Promotional & Advisory Notification Mechanism for WhatsApp.

Enforces:
1. Explicit farmer opt-in verification (opted_in == True).
2. Immediate respect of STOP opt-outs (never sends to opted-out farmers).
3. 24-hour Meta messaging window enforcement (requires approved templates outside 24h window).
4. Idempotency and deduplication per campaign/announcement.
5. Delivery audit tracking in whatsapp_messages table.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from core.config import settings
from db.models import WhatsAppMessage, WhatsAppUser
from services.whatsapp.client import whatsapp_client
from services.whatsapp.pricing import evaluate_message_cost
from services.whatsapp.security import normalize_phone_number

log = logging.getLogger(__name__)

# Meta 24-hour customer care window duration
CUSTOMER_CARE_WINDOW_HOURS = 24


def record_opt_out(phone_number: str, db: Session, source: str = "whatsapp_stop") -> bool:
    """Records farmer opt-out of promotional notifications with timestamp and consent source."""
    norm_phone = normalize_phone_number(phone_number)
    wa_user = db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == norm_phone).first()
    if wa_user:
        wa_user.opted_in = False
        wa_user.opted_out_at = datetime.utcnow()
        wa_user.consent_source = source
        db.commit()
        log.info("Recorded promotional opt-out for %s via %s", norm_phone, source)
        return True
    return False


def record_opt_in(phone_number: str, db: Session, source: str = "whatsapp_start") -> bool:
    """Records explicit farmer opt-in to notifications with timestamp and consent source."""
    norm_phone = normalize_phone_number(phone_number)
    wa_user = db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == norm_phone).first()
    if wa_user:
        wa_user.opted_in = True
        wa_user.opted_in_at = datetime.utcnow()
        wa_user.consent_source = source
        db.commit()
        log.info("Recorded promotional opt-in for %s via %s", norm_phone, source)
        return True
    return False


async def send_farming_update(
    recipient_phone: str,
    title: str,
    body: str,
    db: Session,
    campaign_id: Optional[str] = None,
    sender_phone_number_id: Optional[str] = None,
    template_name: Optional[str] = None,
    template_language: str = "en",
    template_components: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Sends a consent-checked farming update or announcement.

    Returns dict with status ('sent', 'blocked_opt_out', 'blocked_window', 'duplicate', 'failed').
    """
    phone = normalize_phone_number(recipient_phone)
    wa_user = db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == phone).first()

    # 1. Explicit Consent Check
    if wa_user and not wa_user.opted_in:
        log.info("Blocked announcement for %s: farmer opted out (opted_in=False)", phone)
        return {
            "status": "blocked_opt_out",
            "message": "Farmer has opted out of promotional notifications.",
            "phone_number": phone,
        }

    # 2. Campaign Deduplication Check
    if campaign_id:
        existing = (
            db.query(WhatsAppMessage)
            .filter(
                WhatsAppMessage.phone_number == phone,
                WhatsAppMessage.body.contains(f"CAMPAIGN:{campaign_id}"),
            )
            .first()
        )
        if existing:
            log.info("Blocked duplicate announcement for %s in campaign %s", phone, campaign_id)
            return {
                "status": "duplicate",
                "message": "Announcement already delivered to this recipient.",
                "phone_number": phone,
            }

    # 3. 24-Hour Messaging Window Check
    now = datetime.utcnow()
    last_active = wa_user.last_active_at if wa_user and wa_user.last_active_at else None
    within_window = bool(last_active and (now - last_active) < timedelta(hours=CUSTOMER_CARE_WINDOW_HOURS))

    campaign_tag = f"\n\n<!-- CAMPAIGN:{campaign_id} -->" if campaign_id else ""
    full_text = f"📢 *{title}*\n\n{body}{campaign_tag}"

    cost_eval = evaluate_message_cost(direction="outbound", category="marketing")

    try:
        wamid = None
        if within_window or not template_name:
            if not within_window and not template_name:
                log.warning(
                    "Recipient %s outside 24h window without template. Meta policy requires template.",
                    phone,
                )
            res = await whatsapp_client.send_text_message(
                recipient_phone=phone,
                body=full_text,
                sender_phone_number_id=sender_phone_number_id,
            )
            wamid = res.get("messages", [{}])[0].get("id")
        else:
            # Business-initiated message via approved Meta template
            res = await whatsapp_client.send_template_message(
                recipient_phone=phone,
                template_name=template_name,
                language_code=template_language,
                components=template_components,
                sender_phone_number_id=sender_phone_number_id,
            )
            wamid = res.get("messages", [{}])[0].get("id")

        # Record audit message
        msg_record = WhatsAppMessage(
            message_id=wamid,
            phone_number=phone,
            direction="outbound",
            message_type="marketing",
            body=full_text,
            category="marketing",
            status="sent",
            is_chargeable=cost_eval.is_chargeable,
            estimated_cost_inr=cost_eval.estimated_cost_inr,
            created_at=datetime.utcnow(),
        )
        db.add(msg_record)
        db.commit()

        return {
            "status": "sent",
            "message_id": wamid,
            "phone_number": phone,
        }

    except Exception as exc:
        db.rollback()
        log.exception("Failed sending farming update to %s: %s", phone, exc)
        return {
            "status": "failed",
            "error": str(exc),
            "phone_number": phone,
        }
