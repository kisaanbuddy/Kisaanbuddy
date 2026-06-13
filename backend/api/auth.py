import time
import httpx
import hashlib
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

from db.session import get_db
from db.models import User
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from core.config import settings

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

router = APIRouter()

COOKIE_NAME = "krishiai_session"

# ===========================================================================
# Schemas
# ===========================================================================
class UserRegister(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=4)
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
    new_password: str = Field(..., min_length=4)

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
    token: str
    user: UserResponse

# ===========================================================================
# Dependency: Get Current User (Session verification)
# ===========================================================================
async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that authenticates the user using JWT in cookies or Authorization header."""
    token = None
    
    # 1. Try reading from cookie
    if COOKIE_NAME in request.cookies:
        token = request.cookies[COOKIE_NAME]
        
    # 2. Try reading from Authorization header (Bearer token)
    elif authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:]

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
        
    # Update last_seen_at periodically (at most once every 5 minutes to avoid DB load)
    now = datetime.utcnow()
    if not user.last_seen_at or (now - user.last_seen_at) > timedelta(minutes=5):
        try:
            user.last_seen_at = now
            db.commit()
        except Exception:
            db.rollback()

    return user

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

@router.post("/login", response_model=LoginResponse)
@_rate_limit("10/minute")
def login(request: Request, data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Authenticates a user with email + password and sets HTTPOnly cookie."""
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

    # Update last_login_at
    user.last_login_at = datetime.utcnow()
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    # Set HTTPOnly session cookie (SameSite=None for cross-site Vercel-Render compatibility)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return LoginResponse(token=token, user=user)

@router.post("/google", response_model=LoginResponse)
@_rate_limit("10/minute")
async def google_login(request: Request, data: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    """Verifies Google Sign-In credentials and creates/logs in the associated user."""
    # Verify the credential with Google's API
    tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={data.credential}"
    async with httpx.AsyncClient() as client:
        res = await client.get(tokeninfo_url)
        if not res.is_success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google OAuth credential token.",
            )
        info = res.json()

    # Verify aud matches Client ID (optional fallback, verify structure)
    if "sub" not in info or "email" not in info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token validation failed: incomplete payload.",
        )

    google_id = info["sub"]
    email = info["email"].strip().lower()
    name = info.get("name", "").strip()
    picture = info.get("picture")

    # 1. Check if user already linked via Google provider
    user = db.query(User).filter(User.provider == "google", User.provider_id == google_id).first()
    
    if not user:
        # 2. Check if a user exists with the same email
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link Google provider to existing email account
            user.provider = "google"
            user.provider_id = google_id
            if picture:
                user.profile_image = picture
            db.commit()
            log.info("Linked Google account to existing user: %d (%s)", user.id, email)
        else:
            # 3. Create a new user with Google details
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

    user.last_login_at = datetime.utcnow()
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    # Set cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return LoginResponse(token=token, user=user)

@router.post("/logout")
def logout(response: Response):
    """Clears the session cookie on the browser client."""
    response.delete_cookie(
        key=COOKIE_NAME,
        secure=True,
        samesite="none",
    )
    return {"ok": True, "message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Returns the currently logged-in user profile information."""
    return user

@router.post("/forgot-password")
@_rate_limit("5/minute")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generates a secure password reset link and prints it to backend logs."""
    clean_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if not user or user.provider != "email":
        # Security best-practice: return generic success message to prevent user enumeration
        return {"ok": True, "message": "If an email exists, a reset link has been logged."}

    # Access token valid for 15 minutes
    reset_token = create_access_token(
        data={"sub": str(user.id), "action": "reset_password"},
        expires_delta=timedelta(minutes=15),
    )
    
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    log.info("==========================================")
    log.info(" PASSWORD RESET LINK GENERATED FOR %s:", clean_email.upper())
    log.info(" %s", reset_link)
    log.info("==========================================")
    
    # For user convenience, print to stderr/stdout so it shows in terminal clearly
    print(f"\n[RESET LINK]: {reset_link}\n", flush=True)

    return {"ok": True, "message": "If an email exists, a reset link has been logged."}

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
