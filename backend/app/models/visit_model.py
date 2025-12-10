from sqlalchemy import Column, Text, Integer, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from core.database import Base


class Visit(Base):
    __tablename__ = "visits"

    visit_id = Column(Integer, primary_key=True, index=True)
    nurse_id = Column(Integer, ForeignKey("nurses.nurse_id"), nullable=True)
    reservation_id = Column(Integer, ForeignKey(
        "reservations.reservation_id"), nullable=False)
    visit_note = Column(Text, nullable=False)
    visit_date = Column(Date, nullable=False)
    visit_time = Column(Time, nullable=False)

    reservation = relationship("Reservation", back_populates="visit")
    nurse = relationship("Nurse", back_populates="visits")
    prescription = relationship("Prescription", back_populates="visit")
    diagnosis = relationship("Diagnosis", back_populates="visit")
    referral = relationship("Referral", back_populates="visit")
