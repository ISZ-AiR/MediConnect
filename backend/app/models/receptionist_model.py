from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class Receptionist(Base):
    __tablename__ = "receptionists"

    receptionist_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    user = relationship("User", back_populates="receptionist")
    reservation = relationship("Reservation", back_populates="receptionist")