from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy import select

from core import get_db
from models import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
router = APIRouter(tags=["Login"])

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = timedelta(minutes=30)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta):

    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/login")
async def login(form_data:OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> dict:

    email = form_data.username
    password = form_data.password

    # Find the user in the database
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    # Raise the exception if user is not found or the password is invalid
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Create token
    token_data = {"user_id": user.user_id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data, expires_delta=ACCESS_TOKEN_EXPIRE_MINUTES)

    return {"access_token": access_token, "token_type": "bearer", "email": user.email, "role": user.role}



