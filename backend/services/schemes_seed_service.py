"""Seeding and verification utility for government schemes."""
from __future__ import annotations

import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from db.models import Scheme
from data.schemes_seed import VERIFIED_SCHEMES_SEED_DATA

log = logging.getLogger("krishiai.schemes_seed")


def seed_verified_schemes(db: Session) -> int:
    """Inserts or updates verified schemes from the curated official dataset."""
    seeded_count = 0
    now = datetime.utcnow()

    for item in VERIFIED_SCHEMES_SEED_DATA:
        scheme_id = item["scheme_id"]
        existing = db.query(Scheme).filter(Scheme.scheme_id == scheme_id).first()

        rules_json = json.dumps(item.get("eligibility_rules", {}), ensure_ascii=False)
        docs_json = json.dumps(item.get("required_documents", []), ensure_ascii=False)
        steps_json = json.dumps(item.get("application_steps", []), ensure_ascii=False)
        helpline_json = json.dumps(item.get("helpline_details", {}), ensure_ascii=False)
        faqs_json = json.dumps(item.get("faqs", []), ensure_ascii=False)

        if not existing:
            scheme = Scheme(
                scheme_id=scheme_id,
                name=item["name"],
                short_name=item.get("short_name"),
                jurisdiction=item.get("jurisdiction", "Central"),
                state=item.get("state", "All"),
                department=item.get("department"),
                category=item.get("category", "other"),
                overview=item["overview"],
                benefits_summary=item["benefits_summary"],
                benefits_details=item.get("benefits_details"),
                eligibility_criteria_text=item["eligibility_criteria_text"],
                eligibility_rules_json=rules_json,
                required_documents_json=docs_json,
                application_steps_json=steps_json,
                source_url=item["source_url"],
                application_url=item.get("application_url"),
                application_window_status=item.get("application_window_status", "open_all_year"),
                application_window_start=item.get("application_window_start"),
                application_deadline=item.get("application_deadline"),
                deadline_text=item.get("deadline_text"),
                helpline_details=helpline_json,
                faqs_json=faqs_json,
                verification_status=item.get("verification_status", "verified_official"),
                data_source=item.get("data_source", "Official Portal / Gazette"),
                is_active=item.get("is_active", True),
                last_verified_at=now,
                created_at=now,
                updated_at=now
            )
            db.add(scheme)
            seeded_count += 1
        else:
            # Update fields while preserving active status unless changed
            existing.name = item["name"]
            existing.short_name = item.get("short_name")
            existing.jurisdiction = item.get("jurisdiction", "Central")
            existing.state = item.get("state", "All")
            existing.department = item.get("department")
            existing.category = item.get("category", "other")
            existing.overview = item["overview"]
            existing.benefits_summary = item["benefits_summary"]
            existing.benefits_details = item.get("benefits_details")
            existing.eligibility_criteria_text = item["eligibility_criteria_text"]
            existing.eligibility_rules_json = rules_json
            existing.required_documents_json = docs_json
            existing.application_steps_json = steps_json
            existing.source_url = item["source_url"]
            existing.application_url = item.get("application_url")
            existing.application_window_status = item.get("application_window_status", "open_all_year")
            existing.deadline_text = item.get("deadline_text")
            existing.helpline_details = helpline_json
            existing.faqs_json = faqs_json
            existing.data_source = item.get("data_source", "Official Portal / Gazette")
            existing.last_verified_at = now
            existing.updated_at = now

    db.commit()
    log.info("Seeded/verified %d government schemes into database.", len(VERIFIED_SCHEMES_SEED_DATA))
    return seeded_count
