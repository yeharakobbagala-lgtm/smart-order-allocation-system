from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


def get_all_products(db: Session) -> list[Product]:
    statement = select(Product).where(
        Product.active.is_(True)
    )

    result = db.execute(statement)

    return list(result.scalars().all())


def get_product_by_id(
    db: Session,
    product_id: int
) -> Product | None:

    statement = select(Product).where(
        Product.id == product_id
    )

    result = db.execute(statement)

    return result.scalar_one_or_none()


def create_product(
    db: Session,
    product: Product
) -> Product:

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def update_product(
    db: Session,
    product: Product
) -> Product:

    db.commit()
    db.refresh(product)

    return product


def deactivate_product(
    db: Session,
    product: Product
) -> Product:

    product.active = False

    db.commit()
    db.refresh(product)

    return product

def search_products(
    db: Session,
    search_term: str
) -> list[Product]:

    statement = select(Product).where(
        Product.active.is_(True),
        Product.name.ilike(f"%{search_term}%")
    )

    result = db.execute(statement)

    return list(result.scalars().all())