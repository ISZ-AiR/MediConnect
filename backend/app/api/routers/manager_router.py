from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from models.user_model import User
from schemas.manager_schema import ManagerBase, ManagerModel
from passlib.hash import bcrypt
from .user_router import require_role

router = APIRouter(
    prefix="/managers",
    tags=["Managers"]
)

@router.post("/", response_model=ManagerModel)
async def create_manager(manager: ManagerBase, db: AsyncSession = Depends(get_db),
                       current_user: User = Depends(require_role("admin"))):
    """
    Create a new manager user account.
    """
    # check if email already exists
    result = await db.execute(select(User).where(User.email == manager.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    hashed_pwd = bcrypt.hash(manager.password)

    new_manager = User(
        first_name=manager.first_name,
        last_name=manager.last_name,
        email=manager.email,
        phone=manager.phone,
        password_hash=hashed_pwd,
        role="manager"
    )

    db.add(new_manager)
    await db.commit()
    await db.refresh(new_manager)

    return new_manager


@router.get("/", response_model=list[ManagerModel])
async def get_all_managers(db: AsyncSession = Depends(get_db),
                         current_user: User = Depends(require_role("admin"))):
    """
    Retrieve all managers.
    """
    result = await db.execute(select(User).where(User.role == "manager"))
    managers = result.scalars().all()
    return managers


@router.get("/{manager_id}", response_model=ManagerModel)
async def get_manager_by_id(manager_id: int, db: AsyncSession = Depends(get_db),
                          current_user: User = Depends(require_role("admin"))):
    """
    Retrieve a single manager by ID.
    """
    result = await db.execute(
        select(User).where(User.user_id == manager_id, User.role == "manager")
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    return manager


@router.delete("/{manager_id}")
async def delete_manager(manager_id: int, db: AsyncSession = Depends(get_db),
                       current_user: User = Depends(require_role("admin"))):
    """
    Delete an manager user.
    """
    result = await db.execute(
        select(User).where(User.user_id == manager_id, User.role == "manager")
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    await db.delete(manager)
    await db.commit()

    return {"status": "Manager deleted successfully", "id": manager_id}
