from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: Decimal
    image: str | None
    active: bool

    model_config = ConfigDict(from_attributes=True)

class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    image: str | None = None
    active: bool = True