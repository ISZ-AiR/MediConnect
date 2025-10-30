from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy import select

from core import get_db
from models import Patient, User
from schemas.patient_schema import PatientModel, PatientCreate


router = APIRouter(prefix="/register", tags=["Register"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/patient", response_model=PatientModel, description="Create your own patient account.")
async def patient(new_patient: PatientCreate, db: Session = Depends(get_db)):

    # Check if the account already exists
    result = await db.execute(select(User).where(User.email == new_patient.email))
    patient = result.scalar_one_or_none()

    if patient:
        raise HTTPException(status_code=400, detail="A patient with this email already exists.")

    # Check if the PESEL is already registered
    result = await db.execute(select(Patient).where(Patient.pesel == new_patient.pesel))
    existing_pesel =  result.scalar_one_or_none()
    if existing_pesel:
        raise HTTPException(status_code=400,detail="A patient with this PESEL already exists.")

    # Create the user record
    hashed_password = pwd_context.hash(new_patient.password)
    user = User(
        first_name=new_patient.first_name,
        last_name=new_patient.last_name,
        email=new_patient.email,
        phone=new_patient.phone,
        password_hash=hashed_password,
        role="patient"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Create the patient record
    patient = Patient(
        user_id=user.user_id,
        pesel=new_patient.pesel,
        birth_date=new_patient.birth_date
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)

    return patient
