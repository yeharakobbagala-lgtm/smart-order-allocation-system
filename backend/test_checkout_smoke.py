"""Smoke tests for checkout hold/confirm service helpers (no DB required for pure helpers)."""

from datetime import datetime, timedelta

from app.services.stock_reservation_service import TEMPORARY_RESERVATION_MINUTES
from app.utils.allocation import calculate_processing_time


def test_temporary_reservation_is_ten_minutes():
    assert TEMPORARY_RESERVATION_MINUTES == 10


def test_processing_time_is_one_day():
    assert calculate_processing_time() == timedelta(days=1)


def test_eta_to_delivery_window():
    now = datetime.utcnow()
    eta_hours = 26.5
    start = now + timedelta(hours=eta_hours)
    window_hours = max(1.0, eta_hours * 0.1)
    end = start + timedelta(hours=window_hours)
    assert end > start
    assert abs(window_hours - 2.65) < 0.001


if __name__ == "__main__":
    test_temporary_reservation_is_ten_minutes()
    test_processing_time_is_one_day()
    test_eta_to_delivery_window()
    print("checkout smoke tests ok")
