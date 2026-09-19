"""Backend V2 Part 2: Sensor reading history table.

Revision ID: 005_v2_part2_sensor_and_jobs
Revises: 004_v2_part1_foundation
"""
from alembic import op
import sqlalchemy as sa

revision = "005_v2_part2_sensor_and_jobs"
down_revision = "004_v2_part1_foundation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sensor_readings_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("device_id", sa.String(length=64), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Float(), nullable=True),
        sa.Column("soil_temperature", sa.Float(), nullable=True),
        sa.Column("soil_moisture", sa.Float(), nullable=True),
        sa.Column("raw_moisture", sa.Integer(), nullable=True),
        sa.Column("received_at", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_sensor_readings_history_device_id", "sensor_readings_history", ["device_id"])
    op.create_index("ix_sensor_readings_history_received_at", "sensor_readings_history", ["received_at"])
    op.create_index("ix_sensor_readings_history_created_at", "sensor_readings_history", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_sensor_readings_history_created_at", table_name="sensor_readings_history")
    op.drop_index("ix_sensor_readings_history_received_at", table_name="sensor_readings_history")
    op.drop_index("ix_sensor_readings_history_device_id", table_name="sensor_readings_history")
    op.drop_table("sensor_readings_history")
