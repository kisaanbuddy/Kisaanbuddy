"""Add farm context and persistent farm diary.

Revision ID: 004_farm_context_diary
Revises: 003_admin_content_media
"""
from alembic import op
import sqlalchemy as sa

revision = "004_farm_context_diary"
down_revision = "003_admin_content_media"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "farms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("location_text", sa.String(length=255)),
        sa.Column("village_name", sa.String(length=100)),
        sa.Column("district_name", sa.String(length=100)),
        sa.Column("state_name", sa.String(length=100)),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    with op.batch_alter_table("farmer_fields") as batch:
        batch.add_column(sa.Column("farm_id", sa.Integer(), sa.ForeignKey("farms.id"), nullable=True))
        batch.add_column(sa.Column("area_unit", sa.String(length=20), server_default="acre"))
        batch.add_column(sa.Column("location_text", sa.String(length=255)))
        batch.add_column(sa.Column("water_source", sa.String(length=100)))
        batch.add_column(sa.Column("crop_variety", sa.String(length=100)))
        batch.add_column(sa.Column("season", sa.String(length=50)))
        batch.add_column(sa.Column("previous_crop", sa.String(length=100)))
        batch.add_column(sa.Column("expected_harvest", sa.Date()))
        batch.add_column(sa.Column("notes", sa.Text()))
    op.create_index("ix_farmer_fields_farm_id", "farmer_fields", ["farm_id"])
    op.create_table(
        "field_crops",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("field_id", sa.Integer(), sa.ForeignKey("farmer_fields.id"), nullable=False, index=True),
        sa.Column("crop_name", sa.String(length=100), nullable=False),
        sa.Column("variety", sa.String(length=100)), sa.Column("season", sa.String(length=50)),
        sa.Column("sowing_date", sa.Date()), sa.Column("expected_harvest", sa.Date()),
        sa.Column("stage_override", sa.String(length=80)), sa.Column("is_current", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("notes", sa.Text()), sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "farm_activities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("field_id", sa.Integer(), sa.ForeignKey("farmer_fields.id"), index=True),
        sa.Column("crop_cycle_id", sa.Integer(), sa.ForeignKey("field_crops.id"), index=True),
        sa.Column("activity_date", sa.Date(), nullable=False, index=True),
        sa.Column("activity_type", sa.String(length=50), nullable=False, index=True),
        sa.Column("title", sa.String(length=255), nullable=False), sa.Column("category", sa.String(length=30), nullable=False, server_default="activity"),
        sa.Column("amount", sa.Float()), sa.Column("quantity", sa.Float()), sa.Column("unit", sa.String(length=30)),
        sa.Column("labour_count", sa.Integer()), sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(), nullable=False), sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("farm_activities")
    op.drop_table("field_crops")
    op.drop_index("ix_farmer_fields_farm_id", table_name="farmer_fields")
    with op.batch_alter_table("farmer_fields") as batch:
        for name in ("notes", "expected_harvest", "previous_crop", "season", "crop_variety", "water_source", "location_text", "area_unit", "farm_id"):
            batch.drop_column(name)
    op.drop_table("farms")
