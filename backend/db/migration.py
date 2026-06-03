import os
import shutil
import sqlite3
import logging

log = logging.getLogger("krishiai.db.migration")

# Path to local sqlite file
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "krishiai.db")

def run_migrations():
    """Verifies table schema and appends missing auth columns to 'users' table in SQLite."""
    # Only migrate if we are using SQLite locally
    db_url = os.getenv("DATABASE_URL", "")
    if db_url and not db_url.startswith("sqlite"):
        log.info("Non-SQLite database configured. Skipping raw SQLite migrations.")
        return

    if not os.path.exists(DB_FILE):
        log.info("Database file %s does not exist yet. It will be initialized by SQLAlchemy.", DB_FILE)
        return

    # 1. Back up database
    backup_file = DB_FILE + ".bak"
    try:
        shutil.copy2(DB_FILE, backup_file)
        log.info("Database backup created successfully: %s", backup_file)
    except Exception as e:
        log.warning("Could not create database backup: %s", e)

    # 2. Alter schema
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    try:
        # Get existing columns
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]

        # Columns to add if missing
        new_cols = [
            ("email", "VARCHAR(255) DEFAULT NULL"),
            ("email_verified", "BOOLEAN DEFAULT 0"),
            ("password_hash", "VARCHAR(255) DEFAULT NULL"),
            ("provider", "VARCHAR(50) DEFAULT 'email'"),
            ("provider_id", "VARCHAR(255) DEFAULT NULL"),
            ("profile_image", "TEXT DEFAULT NULL"),
            ("role", "VARCHAR(50) DEFAULT 'Farmer'"),
            ("is_active", "BOOLEAN DEFAULT 1"),
            ("updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("last_login_at", "DATETIME DEFAULT NULL"),
            ("last_seen_at", "DATETIME DEFAULT NULL"),
        ]

        altered = False
        for name, col_type in new_cols:
            if name not in columns:
                stmt = f"ALTER TABLE users ADD COLUMN {name} {col_type}"
                log.info("Executing migration: %s", stmt)
                cursor.execute(stmt)
                altered = True

        # SQLite supports unique indexes for nullable fields
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id) WHERE provider_id IS NOT NULL")

        conn.commit()
        if altered:
            log.info("Database schema updated with auth fields.")
        else:
            log.info("Database schema is up to date.")
    except Exception as e:
        conn.rollback()
        log.error("Migration failed: %s", e)
        raise e
    finally:
        cursor.close()
        conn.close()
