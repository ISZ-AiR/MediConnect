from pydantic import BaseModel, Field

# ----- EXAMINATION -----


class ExaminationBase(BaseModel):
    """
    Base schema for medical examination information.

    Defines the details of medical tests and examinations that can be ordered.
    """
    name: str = Field(..., description="Name of the examination or test",
                      example="Blood Test")
    description: str = Field(
        ..., description="Detailed description of what the examination involves")
    type: str = Field(..., description="Category or type of examination",
                      example="Laboratory")


class ExaminationModel(ExaminationBase):
    """
    Complete examination schema including database identifier.

    Used for retrieving examination information from the database.
    """
    examination_id: int = Field(...,
                                description="Unique identifier for the examination")

    class Config:
        orm_mode = True
