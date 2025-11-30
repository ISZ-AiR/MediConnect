from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# ----- PRESCRIPTION -----


class PrescriptionBase(BaseModel):
    """
    Base schema for prescription information.

    Contains medication details and usage instructions prescribed by a doctor.
    """
    medication: str = Field(..., description="Name of the prescribed medication",
                            example="Amoxicillin")
    dosage: str = Field(..., description="Dosage and frequency",
                        example="500mg twice daily")
    instruction: str = Field(..., description="Detailed instructions for taking the medication",
                             example="Take with food, complete full course")


class PrescriptionModel(PrescriptionBase):
    """
    Complete prescription schema including database identifiers.

    Used for retrieving prescription information from the database.
    """
    prescription_id: int = Field(...,
                                 description="Unique identifier for the prescription")
    visit_id: int = Field(...,
                          description="ID of the visit during which prescription was issued")
    patient_name: Optional[str] = None

    patient_pesel: Optional[str] = None

    visit_date: Optional[date] = None

    doctor_name: Optional[str] = None

    doctor_user_id: Optional[int] = None

    class Config:
        from_attributes = True


class PrescriptionUpdate(BaseModel):
    medication: Optional[str] = None
    dosage: Optional[str] = None
    instruction: Optional[str] = None
