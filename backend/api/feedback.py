"""Farmer-First Reviews, Feedback & Suggestions API.

Provides:
- Public submission endpoint for voice, guided choices, text, and optional attachments.
- Quick 1-tap review endpoint for contextual feedback.
- Public curated showcase endpoint ("You Suggested, We Improved") with PII stripped.
- Admin-authenticated management endpoints (list, filter, audio streaming, status & notes).
"""
from __future__ import annotations

import logging
import random
import string
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session

from api.auth import require_admin, COOKIE_NAME
from core.config import settings
from db import models
from db.models import FarmerFeedback, User
from db.session import get_db
from schemas.feedback import (
    FarmerFeedbackCreate,
    FarmerFeedbackResponse,
    FarmerFeedbackAdminDetail,
    FarmerFeedbackListResponse,
    FarmerFeedbackAdminUpdate,
    QuickReviewCreate,
    PublicImprovementItem,
    VALID_FEEDBACK_TYPES,
    VALID_CATEGORIES,
    VALID_STATUSES,
    VALID_PRIORITIES,
    VALID_QUICK_RATINGS,
)
from services.audit import record_activity
from services.auth_service import decode_access_token

log = logging.getLogger("krishiai.feedback")
router = APIRouter()

MAX_AUDIO_BYTES = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_BYTES = 5 * 1024 * 1024   # 5MB

ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/mp3",
    "audio/mpeg",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "audio/aac",
    "audio/flac",
    "application/octet-stream",  # some mobile webviews record as octet-stream
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


def _generate_feedback_ref(db: Session) -> str:
    """Generate a clean, readable reference code like KB-FB-72910."""
    for _ in range(10):
        digits = "".join(random.choices(string.digits, k=5))
        ref = f"KB-FB-{digits}"
        exists = db.query(FarmerFeedback).filter(FarmerFeedback.feedback_ref == ref).first()
        if not exists:
            return ref
    return f"KB-FB-{uuid.uuid4().hex[:6].upper()}"


