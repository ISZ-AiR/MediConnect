from sqlalchemy import Column, Text,Integer, String
from sqlalchemy.orm import relationship
from core import Base


class Examination(Base):
    __tablename__ = "examinations"

    examination_id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String(100), nullable=False)

    referral = relationship("Referral", back_populates="examination")




