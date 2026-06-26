import jwt
import bcrypt
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
from core.config import settings

log = logging.getLogger("kisaanbuddy.auth_service")

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt (12 rounds)."""
    # 12 is a secure work factor for standard login systems
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    """Verifies a plaintext password matches the stored bcrypt hash."""
    if not password or not hashed:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception as e:
        log.error("Password verification error: %s", e)
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token containing the user claims."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT access token. Returns claims if valid, else None."""
    try:
        decoded = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return decoded
    except jwt.ExpiredSignatureError:
        log.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        log.warning("Invalid token: %s", e)
        return None
    except Exception as e:
        log.error("Token decoding error: %s", e)
        return None
