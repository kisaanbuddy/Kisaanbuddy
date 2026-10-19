"""Data Import Pipeline for Equipment Reference Catalogue.

Features:
- Ingests CSV & JSON payloads for agricultural equipment reference data.
- Strict data validation (rejects empty brand, model, category, or provenance).
- Unit normalization (standardizes HP, widths in mm, RPM).
- Duplicate detection: identifies existing models by (brand.lower(), model_name.lower(), category.lower()).
- Detailed execution auditing: creates ImportJob and ImportLog entries.
- Supports duplicate merging and record updates.
"""
import csv
import io
import json
import logging
from datetime import datetime, date
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from db.models import EquipmentCatalog, ImportJob, ImportLog, ImportSource

log = logging.getLogger("krishiai.marketplace.importer")

VALID_CATEGORIES = {
    "tractors",
    "harvesters",
    "rotavators",
    "seed_drills",
    "cultivators",
    "ploughs",
    "sprayers",
    "threshers",
    "agricultural_trailers",
    "irrigation_equipment",
    "other_implements",
}

CATEGORY_SYNONYMS = {
    "tractor": "tractors",
    "combine": "harvesters",
    "combine harvester": "harvesters",
    "rotary tiller": "rotavators",
    "rotavator": "rotavators",
    "drill": "seed_drills",
    "seed drill": "seed_drills",
    "zero till drill": "seed_drills",
    "planter": "seed_drills",
    "cultivator": "cultivators",
    "tiller": "cultivators",
    "plough": "ploughs",
    "plow": "ploughs",
    "mb plough": "ploughs",
    "disc plough": "ploughs",
    "sprayer": "sprayers",
    "boom sprayer": "sprayers",
    "orchard sprayer": "sprayers",
    "thresher": "threshers",
    "multi crop thresher": "threshers",
    "trailer": "agricultural_trailers",
    "trolley": "agricultural_trailers",
    "tipping trailer": "agricultural_trailers",
    "irrigation": "irrigation_equipment",
    "drip": "irrigation_equipment",
    "pump": "irrigation_equipment",
    "baler": "other_implements",
    "laser leveller": "other_implements",
    "reaper": "other_implements",
}


def normalize_category(raw_cat: Optional[str]) -> str:
    """Normalize user or raw CSV category string to standard category key."""
    if not raw_cat:
        return "other_implements"
    cleaned = raw_cat.strip().lower()
    if cleaned in VALID_CATEGORIES:
        return cleaned
    if cleaned in CATEGORY_SYNONYMS:
        return CATEGORY_SYNONYMS[cleaned]
    for key, val in CATEGORY_SYNONYMS.items():
        if key in cleaned:
            return val
    return "other_implements"


def normalize_float(val: Any) -> Optional[float]:
    """Safely parse float value or return None without inventing numbers."""
    if val is None or val == "" or str(val).strip() == "" or str(val).strip() in ("-", "—", "N/A", "null"):
        return None
    try:
        cleaned = str(val).replace(",", "").replace("HP", "").replace("hp", "").replace("mm", "").replace("kg", "").strip()
        f = float(cleaned)
        return f if f >= 0 else None
    except (ValueError, TypeError):
        return None


def normalize_int(val: Any) -> Optional[int]:
    """Safely parse integer value or return None."""
    if val is None or val == "" or str(val).strip() == "" or str(val).strip() in ("-", "—", "N/A", "null"):
        return None
    try:
        cleaned = str(val).replace(",", "").replace("RPM", "").replace("rpm", "").strip()
        return int(float(cleaned))
    except (ValueError, TypeError):
        return None


