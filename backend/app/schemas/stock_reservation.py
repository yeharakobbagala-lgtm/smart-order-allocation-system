from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StockReservationResponse(BaseModel):
    id: int
    user_id: int
    cart_id: int
    branch_id: int
    product_id: int
    quantity: int
    reserved_at: datetime
    expires_at: datetime | None
    status: str
    reservation_type: str

    model_config = ConfigDict(from_attributes=True)