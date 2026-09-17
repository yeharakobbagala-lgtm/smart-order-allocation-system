import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env")


class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_NAME: str = os.getenv("DB_NAME", "")
    DB_USER: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    # Comma-separated frontend origins for CORS
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )


settings = Settings()
