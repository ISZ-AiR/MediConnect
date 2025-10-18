from pydantic import BaseModel


# ----- DOCTOR -----
class DoctorBase(BaseModel):
    specialization: str
    license_number: str


class DoctorModel(DoctorBase):
    doctor_id: int
    user_id: int

    class Config:
        orm_mode = True