"""Add farmer feedback and suggestions table.

Revision ID: 005_add_farmer_feedback
Revises: 004_farm_context_diary
"""
from alembic import op
import sqlalchemy as sa

revision = "005_add_farmer_feedback"
down_revision = "004_farm_context_diary"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "farmer_feedback",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("feedback_ref", sa.String(length=20), unique=True, nullable=False),
        sa.Column("feedback_type", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("quick_rating", sa.String(length=20), nullable=True),
        sa.Column("guided_option", sa.String(length=120), nullable=True),
        sa.Column("content_text", sa.Text(), nullable=True),
        sa.Column("has_audio", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("audio_data", sa.LargeBinary(), nullable=True),
        sa.Column("audio_mimetype", sa.String(length=50), nullable=True),
        sa.Column("audio_duration_seconds", sa.Integer(), nullable=True),
        sa.Column("has_image", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("image_data", sa.LargeBinary(), nullable=True),
        sa.Column("image_mimetype", sa.String(length=50), nullable=True),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("source_page", sa.String(length=255), nullable=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("is_anonymous", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("contact_consent", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("contact_info", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="received"),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="normal"),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("assigned_to", sa.String(length=100), nullable=True),
        sa.Column("is_spam", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_public_showcase", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("public_improvement_summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_farmer_feedback_id", "farmer_feedback", ["id"])
    op.create_index("ix_farmer_feedback_feedback_ref", "farmer_feedback", ["feedback_ref"])
    op.create_index("ix_farmer_feedback_feedback_type", "farmer_feedback", ["feedback_type"])
    op.create_index("ix_farmer_feedback_category", "farmer_feedback", ["category"])
    op.create_index("ix_farmer_feedback_quick_rating", "farmer_feedback", ["quick_rating"])
    op.create_index("ix_farmer_feedback_language", "farmer_feedback", ["language"])
    op.create_index("ix_farmer_feedback_user_id", "farmer_feedback", ["user_id"])
    op.create_index("ix_farmer_feedback_status", "farmer_feedback", ["status"])
    op.create_index("ix_farmer_feedback_priority", "farmer_feedback", ["priority"])
    op.create_index("ix_farmer_feedback_is_spam", "farmer_feedback", ["is_spam"])
    op.create_index("ix_farmer_feedback_is_public_showcase", "farmer_feedback", ["is_public_showcase"])
    op.create_index("ix_farmer_feedback_created_at", "farmer_feedback", ["created_at"])


def downgrade() -> None:
    op.drop_table("farmer_feedback")
