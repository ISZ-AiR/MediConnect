from pydantic import BaseModel, Field
from datetime import date

# ----- REFERRAL -----


class ReferralBase(BaseModel):
    """
    Base schema for medical referral information.

    Contains details about referrals for medical examinations or specialist consultations.
    """
    referral_date: date = Field(...,
                                description="Date when the referral was issued")
    notes: str = Field(...,
                       description="Additional notes or instructions for the referral")
    is_completed: bool = Field(
        False, description="Whether the referral has been completed/fulfilled")


class ReferralModel(ReferralBase):
    """
    Complete referral schema including database identifiers.

    Used for retrieving referral information from the database.
    Links the referral to patient, doctor, examination, and originating visit.
    """
    referral_id: int = Field(...,
                             description="Unique identifier for the referral")
    visit_id: int = Field(...,
                          description="ID of the visit during which referral was issued")
    patient_id: int = Field(...,
                            description="ID of the patient who received the referral")
    examination_id: int = Field(...,
                                description="ID of the examination being referred for")
    doctor_id: int = Field(...,
                           description="ID of the doctor who issued the referral")

    class Config:
        from_attributes = True


class ReferralCreate(ReferralBase):
    """
    Schema used when creating a new referral.
    Excludes the referral_id, which is generated automatically.
    """
    visit_id: int
    patient_id: int
    examination_id: int
    doctor_id: int


from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ReferralUpdate(BaseModel):
    """
    Schema for updating referral details.
    All fields are optional, allowing partial updates.
    """
    visit_id: Optional[int] = Field(None, description="ID of the associated visit")
    patient_id: Optional[int] = Field(None, description="ID of the patient")
    examination_id: Optional[int] = Field(None, description="ID of the examination")
    doctor_id: Optional[int] = Field(None, description="ID of the doctor issuing the referral")
    referral_date: Optional[date] = Field(None, description="Date when the referral was issued")
    notes: Optional[str] = Field(None, description="Additional notes or instructions for the referral")
    is_completed: Optional[bool] = Field(None, description="Whether the referral has been completed")

    class Config:
        from_attributes = True

