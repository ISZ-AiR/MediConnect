from datetime import datetime, time

from core import get_db
from core.security import require_role, require_role_with_user
from fastapi import APIRouter, Depends, HTTPException
from models import Doctor, Schedule, User
from schemas.schedule_schema import (ScheduleCreate, ScheduleModel,
                                     ScheduleUpdate)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.post("/", response_model=ScheduleModel, description="Create a doctor's schedule entry.")
async def create_schedule(
    schedule_data: ScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role_with_user(["admin", "receptionist"]))
):
    # Check if doctor exists
    result = await db.execute(select(Doctor).where(Doctor.doctor_id == schedule_data.doctor_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    # Validate times
    if schedule_data.start_time >= schedule_data.end_time:
        raise HTTPException(
            status_code=400, detail="Start time must be before end time.")

    # Prevent duplicate schedule for same doctor and date
    result = await db.execute(
        select(Schedule).where(
            Schedule.doctor_id == schedule_data.doctor_id,
            Schedule.schedule_date == schedule_data.schedule_date
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=400, detail="Schedule for this doctor and date already exists.")

    # Create schedule
    schedule = Schedule(**schedule_data.model_dump())
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)

    return schedule


# ----- READ ALL -----
@router.get("/", response_model=list[ScheduleModel], description="Get all schedules.")
async def get_all_schedules(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role(
        ["admin", "receptionist", "patient", "doctor", "nurse", "manager"]))
):
    """Retrieve all schedule entries."""
    result = await db.execute(select(Schedule))
    schedules = result.scalars().all()
    return schedules


# ----- READ ONE -----
@router.get("/{schedule_id}", response_model=ScheduleModel, description="Get a specific schedule by ID.")
async def get_schedule_by_id(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role(
        ["admin", "receptionist", "doctor", "nurse", "manager"]))
):
    """Retrieve a single schedule entry."""
    result = await db.execute(select(Schedule).where(Schedule.schedule_id == schedule_id))
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found.")
    return schedule


# ----- UPDATE -----
@router.put("/{schedule_id}", response_model=ScheduleModel, description="Update a schedule entry.")
async def update_schedule(
    schedule_id: int,
    update_data: ScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role_with_user(["admin", "receptionist"]))
):
    """Update an existing doctor's schedule (admin and receptionist only)."""
    result = await db.execute(select(Schedule).where(Schedule.schedule_id == schedule_id))
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found.")

    # Update fields
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(schedule, field, value)

    # Validate times if changed
    if schedule.start_time >= schedule.end_time:
        raise HTTPException(
            status_code=400, detail="Start time must be before end time.")

    await db.commit()
    await db.refresh(schedule)
    return schedule


# ----- DELETE -----
@router.delete("/{schedule_id}", description="Delete a schedule entry.")
async def delete_schedule(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin"]))
):
    """Delete a schedule entry (admin only)."""
    result = await db.execute(select(Schedule).where(Schedule.schedule_id == schedule_id))
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found.")

    await db.delete(schedule)
    await db.commit()

    return {"status": "Schedule deleted successfully"}
