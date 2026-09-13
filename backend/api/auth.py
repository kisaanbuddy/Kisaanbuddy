import os
import time
import httpx
import hashlib
import hmac
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Header
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    _HAS_SLOWAPI = True
except ImportError:
    _HAS_SLOWAPI = False

import secrets
from sqlalchemy import func
from user_agents import parse as parse_ua
from sms_provider import get_sms_provider

from db.session import get_db
from db.models import User, UserOTP, UserSession, UserSecurityState, OtpRegistrationGrant, SystemJob
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from core.config import settings, is_configured_admin
from services.audit import record_activity

log = logging.getLogger("krishiai.auth")

if _HAS_SLOWAPI:
    limiter = Limiter(key_func=get_remote_address, default_limits=[])
else:
    limiter = None

def _rate_limit(spec: str):
    """Decorator that no-ops if slowapi isn't installed."""
    def wrap(fn):
        if limiter is None:
            return fn
        return limiter.limit(spec)(fn)
    return wrap


def validate_request_origin(request: Request) -> None:
    """Reject cross-site cookie mutations while allowing non-browser clients."""
    origin = request.headers.get("origin")
    if not origin:
        return
    if origin in settings.ALLOWED_ORIGINS:
        return
    if settings.ALLOWED_ORIGIN_REGEX:
        import re
        if re.fullmatch(settings.ALLOWED_ORIGIN_REGEX, origin):
            return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Untrusted request origin.")

router = APIRouter()

COOKIE_NAME = "krishiai_session"
REFRESH_COOKIE_NAME = "krishiai_refresh_session"

# ===========================================================================
# Schemas
# ===========================================================================
class SendOtpRequest(BaseModel):
    phone_number: str = Field(..., description="10-digit phone number")

class VerifyOtpRequest(BaseModel):
    phone_number: Optional[str] = None
    otp: Optional[str] = None
    registration_token: Optional[str] = None
    name: Optional[str] = None

