from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.doctor_model import Doctor
from models.user_model import User
from schemas.doctor_schema import DoctorCreate, DoctorModel
from passlib.hash import bcrypt

router = APIRouter()


@router.post("/", response_model=DoctorModel)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    # 1. E-mail needs to be unique
    if db.query(User).filter(User.email == doctor.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Licence number needs to be unique
    if db.query(Doctor).filter(Doctor.license_number == doctor.license_number).first():
        raise HTTPException(status_code=400, detail="License number already exists")

    # 3. User creation
    db_user = User(
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        email=doctor.email,
        phone=doctor.phone,
        password_hash=bcrypt.hash(doctor.password),
        role="doctor"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 4. Doctor as a type of User
    db_doctor = Doctor(
        user_id=db_user.user_id,
        specialization=doctor.specialization,
        license_number=doctor.license_number
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)

    return db_doctor