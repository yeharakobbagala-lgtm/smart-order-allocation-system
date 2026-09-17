"""add restock quantity and stock reservation types

Revision ID: 879854d35b9e
Revises: eb7b0db299ff
Create Date: 2026-09-17 02:49:25.350162

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '879854d35b9e'
down_revision: Union[str, Sequence[str], None] = 'eb7b0db299ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'branch_stock',
        sa.Column(
            'restock_quantity',
            sa.Integer(),
            nullable=False,
            server_default='0',
        ),
    )
    op.add_column(
        'stock_reservations',
        sa.Column(
            'reservation_type',
            sa.String(length=20),
            nullable=False,
            server_default='TEMPORARY',
        ),
    )
    op.alter_column(
        'stock_reservations',
        'expires_at',
        existing_type=sa.DateTime(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'stock_reservations',
        'expires_at',
        existing_type=sa.DateTime(),
        nullable=False,
    )
    op.drop_column('stock_reservations', 'reservation_type')
    op.drop_column('branch_stock', 'restock_quantity')