def _get_optional_user(request: Request, db: Session) -> Optional[User]:
    """Retrieve the authenticated user if session cookie is valid, else None."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = int(payload["sub"])
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    except Exception:
        return None


# ===========================================================================
# Public Farmer-Facing Endpoints
# ===========================================================================

@router.post("", response_model=FarmerFeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_farmer_feedback(
    request: Request,
    db: Session = Depends(get_db),
):
    """Submit farmer feedback with optional voice recording, guided option, text, or JSON payload."""
    content_type = (request.headers.get("content-type") or "").lower()

    audio_file: Optional[UploadFile] = None
    image_file: Optional[UploadFile] = None

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload.",
            )
        feedback_type = str(body.get("feedback_type") or "").strip().lower()
        category = str(body.get("category") or "general").strip().lower()
        guided_option = body.get("guided_option")
        quick_rating = body.get("quick_rating")
        content_text = body.get("content_text")
        language = str(body.get("language") or "en")
        source_page = body.get("source_page")
        contact_consent = bool(body.get("contact_consent", False))
        contact_info = body.get("contact_info")
        raw_dur = body.get("audio_duration_seconds")
        try:
            audio_duration_seconds = int(raw_dur) if raw_dur is not None and str(raw_dur).isdigit() else None
        except (ValueError, TypeError):
            audio_duration_seconds = None
    else:
        form = await request.form()
        feedback_type = str(form.get("feedback_type") or "").strip().lower()
        category = str(form.get("category") or "general").strip().lower()
        guided_option = form.get("guided_option")
        quick_rating = form.get("quick_rating")
        content_text = form.get("content_text")
        language = str(form.get("language") or "en")
        source_page = form.get("source_page")
        contact_consent_raw = form.get("contact_consent")
        contact_consent = (
            contact_consent_raw in (True, "true", "True", "1", 1)
            if contact_consent_raw is not None
            else False
        )
        contact_info = form.get("contact_info")
        raw_dur = form.get("audio_duration_seconds")
        try:
            audio_duration_seconds = int(raw_dur) if raw_dur is not None and str(raw_dur).isdigit() else None
        except (ValueError, TypeError):
            audio_duration_seconds = None

        raw_audio = form.get("audio_file")
        if hasattr(raw_audio, "read") and getattr(raw_audio, "filename", None):
            audio_file = raw_audio

        raw_image = form.get("image_file")
        if hasattr(raw_image, "read") and getattr(raw_image, "filename", None):
            image_file = raw_image

    # 1. Validate inputs
    if not feedback_type:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Feedback type is required.",
        )

    if feedback_type not in VALID_FEEDBACK_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid feedback type: {feedback_type}. Allowed: {sorted(VALID_FEEDBACK_TYPES)}",
        )

    category = category.strip().lower() if category else "general"
    if category not in VALID_CATEGORIES:
        category = "general"

    if quick_rating and quick_rating not in VALID_QUICK_RATINGS:
        quick_rating = None

    if content_text and len(content_text) > 2000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Content text exceeds maximum limit of 2000 characters.",
        )

    # 2. Process optional audio file
    has_audio = False
    audio_data = None
    audio_mimetype = None

    if audio_file is not None and audio_file.filename:
        ctype = (audio_file.content_type or "").lower().split(";")[0].strip()
        if ctype and ctype not in ALLOWED_AUDIO_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Audio type '{ctype}' is not supported. Please use webm, mp3, m4a, or wav.",
            )
        audio_bytes = await audio_file.read()
        if len(audio_bytes) > MAX_AUDIO_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Audio recording exceeds size limit of {MAX_AUDIO_BYTES // (1024 * 1024)}MB.",
            )
        if len(audio_bytes) > 0:
            has_audio = True
            audio_data = audio_bytes
            audio_mimetype = ctype or "audio/webm"

    # 3. Process optional image file
    has_image = False
    image_data = None
    image_mimetype = None

    if image_file is not None and image_file.filename:
        itype = (image_file.content_type or "").lower().split(";")[0].strip()
        if itype not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Image type '{itype}' is not supported. Please use jpeg, png, or webp.",
            )
        img_bytes = await image_file.read()
        if len(img_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image exceeds size limit of {MAX_IMAGE_BYTES // (1024 * 1024)}MB.",
            )
        if len(img_bytes) > 0:
            has_image = True
            image_data = img_bytes
            image_mimetype = itype

    # 4. Must provide at least one form of input: audio, guided option, text, or quick rating
    if not has_audio and not guided_option and not content_text and not quick_rating:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a suggestion, voice note, or choose an option.",
        )

    # 5. Extract optional user
    current_user = _get_optional_user(request, db)
    user_id = current_user.id if current_user else None
    is_anonymous = user_id is None

    # 6. Create record
    feedback_id = str(uuid.uuid4())
    feedback_ref = _generate_feedback_ref(db)

    feedback = FarmerFeedback(
        id=feedback_id,
        feedback_ref=feedback_ref,
        feedback_type=feedback_type,
        category=category,
        guided_option=guided_option.strip() if guided_option else None,
        quick_rating=quick_rating,
        content_text=content_text.strip() if content_text else None,
        has_audio=has_audio,
        audio_data=audio_data,
        audio_mimetype=audio_mimetype,
        audio_duration_seconds=audio_duration_seconds,
        has_image=has_image,
        image_data=image_data,
        image_mimetype=image_mimetype,
        language=(language or "en")[:10].lower(),
        source_page=source_page[:255] if source_page else None,
        user_id=user_id,
        is_anonymous=is_anonymous,
        contact_consent=contact_consent,
        contact_info=contact_info.strip()[:100] if contact_info else None,
        status="received",
        priority="normal",
        is_spam=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    log.info(
        "Farmer feedback received: %s [%s/%s] audio=%s user=%s",
        feedback_ref,
        feedback_type,
        category,
        has_audio,
        user_id or "anon",
    )

    return FarmerFeedbackResponse(
        id=feedback.id,
        feedback_ref=feedback.feedback_ref,
        feedback_type=feedback.feedback_type,
        category=feedback.category,
        status=feedback.status,
        created_at=feedback.created_at,
        message="Thank you! Your feedback has been received.",
    )


@router.post("/quick", response_model=FarmerFeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_quick_review(
    payload: QuickReviewCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Fast, lightweight 1-tap review submission (e.g. 'Was this helpful?')."""
    current_user = _get_optional_user(request, db)
    user_id = current_user.id if current_user else None

    feedback_id = str(uuid.uuid4())
    feedback_ref = _generate_feedback_ref(db)

    feedback = FarmerFeedback(
        id=feedback_id,
        feedback_ref=feedback_ref,
        feedback_type="quick_review",
        category=payload.category if payload.category in VALID_CATEGORIES else "general",
        quick_rating=payload.quick_rating,
        guided_option=payload.guided_option,
        content_text=None,
        has_audio=False,
        has_image=False,
        language=payload.language[:10].lower(),
        source_page=payload.source_page[:255] if payload.source_page else None,
        user_id=user_id,
        is_anonymous=user_id is None,
        status="received",
        priority="normal",
        is_spam=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return FarmerFeedbackResponse(
        id=feedback.id,
        feedback_ref=feedback.feedback_ref,
        feedback_type=feedback.feedback_type,
        category=feedback.category,
        status=feedback.status,
        created_at=feedback.created_at,
        message="Thank you for your rating!",
    )


@router.get("/public-improvements", response_model=List[PublicImprovementItem])
def get_public_improvements(db: Session = Depends(get_db)):
    """Retrieve public, verified improvements resulting from farmer feedback.

    Strictly removes PII, private audio, and internal notes.
    """
    items = (
        db.query(FarmerFeedback)
        .filter(
            FarmerFeedback.is_public_showcase == True,
            FarmerFeedback.is_spam == False,
            FarmerFeedback.public_improvement_summary.isnot(None),
        )
        .order_by(desc(FarmerFeedback.updated_at))
        .limit(30)
        .all()
    )

    results = []
    for item in items:
        results.append(
            PublicImprovementItem(
                id=item.id,
                feedback_ref=item.feedback_ref,
                category=item.category,
                feedback_type=item.feedback_type,
                guided_option=item.guided_option,
                improvement_summary=item.public_improvement_summary or "",
                status=item.status,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
        )
    return results


# ===========================================================================
# Administrative Endpoints (Strictly require_admin)
# ===========================================================================

@router.get("/admin/list", response_model=FarmerFeedbackListResponse)
def list_feedback_for_admin(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    feedback_type: Optional[str] = Query(None),
    has_audio: Optional[bool] = Query(None),
    is_spam: Optional[bool] = Query(None),
    is_showcase: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: list and filter all farmer feedback submissions."""
    q = db.query(FarmerFeedback)

    if status:
        q = q.filter(FarmerFeedback.status == status)
    if category:
        q = q.filter(FarmerFeedback.category == category)
    if language:
        q = q.filter(FarmerFeedback.language == language)
    if priority:
        q = q.filter(FarmerFeedback.priority == priority)
    if feedback_type:
        q = q.filter(FarmerFeedback.feedback_type == feedback_type)
    if has_audio is not None:
        q = q.filter(FarmerFeedback.has_audio == has_audio)
    if is_spam is not None:
        q = q.filter(FarmerFeedback.is_spam == is_spam)
    if is_showcase is not None:
        q = q.filter(FarmerFeedback.is_public_showcase == is_showcase)
    if search:
        search_term = f"%{search.strip()}%"
        q = q.filter(
            or_(
                FarmerFeedback.feedback_ref.ilike(search_term),
                FarmerFeedback.content_text.ilike(search_term),
                FarmerFeedback.guided_option.ilike(search_term),
                FarmerFeedback.internal_notes.ilike(search_term),
            )
        )

    total = q.count()
    items = q.order_by(desc(FarmerFeedback.created_at)).offset((page - 1) * limit).limit(limit).all()

    return FarmerFeedbackListResponse(
        total=total,
        page=page,
        limit=limit,
        pages=max(1, (total + limit - 1) // limit),
        items=[FarmerFeedbackAdminDetail.model_validate(item) for item in items],
    )


@router.get("/admin/{feedback_id}", response_model=FarmerFeedbackAdminDetail)
def get_feedback_detail_for_admin(
    feedback_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: get full details of a specific feedback submission."""
    item = db.query(FarmerFeedback).filter(FarmerFeedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback submission not found.")
    return FarmerFeedbackAdminDetail.model_validate(item)


@router.get("/admin/{feedback_id}/audio")
def stream_private_feedback_audio(
    feedback_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: stream private voice recording securely."""
    item = db.query(FarmerFeedback).filter(FarmerFeedback.id == feedback_id).first()
    if not item or not item.has_audio or not item.audio_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No audio recording attached.")

    mimetype = item.audio_mimetype or "audio/webm"
    return Response(
        content=item.audio_data,
        media_type=mimetype,
        headers={
            "Cache-Control": "private, no-store, max-age=0",
            "Content-Disposition": f'inline; filename="feedback_{item.feedback_ref}.webm"',
        },
    )


@router.get("/admin/{feedback_id}/image")
def stream_private_feedback_image(
    feedback_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: stream private attached photo securely."""
    item = db.query(FarmerFeedback).filter(FarmerFeedback.id == feedback_id).first()
    if not item or not item.has_image or not item.image_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No image attached.")

    mimetype = item.image_mimetype or "image/jpeg"
    return Response(
        content=item.image_data,
        media_type=mimetype,
        headers={
            "Cache-Control": "private, no-store, max-age=0",
            "Content-Disposition": f'inline; filename="feedback_image_{item.feedback_ref}.jpg"',
        },
    )


@router.patch("/admin/{feedback_id}", response_model=FarmerFeedbackAdminDetail)
def update_feedback_status_for_admin(
    feedback_id: str,
    payload: FarmerFeedbackAdminUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: update status, priority, staff notes, or public showcase flags."""
    item = db.query(FarmerFeedback).filter(FarmerFeedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback submission not found.")

    changes = {}
    if payload.status is not None:
        changes["status_old"] = item.status
        changes["status_new"] = payload.status
        item.status = payload.status

    if payload.priority is not None:
        changes["priority_old"] = item.priority
        changes["priority_new"] = payload.priority
        item.priority = payload.priority

    if payload.internal_notes is not None:
        item.internal_notes = payload.internal_notes

    if payload.assigned_to is not None:
        item.assigned_to = payload.assigned_to

    if payload.is_spam is not None:
        changes["is_spam"] = payload.is_spam
        item.is_spam = payload.is_spam

    if payload.is_public_showcase is not None:
        changes["is_public_showcase"] = payload.is_public_showcase
        item.is_public_showcase = payload.is_public_showcase

    if payload.public_improvement_summary is not None:
        item.public_improvement_summary = payload.public_improvement_summary

    item.updated_at = datetime.utcnow()

    record_activity(
        db,
        "admin.farmer_feedback_updated",
        user_id=admin.id,
        details={"feedback_id": feedback_id, "feedback_ref": item.feedback_ref, "changes": changes},
        request=request,
    )

    db.commit()
    db.refresh(item)
    return FarmerFeedbackAdminDetail.model_validate(item)


@router.delete("/admin/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback_for_admin(
    feedback_id: str,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only: permanently delete feedback (retention/purge)."""
    item = db.query(FarmerFeedback).filter(FarmerFeedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback submission not found.")

    ref = item.feedback_ref
    db.delete(item)
    db.commit()

    record_activity(
        db,
        "admin.farmer_feedback_deleted",
        user_id=admin.id,
        details={"feedback_id": feedback_id, "feedback_ref": ref},
        request=request,
    )
    return None
