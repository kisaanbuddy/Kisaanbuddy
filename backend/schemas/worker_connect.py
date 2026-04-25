"""
Worker Connect schemas — KrishiAI rural job marketplace.

These models power both:
  * REST routes  (backend/api/worker_connect.py)
  * Chat tools   (backend/services/chat/tools.py — post_job / search_jobs)

Storage: JSON file on disk (backend/data/jobs.json) — see services/jobs.py.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


WorkType = Literal[
    "harvesting",
    "sowing",
    "weeding",
    "spraying",       # pesticide / fertilizer spraying
    "tractor",        # tractor driving
    "ploughing",
    "irrigation",
    "general",        # general farm labour
    "transport",      # crop loading / transport
    "post_harvest",   # threshing / cleaning / packaging
    "other",
]

WageUnit = Literal["per_day", "per_hour", "per_task"]
JobStatus = Literal["open", "filled", "closed"]


# --------- Common location block --------------------------------------------
class JobLocation(BaseModel):
    village: Optional[str] = Field(None, examples=["Kunigal"])
    district: str = Field(..., examples=["Tumkur"])
    state: str = Field(..., examples=["Karnataka"])
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lon: Optional[float] = Field(None, ge=-180, le=180)

    def label(self) -> str:
        parts = [p for p in (self.village, self.district, self.state) if p]
        return ", ".join(parts)


# --------- Posting (farmer side) --------------------------------------------
class JobPostIn(BaseModel):
    work_type: WorkType = Field(..., description="What kind of work it is.")
    work_type_detail: Optional[str] = Field(
        None,
        max_length=200,
        description="Free text — e.g. 'paddy harvesting + threshing'.",
    )
    location: JobLocation
    workers_needed: int = Field(..., ge=1, le=200)
    wage_amount: int = Field(..., ge=50, le=10000, description="Rupees, integer.")
    wage_unit: WageUnit = "per_day"
    duration_days: int = Field(1, ge=1, le=60)
    start_date: Optional[str] = Field(
        None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="ISO date 'YYYY-MM-DD'. Optional.",
    )
    contact_name: str = Field(..., min_length=2, max_length=80)
    contact_phone: str = Field(..., min_length=7, max_length=20)
    notes: Optional[str] = Field(None, max_length=500)
    language: Literal["auto", "en", "hi", "kn"] = "auto"

    @field_validator("contact_phone")
    @classmethod
    def _clean_phone(cls, v: str) -> str:
        # strip spaces / hyphens / parens
        cleaned = "".join(ch for ch in v if ch.isdigit() or ch == "+")
        if len(cleaned) < 7:
            raise ValueError("Phone number looks too short")
        return cleaned


class Job(JobPostIn):
    """A persisted job — what JSON storage stores and what GET endpoints return."""
    id: str
    status: JobStatus = "open"
    created_at: datetime
    updated_at: datetime


class JobOut(Job):
    """Public-facing view of a job (currently identical to Job)."""
    pass


# --------- Search (worker side) ---------------------------------------------
class JobSearchQuery(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    work_type: Optional[WorkType] = None
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lon: Optional[float] = Field(None, ge=-180, le=180)
    radius_km: float = Field(50.0, gt=0, le=500)
    min_wage: Optional[int] = Field(None, ge=0)
    limit: int = Field(20, ge=1, le=100)


class JobMatch(BaseModel):
    job: JobOut
    distance_km: Optional[float] = Field(
        None, description="Crow-flies distance from worker (if lat/lon provided)."
    )
    match_score: float = Field(
        ...,
        description="0..1 — higher means better fit (closer, on-skill, recent).",
    )


class JobSearchResponse(BaseModel):
    matches: List[JobMatch]
    total: int


# --------- Fair-wage suggestion ---------------------------------------------
class WageSuggestion(BaseModel):
    work_type: WorkType
    state: Optional[str]
    suggested_min: int
    suggested_max: int
    wage_unit: WageUnit
    note: str
