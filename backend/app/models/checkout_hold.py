from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.user import User
    from app.models.cart import Cart
    from app.models.branch import Branch


class CheckoutHold(Base):
    """
    Stores delivery + allocation snapshot for a temporary checkout reservation.
    Order is created only on confirm.
    """

    __tablename__ = "checkout_holds"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    cart_id: Mapped[int] = mapped_column(
        ForeignKey("carts.id"),
        nullable=False,
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
    )

    customer_name: Mapped[str] = mapped_column(String(150))
    phone: Mapped[str] = mapped_column(String(20))
    delivery_address: Mapped[str] = mapped_column(String(500))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    order_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(30), default="COD")

    # Allocation snapshot (same fields as Order; frozen at hold time)
    allocation_distance_km: Mapped[float] = mapped_column(Float)
    allocation_travel_time_hours: Mapped[float] = mapped_column(Float)
    allocation_stock_wait_hours: Mapped[float] = mapped_column(Float)
    allocation_processing_time_hours: Mapped[float] = mapped_column(Float)
    allocation_eta_hours: Mapped[float] = mapped_column(Float)
    allocation_workload_percentage: Mapped[float] = mapped_column(Float)
    allocation_eta_score: Mapped[float] = mapped_column(Float)
    allocation_workload_score: Mapped[float] = mapped_column(Float)
    allocation_final_score: Mapped[float] = mapped_column(Float)

    estimated_delivery_date: Mapped[datetime] = mapped_column(DateTime)
    estimated_delivery_end: Mapped[datetime] = mapped_column(DateTime)

    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    delivery_fee: Mapped[float] = mapped_column(
        Numeric(10, 2),
        default=0,
    )
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))

    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # ACTIVE | CONFIRMED | EXPIRED | CANCELLED
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    user: Mapped["User"] = relationship("User")
    cart: Mapped["Cart"] = relationship("Cart")
    branch: Mapped["Branch"] = relationship("Branch")
