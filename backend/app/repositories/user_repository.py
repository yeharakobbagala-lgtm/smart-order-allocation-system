from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)

    result = db.execute(statement)

    return result.scalar_one_or_none()


def create_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_id(db: Session, user_id: int) -> User | None:
    statement = select(User).where(User.id == user_id)
    result = db.execute(statement)
    return result.scalar_one_or_none()


def get_all_users(db: Session) -> list[User]:
    statement = select(User).order_by(User.id)
    result = db.execute(statement)
    return list(result.scalars().all())