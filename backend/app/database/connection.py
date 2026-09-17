from sqlalchemy import create_engine

from app.config.settings import settings


def _sqlalchemy_database_url(url: str) -> str:
    """
    Normalize postgres URLs to the psycopg (Psycopg 3) SQLAlchemy driver.

    Accepts common Supabase forms:
      postgresql://...
      postgres://...
      postgresql+psycopg://...
    Also rewrites legacy postgresql+psycopg2:// to psycopg 3.
    """
    if not url:
        return url
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    if url.startswith("postgresql+psycopg2://"):
        return "postgresql+psycopg://" + url[len("postgresql+psycopg2://") :]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


DATABASE_URL = _sqlalchemy_database_url(settings.DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)
