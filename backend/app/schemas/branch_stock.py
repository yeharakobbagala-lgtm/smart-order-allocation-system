from pydantic import BaseModel, Field, ConfigDict


class BranchStockCreate(BaseModel):
    branch_id: int
    product_id: int
    quantity: int = Field(ge=0)


class BranchStockUpdate(BaseModel):
    quantity: int = Field(ge=0)#never allowed negative quantity, so ge=0 (greater than or equal to 0) is used here.


class BranchStockResponse(BaseModel):
    id: int
    branch_id: int
    product_id: int
    quantity: int

    model_config = ConfigDict(from_attributes=True)