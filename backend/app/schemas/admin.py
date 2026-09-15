from pydantic import BaseModel

class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str


class UpdateUserRoleRequest(BaseModel):
    role: str