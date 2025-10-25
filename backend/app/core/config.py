import logging
from pydantic_settings import BaseSettings, SettingsConfigDict

# Configure logger
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)

# Add a console handler if not already present
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

# Set SQLAlchemy engine logging level
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Test logger output
logger.info("Logger is configured and working.")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../../../.env")

    DATABASE_URL: str
    FRONTEND_URL: str
    VITE_APP_API_URL: str


settings = Settings()
