from app.utils.allocation import calculate_stock_wait
from datetime import datetime, timedelta

print(
    calculate_stock_wait(
        available_quantity=10,
        requested_quantity=5,
        restock_quantity=0,
        restock_date=None,
    )
)

print(
    calculate_stock_wait(
        available_quantity=3,
        requested_quantity=5,
        restock_quantity=5,
        restock_date=datetime.utcnow() + timedelta(hours=4),
    )
)

print(
    calculate_stock_wait(
        available_quantity=3,
        requested_quantity=10,
        restock_quantity=5,
        restock_date=datetime.utcnow() + timedelta(hours=4),
    )
)