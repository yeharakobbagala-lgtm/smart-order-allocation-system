"""add order allocation snapshot columns

Revision ID: a4c8e2f19b07
Revises: 33a7563ffd93
Create Date: 2026-09-17 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a4c8e2f19b07"
down_revision: Union[str, Sequence[str], None] = "33a7563ffd93"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("allocation_distance_km", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_travel_time_hours", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_stock_wait_hours", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_processing_time_hours", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_eta_hours", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_workload_percentage", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_eta_score", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_workload_score", sa.Float(), nullable=True),
    )
    op.add_column(
        "orders",
        sa.Column("allocation_final_score", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("orders", "allocation_final_score")
    op.drop_column("orders", "allocation_workload_score")
    op.drop_column("orders", "allocation_eta_score")
    op.drop_column("orders", "allocation_workload_percentage")
    op.drop_column("orders", "allocation_eta_hours")
    op.drop_column("orders", "allocation_processing_time_hours")
    op.drop_column("orders", "allocation_stock_wait_hours")
    op.drop_column("orders", "allocation_travel_time_hours")
    op.drop_column("orders", "allocation_distance_km")
