"""
Helper utilities for parsing, formatting, and calculating date/time values.
"""
from datetime import datetime, timedelta, timezone

def get_current_utc_time() -> datetime:
    """Returns the current date and time in UTC timezone."""
    return datetime.now(timezone.utc)

def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Formats a datetime object to a string format."""
    return dt.strftime(fmt)

def get_days_ago(days: int) -> datetime:
    """Returns the datetime instance representing n days ago."""
    return get_current_utc_time() - timedelta(days=days)
