"""Sync expanded verified agricultural products into krishiai.db agri_products table."""
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "krishiai.db"
sys.path.insert(0, str(ROOT / "backend"))

from data.authentic_agri_products import AUTHENTIC_AGRI_PRODUCTS  # noqa: E402
from data.expanded_agri_products import EXPANDED_AGRI_PRODUCTS  # noqa: E402


def sync() -> None:
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    existing_ids = {r[0] for r in cur.execute("SELECT id FROM agri_products").fetchall()}
    existing_sigs = {
        (r[0].strip().lower(), r[1].strip().lower())
        for r in cur.execute("SELECT brand, name FROM agri_products").fetchall()
    }

    inserted = 0
    duplicates_prevented = 0

    for p in EXPANDED_AGRI_PRODUCTS:
        sig = (p.get("brand", "").strip().lower(), p.get("name", "").strip().lower())
        if p["id"] in existing_ids or sig in existing_sigs:
            duplicates_prevented += 1
            continue

        cur.execute(
            """
            INSERT INTO agri_products (
                id, name, brand, manufacturer, category, active_ingredient, formulation,
                registration_number, target_crops_json, target_pests_diseases_json,
                target_deficiencies_json, recommended_dosage, pre_harvest_interval_days,
                safety_precautions, pack_size, mrp, selling_price, price_unit,
                stock_status, seller_name, seller_phone, seller_type, seller_license_no,
                seller_location, state, district, delivery_options, delivery_charges,
                image_url, official_source_url, provenance, is_fco_approved,
                is_cibrc_approved, is_verified, verification_category, last_verified_date, is_archived
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified_genuine', ?, 0)
            """,
            (
                p["id"],
                p["name"],
                p["brand"],
                p["manufacturer"],
                p["category"],
                p.get("active_ingredient"),
                p.get("formulation"),
                p.get("registration_number"),
                json.dumps(p.get("target_crops", [])),
                json.dumps(p.get("target_pests_diseases", [])),
                json.dumps(p.get("target_deficiencies", [])),
                p.get("recommended_dosage"),
                p.get("pre_harvest_interval_days"),
                p.get("safety_precautions"),
                p.get("pack_size"),
                p.get("mrp"),
                p.get("selling_price"),
                p.get("price_unit"),
                p.get("stock_status", "contact_seller"),
                p.get("seller_name"),
                p.get("seller_phone"),
                p.get("seller_type"),
                p.get("seller_license_no"),
                p.get("seller_location"),
                p.get("state"),
                p.get("district"),
                p.get("delivery_options"),
                p.get("delivery_charges", 0.0),
                p.get("image_url"),
                p.get("official_source_url"),
                p.get("provenance"),
                1 if p.get("is_fco_approved") else 0,
                1 if p.get("is_cibrc_approved") else 0,
                1 if p.get("is_verified", True) else 0,
                p.get("last_verified_date"),
            ),
        )
        existing_ids.add(p["id"])
        existing_sigs.add(sig)
        inserted += 1

    cur.execute(
        """
        INSERT INTO marketplace_audit_logs
        (table_name, record_id, action, classification, new_values_json, reason)
        VALUES ('agri_products', 'batch_expanded_v1', 'inserted', 'verified_genuine', ?, ?)
        """,
        (
            json.dumps({"inserted": inserted, "duplicates_prevented": duplicates_prevented}),
            "Added verified Indian agricultural products across 11 categories (FCO/CIBRC/NSC).",
        ),
    )

    total_db = cur.execute("SELECT COUNT(*) FROM agri_products WHERE is_archived = 0").fetchone()[0]
    conn.commit()
    conn.close()
    print(f"AUTHENTIC_AGRI_PRODUCTS in-memory count: {len(AUTHENTIC_AGRI_PRODUCTS)}")
    print(f"DB agri_products inserted: {inserted}, duplicates_prevented: {duplicates_prevented}, total_active_in_db: {total_db}")


if __name__ == "__main__":
    sync()
