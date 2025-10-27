from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.receptionist_model import Receptionist
from models.user_model import User
from schemas.receptionist_schema import ReceptionistCreate, ReceptionistModel
from passlib.hash import bcrypt

router = APIRouter(
    prefix="/receptionist",
    tags=["Receptionist"]
)


@router.post("/", response_model=ReceptionistModel)
async def create_receptionist(receptionist: ReceptionistCreate, db: AsyncSession = Depends(get_db)):
    # 1. Check if email exists
    result = await db.execute(select(User).filter(User.email == receptionist.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 3. Create User
    db_user = User(
        first_name=receptionist.first_name,
        last_name=receptionist.last_name,
        email=receptionist.email,
        phone=receptionist.phone,
        password_hash=bcrypt.hash(receptionist.password),
        role="receptionist"
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # 4. Create Doctor
    new_receptionist = Receptionist(
        user_id=db_user.user_id,
    )
    db.add(new_receptionist)
    await db.commit()
    await db.refresh(new_receptionist)

    return new_receptionist