from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

Base = declarative_base()

from models.doctor_model import Doctor
from models.nurse_model import Nurse
from models.patient_model import Patient
from models.receptionist_model import Receptionist
from models.referral_model import Referral
from models.user_model import User
from models.visit_model import Visit

engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Session makers for global and local databases
async_session = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    """Returns an async database session for the global database."""
    async with async_session() as session:
        yield session
