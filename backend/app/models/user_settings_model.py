from sqlalchemy import Column, ForeignKey, Integer, Float, String, Text
from sqlalchemy.orm import relationship
from core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    settings_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, unique=True)

    theme = Column(String(10), default="light", nullable=False)
    background_url = Column(Text, nullable=True)

    bg_opacity = Column(Float, default=0.85)
    bg_blur = Column(Integer, default=10)
    bg_brightness = Column(Float, default=1.0)

    user = relationship("User", back_populates="settings")