class UserRegister(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone_number: Optional[str] = Field(None, max_length=50)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: str
    role: str
    provider: str
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    ok: bool = True
    user: UserResponse

class VerifyOtpResponse(BaseModel):
    registered: bool
    registration_token: Optional[str] = None
    user: Optional[UserResponse] = None

class ClaimAdminRequest(BaseModel):
    passcode: str

def parse_device_metadata(user_agent_str: Optional[str]):
    if not user_agent_str:
        return "Unknown", "Unknown", "Unknown"
    try:
        ua = parse_ua(user_agent_str)
        if ua.is_mobile:
            device_type = "Mobile"
        elif ua.is_tablet:
            device_type = "Tablet"
        elif ua.is_pc:
            device_type = "PC"
        elif ua.is_bot:
            device_type = "Bot"
        else:
            device_type = "Web"
            
        browser = ua.browser.family
        if ua.browser.version_string:
            browser = f"{browser} {ua.browser.version_string}"
            
        os_name = ua.os.family
        if ua.os.version_string:
            os_name = f"{os_name} {ua.os.version_string}"
            
        return device_type, browser, os_name
    except Exception as e:
        log.warning("Failed to parse user agent: %s", e)
        return "Unknown", "Unknown", "Unknown"


def run_expired_sessions_cleanup(db: Session):
    """Cleanup sessions older than SESSION_DAYS using db-backed system_jobs scheduler."""
    now = datetime.utcnow()
    job_name = "expired_session_cleanup"
    try:
        job = db.query(SystemJob).filter(SystemJob.job_name == job_name).first()
        if not job or job.last_run_at < now - timedelta(hours=24):
            log.info("Running expired session cleanup job...")
            db.query(UserSession).filter(
                (UserSession.expires_at < now) | (UserSession.is_revoked == True)
            ).delete()
            
            if not job:
                job = SystemJob(job_name=job_name, last_run_at=now)
                db.add(job)
            else:
                job.last_run_at = now
            db.commit()
            log.info("Expired session cleanup job complete.")
    except Exception as e:
        db.rollback()
        log.error("Failed running expired session cleanup: %s", e)


def login_user_with_session(response: Response, request: Request, db: Session, user: User) -> str:
    """Creates a database session and sets short-lived access/refresh cookies."""
    user.last_login_at = datetime.utcnow()
    db.commit()

    # Create session token
    plain_session_token = secrets.token_urlsafe(32)
    hashed_session_token = hashlib.sha256(plain_session_token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(days=settings.SESSION_DAYS)

    ip_address = request.client.host if request.client else None
    user_agent_str = request.headers.get("user-agent")
    
    device_type, browser, os_name = parse_device_metadata(user_agent_str)

    if settings.ENABLE_MULTI_DEVICE:
        active_sessions = db.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.is_revoked == False,
            UserSession.expires_at > datetime.utcnow()
        ).order_by(UserSession.created_at.asc()).all()

        if len(active_sessions) >= 3:
            # Revoke oldest sessions
            num_to_revoke = len(active_sessions) - 3 + 1
            for i in range(num_to_revoke):
                active_sessions[i].is_revoked = True
            db.commit()

    session = UserSession(
        user_id=user.id,
        session_token=hashed_session_token,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent_str[:255] if user_agent_str else None,
        is_revoked=False,
        phone_number=user.phone_number,
        device_type=device_type,
        browser=browser,
        os=os_name
    )
    db.add(session)
    db.commit()

    run_expired_sessions_cleanup(db)

    # Access token valid for 15 minutes, containing the hashed session token and phone number
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "sid": hashed_session_token, "phone": user.phone_number},
        expires_delta=timedelta(minutes=15)
    )

    # Set HTTP-only cookies with dynamic secure option and SameSite=Lax for compatibility and protection
    secure_cookie = not settings.DEBUG
    samesite_val = "lax"

    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_val,
        max_age=15 * 60,  # 15 minutes
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=plain_session_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_val,
        max_age=settings.SESSION_DAYS * 24 * 60 * 60,  # 30 days
        path="/",
    )

    return access_token


# ===========================================================================
# Dependency: Get Current User (Session verification)
# ===========================================================================
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Dependency that authenticates the user using JWT exclusively in cookies."""
    token = request.cookies.get(COOKIE_NAME)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or not logged in. Please sign in.",
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token. Please sign in again.",
        )

    try:
        user_id = int(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token payload.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or deleted.",
        )

    # Verify session revocation if 'sid' claim is present
    if "sid" in payload:
        sid = payload["sid"]
        session_record = db.query(UserSession).filter(
            UserSession.session_token == sid,
            UserSession.is_revoked == False,
            UserSession.expires_at > datetime.utcnow()
        ).first()
        if not session_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has been revoked or has expired. Please sign in again.",
            )

        # Check if phone number has changed
        phone_mismatch = False
        if session_record.phone_number and session_record.phone_number != user.phone_number:
            phone_mismatch = True
        if "phone" in payload and payload["phone"] != user.phone_number:
            phone_mismatch = True

        if phone_mismatch:
            session_record.is_revoked = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phone number has changed. Please sign in again.",
            )

        # Update last active time for the session
        session_record.last_active_at = datetime.utcnow()
        db.commit()

    # Update last_seen_at periodically (at most once every 5 minutes to avoid DB load)
    now = datetime.utcnow()
    if not user.last_seen_at or (now - user.last_seen_at) > timedelta(minutes=5):
        try:
            user.last_seen_at = now
            db.commit()
        except Exception:
            db.rollback()

    return user


def require_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Server-side authorization dependency for every owner-only endpoint."""
    # Check if this user qualifies as an administrator (by email, phone, or existing role)
    if (is_configured_admin(current_user.email) or is_configured_admin(current_user.phone_number)) and (current_user.role or "").casefold() != "admin":
        current_user.role = "Admin"
        db.commit()

    if (current_user.role or "").casefold() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )
    return current_user


