"""Add WhatsApp Business Platform Cloud API tables.

Revision ID: 007_add_whatsapp_tables
Revises: 006_add_field_pilot_fields
"""
from alembic import op
import sqlalchemy as sa

revision = "007_add_whatsapp_tables"
down_revision = "006_add_field_pilot_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    # 1. whatsapp_users
    if "whatsapp_users" not in existing_tables:
        op.create_table(
            "whatsapp_users",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("phone_number", sa.String(length=50), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", name="fk_whatsapp_users_user_id"), nullable=True),
            sa.Column("name", sa.String(length=100), nullable=True),
            sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
            sa.Column("current_state", sa.String(length=50), nullable=False, server_default="NEW_USER"),
            sa.Column("last_active_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("opted_in", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_whatsapp_users_id", "whatsapp_users", ["id"])
        op.create_index("ix_whatsapp_users_phone_number", "whatsapp_users", ["phone_number"], unique=True)
        op.create_index("ix_whatsapp_users_user_id", "whatsapp_users", ["user_id"])

    # 2. whatsapp_messages
    if "whatsapp_messages" not in existing_tables:
        op.create_table(
            "whatsapp_messages",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("message_id", sa.String(length=100), nullable=True),
            sa.Column("phone_number", sa.String(length=50), nullable=False),
            sa.Column("direction", sa.String(length=20), nullable=False),
            sa.Column("message_type", sa.String(length=50), nullable=False),
            sa.Column("body", sa.Text(), nullable=True),
            sa.Column("media_id", sa.String(length=100), nullable=True),
            sa.Column("media_url", sa.Text(), nullable=True),
            sa.Column("category", sa.String(length=50), nullable=False, server_default="service"),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="sent"),
            sa.Column("is_chargeable", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("estimated_cost_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("error_message", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_whatsapp_messages_id", "whatsapp_messages", ["id"])
        op.create_index("ix_whatsapp_messages_message_id", "whatsapp_messages", ["message_id"], unique=True)
        op.create_index("ix_whatsapp_messages_phone_number", "whatsapp_messages", ["phone_number"])
        op.create_index("ix_whatsapp_messages_created_at", "whatsapp_messages", ["created_at"])

    # 3. whatsapp_support_tickets
    if "whatsapp_support_tickets" not in existing_tables:
        op.create_table(
            "whatsapp_support_tickets",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("ticket_id", sa.String(length=50), nullable=False),
            sa.Column("phone_number", sa.String(length=50), nullable=False),
            sa.Column("farmer_name", sa.String(length=100), nullable=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", name="fk_whatsapp_support_tickets_user_id"), nullable=True),
            sa.Column("query_summary", sa.Text(), nullable=False),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="OPEN"),
            sa.Column("assigned_to", sa.String(length=100), nullable=True),
            sa.Column("resolution_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("resolved_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_whatsapp_support_tickets_id", "whatsapp_support_tickets", ["id"])
        op.create_index("ix_whatsapp_support_tickets_ticket_id", "whatsapp_support_tickets", ["ticket_id"], unique=True)
        op.create_index("ix_whatsapp_support_tickets_phone_number", "whatsapp_support_tickets", ["phone_number"])
        op.create_index("ix_whatsapp_support_tickets_user_id", "whatsapp_support_tickets", ["user_id"])

    # 4. whatsapp_link_tokens
    if "whatsapp_link_tokens" not in existing_tables:
        op.create_table(
            "whatsapp_link_tokens",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("token", sa.String(length=100), nullable=False),
            sa.Column("phone_number", sa.String(length=50), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", name="fk_whatsapp_link_tokens_user_id"), nullable=True),
            sa.Column("action", sa.String(length=50), nullable=False),
            sa.Column("target_id", sa.String(length=100), nullable=True),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("used", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_whatsapp_link_tokens_id", "whatsapp_link_tokens", ["id"])
        op.create_index("ix_whatsapp_link_tokens_token", "whatsapp_link_tokens", ["token"], unique=True)
        op.create_index("ix_whatsapp_link_tokens_phone_number", "whatsapp_link_tokens", ["phone_number"])
        op.create_index("ix_whatsapp_link_tokens_user_id", "whatsapp_link_tokens", ["user_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "whatsapp_link_tokens" in existing_tables:
        op.drop_index("ix_whatsapp_link_tokens_user_id", table_name="whatsapp_link_tokens")
        op.drop_index("ix_whatsapp_link_tokens_phone_number", table_name="whatsapp_link_tokens")
        op.drop_index("ix_whatsapp_link_tokens_token", table_name="whatsapp_link_tokens")
        op.drop_index("ix_whatsapp_link_tokens_id", table_name="whatsapp_link_tokens")
        op.drop_table("whatsapp_link_tokens")

    if "whatsapp_support_tickets" in existing_tables:
        op.drop_index("ix_whatsapp_support_tickets_user_id", table_name="whatsapp_support_tickets")
        op.drop_index("ix_whatsapp_support_tickets_phone_number", table_name="whatsapp_support_tickets")
        op.drop_index("ix_whatsapp_support_tickets_ticket_id", table_name="whatsapp_support_tickets")
        op.drop_index("ix_whatsapp_support_tickets_id", table_name="whatsapp_support_tickets")
        op.drop_table("whatsapp_support_tickets")

    if "whatsapp_messages" in existing_tables:
        op.drop_index("ix_whatsapp_messages_created_at", table_name="whatsapp_messages")
        op.drop_index("ix_whatsapp_messages_phone_number", table_name="whatsapp_messages")
        op.drop_index("ix_whatsapp_messages_message_id", table_name="whatsapp_messages")
        op.drop_index("ix_whatsapp_messages_id", table_name="whatsapp_messages")
        op.drop_table("whatsapp_messages")

    if "whatsapp_users" in existing_tables:
        op.drop_index("ix_whatsapp_users_user_id", table_name="whatsapp_users")
        op.drop_index("ix_whatsapp_users_phone_number", table_name="whatsapp_users")
        op.drop_index("ix_whatsapp_users_id", table_name="whatsapp_users")
        op.drop_table("whatsapp_users")
