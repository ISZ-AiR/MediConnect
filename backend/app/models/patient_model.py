from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    pesel = Column(String(11), unique=True, nullable=False)
    birth_date = Column(Date, nullable=False)

    user = relationship("User", back_populates="patient")
    reservation = relationship("Reservation", back_populates="patient")
    diagnosis = relationship("Diagnosis", back_populates="patient")
    referral = relationship("Referral", back_populates="patient")