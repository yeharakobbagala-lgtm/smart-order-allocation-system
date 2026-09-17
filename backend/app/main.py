import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config.settings import settings
from app.database.connection import engine
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


def _redact_db_error(message: str) -> str:
    message = re.sub(
        r"(password|passwd|pwd)\s*[:=]\s*\S+",
        r"\1=***",
        message,
        flags=re.IGNORECASE,
    )
    message = re.sub(r"@[^/\s:]+", "@***", message)
    message = re.sub(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "***", message)
    return message[:500]


@app.get("/")
def root():
    return {
        "message": "Smart Order Allocation System API is running"
    }


@app.get("/health/db")
def health_db():
    """DB connectivity check for deployment diagnostics (no secrets)."""
    from app.config.settings import BACKEND_ROOT, REPO_ROOT

    def present(name: str) -> dict[str, bool]:
        return {
            "in_environ": name in os.environ,
            "nonempty": bool(os.getenv(name)),
        }

    repo_resolved = REPO_ROOT.resolve()
    env_present = {
        "DB_HOST": present("DB_HOST"),
        "DB_PORT": present("DB_PORT"),
        "DB_NAME": present("DB_NAME"),
        "DB_USER": present("DB_USER"),
        "DB_PASSWORD": present("DB_PASSWORD"),
        "MYSQLHOST": present("MYSQLHOST"),
    }
    settings_nonempty = {
        "DB_HOST": bool(settings.DB_HOST),
        "DB_PORT": bool(settings.DB_PORT),
        "DB_NAME": bool(settings.DB_NAME),
        "DB_USER": bool(settings.DB_USER),
        "DB_PASSWORD": bool(settings.DB_PASSWORD),
    }
    meta = {
        "env_present": env_present,
        "settings_nonempty": settings_nonempty,
        "repo_root_is_filesystem_root": repo_resolved.parent == repo_resolved,
        "backend_root_name": BACKEND_ROOT.name,
        # Names only — helps detect mistyped Railway variable keys.
        "related_env_key_names": sorted(
            key
            for key in os.environ
            if key.upper().startswith(("DB_", "MYSQL", "JWT", "CORS"))
            or key.upper() in {"PORT", "RAILWAY_ENVIRONMENT", "RAILWAY_SERVICE_NAME"}
        ),
    }

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"ok": True, **meta}
    except Exception as exc:
        return {
            "ok": False,
            "error_type": type(exc).__name__,
            "error": _redact_db_error(str(exc)),
            **meta,
        }
