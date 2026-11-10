"""Add WhatsApp conversation intelligence fields: opt-in/opt-out timestamps, consent source, context data.

Revision ID: 008_add_whatsapp_conversation_intelligence
Revises: 007_add_whatsapp_tables
"""
from alembic import op
import sqlalchemy as sa

revision = "008_add_whatsapp_conversation_intelligence"
down_revision = "007_add_whatsapp_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())
    if "whatsapp_users" not in existing_tables:
        return

    cols = {c["name"] for c in inspector.get_columns("whatsapp_users")}

    with op.batch_alter_table("whatsapp_users") as batch_op:
        if "opted_in_at" not in cols:
            batch_op.add_column(sa.Column("opted_in_at", sa.DateTime(), nullable=True))
        if "opted_out_at" not in cols:
            batch_op.add_column(sa.Column("opted_out_at", sa.DateTime(), nullable=True))
        if "consent_source" not in cols:
            batch_op.add_column(sa.Column("consent_source", sa.String(length=50), nullable=True))
        if "context_data_json" not in cols:
            batch_op.add_column(sa.Column("context_data_json", sa.Text(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())
    if "whatsapp_users" not in existing_tables:
        return

    cols = {c["name"] for c in inspector.get_columns("whatsapp_users")}

    with op.batch_alter_table("whatsapp_users") as batch_op:
        if "context_data_json" in cols:
            batch_op.drop_column("context_data_json")
        if "consent_source" in cols:
            batch_op.drop_column("consent_source")
        if "opted_out_at" in cols:
            batch_op.drop_column("opted_out_at")
        if "opted_in_at" in cols:
            batch_op.drop_column("opted_in_at")
