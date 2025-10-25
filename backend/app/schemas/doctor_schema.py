from pydantic import BaseModel, Field


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
