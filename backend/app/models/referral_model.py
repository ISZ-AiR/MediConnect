from core.database import Base
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship


class Referral(Base):
    __tablename__ = "referrals"

    referral_id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("visits.visit_id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    examination_id = Column(Integer, ForeignKey("examinations.examination_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    referral_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=False)
    is_completed = Column(Boolean, nullable=False)

    visit = relationship("Visit", back_populates="referral")
    patient = relationship("Patient", back_populates="referral")
    examination = relationship("Examination", back_populates="referral")
    doctor = relationship("Doctor", back_populates="referral")
