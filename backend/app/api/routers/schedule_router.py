from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, time

from core import get_db
from models import Schedule, Doctor
from schemas.schedule_schema import ScheduleCreate, ScheduleModel

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.post("/", response_model=ScheduleModel, description="Create a doctor's schedule entry.")
async def create_schedule(
    schedule_data: ScheduleCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if doctor exists
    result = await db.execute(select(Doctor).where(Doctor.doctor_id == schedule_data.doctor_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    # Validate times
    if schedule_data.start_time >= schedule_data.end_time:
        raise HTTPException(status_code=400, detail="Start time must be before end time.")

    # Prevent duplicate schedule for same doctor and date
    result = await db.execute(
        select(Schedule).where(
            Schedule.doctor_id == schedule_data.doctor_id,
            Schedule.schedule_date == schedule_data.schedule_date
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Schedule for this doctor and date already exists.")

    # Create schedule
    schedule = Schedule(**schedule_data.model_dump())
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)

    return schedule
