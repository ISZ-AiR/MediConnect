from fastapi import APIRouter, Depends, HTTPException, Form, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from typing import Annotated
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy import select, and_

from models.reservation_model import Reservation
from models.patient_model import Patient
from models.doctor_model import Doctor
from models.nurse_model import Nurse
from models.receptionist_model import Receptionist
from schemas.reservation_schema import ReservationModel, ReservationCreate

router = APIRouter(prefix="/reservation", tags=["reservation"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Decode the token.
    """
    try:
        payload = jwt.decode(token, "your_secret_key", algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# TODO: Find a way to store tokens and test the create reservation function below
"""
@router.post("/create", response_model=ReservationModel)
async def create_reservation(reservation: ReservationCreate, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):

    # Check if the logged in user is permitted to make reservations
    if current_user["role"] != "receptionist":
        raise HTTPException(status_code=403, detail="Forbidden")

    # Check if the data is correct
    result = await db.execute(select(Patient).filter(Patient.patient_id == reservation.patient_id))
    existing_patient = result.scalar_one_or_none()
    if not existing_patient:
        raise HTTPException(status_code=400, detail="Patient record does not exist.")

    result = await db.execute(select(Doctor).filter(Doctor.doctor_id == reservation.doctor_id))
    existing_doctor = result.scalar_one_or_none()
    if not existing_doctor:
        raise HTTPException(status_code=400, detail="Doctor record does not exist.")

    # TODO: ?? Check if the nurse data is correct

    # Check if the date is correct (is not in the past)
    if reservation.reservation_time < datetime.now():
        raise HTTPException(status_code=400, detail="The reservation time is in the future.")

    # Check if the reservation is possible -- for the doctor and for the patient
    start_window = reservation.reservation_time - timedelta(minutes=15)
    end_window = reservation.reservation_time + timedelta(minutes=15)

    # for the doctor
    stmt = select(Reservation).where(
        and_(
            Reservation.doctor_id == reservation.doctor_id,
            Reservation.reservation_time >= start_window,
            Reservation.reservation_time <= end_window,
            Reservation.is_cancelled == False
        )
    )
    result = await db.execute(stmt)
    conflicting_reservation  = result.scalar_one_or_none()
    if conflicting_reservation:
        raise HTTPException(status_code=400, detail="Doctor is not available at this time.")

    # for the patient
    stmt = select(Reservation).where(
        and_(
            Reservation.patient_id == reservation.patient_id,
            Reservation.reservation_time >= start_window,
            Reservation.reservation_time <= end_window,
            Reservation.is_cancelled == False
        )
    )
    result = await db.execute(stmt)
    conflicting_reservation = result.scalar_one_or_none()
    if conflicting_reservation:
        raise HTTPException(status_code=400, detail="Conflicting reservation found.")

    # Create new reservation
    new_reservation = Reservation(
        receptionist_id=current_user["user_id"],
        patient_id=reservation.patient_id,
        doctor_id=reservation.doctor_id,
        nurse_id=reservation.nurse_id,
        reservation_time=reservation.date,
        is_cancelled=reservation.is_cancelled,
    )

    db.add(new_reservation)
    await db.commit()
    await db.refresh(new_reservation)

    return {"status": "Reservation created!", "id": new_reservation.reservation_id}
"""




