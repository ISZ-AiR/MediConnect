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
from schemas.reservation_schema import ReservationModel, ReservationCreate
from .user_router import require_role

router = APIRouter(prefix="/reservation", tags=["reservation"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")



@router.post("/create", response_model=ReservationModel)
async def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("receptionist"))):

    # Check if the data is correct
    result = await db.execute(select(Patient).filter(Patient.patient_id == reservation.patient_id))
    existing_patient = result.scalars().all()
    if not existing_patient:
        raise HTTPException(status_code=400, detail="Patient record does not exist.")

    result = await db.execute(select(Doctor).filter(Doctor.doctor_id == reservation.doctor_id))
    existing_doctor = result.scalars().all()
    if not existing_doctor:
        raise HTTPException(status_code=400, detail="Doctor record does not exist.")

    # TODO: ?? Check if the nurse data is correct

    raw_time = reservation.reservation_time
    reservation_time = to_naive_utc(raw_time)

    if reservation_time < datetime.utcnow():
        raise HTTPException(status_code=400, detail="The reservation time must be in the future.")

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
    conflicting_reservation  = result.scalars().all()
    if conflicting_reservation:
        raise HTTPException(status_code=400, detail="Doctor is not available at this time.")

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
        raise HTTPException(status_code=400, detail="Conflicting reservation found.")

    result = await db.execute(select(Receptionist).where(Receptionist.user_id == current_user.user_id))
    receptionist = result.scalars().all()

    # Create new reservation
    new_reservation = Reservation(
        receptionist_id=receptionist.receptionist_id,
        patient_id=reservation.patient_id,
        doctor_id=reservation.doctor_id,
        nurse_id=reservation.nurse_id,
        reservation_time=reservation_time,
        is_cancelled=reservation.is_cancelled,
    )

    db.add(new_reservation)
    await db.commit()
    await db.refresh(new_reservation)

    return new_reservation


def to_naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt





