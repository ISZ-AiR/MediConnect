from pydantic import BaseModel

# ----- EXAMINATION -----
class ExaminationBase(BaseModel):
    name: str
    description: str
    type: str


class ExaminationModel(ExaminationBase):
    examination_id: int

    class Config:
        orm_mode = True