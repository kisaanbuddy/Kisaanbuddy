"""Automatic seeding for Founder Administrator Accounts.

Ensures the 3 founders exist in the database with role='Admin'.
"""
import logging
from datetime import datetime
from db.session import SessionLocal
from db.models import User
from services.auth_service import hash_password

log = logging.getLogger("krishiai.db.seed")

FOUNDERS = [
    {
        "name": "Aditya Ishwar",
        "email": "aditya@kisaanbuddy.com",
        "phone_number": "9100000001",
        "role": "Admin",
        "profile_image": "/aditya.png",
        "password": "Admin@Aditya2026",
    },
    {
        "name": "Utkarsh Sinha",
        "email": "utkarsh@kisaanbuddy.com",
        "phone_number": "9100000002",
        "role": "Admin",
        "profile_image": "/utkarsh.png",
        "password": "Admin@Utkarsh2026",
    },
    {
        "name": "Yash Singh",
        "email": "yash@kisaanbuddy.com",
        "phone_number": "9100000004",
        "role": "Admin",
        "profile_image": "/yash.png",
        "password": "Admin@Yash2026",
    },
]


def seed_founders():
    """Idempotently creates or updates the founders with Admin role."""
    db = SessionLocal()
    try:
        for f in FOUNDERS:
            user = db.query(User).filter(User.email == f["email"]).first()
            if not user:
                # Also check phone
                user = db.query(User).filter(User.phone_number == f["phone_number"]).first()

            if not user:
                user = User(
                    name=f["name"],
                    email=f["email"],
                    phone_number=f["phone_number"],
                    role="Admin",
                    is_active=True,
                    email_verified=True,
                    provider="email",
                    profile_image=f.get("profile_image"),
                    password_hash=hash_password(f["password"]),
                    created_at=datetime.utcnow(),
                )
                db.add(user)
                log.info("Created founder admin account: %s (%s)", f["name"], f["email"])
            else:
                user.name = f["name"]
                user.role = "Admin"
                user.is_active = True
                user.email_verified = True
                if f.get("profile_image"):
                    user.profile_image = f.get("profile_image")
                if not user.password_hash:
                    user.password_hash = hash_password(f["password"])
                log.info("Ensured founder has Admin role: %s (%s)", f["name"], f["email"])

        db.commit()
    except Exception as e:
        db.rollback()
        log.error("Failed to seed founders: %s", e)
    finally:
        db.close()

