from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.stock_reservation import StockReservation
from app.utils.datetime_utc import utc_now_naive


def get_active_temporary_reserved_quantity(
    db: Session,
    branch_id: int,
    product_id: int,
):
    """
    Quantity of ACTIVE TEMPORARY reservations still blocking physical stock.

    CURRENT reservations do NOT count here: after order confirmation,
    physical stock is decremented, so counting CURRENT again would
    double-count sold units.

    TEMPORARY reservations only count while they have not expired.
    """

    now = utc_now_naive()

    result = (
        db.query(
            func.coalesce(
                func.sum(StockReservation.quantity),
                0,
            )
        )
        .filter(
            StockReservation.branch_id == branch_id,
            StockReservation.product_id == product_id,
            StockReservation.status == "ACTIVE",
            StockReservation.reservation_type == "TEMPORARY",
            (
                (StockReservation.expires_at.is_(None))
                |
                (StockReservation.expires_at > now)
            ),
        )
        .scalar()
    )

    return int(result or 0)


# Backwards-compatible alias used by older call sites / docs
def get_active_current_reserved_quantity(
    db: Session,
    branch_id: int,
    product_id: int,
):
    """
    Legacy name. Returns TEMPORARY reserved qty only
    (see get_active_temporary_reserved_quantity).
    """
    return get_active_temporary_reserved_quantity(
        db,
        branch_id,
        product_id,
    )


def get_active_future_committed_quantity(
    db: Session,
    branch_id: int,
    product_id: int,
):
    """
    Get quantity of future restock already committed
    to confirmed FUTURE orders.
    """

    result = (
        db.query(
            func.coalesce(
                func.sum(StockReservation.quantity),
                0,
            )
        )
        .filter(
            StockReservation.branch_id == branch_id,
            StockReservation.product_id == product_id,
            StockReservation.status == "ACTIVE",
            StockReservation.reservation_type == "FUTURE",
        )
        .scalar()
    )

    return int(result or 0)


def get_total_active_future_committed_quantity(db: Session) -> int:
    """
    Sum of all ACTIVE FUTURE reservation units across every branch/product.
    """

    result = (
        db.query(
            func.coalesce(
                func.sum(StockReservation.quantity),
                0,
            )
        )
        .filter(
            StockReservation.status == "ACTIVE",
            StockReservation.reservation_type == "FUTURE",
        )
        .scalar()
    )

    return int(result or 0)
