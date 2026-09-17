"""UTC datetime helpers for API responses.

DB columns store naive UTC. JSON must include a Z suffix so browsers
do not interpret timestamps as local time (which caused immediate
'Reservation expired' in UTC+ offset timezones).
"""

from datetime import datetime, timezone


def utc_now_naive() -> datetime:
    """Current UTC time as naive datetime (for DB DateTime columns)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_utc_iso_z(value: datetime | None) -> str | None:
    """Serialize a datetime as ISO-8601 UTC with trailing Z."""
    if value is None:
        return None
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    # Trim microseconds to milliseconds for JS-friendly parsing
    return value.strftime("%Y-%m-%dT%H:%M:%S.") + f"{value.microsecond // 1000:03d}Z"
