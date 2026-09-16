from pydantic import BaseModel


class BranchCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int


class BranchResponse(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int
    active: bool

    model_config = {"from_attributes": True}