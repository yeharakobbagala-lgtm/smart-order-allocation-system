"""add restock date to branch stock

Revision ID: eb7b0db299ff
Revises: 7e0c4970ed01
Create Date: 2026-09-17 00:43:25.032353

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eb7b0db299ff'
down_revision: Union[str, Sequence[str], None] = '7e0c4970ed01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'branch_stock',
        sa.Column('restock_date', sa.DateTime(), nullable=True),
    )
    # Allocation may assign a branch later; match current Order.branch_id model.
    op.alter_column(
        'orders',
        'branch_id',
        existing_type=sa.Integer(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'orders',
        'branch_id',
        existing_type=sa.Integer(),
        nullable=False,
    )
    op.drop_column('branch_stock', 'restock_date')
