"""MachinePoint agricultural machinery importer for KisaanBuddy Equipment Catalogue.

Source collection:
https://machinepoint.in/collections/agriculture-farming-machinery
Feed:
https://machinepoint.in/collections/agriculture-farming-machinery/products.json?limit=250

Features:
- Imports authentic product name, brand, model, price, image CDN, and category.
- Extracts product-specific URL: https://machinepoint.in/products/{handle}
- Intelligent categorization into KisaanBuddy 11 equipment categories.
- Tracks provenance and supplier attribution ("MachinePoint").
- Duplicate detection and incremental updates.
"""
from __future__ import annotations

import html
import json
import logging
import re
import urllib.request
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from db.models import EquipmentCatalog, ImportJob, ImportLog, ImportSource
from services.marketplace_import.equipment_importer import normalize_float

log = logging.getLogger("krishiai.marketplace.machinepoint")

COLLECTION_API_URL = "https://machinepoint.in/collections/agriculture-farming-machinery/products.json?limit=250"
COLLECTION_PAGE_URL = "https://machinepoint.in/collections/agriculture-farming-machinery"


def clean_html_description(raw_html: Optional[str]) -> str:
    """Strip HTML tags and unescape text entities."""
    if not raw_html:
        return ""
    text = re.sub(r"<[^>]+>", " ", raw_html)
    text = html.unescape(text)
    # Collapse multiple spaces and newlines
    text = re.sub(r"\s+", " ", text).strip()
    return text[:600] if len(text) > 600 else text


def extract_hp(title: str, body_text: str) -> Optional[float]:
    """Extract horsepower rating from title or description if present."""
    combined = f"{title} {body_text}"
    m = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:HP|hp|Hp)\b", combined)
    if m:
        try:
            val = float(m.group(1))
            if 0 < val <= 500:
                return val
        except ValueError:
            pass
    return None


def map_machinepoint_category(product_type: str, title: str, tags: List[str]) -> str:
    """Map MachinePoint product metadata into KisaanBuddy's 11 equipment categories."""
    p_type = (product_type or "").strip().lower()
    t_lower = (title or "").lower()
    all_tags = " ".join([t.lower() for t in tags])
    haystack = f"{p_type} {t_lower} {all_tags}"

    # 1. Sprayers
    if any(k in haystack for k in ["sprayer", "knapsack", "spray pump", "mist blower", "fogging", "htp pump", "pressure sprayer"]):
        return "sprayers"

    # 2. Seed drills / Planters / Transplanters
    if any(k in haystack for k in ["seeder", "seed drill", "transplanter", "planter", "push seeder", "paddy planting"]):
        return "seed_drills"

    # 3. Cultivators / Weeders / Tillers
    if any(k in haystack for k in ["power weeder", "weeder", "power tiller", "cultivator", "intercultivation", "soil loosening"]):
        return "cultivators"

    # 4. Harvesters / Reapers
    if any(k in haystack for k in ["reaper", "harvester", "combine", "kamco", "crop harvester"]):
        return "harvesters"

    # 5. Threshers / Chaff Cutters / Winnowers
    if any(k in haystack for k in ["chaff cutter", "thresher", "sheller", "winnower", "fodder cutting", "maize thresher", "corn thresher", "grader machine"]):
        return "threshers"

    # 6. Irrigation equipment / Water Pumps
    if any(k in haystack for k in ["water pump", "irrigation", "hose reel", "hose pipe", "delivery pipe", "sprinkler", "drip"]):
        return "irrigation_equipment"

    # 7. Rotavators
    if any(k in haystack for k in ["rotavator", "rotary tiller"]):
        return "rotavators"

    # 8. Ploughs
    if any(k in haystack for k in ["plough", "plow", "mould board"]):
        return "ploughs"

    # 9. Trailers
    if any(k in haystack for k in ["trailer", "trolley", "tipper"]):
        return "agricultural_trailers"

    # 10. Tractors
    if "tractor" in haystack and not any(k in haystack for k in ["attached", "attachment", "mounted", "trailer"]):
        return "tractors"

    # 11. Other Implements (Brush cutter, earth auger, wood chipper, pellet feed, banana tree cutter, chainsaw)
    return "other_implements"


