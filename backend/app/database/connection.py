import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL


# Find the project root
BASE_DIR = Path(__file__).resolve().parents[3]

# Load variables from .env
load_dotenv(BASE_DIR / ".env")


# Read database configuration
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


# Location of Aiven's CA certificate
CA_CERT_PATH = BASE_DIR / "backend" / "certs" / "ca.pem"


# Build the database connection URL safely
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
)


# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "ssl": {
            "ca": str(CA_CERT_PATH)
        }
    },
    pool_pre_ping=True,
)