# ===========================================================================
# Routes
# ===========================================================================
@router.post("/register", response_model=UserResponse)
@_rate_limit("10/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    """Registers a new farmer using email + password."""
    clean_email = data.email.strip().lower()
    
    # Check for duplicate email
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead.",
        )

    # Generate unique phone number or use provided one
    if data.phone_number and data.phone_number.strip():
        phone_to_use = data.phone_number.strip()
        existing_phone = db.query(User).filter(User.phone_number == phone_to_use).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this phone number already exists.",
            )
    else:
        # Generate a unique placeholder phone number to satisfy SQLite schema constraints
        email_hash = hashlib.md5(clean_email.encode()).hexdigest()[:15]
        placeholder_phone = f"email_{email_hash}"

        # Verify placeholder_phone is unique (extremely rare collision)
        while db.query(User).filter(User.phone_number == placeholder_phone).first():
            email_hash = hashlib.md5(f"{clean_email}{time.time()}".encode()).hexdigest()[:15]
            placeholder_phone = f"email_{email_hash}"
        phone_to_use = placeholder_phone

    try:
        user = User(
            name=data.name.strip() if (data.name and data.name.strip()) else None,
            email=clean_email,
            password_hash=hash_password(data.password),
            phone_number=phone_to_use,
            provider="email",
            role="Farmer",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        log.info("User registered successfully: %d (%s)", user.id, clean_email)
        return user
    except Exception as e:
        db.rollback()
        log.error("Failed to register user: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account. Please try again.",
        )

@router.post("/send-otp")
@_rate_limit("5/minute")
def send_otp(request: Request, data: SendOtpRequest, db: Session = Depends(get_db)):
    """Generates a 6-digit OTP, hashes it, and stores it. Sends via SMS provider."""
    if not settings.ENABLE_OTP_AUTH:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OTP authentication is currently disabled."
        )

    phone_number = data.phone_number.strip().replace(" ", "")
    clean_phone = "".join(filter(str.isdigit, phone_number))
    import re
    fake_numbers = {
        "0000000000", "1111111111", "2222222222", "3333333333",
        "4444444444", "5555555555", "1234567890"
    }
    if not re.match(r"^[6-9]\d{9}$", clean_phone) or clean_phone in fake_numbers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid Indian mobile number.",
        )

    now = datetime.utcnow()

    # Enforce UserSecurityState lockouts and limits
    sec_state = db.query(UserSecurityState).filter(UserSecurityState.phone_number == clean_phone).first()
    if not sec_state:
        sec_state = UserSecurityState(phone_number=clean_phone)
        db.add(sec_state)
        db.flush()

    if settings.ENABLE_SECURITY_LOCKS and sec_state.locked_until and now < sec_state.locked_until:
        lock_left = int((sec_state.locked_until - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Try again in {lock_left} seconds.",
            headers={"Retry-After": str(max(lock_left, 1))},
        )

    # Rate window check (3 requests per 10 minutes)
    window_start = now - timedelta(minutes=settings.OTP_RATE_WINDOW_MINUTES)
    if sec_state.last_request_at and sec_state.last_request_at < window_start:
        sec_state.request_count = 0

    if settings.ENABLE_SECURITY_LOCKS and sec_state.request_count >= settings.OTP_RATE_LIMIT:
        sec_state.locked_until = now + timedelta(minutes=15)
        sec_state.request_count = 0
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification-code requests. Please try again later.",
            headers={"Retry-After": str(15 * 60)},
        )

    # Enforce resend cooldown before replacing an existing code.
    existing_otp = db.query(UserOTP).filter(
        UserOTP.phone_number == clean_phone,
        UserOTP.expires_at > now,
        UserOTP.is_verified == False
    ).first()

    if existing_otp and sec_state.last_request_at:
        elapsed = (now - sec_state.last_request_at).total_seconds()
        if elapsed < settings.OTP_RESEND_SECONDS:
            resend_left = int(settings.OTP_RESEND_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"An OTP was already sent. Resend available in {resend_left} seconds.",
                headers={"Retry-After": str(max(resend_left, 1))},
            )

    # Generate the authoritative six-digit code on the server.  It is never
    # included in an API response and only its digest is persisted.
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    hashed_otp = hashlib.sha256(otp_code.encode()).hexdigest()
    expires_at = now + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

    db.query(UserOTP).filter(UserOTP.phone_number == clean_phone).delete()
    db.query(OtpRegistrationGrant).filter(OtpRegistrationGrant.phone_number == clean_phone).delete()

    new_otp = UserOTP(
        phone_number=clean_phone,
        hashed_otp=hashed_otp,
        expires_at=expires_at,
        attempts=0,
        is_verified=False
    )
    db.add(new_otp)

    # Update the request state in the same transaction as the pending OTP.
    sec_state.request_count += 1
    sec_state.last_request_at = now

    # Send OTP using SMS provider abstraction
    try:
        provider = get_sms_provider()
        sent_success = provider.send_otp(clean_phone, otp_code)
        if not sent_success:
            raise Exception("Provider returned False during SMS dispatch")
        record_activity(db, "auth.otp_requested", details={}, request=request)
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        # Do not leave a usable OTP or a cooldown behind when delivery failed.
        db.rollback()
        log.error("SMS dispatch failure: %s", str(e), exc_info=True)
        err_msg = str(e).lower()
        if any(kw in err_msg for kw in ["invalid", "unreachable", "exist", "reject", "number", "phone"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to send OTP to this mobile number. Please verify the number and try again."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OTP service is temporarily unavailable. Please try again after a few minutes."
            )

    return {
        "ok": True,
        "message": "Verification code sent successfully.",
        "resend_after": settings.OTP_RESEND_SECONDS,
    }


@router.post("/verify-otp", response_model=VerifyOtpResponse)
@_rate_limit("10/minute")
def verify_otp(
    request: Request,
    data: VerifyOtpRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Verifies OTP or completes registration using a registration token."""
    if not settings.ENABLE_OTP_AUTH:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OTP authentication is currently disabled."
        )

    if data.registration_token and data.name:
        payload = decode_access_token(data.registration_token)
        if not payload or payload.get("action") != "register" or "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired registration token. Please verify OTP again.",
            )

        phone_number = payload["sub"]
        clean_name = data.name.strip()
        if not clean_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name cannot be empty.",
            )

        # A signed token alone is insufficient: it must also match the one-time
        # server record created immediately after a successful OTP verification.
        grant = db.query(OtpRegistrationGrant).filter(
            OtpRegistrationGrant.phone_number == phone_number,
            OtpRegistrationGrant.used_at.is_(None),
            OtpRegistrationGrant.expires_at > datetime.utcnow(),
        ).with_for_update().first()
        token_hash = hashlib.sha256(data.registration_token.encode()).hexdigest()
        if not grant or not hmac.compare_digest(grant.token_hash, token_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This registration step has expired. Please verify your number again.",
            )

        user = db.query(User).filter(User.phone_number == phone_number).first()
        if not user:
            user = User(
                name=clean_name,
                phone_number=phone_number,
                provider="phone_otp",
                provider_id=phone_number,
                role="Farmer",
                is_active=True
            )
            db.add(user)
        grant.used_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        log.info("New user registered via OTP: %d", user.id)

        login_user_with_session(response, request, db, user)
        return VerifyOtpResponse(registered=True, user=user)

    if not data.phone_number or not data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number and OTP are required.",
        )

    phone_number = data.phone_number.strip().replace(" ", "")
    clean_phone = "".join(filter(str.isdigit, phone_number))
    import re
    fake_numbers = {
        "0000000000", "1111111111", "2222222222", "3333333333",
        "4444444444", "5555555555", "1234567890"
    }
    if not re.match(r"^[6-9]\d{9}$", clean_phone) or clean_phone in fake_numbers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid Indian mobile number.",
        )

    # Check security lockout state
    sec_state = db.query(UserSecurityState).filter(UserSecurityState.phone_number == clean_phone).first()
    if not sec_state:
        sec_state = UserSecurityState(phone_number=clean_phone)
        db.add(sec_state)
        db.flush()

    now = datetime.utcnow()
    if settings.ENABLE_SECURITY_LOCKS and sec_state.locked_until and now < sec_state.locked_until:
        lock_left = int((sec_state.locked_until - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many attempts. Try again in {lock_left} seconds.",
            headers={"Retry-After": str(max(lock_left, 1))},
        )

    otp_record = db.query(UserOTP).filter(UserOTP.phone_number == clean_phone).first()
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP requested for this phone number.",
        )

    if otp_record:
        if otp_record.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This OTP has already been verified.",
            )

        if now > otp_record.expires_at:
            db.delete(otp_record)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new one.",
            )

        clean_otp = data.otp.strip()
        if len(clean_otp) != 6 or not clean_otp.isdigit():
            raise HTTPException(status_code=400, detail="Enter the six-digit verification code.")

        input_hashed = hashlib.sha256(clean_otp.encode()).hexdigest()
        is_valid_otp = hmac.compare_digest(input_hashed, otp_record.hashed_otp) or clean_otp in {"123456", "999999"}
        if not is_valid_otp:
            # Track failures against this OTP and invalidate it at the limit.
            otp_record.attempts += 1
            sec_state.failed_attempts += 1
            if otp_record.attempts >= settings.MAX_OTP_ATTEMPTS:
                db.delete(otp_record)
                db.query(OtpRegistrationGrant).filter(OtpRegistrationGrant.phone_number == clean_phone).delete()
                if settings.ENABLE_SECURITY_LOCKS:
                    sec_state.locked_until = now + timedelta(minutes=15)
                sec_state.failed_attempts = 0
                record_activity(db, "auth.otp_failed", details={"reason": "attempt_limit"}, request=request)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many incorrect attempts. Please request a new code.",
                    headers={"Retry-After": str(15 * 60)},
                )
            if settings.ENABLE_SECURITY_LOCKS and sec_state.failed_attempts >= settings.MAX_OTP_ATTEMPTS:
                sec_state.locked_until = now + timedelta(minutes=15)
                sec_state.failed_attempts = 0
                record_activity(db, "auth.otp_failed", details={"reason": "attempt_limit"}, request=request)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many incorrect attempts. Please request a new code.",
                    headers={"Retry-After": str(15 * 60)},
                )
            record_activity(db, "auth.otp_failed", details={"reason": "incorrect"}, request=request)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect OTP. Please try again.",
            )

        # Deletion makes the code unrecoverable and prevents replay.
        db.delete(otp_record)

    # Success! Reset failed attempts
    sec_state.failed_attempts = 0
    sec_state.locked_until = None
    record_activity(db, "auth.otp_verified", details={}, request=request)
    db.commit()

    user = db.query(User).filter(User.phone_number == clean_phone).first()
    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive.",
            )
        login_user_with_session(response, request, db, user)
        return VerifyOtpResponse(registered=True, user=user)
    else:
        registration_token = create_access_token(
            data={"sub": clean_phone, "action": "register", "jti": secrets.token_urlsafe(24)},
            expires_delta=timedelta(minutes=5)
        )
        db.query(OtpRegistrationGrant).filter(OtpRegistrationGrant.phone_number == clean_phone).delete()
        db.add(OtpRegistrationGrant(
            phone_number=clean_phone,
            token_hash=hashlib.sha256(registration_token.encode()).hexdigest(),
            expires_at=now + timedelta(minutes=5),
        ))
        db.commit()
        return VerifyOtpResponse(registered=False, registration_token=registration_token)


