from pydantic import BaseModel, Field
from datetime import date

# ----- DIAGNOSIS -----


class DiagnosisBase(BaseModel):
    """
    Base schema for diagnosis information.

    Contains the core fields for recording a medical diagnosis.
    """
    diagnosis_date: date = Field(...,
                                 description="Date when the diagnosis was made")
    doctor_notes: str = Field(
        ..., description="Doctor's notes and observations about the diagnosis")


class DiagnosisModel(DiagnosisBase):
    """
    Complete diagnosis schema including database identifiers.

    Used for retrieving diagnosis information from the database.
    """
    diagnosis_id: int = Field(...,
                              description="Unique identifier for the diagnosis")
    visit_id: int = Field(...,
                          description="ID of the visit during which diagnosis was made")
    patient_id: int = Field(...,
                            description="ID of the patient who received the diagnosis")
    disease_id: int = Field(...,
                            description="ID of the disease that was diagnosed")

    class Config:
        from_attributes = True
