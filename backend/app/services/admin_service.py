from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import (
    get_all_users,
    get_user_by_id,
)

from app.repositories.user_repository import (
    create_user,
    get_all_users,
    get_user_by_email,
    get_user_by_id,
)
from app.utils.security import hash_password


def get_users(db: Session) -> list[User]:
    return get_all_users(db)


def update_user_role(
    db: Session,
    user_id: int,
    new_role: str,
) -> User:
    if new_role not in {"customer", "admin"}:
        raise ValueError("Role must be either customer or admin.")

    user = get_user_by_id(db, user_id)

    if not user:
        raise ValueError("User not found.")

    # Prevent the system from having zero admins.
    if user.role == "admin" and new_role == "customer":
        admin_users = [
            existing_user
            for existing_user in get_all_users(db)
            if existing_user.role == "admin"
        ]

        if len(admin_users) <= 1:
            raise ValueError("The last admin cannot be demoted.")

    user.role = new_role
    db.commit()
    db.refresh(user)

    return user
def create_admin_user(
    db: Session,
    name: str,
    email: str,
    password: str,
) -> User:
    existing_user = get_user_by_email(db, email)

    if existing_user:
        raise ValueError("Email is already registered.")

    admin = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role="admin",
    )

    return create_user(db, admin)