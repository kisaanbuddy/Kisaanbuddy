"""FastAPI Router for WhatsApp Business Platform Cloud API."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    Header,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from api.auth import require_admin, get_current_user
from core.config import is_whatsapp_configured, settings
from db.models import DiseaseDetection, WhatsAppMessage, WhatsAppSupportTicket, WhatsAppUser
from db.session import get_db
from schemas.whatsapp import (
    WhatsAppHealthResponse,
    WhatsAppIntegrationStats,
    WhatsAppSupportTicketResponse,
    WhatsAppSupportTicketUpdate,
    WhatsAppTestSendRequest,
)
from services.whatsapp.client import whatsapp_client
from services.whatsapp.pricing import check_budget_limit
from services.whatsapp.security import (
    normalize_phone_number,
    verify_secure_link_token,
    verify_webhook_challenge,
    verify_webhook_signature,
)
from services.whatsapp.service import whatsapp_service

log = logging.getLogger(__name__)
router = APIRouter()


@router.get("/admin/assistant-status", dependencies=[Depends(require_admin)])
async def assistant_status(db: Session = Depends(get_db)):
    """Configuration and evidence coverage, explicitly not an end-to-end health certificate."""
    from db.models import WhatsAppInboxJob
    from services.chat.gemini_service import is_gemini_configured
    from services.chat.knowledge import KnowledgeBase
    kb = KnowledgeBase()
    kb.load()
    topics = {t for c in kb.chunks for t in c.provenance.get("topics", [])}
    required_topics = {"crop_cultivation", "crop_diseases", "pest_management", "irrigation",
                       "soil_health", "fertilizer_management", "seasonal_crop_selection",
                       "government_schemes", "market_information", "sustainable_farming"}
    return {
        "readiness_type": "configuration_and_reference_coverage_only",
        "whatsapp_configured": is_whatsapp_configured(),
        "ai_configured": is_gemini_configured(),
        "agmarknet_configured": bool(settings.DATA_GOV_API_KEY),
        "reference_documents": len({c.source for c in kb.chunks}),
        "covered_topics": sorted(topics), "missing_topics": sorted(required_topics - topics),
        "validated_disease_classifier": False,
        "photo_mode": "AI visual symptom discussion; no certified diagnosis",
        "language_quality_validated": False,
        "inbox": {status: count for status, count in db.query(
            WhatsAppInboxJob.status, func.count(WhatsAppInboxJob.id)
        ).group_by(WhatsAppInboxJob.status).all()},
    }


@router.get("/admin/inbox", dependencies=[Depends(require_admin)])
async def inbox_review(db: Session = Depends(get_db)):
    from db.models import WhatsAppInboxJob
    return [{"id": job.id, "message_id": job.message_id, "status": job.status,
             "error_code": job.error_code, "created_at": job.created_at}
            for job in db.query(WhatsAppInboxJob).filter(
                WhatsAppInboxJob.status == "needs_review"
            ).order_by(WhatsAppInboxJob.id).limit(100).all()]


@router.post("/admin/inbox/{job_id}/resolve", dependencies=[Depends(require_admin)])
async def resolve_inbox_job(
    job_id: int, action: str = Query(..., pattern="^(delivered|discard|retry)$"),
    confirmed_not_delivered: bool = False, db: Session = Depends(get_db),
):
    """Operator reconciles an uncertain send before explicitly releasing the farmer queue."""
    from db.models import WhatsAppInboxJob
    if action == "retry" and not confirmed_not_delivered:
        raise HTTPException(400, "Confirm from delivery logs that no reply was delivered before retrying.")
    state = {"delivered": "completed", "discard": "discarded", "retry": "pending"}[action]
    count = db.query(WhatsAppInboxJob).filter(
        WhatsAppInboxJob.id == job_id, WhatsAppInboxJob.status == "needs_review",
    ).update({"status": state, "lease_token": None, "lease_until": None,
              "error_code": "operator_" + action, "updated_at": datetime.utcnow()})
    if not count:
        db.rollback()
        raise HTTPException(409, "Job is not awaiting review or does not exist.")
    db.commit()
    return {"id": job_id, "status": state}


# ---------------------------------------------------------------------------
# 1. Meta Webhook Verification (GET) & Event Ingestion (POST)
# ---------------------------------------------------------------------------
@router.get("/webhook")
async def verify_webhook(
    request: Request,
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """Meta webhook verification endpoint. Responds with hub.challenge when token matches."""
    challenge_val = verify_webhook_challenge(hub_mode, hub_verify_token, hub_challenge)
    if challenge_val is not None:
        return Response(content=challenge_val, media_type="text/plain", status_code=200)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Webhook verification failed: invalid verify token or mode.",
    )


@router.post("/webhook")
async def receive_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_hub_signature_256: Optional[str] = Header(None, alias="X-Hub-Signature-256"),
    db: Session = Depends(get_db),
):
    """Meta webhook event ingestion. Verifies HMAC-SHA256 signature and schedules async message turn."""
    raw_body = bytearray()
    async for chunk in request.stream():
        raw_body.extend(chunk)
        if len(raw_body) > 1024 * 1024:
            raise HTTPException(status_code=413, detail="Webhook payload exceeds 1 MB.")
    raw_body = bytes(raw_body)

    # Validate HMAC signature from Meta
    if not verify_webhook_signature(raw_body, x_hub_signature_256):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid webhook HMAC signature.",
        )

    try:
        import json
        payload = json.loads(raw_body)
        if not isinstance(payload, dict):
            raise ValueError("Expected an object")
    except Exception as e:
        log.warning("Malformed JSON received on WhatsApp webhook: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed JSON payload.",
        )

    # Immediately acknowledge webhook (Meta requires 200 within 3 seconds)
    return await whatsapp_service.handle_webhook_payload(payload, background_tasks, db)


# ---------------------------------------------------------------------------
# 2. Contextual Link Authentication Verification
# ---------------------------------------------------------------------------
@router.get("/auth/verify-link")
async def verify_link_token(
    token: str = Query(..., description="Signed token generated by WhatsApp service"),
):
    """Verifies a signed token created for WhatsApp-to-Web seamless redirection."""
    result = verify_secure_link_token(token)
    if not result:
        return {
            "valid": False,
            "error": "The link is expired or invalid. Please request a new link from WhatsApp.",
        }
    return {
        "valid": True,
        "phone_number": result["phone_number"],
        "action": result["action"],
        "target_id": result["target_id"],
        "expires_at": result["expires_at"],
    }


# ---------------------------------------------------------------------------
# 3. Integration Health Check
# ---------------------------------------------------------------------------
@router.get("/health", response_model=WhatsAppHealthResponse)
async def check_health(db: Session = Depends(get_db)):
    """Reports configuration readiness, database status, and message volume."""
    configured = is_whatsapp_configured()
    token = (settings.WHATSAPP_ACCESS_TOKEN or "").strip()
    phone_id = (settings.WHATSAPP_PHONE_NUMBER_ID or "").strip()
    test_phone_id = (settings.WHATSAPP_TEST_PHONE_NUMBER_ID or "").strip()
    secret = (settings.WHATSAPP_APP_SECRET or "").strip()
    vtoken = (settings.WHATSAPP_VERIFY_TOKEN or "").strip()

    # Check 24h message volume
    yesterday = datetime.utcnow() - timedelta(hours=24)
    msg_count_24h = (
        db.query(func.count(WhatsAppMessage.id))
        .filter(WhatsAppMessage.created_at >= yesterday)
        .scalar()
        or 0
    )

    return WhatsAppHealthResponse(
        status="configured" if configured else "unconfigured",
        configured=configured,
        phone_number_id_set=bool(phone_id),
        test_phone_number_id_set=bool(test_phone_id),
        access_token_set=bool(token),
        app_secret_set=bool(secret),
        verify_token_set=bool(vtoken),
        redis_connected=bool(settings.REDIS_URL),
        message_count_24h=msg_count_24h,
    )


# ---------------------------------------------------------------------------
# 4. Administration & Usage Monitoring
# ---------------------------------------------------------------------------
@router.get("/admin/stats", dependencies=[Depends(require_admin)], response_model=WhatsAppIntegrationStats)
async def get_integration_stats(db: Session = Depends(get_db)):
    """Administrative usage statistics, estimated costs, and delivery metrics."""
    total_inbound = (
        db.query(func.count(WhatsAppMessage.id))
        .filter(WhatsAppMessage.direction == "inbound")
        .scalar()
        or 0
    )
    total_outbound = (
        db.query(func.count(WhatsAppMessage.id))
        .filter(WhatsAppMessage.direction == "outbound")
        .scalar()
        or 0
    )
    total_failures = (
        db.query(func.count(WhatsAppMessage.id))
        .filter(WhatsAppMessage.status == "failed")
        .scalar()
        or 0
    )
    active_tickets = (
        db.query(func.count(WhatsAppSupportTicket.id))
        .filter(WhatsAppSupportTicket.status.in_(["OPEN", "IN_PROGRESS", "ASSIGNED"]))
        .scalar()
        or 0
    )
    total_diagnoses = (
        db.query(func.count(DiseaseDetection.id))
        .filter(DiseaseDetection.image_url.like("%crop_doctor%"))
        .scalar()
        or 0
    )
    cost_rows = db.query(WhatsAppMessage.estimated_cost_inr).all()
    total_spent_inr = sum(c[0] or 0.0 for c in cost_rows)
    budget_eval = check_budget_limit(total_spent_inr)

    return WhatsAppIntegrationStats(
        configured=is_whatsapp_configured(),
        phone_number_id=settings.WHATSAPP_PHONE_NUMBER_ID,
        api_version=settings.WHATSAPP_API_VERSION or "v21.0",
        total_messages_received=total_inbound,
        total_messages_sent=total_outbound,
        total_delivery_failures=total_failures,
        active_support_tickets=active_tickets,
        total_diagnoses_via_whatsapp=total_diagnoses,
        estimated_cost_inr=round(total_spent_inr, 2),
        monthly_budget_inr=budget_eval["monthly_budget_inr"],
        budget_exceeded=budget_eval["is_exceeded"],
    )


@router.get("/admin/tickets", dependencies=[Depends(require_admin)], response_model=List[WhatsAppSupportTicketResponse])
async def list_support_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """Lists farmer support tickets escalated via WhatsApp."""
    q = db.query(WhatsAppSupportTicket).order_by(desc(WhatsAppSupportTicket.created_at))
    if status_filter:
        q = q.filter(WhatsAppSupportTicket.status == status_filter.upper())
    return q.limit(100).all()


@router.patch("/admin/tickets/{ticket_id}", dependencies=[Depends(require_admin)], response_model=WhatsAppSupportTicketResponse)
async def update_support_ticket(
    ticket_id: str,
    payload: WhatsAppSupportTicketUpdate,
    db: Session = Depends(get_db),
):
    """Updates status or assignment on a WhatsApp support ticket."""
    ticket = db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    if payload.status:
        ticket.status = payload.status.upper()
        if ticket.status == "RESOLVED":
            ticket.resolved_at = datetime.utcnow()
    if payload.assigned_to:
        ticket.assigned_to = payload.assigned_to
    if payload.resolution_notes:
        ticket.resolution_notes = payload.resolution_notes

    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/admin/send-test", dependencies=[Depends(require_admin)])
async def send_test_message(
    payload: WhatsAppTestSendRequest,
    db: Session = Depends(get_db),
):
    """Sends a test outbound message through the Meta Cloud API."""
    target_phone = normalize_phone_number(payload.recipient_phone)
    if not target_phone:
        raise HTTPException(status_code=400, detail="Invalid phone number format.")

    try:
        resp = await whatsapp_client.send_text_message(
            target_phone,
            payload.message,
            sender_phone_number_id=payload.sender_phone_number_id,
        )
        wamid = resp.get("messages", [{}])[0].get("id")
        return {
            "success": True,
            "recipient": target_phone,
            "wamid": wamid,
            "raw_response": resp,
        }
    except Exception as e:
        log.exception("Test send failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed sending test WhatsApp message: {str(e)}")


# ---------------------------------------------------------------------------
# 5. DPDP Privacy & Data Erasure Workflow
# ---------------------------------------------------------------------------
@router.post("/privacy/request-erasure")
async def request_data_erasure(
    phone_number: str = Query(..., description="Farmer phone number requesting erasure"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Authenticated erasure of the requesting farmer's WhatsApp interaction history."""
    normalized = normalize_phone_number(phone_number)
    if normalize_phone_number(current_user.phone_number or "") != normalized and (current_user.role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="You may erase only your own WhatsApp history.")
    from db.models import WhatsAppInboxJob
    if db.query(WhatsAppInboxJob).filter(WhatsAppInboxJob.phone_number == normalized, WhatsAppInboxJob.status == "processing").first():
        raise HTTPException(status_code=409, detail="A message is being processed. Retry erasure shortly.")
    user = db.query(WhatsAppUser).filter(WhatsAppUser.phone_number == normalized).first()
    if not user:
        return {"status": "not_found", "message": "No records found for specified phone number."}

    # Delete messages and support tickets
    msgs_deleted = db.query(WhatsAppMessage).filter(WhatsAppMessage.phone_number == normalized).delete()
    tickets_deleted = db.query(WhatsAppSupportTicket).filter(WhatsAppSupportTicket.phone_number == normalized).delete()
    db.query(WhatsAppInboxJob).filter(WhatsAppInboxJob.phone_number == normalized).delete()
    db.delete(user)
    db.commit()

    from services.whatsapp.state_machine import state_manager
    from services.whatsapp.conversation import session_key, sessions
    await state_manager.clear_state(normalized, db=db)
    await sessions.delete(session_key(normalized))
    log.info("DPDP Erasure executed for %s: deleted %d msgs, %d tickets", normalized, msgs_deleted, tickets_deleted)
    return {
        "status": "erased",
        "phone_number": normalized,
        "messages_deleted": msgs_deleted,
        "tickets_deleted": tickets_deleted,
    }


