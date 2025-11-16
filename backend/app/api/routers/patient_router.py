from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy import select
from .user_router import get_current_user, require_role
from sqlalchemy.ext.asyncio import AsyncSession

from core import get_db
from models import Patient, User
from schemas.patient_schema import PatientModel, PatientCreate, PatientUpdate


router = APIRouter(prefix="/patients", tags=["Patients"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=PatientModel, description="Create your own patient account.")
async def patient(new_patient: PatientCreate, db: Session = Depends(get_db)):

    # Check if the account already exists
    result = await db.execute(select(User).where(User.email == new_patient.email))
    patient = result.scalar_one_or_none()

    if patient:
        raise HTTPException(
            status_code=400, detail="A patient with this email already exists.")

    # Check if the PESEL is already registered
    result = await db.execute(select(Patient).where(Patient.pesel == new_patient.pesel))
    existing_pesel = result.scalar_one_or_none()
    if existing_pesel:
        raise HTTPException(
            status_code=400, detail="A patient with this PESEL already exists.")

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


@router.get("/", response_model=list[PatientModel], description="Retrieve all patients.")
async def get_all_patients(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["receptionist", "admin"]))):
    result = await db.execute(select(Patient))
    patients = result.scalars().all()
    return patients


@router.get("/{patient_id}", response_model=PatientModel, description="Retrieve a patient by ID.")
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["receptionist", "admin"]))):
    result = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.put("/{patient_id}", response_model=PatientModel, description="Update a patient's details.")
async def update_patient(patient_id: int, patient_update: PatientUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["receptionist", "admin"]))):
    result = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Update fields if provided
    if patient_update.first_name:
        patient.user.first_name = patient_update.first_name
    if patient_update.last_name:
        patient.user.last_name = patient_update.last_name
    if patient_update.phone:
        patient.user.phone = patient_update.phone
    if patient_update.pesel:
        patient.pesel = patient_update.pesel
    if patient_update.birth_date:
        patient.birth_date = patient_update.birth_date

    await db.commit()
    await db.refresh(patient)
    return patient


@router.delete("/{patient_id}", description="Delete a patient account.")
async def delete_patient(patient_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["receptionist", "admin"]))):
    result = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    await db.delete(patient.user)  # Also deletes linked User via relationship
    await db.commit()
    return {"detail": "Patient deleted successfully"}
