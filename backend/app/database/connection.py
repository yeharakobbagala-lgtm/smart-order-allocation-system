from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import URL

from app.config.settings import settings


# Project root
BASE_DIR = Path(__file__).resolve().parents[3]


# Location of Aiven's CA certificate
CA_CERT_PATH = BASE_DIR / "backend" / "certs" / "ca.pem"


# Build database connection URL
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=settings.DB_USER,
    password=settings.DB_PASSWORD,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    database=settings.DB_NAME,
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