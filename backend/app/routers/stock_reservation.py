from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.branch_stock import BranchStock
from app.repositories.stock_reservation_repository import (
    get_active_future_committed_quantity,
)
from app.services.stock_reservation_service import (
    get_available_physical_stock,
    get_remaining_restock_quantity,
)

router = APIRouter(
    prefix="/reservations",
    tags=["Stock Reservations"],
)


@router.get(
    "/availability/{branch_id}/{product_id}"
)
def check_stock_availability(
    branch_id: int,
    product_id: int,
    physical_quantity: int,
    db: Session = Depends(get_db),
):
    """
    Physical availability (TEMPORARY-only) plus FUTURE restock commitment
    for a branch/product pair.
    """

    available_quantity = get_available_physical_stock(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
        physical_quantity=physical_quantity,
    )

    future_committed_quantity = get_active_future_committed_quantity(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
    )

    stock = (
        db.query(BranchStock)
        .filter(
            BranchStock.branch_id == branch_id,
            BranchStock.product_id == product_id,
        )
        .first()
    )

    restock_quantity = stock.restock_quantity if stock else 0
    restock_date = stock.restock_date if stock else None

    remaining_restock_quantity = get_remaining_restock_quantity(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
        restock_quantity=restock_quantity,
    )

    return {
        "branch_id": branch_id,
        "product_id": product_id,
        "physical_quantity": physical_quantity,
        "available_quantity": available_quantity,
        "future_committed_quantity": future_committed_quantity,
        "restock_quantity": restock_quantity,
        "remaining_restock_quantity": remaining_restock_quantity,
        "restock_date": restock_date,
    }
