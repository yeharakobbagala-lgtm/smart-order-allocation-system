from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.branch import Branch


def create_branch(db: Session, branch: Branch) -> Branch:
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


def get_all_branches(db: Session) -> list[Branch]:
    statement = (
        select(Branch)
        .where(Branch.active.is_(True))
        .order_by(Branch.id)
    )

    result = db.execute(statement)
    return list(result.scalars().all())