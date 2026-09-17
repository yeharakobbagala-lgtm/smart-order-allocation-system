from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.checkout import (
    CheckoutConfirmRequest,
    CheckoutHoldCreate,
    CheckoutHoldResponse,
)

from app.schemas.order import OrderResponse

from app.services.checkout_service import (
    confirm_checkout_hold,
    create_checkout_hold,
)

from app.utils.security import get_current_user

from app.ml.predictor import classify_message


router = APIRouter(
    prefix="/checkout",
    tags=["Checkout"],
)


# =========================
# AI / ML Classification
# =========================

class ClassificationRequest(BaseModel):
    message: str


@router.post("/classify")
def classify_customer_message(
    request: ClassificationRequest,
):
    """
    Classify a customer message using the ML model.

    Returns the predicted category, confidence,
    and whether manual review is recommended.
    """
    return classify_message(request.message)


# =========================
# Checkout Hold
# =========================

@router.post(
    "/hold",
    response_model=CheckoutHoldResponse,
)
def hold_checkout(
    data: CheckoutHoldCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Allocate a branch, create a 10-minute TEMPORARY stock reservation,
    and return a checkout preview.

    Does not create an order or clear the cart.
    """

    return create_checkout_hold(
        db=db,
        user_id=current_user["user_id"],
        customer_name=data.customer_name,
        phone=data.phone,
        delivery_address=data.delivery_address,
        latitude=data.latitude,
        longitude=data.longitude,
        order_note=data.order_note,
        payment_method=data.payment_method,
    )


# =========================
# Checkout Confirmation
# =========================

@router.post(
    "/confirm",
    response_model=OrderResponse,
)
def confirm_checkout(
    data: CheckoutConfirmRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Confirm an active checkout hold.

    Validates reservation expiry,
    creates the final order with the stored allocation snapshot,
    converts TEMPORARY reservations to CURRENT/FUTURE,
    then clears the cart.
    """

    return confirm_checkout_hold(
        db=db,
        user_id=current_user["user_id"],
        hold_id=data.hold_id,
    )