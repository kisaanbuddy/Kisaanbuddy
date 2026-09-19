"""Backend V2 Part 1 Foundation: FK indexing, MediaAsset storage decoupling.

Revision ID: 004_v2_part1_foundation
Revises: 003_admin_content_media
"""
from alembic import op
import sqlalchemy as sa

revision = "004_v2_part1_foundation"
down_revision = "003_admin_content_media"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add storage_path and public_url columns to media_assets, make data column nullable
    with op.batch_alter_table("media_assets") as batch_op:
        batch_op.add_column(sa.Column("storage_path", sa.String(length=512), nullable=True))
        batch_op.add_column(sa.Column("public_url", sa.String(length=1024), nullable=True))
        batch_op.alter_column("data", existing_type=sa.LargeBinary(), nullable=True)
        batch_op.create_index("ix_media_assets_storage_path", ["storage_path"])
        batch_op.create_index("ix_media_assets_uploaded_by", ["uploaded_by"])

    # 2. Add explicit indexes to foreign keys across tables for optimal join performance
    with op.batch_alter_table("farmer_fields") as batch_op:
        batch_op.create_index("ix_farmer_fields_user_id", ["user_id"])
        batch_op.create_index("ix_farmer_fields_crop_id", ["crop_id"])

    with op.batch_alter_table("disease_detections") as batch_op:
        batch_op.create_index("ix_disease_detections_user_id", ["user_id"])
        batch_op.create_index("ix_disease_detections_field_id", ["field_id"])

    with op.batch_alter_table("chat_interactions") as batch_op:
        batch_op.create_index("ix_chat_interactions_user_id", ["user_id"])

    with op.batch_alter_table("site_content") as batch_op:
        batch_op.create_index("ix_site_content_updated_by", ["updated_by"])


def downgrade() -> None:
    with op.batch_alter_table("site_content") as batch_op:
        batch_op.drop_index("ix_site_content_updated_by")

    with op.batch_alter_table("chat_interactions") as batch_op:
        batch_op.drop_index("ix_chat_interactions_user_id")

    with op.batch_alter_table("disease_detections") as batch_op:
        batch_op.drop_index("ix_disease_detections_field_id")
        batch_op.drop_index("ix_disease_detections_user_id")

    with op.batch_alter_table("farmer_fields") as batch_op:
        batch_op.drop_index("ix_farmer_fields_crop_id")
        batch_op.drop_index("ix_farmer_fields_user_id")

    with op.batch_alter_table("media_assets") as batch_op:
        batch_op.drop_index("ix_media_assets_uploaded_by")
        batch_op.drop_index("ix_media_assets_storage_path")
        batch_op.drop_column("public_url")
        batch_op.drop_column("storage_path")
        batch_op.alter_column("data", existing_type=sa.LargeBinary(), nullable=False)
