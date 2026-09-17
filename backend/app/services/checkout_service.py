from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.branch_stock import BranchStock
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.checkout_hold import CheckoutHold
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.stock_reservation import StockReservation
from app.services.allocation_service import allocate_order
from app.services.stock_reservation_service import (
    TEMPORARY_RESERVATION_MINUTES,
    cancel_reservation,
    convert_reservation_to_order,
    create_temporary_reservation,
    get_remaining_restock_quantity,
)
from app.utils.allocation import (
    calculate_processing_time,
    calculate_stock_wait,
)
from app.utils.datetime_utc import utc_now_naive


def _get_user_cart(db: Session, user_id: int) -> Cart:
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.user_id == user_id)
        .first()
    )

    if not cart or not cart.items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty.",
        )

    return cart


def _cancel_active_temporary_for_cart(
    db: Session,
    user_id: int,
    cart_id: int,
) -> None:
    reservations = (
        db.query(StockReservation)
        .filter(
            StockReservation.user_id == user_id,
            StockReservation.cart_id == cart_id,
            StockReservation.status == "ACTIVE",
            StockReservation.reservation_type == "TEMPORARY",
        )
        .all()
    )

    for reservation in reservations:
        cancel_reservation(db, reservation)


def _expire_active_holds_for_user(db: Session, user_id: int) -> None:
    now = utc_now_naive()
    holds = (
        db.query(CheckoutHold)
        .filter(
            CheckoutHold.user_id == user_id,
            CheckoutHold.status == "ACTIVE",
        )
        .all()
    )

    for hold in holds:
        hold.status = "CANCELLED" if hold.expires_at > now else "EXPIRED"

    if holds:
        db.commit()


def _build_preview(
    db: Session,
    hold: CheckoutHold,
    reservations: list[StockReservation],
    cart_items: list[CartItem],
) -> dict:
    product_by_id = {
        item.product_id: item.product for item in cart_items
    }
    reservation_by_product = {
        r.product_id: r for r in reservations
    }

    items = []
    for cart_item in cart_items:
        product = product_by_id[cart_item.product_id]
        reservation = reservation_by_product[cart_item.product_id]
        unit_price = Decimal(str(product.price))
        line_total = unit_price * cart_item.quantity
        items.append(
            {
                "product_id": cart_item.product_id,
                "product_name": product.name,
                "quantity": cart_item.quantity,
                "unit_price": unit_price,
                "line_total": line_total,
                "reservation_id": reservation.id,
            }
        )

    branch_name = hold.branch.name if hold.branch else f"Branch #{hold.branch_id}"

    return {
        "hold_id": hold.id,
        "branch_id": hold.branch_id,
        "branch_name": branch_name,
        "distance_km": hold.allocation_distance_km,
        "travel_time_hours": hold.allocation_travel_time_hours,
        "stock_wait_hours": hold.allocation_stock_wait_hours,
        "processing_time_hours": hold.allocation_processing_time_hours,
        "eta_hours": hold.allocation_eta_hours,
        "estimated_delivery_date": hold.estimated_delivery_date,
        "estimated_delivery_end": hold.estimated_delivery_end,
        "reservation_ids": [r.id for r in reservations],
        "expires_at": hold.expires_at,
        "items": items,
        "subtotal": Decimal(str(hold.subtotal)),
        "delivery": Decimal(str(hold.delivery_fee)),
        "total": Decimal(str(hold.total_amount)),
        "status": hold.status,
    }


