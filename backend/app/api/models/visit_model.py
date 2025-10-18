from sqlalchemy import Column, Text, Integer, ForeignKey, Date
from sqlalchemy.orm import relationship
from core import Base


class Visit(Base):
    __tablename__ = "visits"

    visit_id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.reservation_id"), nullable=False)
    visit_note = Column(Text, nullable=False)
    visit_date = Column(Date, nullable=False)

    reservation = relationship("Reservation", back_populates="visit")