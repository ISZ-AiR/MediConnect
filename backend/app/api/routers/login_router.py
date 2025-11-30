from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from datetime import timedelta

from core import get_db
from core.security import verify_password, create_access_token
from models import User

router = APIRouter(tags=["Login"])


@router.post("/login")
async def login(credentials: dict, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT token.
    The token contains user_id, email, and role.
    Frontend should store the token and use it for all subsequent requests.
    """
    email = credentials.get("email")
    password = credentials.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=400, detail="Email and password are required")

    result = await db.execute(
        select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create access token with user info
    access_token = create_access_token(
        data={
            "sub": str(user.user_id),
            "email": user.email,
            "role": user.role
        },
        expires_delta=timedelta(minutes=60)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }
