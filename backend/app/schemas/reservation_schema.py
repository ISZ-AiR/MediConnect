from pydantic import BaseModel
from datetime import datetime

# ----- RESERVATION -----
class ReservationBase(BaseModel):
    reservation_time: datetime
    is_cancelled: bool


class ReservationModel(ReservationBase):
    reservation_id: int
    patient_id: int
    doctor_id: int
    nurse_id: int

    class Config:
        orm_mode = True