"""add checkout_holds table

Revision ID: b7e1d4a82c90
Revises: a4c8e2f19b07
Create Date: 2026-09-17 14:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7e1d4a82c90"
down_revision: Union[str, Sequence[str], None] = "a4c8e2f19b07"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "checkout_holds",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("cart_id", sa.Integer(), sa.ForeignKey("carts.id"), nullable=False),
        sa.Column("branch_id", sa.Integer(), sa.ForeignKey("branches.id"), nullable=False),
        sa.Column("customer_name", sa.String(length=150), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("delivery_address", sa.String(length=500), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("order_note", sa.String(length=500), nullable=True),
        sa.Column("payment_method", sa.String(length=30), nullable=False),
        sa.Column("allocation_distance_km", sa.Float(), nullable=False),
        sa.Column("allocation_travel_time_hours", sa.Float(), nullable=False),
        sa.Column("allocation_stock_wait_hours", sa.Float(), nullable=False),
        sa.Column("allocation_processing_time_hours", sa.Float(), nullable=False),
        sa.Column("allocation_eta_hours", sa.Float(), nullable=False),
        sa.Column("allocation_workload_percentage", sa.Float(), nullable=False),
        sa.Column("allocation_eta_score", sa.Float(), nullable=False),
        sa.Column("allocation_workload_score", sa.Float(), nullable=False),
        sa.Column("allocation_final_score", sa.Float(), nullable=False),
        sa.Column("estimated_delivery_date", sa.DateTime(), nullable=False),
        sa.Column("estimated_delivery_end", sa.DateTime(), nullable=False),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("delivery_fee", sa.Numeric(10, 2), nullable=False),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_checkout_holds_id", "checkout_holds", ["id"])
    op.create_index("ix_checkout_holds_user_id", "checkout_holds", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_checkout_holds_user_id", table_name="checkout_holds")
    op.drop_index("ix_checkout_holds_id", table_name="checkout_holds")
    op.drop_table("checkout_holds")
