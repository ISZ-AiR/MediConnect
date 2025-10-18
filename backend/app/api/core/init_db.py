from .database import Base, engine


async def init_db():
    """Creates tables databases asynchronously."""
    # Initialize database
    async with engine.begin() as conn:
        print("Creating tables for global database...")
        # print("GlobalBase metadata tables:", GlobalBase.metadata.tables.keys())  # Debugging metadata
        await conn.run_sync(Base.metadata.create_all)
        print("Tables global created successfully.")
    await engine.dispose()


async def init_db_on_startup():
    """Initialize the database during app startup."""
    await init_db()