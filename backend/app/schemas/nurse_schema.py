from pydantic import BaseModel

# ----- NURSE -----
class NurseBase(BaseModel):
    pass


class NurseModel(NurseBase):
    nurse_id: int
    user_id: int

    class Config:
        orm_mode = True