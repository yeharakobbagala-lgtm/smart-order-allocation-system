from decimal import Decimal

from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class ProductInCartResponse(BaseModel):
    id: int
    name: str
    price: Decimal
    image: str | None = None

    model_config = {
        "from_attributes": True
    }


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductInCartResponse

    model_config = {
        "from_attributes": True
    }


class CartResponse(BaseModel):
    id: int
    user_id: int
    items: list[CartItemResponse]

    model_config = {
        "from_attributes": True
    }