class MachinePointImporter:
    """Fetches and imports MachinePoint agricultural equipment into EquipmentCatalog."""

    def __init__(self, db: Session, timeout: int = 15):
        self.db = db
        self.timeout = timeout
        self.source_slug = "machinepoint"

    def fetch_products(self) -> List[Dict[str, Any]]:
        """Fetch products directly from MachinePoint's Shopify JSON API."""
        req = urllib.request.Request(
            COLLECTION_API_URL,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("products", [])

    def import_all(self, update_existing: bool = True) -> Dict[str, Any]:
        """Import all agricultural products from MachinePoint."""
        # Ensure ImportSource exists
        source = self.db.query(ImportSource).filter(ImportSource.source_slug == self.source_slug).first()
        if not source:
            source = ImportSource(
                source_name="MachinePoint Agricultural Machinery Collection",
                source_slug=self.source_slug,
                source_type="supplier_feed",
                base_url=COLLECTION_PAGE_URL,
                auth_type="none",
                commercial_reuse_terms="Public product catalogue feed with direct supplier product referral links",
                update_frequency="weekly",
                is_active=True,
            )
            self.db.add(source)
            self.db.commit()
            self.db.refresh(source)

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

        inserted = 0
        updated = 0
        skipped = 0

        try:
            products = self.fetch_products()
            job.records_read = len(products)

            for p in products:
                title = (p.get("title") or "").strip()
                handle = (p.get("handle") or "").strip()
                if not title or not handle:
                    skipped += 1
                    continue

                # Supplier product URL
                official_url = f"https://machinepoint.in/products/{handle}"

                # Vendor / Brand
                raw_vendor = (p.get("vendor") or "Machine Point").strip()
                brand = raw_vendor.upper() if raw_vendor.lower() in ("gt shakti", "gt-shakti", "b-impex", "sun") else raw_vendor.title()
                if brand in ("Machinepoint_24Yards", "Machinepoint"):
                    brand = "Machine Point"

                # Category
                p_type = p.get("product_type", "")
                tags = p.get("tags", [])
                category = map_machinepoint_category(p_type, title, tags)

                # Verified Price from variants
                variants = p.get("variants", [])
                price = None
                if variants and variants[0].get("price"):
                    try:
                        price = float(variants[0]["price"])
                    except (ValueError, TypeError):
                        price = None

                # Primary Image
                images = p.get("images", [])
                image_url = images[0].get("src") if images else None

                # Description & Horsepower
                body_html = p.get("body_html", "")
                clean_desc = clean_html_description(body_html)
                hp = extract_hp(title, clean_desc)

                # Subcategory / Product Type display
                subcategory = p_type.title() if p_type else category.replace("_", " ").title()

                # Deduplication by official_source_url OR (brand, model_name, category)
                existing = (
                    self.db.query(EquipmentCatalog)
                    .filter(
                        (EquipmentCatalog.official_source_url == official_url) |
                        (
                            (EquipmentCatalog.brand == brand) &
                            (EquipmentCatalog.model_name == title) &
                            (EquipmentCatalog.category == category)
                        )
                    )
                    .first()
                )

                if existing:
                    if update_existing:
                        existing.model_name = title
                        existing.brand = brand
                        existing.manufacturer = brand
                        existing.category = category
                        existing.subcategory = subcategory
                        if hp:
                            existing.hp_rating = hp
                        if price:
                            existing.indicative_price = price
                        if image_url:
                            existing.image_url = image_url
                        existing.official_source_url = official_url
                        existing.description = clean_desc or existing.description
                        existing.supplier_name = "MachinePoint"
                        existing.provenance_source = "MachinePoint Agriculture & Farming Machinery Collection"
                        existing.provenance_license = "Public Commercial Product Catalogue / Direct Supplier Link"
                        existing.source_verification_date = date.today()
                        existing.updated_at = datetime.utcnow()
                        updated += 1
                    else:
                        skipped += 1
                else:
                    item = EquipmentCatalog(
                        manufacturer=brand,
                        brand=brand,
                        model_name=title,
                        category=category,
                        subcategory=subcategory,
                        hp_rating=hp,
                        indicative_price=price,
                        supplier_name="MachinePoint",
                        description=clean_desc,
                        official_source_url=official_url,
                        source_verification_date=date.today(),
                        image_url=image_url,
                        provenance_source="MachinePoint Agriculture & Farming Machinery Collection",
                        provenance_license="Public Commercial Product Catalogue / Direct Supplier Link",
                        is_verified=True,
                        is_reference_only=True,
                        is_active=True,
                    )
                    self.db.add(item)
                    inserted += 1

            # Update job and source stats
            job.records_inserted = inserted
            job.records_updated = updated
            job.records_skipped = skipped
            job.status = "completed"
            job.completed_at = datetime.utcnow()

            source.last_imported_at = datetime.utcnow()
            source.records_count = (
                self.db.query(EquipmentCatalog)
                .filter(EquipmentCatalog.supplier_name == "MachinePoint")
                .count()
            )

            self.db.commit()
            log.info("MachinePoint import finished: inserted=%d, updated=%d, skipped=%d", inserted, updated, skipped)

            return {
                "status": "success",
                "source": "machinepoint",
                "records_read": len(products),
                "records_inserted": inserted,
                "records_updated": updated,
                "records_skipped": skipped,
                "total_machinepoint_items": source.records_count,
            }

        except Exception as e:
            self.db.rollback()
            job.status = "failed"
            job.error_summary = str(e)
            job.completed_at = datetime.utcnow()
            self.db.commit()
            log.exception("MachinePoint import failed: %s", e)
            raise e
