from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.branch_stock import (
    BranchStockCreate,
    BranchStockUpdate,
    BranchStockResponse,
)

from app.services.branch_stock_service import (
    get_stock,
    create_stock,
    update_stock,
    delete_stock,
)

from app.utils.security import require_admin


router = APIRouter(
    prefix="/branch-stock",
    tags=["Branch Stock"]
)


# --------------------------------
# ADMIN ONLY
# --------------------------------

@router.get(
    "/",
    response_model=list[BranchStockResponse]
)
def read_stock(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return get_stock(db)


@router.post(
    "/",
    response_model=BranchStockResponse,
    status_code=status.HTTP_201_CREATED
)
def add_stock(
    data: BranchStockCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return create_stock(
        db,
        data
    )


@router.put(
    "/{stock_id}",
    response_model=BranchStockResponse
)
def edit_stock(
    stock_id: int,
    data: BranchStockUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return update_stock(
        db,
        stock_id,
        data
    )


@router.delete(
    "/{stock_id}"
)
def remove_stock(
    stock_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return delete_stock(
        db,
        stock_id
    )