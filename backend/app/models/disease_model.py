from sqlalchemy import Column, Integer, Text
from sqlalchemy.orm import relationship
from core import Base


class Disease(Base):
    __tablename__ = "diseases"

    disease_id = Column(Integer, primary_key=True, index=True)
    icd10_code = Column(Text, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False)

    diagnosis = relationship("Diagnosis", back_populates="disease")