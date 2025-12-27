import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine  # Używamy bezpośredniego tworzenia silnika

from alembic import context

# Import your models and Base
from core.database import Base
from models.diagnosis_model import Diagnosis
from models.disease_model import Disease
from models.doctor_model import Doctor
from models.examination_model import Examination
from models.nurse_model import Nurse
from models.patient_model import Patient
from models.prescription_model import Prescription
from models.referral_model import Referral
from models.reservation_model import Reservation
from models.schedule_model import Schedule
from models.user_model import User
from models.user_settings_model import UserSettings
from models.visit_model import Visit

# Alembic Config object
config = context.config

# Set up logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def do_run_migrations(connection: Connection) -> None:
    """Helper function to execute migrations in sync mode."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode using create_async_engine directly."""

    # Get URL directly from env to avoid any .ini conflicts
    db_url = os.getenv("DATABASE_URL")

    # Create engine manually to ensure it's Async
    connectable = create_async_engine(
        db_url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = os.getenv("DATABASE_URL")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    # Use existing loop if available, else create new one
    try:
        asyncio.run(run_migrations_online())
    except RuntimeError:
        # Fallback for environments where a loop is already running
        loop = asyncio.get_event_loop()
        loop.run_until_complete(run_migrations_online())