"""Enterprise WhatsApp upgrade: unanswered questions, feedback, and turn metrics.

Revision ID: 010_enterprise_whatsapp_upgrade
Revises: 009_whatsapp_durable_inbox
"""
from alembic import op
import sqlalchemy as sa

revision = "010_enterprise_whatsapp_upgrade"
down_revision = "009_whatsapp_durable_inbox"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    existing_tables = set(sa.inspect(bind).get_table_names())

    if "whatsapp_unanswered_questions" not in existing_tables:
        op.create_table(
            "whatsapp_unanswered_questions",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("phone_number", sa.String(50), nullable=False, index=True),
            sa.Column("language", sa.String(10), nullable=False, server_default="en"),
            sa.Column("question_text", sa.Text, nullable=False),
            sa.Column("reason", sa.String(100), nullable=False, server_default="no_verified_source"),
            sa.Column("resolved", sa.Boolean, nullable=False, server_default=sa.false(), index=True),
            sa.Column("resolution_note", sa.Text, nullable=True),
            sa.Column("created_at", sa.DateTime, nullable=False, index=True),
        )

    if "whatsapp_feedback" not in existing_tables:
        op.create_table(
            "whatsapp_feedback",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("phone_number", sa.String(50), nullable=False, index=True),
            sa.Column("rating", sa.Integer, nullable=True),
            sa.Column("helpful", sa.Boolean, nullable=True),
            sa.Column("comment", sa.Text, nullable=True),
            sa.Column("context_state", sa.String(50), nullable=True),
            sa.Column("created_at", sa.DateTime, nullable=False, index=True),
        )

    if "whatsapp_turn_metrics" not in existing_tables:
        op.create_table(
            "whatsapp_turn_metrics",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("message_id", sa.String(100), nullable=True, index=True),
            sa.Column("phone_hash", sa.String(32), nullable=False, index=True),
            sa.Column("language", sa.String(10), nullable=False, server_default="en", index=True),
            sa.Column("message_type", sa.String(30), nullable=False, server_default="text"),
            sa.Column("intent", sa.String(60), nullable=True, index=True),
            sa.Column("handler", sa.String(60), nullable=True),
            sa.Column("latency_ms", sa.Float, nullable=False, server_default="0.0"),
            sa.Column("ai_tokens", sa.Integer, nullable=False, server_default="0"),
            sa.Column("estimated_cost_inr", sa.Float, nullable=False, server_default="0.0"),
            sa.Column("success", sa.Boolean, nullable=False, server_default=sa.true(), index=True),
            sa.Column("error_code", sa.String(100), nullable=True),
            sa.Column("created_at", sa.DateTime, nullable=False, index=True),
        )


def downgrade() -> None:
    op.drop_table("whatsapp_turn_metrics")
    op.drop_table("whatsapp_feedback")
    op.drop_table("whatsapp_unanswered_questions")
