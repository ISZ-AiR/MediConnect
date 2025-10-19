from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from core import Base


class Nurse(Base):
    __tablename__ = "nurses"

    nurse_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    user = relationship("User", back_populates="nurse")
    reservation = relationship("Reservation", back_populates="nurse")