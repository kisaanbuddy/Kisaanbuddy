"""AGMARKNET Mandi Price Ingestion Service.

Imports daily modal prices from data.gov.in API (resource 9ef84268-d588-465a-a308-a864a43d0070)
or fallback reference dataset. Strictly stores observations in MarketPriceRecord
tagged with official source attribution and date.
"""
import logging
import os
from datetime import datetime, date
from typing import Any, Dict, List, Optional
import httpx
from sqlalchemy.orm import Session

from core.config import settings
from db.models import ImportJob, ImportLog, ImportSource, MarketPriceRecord
from services.marketplace_import.initial_catalog_data import INITIAL_MARKET_PRICES

log = logging.getLogger("krishiai.marketplace.agmarknet")

AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"


class AgmarknetPriceImporter:
    """Imports AGMARKNET daily benchmark mandi prices."""

    def __init__(self, db: Session):
        self.db = db
        self.source_slug = "agmarknet_mandi"

    def create_job(self) -> ImportJob:
        job = ImportJob(
            source_slug=self.source_slug,
            target_type="market_prices",
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

    def import_benchmarks(self, records: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Import price records from list or fallback to INITIAL_MARKET_PRICES."""
        job = self.create_job()
        data_to_import = records if records is not None else INITIAL_MARKET_PRICES
        inserted = 0
        updated = 0
        skipped = 0

        try:
            for r in data_to_import:
                job.records_read += 1
                comm = (r.get("commodity") or "").strip()
                state = (r.get("state") or "").strip()
                district = (r.get("district") or "").strip()
                market = (r.get("market_center") or r.get("market") or "").strip()

                if not comm or not state or not market:
                    skipped += 1
                    continue

                arr_date = r.get("arrival_date")
                if isinstance(arr_date, str):
                    try:
                        arr_date = datetime.strptime(arr_date, "%Y-%m-%d").date()
                    except ValueError:
                        arr_date = date.today()
                elif not isinstance(arr_date, date):
                    arr_date = date.today()

                modal = float(r.get("modal_price") or 0.0)
                min_p = float(r.get("min_price") or modal)
                max_p = float(r.get("max_price") or modal)

                # Check if exact observation for commodity, market, and date already exists
                existing = (
                    self.db.query(MarketPriceRecord)
                    .filter(
                        MarketPriceRecord.commodity.ilike(comm),
                        MarketPriceRecord.market_center.ilike(market),
                        MarketPriceRecord.arrival_date == arr_date,
                    )
                    .first()
                )

                if existing:
                    existing.min_price = min_p
                    existing.max_price = max_p
                    existing.modal_price = modal
                    existing.variety = r.get("variety") or existing.variety
                    existing.data_retrieval_timestamp = datetime.utcnow()
                    updated += 1
                else:
                    rec = MarketPriceRecord(
                        commodity=comm,
                        variety=r.get("variety"),
                        state=state,
                        district=district,
                        market_center=market,
                        arrival_date=arr_date,
                        arrival_quantity=float(r.get("arrival_quantity") or 0.0) if r.get("arrival_quantity") else None,
                        arrival_unit=str(r.get("arrival_unit") or "Tonnes"),
                        min_price=min_p,
                        max_price=max_p,
                        modal_price=modal,
                        source_name=r.get("source_name") or "AGMARKNET / Directorate of Marketing & Inspection",
                        source_url=r.get("source_url") or "https://agmarknet.gov.in",
                        data_retrieval_timestamp=datetime.utcnow(),
                    )
                    self.db.add(rec)
                    inserted += 1

            self.db.commit()

            # Update Source
            source = self.db.query(ImportSource).filter(ImportSource.source_slug == self.source_slug).first()
            if source:
                source.records_count = self.db.query(MarketPriceRecord).count()
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
            log.exception("AGMARKNET import failed: %s", e)
            job.status = "failed"
            job.error_summary = str(e)
            job.completed_at = datetime.utcnow()
            self.db.commit()
            return {"job_id": job.id, "status": "failed", "error": str(e)}

    async def fetch_live_api(self, limit: int = 50) -> Dict[str, Any]:
        """Fetch live records from data.gov.in AGMARKNET API using configured API key."""
        api_key = settings.DATA_GOV_API_KEY or os.getenv("DATA_GOV_API_KEY", "")
        if not api_key:
            log.info("No DATA_GOV_API_KEY provided; using curated AGMARKNET benchmark data.")
            return self.import_benchmarks()

        try:
            params = {
                "api-key": api_key,
                "format": "json",
                "limit": limit,
            }
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.get(AGMARKNET_URL, params=params)
                if res.status_code != 200:
                    log.warning("data.gov.in returned %d; falling back to benchmark records.", res.status_code)
                    return self.import_benchmarks()

                data = res.json()
                raw_records = data.get("records", [])
                if not raw_records:
                    return self.import_benchmarks()

                normalized = []
                for row in raw_records:
                    try:
                        arr_d = row.get("arrival_date")
                        parsed_date = date.today()
                        if arr_d:
                            for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
                                try:
                                    parsed_date = datetime.strptime(arr_d, fmt).date()
                                    break
                                except ValueError:
                                    pass

                        normalized.append({
                            "commodity": row.get("commodity", "").strip(),
                            "variety": row.get("variety", "").strip() or None,
                            "state": row.get("state", "").strip(),
                            "district": row.get("district", "").strip(),
                            "market_center": row.get("market", "").strip(),
                            "arrival_date": parsed_date,
                            "min_price": float(row.get("min_price", 0)),
                            "max_price": float(row.get("max_price", 0)),
                            "modal_price": float(row.get("modal_price", 0)),
                            "source_name": "data.gov.in / AGMARKNET Live Feed",
                            "source_url": AGMARKNET_URL,
                        })
                    except Exception as parse_err:
                        log.debug("Skipping unparseable raw row: %s (%s)", row, parse_err)

                return self.import_benchmarks(normalized)
        except Exception as e:
            log.warning("Live AGMARKNET fetch failed (%s); fallback to benchmarks.", e)
            return self.import_benchmarks()
