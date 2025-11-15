from pydantic import BaseModel, Field, EmailStr
from schemas.user_schema import UserBase
from typing import Literal

# ----- DOCTOR -----
class DoctorBase(BaseModel):
    """
    Base schema for doctor-specific information.

    Contains professional credentials and specialization details.
    """
    specialization: str = Field(
        ..., description="Medical specialization or field of expertise", example="Cardiology")
    license_number: str = Field(
        ..., description="Professional medical license number", example="MD-12345")


class DoctorModel(DoctorBase):
    """
    Complete doctor schema including database identifiers.

    Used for retrieving doctor information from the database.
    Links to the user account for general user information.
    """
    doctor_id: int = Field(..., description="Unique identifier for the doctor")
    user_id: int = Field(..., description="ID of the associated user account")

    class Config:
        from_attributes = True


class DoctorCreate(UserBase, DoctorBase):
    """
    Data needed to create a new doctor information.
    Includes professional credentials and specialization details.
    Additionally, a password to be hashed.
    """
    password: str = Field(..., description="Password for user account", example="secret123")
    role: Literal["doctor"] = "doctor"


class DoctorUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    password: str | None = None
    specialization: str | None = None
    license_number: str | None = None
