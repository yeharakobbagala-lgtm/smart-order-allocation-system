from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.branch_stock import BranchStock
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
        # 1. Check that the product exists and is active
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

        # 2. Get customer's cart
        cart = CartRepository.get_cart_by_user(
            db,
            user_id
        )

        if not cart:
            cart = CartRepository.create_cart(
                db,
                user_id
            )

        # 3. CHECK #1 — check current stock
        stock_rows = (
            db.query(BranchStock.quantity)
            .filter(
                BranchStock.product_id == product_id
            )
            .all()
        )

        available_stock = sum(
            row[0] for row in stock_rows
        )

        # 4. Check if product is already in cart
        cart_item = CartRepository.get_cart_item(
            db,
            cart.id,
            product_id
        )

        # 5. Existing product → increase quantity
        if cart_item:

            new_quantity = cart_item.quantity + quantity

            if new_quantity > available_stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock. "
                        f"Available stock: {available_stock}."
                    )
                )

            return CartRepository.update_cart_item(
                db,
                cart_item,
                new_quantity
            )

        # 6. New product → check requested quantity
        if quantity > available_stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock. "
                    f"Available stock: {available_stock}."
                )
            )

        # 7. Add new CartItem
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
        # Get customer's cart
        cart = CartRepository.get_cart_by_user(
            db,
            user_id
        )

        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found."
            )

        # Get item belonging to THIS customer's cart
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

        # Check current stock
        stock_rows = (
            db.query(BranchStock.quantity)
            .filter(
                BranchStock.product_id == cart_item.product_id
            )
            .all()
        )

        available_stock = sum(
            row[0] for row in stock_rows
        )

        if quantity > available_stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock. "
                    f"Available stock: {available_stock}."
                )
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
        # Get customer's cart
        cart = CartRepository.get_cart_by_user(
            db,
            user_id
        )

        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found."
            )

        # Make sure this item belongs to this customer's cart
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