from pydantic import BaseModel, Field

# ----- DISEASE -----


class DiseaseBase(BaseModel):
    """
    Base schema for disease information.

    Contains disease details based on ICD-10 classification system.
    """
    icd10_code: str = Field(
        ..., description="International Classification of Diseases (ICD-10) code", example="J00")
    name: str = Field(..., description="Official name of the disease",
                      example="Acute nasopharyngitis [common cold]")
    description: str = Field(
        ..., description="Detailed description of the disease, symptoms, and characteristics")


class DiseaseModel(DiseaseBase):
    """
    Complete disease schema including database identifier.

    Used for retrieving disease information from the database.
    """
    disease_id: int = Field(...,
                            description="Unique identifier for the disease")

    class Config:
        from_attributes = True
