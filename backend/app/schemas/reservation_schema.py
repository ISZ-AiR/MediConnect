from datetime import datetime

from pydantic import BaseModel, Field

# ----- RESERVATION -----


class ReservationBase(BaseModel):
    """
    Base schema for appointment reservation information.

    Contains scheduling details for patient appointments with medical staff.
    """
    reservation_time: datetime = Field(
        ..., description="Date and time of the scheduled appointment")
    is_cancelled: bool = Field(
        False, description="Whether the reservation has been cancelled")


class ReservationModel(ReservationBase):
    """
    Complete reservation schema including database identifiers.

    Used for retrieving reservation information from the database.
    Links patient with doctor and nurse for the appointment.
    """
    reservation_id: int = Field(...,
                                description="Unique identifier for the reservation")
    patient_id: int = Field(...,
                            description="ID of the patient who made the reservation")
    doctor_id: int = Field(...,
                           description="ID of the doctor for the appointment")
    nurse_id: int | None = Field(None,
                          description="ID of the nurse assisting with the appointment")

    class Config:
        from_attributes = True


class ReservationCreate(ReservationBase):
    """
    Data required to create a new reservation.
    """
    patient_id: int = Field(..., description="ID of the patient making the reservation")
    doctor_id: int = Field(..., description="ID of the doctor for the appointment")
    nurse_id: int | None = Field(None, description="ID of the nurse assisting with the appointment")



class ReservationUpdate(BaseModel):
    """Schema for updating an existing reservation."""
    doctor_id: int | None = None
    nurse_id: int | None = None
    reservation_time: datetime | None = None
    is_cancelled: bool | None = None