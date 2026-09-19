"""API Endpoints for Async Job Submission and Polling."""
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.job_service import job_service

router = APIRouter()


class JobSubmitRequest(BaseModel):
    task_type: str = Field(..., description="Type of task to run (e.g. crop_analysis, tts_synthesis)")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Input parameters for the job")


class JobSubmitResponse(BaseModel):
    job_id: str
    status: str
    message: str = "Job created and queued"


class JobStatusResponse(BaseModel):
    job_id: str
    task_type: str
    status: str
    payload: Dict[str, Any]
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: float
    updated_at: float
    retries: int


@router.post("/submit", response_model=JobSubmitResponse, status_code=202)
def submit_job(req: JobSubmitRequest):
    """Submits a long-running task to the async queue and returns a job_id."""
    job_id = job_service.create_job(req.task_type, req.payload)
    return JobSubmitResponse(job_id=job_id, status="PENDING")


@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    """Polls status and result of a submitted job."""
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or expired")
    return JobStatusResponse(**job)
