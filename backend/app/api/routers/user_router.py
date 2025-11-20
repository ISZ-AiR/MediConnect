from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core import get_db
from models import User
from api.routers.login_router import oauth2_scheme, SECRET_KEY, ALGORITHM
from typing import Union, List

router = APIRouter(prefix="/users", tags=["Users"])


# --- Dependency to get current user ---
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception

    return user


# --- /me endpoint ---
@router.get("/me")
async def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "role": current_user.role,
    }


def require_role(roles: Union[str, List[str]]):
    """
    Dependency that checks if the current user has one of the required roles.

    :param roles: a role string or a list of role strings allowed
    """
    if isinstance(roles, str):
        roles_list = [roles]
    else:
        roles_list = roles

    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles_list:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role(s): {', '.join(roles_list)}."
            )
        return current_user

    return role_checker


@router.get("/", response_model=List[dict])
async def read_users(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["admin", "receptionist"]))):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        {
            "user_id": u.user_id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role,
        }
        for u in users
    ]


@router.get("/{user_id}", response_model=dict)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
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
async def update_user(user_id: int, payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
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
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return None