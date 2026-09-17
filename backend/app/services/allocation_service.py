from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.branch import Branch
from app.models.branch_stock import BranchStock

from app.services.stock_reservation_service import (
    get_available_physical_stock,
    get_remaining_restock_quantity,
)

from app.utils.allocation import (
    calculate_stock_wait,
    calculate_order_stock_wait,
    calculate_road_travel_time,
    calculate_expected_eta,
    calculate_workload_percentage,
    calculate_workload_score,
    calculate_eta_score,
    calculate_final_score,
    select_best_branch,
)


ACTIVE_ORDER_STATUSES = [
    "PENDING",
    "ALLOCATED",
    "CONFIRMED",
    "PROCESSING",
    "READY",
    "OUT_FOR_DELIVERY",
]


def get_branch_active_order_count(
    db: Session,
    branch_id: int,
):

    return (
        db.query(Order)
        .filter(
            Order.branch_id == branch_id,
            Order.status.in_(ACTIVE_ORDER_STATUSES),
        )
        .count()
    )

def check_branch_stock(
    db: Session,
    branch_id: int,
    cart_items: list,
) -> tuple[bool, float | None]:
    """
    Check whether a branch can fulfill the entire cart.

    Returns:
        (eligible, stock_wait_hours)
    """

    stock_wait_times = []

    for item in cart_items:

        stock = (
            db.query(BranchStock)
            .filter(
                BranchStock.branch_id == branch_id,
                BranchStock.product_id == item.product_id,
            )
            .first()
        )

        if not stock:
            return False, None

        available_quantity = get_available_physical_stock(
            db,
            branch_id,
            item.product_id,
            stock.quantity,
        )

        remaining_restock = get_remaining_restock_quantity(
            db,
            branch_id,
            item.product_id,
            stock.restock_quantity,
        )

        wait = calculate_stock_wait(
            available_quantity=available_quantity,
            requested_quantity=item.quantity,
            restock_quantity=remaining_restock,
            restock_date=stock.restock_date,
        )

        if wait is None:
            return False, None

        stock_wait_times.append(wait)

    order_stock_wait = calculate_order_stock_wait(
        stock_wait_times
    )

    return True, order_stock_wait


def calculate_branch_candidate(
    db: Session,
    branch: Branch,
    cart_items: list,
    customer_latitude: float,
    customer_longitude: float,
) -> dict | None:
    """
    Calculate allocation information for one branch.
    """

    # --------------------------------
    # 1. STOCK ELIGIBILITY
    # --------------------------------

    eligible, stock_wait_hours = check_branch_stock(
        db,
        branch.id,
        cart_items,
    )

    if not eligible:
        return None

    if stock_wait_hours is None:
        return None

    # --------------------------------
    # 2. WORKLOAD
    # --------------------------------

    active_orders = get_branch_active_order_count(
        db,
        branch.id,
    )

    workload_percentage = calculate_workload_percentage(
        active_orders,
        branch.capacity,
    )

    # Branch is full
    if active_orders >= branch.capacity:
        return None

    workload_score = calculate_workload_score(
        workload_percentage
    )

    # --------------------------------
    # 3. TRAVEL TIME
    # --------------------------------

    distance_km, travel_time_hours = calculate_road_travel_time(
        customer_latitude,
        customer_longitude,
        branch.latitude,
        branch.longitude,
    )

    # --------------------------------
    # 4. EXPECTED ETA
    # --------------------------------

    eta_hours = calculate_expected_eta(
        stock_wait_hours,
        travel_time_hours,
        distance_km,
    )

    return {
        "branch_id": branch.id,
        "branch_name": branch.name,
        "distance_km": distance_km,
        "travel_time_hours": travel_time_hours,
        "stock_wait_hours": stock_wait_hours,
        "eta_hours": eta_hours,
        "active_orders": active_orders,
        "capacity": branch.capacity,
        "workload_percentage": workload_percentage,
        "workload_score": workload_score,
    }


def allocate_order(
    db: Session,
    cart_items: list,
    customer_latitude: float,
    customer_longitude: float,
) -> dict | None:
    """
    Find the best branch for an order.
    """

    branches = (
        db.query(Branch)
        .filter(Branch.active == True)
        .all()
    )

    candidates = []

    for branch in branches:

        candidate = calculate_branch_candidate(
            db,
            branch,
            cart_items,
            customer_latitude,
            customer_longitude,
        )

        if candidate:
            candidates.append(candidate)

    if not candidates:
        return None

    # --------------------------------
    # ETA SCORE
    # --------------------------------

    min_eta = min(
        candidate["eta_hours"]
        for candidate in candidates
    )

    max_eta = max(
        candidate["eta_hours"]
        for candidate in candidates
    )

    for candidate in candidates:

        candidate["eta_score"] = calculate_eta_score(
            candidate["eta_hours"],
            min_eta,
            max_eta,
        )

        candidate["final_score"] = calculate_final_score(
            candidate["eta_score"],
            candidate["workload_score"],
        )

    # --------------------------------
    # SELECT BEST BRANCH
    # --------------------------------

    best_branch = select_best_branch(
        candidates
    )

    return best_branch