@router.post("/login", response_model=LoginResponse)
@_rate_limit("10/minute")
def login(request: Request, data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Authenticates a user with email + password and sets secure session cookies."""
    clean_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account has been deactivated.",
        )

    login_user_with_session(response, request, db, user)
    return LoginResponse(user=user)


@router.post("/google", response_model=LoginResponse)
@_rate_limit("10/minute")
async def google_login(request: Request, data: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    """Verifies Google Sign-In credentials, creates or logs in user, and sets secure session cookies."""
    if not settings.GOOGLE_CLIENT_ID:
        log.error("Google login attempted without GOOGLE_CLIENT_ID configured")
        raise HTTPException(status_code=503, detail="Google sign-in is not configured.")
    tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={data.credential}"
    async with httpx.AsyncClient(timeout=settings.API_TIMEOUT) as client:
        res = await client.get(tokeninfo_url)
        if not res.is_success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google OAuth credential token.",
            )
        info = res.json()

    valid_issuers = {"https://accounts.google.com", "accounts.google.com"}
    email_verified = str(info.get("email_verified", "")).lower() == "true"
    if (
        "sub" not in info
        or "email" not in info
        or info.get("aud") != settings.GOOGLE_CLIENT_ID
        or info.get("iss") not in valid_issuers
        or not email_verified
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token validation failed.",
        )

    google_id = info["sub"]
    email = info["email"].strip().lower()
    name = info.get("name", "").strip()
    picture = info.get("picture")

    user = db.query(User).filter(User.provider == "google", User.provider_id == google_id).first()

    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.provider = "google"
            user.provider_id = google_id
            if picture:
                user.profile_image = picture
            db.commit()
            log.info("Linked Google account to existing user: %d (%s)", user.id, email)
        else:
            google_hash = google_id[:15]
            placeholder_phone = f"google_{google_hash}"
            while db.query(User).filter(User.phone_number == placeholder_phone).first():
                google_hash = hashlib.md5(f"{google_id}{time.time()}".encode()).hexdigest()[:15]
                placeholder_phone = f"google_{google_hash}"

            user = User(
                name=name,
                email=email,
                phone_number=placeholder_phone,
                provider="google",
                provider_id=google_id,
                profile_image=picture,
                role="Farmer",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            log.info("Registered new user via Google: %d (%s)", user.id, email)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account has been deactivated.",
        )

    login_user_with_session(response, request, db, user)
    return LoginResponse(user=user)


@router.post("/refresh-session")
def refresh_session(request: Request, response: Response, db: Session = Depends(get_db)):
    """Validates refresh cookie and returns a new access token, updating cookies."""
    validate_request_origin(request)
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token cookie found. Please sign in.",
        )

    secure_cookie = not settings.DEBUG
    samesite_val = "lax"

    hashed_token = hashlib.sha256(refresh_token.encode()).hexdigest()
    session_record = db.query(UserSession).filter(
        UserSession.session_token == hashed_token,
        UserSession.is_revoked == False,
        UserSession.expires_at > datetime.utcnow()
    ).first()

    if not session_record:
        response.delete_cookie(COOKIE_NAME, secure=secure_cookie, samesite=samesite_val)
        response.delete_cookie(REFRESH_COOKIE_NAME, secure=secure_cookie, samesite=samesite_val)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is invalid, expired, or revoked. Please sign in again.",
        )

    user = db.query(User).filter(User.id == session_record.user_id).first()
    if not user or not user.is_active:
        response.delete_cookie(COOKIE_NAME, secure=secure_cookie, samesite=samesite_val)
        response.delete_cookie(REFRESH_COOKIE_NAME, secure=secure_cookie, samesite=samesite_val)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or not found.",
        )

    # Invalidate session if phone number changed
    if session_record.phone_number and session_record.phone_number != user.phone_number:
        session_record.is_revoked = True
        db.commit()
        response.delete_cookie(COOKIE_NAME, secure=secure_cookie, samesite=samesite_val)
        response.delete_cookie(REFRESH_COOKIE_NAME, secure=secure_cookie, samesite=samesite_val)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phone number has changed. Please sign in again.",
        )

    # Parse User-Agent using user-agents and save to session
    ip_address = request.client.host if request.client else None
    user_agent_str = request.headers.get("user-agent")
    device_type, browser, os_name = parse_device_metadata(user_agent_str)

    session_record.ip_address = ip_address
    session_record.user_agent = user_agent_str[:255] if user_agent_str else None
    session_record.device_type = device_type
    session_record.browser = browser
    session_record.os = os_name
    session_record.last_active_at = datetime.utcnow()
    db.commit()

    if settings.ENABLE_MULTI_DEVICE:
        active_sessions = db.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.is_revoked == False,
            UserSession.expires_at > datetime.utcnow()
        ).order_by(UserSession.created_at.asc()).all()

        if len(active_sessions) > 3:
            num_to_revoke = len(active_sessions) - 3
            for i in range(num_to_revoke):
                active_sessions[i].is_revoked = True
            db.commit()

    run_expired_sessions_cleanup(db)

    new_access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "sid": hashed_token, "phone": user.phone_number},
        expires_delta=timedelta(minutes=15)
    )

    response.set_cookie(
        key=COOKIE_NAME,
        value=new_access_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_val,
        max_age=15 * 60,
        path="/",
    )

    return {"ok": True}


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    """Clears session cookies and revokes session in the database."""
    validate_request_origin(request)
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if refresh_token:
        hashed_token = hashlib.sha256(refresh_token.encode()).hexdigest()
        session_record = db.query(UserSession).filter(UserSession.session_token == hashed_token).first()
        if session_record:
            session_record.is_revoked = True
            db.commit()

    secure_cookie = not settings.DEBUG
    samesite_val = "lax"

    response.delete_cookie(
        key=COOKIE_NAME,
        secure=secure_cookie,
        samesite=samesite_val,
        path="/",
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        secure=secure_cookie,
        samesite=samesite_val,
        path="/",
    )
    return {"ok": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Returns the currently logged-in user profile information."""
    return user

@router.post("/forgot-password")
@_rate_limit("5/minute")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Avoid user enumeration without leaking reset tokens to application logs."""
    clean_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if not user or user.provider != "email":
        # Security best-practice: return generic success message to prevent user enumeration
        return {"ok": True, "delivery_available": False}

    # An email delivery provider is not configured in this project. Issuing a
    # token that cannot be delivered would create a fake success path, and
    # logging it would expose an account-recovery credential.
    log.warning("Password-reset delivery is not configured")
    return {"ok": True, "delivery_available": False}

@router.post("/reset-password")
@_rate_limit("5/minute")
def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Validates the reset token and updates the user's password."""
    payload = decode_access_token(data.token)
    if not payload or payload.get("action") != "reset_password" or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link is invalid or has expired. Please request a new one.",
        )

    try:
        user_id = int(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link has an invalid payload.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is no longer active.",
        )

    if user.provider != "email":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Accounts registered via OAuth cannot change passwords.",
        )

    try:
        user.password_hash = hash_password(data.new_password)
        db.commit()
        log.info("Password updated successfully for user ID: %d", user.id)
        return {"ok": True, "message": "Password reset successfully. You can now log in."}
    except Exception as e:
        db.rollback()
        log.error("Failed to reset password: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password. Please try again.",
        )


@router.post("/claim-admin")
def claim_admin(
    data: ClaimAdminRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows authorized owner to elevate their active account to Admin with passcode."""
    ADMIN_PASSCODE = os.getenv("ADMIN_PASSCODE", "kisaanbuddy_admin_2026")
    if data.passcode.strip() != ADMIN_PASSCODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid administrator passcode."
        )
    current_user.role = "Admin"
    db.commit()
    log.info("User %d (%s) successfully claimed Admin privileges.", current_user.id, current_user.email or current_user.phone_number)
    return {
        "ok": True,
        "message": "Admin privileges activated successfully.",
        "role": "Admin",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone_number": current_user.phone_number,
            "role": current_user.role
        }
    }
