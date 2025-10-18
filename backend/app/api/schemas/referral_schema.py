from pydantic import BaseModel
from datetime import date

# ----- REFERRAL -----
class ReferralBase(BaseModel):
    referral_date: date
    notes: str
    is_completed: bool


class ReferralModel(ReferralBase):
    referral_id: int
    visit_id: int
    patient_id: int
    examination_id: int
    doctor_id: int

    class Config:
        orm_mode = True