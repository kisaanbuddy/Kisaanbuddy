"""Automated seeder for agricultural marketplace reference catalogue & benchmark sources.

Ensures that the platform starts with a rich, verified catalogue across all 11
machinery categories, registered data sources, benchmark market prices, and
initial verified produce lots.
"""
import logging
from sqlalchemy.orm import Session

from db.models import (
    EquipmentCatalog,
    EquipmentListing,
    ImportSource,
    MarketPriceRecord,
    ProduceListing,
)
from services.marketplace_import.equipment_importer import EquipmentCatalogueImporter
from services.marketplace_import.agmarknet_importer import AgmarknetPriceImporter
from services.marketplace_import.initial_catalog_data import (
    INITIAL_EQUIPMENT_CATALOG,
    INITIAL_EQUIPMENT_LISTINGS,
    INITIAL_IMPORT_SOURCES,
    INITIAL_MARKET_PRICES,
    INITIAL_PRODUCE_LISTINGS,
)

log = logging.getLogger("krishiai.marketplace.seed")


def seed_marketplace_catalogue(db: Session, force: bool = False) -> dict:
    """Seed import sources, equipment reference catalogue, produce lots, and market prices."""
    summary = {
        "sources_seeded": 0,
        "equipment_catalog_seeded": 0,
        "equipment_listings_seeded": 0,
        "produce_listings_seeded": 0,
        "market_prices_seeded": 0,
    }

    # 1. Seed Import Sources
    for s in INITIAL_IMPORT_SOURCES:
        existing = db.query(ImportSource).filter(ImportSource.source_slug == s["source_slug"]).first()
        if not existing:
            source = ImportSource(
                source_name=s["source_name"],
                source_slug=s["source_slug"],
                source_type=s["source_type"],
                base_url=s["base_url"],
                auth_type=s["auth_type"],
                commercial_reuse_terms=s["commercial_reuse_terms"],
                update_frequency=s["update_frequency"],
                is_active=s["is_active"],
            )
            db.add(source)
            summary["sources_seeded"] += 1
    db.commit()

    # 2. Seed Equipment Reference Catalogue (FMTTI / OEM Standards)
    cat_count = db.query(EquipmentCatalog).filter(EquipmentCatalog.supplier_name.is_(None)).count()
    if cat_count == 0 or force:
        importer = EquipmentCatalogueImporter(db, source_slug="farmech_fmtti")
        res = importer.import_records(INITIAL_EQUIPMENT_CATALOG, update_existing=True)
        summary["equipment_catalog_seeded"] = res.get("records_inserted", 0) + res.get("records_updated", 0)

    # 2b. Seed MachinePoint Agricultural Products
    mp_count = db.query(EquipmentCatalog).filter(EquipmentCatalog.supplier_name == "MachinePoint").count()
    if mp_count == 0 or force:
        try:
            from services.marketplace_import.machinepoint_importer import MachinePointImporter
            mp_importer = MachinePointImporter(db, timeout=12)
            mp_res = mp_importer.import_all(update_existing=force)
            summary["machinepoint_products_seeded"] = mp_res.get("records_inserted", 0) + mp_res.get("records_updated", 0)
        except Exception as e:
            log.warning("MachinePoint seeding notice: %s", e)

    # 3. Seed Equipment Listings (Rent / Sale)
    for eq in INITIAL_EQUIPMENT_LISTINGS:
        existing = (
            db.query(EquipmentListing)
            .filter(
                EquipmentListing.title == eq["title"],
                EquipmentListing.owner_name == eq["owner_name"],
            )
            .first()
        )
        if not existing:
            item = EquipmentListing(**eq)
            db.add(item)
            summary["equipment_listings_seeded"] += 1
        elif force:
            for k, v in eq.items():
                setattr(existing, k, v)
    db.commit()

    # 4. Seed Produce Listings (Direct from Farms)
    for pr in INITIAL_PRODUCE_LISTINGS:
        existing = (
            db.query(ProduceListing)
            .filter(
                ProduceListing.crop_name == pr["crop_name"],
                ProduceListing.farmer_name == pr["farmer_name"],
                ProduceListing.state == pr["state"],
            )
            .first()
        )
        if not existing:
            item = ProduceListing(**pr)
            db.add(item)
            summary["produce_listings_seeded"] += 1
        elif force:
            for k, v in pr.items():
                setattr(existing, k, v)
    db.commit()

    # 5. Seed Market Prices (AGMARKNET Benchmarks)
    price_count = db.query(MarketPriceRecord).count()
    if price_count == 0 or force:
        price_importer = AgmarknetPriceImporter(db)
        res = price_importer.import_benchmarks(INITIAL_MARKET_PRICES)
        summary["market_prices_seeded"] = res.get("records_inserted", 0) + res.get("records_updated", 0)

    log.info("Marketplace catalogue seeding completed: %s", summary)
    return summary
