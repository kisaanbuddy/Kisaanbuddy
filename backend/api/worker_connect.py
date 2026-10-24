"""KrishiAI Worker Connect — Agricultural Labour Marketplace REST API.

Mounted at /api/worker-connect (see backend/main.py).

Comprehensive Endpoints for All 10 Phases:
- Categories:
  GET    /categories                  List active labour categories (searchable)
  POST   /categories                  Add new category (admin-extensible)

- Worker Registration & Verification:
  POST   /workers/send-otp            Send phone OTP for mobile verification
  POST   /workers/verify-otp          Verify phone OTP
  POST   /workers/register            Register worker profile (individual/group/contractor)
  GET    /workers                     Search workers with multi-criterion filters
  GET    /workers/{worker_id}         Get worker profile (masked phone by default)
  POST   /workers/{worker_id}/availability  Update availability & refresh TTL
  POST   /workers/{worker_id}/contact-request Farmer requests contact
  GET    /workers/{worker_id}/contact-requests Worker views contact requests
  PATCH  /contact-requests/{id}       Worker approves/rejects contact request
  POST   /workers/delete              DPDP Act compliant worker account erasure

- Farmer Job Postings:
  POST   /jobs                        Post farm labour job requirement (Phase 4)
  GET    /jobs                        List open jobs with search/filters
  GET    /jobs/{id}                   Get job details
  POST   /jobs/{id}/apply             Worker applies to job
  GET    /jobs/{id}/applications      Farmer views job applications
  POST   /jobs/{id}/status            Update status (open / filled / closed)
  DELETE /jobs/{id}                   Delete job post

- Official Wage Intelligence:
  GET    /wage-benchmarks             Official Labour Bureau & MGNREGA benchmarks
  GET    /suggest-wage                Fair wage suggestion hint (legacy + upgraded)

- Safety, Moderation & Audit:
  POST   /reports                     Report inappropriate listing, spam, or abuse
  GET    /admin/reports               Admin view pending reports
  PATCH  /admin/reports/{id}          Admin moderate report
  GET    /admin/audit-trail           Admin audit log of labour operations
"""
from __future__ import annotations

import logging
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from db.session import get_db
from schemas.labour_schemas import (
    WorkerCategoryOut,
    WorkerCategoryCreate,
    WorkerRegisterIn,
    WorkerProfileOut,
    WorkerOtpRequest,
    WorkerOtpVerify,
    WorkerSearchQuery,
    WorkerSearchResponse,
    AvailabilityUpdateIn,
    LabourJobPostIn,
    LabourJobPostOut,
    LabourJobApplicationIn,
    LabourJobApplicationOut,
    LabourContactRequestIn,
    LabourContactRequestOut,
    ContactRequestResolutionIn,
    WageBenchmarkOut,
    LabourReportIn,
    LabourReportOut,
    AccountDeleteIn,
)
from schemas.worker_connect import (
    Job,
    JobMatch,
    JobOut,
    JobPostIn as LegacyJobPostIn,
    JobSearchQuery as LegacyJobSearchQuery,
    JobSearchResponse as LegacyJobSearchResponse,
    JobStatus,
    WageSuggestion,
    WorkType,
)
from services import jobs_service
from services import labour_marketplace_service as labour_svc

log = logging.getLogger("krishiai.api.worker_connect")
router = APIRouter()


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ===========================================================================
# Phase 2: Agricultural Worker Categories
# ===========================================================================
@router.get(
    "/categories",
    response_model=List[WorkerCategoryOut],
    summary="List searchable agricultural worker categories",
)
def get_categories(
    active_only: bool = Query(True, description="Filter for active categories only"),
    db: Session = Depends(get_db),
):
    """Returns all searchable categories (ploughing, sowing, transplanting, harvesting, tractor operator, etc.)."""
    return labour_svc.list_categories(db, active_only=active_only)


