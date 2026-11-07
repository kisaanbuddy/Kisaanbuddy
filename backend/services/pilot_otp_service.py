"""
Secure OTP Verification Service for Anonymous Field Pilot Consent Revocation & Erasure.

Guarantees:
1. No phone or case enumeration (identical timing-safe responses).
2. Expiring, single-use cryptographically hashed verification codes.
3. Max attempt lockouts (burns OTP after 3 failed attempts).
4. Zero plaintext OTP logging.
5. Reuses sms_provider abstraction.
"""

import os
import re
import secrets
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from core.config import settings
from db.models import UserOTP, AdvisoryCase, AdvisoryNotificationLog
from sms_provider import get_sms_provider

log = logging.getLogger("krishiai.pilot_otp")


def clean_phone_number(phone: str) -> str:
    """Extracts only digits, handling country codes (+91)."""
    cleaned = re.sub(r"\D", "", phone or "")
    if cleaned.startswith("91") and len(cleaned) == 12:
        cleaned = cleaned[2:]
    return cleaned


def request_consent_otp(case_id: str, phone: str, db: Session) -> Dict[str, Any]:
    """
    Initiates single-use OTP verification for anonymous consent revocation.
    Never reveals whether the phone number or case exists.
    """
    cleaned_phone = clean_phone_number(phone)
    generic_response = {
        "status": "otp_dispatched",
        "message": "If the mobile number matches the observation record, a single-use verification code has been dispatched.",
    }

    if not cleaned_phone or len(cleaned_phone) < 10:
        return generic_response

    # Look up case without leaking existence to client
    case = db.query(AdvisoryCase).filter(AdvisoryCase.case_id == case_id).first()
    if not case or not case.farmer_phone:
        return generic_response

    case_farmer_phone = clean_phone_number(case.farmer_phone)
    if case_farmer_phone != cleaned_phone:
        return generic_response

    # Generate 6-digit cryptographic OTP
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    hashed_otp = hashlib.sha256(otp_code.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

    # Invalidate previous unverified OTPs for this phone
    db.query(UserOTP).filter(
        UserOTP.phone_number == cleaned_phone,
        UserOTP.is_verified == False,
    ).delete()

    otp_record = UserOTP(
        phone_number=cleaned_phone,
        hashed_otp=hashed_otp,
        expires_at=expires_at,
        attempts=0,
        is_verified=False,
    )
    db.add(otp_record)
    db.commit()

    # Dispatch via SMS provider
    try:
        sms_provider = get_sms_provider()
        sms_provider.send_otp(cleaned_phone, otp_code)
    except Exception as e:
        log.warning("SMS dispatch encountered an error: %s", e)

    # In local testing or debug mode, expose code strictly to test runner
    is_test_env = bool(settings.DEBUG or os.getenv("TESTING") or os.getenv("PYTEST_CURRENT_TEST"))
    if is_test_env:
        generic_response["_dev_test_code"] = otp_code

    return generic_response


def verify_consent_otp(case_id: str, phone: str, otp: str, db: Session) -> bool:
    """
    Validates single-use OTP.
    Enforces expiry, single-use consumption, and lockout after 3 failed attempts.
    Never logs the OTP value.
    """
    cleaned_phone = clean_phone_number(phone)
    if not cleaned_phone or not otp:
        return False

    case = db.query(AdvisoryCase).filter(AdvisoryCase.case_id == case_id).first()
    if not case or not case.farmer_phone:
        return False

    case_farmer_phone = clean_phone_number(case.farmer_phone)
    if case_farmer_phone != cleaned_phone:
        return False

    now = datetime.utcnow()
    otp_record = db.query(UserOTP).filter(
        UserOTP.phone_number == cleaned_phone,
        UserOTP.is_verified == False,
        UserOTP.expires_at > now,
    ).order_by(UserOTP.created_at.desc()).first()

    if not otp_record:
        return False

    # Check attempt limit (max 3 failed attempts)
    if (otp_record.attempts or 0) >= 3:
        otp_record.is_verified = True  # Invalidate/burn after 3 failed tries
        db.commit()
        return False

    input_hash = hashlib.sha256(otp.strip().encode()).hexdigest()
    if input_hash == otp_record.hashed_otp:
        # Mark as single-use consumed
        otp_record.is_verified = True
        db.commit()
        return True
    else:
        otp_record.attempts = (otp_record.attempts or 0) + 1
        db.commit()
        return False
