"""Automated Verification of Migration 006 on a Copy of the Production Database Schema.

Verifies:
1. Stamp copy at 005_add_farmer_feedback.
2. Clean upgrade to 006_add_field_pilot_fields.
3. Verification of all 14 new columns and indexes on advisory_cases.
4. Clean downgrade back to 005.
5. Re-upgrade to head.
"""
import os
import shutil
import sqlite3
import tempfile
import unittest
from alembic.config import Config
from alembic import command
from sqlalchemy import create_engine, inspect

_repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = os.path.join(_repo_root, "backend")


class TestAlembicMigration006(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.temp_dir, "test_migration_copy.db").replace("\\", "/")
        self.db_url = f"sqlite:///{self.db_path}"

        # Copy original krishiai.db
        prod_db = os.path.join(_repo_root, "krishiai.db")
        if os.path.exists(prod_db):
            shutil.copy2(prod_db, self.db_path)

        alembic_ini_path = os.path.join(BACKEND_DIR, "alembic.ini")
        self.alembic_cfg = Config(alembic_ini_path)
        self.alembic_cfg.set_main_option("sqlalchemy.url", self.db_url)
        self.alembic_cfg.set_main_option("script_location", os.path.join(BACKEND_DIR, "alembic"))

        # Explicitly stamp as 005_add_farmer_feedback
        command.stamp(self.alembic_cfg, "005_add_farmer_feedback")

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_upgrade_and_downgrade_006(self):
        # 1. Verify pre-006 state on copy
        engine = create_engine(self.db_url)
        insp = inspect(engine)
        cols_before = {c["name"] for c in insp.get_columns("advisory_cases")}
        engine.dispose()

        # 2. Upgrade to 006_add_field_pilot_fields
        command.upgrade(self.alembic_cfg, "006_add_field_pilot_fields")

        engine = create_engine(self.db_url)
        insp = inspect(engine)
        cols_006 = {c["name"] for c in insp.get_columns("advisory_cases")}

        expected_new_cols = [
            "model_version",
            "artifact_hash",
            "image_quality_json",
            "review_outcome",
            "expert_crop",
            "expert_disease",
            "expert_is_healthy",
            "reviewed_by_id",
            "reviewer_name",
            "reviewed_at",
            "consent_for_research",
            "session_id",
            "dhash",
            "image_storage_path",
        ]
        for col in expected_new_cols:
            self.assertIn(col, cols_006, f"Expected column {col} missing in migrated schema")

        # Verify indexes
        idx_names = {idx["name"] for idx in insp.get_indexes("advisory_cases")}
        self.assertIn("ix_advisory_cases_review_outcome", idx_names)
        self.assertIn("ix_advisory_cases_session_id", idx_names)
        self.assertIn("ix_advisory_cases_dhash", idx_names)
        engine.dispose()

        # 3. Test Downgrade to 005
        command.downgrade(self.alembic_cfg, "005_add_farmer_feedback")

        engine = create_engine(self.db_url)
        insp = inspect(engine)
        cols_after_downgrade = {c["name"] for c in insp.get_columns("advisory_cases")}
        self.assertNotIn("model_version", cols_after_downgrade)
        self.assertNotIn("review_outcome", cols_after_downgrade)
        engine.dispose()

        # 4. Re-upgrade to head
        command.upgrade(self.alembic_cfg, "head")

        engine = create_engine(self.db_url)
        insp = inspect(engine)
        cols_head = {c["name"] for c in insp.get_columns("advisory_cases")}
        for col in expected_new_cols:
            self.assertIn(col, cols_head)
        engine.dispose()


if __name__ == "__main__":
    unittest.main()
