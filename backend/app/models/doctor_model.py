from core.database import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    specialization = Column(String(100), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)

    user = relationship("User", back_populates="doctor")
    reservation = relationship("Reservation", back_populates="doctor")
    referral = relationship("Referral", back_populates="doctor")
    schedules = relationship("Schedule", back_populates="doctor")




