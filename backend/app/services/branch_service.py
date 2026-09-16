from sqlalchemy.orm import Session

from app.models.branch import Branch
from app.repositories.branch_repository import (
    create_branch,
    get_all_branches,
)


def create_new_branch(
    db: Session,
    name: str,
    address: str,
    latitude: float,
    longitude: float,
    capacity: int,
) -> Branch:
    if capacity <= 0:
        raise ValueError("Branch capacity must be greater than zero.")

    branch = Branch(
        name=name,
        address=address,
        latitude=latitude,
        longitude=longitude,
        capacity=capacity,
        active=True,
    )

    return create_branch(db, branch)


def get_branches(db: Session) -> list[Branch]:
    return get_all_branches(db)