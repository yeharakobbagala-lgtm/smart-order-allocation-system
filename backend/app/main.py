from fastapi import FastAPI

from app.routers import (
    product_router,
    auth_router,
    admin_router,
    branch_router,
    branch_stock_router
)
from app.routers.cart import router as cart_router


app = FastAPI(
    title="Smart Order Allocation System",
    version="1.0.0",
)


app.include_router(product_router.router)
app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(branch_router.router)
app.include_router(branch_stock_router.router)
app.include_router(cart_router)


@app.get("/")
def root():
    return {
        "message": "Smart Order Allocation System API is running"
    }