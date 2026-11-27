"""Non-destructive schema migration for KisaanBuddy Marketplace Audit & Expansion.

Adds verification/archival/provenance columns to existing marketplace tables,
creates `marketplace_audit_logs` for full change tracking & rollback, and
creates `agri_products` for persistent storage of verified agricultural inputs.
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "krishiai.db"


def ensure_column(cur: sqlite3.Cursor, table: str, col_name: str, col_def: str) -> bool:
    existing = {row[1] for row in cur.execute(f'PRAGMA table_info("{table}")').fetchall()}
    if col_name not in existing:
        cur.execute(f'ALTER TABLE "{table}" ADD COLUMN {col_name} {col_def}')
        return True
    return False


def migrate() -> None:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database not found at {DB_PATH}")

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    added_cols = []

    # 1. equipment_listings
    for col, cdef in [
        ("is_archived", "BOOLEAN NOT NULL DEFAULT 0"),
        ("archive_reason", "TEXT"),
        ("verification_category", "VARCHAR(50) NOT NULL DEFAULT 'unverified'"),
        ("provider_type", "VARCHAR(60)"),
        ("source_name", "VARCHAR(255)"),
        ("source_url", "VARCHAR(500)"),
        ("availability_confirmed", "BOOLEAN NOT NULL DEFAULT 0"),
        ("availability_label", "VARCHAR(120) DEFAULT 'Contact Provider for Availability'"),
    ]:
        if ensure_column(cur, "equipment_listings", col, cdef):
            added_cols.append(f"equipment_listings.{col}")

    # 2. produce_listings
    for col, cdef in [
        ("is_archived", "BOOLEAN NOT NULL DEFAULT 0"),
        ("archive_reason", "TEXT"),
        ("verification_category", "VARCHAR(50) NOT NULL DEFAULT 'unverified'"),
    ]:
        if ensure_column(cur, "produce_listings", col, cdef):
            added_cols.append(f"produce_listings.{col}")

    # 3. buyer_requirements
    for col, cdef in [
        ("is_archived", "BOOLEAN NOT NULL DEFAULT 0"),
        ("archive_reason", "TEXT"),
        ("verification_category", "VARCHAR(50) NOT NULL DEFAULT 'unverified'"),
    ]:
        if ensure_column(cur, "buyer_requirements", col, cdef):
            added_cols.append(f"buyer_requirements.{col}")

    # 4. marketplace_listings
    for col, cdef in [
        ("is_archived", "BOOLEAN NOT NULL DEFAULT 0"),
        ("archive_reason", "TEXT"),
        ("verification_category", "VARCHAR(50) NOT NULL DEFAULT 'unverified'"),
    ]:
        if ensure_column(cur, "marketplace_listings", col, cdef):
            added_cols.append(f"marketplace_listings.{col}")

    # 5. marketplace_audit_logs
    cur.execute("""
        CREATE TABLE IF NOT EXISTS marketplace_audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name VARCHAR(80) NOT NULL,
            record_id VARCHAR(80) NOT NULL,
            action VARCHAR(50) NOT NULL,
            classification VARCHAR(50),
            previous_values_json TEXT,
            new_values_json TEXT,
            reason TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS ix_mal_table_rec ON marketplace_audit_logs(table_name, record_id)")

    # 6. agri_products
    cur.execute("""
        CREATE TABLE IF NOT EXISTS agri_products (
            id VARCHAR(80) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            brand VARCHAR(120) NOT NULL,
            manufacturer VARCHAR(200) NOT NULL,
            category VARCHAR(80) NOT NULL,
            active_ingredient TEXT,
            formulation VARCHAR(120),
            registration_number VARCHAR(120),
            target_crops_json TEXT,
            target_pests_diseases_json TEXT,
            target_deficiencies_json TEXT,
            recommended_dosage TEXT,
            pre_harvest_interval_days INTEGER,
            safety_precautions TEXT,
            pack_size VARCHAR(80),
            mrp FLOAT,
            selling_price FLOAT,
            price_unit VARCHAR(80),
            stock_status VARCHAR(50) NOT NULL DEFAULT 'contact_seller',
            seller_name VARCHAR(200),
            seller_phone VARCHAR(50),
            seller_type VARCHAR(60),
            seller_license_no VARCHAR(120),
            seller_location VARCHAR(200),
            state VARCHAR(100),
            district VARCHAR(100),
            delivery_options VARCHAR(200),
            delivery_charges FLOAT DEFAULT 0.0,
            image_url VARCHAR(500),
            official_source_url VARCHAR(500),
            provenance TEXT,
            is_fco_approved BOOLEAN DEFAULT 0,
            is_cibrc_approved BOOLEAN DEFAULT 0,
            is_verified BOOLEAN DEFAULT 1,
            verification_category VARCHAR(50) NOT NULL DEFAULT 'verified_genuine',
            last_verified_date VARCHAR(30),
            is_archived BOOLEAN NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS ix_agri_products_cat ON agri_products(category)")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_agri_products_brand ON agri_products(brand)")

    conn.commit()
    conn.close()
    print("Migration complete. Added columns:", added_cols)


if __name__ == "__main__":
    migrate()
