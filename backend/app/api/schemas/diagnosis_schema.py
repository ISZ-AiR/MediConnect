from pydantic import BaseModel
from datetime import date

# ----- DIAGNOSIS -----
class DiagnosisBase(BaseModel):
    diagnosis_date: date
    doctor_notes: str


class DiagnosisModel(DiagnosisBase):
    diagnosis_id: int
    visit_id: int
    patient_id: int
    disease_id: int

    class Config:
        orm_mode = True