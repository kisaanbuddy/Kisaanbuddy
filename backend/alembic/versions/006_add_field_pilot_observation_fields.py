"""Add supervised field pilot observation and expert review fields to advisory_cases.

Revision ID: 006_add_field_pilot_fields
Revises: 005_add_farmer_feedback
"""
from alembic import op
import sqlalchemy as sa

revision = "006_add_field_pilot_fields"
down_revision = "005_add_farmer_feedback"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new observation and audit columns to advisory_cases table
    with op.batch_alter_table("advisory_cases") as batch_op:
        batch_op.add_column(sa.Column("model_version", sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column("artifact_hash", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("image_quality_json", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("review_outcome", sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column("expert_crop", sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column("expert_disease", sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column("expert_is_healthy", sa.Boolean(), nullable=True, server_default=sa.false()))
        batch_op.add_column(sa.Column("reviewed_by_id", sa.Integer(), sa.ForeignKey("users.id", name="fk_advisory_cases_reviewed_by_id"), nullable=True))
        batch_op.add_column(sa.Column("reviewer_name", sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column("reviewed_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("consent_for_research", sa.Boolean(), nullable=False, server_default=sa.true()))
        batch_op.add_column(sa.Column("session_id", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("dhash", sa.String(length=32), nullable=True))
        batch_op.add_column(sa.Column("image_storage_path", sa.String(length=255), nullable=True))
        batch_op.create_index("ix_advisory_cases_review_outcome", ["review_outcome"])
        batch_op.create_index("ix_advisory_cases_session_id", ["session_id"])
        batch_op.create_index("ix_advisory_cases_dhash", ["dhash"])


def downgrade() -> None:
    with op.batch_alter_table("advisory_cases") as batch_op:
        batch_op.drop_index("ix_advisory_cases_dhash")
        batch_op.drop_index("ix_advisory_cases_session_id")
        batch_op.drop_index("ix_advisory_cases_review_outcome")
        batch_op.drop_column("image_storage_path")
        batch_op.drop_column("dhash")
        batch_op.drop_column("session_id")
        batch_op.drop_column("consent_for_research")
        batch_op.drop_column("reviewed_at")
        batch_op.drop_column("reviewer_name")
        batch_op.drop_column("reviewed_by_id")
        batch_op.drop_column("expert_is_healthy")
        batch_op.drop_column("expert_disease")
        batch_op.drop_column("expert_crop")
        batch_op.drop_column("review_outcome")
        batch_op.drop_column("image_quality_json")
        batch_op.drop_column("artifact_hash")
        batch_op.drop_column("model_version")
