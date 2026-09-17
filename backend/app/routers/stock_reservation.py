from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.stock_reservation import StockReservationResponse
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
    Check the currently available physical stock
    for a branch and product.
    """

    available_quantity = get_available_physical_stock(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
        physical_quantity=physical_quantity,
    )

    return {
        "branch_id": branch_id,
        "product_id": product_id,
        "physical_quantity": physical_quantity,
        "available_quantity": available_quantity,
    }