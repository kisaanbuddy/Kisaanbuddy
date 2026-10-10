"""Build a small, trustworthy farm-context summary for an assistant turn.

The LLM never receives a database connection or an unrestricted farmer record.
This module only returns the active farm facts needed to answer the immediate
question and is deliberately safe to call for an anonymous request.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Optional

from fastapi import Request


def get_optional_user_id(request: Request) -> Optional[int]:
    """Resolve a cookie JWT without turning a public chat request into a 401."""
    try:
        from api.auth import COOKIE_NAME, decode_access_token

        payload = decode_access_token(request.cookies.get(COOKIE_NAME, ""))
        return int(payload["sub"]) if payload and payload.get("sub") else None
    except Exception:
        return None


def build_farmer_context(request: Request) -> Optional[dict[str, Any]]:
    """Return a compact context summary for the authenticated farmer only."""
    user_id = get_optional_user_id(request)
    if not user_id:
        return None

    try:
        from db.models import Farm, FarmActivity, FarmerField, FieldCrop, FarmerProfile, User
        from db.session import SessionLocal

        if SessionLocal is None:
            return None
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
            if not user:
                return None
            profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
            fields = db.query(FarmerField).filter(FarmerField.user_id == user_id).order_by(FarmerField.id.asc()).all()
            current_cycles = (
                db.query(FieldCrop)
                .filter(FieldCrop.user_id == user_id, FieldCrop.is_current == True)
                .order_by(FieldCrop.created_at.desc())
                .all()
            )
            recent = (
                db.query(FarmActivity)
                .filter(FarmActivity.user_id == user_id, FarmActivity.activity_date >= date.today() - timedelta(days=30))
                .order_by(FarmActivity.activity_date.desc(), FarmActivity.id.desc())
                .limit(5)
                .all()
            )
            farms = db.query(Farm).filter(Farm.user_id == user_id).order_by(Farm.id.asc()).limit(3).all()

            return {
                "language": user.language,
                "location": {
                    "village": getattr(profile, "village_name", None),
                    "district": getattr(profile, "district_name", None),
                    "state": getattr(profile, "state_name", None),
                },
                "farms": [{"name": f.name, "district": f.district_name, "state": f.state_name} for f in farms],
                "fields": [
                    {
                        "id": field.id,
                        "name": field.field_name,
                        "crop": field.current_crop,
                        "variety": field.crop_variety,
                        "sowing_date": field.sowing_date.isoformat() if field.sowing_date else None,
                        "soil": field.soil_type,
                        "irrigation": field.irrigation_type,
                        "area": field.acreage,
                        "unit": field.area_unit,
                    }
                    for field in fields[:5]
                ],
                "current_cycles": [
                    {
                        "field_id": cycle.field_id,
                        "crop": cycle.crop_name,
                        "variety": cycle.variety,
                        "season": cycle.season,
                        "sowing_date": cycle.sowing_date.isoformat() if cycle.sowing_date else None,
                        "stage": cycle.stage_override,
                    }
                    for cycle in current_cycles[:5]
                ],
                "recent_activities": [
                    {
                        "date": activity.activity_date.isoformat(),
                        "field_id": activity.field_id,
                        "type": activity.activity_type,
                        "title": activity.title,
                        "quantity": activity.quantity,
                        "unit": activity.unit,
                    }
                    for activity in recent
                ],
            }
        finally:
            db.close()
    except Exception:
        # Farm memory is an enhancement. Never make chat unavailable when a
        # migration or optional database is temporarily unavailable.
        return None


def format_farmer_context(context: Optional[dict[str, Any]]) -> Optional[str]:
    if not context:
        return None
    return (
        "FARMER CONTEXT (private, user-editable; use only when relevant):\n"
        f"{context}\n"
        "Use this to avoid repeating questions. If more than one field/crop could apply, ask which field. "
        "Never claim a stored fact is current when the farmer corrects it. Do not mention private IDs."
    )
