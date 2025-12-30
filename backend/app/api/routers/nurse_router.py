from core import require_role_with_user
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.nurse_model import Nurse
from models.user_model import User
from passlib.hash import bcrypt
from schemas.nurse_schema import NurseCreate, NurseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

router = APIRouter(
    prefix="/nurse",
    tags=["Nurse"]
)


@router.post("/", response_model=NurseModel)
async def create_nurse(nurse: NurseCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role_with_user(["admin"]))):
    # 1. E-mail uniqueness
    result = await db.execute(select(User).filter(User.email == nurse.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. User creation
    db_user = User(
        first_name=nurse.first_name,
        last_name=nurse.last_name,
        email=nurse.email,
        phone=nurse.phone,
        password_hash=bcrypt.hash(nurse.password),
        role="nurse"
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # 3. Nurse as a User
    db_nurse = Nurse(user_id=db_user.user_id)
    db.add(db_nurse)
    await db.commit()
    await db.refresh(db_nurse)

    return db_nurse


@router.get("/me", response_model=NurseModel)
async def get_my_nurse(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["nurse"]))
):
    """
    Get logged-in nurse info
    """
    result = await db.execute(select(Nurse).where(Nurse.user_id == current_user.user_id))
    nurse = result.scalar_one_or_none()
    if not nurse:
        raise HTTPException(status_code=404, detail="Nurse not found")
    return nurse


@router.get("/", response_model=list[dict])
async def get_all_nurses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin", "receptionist", "patient", "doctor", "nurse"]))
):
    result = await db.execute(
        select(Nurse, User)
        .join(User, User.user_id == Nurse.user_id)
    )
    rows = result.all()

    nurses = []
    for nurse, user in rows:
        nurses.append({
            "nurse_id": nurse.nurse_id,
            "user_id": nurse.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone
        })
    return nurses



@router.get("/{nurse_id}", response_model=NurseModel)
async def get_nurse_by_id(
    nurse_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin"]))
):
    result = await db.execute(select(Nurse).where(Nurse.nurse_id == nurse_id))
    nurse = result.scalar_one_or_none()
    if not nurse:
        raise HTTPException(status_code=404, detail="Nurse not found")
    return nurse


@router.delete("/{nurse_id}")
async def delete_nurse(
    nurse_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin"]))
):
    result = await db.execute(select(Nurse).where(Nurse.nurse_id == nurse_id))
    nurse = result.scalar_one_or_none()

    if not nurse:
        raise HTTPException(status_code=404, detail="Nurse not found")

    await db.delete(nurse)
    await db.commit()
    return {"status": "Nurse deleted successfully"}
