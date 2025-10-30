from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.user_model import User
from models.nurse_model import Nurse
from schemas.nurse_schema import NurseCreate, NurseModel
from passlib.hash import bcrypt

router = APIRouter(
    prefix="/nurse",
    tags=["Nurse"]
)

@router.post("/", response_model=NurseModel)
async def create_nurse(nurse: NurseCreate, db: AsyncSession = Depends(get_db)):
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
