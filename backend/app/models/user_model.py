from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from core import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)

    doctor = relationship("Doctor", back_populates="user", uselist=False)
    nurse = relationship("Nurse", back_populates="user", uselist=False)
    patient = relationship("Patient", back_populates="user", uselist=False)
    receptionist = relationship("Receptionist", back_populates="user", uselist=False)



