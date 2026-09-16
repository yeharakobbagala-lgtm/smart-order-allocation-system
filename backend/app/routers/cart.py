from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
    CartResponse,
)

from app.services.cart_service import CartService
from app.utils.security import get_current_user


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


@router.get(
    "",
    response_model=CartResponse
)
def get_my_cart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return CartService.get_cart(
        db=db,
        user_id=current_user["user_id"]
    )


@router.post(
    "/items",
    response_model=CartItemResponse,
    status_code=status.HTTP_201_CREATED
)
def add_to_cart(
    data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return CartService.add_item(
        db=db,
        user_id=current_user["user_id"],
        product_id=data.product_id,
        quantity=data.quantity
    )


@router.put(
    "/items/{cart_item_id}",
    response_model=CartItemResponse
)
def update_cart_item(
    cart_item_id: int,
    data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return CartService.update_item(
        db=db,
        user_id=current_user["user_id"],
        cart_item_id=cart_item_id,
        quantity=data.quantity
    )


@router.delete(
    "/items/{cart_item_id}"
)
def remove_from_cart(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return CartService.remove_item(
        db=db,
        user_id=current_user["user_id"],
        cart_item_id=cart_item_id
    )