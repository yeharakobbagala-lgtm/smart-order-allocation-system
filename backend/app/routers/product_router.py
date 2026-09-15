from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import engine
from app.services.product_service import get_products
from backend.app.schemas.product import ProductResponse


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


def get_db():
    with Session(engine) as db:
        yield db


@router.get("/", response_model=list[ProductResponse])
def read_products(db: Session = Depends(get_db)):
    return get_products(db)