from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.branch_stock import BranchStock


def get_all_stock(
    db: Session
) -> list[BranchStock]:

    statement = select(BranchStock)

    result = db.execute(statement)

    return list(result.scalars().all())


def get_stock_by_id(
    db: Session,
    stock_id: int
) -> BranchStock | None:

    statement = select(BranchStock).where(
        BranchStock.id == stock_id
    )

    result = db.execute(statement)

    return result.scalar_one_or_none()


def get_stock_by_branch_product(
    db: Session,
    branch_id: int,
    product_id: int
) -> BranchStock | None:

    statement = select(BranchStock).where(
        BranchStock.branch_id == branch_id,
        BranchStock.product_id == product_id
    )

    result = db.execute(statement)

    return result.scalar_one_or_none()


def create_stock(
    db: Session,
    stock: BranchStock
) -> BranchStock:

    db.add(stock)
    db.commit()
    db.refresh(stock)

    return stock


def update_stock(
    db: Session,
    stock: BranchStock
) -> BranchStock:

    db.commit()
    db.refresh(stock)

    return stock


def delete_stock(
    db: Session,
    stock: BranchStock
):
    db.delete(stock)
    db.commit()