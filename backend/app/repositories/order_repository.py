from sqlalchemy.orm import Session

from app.models.order import Order


def create_order(db: Session, order: Order):
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order_by_id(db: Session, order_id: int):
    return (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )


def get_orders_by_user(db: Session, user_id: int):
    return (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )


def get_all_orders(db: Session):
    return (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .all()
    )


def update_order(db: Session, order: Order):
    db.commit()
    db.refresh(order)
    return order