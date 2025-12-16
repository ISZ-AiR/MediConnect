from datetime import datetime, timedelta, timezone
from typing import Annotated

from core import require_role_with_user
from core.database import get_db
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from models.doctor_model import Doctor
from models.nurse_model import Nurse
from models.patient_model import Patient
from models.receptionist_model import Receptionist
from models.reservation_model import Reservation
from models.user_model import User
from passlib.context import CryptContext
from schemas.reservation_schema import (ReservationCreate, ReservationModel,
                                        ReservationUpdate)
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, aliased

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

    # Compare against local current time to avoid UTC shifts when input is naive local
    if reservation_time < datetime.now():
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
        ["receptionist", "doctor", "nurse", "admin"]))
):
    """Retrieve all reservations in the system."""
    result = await db.execute(select(Reservation))
    reservations = result.scalars().all()
    return reservations


async def _get_detailed_reservations(
    db: AsyncSession,
    doctor_id: int | None = None,
    nurse_id: int | None = None,
    reservation_id: int | None = None
):
    doctor_user = aliased(User)
    nurse_user = aliased(User)
    patient_user = aliased(User)

    stmt = (
        select(
            Reservation,
            Doctor,
            doctor_user,
            Nurse,
            nurse_user,
            Patient,
            patient_user
        )
        .join(Doctor, Doctor.doctor_id == Reservation.doctor_id)
        .join(doctor_user, doctor_user.user_id == Doctor.user_id)
        .outerjoin(Nurse, Nurse.nurse_id == Reservation.nurse_id)
        .outerjoin(nurse_user, nurse_user.user_id == Nurse.user_id)
        .join(Patient, Patient.patient_id == Reservation.patient_id)
        .join(patient_user, patient_user.user_id == Patient.user_id)
    )

    if doctor_id is not None:
        stmt = stmt.where(Doctor.doctor_id == doctor_id)
    if nurse_id is not None:
        stmt = stmt.where(Nurse.nurse_id == nurse_id)
    if reservation_id is not None:
        stmt = stmt.where(Reservation.reservation_id == reservation_id)

    result = await db.execute(stmt)
    rows = result.all()

    output = []
    for r, d, d_u, n, n_u, p, p_u in rows:
        output.append({
            "reservation_id": r.reservation_id,
            "reservation_time": r.reservation_time,
            "is_cancelled": r.is_cancelled,
            "doctor": {
                "doctor_id": d.doctor_id,
                "first_name": d_u.first_name,
                "last_name": d_u.last_name
            },
            "nurse": {
                "nurse_id": n.nurse_id if n else None,
                "first_name": n_u.first_name if n_u else None,
                "last_name": n_u.last_name if n_u else None
            },
            "patient": {
                "patient_id": p.patient_id,
                "first_name": p_u.first_name,
                "last_name": p_u.last_name
            }
        })
    if reservation_id is not None:
        return output[0] if output else None
    return output

# GET all detailed reservations
@router.get("/detailed", description="Get all reservations with full details",
            dependencies=[Depends(require_role_with_user(["admin", "receptionist"]))])
async def get_all_detailed_reservations(db: AsyncSession = Depends(get_db)):
    return await _get_detailed_reservations(db)

# GET detailed reservations for a doctor
@router.get("/detailed/doctor/{doctor_id}",
            description="Get all reservations for a doctor",
            dependencies=[Depends(require_role_with_user(["doctor"]))])
async def get_doctor_detailed_reservations(doctor_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_detailed_reservations(db, doctor_id=doctor_id)

# GET detailed reservations for a nurse
@router.get("/detailed/nurse/{nurse_id}",
            description="Get all reservations for a nurse",
            dependencies=[Depends(require_role_with_user(["nurse"]))])
async def get_nurse_detailed_reservations(nurse_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_detailed_reservations(db, nurse_id=nurse_id)

# GET detailed reservation by ID
@router.get("/detailed/{reservation_id}",
            description="Get reservation by ID",
            dependencies=[Depends(require_role_with_user(["admin", "receptionist"]))])
async def get_detailed_reservation(reservation_id: int, db: AsyncSession = Depends(get_db)):
    res = await _get_detailed_reservations(db, reservation_id=reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return res

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

@router.get("/doctor/me", response_model=list[ReservationModel], description="Get reservations for current doctor")
async def get_my_reservations_doctor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["doctor"]))
):
    result = await db.execute(select(Doctor).where(Doctor.user_id == current_user.user_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor record not found for current user.")

    result = await db.execute(select(Reservation).where(Reservation.doctor_id == doctor.doctor_id))
    reservations = result.scalars().all()
    return reservations

@router.get("/nurse/me", response_model=list[ReservationModel], description="Get reservations for current nurse")
async def get_my_reservations_nurse(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["nurse"]))
):
    result = await db.execute(select(Nurse).where(Nurse.user_id == current_user.user_id))
    nurse = result.scalar_one_or_none()
    if not nurse:
        raise HTTPException(status_code=404, detail="Nurse record not found for current user.")

    result = await db.execute(select(Reservation).where(Reservation.nurse_id == nurse.nurse_id))
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


# Duplicate route removed: get_my_reservations defined earlier already
