from typing import TYPE_CHECKING
from sqlalchemy import DateTime,ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from datetime import datetime


if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.product import Product

class BranchStock(Base):
    __tablename__ = "branch_stock"

    __table_args__ = (
        UniqueConstraint(
            "branch_id",
            "product_id",
            name="uq_branch_product"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        nullable=False,
        default=0
    )

    restock_quantity: Mapped[int] = mapped_column(
    nullable=False,
    default=0
    )

    restock_date: Mapped[datetime | None] = mapped_column(
    DateTime,
    nullable=True
    )

    branch: Mapped["Branch"] = relationship(
    "Branch",
    back_populates="stock"
)
    product: Mapped["Product"] = relationship(
    "Product",
    back_populates="branch_stocks"
)