"""Persist WhatsApp work before acknowledging webhook delivery."""
from alembic import op
import sqlalchemy as sa

revision = "009_whatsapp_durable_inbox"
down_revision = "008_add_whatsapp_conversation_intelligence"
branch_labels = None
depends_on = None


def upgrade():
    if 'whatsapp_inbox_jobs' in sa.inspect(op.get_bind()).get_table_names():
        return
    op.create_table('whatsapp_inbox_jobs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('message_id', sa.String(100), nullable=False, unique=True),
        sa.Column('phone_number', sa.String(50), nullable=False),
        sa.Column('payload_json', sa.Text, nullable=False),
        sa.Column('status', sa.String(30), nullable=False, server_default='pending'),
        sa.Column('lease_token', sa.String(64)),
        sa.Column('lease_until', sa.DateTime),
        sa.Column('error_code', sa.String(100)),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
    )
    op.create_index('ix_whatsapp_inbox_jobs_status', 'whatsapp_inbox_jobs', ['status'])
    op.create_index('ix_whatsapp_inbox_jobs_phone_number', 'whatsapp_inbox_jobs', ['phone_number'])


def downgrade():
    op.drop_table('whatsapp_inbox_jobs')
