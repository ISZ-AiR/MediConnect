from core import require_role_with_user
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.receptionist_model import Receptionist
from models.user_model import User
from passlib.hash import bcrypt
from schemas.receptionist_schema import ReceptionistCreate, ReceptionistModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter(
    prefix="/receptionist",
    tags=["Receptionist"]
)


@router.post("/", response_model=ReceptionistModel)
async def create_receptionist(receptionist: ReceptionistCreate, db: AsyncSession = Depends(get_db),
                              current_user: User = Depends(require_role_with_user(["admin"]))):
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


# ----- READ ALL -----
@router.get("/", response_model=list[dict])  # Zmieniamy na list[dict]
async def get_all_receptionists(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_role_with_user(["admin"]))
):
    """Get a list of all receptionists with user data."""
    result = await db.execute(
        select(Receptionist, User)
        .join(User, User.user_id == Receptionist.user_id)
    )
    rows = result.all()

    receptionists_data = []
    for receptionist, user in rows:
        receptionists_data.append({
            "receptionist_id": receptionist.receptionist_id,
            "user_id": receptionist.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone
        })

    return receptionists_data


# ----- READ ONE -----
@router.get("/{receptionist_id}", response_model=ReceptionistModel)
async def get_receptionist_by_id(
    receptionist_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin"]))
):
    """Retrieve a specific receptionist by ID (admin only)."""
    result = await db.execute(select(Receptionist).where(Receptionist.receptionist_id == receptionist_id))
    receptionist = result.scalar_one_or_none()
    if not receptionist:
        raise HTTPException(status_code=404, detail="Receptionist not found")
    return receptionist


# ----- DELETE -----
@router.delete("/{receptionist_id}")
async def delete_receptionist(
    receptionist_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin"]))
):
    """Delete a receptionist and their linked user account (admin only)."""
    result = await db.execute(select(Receptionist).where(Receptionist.receptionist_id == receptionist_id))
    receptionist = result.scalar_one_or_none()

    if not receptionist:
        raise HTTPException(status_code=404, detail="Receptionist not found")

    await db.delete(receptionist)
    await db.commit()

    return {"status": "Receptionist deleted successfully"}