def create_checkout_hold(
    db: Session,
    user_id: int,
    customer_name: str,
    phone: str,
    delivery_address: str,
    latitude: float,
    longitude: float,
    order_note: str | None,
    payment_method: str,
) -> dict:
    cart = _get_user_cart(db, user_id)

    # Release any prior temporary hold for this cart
    _expire_active_holds_for_user(db, user_id)
    _cancel_active_temporary_for_cart(db, user_id, cart.id)

    # Fresh allocation (includes stock eligibility)
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
    processing_time_hours = (
        calculate_processing_time(
            selected_branch["distance_km"]
        ).total_seconds()
        / 3600
    )

    subtotal = Decimal("0.00")
    for item in cart.items:
        subtotal += Decimal(str(item.product.price)) * item.quantity

    delivery_fee = Decimal("0.00")
    total_amount = subtotal + delivery_fee

    now = utc_now_naive()
    eta_hours = float(selected_branch["eta_hours"])
    estimated_delivery_date = now + timedelta(hours=eta_hours)
    # Narrow window derived from ETA only (10% of ETA, minimum 1 hour)
    window_hours = max(1.0, eta_hours * 0.1)
    estimated_delivery_end = estimated_delivery_date + timedelta(
        hours=window_hours
    )

    created_reservations: list[StockReservation] = []

    try:
        for cart_item in cart.items:
            reservation = create_temporary_reservation(
                db=db,
                user_id=user_id,
                cart_id=cart.id,
                branch_id=branch_id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
            )
            created_reservations.append(reservation)

        # Server expires_at is the source of truth (from reservation service)
        expires_at = min(r.expires_at for r in created_reservations)

        hold = CheckoutHold(
            user_id=user_id,
            cart_id=cart.id,
            branch_id=branch_id,
            customer_name=customer_name,
            phone=phone,
            delivery_address=delivery_address,
            latitude=latitude,
            longitude=longitude,
            order_note=order_note,
            payment_method=payment_method or "COD",
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
            estimated_delivery_date=estimated_delivery_date,
            estimated_delivery_end=estimated_delivery_end,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            expires_at=expires_at,
            status="ACTIVE",
            created_at=now,
        )

        db.add(hold)
        db.commit()
        db.refresh(hold)

        # Ensure branch relationship is loaded for preview
        _ = hold.branch

        return _build_preview(db, hold, created_reservations, cart.items)

    except HTTPException:
        for reservation in created_reservations:
            try:
                cancel_reservation(db, reservation)
            except HTTPException:
                pass
        raise

    except Exception:
        for reservation in created_reservations:
            try:
                cancel_reservation(db, reservation)
            except HTTPException:
                pass
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create checkout reservation.",
        )


def _validate_hold_reservations(
    db: Session,
    hold: CheckoutHold,
) -> list[StockReservation]:
    """
    Validate hold + TEMPORARY reservations.
    Does not commit — caller owns the transaction.
    """
    now = utc_now_naive()

    if hold.status != "ACTIVE":
        raise HTTPException(
            status_code=409,
            detail="Checkout reservation is no longer active.",
        )

    if hold.expires_at <= now:
        hold.status = "EXPIRED"
        raise HTTPException(
            status_code=409,
            detail="Reservation has expired.",
        )

    reservations = (
        db.query(StockReservation)
        .filter(
            StockReservation.user_id == hold.user_id,
            StockReservation.cart_id == hold.cart_id,
            StockReservation.branch_id == hold.branch_id,
            StockReservation.status == "ACTIVE",
            StockReservation.reservation_type == "TEMPORARY",
            StockReservation.order_id.is_(None),
        )
        .with_for_update()
        .all()
    )

    if not reservations:
        hold.status = "EXPIRED"
        raise HTTPException(
            status_code=409,
            detail="Reservation has expired.",
        )

    for reservation in reservations:
        if reservation.expires_at is not None and reservation.expires_at <= now:
            reservation.status = "EXPIRED"
            hold.status = "EXPIRED"
            raise HTTPException(
                status_code=409,
                detail="Reservation has expired.",
            )

        if reservation.quantity <= 0:
            raise HTTPException(
                status_code=409,
                detail="Reservation no longer covers the requested quantity.",
            )

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.id == hold.cart_id)
        .with_for_update(of=Cart)
        .first()
    )

    if not cart or not cart.items:
        raise HTTPException(
            status_code=409,
            detail="Cart no longer matches the reservation.",
        )

    reserved_by_product = {
        r.product_id: r.quantity for r in reservations
    }

    for cart_item in cart.items:
        reserved_qty = reserved_by_product.get(cart_item.product_id, 0)
        if reserved_qty < cart_item.quantity:
            raise HTTPException(
                status_code=409,
                detail="Reservation no longer covers the requested quantity.",
            )

    if len(reservations) < len(cart.items):
        raise HTTPException(
            status_code=409,
            detail="Reservation no longer covers the requested quantity.",
        )

    return reservations


def resolve_confirm_reservation_type(
    *,
    physical_quantity: int,
    requested_quantity: int,
    remaining_restock: int,
    restock_date: datetime | None,
    product_id: int,
    now: datetime | None = None,
) -> str:
    """
    Decide CURRENT vs FUTURE for one confirm line item.

    CURRENT: physical stock covers the request (caller deducts physical).
    FUTURE: physical is short, but scheduled restock within 7 days covers it
            (physical is left unchanged).
    """
    if now is None:
        now = utc_now_naive()

    if physical_quantity >= requested_quantity:
        return "CURRENT"

    if restock_date is None or remaining_restock <= 0:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Product {product_id} is unavailable; "
                "restock is missing or insufficient."
            ),
        )

    if physical_quantity + remaining_restock < requested_quantity:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Product {product_id} is unavailable; "
                "restock is insufficient."
            ),
        )

    if restock_date > now + timedelta(days=7):
        raise HTTPException(
            status_code=409,
            detail=(
                f"Product {product_id} is unavailable; "
                "its restock is too late."
            ),
        )

    return "FUTURE"


