"""Private owner portal API — complete admin management.

All routes are protected by the require_admin dependency (role == "Admin" enforced
server-side). Audit logs are written for every mutating action.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, desc, asc
from sqlalchemy.orm import Session

from api.auth import require_admin
from api.content import SUPPORTED_LOCALES
from db import models
from db.models import User, UserSession, ActivityLog, Review
from db.session import get_db
from services.audit import record_activity
from services.storage import storage_service

router = APIRouter(dependencies=[Depends(require_admin)])
_CONTENT_KEY_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9_.-]{0,190}$")
MAX_MEDIA_BYTES = 5 * 1024 * 1024


# ===========================================================================
# Pydantic Schemas
# ===========================================================================

class ContentUpdate(BaseModel):
    value: str = Field(..., min_length=1, max_length=10000)
    is_published: bool = True


class UserEdit(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None)


class ActivateUser(BaseModel):
    is_active: bool


class ReviewStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|approved|rejected)$")


class AdminProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ===========================================================================
# Helpers
# ===========================================================================

def _content_key(locale: str, key: str) -> str:
    if locale not in SUPPORTED_LOCALES or not _CONTENT_KEY_RE.fullmatch(key):
        raise HTTPException(status_code=422, detail="Invalid locale or content key.")
    return f"{locale}:{key}"


def _user_to_dict(user: User, include_sessions: bool = False, db: Session | None = None) -> dict:
    base: dict = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,
        "is_active": user.is_active,
        "provider": user.provider,
        "profile_image": user.profile_image,
        "created_at": user.created_at,
        "last_login_at": user.last_login_at,
        "last_seen_at": user.last_seen_at,
        "language": user.language,
    }
    if include_sessions and db is not None:
        now = datetime.utcnow()
        sessions = (
            db.query(UserSession)
            .filter(
                UserSession.user_id == user.id,
                UserSession.is_revoked == False,
                UserSession.expires_at > now,
            )
            .order_by(UserSession.created_at.desc())
            .all()
        )
        base["active_sessions"] = [
            {
                "id": s.id,
                "device_type": s.device_type,
                "browser": s.browser,
                "os": s.os,
                "ip_address": s.ip_address,
                "created_at": s.created_at,
                "last_active_at": s.last_active_at,
                "expires_at": s.expires_at,
            }
            for s in sessions
        ]
        base["total_activity"] = db.query(ActivityLog).filter(ActivityLog.user_id == user.id).count()
    return base


# ===========================================================================
# Overview / Dashboard
# ===========================================================================

@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    """Enhanced overview including daily registrations and activity breakdown."""
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)

    active_sessions = (
        db.query(UserSession)
        .filter(UserSession.is_revoked.is_(False), UserSession.expires_at > now)
        .count()
    )

    language_rows = (
        db.query(models.ActivityLog.details, func.count(models.ActivityLog.id))
        .filter(models.ActivityLog.activity_type == "feature.language_switch")
        .group_by(models.ActivityLog.details)
        .all()
    )
    languages = []
    for details, count in language_rows:
        try:
            lang = json.loads(details or "{}").get("lang")
        except (TypeError, json.JSONDecodeError):
            lang = None
        if lang:
            languages.append({"language": lang, "count": count})

    # Daily registrations for last 15 days
    daily_registrations = []
    for i in range(14, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(User).filter(User.created_at >= day_start, User.created_at < day_end).count()
        daily_registrations.append({"date": day_start.strftime("%Y-%m-%d"), "count": count})

    activity_rows = (
        db.query(ActivityLog.activity_type, func.count(ActivityLog.id))
        .filter(ActivityLog.logged_at >= week_ago)
        .group_by(ActivityLog.activity_type)
        .order_by(func.count(ActivityLog.id).desc())
        .limit(10)
        .all()
    )

    pending_reviews = db.query(Review).filter(Review.status == "pending").count()

    return {
        "total_users": db.query(User).count(),
        "new_users_7d": db.query(User).filter(User.created_at >= week_ago).count(),
        "active_sessions": active_sessions,
        "active_users_24h": db.query(User).filter(User.last_seen_at >= day_ago).count(),
        "otp_requests_24h": db.query(models.ActivityLog).filter(
            models.ActivityLog.activity_type == "auth.otp_requested",
            models.ActivityLog.logged_at >= day_ago,
        ).count(),
        "otp_verified_24h": db.query(models.ActivityLog).filter(
            models.ActivityLog.activity_type == "auth.otp_verified",
            models.ActivityLog.logged_at >= day_ago,
        ).count(),
        "otp_failed_24h": db.query(models.ActivityLog).filter(
            models.ActivityLog.activity_type == "auth.otp_failed",
            models.ActivityLog.logged_at >= day_ago,
        ).count(),
        "feature_events_7d": db.query(models.ActivityLog).filter(
            models.ActivityLog.activity_type.like("feature.%"),
            models.ActivityLog.logged_at >= week_ago,
        ).count(),
        "language_usage": sorted(languages, key=lambda x: x["count"], reverse=True),
        "daily_registrations": daily_registrations,
        "activity_by_type": [{"type": t, "count": c} for t, c in activity_rows],
        "pending_reviews": pending_reviews,
        "total_reviews": db.query(Review).count(),
    }


# ===========================================================================
# User Management
# ===========================================================================

_ALLOWED_SORT_COLS = {"created_at", "last_login_at", "last_seen_at", "name", "email", "role"}
_ALLOWED_ROLES = {"Farmer", "Admin", "Moderator"}


@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=100),
    role: str = Query(""),
    is_active: Optional[bool] = Query(None),
    provider: str = Query(""),
    sort: str = Query("created_at"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
):
    if sort not in _ALLOWED_SORT_COLS:
        sort = "created_at"
    q = db.query(User)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(User.name.ilike(like), User.email.ilike(like), User.phone_number.ilike(like)))
    if role:
        q = q.filter(User.role == role)
    if is_active is not None:
        q = q.filter(User.is_active == is_active)
    if provider:
        q = q.filter(User.provider == provider)

    sort_col = getattr(User, sort, User.created_at)
    q = q.order_by(desc(sort_col) if order == "desc" else asc(sort_col))

    total = q.count()
    rows = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit),
        "users": [_user_to_dict(u) for u in rows],
    }


@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return _user_to_dict(user, include_sessions=True, db=db)


@router.patch("/users/{user_id}")
def edit_user(
    user_id: int,
    payload: UserEdit,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if admin.id == user_id and payload.role and payload.role != "Admin":
        raise HTTPException(status_code=400, detail="You cannot remove your own Admin role.")

    changes: dict = {}
    if payload.name is not None:
        user.name = payload.name.strip() or None
        changes["name"] = user.name
    if payload.email is not None:
        clean = payload.email.strip().lower()
        if clean:
            existing = db.query(User).filter(User.email == clean, User.id != user_id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use by another account.")
        user.email = clean or None
        changes["email"] = user.email
    if payload.role is not None:
        if payload.role not in _ALLOWED_ROLES:
            raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(sorted(_ALLOWED_ROLES))}")
        user.role = payload.role
        changes["role"] = user.role

    record_activity(
        db, "admin.user_edited",
        user_id=admin.id,
        details={"target_user_id": user_id, "changes": changes},
        request=request,
    )
    db.commit()
    db.refresh(user)
    return _user_to_dict(user)


@router.post("/users/{user_id}/activate")
def set_user_active(
    user_id: int,
    payload: ActivateUser,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if admin.id == user_id and not payload.is_active:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")

    user.is_active = payload.is_active
    action = "admin.user_activated" if payload.is_active else "admin.user_deactivated"
    record_activity(db, action, user_id=admin.id, details={"target_user_id": user_id}, request=request)
    db.commit()
    return {"ok": True, "is_active": user.is_active}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.query(UserSession).filter(UserSession.user_id == user_id).update({"is_revoked": True})
    record_activity(
        db, "admin.user_deleted",
        user_id=admin.id,
        details={"target_user_id": user_id, "email": user.email},
        request=request,
    )
    user.is_active = False
    user.name = f"[Deleted #{user_id}]"
    db.commit()
    return None


@router.post("/users/{user_id}/revoke-sessions")
def revoke_user_sessions(
    user_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    count = (
        db.query(UserSession)
        .filter(UserSession.user_id == user_id, UserSession.is_revoked == False)
        .update({"is_revoked": True})
    )
    record_activity(
        db, "admin.sessions_revoked",
        user_id=admin.id,
        details={"target_user_id": user_id, "count": count},
        request=request,
    )
    db.commit()
    return {"ok": True, "revoked": count}


# ===========================================================================
# Reviews Management
# ===========================================================================

@router.get("/reviews")
def list_reviews(
    status_filter: str = Query("", alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Review)
    if status_filter:
        q = q.filter(Review.status == status_filter)
    q = q.order_by(Review.created_at.desc())
    total = q.count()
    rows = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit),
        "reviews": [
            {"id": r.id, "name": r.name, "location": r.location, "crop": r.crop,
             "text": r.text, "stars": r.stars, "status": r.status, "created_at": r.created_at}
            for r in rows
        ],
    }


@router.patch("/reviews/{review_id}")
def update_review_status(
    review_id: str,
    payload: ReviewStatusUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    old_status = review.status
    review.status = payload.status
    record_activity(db, "admin.review_status_changed", user_id=admin.id,
                    details={"review_id": review_id, "old": old_status, "new": payload.status}, request=request)
    db.commit()
    return {"ok": True, "id": review.id, "status": review.status}


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: str,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    record_activity(db, "admin.review_deleted", user_id=admin.id, details={"review_id": review_id}, request=request)
    db.delete(review)
    db.commit()
    return None


# ===========================================================================
# Audit Logs (paginated + filterable)
# ===========================================================================

@router.get("/audit-logs")
def audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    activity_type: str = Query(""),
    user_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(ActivityLog)
    if activity_type:
        q = q.filter(ActivityLog.activity_type.ilike(f"%{activity_type}%"))
    if user_id is not None:
        q = q.filter(ActivityLog.user_id == user_id)
    if date_from:
        try:
            q = q.filter(ActivityLog.logged_at >= datetime.fromisoformat(date_from))
        except ValueError:
            pass
    if date_to:
        try:
            q = q.filter(ActivityLog.logged_at <= datetime.fromisoformat(date_to))
        except ValueError:
            pass
    q = q.order_by(ActivityLog.logged_at.desc())
    total = q.count()
    rows = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit),
        "logs": [
            {"id": row.id, "user_id": row.user_id, "activity_type": row.activity_type,
             "details": row.details, "ip_address": row.ip_address,
             "device_info": row.device_info, "logged_at": row.logged_at}
            for row in rows
        ],
    }


# ===========================================================================
# Admin Profile & Settings
# ===========================================================================

@router.get("/me")
def admin_me(admin: User = Depends(require_admin)):
    return {
        "id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "phone_number": admin.phone_number,
        "role": admin.role,
        "provider": admin.provider,
        "created_at": admin.created_at,
        "last_login_at": admin.last_login_at,
    }


@router.patch("/me")
def update_admin_profile(
    payload: AdminProfileUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        admin.name = payload.name.strip() or None
    record_activity(db, "admin.profile_updated", user_id=admin.id, details={}, request=request)
    db.commit()
    db.refresh(admin)
    return {"ok": True, "name": admin.name}


@router.post("/change-password")
def change_admin_password(
    payload: ChangePasswordRequest,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from services.auth_service import hash_password, verify_password  # noqa: PLC0415

    if admin.provider != "email":
        raise HTTPException(status_code=400, detail="Password change is only available for email/password accounts.")
    if not admin.password_hash or not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    admin.password_hash = hash_password(payload.new_password)
    record_activity(db, "admin.password_changed", user_id=admin.id, details={}, request=request)
    db.commit()
    return {"ok": True, "message": "Password changed successfully."}


# ===========================================================================
# Content Management
# ===========================================================================

@router.get("/content")
def list_content(db: Session = Depends(get_db)):
    rows = db.query(models.SiteContent).order_by(models.SiteContent.locale, models.SiteContent.content_key).all()
    return [
        {"id": row.id, "locale": row.locale,
         "key": row.content_key.split(":", 1)[1] if ":" in row.content_key else row.content_key,
         "value": row.value, "is_published": row.is_published, "updated_at": row.updated_at}
        for row in rows
    ]


@router.put("/content/{locale}/{key:path}")
def update_content(
    locale: str,
    key: str,
    payload: ContentUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    stored_key = _content_key(locale, key)
    row = db.query(models.SiteContent).filter(models.SiteContent.content_key == stored_key).first()
    if row is None:
        row = models.SiteContent(locale=locale, content_key=stored_key, value=payload.value.strip(),
                                  is_published=payload.is_published, updated_by=admin.id)
        db.add(row)
        action = "created"
    else:
        row.value = payload.value.strip()
        row.is_published = payload.is_published
        row.updated_by = admin.id
        action = "updated"
    record_activity(db, f"admin.content_{action}", user_id=admin.id,
                    details={"locale": locale, "key": key}, request=request)
    db.commit()
    db.refresh(row)
    return {"locale": locale, "key": key, "value": row.value, "is_published": row.is_published, "updated_at": row.updated_at}


# ===========================================================================
# Media Management
# ===========================================================================

@router.get("/media")
def list_media(db: Session = Depends(get_db)):
    rows = db.query(models.MediaAsset).order_by(models.MediaAsset.created_at.desc()).all()
    return [{"id": row.id, "filename": row.filename, "content_type": row.content_type,
             "size_bytes": row.size_bytes, "is_published": row.is_published, "created_at": row.created_at}
            for row in rows]


@router.post("/media", status_code=status.HTTP_201_CREATED)
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, WebP, and GIF images are allowed.")
    data = await file.read(MAX_MEDIA_BYTES + 1)
    if not data or len(data) > MAX_MEDIA_BYTES:
        raise HTTPException(status_code=413, detail="Image must be between 1 byte and 5 MB.")

    filename = (file.filename or "upload")[:255]
    storage_path, public_url = storage_service.save_file(filename, file.content_type, data)

    asset = models.MediaAsset(
        filename=filename,
        content_type=file.content_type,
        data=None,  # Decoupled binary data from DB
        storage_path=storage_path,
        public_url=public_url,
        size_bytes=len(data),
        uploaded_by=admin.id
    )
    db.add(asset)
    db.flush()
    record_activity(db, "admin.media_uploaded", user_id=admin.id, details={"media_id": asset.id}, request=request)
    db.commit()
    return {"id": asset.id, "filename": asset.filename, "url": f"/api/media/{asset.id}"}


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(
    media_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    asset = db.query(models.MediaAsset).filter(models.MediaAsset.id == media_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Media asset not found.")

    if asset.storage_path:
        storage_service.delete_file(asset.storage_path)

    db.delete(asset)
    record_activity(db, "admin.media_deleted", user_id=admin.id, details={"media_id": media_id}, request=request)
    db.commit()

    return None

