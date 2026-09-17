from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# ORDER CREATE
# =========================================================

class OrderCreate(BaseModel):

    customer_name: str = Field(
        min_length=2,
        max_length=150,
    )

    phone: str = Field(
        min_length=7,
        max_length=20,
    )

    delivery_address: str = Field(
        min_length=5,
        max_length=500,
    )

    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )

    order_note: str | None = Field(
        default=None,
        max_length=500,
    )

    payment_method: str = Field(
        default="COD",
        max_length=30,
    )


# =========================================================
# ORDER STATUS UPDATE
# =========================================================

class OrderStatusUpdate(BaseModel):

    status: str


# =========================================================
# ORDER ITEM RESPONSE
# =========================================================

class OrderItemResponse(BaseModel):

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    # Existing stock_reservations.reservation_type for this order line (read-only)
    reservation_type: str | None = None
    # Branch stock restock_date when reservation_type is FUTURE (read-only)
    restock_date: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# ORDER RESPONSE
# =========================================================

class OrderResponse(BaseModel):

    id: int
    user_id: int
    branch_id: int | None

    customer_name: str
    phone: str
    delivery_address: str

    latitude: float
    longitude: float

    order_note: str | None

    status: str

    total_amount: Decimal

    payment_method: str
    payment_status: str

    estimated_delivery_date: datetime | None

    # Allocation snapshot (null on orders created before snapshot support)
    allocation_distance_km: float | None = None
    allocation_travel_time_hours: float | None = None
    allocation_stock_wait_hours: float | None = None
    allocation_processing_time_hours: float | None = None
    allocation_eta_hours: float | None = None
    allocation_workload_percentage: float | None = None
    allocation_eta_score: float | None = None
    allocation_workload_score: float | None = None
    allocation_final_score: float | None = None

    created_at: datetime
    updated_at: datetime

    order_items: list[OrderItemResponse]

    model_config = ConfigDict(
        from_attributes=True
    )