# ---------------------------------------------------------------------------
# 6. Enterprise WhatsApp Admin Dashboard Endpoints (Zero-PII Analytics)
# ---------------------------------------------------------------------------
@router.get("/admin/dashboard", dependencies=[Depends(require_admin)])
async def whatsapp_admin_dashboard(db: Session = Depends(get_db)):
    """Privacy-conscious enterprise analytics for the WhatsApp AI Assistant."""
    from db.models import WhatsAppFeedback, WhatsAppTurnMetric, WhatsAppUnansweredQuestion
    from services.whatsapp.observability import mask_phone_number

    total_users = db.query(func.count(WhatsAppUser.id)).scalar() or 0
    linked_users = db.query(func.count(WhatsAppUser.id)).filter(WhatsAppUser.user_id.isnot(None)).scalar() or 0
    lang_rows = db.query(WhatsAppUser.language, func.count(WhatsAppUser.id)).group_by(WhatsAppUser.language).all()
    language_usage = {lang or "en": cnt for lang, cnt in lang_rows}

    status_rows = db.query(WhatsAppMessage.status, func.count(WhatsAppMessage.id)).group_by(WhatsAppMessage.status).all()
    delivery_status = {st or "unknown": cnt for st, cnt in status_rows}

    avg_latency = db.query(func.avg(WhatsAppTurnMetric.latency_ms)).scalar() or 0.0
    total_turns = db.query(func.count(WhatsAppTurnMetric.id)).scalar() or 0
    failed_turns = db.query(func.count(WhatsAppTurnMetric.id)).filter(WhatsAppTurnMetric.success == False).scalar() or 0  # noqa: E712
    unanswered_open = db.query(func.count(WhatsAppUnansweredQuestion.id)).filter(WhatsAppUnansweredQuestion.resolved == False).scalar() or 0  # noqa: E712

    feedback_total = db.query(func.count(WhatsAppFeedback.id)).scalar() or 0
    feedback_helpful = db.query(func.count(WhatsAppFeedback.id)).filter(WhatsAppFeedback.helpful == True).scalar() or 0  # noqa: E712

    cost_rows = db.query(WhatsAppMessage.estimated_cost_inr).all()
    total_spent_inr = sum(c[0] or 0.0 for c in cost_rows)
    budget_eval = check_budget_limit(total_spent_inr)

    recent_convos = (
        db.query(WhatsAppUser)
        .order_by(desc(WhatsAppUser.last_active_at))
        .limit(20)
        .all()
    )
    conversations = [
        {
            "id": u.id,
            "masked_phone": mask_phone_number(u.phone_number),
            "language": u.language,
            "current_state": u.current_state,
            "account_linked": bool(u.user_id),
            "opted_in": bool(u.opted_in),
            "last_active_at": u.last_active_at.isoformat() if u.last_active_at else None,
        }
        for u in recent_convos
    ]

    return {
        "total_subscribers": total_users,
        "linked_accounts": linked_users,
        "language_usage": language_usage,
        "delivery_status": delivery_status,
        "total_turns": total_turns,
        "failed_turns": failed_turns,
        "avg_latency_ms": round(float(avg_latency), 1),
        "unanswered_open": unanswered_open,
        "feedback": {
            "total": feedback_total,
            "helpful": feedback_helpful,
        },
        "costs": {
            "estimated_cost_inr": round(total_spent_inr, 2),
            "monthly_budget_inr": budget_eval["monthly_budget_inr"],
            "budget_exceeded": budget_eval["is_exceeded"],
        },
        "conversations": conversations,
    }


