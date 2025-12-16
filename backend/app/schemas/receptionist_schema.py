from typing import Literal

from pydantic import BaseModel, Field
from schemas.user_schema import UserBase

# ----- RECEPTIONIST -----


class ReceptionistBase(BaseModel):
    """
    Base schema for nurse-specific information.

    Currently contains no additional fields beyond the user information.
    Can be extended with nurse-specific credentials or qualifications.
    """
    pass


class ReceptionistModel(ReceptionistBase):
    """
    Complete nurse schema including database identifiers.

    Used for retrieving nurse information from the database.
    Links to the user account for general user information.
    """
    receptionist_id: int = Field(..., description="Unique identifier for the nurse")
    user_id: int = Field(..., description="ID of the associated user account")

    class Config:
        from_attributes = True


class ReceptionistCreate(UserBase):
    """
    Data required for Receptionist creation
    """
    password: str = Field(..., description="Password for user account", example="secret123")
    role: Literal["receptionist"] = "receptionist"