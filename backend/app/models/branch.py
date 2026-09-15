from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
if TYPE_CHECKING:
    from app.models.branch_stock import BranchStock

class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150))
    address: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    capacity: Mapped[int] = mapped_column()
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    stock: Mapped[list["BranchStock"]] = relationship(
    "BranchStock",
    back_populates="branch"
)