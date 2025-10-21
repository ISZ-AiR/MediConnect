from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ----- USER -----
class UserBase(BaseModel):
    """
    Base schema for user information.

    Contains common user account details for all system users (patients, doctors, nurses).
    """
    first_name: str = Field(...,
                            description="User's first name", example="John")
    last_name: str = Field(..., description="User's last name", example="Doe")
    email: EmailStr = Field(..., description="User's email address",
                            example="john.doe@example.com")
    phone: Optional[str] = Field(
        None, description="User's phone number", example="+48123456789")
    role: str = Field(..., description="User's role in the system",
                      example="patient")


class UserModel(UserBase):
    """
    Complete user schema including database identifier.

    Used for retrieving user information from the database.
    """
    user_id: int = Field(..., description="Unique identifier for the user")

    class Config:
        orm_mode = True
