from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


def get_all_products(db: Session) -> list[Product]:
    statement = select(Product).where(Product.active.is_(True))
    result = db.execute(statement)
    return list(result.scalars().all())

def create_product(db: Session, product: Product) -> Product:
    db.add(product)
    db.commit()
    db.refresh(product)

    return product