"""add orders and order items

Revision ID: f19d013e1636
Revises: 879854d35b9e
Create Date: 2026-09-17 03:19:08.767468

NOTE:
orders and order_items were already created in revision 7e0c4970ed01.
branch_id was made nullable in revision eb7b0db299ff.
This revision is intentionally a no-op so the migration chain remains
linear and does not attempt to create those tables a second time.
"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "f19d013e1636"
down_revision: Union[str, Sequence[str], None] = "879854d35b9e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """No-op: orders / order_items already exist from earlier revisions."""
    pass


def downgrade() -> None:
    """No-op: tables are owned by revision 7e0c4970ed01."""
    pass
