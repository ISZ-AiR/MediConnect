from typing import Optional
from pydantic import BaseModel, Field

class UserSettingsBase(BaseModel):
    theme: str = Field(default="light", pattern="^(light|dark)$")
    background_url: Optional[str] = None

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsResponse(UserSettingsBase):
    user_id: int

    class Config:
        from_attributes = True