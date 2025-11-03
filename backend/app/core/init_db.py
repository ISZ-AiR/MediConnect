"""
Database initialization module.

This module provides functionality to initialize the database by creating
all necessary tables and performing any required setup operations.
"""

import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy import select
from passlib.context import CryptContext
import models

from .config import logger
from .database import Base, engine, async_session

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_default_admin() -> None:
    """
    Create a default admin user if no admin exists.

    Default credentials:
        Email: admin@mediconnect.com
        Password: admin123
    """
    try:
        async with async_session() as session:
            # Check if any admin user exists
            result = await session.execute(
                select(models.User).where(models.User.role == "admin")
            )
            existing_admin = result.scalars().first()

            if existing_admin:
                logger.info(
                    "Admin user already exists. Skipping default admin creation.")
                return

            # Create default admin user
            logger.info("Creating default admin user...")
            hashed_password = pwd_context.hash("admin123")

            default_admin = models.User(
                first_name="Admin",
                last_name="User",
                email="admin@mediconnect.com",
                phone="+48123456789",
                password_hash=hashed_password,
                role="admin"
            )

            session.add(default_admin)
            await session.commit()
            await session.refresh(default_admin)

            logger.info("✅ Default admin user created successfully!")
            logger.info("   Email: admin@mediconnect.com")
            logger.info("   Password: admin123")
            logger.info(
                "   ⚠️  IMPORTANT: Change this password in production!")

    except Exception as e:
        logger.error(f"Error creating default admin user: {e}")
        raise


async def create_tables(engine: AsyncEngine) -> None:
    """
    Create all database tables.

    Args:
        engine: The SQLAlchemy async engine instance
    """
    try:
        logger.info("Creating database tables...")
        async with engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully!")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


async def drop_tables(engine: AsyncEngine) -> None:
    """
    Drop all database tables.

    Args:
        engine: The SQLAlchemy async engine instance
    """
    try:
        logger.info("Dropping database tables...")
        async with engine.begin() as conn:
            # Drop all tables
            await conn.run_sync(Base.metadata.drop_all)
        logger.info("Database tables dropped successfully!")
    except Exception as e:
        logger.error(f"Error dropping database tables: {e}")
        raise


async def init_db() -> None:
    """
    Initialize the database by creating all tables and default admin user.
    """
    try:
        logger.info("Initializing database...")
        await create_tables(engine)
        await create_default_admin()
        logger.info("Database initialization completed successfully!")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    finally:
        # Close the engine only when running as standalone script
        await engine.dispose()


async def init_db_without_dispose() -> None:
    """
    Initialize the database by creating all tables and default admin user without disposing the engine.
    Used when called from the main application.
    """
    try:
        logger.info("Initializing database...")
        await create_tables(engine)
        await create_default_admin()
        logger.info("Database initialization completed successfully!")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


async def reset_db() -> None:
    """
    Reset the database by dropping and recreating all tables.
    """
    try:
        logger.info("Resetting database...")
        await drop_tables(engine)
        await create_tables(engine)
        logger.info("Database reset completed successfully!")
    except Exception as e:
        logger.error(f"Database reset failed: {e}")
        raise
    finally:
        # Close the engine
        await engine.dispose()


def run_init_db() -> None:
    """
    Synchronous wrapper to run database initialization.
    """
    asyncio.run(init_db())


def run_reset_db() -> None:
    """
    Synchronous wrapper to run database reset.
    """
    asyncio.run(reset_db())


async def check_tables_exist() -> bool:
    """
    Check if database tables exist.

    Returns:
        bool: True if tables exist, False otherwise
    """
    try:
        async with engine.begin() as conn:
            # Check if any tables exist
            result = await conn.run_sync(
                lambda sync_conn: sync_conn.execute(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
                ).scalar()
            )
            return result > 0
    except Exception as e:
        logger.error(f"Error checking table existence: {e}")
        return False


def run_check_tables() -> bool:
    """
    Synchronous wrapper to check if tables exist.
    """
    return asyncio.run(check_tables_exist())


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "reset":
            print("⚠️  WARNING: This will destroy all data in the database!")
            confirm = input("Are you sure? (yes/no): ")
            if confirm.lower() == "yes":
                run_reset_db()
            else:
                print("Operation cancelled.")
        elif command == "check":
            exists = run_check_tables()
            print(f"Tables exist: {exists}")
        else:
            print("Available commands: init (default), reset, check")
            print("Usage: python -m core.init_db [command]")
    else:
        # Run database initialization when script is executed directly
        run_init_db()
