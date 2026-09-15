from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.branch_stock import BranchStock
    from app.models.cart_item import CartItem
    from app.models.order_item import OrderItem

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    cart_items: Mapped[list["CartItem"]] = relationship(
        "CartItem",
        back_populates="product"
    )
    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="product"
    )

    branch_stocks: Mapped[list["BranchStock"]] = relationship(
    "BranchStock",
    back_populates="product"
)