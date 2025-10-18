from pydantic import BaseModel
from datetime import date


# ----- PATIENT -----
class PatientBase(BaseModel):
    pesel: str
    birth_date: date


class PatientModel(PatientBase):
    patient_id: int
    user_id: int

    class Config:
        orm_mode = True