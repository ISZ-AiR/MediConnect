from core import require_role_with_user
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.user_model import User
from passlib.hash import bcrypt
from schemas.admin_schema import AdminBase, AdminModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/admins",
    tags=["Admins"]
)


@router.post("/", response_model=AdminModel)
async def create_admin(admin: AdminBase, db: AsyncSession = Depends(get_db),
                       current_user: User = Depends(require_role_with_user(["admin"]))):
    """
    Create a new admin user account.
    """
    # check if email already exists
    result = await db.execute(select(User).where(User.email == admin.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists")

    hashed_pwd = bcrypt.hash(admin.password)

    new_admin = User(
        first_name=admin.first_name,
        last_name=admin.last_name,
        email=admin.email,
        phone=admin.phone,
        password_hash=hashed_pwd,
        role="admin"
    )

    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)

    return new_admin


@router.get("/", response_model=list[AdminModel])
async def get_all_admins(db: AsyncSession = Depends(get_db),
                         current_user: User = Depends(require_role_with_user(["admin"]))):
    """
    Retrieve all admins.
    """
    result = await db.execute(select(User).where(User.role == "admin"))
    admins = result.scalars().all()
    return admins


@router.get("/{admin_id}", response_model=AdminModel)
async def get_admin_by_id(admin_id: int, db: AsyncSession = Depends(get_db),
                          current_user: User = Depends(require_role_with_user(["admin"]))):
    """
    Retrieve a single admin by ID.
    """
    result = await db.execute(
        select(User).where(User.user_id == admin_id, User.role == "admin")
    )
    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    return admin


@router.delete("/{admin_id}")
async def delete_admin(admin_id: int, db: AsyncSession = Depends(get_db),
                       current_user: User = Depends(require_role_with_user(["admin"]))):
    """
    Delete an admin user.
    """
    result = await db.execute(
        select(User).where(User.user_id == admin_id, User.role == "admin")
    )
    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    await db.delete(admin)
    await db.commit()

    return {"status": "Admin deleted successfully", "id": admin_id}
