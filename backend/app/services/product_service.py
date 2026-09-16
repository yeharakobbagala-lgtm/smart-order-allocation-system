from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.product_repository import (
    get_all_products,
    get_product_by_id,
    search_products,
    create_product as create_product_repository,
    update_product as update_product_repository,
    deactivate_product as deactivate_product_repository,
)
from app.schemas.product import ProductCreate


def get_products(db: Session):
    return get_all_products(db)


def create_product(
    db: Session,
    data: ProductCreate
):

    product = Product(
        name=data.name,
        description=data.description,
        price=data.price,
        image=data.image,
        active=data.active,
    )

    return create_product_repository(
        db,
        product
    )


def get_product(
    db: Session,
    product_id: int
):

    product = get_product_by_id(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    return product


def update_product(
    db: Session,
    product_id: int,
    data: ProductCreate
):

    product = get_product_by_id(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    product.name = data.name
    product.description = data.description
    product.price = data.price
    product.image = data.image
    product.active = data.active

    return update_product_repository(
        db,
        product
    )


def delete_product(
    db: Session,
    product_id: int
):

    product = get_product_by_id(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    return deactivate_product_repository(
        db,
        product
    )

def search_product(
    db: Session,
    search_term: str
):
    return search_products(
        db,
        search_term
    )