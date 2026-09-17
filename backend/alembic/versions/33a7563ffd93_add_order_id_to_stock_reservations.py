"""add order id to stock reservations

Revision ID: 33a7563ffd93
Revises: f19d013e1636
Create Date: 2026-09-17 03:42:36.895135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '33a7563ffd93'
down_revision: Union[str, Sequence[str], None] = 'f19d013e1636'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FK_STOCK_RESERVATIONS_ORDER_ID = 'fk_stock_reservations_order_id_orders'


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'stock_reservations',
        sa.Column('order_id', sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        FK_STOCK_RESERVATIONS_ORDER_ID,
        'stock_reservations',
        'orders',
        ['order_id'],
        ['id'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        FK_STOCK_RESERVATIONS_ORDER_ID,
        'stock_reservations',
        type_='foreignkey',
    )
    op.drop_column('stock_reservations', 'order_id')
