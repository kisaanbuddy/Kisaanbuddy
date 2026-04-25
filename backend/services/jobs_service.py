"""
KrishiAI Worker Connect — JSON-file-backed job marketplace service.

Why a flat JSON file?
  * Zero infra: works without a DB.
  * Atomic writes via temp-file + os.replace().
  * Read-once into memory cache; fsync on every write.
  * Safe under FastAPI dev reload + occasional concurrent posts.

Public functions:
  * create_job(payload)      -> Job
  * get_job(job_id)          -> Job | None
  * list_jobs(...)           -> list[Job]
  * search_jobs(query)       -> list[JobMatch]
  * update_status(id, st)    -> Job | None
  * suggest_wage(...)        -> WageSuggestion
"""
from __future__ import annotations

import json
import math
import os
import tempfile
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from schemas.worker_connect import (
    Job,
    JobMatch,
    JobPostIn,
    JobSearchQuery,
    JobStatus,
    WageSuggestion,
    WageUnit,
    WorkType,
)

# ---------------------------------------------------------------------------
# File location — backend/data/jobs.json, resolved relative to backend/
# ---------------------------------------------------------------------------
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DATA_DIR = _BACKEND_DIR / "data"
_JOBS_FILE = _DATA_DIR / "jobs.json"
_DATA_DIR.mkdir(parents=True, exist_ok=True)
if not _JOBS_FILE.exists():
    _JOBS_FILE.write_text("[]", encoding="utf-8")

_LOCK = threading.RLock()


# ---------------------------------------------------------------------------
# Persistence helpers
# ---------------------------------------------------------------------------
def _load_raw() -> List[Dict[str, Any]]:
    try:
        with open(_JOBS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, list):
            return []
        return data
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_raw(items: List[Dict[str, Any]]) -> None:
    """Atomic write — tmp file + os.replace, so we never leave a half-written file."""
    fd, tmp_path = tempfile.mkstemp(prefix=".jobs.", suffix=".json", dir=str(_DATA_DIR))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2, default=str)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, _JOBS_FILE)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def _to_job(raw: Dict[str, Any]) -> Job:
    return Job.model_validate(raw)


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------
def create_job(payload: JobPostIn) -> Job:
    now = datetime.now(timezone.utc)
    job = Job(
        id=uuid.uuid4().hex[:12],
        status="open",
        created_at=now,
        updated_at=now,
        **payload.model_dump(),
    )
    with _LOCK:
        items = _load_raw()
        items.append(json.loads(job.model_dump_json()))
        _save_raw(items)
    return job


def get_job(job_id: str) -> Optional[Job]:
    with _LOCK:
        for raw in _load_raw():
            if raw.get("id") == job_id:
                return _to_job(raw)
    return None


def list_jobs(
    status: Optional[JobStatus] = "open",
    state: Optional[str] = None,
    district: Optional[str] = None,
    work_type: Optional[WorkType] = None,
    limit: int = 50,
) -> List[Job]:
    with _LOCK:
        items = _load_raw()
    out: List[Job] = []
    for raw in items:
        if status and raw.get("status") != status:
            continue
        loc = raw.get("location") or {}
        if state and (loc.get("state") or "").lower() != state.lower():
            continue
        if district and (loc.get("district") or "").lower() != district.lower():
            continue
        if work_type and raw.get("work_type") != work_type:
            continue
        out.append(_to_job(raw))
    # newest first
    out.sort(key=lambda j: j.created_at, reverse=True)
    return out[:limit]


def update_status(job_id: str, status: JobStatus) -> Optional[Job]:
    with _LOCK:
        items = _load_raw()
        for raw in items:
            if raw.get("id") == job_id:
                raw["status"] = status
                raw["updated_at"] = datetime.now(timezone.utc).isoformat()
                _save_raw(items)
                return _to_job(raw)
    return None


def delete_job(job_id: str) -> bool:
    with _LOCK:
        items = _load_raw()
        new = [r for r in items if r.get("id") != job_id]
        if len(new) == len(items):
            return False
        _save_raw(new)
    return True


