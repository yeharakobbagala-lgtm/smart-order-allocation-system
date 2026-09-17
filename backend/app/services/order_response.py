"""Read-only helpers to expose existing reservation status on order responses."""

from sqlalchemy.orm import Session

from app.models.branch_stock import BranchStock
from app.models.order import Order
from app.models.stock_reservation import StockReservation
from app.schemas.order import OrderItemResponse, OrderResponse


def build_order_response(db: Session, order: Order) -> OrderResponse:
    """
    Serialize an order and attach existing ACTIVE reservation types
    (and FUTURE restock dates) to each order item for customer display.

    Does not create, modify, or convert reservations.
    """
    reservations = (
        db.query(StockReservation)
        .filter(
            StockReservation.order_id == order.id,
            StockReservation.status == "ACTIVE",
        )
        .all()
    )
    reservation_by_product = {
        reservation.product_id: reservation for reservation in reservations
    }

    restock_by_product: dict[int, object | None] = {}
    if order.branch_id is not None:
        product_ids = [item.product_id for item in order.order_items]
        if product_ids:
            stocks = (
                db.query(BranchStock)
                .filter(
                    BranchStock.branch_id == order.branch_id,
                    BranchStock.product_id.in_(product_ids),
                )
                .all()
            )
            restock_by_product = {
                stock.product_id: stock.restock_date for stock in stocks
            }

    items: list[OrderItemResponse] = []
    for item in order.order_items:
        reservation = reservation_by_product.get(item.product_id)
        reservation_type = (
            reservation.reservation_type if reservation is not None else None
        )
        restock_date = None
        if reservation_type == "FUTURE":
            restock_date = restock_by_product.get(item.product_id)

        items.append(
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                reservation_type=reservation_type,
                restock_date=restock_date,
            )
        )

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        branch_id=order.branch_id,
        customer_name=order.customer_name,
        phone=order.phone,
        delivery_address=order.delivery_address,
        latitude=order.latitude,
        longitude=order.longitude,
        order_note=order.order_note,
        status=order.status,
        total_amount=order.total_amount,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        estimated_delivery_date=order.estimated_delivery_date,
        allocation_distance_km=order.allocation_distance_km,
        allocation_travel_time_hours=order.allocation_travel_time_hours,
        allocation_stock_wait_hours=order.allocation_stock_wait_hours,
        allocation_processing_time_hours=order.allocation_processing_time_hours,
        allocation_eta_hours=order.allocation_eta_hours,
        allocation_workload_percentage=order.allocation_workload_percentage,
        allocation_eta_score=order.allocation_eta_score,
        allocation_workload_score=order.allocation_workload_score,
        allocation_final_score=order.allocation_final_score,
        created_at=order.created_at,
        updated_at=order.updated_at,
        order_items=items,
    )


def build_order_responses(db: Session, orders: list[Order]) -> list[OrderResponse]:
    return [build_order_response(db, order) for order in orders]
