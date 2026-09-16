from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem


class CartRepository:

    @staticmethod
    def get_cart_by_user(
        db: Session,
        user_id: int
    ):
        return (
            db.query(Cart)
            .options(
                joinedload(Cart.items)
                .joinedload(CartItem.product)
            )
            .filter(Cart.user_id == user_id)
            .first()
        )

    @staticmethod
    def create_cart(
        db: Session,
        user_id: int
    ):
        cart = Cart(user_id=user_id)

        db.add(cart)
        db.commit()
        db.refresh(cart)

        return cart

    @staticmethod
    def get_cart_item(
        db: Session,
        cart_id: int,
        product_id: int
    ):
        return (
            db.query(CartItem)
            .filter(
                CartItem.cart_id == cart_id,
                CartItem.product_id == product_id
            )
            .first()
        )

    @staticmethod
    def get_cart_item_by_id(
        db: Session,
        cart_id: int,
        cart_item_id: int
    ):
        return (
            db.query(CartItem)
            .options(
                joinedload(CartItem.product)
            )
            .filter(
                CartItem.id == cart_item_id,
                CartItem.cart_id == cart_id
            )
            .first()
        )

    @staticmethod
    def create_cart_item(
        db: Session,
        cart_id: int,
        product_id: int,
        quantity: int
    ):
        cart_item = CartItem(
            cart_id=cart_id,
            product_id=product_id,
            quantity=quantity
        )

        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)

        return cart_item

    @staticmethod
    def update_cart_item(
        db: Session,
        cart_item: CartItem,
        quantity: int
    ):
        cart_item.quantity = quantity

        db.commit()
        db.refresh(cart_item)

        return cart_item

    @staticmethod
    def delete_cart_item(
        db: Session,
        cart_item: CartItem
    ):
        db.delete(cart_item)
        db.commit()

    @staticmethod
    def delete_cart_items(
            db: Session,
            cart_items: list[CartItem]
        ):
            for cart_item in cart_items:
                db.delete(cart_item)
            db.commit()