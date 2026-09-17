"""add orders and order items

Revision ID: f19d013e1636
Revises: 879854d35b9e
Create Date: 2026-09-17 03:19:08.767468

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f19d013e1636"
down_revision: Union[str, Sequence[str], None] = "879854d35b9e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "orders",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "branch_id",
            sa.Integer(),
            nullable=True,
        ),

        sa.Column(
            "customer_name",
            sa.String(length=150),
            nullable=False,
        ),

        sa.Column(
            "phone",
            sa.String(length=20),
            nullable=False,
        ),

        sa.Column(
            "delivery_address",
            sa.String(length=500),
            nullable=False,
        ),

        sa.Column(
            "latitude",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "longitude",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "order_note",
            sa.String(length=500),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),

        sa.Column(
            "total_amount",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
        ),

        sa.Column(
            "payment_method",
            sa.String(length=30),
            nullable=False,
        ),

        sa.Column(
            "payment_status",
            sa.String(length=30),
            nullable=False,
        ),

        sa.Column(
            "estimated_delivery_date",
            sa.DateTime(),
            nullable=True,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["branch_id"],
            ["branches.id"],
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),

        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_orders_id"),
        "orders",
        ["id"],
        unique=False,
    )

    op.create_table(
        "order_items",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "order_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "product_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "quantity",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "unit_price",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["order_id"],
            ["orders.id"],
        ),

        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
        ),

        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_order_items_id"),
        "order_items",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_order_items_id"),
        table_name="order_items",
    )

    op.drop_table("order_items")

    op.drop_index(
        op.f("ix_orders_id"),
        table_name="orders",
    )

    op.drop_table("orders")