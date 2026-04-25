"""
KrishiAI Worker Connect — REST API.

Mounted at /api/worker-connect (see backend/main.py).

Endpoints:
  POST   /jobs                  Create a job post (farmer side)
  GET    /jobs                  List open jobs with optional filters
  GET    /jobs/{id}             Fetch a single job
  POST   /jobs/{id}/status      Update status (open / filled / closed)
  DELETE /jobs/{id}             Remove a job (poster only — phone-locked in v2)
  POST   /search                Full search with distance + scoring (worker side)
  GET    /suggest-wage          Fair-wage hint for a work type / state

Storage: JSON file (services/jobs_service.py).
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from schemas.worker_connect import (
    Job,
    JobMatch,
    JobOut,
    JobPostIn,
    JobSearchQuery,
    JobSearchResponse,
    JobStatus,
    WageSuggestion,
    WorkType,
)
from services import jobs_service

router = APIRouter()


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------
@router.post(
    "/jobs",
    response_model=JobOut,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new job (farmer)",
)
def create_job(payload: JobPostIn) -> Job:
    return jobs_service.create_job(payload)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------
@router.get(
    "/jobs",
    response_model=List[JobOut],
    summary="List open jobs (simple filters)",
)
def list_jobs(
    state: Optional[str] = None,
    district: Optional[str] = None,
    work_type: Optional[WorkType] = None,
    status_filter: JobStatus = Query("open", alias="status"),
    limit: int = Query(50, ge=1, le=200),
) -> List[Job]:
    return jobs_service.list_jobs(
        status=status_filter,
        state=state,
        district=district,
        work_type=work_type,
        limit=limit,
    )


@router.get(
    "/jobs/{job_id}",
    response_model=JobOut,
    summary="Get a single job by ID",
)
def get_job(job_id: str) -> Job:
    job = jobs_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# ---------------------------------------------------------------------------
# Mutate
# ---------------------------------------------------------------------------
@router.post(
    "/jobs/{job_id}/status",
    response_model=JobOut,
    summary="Update job status",
)
def update_status(job_id: str, new_status: JobStatus = Query(..., alias="status")) -> Job:
    job = jobs_service.update_status(job_id, new_status)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete(
    "/jobs/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a job",
)
def delete_job(job_id: str) -> None:
    if not jobs_service.delete_job(job_id):
        raise HTTPException(status_code=404, detail="Job not found")


# ---------------------------------------------------------------------------
# Search (worker side)
# ---------------------------------------------------------------------------
@router.post(
    "/search",
    response_model=JobSearchResponse,
    summary="Search jobs by location / skill / wage",
)
def search_jobs(query: JobSearchQuery) -> JobSearchResponse:
    matches: List[JobMatch] = jobs_service.search_jobs(query)
    return JobSearchResponse(matches=matches, total=len(matches))


# ---------------------------------------------------------------------------
# Wage hint
# ---------------------------------------------------------------------------
@router.get(
    "/suggest-wage",
    response_model=WageSuggestion,
    summary="Fair-wage range for a work type",
)
def suggest_wage(
    work_type: WorkType = Query(..., description="Type of work."),
    state: Optional[str] = Query(None, description="Indian state name."),
) -> WageSuggestion:
    return jobs_service.suggest_wage(work_type, state)
