from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.order_item import OrderItem
    from app.models.user import User
    from app.models.branch import Branch


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    branch_id: Mapped[int | None] = mapped_column(
        ForeignKey("branches.id"),
        nullable=True
    )

    customer_name: Mapped[str] = mapped_column(
        String(150)
    )

    phone: Mapped[str] = mapped_column(
        String(20)
    )

    delivery_address: Mapped[str] = mapped_column(
        String(500)
    )

    latitude: Mapped[float] = mapped_column(
        Float
    )

    longitude: Mapped[float] = mapped_column(
        Float
    )

    order_note: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="ALLOCATED"
    )

    total_amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    payment_method: Mapped[str] = mapped_column(
        String(30),
        default="COD"
    )

    payment_status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING"
    )

    estimated_delivery_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # User relationship
    user: Mapped["User"] = relationship(
        "User",
        back_populates="orders"
    )

    # Branch relationship
    branch: Mapped["Branch | None"] = relationship(
        "Branch",
        back_populates="orders"
    )

    # Order items relationship
    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order"
    )