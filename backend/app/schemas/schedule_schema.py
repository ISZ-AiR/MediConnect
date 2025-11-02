from pydantic import BaseModel, Field
from datetime import date, time

class ScheduleBase(BaseModel):
    doctor_id: int = Field(..., description="Doctor's ID")
    schedule_date: date = Field(..., description="Date")
    start_time: time = Field(..., description="Start Time")
    end_time: time = Field(..., description="End Time")
    is_available: bool = Field(default=True, description="Is available")
    location: str | None = Field(default=None, description="Location")

class ScheduleCreate(ScheduleBase):
    """Schema for creating a new schedule entry."""
    pass

class ScheduleModel(ScheduleBase):
    """Schema for returning schedule data."""
    schedule_id: int

    class Config:
        from_attributes = True