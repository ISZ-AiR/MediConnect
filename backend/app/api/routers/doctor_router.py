from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.doctor_model import Doctor
from models.user_model import User
from schemas.doctor_schema import DoctorCreate, DoctorModel
from passlib.hash import bcrypt

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.post("/", response_model=DoctorModel)
async def create_doctor(doctor: DoctorCreate, db: AsyncSession = Depends(get_db)):
    # 1. Check if email exists
    result = await db.execute(select(User).filter(User.email == doctor.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Check if license exists
    result = await db.execute(select(Doctor).filter(Doctor.license_number == doctor.license_number))
    existing_license = result.scalar_one_or_none()
    if existing_license:
        raise HTTPException(status_code=400, detail="License number already exists")

    # 3. Create User
    db_user = User(
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        email=doctor.email,
        phone=doctor.phone,
        password_hash=bcrypt.hash(doctor.password),
        role="doctor"
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # 4. Create Doctor
    db_doctor = Doctor(
        user_id=db_user.user_id,
        specialization=doctor.specialization,
        license_number=doctor.license_number
    )
    db.add(db_doctor)
    await db.commit()
    await db.refresh(db_doctor)

    return db_doctor