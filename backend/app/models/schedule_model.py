from sqlalchemy import Column, Integer, ForeignKey, Date, Time, Boolean, String
from sqlalchemy.orm import relationship
from core.database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="CASCADE"), nullable=False)
    schedule_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True)
    location = Column(String(255), nullable=True)

    doctor = relationship("Doctor", back_populates="schedules")