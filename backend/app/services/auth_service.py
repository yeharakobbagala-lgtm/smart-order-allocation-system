from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import (
    create_user,
    get_user_by_email,
)
from app.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)

def register_user(
    db: Session,
    name: str,
    email: str,
    password: str,
) -> User:

    existing_user = get_user_by_email(db, email)

    if existing_user:
        raise ValueError("Email is already registered.")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role="customer",
    )

    return create_user(db, user)


def login_user(
    db: Session,
    email: str,
    password: str,
) -> tuple[str, User]:

    user = get_user_by_email(db, email)

    if not user:
        raise ValueError("Invalid email or password.")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password.")

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return access_token, user