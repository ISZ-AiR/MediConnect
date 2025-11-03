from pydantic import BaseModel, Field
from datetime import date
from schemas.user_schema import UserBase
from typing import Optional


# ----- PATIENT -----
class PatientBase(BaseModel):
    """
    Base schema for patient-specific information.

    Contains patient identification and basic demographic data.
    """
    pesel: str = Field(..., description="PESEL number (Polish national identification number)",
                       example="92010112345")
    birth_date: date = Field(..., description="Patient's date of birth")


class PatientModel(PatientBase):
    """
    Complete patient schema including database identifiers.

    Used for retrieving patient information from the database.
    Links to the user account for general user information.
    """
    patient_id: int = Field(...,
                            description="Unique identifier for the patient")
    user_id: int = Field(..., description="ID of the associated user account")

    class Config:
        from_attributes = True


class PatientCreate(UserBase, PatientBase):
    password: str = Field(..., description="Password for patient account", example="user123")


class PatientUpdate(BaseModel):
    """
    Schema for updating a patient's details.
    All fields are optional.
    """
    first_name: Optional[str] = Field(None, description="Patient's first name", example="John")
    last_name: Optional[str] = Field(None, description="Patient's last name", example="Doe")
    phone: Optional[str] = Field(None, description="Patient's phone number", example="+48123456789")
    pesel: Optional[str] = Field(None, description="Patient's PESEL number", example="12345678901")
    birth_date: Optional[date] = Field(None, description="Patient's date of birth", example="1980-01-01")

    class Config:
        from_attributes = True
