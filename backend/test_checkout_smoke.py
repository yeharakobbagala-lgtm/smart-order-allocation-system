"""Smoke tests for checkout hold/confirm service helpers (no DB required for pure helpers)."""

from datetime import datetime, timedelta

from app.services.stock_reservation_service import TEMPORARY_RESERVATION_MINUTES
from app.utils.allocation import calculate_processing_time


def test_temporary_reservation_is_ten_minutes():
    assert TEMPORARY_RESERVATION_MINUTES == 10


def test_processing_time_by_road_distance():
    assert calculate_processing_time(40) == timedelta(days=1)
    assert calculate_processing_time(30) == timedelta(days=1)
    assert calculate_processing_time(40.1) == timedelta(days=2)
    assert calculate_processing_time(100) == timedelta(days=2)
    assert calculate_processing_time(40).total_seconds() / 3600 == 24
    assert calculate_processing_time(40.1).total_seconds() / 3600 == 48


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
    test_processing_time_by_road_distance()
    test_eta_to_delivery_window()
    print("checkout smoke tests ok")
