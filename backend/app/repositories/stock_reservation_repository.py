from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.stock_reservation import StockReservation
from app.utils.datetime_utc import utc_now_naive


def get_active_current_reserved_quantity(
    db: Session,
    branch_id: int,
    product_id: int,
):
    """
    Get quantity currently blocking physical stock.

    TEMPORARY reservations only count while they have
    not expired.

    CURRENT reservations never expire.
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
            (
                (StockReservation.reservation_type == "CURRENT")
                |
                (
                    (StockReservation.reservation_type == "TEMPORARY")
                    &
                    (
                        (StockReservation.expires_at.is_(None))
                        |
                        (StockReservation.expires_at > now)
                    )
                )
            ),
        )
        .scalar()
    )

    return int(result or 0)


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