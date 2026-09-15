from fastapi import FastAPI


app = FastAPI(
    title="Smart Order Allocation System",
    version="1.0.0",
)


@app.get("/")
def root():
    return {"message": "Smart Order Allocation System API is running"}