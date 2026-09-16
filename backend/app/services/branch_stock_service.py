from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.branch import Branch
from app.models.product import Product
from app.models.branch_stock import BranchStock

from app.repositories.branch_stock_repository import (
    get_all_stock,
    get_stock_by_id,
    get_stock_by_branch_product,
    create_stock as create_stock_repository,
    update_stock as update_stock_repository,
    delete_stock as delete_stock_repository,
)

from app.schemas.branch_stock import (
    BranchStockCreate,
    BranchStockUpdate,
)


def get_stock(db: Session):

    return get_all_stock(db)


def create_stock(
    db: Session,
    data: BranchStockCreate
):

    # Check branch exists
    branch = (
        db.query(Branch)
        .filter(Branch.id == data.branch_id)
        .first()
    )

    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found."
        )

    # Check product exists
    product = (
        db.query(Product)
        .filter(Product.id == data.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    # Don't add stock for inactive products
    if not product.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add stock for an inactive product."
        )

    # Prevent duplicate branch + product
    existing_stock = get_stock_by_branch_product(
        db,
        data.branch_id,
        data.product_id
    )

    if existing_stock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Stock already exists for this product at this branch."
        )

    stock = BranchStock(
        branch_id=data.branch_id,
        product_id=data.product_id,
        quantity=data.quantity
    )

    return create_stock_repository(
        db,
        stock
    )


def update_stock(
    db: Session,
    stock_id: int,
    data: BranchStockUpdate
):

    stock = get_stock_by_id(
        db,
        stock_id
    )

    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock record not found."
        )

    stock.quantity = data.quantity

    return update_stock_repository(
        db,
        stock
    )


def delete_stock(
    db: Session,
    stock_id: int
):

    stock = get_stock_by_id(
        db,
        stock_id
    )

    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock record not found."
        )

    delete_stock_repository(
        db,
        stock
    )

    return {
        "message": "Stock record deleted successfully."
    }