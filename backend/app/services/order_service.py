from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.branch_stock import BranchStock
from app.models.stock_reservation import StockReservation

from app.repositories.order_repository import (
    get_order_by_id,
    get_orders_by_user,
    get_all_orders,
    update_order,
)

from app.services.allocation_service import allocate_order
from app.services.stock_reservation_service import (
    get_available_physical_stock,
    get_remaining_restock_quantity,
)
from app.utils.allocation import (
    calculate_processing_time,
    calculate_stock_wait,
)


def create_order(
    db: Session,
    user_id: int,
    customer_name: str,
    phone: str,
    delivery_address: str,
    latitude: float,
    longitude: float,
    order_note: str | None,
    payment_method: str,
):
    # 1. Get customer's cart
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        
        .first()
    )

    if not cart or not cart.items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty.",
        )

    # 2. Allocate the best branch
    selected_branch = allocate_order(
        db=db,
        cart_items=cart.items,
        customer_latitude=latitude,
        customer_longitude=longitude,
    )

    if not selected_branch:
        raise HTTPException(
            status_code=409,
            detail="No branch can currently fulfill this order.",
        )

    branch_id = selected_branch["branch_id"]

    # Snapshot processing time using the same rule as allocate_order / ETA
    processing_time_hours = (
        calculate_processing_time(
            selected_branch["distance_km"]
        ).total_seconds()
        / 3600
    )

    # 3. Calculate total
    total_amount = Decimal("0.00")

    for item in cart.items:
        total_amount += (
            Decimal(str(item.product.price)) * item.quantity
        )

    try:
        # 4. Create order (persist allocation snapshot from selected_branch)
        order = Order(
            user_id=user_id,
            branch_id=branch_id,
            customer_name=customer_name,
            phone=phone,
            delivery_address=delivery_address,
            latitude=latitude,
            longitude=longitude,
            order_note=order_note,
            status="ALLOCATED",
            total_amount=total_amount,
            payment_method=payment_method,
            payment_status="PENDING",
            allocation_distance_km=selected_branch["distance_km"],
            allocation_travel_time_hours=selected_branch[
                "travel_time_hours"
            ],
            allocation_stock_wait_hours=selected_branch[
                "stock_wait_hours"
            ],
            allocation_processing_time_hours=processing_time_hours,
            allocation_eta_hours=selected_branch["eta_hours"],
            allocation_workload_percentage=selected_branch[
                "workload_percentage"
            ],
            allocation_eta_score=selected_branch["eta_score"],
            allocation_workload_score=selected_branch[
                "workload_score"
            ],
            allocation_final_score=selected_branch["final_score"],
        )

        db.add(order)
        db.flush()

        # 5. Create order items + permanent reservations
        for cart_item in cart.items:

            stock = (
                db.query(BranchStock)
                .filter(
                    BranchStock.branch_id == branch_id,
                    BranchStock.product_id == cart_item.product_id,
                )
                .with_for_update()
                .first()
            )

            if not stock:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Product {cart_item.product_id} "
                        "is no longer available at the selected branch."
                    ),
                )

            # Current physical stock after existing reservations
            available_quantity = get_available_physical_stock(
                db=db,
                branch_id=branch_id,
                product_id=cart_item.product_id,
                physical_quantity=stock.quantity,
            )

            # Remaining incoming/restock quantity
            remaining_restock = get_remaining_restock_quantity(
                db=db,
                branch_id=branch_id,
                product_id=cart_item.product_id,
                restock_quantity=stock.restock_quantity,
            )

            # Determine whether this item is CURRENT or FUTURE
            stock_wait = calculate_stock_wait(
                available_quantity=available_quantity,
                requested_quantity=cart_item.quantity,
                restock_quantity=remaining_restock,
                restock_date=stock.restock_date,
            )

            if stock_wait is None:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Product {cart_item.product_id} "
                        "is no longer available."
                    ),
                )

            if available_quantity >= cart_item.quantity:
                reservation_type = "CURRENT"
                if stock.quantity < cart_item.quantity:
                    raise HTTPException(
                        status_code=409,
                        detail=(
                            f"Product {cart_item.product_id} "
                            "has insufficient physical stock."
                        ),
                    )
                # Decrement physical; CURRENT does not re-block available.
                stock.quantity -= cart_item.quantity
            else:
                reservation_type = "FUTURE"

            # Create order item
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                unit_price=cart_item.product.price,
            )

            db.add(order_item)

            # Create permanent reservation (operational link to order)
            reservation = StockReservation(
                user_id=user_id,
                cart_id=cart.id,
                order_id=order.id,
                branch_id=branch_id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                status="ACTIVE",
                reservation_type=reservation_type,
                expires_at=None,
            )

            db.add(reservation)

        # 6. Clear cart
        cart.items.clear()

        # 7. Commit everything together
        db.commit()

        db.refresh(order)

        return order

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create order.",
        )


def get_user_orders(db: Session, user_id: int):
    return get_orders_by_user(db, user_id)


def get_user_order(db: Session, user_id: int, order_id: int):
    order = get_order_by_id(db, order_id)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    if order.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access this order.",
        )

    return order


def get_orders(db: Session):
    return get_all_orders(db)


def update_order_status(
    db: Session,
    order_id: int,
    new_status: str,
):
    order = get_order_by_id(db, order_id)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    allowed_statuses = [
        "PENDING",
        "ALLOCATED",
        "CONFIRMED",
        "PROCESSING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
    ]

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status.",
        )

    order.status = new_status

    return update_order(db, order)
def cancel_order(db: Session, user_id: int, order_id: int):
    order = get_order_by_id(db, order_id)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    # Make sure the customer owns this order
    if order.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to cancel this order.",
        )

    # Cannot cancel completed/cancelled orders
    if order.status in ["DELIVERED", "CANCELLED"]:
        raise HTTPException(
            status_code=400,
            detail="This order cannot be cancelled.",
        )

    try:
        # Find all active reservations belonging to this order
        reservations = (
            db.query(StockReservation)
            .filter(
                StockReservation.order_id == order.id,
                StockReservation.status == "ACTIVE",
            )
            .all()
        )

        # Release CURRENT and FUTURE commitments
        for reservation in reservations:
            reservation.status = "CANCELLED"

        # Cancel the order
        order.status = "CANCELLED"

        db.commit()
        db.refresh(order)

        return order

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to cancel order.",
        )