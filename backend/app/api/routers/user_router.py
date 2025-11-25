from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core import get_db
from core import verify_token, require_role_with_user, require_role
from models import User
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])


# --- /me endpoint ---
@router.get("/me")
async def read_current_user(
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    """Get the currently authenticated user's information."""
    result = await db.execute(select(User).where(User.user_id == current_user["user_id"]))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


@router.get("/", response_model=List[dict])
async def read_users(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role(
        ["admin", "receptionist", "patient", "doctor", "nurse", "manager"]))
):
    """Get all users (accessible by most roles)."""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        {
            "user_id": u.user_id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
        }
        for u in users
    ]


@router.get("/{user_id}", response_model=dict)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role(
        ["admin", "receptionist", "manager"]))
):
    """Get a specific user by ID (admin, receptionist, and manager only)."""
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
    }


@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin"]))
):
    """Update a user (admin only)."""
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field in ["first_name", "last_name", "email", "role"]:
        if field in payload:
            setattr(user, field, payload[field])

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
    }


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["admin"]))
):
    """Delete a user (admin only)."""
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return None
