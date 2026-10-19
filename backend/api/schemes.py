"""Government Schemes API routes — Personalized Benefits Assistant & Official Discovery.

Provides:
- GET /api/schemes/ : Structured list with state, category, jurisdiction & search filters
- POST /api/schemes/find : "Find Schemes for My Farm" deterministic matching engine
- GET /api/schemes/dashboard : Personalized dashboard sections (Recommended, Explore by Need, Open, Upcoming, Saved)
- GET /api/schemes/{scheme_id} : Detailed official scheme specs, benefits, documents, steps, FAQs, deadlines
- GET /api/schemes/{scheme_id}/checklist : Retrieve user's document preparation checklist
- POST /api/schemes/{scheme_id}/checklist : Create or update document preparation item (Available/Pending/Need Help)
- DELETE /api/schemes/{scheme_id}/checklist/{item_id} : Remove checklist item
- GET /api/schemes/reminders : Get user's verified official deadlines and personal application reminders
- POST /api/schemes/reminders : Set personal application reminder
- DELETE /api/schemes/reminders/{reminder_id} : Delete / dismiss reminder
- Admin routes (protected):
  - POST /api/schemes/admin/create : Create verified official scheme
  - PUT /api/schemes/admin/{scheme_id} : Update scheme rules, deadlines, or retire
  - POST /api/schemes/admin/reseed : Reseed verified scheme records
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from api.auth import get_current_user, require_admin
from db.models import Scheme, FarmerSchemeChecklist, FarmerSchemeReminder, FarmerProfile, User
from db.session import get_db
from schemas.scheme import (
    SchemeCreate,
    SchemeUpdate,
    SchemeResponse,
    SchemeFinderInput,
    SchemeDiscoveryResponse,
    ChecklistItemCreate,
    ChecklistItemUpdate,
    ChecklistItemResponse,
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse
)
from services.scheme_matching_service import evaluate_scheme_eligibility
from services.schemes_seed_service import seed_verified_schemes

log = logging.getLogger("krishiai.api.schemes")
router = APIRouter()


def _format_scheme_response(s: Scheme) -> SchemeResponse:
    """Safely converts DB Scheme model into Pydantic SchemeResponse."""
    return SchemeResponse(
        id=s.id,
        scheme_id=s.scheme_id,
        name=s.name,
        short_name=s.short_name,
        jurisdiction=s.jurisdiction,
        state=s.state,
        department=s.department,
        category=s.category,
        overview=s.overview,
        benefits_summary=s.benefits_summary,
        benefits_details=s.benefits_details,
        eligibility_criteria_text=s.eligibility_criteria_text,
        eligibility_rules=json.loads(s.eligibility_rules_json) if isinstance(s.eligibility_rules_json, str) else (s.eligibility_rules_json or {}),
        required_documents=json.loads(s.required_documents_json) if isinstance(s.required_documents_json, str) else (s.required_documents_json or []),
        application_steps=json.loads(s.application_steps_json) if isinstance(s.application_steps_json, str) else (s.application_steps_json or []),
        source_url=s.source_url,
        application_url=s.application_url,
        application_window_status=s.application_window_status,
        application_window_start=s.application_window_start,
        application_deadline=s.application_deadline,
        deadline_text=s.deadline_text,
        helpline_details=json.loads(s.helpline_details) if (s.helpline_details and isinstance(s.helpline_details, str) and s.helpline_details.startswith("{")) else (s.helpline_details or {}),
        faqs=json.loads(s.faqs_json) if isinstance(s.faqs_json, str) else (s.faqs_json or []),
        verification_status=s.verification_status,
        data_source=s.data_source,
        is_active=s.is_active,
        last_verified_at=s.last_verified_at,
        created_at=s.created_at,
        updated_at=s.updated_at
    )


# ---------------------------------------------------------------------------
# Public / Discovery Routes
# ---------------------------------------------------------------------------
@router.get("/", response_model=Dict[str, Any])
def list_schemes(
    state: Optional[str] = Query(None, description="State name or 'All'"),
    category: Optional[str] = Query(None, description="Category filter"),
    jurisdiction: Optional[str] = Query(None, description="Central or State"),
    window_status: Optional[str] = Query(None, description="open, upcoming, closed, open_all_year"),
    search: Optional[str] = Query(None, description="Free text query"),
    db: Session = Depends(get_db)
):
    """Returns official agricultural schemes matching optional search filters."""
    query = db.query(Scheme).filter(Scheme.is_active == True)

    if state and state.lower() != "all":
        # Include schemes specific to this state OR Central schemes ("All")
        query = query.filter((Scheme.state.ilike(state)) | (Scheme.state == "All"))

    if category and category.lower() != "all":
        query = query.filter(Scheme.category.ilike(category))

    if jurisdiction and jurisdiction.lower() != "all":
        query = query.filter(Scheme.jurisdiction.ilike(jurisdiction))

    if window_status and window_status.lower() != "all":
        query = query.filter(Scheme.application_window_status.ilike(window_status))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Scheme.name.ilike(term)) |
            (Scheme.short_name.ilike(term)) |
            (Scheme.overview.ilike(term)) |
            (Scheme.benefits_summary.ilike(term)) |
            (Scheme.department.ilike(term))
        )

    schemes = query.order_by(Scheme.jurisdiction.asc(), Scheme.name.asc()).all()
    formatted = [_format_scheme_response(s) for s in schemes]

    return {
        "count": len(formatted),
        "schemes": formatted,
        "disclaimer": "All schemes are sourced directly from official government gazettes, notifications, and portals. Always verify latest dates with your local CSC or block agriculture office."
    }


@router.post("/find", response_model=SchemeDiscoveryResponse)
def find_schemes_for_farm(
    finder_input: SchemeFinderInput,
    request: Request,
    db: Session = Depends(get_db)
):
    """Personalized Scheme Finder: Deterministic matching engine.

    Collects state, landholding, tenure, irrigation, planned activities, and farmer category.
    Classifies all active schemes into:
    1. Potential Match
    2. More Information Required
    3. Appears Not to Match Published Criteria
    """
    # If farmer asked to save profile and is authenticated via cookies, persist privacy-consciously
    if finder_input.save_to_profile:
        try:
            token = request.cookies.get("krishiai_access_token")
            if token:
                from services.auth_service import decode_access_token
                payload = decode_access_token(token)
                if payload and "sub" in payload:
                    user_id = int(payload["sub"])
                    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
                    if profile:
                        if finder_input.state and finder_input.state != "All":
                            profile.state_name = finder_input.state
                        if finder_input.district:
                            profile.district_name = finder_input.district
                        if finder_input.landholding_acres:
                            profile.land_holding_acres = finder_input.landholding_acres
                        if finder_input.has_irrigation is not None:
                            profile.has_irrigation = finder_input.has_irrigation
                        if finder_input.tenure_type:
                            profile.land_ownership = finder_input.tenure_type
                        if finder_input.crops:
                            profile.primary_crop = finder_input.crops[0]
                        db.commit()
        except Exception as e:
            log.warning("Could not auto-persist profile in find_schemes: %s", e)

    # Fetch all active schemes
    all_schemes = db.query(Scheme).filter(Scheme.is_active == True).all()

    potential_matches = []
    more_info_needed = []
    unmatched = []

    for scheme in all_schemes:
        result = evaluate_scheme_eligibility(scheme, finder_input)
        if result.match_status == "Potential Match":
            potential_matches.append(result)
        elif result.match_status == "More Information Required":
            more_info_needed.append(result)
        else:
            unmatched.append(result)

    # Sort each bucket by score desc
    potential_matches.sort(key=lambda x: x.score, reverse=True)
    more_info_needed.sort(key=lambda x: x.score, reverse=True)

    return SchemeDiscoveryResponse(
        query_summary=finder_input.model_dump(),
        total_schemes_evaluated=len(all_schemes),
        potential_matches=potential_matches,
        more_info_needed=more_info_needed,
        unmatched=unmatched
    )


@router.get("/dashboard", response_model=Dict[str, Any])
def get_schemes_dashboard(
    state: Optional[str] = Query("All"),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Personalized Scheme Dashboard sections:
    - Recommended for Your Farm
    - Explore by Need
    - Currently Open Applications
    - Upcoming Officially Announced Windows
    - Verified Sources
    """
    user_state = state or "All"
    user_land = None
    has_irrigation = None

    # Try reading logged-in profile if available
    try:
        token = request.cookies.get("krishiai_access_token") if request else None
        if token:
            from services.auth_service import decode_access_token
            payload = decode_access_token(token)
            if payload and "sub" in payload:
                user_id = int(payload["sub"])
                profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
                if profile:
                    if profile.state_name:
                        user_state = profile.state_name
                    if profile.land_holding_acres:
                        user_land = profile.land_holding_acres
                    if profile.has_irrigation is not None:
                        has_irrigation = profile.has_irrigation
    except Exception:
        pass

    # Build default finder input for recommendation
    finder_input = SchemeFinderInput(
        state=user_state,
        landholding_acres=user_land,
        has_irrigation=has_irrigation
    )

    all_schemes = db.query(Scheme).filter(Scheme.is_active == True).all()

    recommended = []
    currently_open = []
    upcoming = []

    for s in all_schemes:
        resp = _format_scheme_response(s)
        res = evaluate_scheme_eligibility(s, finder_input)
        if res.match_status in ["Potential Match", "More Information Required"]:
            recommended.append(resp)

        if s.application_window_status in ["open", "open_all_year"]:
            currently_open.append(resp)
        elif s.application_window_status == "upcoming":
            upcoming.append(resp)

    # Categories breakdown
    categories = [
        {"id": "income_support", "label": "Direct Income Support", "icon": "IndianRupee", "count": sum(1 for s in all_schemes if s.category == "income_support")},
        {"id": "crop_insurance", "label": "Crop Insurance & Relief", "icon": "ShieldCheck", "count": sum(1 for s in all_schemes if s.category == "crop_insurance")},
        {"id": "credit", "label": "Low-Interest Credit & KCC", "icon": "CreditCard", "count": sum(1 for s in all_schemes if s.category == "credit")},
        {"id": "irrigation", "label": "Irrigation & Solar Pumps", "icon": "Droplets", "count": sum(1 for s in all_schemes if s.category == "irrigation")},
        {"id": "machinery", "label": "Machinery & Equipment Subsidy", "icon": "Tractor", "count": sum(1 for s in all_schemes if s.category == "machinery")},
        {"id": "inputs_subsidies", "label": "Seeds, Fertilizer & Diesel", "icon": "Sprout", "count": sum(1 for s in all_schemes if s.category == "inputs_subsidies")},
        {"id": "organic", "label": "Organic & Natural Farming", "icon": "Leaf", "count": sum(1 for s in all_schemes if s.category == "organic")},
        {"id": "post_harvest", "label": "Mandi & Post-Harvest Infra", "icon": "Warehouse", "count": sum(1 for s in all_schemes if s.category == "post_harvest")},
        {"id": "women_empowerment", "label": "Women Farmers & SHGs", "icon": "Users", "count": sum(1 for s in all_schemes if s.category == "women_empowerment")},
    ]

    return {
        "user_state": user_state,
        "recommended_count": len(recommended),
        "recommended": recommended[:6],
        "categories": categories,
        "currently_open": currently_open[:6],
        "upcoming": upcoming[:4],
        "official_sources_verified": [
            {"portal": "PM-KISAN Central Portal", "url": "https://pmkisan.gov.in", "status": "Active / Verified"},
            {"portal": "National Crop Insurance Portal (PMFBY)", "url": "https://pmfby.gov.in", "status": "Active / Verified"},
            {"portal": "PM-KUSUM Solar Energy Portal (MNRE)", "url": "https://pmkusum.mnre.gov.in", "status": "Active / Verified"},
            {"portal": "Bihar DBT Agriculture (dbtagriculture.bihar.gov.in)", "url": "https://dbtagriculture.bihar.gov.in", "status": "Active / Verified"},
            {"portal": "National Agriculture Market (e-NAM)", "url": "https://enam.gov.in", "status": "Active / Verified"},
            {"portal": "Agriculture Infrastructure Fund (AIF)", "url": "https://agriinfra.dac.gov.in", "status": "Active / Verified"}
        ]
    }


@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_details(scheme_id: str, db: Session = Depends(get_db)):
    """Fetches comprehensive official scheme details by slug (e.g. pm-kisan)."""
    scheme = db.query(Scheme).filter(
        (Scheme.scheme_id == scheme_id) | (Scheme.id == int(scheme_id) if scheme_id.isdigit() else False)
    ).first()

    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme record not found.")

    return _format_scheme_response(scheme)


# ---------------------------------------------------------------------------
# Document Checklist Management (Farmer Personal Preparation)
# ---------------------------------------------------------------------------
@router.get("/{scheme_id}/checklist", response_model=List[ChecklistItemResponse])
def get_scheme_checklist(
    scheme_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves or auto-initializes the farmer's personal document checklist for a scheme."""
    # Find scheme to know official required documents
    scheme = db.query(Scheme).filter(Scheme.scheme_id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found.")

    existing_items = db.query(FarmerSchemeChecklist).filter(
        FarmerSchemeChecklist.user_id == current_user.id,
        FarmerSchemeChecklist.scheme_id == scheme_id
    ).all()

    # If user hasn't created items yet, populate default items from official scheme specs
    if not existing_items and scheme.required_documents_json:
        try:
            req_docs = json.loads(scheme.required_documents_json)
            now = datetime.utcnow()
            for doc in req_docs:
                item = FarmerSchemeChecklist(
                    user_id=current_user.id,
                    scheme_id=scheme_id,
                    document_name=doc.get("name", "Document"),
                    document_code=doc.get("code"),
                    status="pending",
                    notes=doc.get("verification_help", ""),
                    created_at=now,
                    updated_at=now
                )
                db.add(item)
            db.commit()
            existing_items = db.query(FarmerSchemeChecklist).filter(
                FarmerSchemeChecklist.user_id == current_user.id,
                FarmerSchemeChecklist.scheme_id == scheme_id
            ).all()
        except Exception as e:
            log.warning("Could not prefill checklist: %s", e)

    return existing_items


@router.post("/{scheme_id}/checklist", response_model=ChecklistItemResponse)
def create_or_update_checklist_item(
    scheme_id: str,
    item_in: ChecklistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a document or updates its readiness status (Available, Pending, Need Help).

    Never asks for or stores Aadhaar number, bank credentials or OTPs.
    """
    now = datetime.utcnow()
    existing = db.query(FarmerSchemeChecklist).filter(
        FarmerSchemeChecklist.user_id == current_user.id,
        FarmerSchemeChecklist.scheme_id == scheme_id,
        FarmerSchemeChecklist.document_name == item_in.document_name
    ).first()

    if existing:
        existing.status = item_in.status
        if item_in.notes is not None:
            existing.notes = item_in.notes
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        return existing

    new_item = FarmerSchemeChecklist(
        user_id=current_user.id,
        scheme_id=scheme_id,
        document_name=item_in.document_name,
        document_code=item_in.document_code,
        status=item_in.status,
        notes=item_in.notes,
        created_at=now,
        updated_at=now
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.patch("/checklist/{item_id}", response_model=ChecklistItemResponse)
def update_checklist_item_status(
    item_id: int,
    item_update: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates document checklist status."""
    item = db.query(FarmerSchemeChecklist).filter(
        FarmerSchemeChecklist.id == item_id,
        FarmerSchemeChecklist.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found.")

    if item_update.status:
        item.status = item_update.status
    if item_update.notes is not None:
        item.notes = item_update.notes
    item.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(item)
    return item


@router.delete("/checklist/{item_id}")
def delete_checklist_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a custom checklist entry."""
    item = db.query(FarmerSchemeChecklist).filter(
        FarmerSchemeChecklist.id == item_id,
        FarmerSchemeChecklist.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found.")

    db.delete(item)
    db.commit()
    return {"status": "ok", "message": "Checklist item removed."}


# ---------------------------------------------------------------------------
# Deadline and Reminder System
# ---------------------------------------------------------------------------
@router.get("/reminders/my", response_model=List[ReminderResponse])
def get_user_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches all active reminders for the authenticated farmer with verified scheme details."""
    reminders = db.query(FarmerSchemeReminder).filter(
        FarmerSchemeReminder.user_id == current_user.id,
        FarmerSchemeReminder.is_dismissed == False
    ).order_by(FarmerSchemeReminder.reminder_date.asc()).all()

    result = []
    for r in reminders:
        scheme = db.query(Scheme).filter(Scheme.scheme_id == r.scheme_id).first()
        result.append(
            ReminderResponse(
                id=r.id,
                user_id=r.user_id,
                scheme_id=r.scheme_id,
                scheme_name=scheme.name if scheme else r.scheme_id,
                reminder_date=r.reminder_date,
                reminder_type=r.reminder_type,
                notes=r.notes,
                is_dismissed=r.is_dismissed,
                source_url=scheme.source_url if scheme else None,
                last_verified_at=scheme.last_verified_at if scheme else None,
                created_at=r.created_at,
                updated_at=r.updated_at
            )
        )
    return result


@router.post("/reminders", response_model=ReminderResponse)
def create_reminder(
    reminder_in: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sets a personal reminder for an official scheme deadline or application step.

    Validates that the scheme exists in the database.
    """
    scheme = db.query(Scheme).filter(Scheme.scheme_id == reminder_in.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Referenced scheme not found.")

    now = datetime.utcnow()
    reminder = FarmerSchemeReminder(
        user_id=current_user.id,
        scheme_id=reminder_in.scheme_id,
        reminder_date=reminder_in.reminder_date,
        reminder_type=reminder_in.reminder_type,
        notes=reminder_in.notes,
        created_at=now,
        updated_at=now
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        scheme_id=reminder.scheme_id,
        scheme_name=scheme.name,
        reminder_date=reminder.reminder_date,
        reminder_type=reminder.reminder_type,
        notes=reminder.notes,
        is_dismissed=reminder.is_dismissed,
        source_url=scheme.source_url,
        last_verified_at=scheme.last_verified_at,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )


@router.delete("/reminders/{reminder_id}")
def dismiss_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dismisses / deletes a reminder."""
    reminder = db.query(FarmerSchemeReminder).filter(
        FarmerSchemeReminder.id == reminder_id,
        FarmerSchemeReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    reminder.is_dismissed = True
    db.commit()
    return {"status": "ok", "message": "Reminder dismissed."}


# ---------------------------------------------------------------------------
# Admin Management Routes (Role-based: require_admin)
# ---------------------------------------------------------------------------
@router.post("/admin/create", response_model=SchemeResponse)
def admin_create_scheme(
    scheme_in: SchemeCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Creates a new official scheme record with structured rules and document lists."""
    existing = db.query(Scheme).filter(Scheme.scheme_id == scheme_in.scheme_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scheme identifier already exists.")

    now = datetime.utcnow()
    scheme = Scheme(
        scheme_id=scheme_in.scheme_id,
        name=scheme_in.name,
        short_name=scheme_in.short_name,
        jurisdiction=scheme_in.jurisdiction,
        state=scheme_in.state,
        department=scheme_in.department,
        category=scheme_in.category,
        overview=scheme_in.overview,
        benefits_summary=scheme_in.benefits_summary,
        benefits_details=scheme_in.benefits_details,
        eligibility_criteria_text=scheme_in.eligibility_criteria_text,
        eligibility_rules_json=json.dumps(scheme_in.eligibility_rules, ensure_ascii=False),
        required_documents_json=json.dumps(scheme_in.required_documents, ensure_ascii=False),
        application_steps_json=json.dumps(scheme_in.application_steps, ensure_ascii=False),
        source_url=scheme_in.source_url,
        application_url=scheme_in.application_url,
        application_window_status=scheme_in.application_window_status,
        application_window_start=scheme_in.application_window_start,
        application_deadline=scheme_in.application_deadline,
        deadline_text=scheme_in.deadline_text,
        helpline_details=json.dumps(scheme_in.helpline_details, ensure_ascii=False),
        faqs_json=json.dumps(scheme_in.faqs, ensure_ascii=False),
        verification_status=scheme_in.verification_status,
        data_source=scheme_in.data_source,
        is_active=scheme_in.is_active,
        last_verified_at=now,
        created_at=now,
        updated_at=now
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    return _format_scheme_response(scheme)


@router.put("/admin/{scheme_id}", response_model=SchemeResponse)
def admin_update_scheme(
    scheme_id: str,
    update_in: SchemeUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Updates official scheme parameters, verifies deadlines, or retires stale records."""
    scheme = db.query(Scheme).filter(Scheme.scheme_id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme record not found.")

    now = datetime.utcnow()
    update_data = update_in.model_dump(exclude_unset=True)

    for field, val in update_data.items():
        if field in ["eligibility_rules", "required_documents", "application_steps", "helpline_details", "faqs"]:
            setattr(scheme, f"{field}_json" if field != "helpline_details" else "helpline_details", json.dumps(val, ensure_ascii=False))
        else:
            setattr(scheme, field, val)

    scheme.last_verified_at = now
    scheme.updated_at = now
    db.commit()
    db.refresh(scheme)
    return _format_scheme_response(scheme)


@router.post("/admin/reseed")
def admin_reseed_schemes(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Forces a refresh/reseed of verified official scheme datasets."""
    count = seed_verified_schemes(db)
    return {"status": "ok", "message": f"Verified schemes reseeded successfully ({count} processed)."}
