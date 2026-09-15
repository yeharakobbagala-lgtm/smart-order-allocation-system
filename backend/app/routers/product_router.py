from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.product import ProductResponse
from app.services.product_service import get_products

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)



@router.get("/", response_model=list[ProductResponse])
def read_products(db: Session = Depends(get_db)):
    return get_products(db)