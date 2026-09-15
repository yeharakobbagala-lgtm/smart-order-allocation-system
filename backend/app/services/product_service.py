from sqlalchemy.orm import Session

from app.repositories.product_repository import get_all_products


def get_products(db: Session):
    return get_all_products(db)