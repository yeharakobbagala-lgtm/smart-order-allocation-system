"""Tests for UTC ISO serialization used by checkout hold responses."""

from datetime import datetime, timedelta, timezone

from app.utils.datetime_utc import to_utc_iso_z, utc_now_naive
from app.services.stock_reservation_service import TEMPORARY_RESERVATION_MINUTES


def test_temporary_reservation_minutes():
    assert TEMPORARY_RESERVATION_MINUTES == 10


def test_to_utc_iso_z_appends_z_for_naive():
    dt = datetime(2026, 9, 17, 8, 52, 30, 123000)
    iso = to_utc_iso_z(dt)
    assert iso is not None
    assert iso.endswith("Z")
    assert iso.startswith("2026-09-17T08:52:30")


def test_to_utc_iso_z_normalizes_aware():
    ist = timezone(timedelta(hours=5, minutes=30))
    dt = datetime(2026, 9, 17, 14, 22, 0, tzinfo=ist)
    iso = to_utc_iso_z(dt)
    assert iso is not None
    assert iso.endswith("Z")
    # 14:22 IST = 08:52 UTC
    assert "T08:52:00" in iso


def test_utc_now_naive_has_no_tzinfo():
    now = utc_now_naive()
    assert now.tzinfo is None


def test_checkout_hold_response_serializer_emits_z():
    from app.schemas.checkout import CheckoutHoldResponse
    from decimal import Decimal

    now = datetime(2026, 9, 17, 8, 52, 0)
    expires = now + timedelta(minutes=10)
    payload = CheckoutHoldResponse(
        hold_id=1,
        branch_id=1,
        branch_name="Shoply Colombo",
        distance_km=0.0,
        travel_time_hours=0.0,
        stock_wait_hours=0.0,
        processing_time_hours=24.0,
        eta_hours=24.0,
        estimated_delivery_date=now + timedelta(hours=24),
        estimated_delivery_end=now + timedelta(hours=26.4),
        reservation_ids=[1],
        expires_at=expires,
        items=[],
        subtotal=Decimal("35000"),
        delivery=Decimal("0"),
        total=Decimal("35000"),
        status="ACTIVE",
    )
    data = payload.model_dump(mode="json")
    assert str(data["expires_at"]).endswith("Z")
    assert str(data["estimated_delivery_date"]).endswith("Z")
    assert data["eta_hours"] == 24.0
    assert data["processing_time_hours"] == 24.0


if __name__ == "__main__":
    test_temporary_reservation_minutes()
    test_to_utc_iso_z_appends_z_for_naive()
    test_to_utc_iso_z_normalizes_aware()
    test_utc_now_naive_has_no_tzinfo()
    test_checkout_hold_response_serializer_emits_z()
    print("datetime utc tests ok")
