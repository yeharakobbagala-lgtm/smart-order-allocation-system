import os
from pathlib import Path

from dotenv import load_dotenv


# Find the project root
BASE_DIR = Path(__file__).resolve().parents[3]

# Load environment variables
load_dotenv(BASE_DIR / ".env")


class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_NAME: str = os.getenv("DB_NAME", "")
    DB_USER: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "")


settings = Settings()