# ---------------------------------------------------------------------------
# Distance + matching
# ---------------------------------------------------------------------------
def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(a))


def _recency_bonus(created_at: datetime) -> float:
    """1.0 if posted today, decays to ~0 after 14 days."""
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    age_days = max(0.0, (now - created_at).total_seconds() / 86400.0)
    return max(0.0, 1.0 - age_days / 14.0)


def search_jobs(query: JobSearchQuery) -> List[JobMatch]:
    base = list_jobs(
        status="open",
        state=query.state,
        district=query.district,
        work_type=query.work_type,
        limit=500,
    )

    matches: List[JobMatch] = []
    for job in base:
        if query.min_wage is not None and job.wage_amount < query.min_wage:
            continue

        distance_km: Optional[float] = None
        if (
            query.lat is not None
            and query.lon is not None
            and job.location.lat is not None
            and job.location.lon is not None
        ):
            distance_km = _haversine_km(
                query.lat, query.lon, job.location.lat, job.location.lon
            )
            if distance_km > query.radius_km:
                continue

        # Score: closeness (50%) + recency (30%) + skill match (20%).
        prox = (
            1.0 - min(1.0, (distance_km or 0) / max(query.radius_km, 1.0))
            if distance_km is not None
            else 0.6  # neutral score when distance unknown
        )
        rec = _recency_bonus(job.created_at)
        skill = 1.0 if (query.work_type and job.work_type == query.work_type) else 0.7
        score = round(0.5 * prox + 0.3 * rec + 0.2 * skill, 3)

        matches.append(
            JobMatch(
                job=job,
                distance_km=round(distance_km, 1) if distance_km is not None else None,
                match_score=score,
            )
        )

    matches.sort(key=lambda m: m.match_score, reverse=True)
    return matches[: query.limit]


# ---------------------------------------------------------------------------
# Fair wage suggestions — rough Indian rural averages, 2025
# ---------------------------------------------------------------------------
# Numbers chosen from public NREGA / state minimum wage / mandi labour data.
# Conservative ranges; UI labels these as "guidance, not guaranteed".
_WAGE_TABLE: Dict[WorkType, Dict[str, int]] = {
    "harvesting":   {"min": 400, "max": 650},
    "sowing":       {"min": 350, "max": 550},
    "weeding":      {"min": 300, "max": 500},
    "spraying":     {"min": 400, "max": 600},
    "tractor":      {"min": 600, "max": 1200},   # incl. fuel often extra
    "ploughing":    {"min": 500, "max": 900},
    "irrigation":   {"min": 350, "max": 550},
    "general":      {"min": 300, "max": 500},
    "transport":    {"min": 400, "max": 700},
    "post_harvest": {"min": 350, "max": 550},
    "other":        {"min": 300, "max": 600},
}

# Light per-state multipliers (cost-of-labour heuristic).
_STATE_MULT: Dict[str, float] = {
    "punjab": 1.20, "haryana": 1.20, "kerala": 1.30,
    "tamil nadu": 1.10, "karnataka": 1.05, "maharashtra": 1.10,
    "gujarat": 1.05, "andhra pradesh": 1.00, "telangana": 1.00,
    "uttar pradesh": 0.85, "bihar": 0.80, "madhya pradesh": 0.85,
    "rajasthan": 0.90, "odisha": 0.85, "jharkhand": 0.85,
    "west bengal": 0.90, "chhattisgarh": 0.85, "assam": 0.85,
}


def suggest_wage(work_type: WorkType, state: Optional[str] = None) -> WageSuggestion:
    base = _WAGE_TABLE.get(work_type, _WAGE_TABLE["other"])
    mult = _STATE_MULT.get((state or "").strip().lower(), 1.0)
    lo = int(round(base["min"] * mult / 10) * 10)
    hi = int(round(base["max"] * mult / 10) * 10)
    note = (
        "Indicative range based on common rural wages — actual rate depends on "
        "season, urgency, and worker skill. Workers may negotiate."
    )
    return WageSuggestion(
        work_type=work_type,
        state=state,
        suggested_min=lo,
        suggested_max=hi,
        wage_unit="per_day",
        note=note,
    )
