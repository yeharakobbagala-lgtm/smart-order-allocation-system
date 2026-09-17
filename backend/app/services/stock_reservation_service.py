from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.stock_reservation import StockReservation

from app.repositories.stock_reservation_repository import (
    get_active_temporary_reserved_quantity,
    get_active_future_committed_quantity,
)
from app.utils.datetime_utc import utc_now_naive


# =========================================================
# CONSTANTS
# =========================================================

TEMPORARY_RESERVATION_MINUTES = 10


# =========================================================
# PHYSICAL STOCK AVAILABILITY
# =========================================================

def get_available_physical_stock(
    db: Session,
    branch_id: int,
    product_id: int,
    physical_quantity: int,
):
    """
    Calculate stock that is currently available for new allocation.

    Available =
        Physical stock
        - ACTIVE unexpired TEMPORARY reservations

    CURRENT reservations do not reduce available again: confirmed
    purchases already decremented physical stock.
    """

    reserved_quantity = get_active_temporary_reserved_quantity(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
    )

    return max(
        0,
        physical_quantity - reserved_quantity,
    )


# =========================================================
# FUTURE RESTOCK AVAILABILITY
# =========================================================

def get_remaining_restock_quantity(
    db: Session,
    branch_id: int,
    product_id: int,
    restock_quantity: int,
):
    """
    Calculate how much scheduled restock is still available.

    Remaining restock =
        Total restock quantity
        - ACTIVE FUTURE commitments
    """

    committed_quantity = get_active_future_committed_quantity(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
    )

    return max(
        0,
        restock_quantity - committed_quantity,
    )


# =========================================================
# CREATE TEMPORARY RESERVATION
# =========================================================

def create_temporary_reservation(
    db: Session,
    user_id: int,
    cart_id: int,
    branch_id: int,
    product_id: int,
    quantity: int,
):
    """
    Create a temporary reservation during checkout.

    The reservation remains active for 10 minutes.
    """

    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation quantity must be greater than zero.",
        )

    now = utc_now_naive()

    reservation = StockReservation(
        user_id=user_id,
        cart_id=cart_id,
        order_id=None,
        branch_id=branch_id,
        product_id=product_id,
        quantity=quantity,
        reserved_at=now,
        expires_at=now + timedelta(
            minutes=TEMPORARY_RESERVATION_MINUTES
        ),
        status="ACTIVE",
        reservation_type="TEMPORARY",
    )

    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return reservation


# =========================================================
# CONVERT TEMPORARY RESERVATION TO ORDER RESERVATION
# =========================================================

def convert_reservation_to_order(
    db: Session,
    reservation: StockReservation,
    order_id: int,
    reservation_type: str,
    *,
    commit: bool = True,
):
    """
    Convert a TEMPORARY reservation into CURRENT or FUTURE
    after the customer confirms the order.

    When commit=False, the caller owns the transaction
    (used by atomic checkout confirm).
    """

    if reservation.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation is no longer active.",
        )

    if reservation.reservation_type != "TEMPORARY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only temporary reservations can be converted.",
        )

    if reservation.expires_at is not None:

        if reservation.expires_at <= utc_now_naive():

            reservation.status = "EXPIRED"

            if commit:
                db.commit()

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Reservation has expired.",
            )

    if reservation_type not in [
        "CURRENT",
        "FUTURE",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reservation type.",
        )

    reservation.order_id = order_id
    reservation.reservation_type = reservation_type
    reservation.expires_at = None

    if commit:
        db.commit()
        db.refresh(reservation)

    return reservation


# =========================================================
# EXPIRE RESERVATION
# =========================================================

def expire_reservation(
    db: Session,
    reservation: StockReservation,
):
    """
    Mark an active reservation as expired.
    """

    if reservation.status == "ACTIVE":

        reservation.status = "EXPIRED"

        db.commit()
        db.refresh(reservation)

    return reservation


# =========================================================
# CANCEL RESERVATION
# =========================================================

def cancel_reservation(
    db: Session,
    reservation: StockReservation,
):
    """
    Cancel an active reservation.

    This releases the stock commitment because
    cancelled reservations are no longer counted
    by the reservation repository.
    """

    if reservation.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation is not active.",
        )

    reservation.status = "CANCELLED"

    db.commit()
    db.refresh(reservation)

    return reservation