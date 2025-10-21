from pydantic import BaseModel, Field
from datetime import date


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
        orm_mode = True
