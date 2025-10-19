from pydantic import BaseModel

# ----- PRESCRIPTION -----
class PrescriptionBase(BaseModel):
    medication: str
    dosage: str
    instruction: str


class PrescriptionModel(PrescriptionBase):
    prescription_id: int
    visit_id: int

    class Config:
        orm_mode = True

