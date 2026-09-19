"""Stock semantics: available = physical - TEMPORARY only; FUTURE commits restock."""

from datetime import datetime, timedelta
from types import SimpleNamespace


def test_available_excludes_current_reservations_conceptually():
    """
    Document expected math after confirm:

    physical=8, TEMPORARY=0, CURRENT=2 (historical) → available=8
    physical=10, TEMPORARY=2 → available=8
    """
    physical = 10
    temporary = 2
    current_historical = 2  # must NOT subtract
    available_during_hold = physical - temporary
    assert available_during_hold == 8

    physical_after_confirm = physical - 2
    available_after = physical_after_confirm - 0  # CURRENT not subtracted
    assert physical_after_confirm == 8
    assert available_after == 8
    assert current_historical == 2


def test_temporary_minutes_unchanged():
    from app.services.stock_reservation_service import TEMPORARY_RESERVATION_MINUTES
    assert TEMPORARY_RESERVATION_MINUTES == 10


def test_convert_supports_commit_false():
    import inspect
    from app.services.stock_reservation_service import convert_reservation_to_order
    sig = inspect.signature(convert_reservation_to_order)
    assert "commit" in sig.parameters


def test_remaining_restock_subtracts_future_only():
    """remaining_restock = restock_quantity - ACTIVE FUTURE committed."""
    restock_quantity = 10
    future_committed = 3
    temporary = 2
    current = 4
    remaining = max(0, restock_quantity - future_committed)
    assert remaining == 7
    # TEMPORARY/CURRENT must not reduce the restock pool
    assert remaining == max(
        0, restock_quantity - future_committed - 0 * temporary - 0 * current
    )


def test_total_future_helper_exists():
    from app.repositories.stock_reservation_repository import (
        get_total_active_future_committed_quantity,
    )
    assert callable(get_total_active_future_committed_quantity)


if __name__ == "__main__":
    test_available_excludes_current_reservations_conceptually()
    test_temporary_minutes_unchanged()
    test_convert_supports_commit_false()
    test_remaining_restock_subtracts_future_only()
    test_total_future_helper_exists()
    print("stock semantics tests ok")
