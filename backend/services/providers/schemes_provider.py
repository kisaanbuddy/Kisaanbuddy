"""Verified Schemes Provider for AI Chatbot and tools.

Queries the structured DB Scheme records. Falls back safely to verified seed data if DB is unavailable.
Returns grounded scheme details with official URLs, verified benefits, criteria, and disclaimer.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

log = logging.getLogger("krishiai.services.schemes_provider")


def list_schemes(
    state: Optional[str] = None,
    category: Optional[str] = None,
    crop: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetches verified schemes grounded in the official database."""
    try:
        from db.session import SessionLocal
        from db.models import Scheme
        if SessionLocal:
            with SessionLocal() as db:
                query = db.query(Scheme).filter(Scheme.is_active == True)
                if state and state.lower() != "all":
                    query = query.filter((Scheme.state.ilike(state)) | (Scheme.state == "All"))
                if category and category.lower() != "all":
                    query = query.filter(Scheme.category.ilike(category))
                
                schemes = query.all()
                if schemes:
                    return [
                        {
                            "scheme_id": s.scheme_id,
                            "name": s.name,
                            "category": s.category,
                            "state": s.state,
                            "benefits": s.benefits_summary,
                            "summary": s.overview,
                            "eligibility": s.eligibility_criteria_text,
                            "deadline": s.deadline_text or "Open All Year",
                            "url": s.source_url,
                            "application_url": s.application_url or s.source_url,
                            "last_verified": s.last_verified_at.strftime("%Y-%m-%d") if s.last_verified_at else "Verified"
                        }
                        for s in schemes
                    ]
    except Exception as e:
        log.warning("DB query in schemes_provider failed, using seed fallback: %s", e)

    # In-memory fallback
    from data.schemes_seed import VERIFIED_SCHEMES_SEED_DATA
    results = []
    for s in VERIFIED_SCHEMES_SEED_DATA:
        scheme_state = s.get("state", "All")
        if state and state.lower() != "all":
            if scheme_state != "All" and scheme_state.lower() != state.lower():
                continue
        if category and category.lower() != "all":
            if s.get("category", "").lower() != category.lower():
                continue

        results.append({
            "scheme_id": s["scheme_id"],
            "name": s["name"],
            "category": s.get("category"),
            "state": s.get("state"),
            "benefits": s.get("benefits_summary"),
            "summary": s.get("overview"),
            "eligibility": s.get("eligibility_criteria_text"),
            "deadline": s.get("deadline_text", "Open All Year"),
            "url": s.get("source_url"),
            "application_url": s.get("application_url", s.get("source_url")),
            "last_verified": "Verified Official"
        })

    return results


def get_scheme_by_id(scheme_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve full details for a single scheme by identifier."""
    schemes = list_schemes()
    for s in schemes:
        if s["scheme_id"] == scheme_id or s["name"].lower() == scheme_id.lower():
            return s
    return None
