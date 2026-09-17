from datetime import datetime,timedelta
from math import radians, sin, cos, sqrt, atan2

def calculate_available_stock(
    physical_quantity: int,
    reserved_quantity: int,
) -> int:
    """
    Calculate stock currently available for allocation.
    """

    available = physical_quantity - reserved_quantity

    return max(0, available)

def calculate_stock_wait(
    available_quantity: int,
    requested_quantity: int,
    restock_quantity: int,
    restock_date: datetime | None,
    now: datetime | None = None,
) -> float | None:
    """
    Calculate how long a branch must wait for enough stock.

    Returns:
        0.0  -> stock is available now
        hours -> stock will be available after scheduled restock
        None  -> branch cannot fulfill the requested quantity
    """

    # Stock available right now
    if available_quantity >= requested_quantity:
        return 0.0

    # Not enough stock now, so check scheduled restock
    if restock_date is None:
        return None

    if restock_quantity <= 0:
        return None

    # Check whether restock will provide enough additional stock
    if available_quantity + restock_quantity < requested_quantity:
        return None

    if now is None:
        now = datetime.utcnow()

    # Restock already arrived / is arriving now
    if restock_date <= now:
        return 0.0

    waiting_seconds = (restock_date - now).total_seconds()

    return waiting_seconds / 3600

def calculate_order_stock_wait(stock_wait_times: list[float | None]) -> float | None:
    """
    Calculate the stock waiting time for the complete order.

    Returns:
        0.0  -> all products are available now
        hours -> time until all required products are available
        None -> at least one product has no known way to become available
    """

    # If any product cannot be fulfilled
    if any(wait is None for wait in stock_wait_times):
        return None

    # All products are available now
    if not stock_wait_times:
        return 0.0

    return max(stock_wait_times)

def calculate_processing_time() -> timedelta:
    """
    Return the standard processing time required
    to pick, pack, and prepare an order.
    """

    return timedelta(days=1)

def calculate_distance_km(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
) -> float:
    """
    Calculate the approximate distance between two
    geographical coordinates using the Haversine formula.
    """

    earth_radius_km = 6371.0

    lat1 = radians(latitude1)
    lat2 = radians(latitude2)

    delta_lat = radians(latitude2 - latitude1)
    delta_lon = radians(longitude2 - longitude1)

    a = (
        sin(delta_lat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(delta_lon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius_km * c

from urllib.error import HTTPError, URLError
from urllib.request import urlopen


def calculate_road_travel_time(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
) -> tuple[float, float]:
    """
    Calculate road distance and travel time using OSRM.

    Returns:
        (distance_km, travel_time_hours)
    """

    url = (
        f"https://router.project-osrm.org/route/v1/driving/"
        f"{longitude1},{latitude1};{longitude2},{latitude2}"
    )

    params = {
        "overview": "false",
    }

    try:
        query = "&".join(f"{key}={value}" for key, value in params.items())
        with urlopen(f"{url}?{query}", timeout=5) as response:
            data = response.read()

        import json

        data = json.loads(data)

        if data["code"] != "Ok" or not data["routes"]:
            raise ValueError("OSRM could not find a route.")

        route = data["routes"][0]

        distance_km = route["distance"] / 1000
        travel_time_hours = route["duration"] / 3600

        return distance_km, travel_time_hours

    except (HTTPError, URLError, TimeoutError, ValueError, KeyError, TypeError):
        # Fallback if OSRM is unavailable
        distance_km = calculate_distance_km(
            latitude1,
            longitude1,
            latitude2,
            longitude2,
        )

        average_speed_kmh = 25.0
        travel_time_hours = distance_km / average_speed_kmh

        return distance_km, travel_time_hours

def calculate_expected_eta(
    stock_wait_hours: float,
    travel_time_hours: float,
) -> float:
    """
    Calculate the expected fulfillment ETA in hours.

    Expected ETA consists of:
    - Stock waiting time
    - Fixed processing time
    - Road travel time
    """

    processing_time = calculate_processing_time()

    processing_hours = processing_time.total_seconds() / 3600

    return (
        stock_wait_hours
        + processing_hours
        + travel_time_hours
    )
def calculate_eta_score(
    eta_hours: float,
    min_eta_hours: float,
    max_eta_hours: float,
) -> float:
    """
    Convert ETA into a score from 0 to 100.

    Lower ETA = higher score.
    """

    if max_eta_hours == min_eta_hours:
        return 100.0

    score = (
        (max_eta_hours - eta_hours)
        / (max_eta_hours - min_eta_hours)
    ) * 100

    return max(0.0, min(100.0, score))

def calculate_workload_percentage(
    active_orders: int,
    capacity: int,
) -> float:
    """
    Calculate how busy a branch currently is.

    Returns workload as a percentage from 0 to 100.
    """

    if capacity <= 0:
        raise ValueError("Branch capacity must be greater than 0.")

    return (active_orders / capacity) * 100

def calculate_workload_score(
    workload_percentage: float,
) -> float:
    """
    Convert workload percentage into a score from 0 to 100.

    Lower workload = higher score.
    """

    return max(0.0, min(100.0, 100.0 - workload_percentage))

def calculate_final_score(
    eta_score: float,
    workload_score: float,
) -> float:
    """
    Calculate the final branch allocation score.

    ETA contributes 60%.
    Workload contributes 40%.
    """

    return (
        (eta_score * 0.60)
        + (workload_score * 0.40)
    )

def select_best_branch(
    branches: list[dict],
) -> dict | None:
    """
    Select the best branch from eligible branches.

    Selection order:
    1. Higher final score
    2. Lower ETA
    3. Lower workload
    4. Lower branch ID
    """

    if not branches:
        return None

    return min(
        branches,
        key=lambda branch: (
            -branch["final_score"],
            branch["eta_hours"],
            branch["workload_percentage"],
            branch["branch_id"],
        ),
    )