import sys
from pathlib import Path
from logging.config import fileConfig

from alembic import context


# ---------------------------------------------------------
# Add backend directory to Python path
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))


# ---------------------------------------------------------
# Import application database and models
# ---------------------------------------------------------

from app.database.base import Base
from app.database.connection import DATABASE_URL, engine

# Import models so Alembic can detect their tables
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.checkout_hold import CheckoutHold


# ---------------------------------------------------------
# Alembic configuration
# ---------------------------------------------------------

config = context.config

# Prefer the app DATABASE_URL (Supabase PostgreSQL) over alembic.ini placeholder
if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)


# ---------------------------------------------------------
# Configure logging
# ---------------------------------------------------------

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ---------------------------------------------------------
# Metadata for Alembic autogenerate
# ---------------------------------------------------------

target_metadata = Base.metadata


# ---------------------------------------------------------
# Offline migrations
# ---------------------------------------------------------

def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.
    """

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------
# Online migrations
# ---------------------------------------------------------

def run_migrations_online() -> None:
    """
    Run migrations in online mode.
    """

    connectable = engine

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# ---------------------------------------------------------
# Run appropriate migration mode
# ---------------------------------------------------------

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
