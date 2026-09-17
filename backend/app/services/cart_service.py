from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.cart_repository import CartRepository


class CartService:

    @staticmethod
    def get_cart(
        db: Session,
        user_id: int
    ):
        cart = CartRepository.get_cart_by_user(
            db,
            user_id
        )

        # Every customer should have a cart.
        # If it does not exist for some reason, create it internally.
        if not cart:
            cart = CartRepository.create_cart(
                db,
                user_id
            )

        return cart

    @staticmethod
    def add_item(
        db: Session,
        user_id: int,
        product_id: int,
        quantity: int
    ):
        """
        Add to cart = customer intent only.

        Does not reserve stock and does not reduce physical quantity.
        Authoritative stock/eligibility checks happen at checkout hold.
        """
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero.",
            )

        product = (
            db.query(Product)
            .filter(
                Product.id == product_id,
                Product.active == True
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found or inactive."
            )

        cart = CartRepository.get_cart_by_user(
            db,
            user_id
        )

        if not cart:
            cart = CartRepository.create_cart(
                db,
                user_id
            )

        cart_item = CartRepository.get_cart_item(
            db,
            cart.id,
            product_id
        )

        if cart_item:
            new_quantity = cart_item.quantity + quantity
            return CartRepository.update_cart_item(
                db,
                cart_item,
                new_quantity
            )

        return CartRepository.create_cart_item(
            db,
            cart.id,
            product_id,
            quantity
        )

    @staticmethod
    def update_item(
        db: Session,
        user_id: int,
        cart_item_id: int,
        quantity: int
    ):
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero.",
            )

        cart = CartRepository.get_cart_by_user(
            db,
            user_id
        )

        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found."
            )

        cart_item = CartRepository.get_cart_item_by_id(
            db,
            cart.id,
            cart_item_id
        )

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found."
            )

        return CartRepository.update_cart_item(
            db,
            cart_item,
            quantity
        )

    @staticmethod
    def remove_item(
        db: Session,
        user_id: int,
        cart_item_id: int
    ):
        cart = CartRepository.get_cart_by_user(
            db,
            user_id
        )

        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found."
            )

        cart_item = CartRepository.get_cart_item_by_id(
            db,
            cart.id,
            cart_item_id
        )

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found."
            )

        CartRepository.delete_cart_item(
            db,
            cart_item
        )

        return {
            "message": "Item removed from cart."
        }
