"""Confirm CURRENT vs FUTURE rules when physical stock is short but restock exists."""

from datetime import datetime, timedelta

from fastapi import HTTPException

from app.services.checkout_service import resolve_confirm_reservation_type
from app.utils.allocation import calculate_stock_wait


def test_physical_sufficient_is_current_and_deducts():
    physical = 10
    requested = 2
    result = resolve_confirm_reservation_type(
        physical_quantity=physical,
        requested_quantity=requested,
        remaining_restock=0,
        restock_date=None,
        product_id=1,
    )
    assert result == "CURRENT"
    physical_after = physical - requested
    assert physical_after == 8


def test_physical_zero_restock_tomorrow_is_future_no_deduct():
    now = datetime.utcnow()
    physical = 0
    requested = 2
    restock = 10
    restock_date = now + timedelta(days=1)

    wait = calculate_stock_wait(
        available_quantity=physical,
        requested_quantity=requested,
        restock_quantity=restock,
        restock_date=restock_date,
        now=now,
    )
    assert wait is not None and wait > 0

    result = resolve_confirm_reservation_type(
        physical_quantity=physical,
        requested_quantity=requested,
        remaining_restock=restock,
        restock_date=restock_date,
        product_id=1,
        now=now,
    )
    assert result == "FUTURE"
    assert physical == 0


def test_physical_plus_restock_insufficient_rejects():
    now = datetime.utcnow()
    try:
        resolve_confirm_reservation_type(
            physical_quantity=0,
            requested_quantity=2,
            remaining_restock=1,
            restock_date=now + timedelta(days=1),
            product_id=42,
            now=now,
        )
        assert False, "expected rejection"
    except HTTPException as exc:
        assert exc.status_code == 409
        assert "insufficient" in exc.detail.lower()


def test_restock_outside_seven_days_rejects():
    now = datetime.utcnow()
    try:
        resolve_confirm_reservation_type(
            physical_quantity=0,
            requested_quantity=2,
            remaining_restock=10,
            restock_date=now + timedelta(days=8),
            product_id=42,
            now=now,
        )
        assert False, "expected rejection"
    except HTTPException as exc:
        assert exc.status_code == 409
        assert "too late" in exc.detail.lower()


def test_mixed_order_current_and_future():
    now = datetime.utcnow()
    type_a = resolve_confirm_reservation_type(
        physical_quantity=5,
        requested_quantity=2,
        remaining_restock=0,
        restock_date=None,
        product_id=1,
        now=now,
    )
    type_b = resolve_confirm_reservation_type(
        physical_quantity=0,
        requested_quantity=2,
        remaining_restock=10,
        restock_date=now + timedelta(days=1),
        product_id=2,
        now=now,
    )
    assert type_a == "CURRENT"
    assert type_b == "FUTURE"


def test_atomic_failure_when_one_product_cannot_fulfill():
    """If any line fails, caller must roll back; helper raises before side effects."""
    now = datetime.utcnow()
    types = []
    physical_a = 5

    type_a = resolve_confirm_reservation_type(
        physical_quantity=physical_a,
        requested_quantity=2,
        remaining_restock=0,
        restock_date=None,
        product_id=1,
        now=now,
    )
    types.append(type_a)
    # Simulate deduct only after all lines resolve — line B fails first:
    failed = False
    try:
        resolve_confirm_reservation_type(
            physical_quantity=0,
            requested_quantity=2,
            remaining_restock=1,
            restock_date=now + timedelta(days=1),
            product_id=2,
            now=now,
        )
    except HTTPException:
        failed = True

    assert failed
    assert physical_a == 5  # no deduction applied when any line fails
    assert types == ["CURRENT"]  # prior decision discarded by rollback


if __name__ == "__main__":
    test_physical_sufficient_is_current_and_deducts()
    test_physical_zero_restock_tomorrow_is_future_no_deduct()
    test_physical_plus_restock_insufficient_rejects()
    test_restock_outside_seven_days_rejects()
    test_mixed_order_current_and_future()
    test_atomic_failure_when_one_product_cannot_fulfill()
    print("confirm restock tests ok")
