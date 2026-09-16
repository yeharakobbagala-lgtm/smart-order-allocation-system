from sqlalchemy import create_engine
from sqlalchemy.engine import URL

from app.config.settings import settings


DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=settings.DB_USER,
    password=settings.DB_PASSWORD,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    database=settings.DB_NAME,
)

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "ssl": {
            "check_hostname": False,
            "verify_mode": 0,
        }
    },
    pool_pre_ping=True,
)