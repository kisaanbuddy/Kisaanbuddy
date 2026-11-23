"""Durable, atomically claimed inbound work with per-farmer ordering.

Expired claims are NOT automatically replayed: Meta may have accepted a send
before the worker crashed. Operators reconcile these jobs against delivery logs.
"""
import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import aliased
from db.models import WhatsAppInboxJob
from db.session import SessionLocal

log = logging.getLogger(__name__)


def claim_job(db):
    now = datetime.utcnow()
    db.query(WhatsAppInboxJob).filter(
        WhatsAppInboxJob.status == 'processing', WhatsAppInboxJob.lease_until < now,
    ).update({'status': 'needs_review', 'error_code': 'lease_expired', 'updated_at': now})
    db.commit()
    older = aliased(WhatsAppInboxJob)
    candidates = db.query(WhatsAppInboxJob).filter(
        WhatsAppInboxJob.status == 'pending',
        ~db.query(older.id).filter(
            older.phone_number == WhatsAppInboxJob.phone_number,
            older.id < WhatsAppInboxJob.id,
            older.status.in_(['pending', 'processing', 'needs_review']),
        ).exists(),
    ).order_by(WhatsAppInboxJob.id).limit(20).all()
    for job in candidates:
        token = uuid.uuid4().hex
        changed = db.query(WhatsAppInboxJob).filter(
            WhatsAppInboxJob.id == job.id, WhatsAppInboxJob.status == 'pending',
        ).update({'status': 'processing', 'lease_token': token,
                  'lease_until': now + timedelta(minutes=10), 'updated_at': now})
        db.commit()
        if changed:
            return job.id, token, json.loads(job.payload_json)
    return None


async def process_one():
    from services.whatsapp.service import whatsapp_service
    from services.whatsapp.client import whatsapp_client
    with SessionLocal() as db:
        claimed = claim_job(db)
    if not claimed:
        return False
    job_id, token, payload = claimed
    state, error = 'completed', None
    try:
        await whatsapp_client.mark_message_as_read(
            payload['msg']['id'], sender_phone_number_id=payload.get('sender_phone_number_id'))
        with SessionLocal() as db:
            await asyncio.wait_for(whatsapp_service.process_message_turn(db=db, **payload), timeout=480)
    except asyncio.CancelledError:
        state, error = 'needs_review', 'worker_cancelled'
        raise
    except Exception as exc:
        state, error = 'needs_review', type(exc).__name__
        log.warning('WhatsApp inbox job %s needs review (%s)', job_id, error)
    finally:
        with SessionLocal() as db:
            db.query(WhatsAppInboxJob).filter(
                WhatsAppInboxJob.id == job_id, WhatsAppInboxJob.lease_token == token,
            ).update({'status': state, 'error_code': error, 'updated_at': datetime.utcnow()})
            db.commit()
    return True


async def run_worker():
    while True:
        try:
            worked = await process_one()
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception('WhatsApp inbox worker unavailable')
            worked = False
        await asyncio.sleep(0.05 if worked else 1)
