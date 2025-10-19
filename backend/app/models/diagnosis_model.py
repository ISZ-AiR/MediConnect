from sqlalchemy import Column, Integer, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from core import Base


class Diagnosis(Base):
    __tablename__ = "diagnosis"

    diagnosis_id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("visits.visit_id"), nullable=False)
    patient_id = Column(Integer, ForeignKey(
        "patients.patient_id"), nullable=False)
    disease_id = Column(Integer, ForeignKey(
        "diseases.disease_id"), nullable=False)
    diagnosis_date = Column(Date, nullable=False)
    doctor_notes = Column(Text, nullable=False)

    visit = relationship("Visit", back_populates="diagnosis")
    patient = relationship("Patient", back_populates="diagnosis")
    disease = relationship("Disease", back_populates="diagnosis")
