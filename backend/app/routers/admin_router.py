from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.repositories.stock_reservation_repository import (
    get_total_active_future_committed_quantity,
)
from app.schemas.admin import AdminUserResponse, UpdateUserRoleRequest
from app.services.admin_service import get_users, update_user_role
from app.utils.security import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[AdminUserResponse])
def read_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return get_users(db)


@router.get("/reservations/future-summary")
def read_future_reservation_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Total ACTIVE FUTURE reservation units across all branches/products.
    Does not include TEMPORARY or CURRENT reservations.
    """

    total_future_units = get_total_active_future_committed_quantity(db)
    return {
        "total_future_units": total_future_units,
    }


@router.patch("/users/{user_id}/role", response_model=AdminUserResponse)
def change_user_role(
    user_id: int,
    request: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    try:
        return update_user_role(
            db=db,
            user_id=user_id,
            new_role=request.role,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )