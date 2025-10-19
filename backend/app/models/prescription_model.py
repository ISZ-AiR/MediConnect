from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    prescription_id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("visits.visit_id"), nullable=False)
    medication = Column(String(100), nullable=False)
    dosage = Column(String(100), nullable=False)
    instruction = Column(String(100), nullable=False)

    visit = relationship("Visit", back_populates="prescription")



