from pydantic import BaseModel, Field
from datetime import date, time

# ----- VISIT -----


class VisitBase(BaseModel):
    """
    Base schema for medical visit information.

    Contains details about a completed medical visit/appointment.
    """
    visit_note: str = Field(...,
                            description="Notes and summary from the medical visit")
    visit_date: date = Field(..., description="Date when the visit took place")
    visit_time: time = Field(..., description="Time the visit took place")
    nurse_id: int | None = Field(None, description="ID of the nurse assisting the visit")


class VisitModel(VisitBase):
    """
    Complete visit schema including database identifiers.

    Used for retrieving visit information from the database.
    Links to the reservation that the visit was based on.
    """
    visit_id: int = Field(..., description="Unique identifier for the visit")
    reservation_id: int = Field(
        ..., description="ID of the reservation that was converted to this visit")

    class Config:
        from_attributes = True


class VisitUpdate(BaseModel):
    """
    Schema for updating a visit.
    All fields are optional to allow partial updates.
    """
    visit_note: str = Field(
        None, description="Notes from the visit"
    )
    visit_date: date = Field(
        None, description="Date of the visit"
    )
    nurse_id: int = Field(
        None, description="ID of the nurse responsible for the visit"
    )