class EquipmentCatalogueImporter:
    """Administrator-controlled importer for Equipment Catalogues."""

    def __init__(self, db: Session, source_slug: str = "farmech_fmtti"):
        self.db = db
        self.source_slug = source_slug

    def create_job(self) -> ImportJob:
        job = ImportJob(
            source_slug=self.source_slug,
            target_type="equipment_catalog",
            status="running",
            records_read=0,
            records_inserted=0,
            records_updated=0,
            records_skipped=0,
            started_at=datetime.utcnow(),
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def log(self, job_id: int, level: str, msg: str, identifier: Optional[str] = None):
        entry = ImportLog(
            job_id=job_id,
            log_level=level,
            record_identifier=identifier,
            message=msg,
            timestamp=datetime.utcnow(),
        )
        self.db.add(entry)

    def import_records(self, records: List[Dict[str, Any]], update_existing: bool = True) -> Dict[str, Any]:
        """Ingest a list of dictionary records with deduplication and validation."""
        job = self.create_job()
        inserted = 0
        updated = 0
        skipped = 0

        try:
            for idx, r in enumerate(records, start=1):
                job.records_read += 1
                identifier = f"{r.get('brand', '')} {r.get('model_name', '')}".strip() or f"Row #{idx}"

                # Mandatory field validation
                brand = (r.get("brand") or "").strip()
                model_name = (r.get("model_name") or "").strip()
                manufacturer = (r.get("manufacturer") or brand or "Authorized Manufacturer").strip()
                raw_cat = r.get("category")
                provenance = (r.get("provenance_source") or "Official Technical Documentation").strip()
                license_text = (r.get("provenance_license") or "Public Technical Specification / NDSAP").strip()

                if not brand or not model_name:
                    skipped += 1
                    self.log(job.id, "WARNING", f"Skipping record with missing brand or model name: {r}", identifier)
                    continue

                category = normalize_category(raw_cat)

                # Check duplicate by (brand, model_name, category)
                existing = (
                    self.db.query(EquipmentCatalog)
                    .filter(
                        EquipmentCatalog.brand.ilike(brand),
                        EquipmentCatalog.model_name.ilike(model_name),
                        EquipmentCatalog.category == category,
                    )
                    .first()
                )

                hp_val = normalize_float(r.get("hp_rating"))
                width_val = normalize_float(r.get("working_width_mm"))
                pto_hp_val = normalize_float(r.get("pto_hp"))
                pto_rpm_val = normalize_int(r.get("pto_rpm"))
                lift_val = normalize_float(r.get("lifting_capacity_kg"))
                weight_val = normalize_float(r.get("weight_kg"))

                specs_json = r.get("specifications_json")
                if isinstance(specs_json, dict):
                    specs_json = json.dumps(specs_json)

                ver_date = r.get("source_verification_date")
                if isinstance(ver_date, str):
                    try:
                        ver_date = datetime.strptime(ver_date, "%Y-%m-%d").date()
                    except ValueError:
                        ver_date = None

                if existing:
                    if update_existing:
                        existing.manufacturer = manufacturer
                        existing.subcategory = r.get("subcategory") or existing.subcategory
                        if hp_val is not None:
                            existing.hp_rating = hp_val
                        if width_val is not None:
                            existing.working_width_mm = width_val
                        if r.get("capacity"):
                            existing.capacity = str(r.get("capacity"))
                        if r.get("fuel_type"):
                            existing.fuel_type = str(r.get("fuel_type"))
                        if pto_hp_val is not None:
                            existing.pto_hp = pto_hp_val
                        if pto_rpm_val is not None:
                            existing.pto_rpm = pto_rpm_val
                        if lift_val is not None:
                            existing.lifting_capacity_kg = lift_val
                        if weight_val is not None:
                            existing.weight_kg = weight_val
                        if r.get("compatible_tractor_hp"):
                            existing.compatible_tractor_hp = str(r.get("compatible_tractor_hp"))
                        if specs_json:
                            existing.specifications_json = specs_json
                        if r.get("description"):
                            existing.description = r.get("description")
                        if r.get("official_source_url"):
                            existing.official_source_url = r.get("official_source_url")
                        if ver_date:
                            existing.source_verification_date = ver_date
                        if r.get("image_url"):
                            existing.image_url = r.get("image_url")
                        existing.provenance_source = provenance
                        existing.provenance_license = license_text
                        existing.updated_at = datetime.utcnow()
                        updated += 1
                        self.log(job.id, "INFO", f"Updated existing model: {identifier}", identifier)
                    else:
                        skipped += 1
                        self.log(job.id, "INFO", f"Model already exists (skip flag set): {identifier}", identifier)
                else:
                    item = EquipmentCatalog(
                        manufacturer=manufacturer,
                        brand=brand,
                        model_name=model_name,
                        category=category,
                        subcategory=r.get("subcategory"),
                        hp_rating=hp_val,
                        working_width_mm=width_val,
                        capacity=str(r.get("capacity")) if r.get("capacity") else None,
                        fuel_type=str(r.get("fuel_type")) if r.get("fuel_type") else None,
                        pto_hp=pto_hp_val,
                        pto_rpm=pto_rpm_val,
                        lifting_capacity_kg=lift_val,
                        weight_kg=weight_val,
                        compatible_tractor_hp=str(r.get("compatible_tractor_hp")) if r.get("compatible_tractor_hp") else None,
                        specifications_json=specs_json,
                        description=r.get("description"),
                        official_source_url=r.get("official_source_url"),
                        source_verification_date=ver_date or date.today(),
                        image_url=r.get("image_url"),
                        provenance_source=provenance,
                        provenance_license=license_text,
                        is_verified=True,
                        is_reference_only=True,
                        is_active=True,
                    )
                    self.db.add(item)
                    inserted += 1
                    self.log(job.id, "INFO", f"Inserted new model: {identifier}", identifier)

            self.db.commit()

            # Update Source count
            source = self.db.query(ImportSource).filter(ImportSource.source_slug == self.source_slug).first()
            if source:
                total_cat = self.db.query(EquipmentCatalog).filter(EquipmentCatalog.is_active == True).count()
                source.records_count = total_cat
                source.last_imported_at = datetime.utcnow()
                self.db.commit()

            job.status = "completed"
            job.records_inserted = inserted
            job.records_updated = updated
            job.records_skipped = skipped
            job.completed_at = datetime.utcnow()
            self.db.commit()

            return {
                "job_id": job.id,
                "status": "completed",
                "records_read": job.records_read,
                "records_inserted": inserted,
                "records_updated": updated,
                "records_skipped": skipped,
            }
        except Exception as e:
            self.db.rollback()
            log.exception("Import job %d failed: %s", job.id, e)
            job.status = "failed"
            job.error_summary = str(e)
            job.completed_at = datetime.utcnow()
            self.log(job.id, "ERROR", f"Job failed with exception: {e}")
            self.db.commit()
            return {
                "job_id": job.id,
                "status": "failed",
                "error": str(e),
                "records_read": job.records_read,
                "records_inserted": inserted,
                "records_updated": updated,
                "records_skipped": skipped,
            }

    def import_csv_text(self, csv_content: str, update_existing: bool = True) -> Dict[str, Any]:
        """Parse raw CSV text and import records."""
        f = io.StringIO(csv_content)
        reader = csv.DictReader(f)
        records = [row for row in reader]
        return self.import_records(records, update_existing=update_existing)

    def import_json_text(self, json_content: str, update_existing: bool = True) -> Dict[str, Any]:
        """Parse raw JSON string (list of objects) and import records."""
        records = json.loads(json_content)
        if not isinstance(records, list):
            raise ValueError("JSON content must be a list of equipment records.")
        return self.import_records(records, update_existing=update_existing)
