from sqlalchemy import DateTime, Column, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(Integer, primary_key=True, index=True)
    receptionist_id = Column(Integer, ForeignKey("receptionists.receptionist_id"), nullable=False)      # person making reservation
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    nurse_id = Column(Integer, ForeignKey("nurses.nurse_id"), nullable=False)
    reservation_time = Column(DateTime, nullable=False)
    is_cancelled = Column(Boolean, nullable=False)

    receptionist = relationship("Receptionist", back_populates="reservation")
    patient = relationship("Patient", back_populates="reservation")
    doctor = relationship("Doctor", back_populates="reservation")
    nurse = relationship("Nurse", back_populates="reservation")
    visit = relationship("Visit", back_populates="reservation")