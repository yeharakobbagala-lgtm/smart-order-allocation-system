from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CheckoutHoldCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=7, max_length=20)
    delivery_address: str = Field(min_length=5, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    order_note: str | None = Field(default=None, max_length=500)
    payment_method: str = Field(default="COD", max_length=30)


class CheckoutConfirmRequest(BaseModel):
    hold_id: int


class CheckoutHoldItemResponse(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    reservation_id: int


class CheckoutHoldResponse(BaseModel):
    hold_id: int
    branch_id: int
    branch_name: str
    distance_km: float
    travel_time_hours: float
    stock_wait_hours: float
    processing_time_hours: float
    eta_hours: float
    estimated_delivery_date: datetime
    estimated_delivery_end: datetime
    reservation_ids: list[int]
    expires_at: datetime
    items: list[CheckoutHoldItemResponse]
    subtotal: Decimal
    delivery: Decimal
    total: Decimal
    status: str

    model_config = ConfigDict(from_attributes=True)
