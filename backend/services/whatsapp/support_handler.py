"""Human support escalation and ticket management for WhatsApp conversations."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from db.models import User, WhatsAppSupportTicket
from services.whatsapp.localization import get_text

log = logging.getLogger(__name__)


def generate_ticket_id() -> str:
    """Generates human-readable ticket ID: KB-SUP-YYYYMMDD-XXXX."""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    suffix = uuid.uuid4().hex[:4].upper()
    return f"KB-SUP-{date_str}-{suffix}"


def create_support_ticket(
    phone_number: str,
    query_summary: str,
    db: Session,
    farmer_name: Optional[str] = None,
    language: str = "en",
) -> str:
    """Creates and persists a support ticket in WhatsAppSupportTicket table.

    Does not fabricate notifications; honestly registers the farmer query for review.
    """
    ticket_id = generate_ticket_id()

    # Look up linked user account if exists
    user = db.query(User).filter(User.phone_number == phone_number).first()
    user_id = user.id if user else None
    name = farmer_name or (user.name if user else None)

    ticket = WhatsAppSupportTicket(
        ticket_id=ticket_id,
        phone_number=phone_number,
        farmer_name=name,
        user_id=user_id,
        query_summary=query_summary or "Farmer requested agricultural assistance via WhatsApp.",
        status="OPEN",
        created_at=datetime.utcnow(),
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    log.info("Created WhatsApp support ticket %s for %s", ticket_id, phone_number)
    return ticket_id
