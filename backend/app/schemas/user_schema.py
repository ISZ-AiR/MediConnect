from pydantic import BaseModel, EmailStr
from typing import Optional


# ----- USER -----
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str]
    role: str



class UserModel(UserBase):
    user_id: int

    class Config:
        orm_mode = True