def confirm_checkout_hold(
    db: Session,
    user_id: int,
    hold_id: int,
) -> Order:
    """
    Atomically confirm a checkout hold:

    validate → lock stock → create order/items → decrease physical
    → convert TEMPORARY → CURRENT/FUTURE → mark hold → clear cart → COMMIT
    """
    hold = (
        db.query(CheckoutHold)
        .filter(
            CheckoutHold.id == hold_id,
            CheckoutHold.user_id == user_id,
        )
        .with_for_update()
        .first()
    )

    if not hold:
        raise HTTPException(
            status_code=404,
            detail="Checkout reservation not found.",
        )

    try:
        reservations = _validate_hold_reservations(db, hold)

        cart = (
            db.query(Cart)
            .options(joinedload(Cart.items).joinedload(CartItem.product))
            .filter(Cart.id == hold.cart_id, Cart.user_id == user_id)
            .with_for_update(of=Cart)
            .first()
        )

        if not cart or not cart.items:
            raise HTTPException(
                status_code=409,
                detail="Cart is empty.",
            )

        branch_id = hold.branch_id
        reservation_by_product = {
            r.product_id: r for r in reservations
        }

        order = Order(
            user_id=user_id,
            branch_id=branch_id,
            customer_name=hold.customer_name,
            phone=hold.phone,
            delivery_address=hold.delivery_address,
            latitude=hold.latitude,
            longitude=hold.longitude,
            order_note=hold.order_note,
            status="ALLOCATED",
            total_amount=hold.total_amount,
            payment_method=hold.payment_method,
            payment_status="PENDING",
            estimated_delivery_date=hold.estimated_delivery_date,
            allocation_distance_km=hold.allocation_distance_km,
            allocation_travel_time_hours=hold.allocation_travel_time_hours,
            allocation_stock_wait_hours=hold.allocation_stock_wait_hours,
            allocation_processing_time_hours=hold.allocation_processing_time_hours,
            allocation_eta_hours=hold.allocation_eta_hours,
            allocation_workload_percentage=hold.allocation_workload_percentage,
            allocation_eta_score=hold.allocation_eta_score,
            allocation_workload_score=hold.allocation_workload_score,
            allocation_final_score=hold.allocation_final_score,
        )

        db.add(order)
        db.flush()

        for cart_item in cart.items:
            reservation = reservation_by_product.get(cart_item.product_id)
            if not reservation:
                raise HTTPException(
                    status_code=409,
                    detail="Reservation no longer covers the requested quantity.",
                )

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

            remaining_restock = get_remaining_restock_quantity(
                db=db,
                branch_id=branch_id,
                product_id=cart_item.product_id,
                restock_quantity=stock.restock_quantity,
            )

            # Use truthful physical quantity — do not treat our TEMPORARY
            # hold as if physical stock already exists.
            stock_wait = calculate_stock_wait(
                available_quantity=stock.quantity,
                requested_quantity=cart_item.quantity,
                restock_quantity=remaining_restock,
                restock_date=stock.restock_date,
            )

            if stock_wait is None:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Product {cart_item.product_id} is unavailable; "
                        "restock is missing or insufficient."
                    ),
                )

            reservation_type = resolve_confirm_reservation_type(
                physical_quantity=stock.quantity,
                requested_quantity=cart_item.quantity,
                remaining_restock=remaining_restock,
                restock_date=stock.restock_date,
                product_id=cart_item.product_id,
            )

            if reservation_type == "CURRENT":
                # Decrement physical for in-stock fulfillment only.
                # CURRENT will not reduce available again (TEMPORARY-only).
                stock.quantity -= cart_item.quantity
            # FUTURE commits restock pool only — physical unchanged

            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                unit_price=cart_item.product.price,
            )
            db.add(order_item)

            convert_reservation_to_order(
                db=db,
                reservation=reservation,
                order_id=order.id,
                reservation_type=reservation_type,
                commit=False,
            )

        hold.status = "CONFIRMED"
        cart.items.clear()

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
            detail="Failed to confirm order.",
        )


# Re-export constant for docs/tests
__all__ = [
    "create_checkout_hold",
    "confirm_checkout_hold",
    "resolve_confirm_reservation_type",
    "TEMPORARY_RESERVATION_MINUTES",
]
