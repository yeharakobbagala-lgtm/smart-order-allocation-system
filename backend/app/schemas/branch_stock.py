from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class BranchStockCreate(BaseModel):
    branch_id: int
    product_id: int
    quantity: int = Field(ge=0)
    restock_quantity: int = Field(ge=0)
    restock_date: datetime | None = None


class BranchStockUpdate(BaseModel):
    quantity: int = Field(ge=0)
    restock_quantity: int = Field(ge=0)
    restock_date: datetime | None = None


class BranchStockResponse(BaseModel):
    id: int
    branch_id: int
    product_id: int
    quantity: int
    restock_quantity: int
    restock_date: datetime | None
    model_config = ConfigDict(from_attributes=True)