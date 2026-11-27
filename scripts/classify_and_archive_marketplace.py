"""Classify existing marketplace & rental listings into 4 audit categories:
1. verified_genuine: Preserve without unnecessary modification.
2. genuine_incomplete: Add only missing verified information.
3. fake_demo: Archive non-destructively (is_archived=1) and log in marketplace_audit_logs.
4. unverified: Flag for manual verification (is_archived=0, verification_category='unverified').

Also syncs existing 48 AUTHENTIC_AGRI_PRODUCTS into agri_products table.
"""
import json
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "krishiai.db"
sys.path.insert(0, str(ROOT / "backend"))

from data.authentic_agri_products import AUTHENTIC_AGRI_PRODUCTS  # noqa: E402

FAKE_PHONE_PATTERNS = [
    "12345",
    "54321",
    "43210",
    "98765",
    "23410",
    "23450",
    "76543",
    "55432",
    "44321",
    "11223",
    "99887",
    "00000",
    "11111",
    "99999",
]


def is_fake_phone(phone: str | None) -> bool:
    if not phone:
        return False
    digits = re.sub(r"\D", "", phone)
    return any(pat in digits for pat in FAKE_PHONE_PATTERNS)


def log_audit(
    cur: sqlite3.Cursor,
    table_name: str,
    record_id: str | int,
    action: str,
    classification: str,
    prev: dict | None,
    new: dict | None,
    reason: str,
) -> None:
    cur.execute(
        """
        INSERT INTO marketplace_audit_logs
        (table_name, record_id, action, classification, previous_values_json, new_values_json, reason)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            table_name,
            str(record_id),
            action,
            classification,
            json.dumps(prev, default=str) if prev else None,
            json.dumps(new, default=str) if new else None,
            reason,
        ),
    )


def run() -> dict:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    summary = {
        "equipment_catalog_preserved": 0,
        "agri_products_preserved": 0,
        "equipment_listings": {"verified_genuine": 0, "genuine_incomplete": 0, "fake_demo_archived": 0, "unverified_flagged": 0},
        "produce_listings": {"verified_genuine": 0, "genuine_incomplete": 0, "fake_demo_archived": 0, "unverified_flagged": 0},
        "buyer_requirements": {"verified_genuine": 0, "genuine_incomplete": 0, "fake_demo_archived": 0, "unverified_flagged": 0},
        "marketplace_listings": {"verified_genuine": 0, "genuine_incomplete": 0, "fake_demo_archived": 0, "unverified_flagged": 0},
    }

    # 1. Equipment Catalog (244 reference items) -> verified_genuine
    ec_count = cur.execute("SELECT COUNT(*) FROM equipment_catalog WHERE is_verified = 1").fetchone()[0]
    summary["equipment_catalog_preserved"] = ec_count

    # 2. Sync existing 48 AUTHENTIC_AGRI_PRODUCTS into agri_products table
    for p in AUTHENTIC_AGRI_PRODUCTS:
        cur.execute(
            """
            INSERT OR IGNORE INTO agri_products (
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
    summary["agri_products_preserved"] = len(AUTHENTIC_AGRI_PRODUCTS)

    # 3. Audit equipment_listings (42 existing rows)
    seen_eq = set()
    for row in cur.execute("SELECT * FROM equipment_listings ORDER BY id").fetchall():
        d = dict(row)
        sig = (d["brand"].lower(), d["model_name"].lower(), d["owner_name"].lower(), d["district"].lower())
        is_dup = sig in seen_eq
        seen_eq.add(sig)

        if is_dup or is_fake_phone(d.get("owner_phone")):
            reason = "Duplicate seeded listing" if is_dup else f"Confirmed synthetic/placeholder phone pattern ({d.get('owner_phone')})"
            cur.execute(
                """
                UPDATE equipment_listings
                SET is_archived = 1,
                    archive_reason = ?,
                    verification_category = 'fake_demo',
                    availability_status = 'inactive',
                    availability_confirmed = 0,
                    availability_label = 'Archived Demonstration Listing'
                WHERE id = ?
                """,
                (reason, d["id"]),
            )
            log_audit(cur, "equipment_listings", d["id"], "archived", "fake_demo",
                      {"availability_status": d["availability_status"], "owner_phone": d["owner_phone"]},
                      {"is_archived": 1, "verification_category": "fake_demo"}, reason)
            summary["equipment_listings"]["fake_demo_archived"] += 1
        else:
            # Flag as unverified (do NOT auto-classify as fake) and set honest availability
            reason = "Seeded listing without verified live directory source or confirmed availability; flagged for manual verification."
            cur.execute(
                """
                UPDATE equipment_listings
                SET is_archived = 0,
                    verification_category = 'unverified',
                    availability_status = 'contact_provider',
                    availability_confirmed = 0,
                    availability_label = 'Contact Provider for Availability'
                WHERE id = ?
                """,
                (d["id"],),
            )
            log_audit(cur, "equipment_listings", d["id"], "flagged_unverified", "unverified",
                      {"availability_status": d["availability_status"]},
                      {"verification_category": "unverified", "availability_status": "contact_provider"}, reason)
            summary["equipment_listings"]["unverified_flagged"] += 1

    # 4. Audit produce_listings (16 existing rows)
    seen_prod = set()
    for row in cur.execute("SELECT * FROM produce_listings ORDER BY id").fetchall():
        d = dict(row)
        sig = (d["crop_name"].lower(), (d["variety"] or "").lower(), d["farmer_name"].lower(), d["district"].lower())
        is_dup = sig in seen_prod
        seen_prod.add(sig)

        if is_dup or is_fake_phone(d.get("farmer_phone")):
            reason = "Duplicate test/seed produce listing" if is_dup else f"Synthetic/placeholder phone pattern ({d.get('farmer_phone')})"
            cur.execute(
                """
                UPDATE produce_listings
                SET is_archived = 1,
                    archive_reason = ?,
                    verification_category = 'fake_demo',
                    availability_status = 'inactive'
                WHERE id = ?
                """,
                (reason, d["id"]),
            )
            log_audit(cur, "produce_listings", d["id"], "archived", "fake_demo",
                      {"availability_status": d["availability_status"], "farmer_phone": d["farmer_phone"]},
                      {"is_archived": 1, "verification_category": "fake_demo"}, reason)
            summary["produce_listings"]["fake_demo_archived"] += 1
        else:
            reason = "Flagged for manual verification (no external verification record)."
            cur.execute(
                """
                UPDATE produce_listings
                SET is_archived = 0,
                    verification_category = 'unverified'
                WHERE id = ?
                """,
                (d["id"],),
            )
            log_audit(cur, "produce_listings", d["id"], "flagged_unverified", "unverified",
                      {"verification_status": d["verification_status"]},
                      {"verification_category": "unverified"}, reason)
            summary["produce_listings"]["unverified_flagged"] += 1

    # 5. Audit buyer_requirements (20 existing rows)
    seen_br = set()
    for row in cur.execute("SELECT * FROM buyer_requirements ORDER BY id").fetchall():
        d = dict(row)
        sig = (d["commodity"].lower(), d["buyer_name"].lower(), d["district"].lower())
        is_dup = sig in seen_br
        seen_br.add(sig)

        if is_dup or is_fake_phone(d.get("contact_phone")):
            reason = "Duplicate test/seed buyer requirement" if is_dup else f"Synthetic/placeholder phone pattern ({d.get('contact_phone')})"
            cur.execute(
                """
                UPDATE buyer_requirements
                SET is_archived = 1,
                    archive_reason = ?,
                    verification_category = 'fake_demo',
                    status = 'cancelled'
                WHERE id = ?
                """,
                (reason, d["id"]),
            )
            log_audit(cur, "buyer_requirements", d["id"], "archived", "fake_demo",
                      {"status": d["status"], "contact_phone": d["contact_phone"]},
                      {"is_archived": 1, "verification_category": "fake_demo"}, reason)
            summary["buyer_requirements"]["fake_demo_archived"] += 1
        else:
            cur.execute(
                """
                UPDATE buyer_requirements
                SET is_archived = 0,
                    verification_category = 'unverified'
                WHERE id = ?
                """,
                (d["id"],),
            )
            summary["buyer_requirements"]["unverified_flagged"] += 1

    # 6. Audit marketplace_listings (6 existing rows)
    for row in cur.execute("SELECT * FROM marketplace_listings ORDER BY id").fetchall():
        d = dict(row)
        if is_fake_phone(d.get("contact_phone")):
            reason = f"Synthetic/placeholder phone pattern ({d.get('contact_phone')})"
            cur.execute(
                """
                UPDATE marketplace_listings
                SET is_archived = 1,
                    archive_reason = ?,
                    verification_category = 'fake_demo',
                    is_active = 0
                WHERE id = ?
                """,
                (reason, d["id"]),
            )
            log_audit(cur, "marketplace_listings", d["id"], "archived", "fake_demo",
                      {"is_active": d["is_active"], "contact_phone": d["contact_phone"]},
                      {"is_archived": 1, "verification_category": "fake_demo"}, reason)
            summary["marketplace_listings"]["fake_demo_archived"] += 1
        else:
            cur.execute(
                """
                UPDATE marketplace_listings
                SET is_archived = 0,
                    verification_category = 'unverified'
                WHERE id = ?
                """,
                (d["id"],),
            )
            summary["marketplace_listings"]["unverified_flagged"] += 1

    conn.commit()
    conn.close()
    print(json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    run()
