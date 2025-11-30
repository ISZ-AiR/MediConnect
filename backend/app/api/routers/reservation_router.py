from fastapi import APIRouter, Depends, HTTPException, Form, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from typing import Annotated
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt
from sqlalchemy import select, and_

from models.reservation_model import Reservation
from models.patient_model import Patient
from models.doctor_model import Doctor
from models.nurse_model import Nurse
from models.receptionist_model import Receptionist
from models.user_model import User
from schemas.reservation_schema import ReservationModel, ReservationCreate, ReservationUpdate
from core import require_role_with_user

router = APIRouter(prefix="/reservation", tags=["Reservations"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


@router.post("/create", response_model=ReservationModel)
async def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role_with_user(["receptionist", "patient"]))):

    # Check if the data is correct
    result = await db.execute(select(Patient).filter(Patient.patient_id == reservation.patient_id))
    existing_patient = result.scalars().all()
    if not existing_patient:
        raise HTTPException(
            status_code=400, detail="Patient record does not exist.")

    result = await db.execute(select(Doctor).filter(Doctor.doctor_id == reservation.doctor_id))
    existing_doctor = result.scalars().all()
    if not existing_doctor:
        raise HTTPException(
            status_code=400, detail="Doctor record does not exist.")

    # TODO: ?? Check if the nurse data is correct

    raw_time = reservation.reservation_time
    reservation_time = to_naive_utc(raw_time)

    if reservation_time < datetime.utcnow():
        raise HTTPException(
            status_code=400, detail="The reservation time must be in the future.")

    # Check if the reservation is possible -- for the doctor and for the patient
    start_window = reservation.reservation_time - timedelta(minutes=15)
    end_window = reservation.reservation_time + timedelta(minutes=15)

    start_time = to_naive_utc(start_window)
    end_time = to_naive_utc(end_window)

    # for the doctor
    stmt = select(Reservation).where(
        and_(
            Reservation.doctor_id == reservation.doctor_id,
            Reservation.reservation_time >= start_time,
            Reservation.reservation_time <= end_time,
            Reservation.is_cancelled == False
        )
    )
    result = await db.execute(stmt)
    conflicting_reservation = result.scalars().all()
    if conflicting_reservation:
        raise HTTPException(
            status_code=400, detail="Doctor is not available at this time.")

    # for the patient
    stmt = select(Reservation).where(
        and_(
            Reservation.patient_id == reservation.patient_id,
            Reservation.reservation_time >= start_time,
            Reservation.reservation_time <= end_time,
            Reservation.is_cancelled == False
        )
    )
    result = await db.execute(stmt)
    conflicting_reservation = result.scalars().all()
    if conflicting_reservation:
        raise HTTPException(
            status_code=400, detail="Conflicting reservation found.")

    # Determine who is creating the reservation
    receptionist_id = None
    # If a receptionist creates it, associate their receptionist_id
    if getattr(current_user, "role", None) == "receptionist":
        result = await db.execute(select(Receptionist).where(Receptionist.user_id == current_user.user_id))
        receptionist_obj = result.scalar_one_or_none()
        if receptionist_obj:
            receptionist_id = receptionist_obj.receptionist_id
    # If a patient creates a booking, ensure they are booking for themselves
    if getattr(current_user, "role", None) == "patient":
        result = await db.execute(select(Patient).where(Patient.user_id == current_user.user_id))
        patient_obj = result.scalar_one_or_none()
        if not patient_obj:
            raise HTTPException(
                status_code=400, detail="Patient record not found for current user.")
        # override provided patient_id to current user's patient id to avoid spoofing
        reservation.patient_id = patient_obj.patient_id

    # Create new reservation
    new_reservation = Reservation(
        receptionist_id=receptionist_id,
        patient_id=reservation.patient_id,
        doctor_id=reservation.doctor_id,
        nurse_id=reservation.nurse_id if reservation.nurse_id is not None else None,
        reservation_time=reservation_time,
        is_cancelled=reservation.is_cancelled,
    )

    db.add(new_reservation)
    await db.commit()
    await db.refresh(new_reservation)

    return new_reservation


@router.get("/", response_model=list[ReservationModel], description="Get all reservations (receptionist only).")
async def get_all_reservations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(
        ["receptionist", "doctor", "nurse"]))
):
    """Retrieve all reservations in the system."""
    result = await db.execute(select(Reservation))
    reservations = result.scalars().all()
    return reservations


@router.get("/me", response_model=list[ReservationModel], description="Get reservations for current patient.")
async def get_my_reservations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["patient"]))
):
    # Find patient record for current user
    result = await db.execute(select(Patient).where(Patient.user_id == current_user.user_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(
            status_code=404, detail="Patient record not found for current user.")

    result = await db.execute(select(Reservation).where(Reservation.patient_id == patient.patient_id))
    reservations = result.scalars().all()
    return reservations


@router.get("/{reservation_id}", response_model=ReservationModel, description="Get reservation details by ID.")
async def get_reservation_by_id(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role_with_user(["receptionist", "patient"]))
):
    """Retrieve a specific reservation."""
    result = await db.execute(select(Reservation).where(Reservation.reservation_id == reservation_id))
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")
    return reservation


@router.put("/{reservation_id}", response_model=ReservationModel, description="Update reservation details.")
async def update_reservation(
    reservation_id: int,
    update_data: ReservationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["receptionist"]))
):
    """Update reservation information (receptionist only)."""
    result = await db.execute(select(Reservation).where(Reservation.reservation_id == reservation_id))
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")

    # Update allowed fields
    for field, value in update_data.model_dump(exclude_unset=True).items():
        if isinstance(value, datetime):
            value = value.replace(tzinfo=None)
        setattr(reservation, field, value)

    await db.commit()
    await db.refresh(reservation)
    return reservation


@router.post("/{reservation_id}/cancel", description="Cancel a reservation without deleting it.")
async def cancel_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["receptionist"]))
):
    """
    Cancel a reservation.
    This does not delete the reservation, just sets `is_cancelled` to True.
    """
    # Fetch the reservation
    result = await db.execute(select(Reservation).where(Reservation.reservation_id == reservation_id))
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")

    # Update the status
    reservation.is_cancelled = True

    # Save changes
    await db.commit()
    await db.refresh(reservation)

    return {"status": "Reservation cancelled successfully", "reservation_id": reservation_id}


# ----- DELETE -----
@router.delete("/{reservation_id}", description="Delete or cancel a reservation.")
async def delete_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["receptionist"]))
):
    """Delete or cancel a reservation (receptionist only)."""
    result = await db.execute(select(Reservation).where(Reservation.reservation_id == reservation_id))
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")

    await db.delete(reservation)
    await db.commit()

    return {"status": "Reservation deleted successfully"}


def to_naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


@router.get("/me", response_model=list[ReservationModel], description="Get reservations for current patient.")
async def get_my_reservations(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_role_with_user(["patient"]))
):
    result = await db.execute(select(Patient).where(Patient.user_id == current_user.user_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(
            status_code=404, detail="Patient record not found for current user.")

    result = await db.execute(select(Reservation).where(Reservation.patient_id == patient.patient_id))
    reservations = result.scalars().all()
    return reservations
