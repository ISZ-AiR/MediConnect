from core import require_role_with_user
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.user_model import User
from passlib.hash import bcrypt
from schemas.manager_schema import ManagerCreate, ManagerUpdate, ManagerModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/managers",
    tags=["Managers"]
)


# --- CREATE ---
@router.post("/", response_model=ManagerModel)
async def create_manager(
        manager: ManagerCreate,  # Używamy schematu z wymaganym hasłem
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_role_with_user(["admin"]))
):
    result = await db.execute(select(User).where(User.email == manager.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_manager = User(
        first_name=manager.first_name,
        last_name=manager.last_name,
        email=manager.email,
        phone=manager.phone,
        password_hash=bcrypt.hash(manager.password),
        role="manager"
    )

    db.add(new_manager)
    await db.commit()
    await db.refresh(new_manager)
    return new_manager


# --- READ ALL ---
@router.get("/", response_model=list[ManagerModel])
async def get_all_managers(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_role_with_user(["admin"]))
):
    result = await db.execute(select(User).where(User.role == "manager"))
    return result.scalars().all()


# --- READ ONE ---
@router.get("/{manager_id}", response_model=ManagerModel)
async def get_manager_by_id(
        manager_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_role_with_user(["admin"]))
):
    result = await db.execute(
        select(User).where(User.user_id == manager_id, User.role == "manager")
    )
    manager = result.scalar_one_or_none()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    return manager


# --- UPDATE ---
@router.put("/{manager_id}", response_model=ManagerModel)
async def update_manager(
        manager_id: int,
        manager_update: ManagerUpdate,  # Używamy schematu, gdzie pola są opcjonalne
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_role_with_user(["admin"]))
):
    result = await db.execute(
        select(User).where(User.user_id == manager_id, User.role == "manager")
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    update_data = manager_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if key == "password":
            manager.password_hash = bcrypt.hash(value)
        else:
            setattr(manager, key, value)

    await db.commit()
    await db.refresh(manager)
    return manager


# --- DELETE ---
@router.delete("/{manager_id}")
async def delete_manager(
        manager_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(require_role_with_user(["admin"]))
):
    result = await db.execute(
        select(User).where(User.user_id == manager_id, User.role == "manager")
    )
    manager = result.scalar_one_or_none()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    await db.delete(manager)
    await db.commit()
    return {"status": "Manager deleted successfully", "id": manager_id}