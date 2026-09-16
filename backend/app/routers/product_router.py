from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.product import (
    ProductCreate,
    ProductResponse,
)

from app.services.product_service import (
    get_products,
    create_product,
    get_product,
    search_product,
    update_product,
    delete_product,
)

from app.utils.security import require_admin


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


# --------------------------------
# CUSTOMER / PUBLIC
# --------------------------------

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def read_products(
    db: Session = Depends(get_db)
):
    return get_products(db)


# --------------------------------
# ADMIN ONLY
# --------------------------------

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def add_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return create_product(
        db,
        data
    )
@router.get(
    "/search",
    response_model=list[ProductResponse]
)
def search_product_by_name(
    name: str,
    db: Session = Depends(get_db)
):
    return search_product(
        db,
        name
    )

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def read_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    return get_product(
        db,
        product_id
    )


@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def edit_product(
    product_id: int,
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return update_product(
        db,
        product_id,
        data
    )


@router.delete(
    "/{product_id}",
    response_model=ProductResponse
)
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return delete_product(
        db,
        product_id
    )