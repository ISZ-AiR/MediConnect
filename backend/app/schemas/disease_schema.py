from pydantic import BaseModel

# ----- DISEASE -----
class DiseaseBase(BaseModel):
    icd10_code: str
    name: str
    description: str


class DiseaseModel(DiseaseBase):
    disease_id: int

    class Config:
        orm_mode = True