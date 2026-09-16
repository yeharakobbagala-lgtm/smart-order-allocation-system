from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.cart_item import CartItem
    from app.models.user import User

class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        unique=True
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
    user: Mapped["User"] = relationship(
        "User",
        back_populates="cart"
    )
    #relationship with Cart
    items: Mapped[list["CartItem"]] = relationship(#list of CartItem objects
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
       
    )