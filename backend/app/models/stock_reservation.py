from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
if TYPE_CHECKING:
    from app.models.user import User
    from app.models.cart import Cart
    from app.models.branch import Branch
    from app.models.product import Product


class StockReservation(Base):
    __tablename__ = "stock_reservations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    cart_id: Mapped[int] = mapped_column(
        ForeignKey("carts.id"),
        nullable=False
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        nullable=False
    )

    reserved_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="ACTIVE"
    )

    user: Mapped["User"] = relationship(
    "User"
)

cart: Mapped["Cart"] = relationship(
    "Cart"
)

branch: Mapped["Branch"] = relationship(
    "Branch"
)

product: Mapped["Product"] = relationship(
    "Product"
)