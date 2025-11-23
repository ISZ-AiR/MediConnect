from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.orm import aliased
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.doctor_model import Doctor
from models.user_model import User
from models.nurse_model import Nurse
from models.reservation_model import Reservation
from models.visit_model import Visit
from models.patient_model import Patient
from schemas.doctor_schema import DoctorCreate, DoctorModel, DoctorUpdate
from passlib.hash import bcrypt
from .user_router import require_role

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.post("/", response_model=DoctorModel)
async def create_doctor(doctor: DoctorCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
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


@router.get("/", response_model=list[dict])
async def get_all_doctors(
        db: AsyncSession = Depends(get_db),
        current_user=Depends(require_role(["admin", "manager", "receptionist", "patient", "doctor"]))
):
    # Pobierz lekarzy wraz z powiązanym userem
    result = await db.execute(
        select(Doctor, User)
        .join(User, User.user_id == Doctor.user_id)
    )
    rows = result.all()

    doctors = []
    for doctor, user in rows:
        doctors.append({
            "doctor_id": doctor.doctor_id,
            "specialization": doctor.specialization,
            "license_number": doctor.license_number,
            "user_id": doctor.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name
        })

    return doctors

@router.get("/me", response_model=DoctorModel)
async def get_my_doctor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["doctor"]))
    ):
    result = await db.execute(select(Doctor).where(Doctor.user_id == current_user.user_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor



@router.get("/{doctor_id}", response_model=DoctorModel)
async def get_doctor_by_id(doctor_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["admin", "manager", "receptionist", "patient", "doctor"]))):
    result = await db.execute(select(Doctor).where(Doctor.doctor_id == doctor_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor



@router.put("/{doctor_id}", response_model=DoctorModel)
async def update_doctor(
    doctor_id: int,
    doctor_update: DoctorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    result = await db.execute(select(Doctor).where(Doctor.doctor_id == doctor_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # update linked user data if provided
    result = await db.execute(select(User).where(User.user_id == doctor.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Linked user not found")

    if doctor_update.first_name:
        user.first_name = doctor_update.first_name
    if doctor_update.last_name:
        user.last_name = doctor_update.last_name
    if doctor_update.email:
        user.email = doctor_update.email
    if doctor_update.phone:
        user.phone = doctor_update.phone
    if doctor_update.password:
        user.password_hash = bcrypt.hash(doctor_update.password)

    # doctor-specific fields
    if doctor_update.specialization:
        doctor.specialization = doctor_update.specialization
    if doctor_update.license_number:
        doctor.license_number = doctor_update.license_number

    db.add_all([user, doctor])
    await db.commit()
    await db.refresh(doctor)

    return doctor


@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    result = await db.execute(select(Doctor).where(Doctor.doctor_id == doctor_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # get linked user
    result = await db.execute(select(User).where(User.user_id == doctor.user_id))
    user = result.scalar_one_or_none()

    if user:
        await db.delete(user)
    await db.delete(doctor)
    await db.commit()

