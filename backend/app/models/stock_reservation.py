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
    from app.models.order import Order


class StockReservation(Base):
    __tablename__ = "stock_reservations"

    # =========================================================
    # PRIMARY KEY
    # =========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # =========================================================
    # USER
    # =========================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    # =========================================================
    # CART
    # =========================================================

    cart_id: Mapped[int] = mapped_column(
        ForeignKey("carts.id"),
        nullable=False,
    )

    # =========================================================
    # ORDER
    # =========================================================

    order_id: Mapped[int | None] = mapped_column(
        ForeignKey("orders.id"),
        nullable=True,
    )

    # =========================================================
    # BRANCH
    # =========================================================

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
    )

    # =========================================================
    # PRODUCT
    # =========================================================

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
    )

    # =========================================================
    # QUANTITY
    # =========================================================

    quantity: Mapped[int] = mapped_column(
        nullable=False,
    )

    # =========================================================
    # RESERVATION TIME
    # =========================================================

    reserved_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    # =========================================================
    # STATUS
    # =========================================================
    #
    # ACTIVE
    # EXPIRED
    # CANCELLED
    #

    status: Mapped[str] = mapped_column(
        String(20),
        default="ACTIVE",
    )

    # =========================================================
    # RESERVATION TYPE
    # =========================================================
    #
    # TEMPORARY = 10-minute checkout reservation
    # CURRENT   = confirmed order using current physical stock
    # FUTURE    = confirmed order waiting for restock
    #

    reservation_type: Mapped[str] = mapped_column(
        String(20),
        default="TEMPORARY",
    )

    # =========================================================
    # RELATIONSHIPS
    # =========================================================

    user: Mapped["User"] = relationship(
        "User",
    )

    cart: Mapped["Cart"] = relationship(
        "Cart",
    )

    order: Mapped["Order | None"] = relationship(
        "Order",
    )

    branch: Mapped["Branch"] = relationship(
        "Branch",
    )

    product: Mapped["Product"] = relationship(
        "Product",
    )