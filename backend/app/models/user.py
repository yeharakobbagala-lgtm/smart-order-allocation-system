from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.cart import Cart
    from app.models.order import Order
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100))

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(String(255))

    role: Mapped[str] = mapped_column(
        String(20),
        default="customer"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationship with Cart
    cart: Mapped["Cart"] = relationship(
        "Cart",
        back_populates="user",
        uselist=False
    )

    # Relationship with Order
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="user"
    )