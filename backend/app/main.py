from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routers import (
    product_router,
    auth_router,
    admin_router,
    branch_router,
    branch_stock_router,
)
from app.routers.cart import router as cart_router
from app.routers.stock_reservation import router as stock_reservation_router
from app.routers.order import router as order_router

app = FastAPI(
    title="Smart Order Allocation System",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router.router)
app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(branch_router.router)
app.include_router(branch_stock_router.router)
app.include_router(cart_router)
app.include_router(stock_reservation_router)
app.include_router(order_router)


@app.get("/")
def root():
    return {
        "message": "Smart Order Allocation System API is running"
    }
