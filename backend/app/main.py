import logging
from contextlib import asynccontextmanager

from core.database import engine
from core.init_db import create_tables

from api import api_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

import models




@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI app.
    Handles startup and shutdown events.
    """
    # Startup
    logging.info("Starting up the application...")
    try:
        # Initialize database tables on startup
        await create_tables(engine)
        logging.info("Database initialization completed successfully!")

        # Create default admin user if needed
        from core.init_db import create_default_admin
        await create_default_admin()

    except Exception as e:
        logging.error(f"Failed to initialize database: {e}")
        raise

    yield

    # Shutdown
    logging.info("Shutting down the application...")
    try:
        # Close database connections
        await engine.dispose()
        logging.info("Database connections closed successfully!")
    except Exception as e:
        logging.error(f"Error during shutdown: {e}")

app = FastAPI(
    title="Medi Connect API",
    description="API",
    version="1.0.0",
    contact={
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan,
)

# Configure CORS
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE",
                   "PATCH"],  # Restrict to necessary methods
    # Restrict to necessary headers
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url='/docs')

app.include_router(api_router)
