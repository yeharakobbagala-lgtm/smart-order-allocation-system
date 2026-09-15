from fastapi import FastAPI

from app.routers.product_router import router as product_router
from app.routers.auth_router import router as auth_router
from app.routers import product_router, auth_router
from app.routers import product_router, auth_router
from backend.app.routers import admin_router


app = FastAPI(
    title="Smart Order Allocation System",
    version="1.0.0",
)

app.include_router(product_router.router)
app.include_router(auth_router.router)
app.include_router(admin_router.router)


@app.get("/")
def root():
    return {"message": "Smart Order Allocation System API is running"}