from pydantic import BaseModel, Field

# ----- NURSE -----


class NurseBase(BaseModel):
    """
    Base schema for nurse-specific information.

    Currently contains no additional fields beyond the user information.
    Can be extended with nurse-specific credentials or qualifications.
    """
    pass


class NurseModel(NurseBase):
    """
    Complete nurse schema including database identifiers.

    Used for retrieving nurse information from the database.
    Links to the user account for general user information.
    """
    nurse_id: int = Field(..., description="Unique identifier for the nurse")
    user_id: int = Field(..., description="ID of the associated user account")

    class Config:
        from_attributes = True