@router.get("/admin/unanswered", dependencies=[Depends(require_admin)])
async def list_unanswered_questions(
    resolved: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    from db.models import WhatsAppUnansweredQuestion
    from services.whatsapp.observability import mask_phone_number

    q = db.query(WhatsAppUnansweredQuestion).order_by(desc(WhatsAppUnansweredQuestion.created_at))
    if resolved is not None:
        q = q.filter(WhatsAppUnansweredQuestion.resolved == resolved)
    rows = q.limit(100).all()
    return [
        {
            "id": r.id,
            "masked_phone": mask_phone_number(r.phone_number),
            "language": r.language,
            "question_text": r.question_text,
            "reason": r.reason,
            "resolved": r.resolved,
            "resolution_note": r.resolution_note,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.patch("/admin/unanswered/{question_id}", dependencies=[Depends(require_admin)])
async def resolve_unanswered_question(
    question_id: int,
    resolution_note: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    from db.models import WhatsAppUnansweredQuestion
    row = db.query(WhatsAppUnansweredQuestion).filter(WhatsAppUnansweredQuestion.id == question_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Question not found.")
    row.resolved = True
    if resolution_note:
        row.resolution_note = resolution_note
    db.commit()
    return {"id": row.id, "resolved": True}


@router.get("/admin/errors", dependencies=[Depends(require_admin)])
async def list_whatsapp_errors(db: Session = Depends(get_db)):
    from db.models import WhatsAppTurnMetric
    from services.whatsapp.observability import mask_phone_number

    failed_msgs = (
        db.query(WhatsAppMessage)
        .filter(WhatsAppMessage.status == "failed")
        .order_by(desc(WhatsAppMessage.created_at))
        .limit(50)
        .all()
    )
    failed_turns = (
        db.query(WhatsAppTurnMetric)
        .filter(WhatsAppTurnMetric.success == False)  # noqa: E712
        .order_by(desc(WhatsAppTurnMetric.created_at))
        .limit(50)
        .all()
    )
    return {
        "failed_messages": [
            {
                "id": m.id,
                "masked_phone": mask_phone_number(m.phone_number),
                "message_type": m.message_type,
                "error_message": m.error_message,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in failed_msgs
        ],
        "failed_turns": [
            {
                "id": t.id,
                "language": t.language,
                "intent": t.intent,
                "error_code": t.error_code,
                "latency_ms": t.latency_ms,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in failed_turns
        ],
    }


@router.get("/admin/knowledge", dependencies=[Depends(require_admin)])
async def list_knowledge_sources():
    from services.chat.knowledge import KnowledgeBase
    kb = KnowledgeBase()
    kb.load()
    docs: Dict[str, Dict[str, Any]] = {}
    for c in kb.chunks:
        entry = docs.setdefault(c.source, {"source": c.source, "chunks": 0, "topics": set()})
        entry["chunks"] += 1
        for t in c.provenance.get("topics", []):
            entry["topics"].add(t)
    return [
        {"source": v["source"], "chunks": v["chunks"], "topics": sorted(v["topics"])}
        for v in docs.values()
    ]
