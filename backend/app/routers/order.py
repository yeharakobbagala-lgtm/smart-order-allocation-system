from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.order import OrderResponse


from app.services.order_service import (
    create_order,
    get_user_orders,
    get_user_order,
    get_orders,
    update_order_status,
    cancel_order,
)
from app.services.order_response import (
    build_order_response,
    build_order_responses,
)

from app.utils.security import (
    get_current_user,
    require_admin,
)

from app.schemas.order import (
    OrderCreate,
    OrderStatusUpdate,
    OrderResponse,
)


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


# =========================================================
# CUSTOMER - CREATE ORDER
# =========================================================

@router.post(
    "/",
    response_model=OrderResponse,
)
def create_customer_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    order = create_order(
        db=db,
        user_id=current_user["user_id"],
        customer_name=data.customer_name,
        phone=data.phone,
        delivery_address=data.delivery_address,
        latitude=data.latitude,
        longitude=data.longitude,
        order_note=data.order_note,
        payment_method=data.payment_method,
    )
    return build_order_response(db, order)


# =========================================================
# CUSTOMER - MY ORDERS
# =========================================================

@router.get(
    "/my",
    response_model=list[OrderResponse],
)
def my_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    orders = get_user_orders(
        db,
        current_user["user_id"],
    )
    return build_order_responses(db, orders)


# =========================================================
# CUSTOMER - SINGLE ORDER
# =========================================================

@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def my_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    order = get_user_order(
        db=db,
        user_id=current_user["user_id"],
        order_id=order_id,
    )
    return build_order_response(db, order)


# =========================================================
# ADMIN - ALL ORDERS
# =========================================================

@router.get(
    "/",
    response_model=list[OrderResponse],
)
def all_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):

    return build_order_responses(db, get_orders(db))


# =========================================================
# ADMIN - UPDATE STATUS
# =========================================================

@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
)
def change_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):

    order = update_order_status(
        db=db,
        order_id=order_id,
        new_status=data.status,
    )
    return build_order_response(db, order)

@router.patch("/{order_id}/cancel", response_model=OrderResponse)
def cancel_customer_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    order = cancel_order(
        db=db,
        user_id=current_user["user_id"],
        order_id=order_id,
    )
    return build_order_response(db, order)