@router.post(
    "/categories",
    response_model=WorkerCategoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Add an agricultural worker category (Administrator)",
)
def add_category(
    payload: WorkerCategoryCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Allows administrators to register additional agricultural worker categories."""
    ip = _get_client_ip(request)
    return labour_svc.create_category(db, payload, ip_address=ip)


# ===========================================================================
# Phase 3 & 7: Worker Registration & Phone OTP Verification
# ===========================================================================
@router.post(
    "/workers/send-otp",
    summary="Send phone verification OTP to worker",
)
def send_otp(
    payload: WorkerOtpRequest,
    db: Session = Depends(get_db),
):
    """Sends a 6-digit OTP code to verify mobile number authenticity and prevent spam."""
    try:
        return labour_svc.send_worker_otp(db, payload.phone_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/workers/verify-otp",
    summary="Verify mobile OTP",
)
def verify_otp(
    payload: WorkerOtpVerify,
    db: Session = Depends(get_db),
):
    """Validates the 6-digit OTP code before proceeding with worker profile creation."""
    is_valid = labour_svc.verify_worker_otp(db, payload.phone_number, payload.otp_code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
    return {"ok": True, "message": "Mobile number verified successfully."}


@router.post(
    "/workers/register",
    response_model=WorkerProfileOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register worker, labour group, or contractor profile",
)
def register_worker(
    payload: WorkerRegisterIn,
    request: Request,
    db: Session = Depends(get_db),
):
    """Mobile-friendly worker registration with masked privacy and confirmed availability."""
    ip = _get_client_ip(request)
    try:
        worker = labour_svc.register_worker(db, payload, ip_address=ip)
        return labour_svc._format_worker_out(worker, viewer_phone=payload.phone_number, db=db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ===========================================================================
# Phase 5: Worker Search & Public Profiles
# ===========================================================================
@router.get(
    "/workers",
    response_model=WorkerSearchResponse,
    summary="Search workers and labour groups with multi-criterion filters",
)
def search_workers(
    state: Optional[str] = Query(None, description="State name filter"),
    district: Optional[str] = Query(None, description="District name filter"),
    village: Optional[str] = Query(None, description="Village name filter"),
    category: Optional[str] = Query(None, alias="category_slug", description="Category slug"),
    worker_type: Optional[str] = Query("all", description="all | individual | group | contractor"),
    min_wage: Optional[float] = Query(None, ge=0),
    max_wage: Optional[float] = Query(None, ge=0),
    only_confirmed_available: bool = Query(True, description="Show only workers with active confirmed availability"),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: float = Query(50.0, ge=1.0, le=500.0),
    sort_by: str = Query("relevance", description="relevance | distance | availability | wage_asc | wage_desc"),
    viewer_phone: Optional[str] = Query(None, description="Viewer phone for contact authorization check"),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Search workers and labour groups. Phone numbers are strictly masked unless authorized."""
    query = WorkerSearchQuery(
        state=state,
        district=district,
        village=village,
        category_slug=category,
        worker_type=worker_type,  # type: ignore
        min_wage=min_wage,
        max_wage=max_wage,
        only_confirmed_available=only_confirmed_available,
        lat=lat,
        lon=lon,
        radius_km=radius_km,
        sort_by=sort_by,  # type: ignore
        limit=limit,
        offset=offset,
    )
    return labour_svc.search_workers(db, query, viewer_phone=viewer_phone)


@router.get(
    "/workers/{worker_id}",
    response_model=WorkerProfileOut,
    summary="Get single worker profile (phone masked)",
)
def get_worker(
    worker_id: int,
    viewer_phone: Optional[str] = Query(None, description="Farmer phone checking authorized access"),
    db: Session = Depends(get_db),
):
    from db.models import WorkerProfile
    worker = db.query(WorkerProfile).filter(
        WorkerProfile.id == worker_id,
        WorkerProfile.deleted_at.is_(None),
    ).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found.")
    return labour_svc._format_worker_out(worker, viewer_phone=viewer_phone, db=db)


# ===========================================================================
# Phase 5/7: Availability Confirmation
# ===========================================================================
@router.post(
    "/workers/{worker_id}/availability",
    response_model=WorkerProfileOut,
    summary="Update worker availability and refresh confirmation TTL",
)
def update_availability(
    worker_id: int,
    payload: AvailabilityUpdateIn,
    request: Request,
    db: Session = Depends(get_db),
):
    """Worker confirms current availability. Updates last_confirmed timestamp and sets expiry."""
    ip = _get_client_ip(request)
    try:
        worker = labour_svc.update_worker_availability(db, worker_id, payload, ip_address=ip)
        return labour_svc._format_worker_out(worker, db=db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ===========================================================================
# Phase 7: Consent-Based Contact Requests
# ===========================================================================
@router.post(
    "/workers/{worker_id}/contact-request",
    response_model=LabourContactRequestOut,
    status_code=status.HTTP_201_CREATED,
    summary="Request contact with worker (consent workflow)",
)
def create_contact_request(
    worker_id: int,
    payload: LabourContactRequestIn,
    request: Request,
    db: Session = Depends(get_db),
):
    """Farmer requests contact. Phone number is NOT revealed until worker explicitly approves."""
    ip = _get_client_ip(request)
    try:
        req_obj = labour_svc.request_worker_contact(db, payload, ip_address=ip)
        return LabourContactRequestOut(
            id=req_obj.id,
            worker_id=req_obj.worker_id,
            job_id=req_obj.job_id,
            requester_name=req_obj.requester_name,
            masked_requester_phone=labour_svc.mask_phone_number(req_obj.requester_phone),
            unmasked_requester_phone=None,
            purpose=req_obj.purpose,
            farm_location=req_obj.farm_location,
            work_dates=req_obj.work_dates,
            message=req_obj.message,
            status=req_obj.status,
            approved_phone_revealed=req_obj.approved_phone_revealed,
            unmasked_worker_phone=None,
            whatsapp_url=getattr(req_obj, "whatsapp_url", None),
            expires_at=req_obj.expires_at,
            created_at=req_obj.created_at,
            resolved_at=req_obj.resolved_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/workers/{worker_id}/contact-requests",
    response_model=List[LabourContactRequestOut],
    summary="Worker views received contact requests",
)
def get_worker_contact_requests(
    worker_id: int,
    worker_phone: str = Query(..., description="Worker's registered mobile number"),
    db: Session = Depends(get_db),
):
    try:
        return labour_svc.list_worker_contact_requests(db, worker_id, worker_phone)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.patch(
    "/contact-requests/{request_id}",
    response_model=LabourContactRequestOut,
    summary="Worker approves or rejects contact request",
)
def resolve_contact_request(
    request_id: int,
    payload: ContactRequestResolutionIn,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)
    try:
        resolved = labour_svc.resolve_contact_request(
            db, request_id, payload.action, payload.worker_phone, ip_address=ip
        )
        return LabourContactRequestOut(
            id=resolved.id,
            worker_id=resolved.worker_id,
            job_id=resolved.job_id,
            requester_name=resolved.requester_name,
            masked_requester_phone=labour_svc.mask_phone_number(resolved.requester_phone),
            unmasked_requester_phone=resolved.requester_phone,
            purpose=resolved.purpose,
            farm_location=resolved.farm_location,
            work_dates=resolved.work_dates,
            message=resolved.message,
            status=resolved.status,
            approved_phone_revealed=resolved.approved_phone_revealed,
            unmasked_worker_phone=payload.worker_phone if resolved.status == "approved" else None,
            whatsapp_url=(
                f"https://wa.me/91{resolved.requester_phone.replace('+', '')[-10:]}?text=Namaste%20{resolved.requester_name}%2C%20I%20have%20accepted%20your%20KisaanBuddy%20inquiry%20(Ref%20%23KB-{resolved.id})."
                if resolved.status == "approved" else None
            ),
            expires_at=resolved.expires_at,
            created_at=resolved.created_at,
            resolved_at=resolved.resolved_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


# ===========================================================================
# Phase 7: Account Deletion (DPDP Act Compliance)
# ===========================================================================
@router.post(
    "/workers/delete",
    summary="Permanently scrub worker personal data pursuant to DPDP Act",
)
def delete_account(
    payload: AccountDeleteIn,
    request: Request,
    db: Session = Depends(get_db),
):
    if payload.confirmation_text.strip() != "DELETE MY ACCOUNT":
        raise HTTPException(status_code=400, detail="Confirmation text must be 'DELETE MY ACCOUNT'.")
    ip = _get_client_ip(request)
    success = labour_svc.delete_worker_account(db, payload, ip_address=ip)
    if not success:
        raise HTTPException(status_code=404, detail="Worker profile not found or already deleted.")
    return {"ok": True, "message": "Worker profile and personal identifiers permanently scrubbed."}


# ===========================================================================
# Phase 4: Farmer Job Posting & Applications
# ===========================================================================
@router.post(
    "/jobs",
    response_model=LabourJobPostOut,
    status_code=status.HTTP_201_CREATED,
    summary="Post a farm labour job (Farmer)",
)
def create_labour_job(
    payload: LabourJobPostIn,
    request: Request,
    db: Session = Depends(get_db),
):
    """Farmer posts a job requirement with comprehensive Phase 4 fields."""
    ip = _get_client_ip(request)
    try:
        # Also mirror to legacy jobs_service for backward compatibility
        try:
            legacy_in = LegacyJobPostIn(
                work_type="other" if payload.category_slug not in ("harvesting", "sowing", "weeding", "spraying", "tractor", "ploughing", "irrigation", "general") else payload.category_slug,  # type: ignore
                work_type_detail=payload.job_title,
                location={"district": payload.district, "state": payload.state, "village": payload.village, "lat": payload.lat, "lon": payload.lon},  # type: ignore
                workers_needed=payload.workers_needed,
                wage_amount=int(payload.wage_amount),
                wage_unit="per_day" if payload.wage_unit == "per_day" else "per_hour",  # type: ignore
                duration_days=payload.duration_days,
                start_date=payload.start_date,
                contact_name=payload.contact_name,
                contact_phone=payload.contact_phone,
                notes=payload.additional_instructions,
            )
            jobs_service.create_job(legacy_in)
        except Exception as e:
            log.warning("Legacy job mirror warning: %s", e)

        job = labour_svc.create_job_post(db, payload, ip_address=ip)
        # Format out
        jobs_out = labour_svc.list_job_posts(db, limit=1)
        for jo in jobs_out:
            if jo.id == job.id:
                return jo
        raise HTTPException(status_code=500, detail="Failed to retrieve created job.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/jobs",
    response_model=List[LabourJobPostOut],
    summary="List farm labour jobs with filters",
)
def list_jobs(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    category: Optional[str] = Query(None, alias="category_slug"),
    status_filter: str = Query("open", alias="status"),
    viewer_phone: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return labour_svc.list_job_posts(
        db,
        state=state,
        district=district,
        category_slug=category,
        status_filter=status_filter,
        viewer_phone=viewer_phone,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/jobs/{job_id}",
    response_model=LabourJobPostOut,
    summary="Get single job details",
)
def get_job(
    job_id: int,
    viewer_phone: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    from db.models import LabourJobPost
    job = db.query(LabourJobPost).filter(LabourJobPost.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    jobs_out = labour_svc.list_job_posts(db, limit=1000)
    for jo in jobs_out:
        if jo.id == job_id:
            return jo
    raise HTTPException(status_code=404, detail="Job not found.")


@router.post(
    "/jobs/{job_id}/apply",
    response_model=LabourJobApplicationOut,
    status_code=status.HTTP_201_CREATED,
    summary="Worker applies for a farm job",
)
def apply_for_job(
    job_id: int,
    payload: LabourJobApplicationIn,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)
    try:
        return labour_svc.apply_to_job(db, payload, job_id=job_id, ip_address=ip)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/jobs/{job_id}/applications",
    response_model=List[LabourJobApplicationOut],
    summary="Farmer views job applications",
)
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
):
    return labour_svc.list_job_applications(db, job_id)


@router.post(
    "/jobs/{job_id}/status",
    summary="Update job status (open / filled / cancelled)",
)
def update_job_status(
    job_id: int,
    new_status: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
):
    from db.models import LabourJobPost
    job = db.query(LabourJobPost).filter(LabourJobPost.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    job.status = new_status
    db.commit()
    return {"ok": True, "job_id": job.id, "status": job.status}


@router.delete(
    "/jobs/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a job",
)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    from db.models import LabourJobPost
    job = db.query(LabourJobPost).filter(LabourJobPost.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    db.delete(job)
    db.commit()


# ===========================================================================
# Phase 6: Official Wage Intelligence
# ===========================================================================
@router.get(
    "/wage-benchmarks",
    response_model=List[WageBenchmarkOut],
    summary="Official Labour Bureau & MGNREGA reported agricultural wage benchmarks",
)
def get_official_wage_benchmarks(
    state: Optional[str] = Query(None, description="State name (e.g. Punjab, Karnataka)"),
    activity: Optional[str] = Query(None, alias="activity_slug", description="Agricultural activity slug"),
    db: Session = Depends(get_db),
):
    """Returns official reported wage benchmarks from the Labour Bureau (WRRI) and MoRD (MGNREGA)."""
    return labour_svc.get_wage_benchmarks(db, state=state, activity_slug=activity)


@router.get(
    "/suggest-wage",
    response_model=WageSuggestion,
    summary="Fair-wage range for a work type (backward-compatible)",
)
def suggest_wage(
    work_type: WorkType = Query(..., description="Type of work."),
    state: Optional[str] = Query(None, description="Indian state name."),
    db: Session = Depends(get_db),
) -> WageSuggestion:
    # Check if we have an official benchmark for this state and work type
    benchmarks = labour_svc.get_wage_benchmarks(db, state=state, activity_slug=work_type)
    if benchmarks:
        b = benchmarks[0]
        avg = int(b.reported_wage_average)
        lo = int(round((b.reported_wage_female or avg * 0.85) / 10) * 10)
        hi = int(round((b.reported_wage_male or avg * 1.15) / 10) * 10)
        return WageSuggestion(
            work_type=work_type,
            state=state,
            suggested_min=lo,
            suggested_max=hi,
            wage_unit="per_day",
            note=f"Official benchmark: ₹{avg}/day reported in {b.survey_month} {b.survey_year} by {b.source_name}.",
        )
    return jobs_service.suggest_wage(work_type, state)


# ===========================================================================
# Phase 7: Reports, Moderation & Audit Trail
# ===========================================================================
@router.post(
    "/reports",
    response_model=LabourReportOut,
    status_code=status.HTTP_201_CREATED,
    summary="Report misleading listing, fraud, or abuse",
)
def report_listing(
    payload: LabourReportIn,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)
    return labour_svc.submit_labour_report(db, payload, ip_address=ip)


@router.get(
    "/admin/reports",
    response_model=List[LabourReportOut],
    summary="Admin: View reports",
)
def get_admin_reports(
    status_filter: Optional[str] = Query("pending_review", alias="status"),
    db: Session = Depends(get_db),
):
    return labour_svc.list_admin_reports(db, status_filter=status_filter)


@router.patch(
    "/admin/reports/{report_id}",
    response_model=LabourReportOut,
    summary="Admin: Moderate report",
)
def moderate_report(
    report_id: int,
    status_value: str = Query(..., description="investigated | dismissed | action_taken"),
    admin_notes: Optional[str] = Query(None),
    request: Request = None,  # type: ignore
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request) if request else "unknown"
    try:
        return labour_svc.moderate_labour_report(
            db, report_id, status_value, admin_notes=admin_notes, ip_address=ip
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/admin/audit-trail",
    summary="Admin: View labour audit trail",
)
def get_audit_trail(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return labour_svc.get_labour_audit_trail(db, limit=limit)


# ===========================================================================
# Interactive Onboarding Hub Demo Seeder (Real Registered FPO Data)
# ===========================================================================
@router.post(
    "/demo/seed",
    summary="Seed authentic registered FPO collectives and real farm job requirements",
)
def seed_demo_data(db: Session = Depends(get_db)):
    """Initializes 5 authentic SFAC/NABARD registered FPO custom hiring collectives

    across Karnataka, Punjab, Maharashtra, Andhra Pradesh, and Uttar Pradesh,
    paired with Labour Bureau rural wage benchmarks and genuine farm requirements.
    """
    return labour_svc.seed_demo_real_profiles(db)


# ===========================================================================
# Legacy Worker Search POST route for backward compatibility
# ===========================================================================
@router.post(
    "/search",
    response_model=LegacyJobSearchResponse,
    summary="Search jobs (worker side legacy API)",
)
def legacy_search_jobs(query: LegacyJobSearchQuery) -> LegacyJobSearchResponse:
    matches: List[JobMatch] = jobs_service.search_jobs(query)
    return LegacyJobSearchResponse(matches=matches, total=len(matches))
