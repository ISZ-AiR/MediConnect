from pydantic import BaseModel
from datetime import date

# ----- VISIT -----
class VisitBase(BaseModel):
    visit_note: str
    visit_date: date


class VisitModel(VisitBase):
    visit_id: int
    reservation_id: int

    class Config:
        orm_mode = True