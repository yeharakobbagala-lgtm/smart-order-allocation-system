from fastapi import FastAPI

from app.routers.product_router import router as product_router


app = FastAPI(
    title="Smart Order Allocation System",
    version="1.0.0",
)


app.include_router(product_router)


@app.get("/")
def root():
    return {"message": "Smart Order Allocation System API is running"}