from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user_model import User
from models.nurse_model import Nurse
from schemas.nurse_schema import NurseCreate, NurseModel
from passlib.hash import bcrypt

router = APIRouter()


@router.post("/", response_model=NurseModel)
def create_nurse(nurse: NurseCreate, db: Session = Depends(get_db)):
    # Sprawdzenie unikalności emaila
    if db.query(User).filter(User.email == nurse.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Tworzenie użytkownika
    db_user = User(
        first_name=nurse.first_name,
        last_name=nurse.last_name,
        email=nurse.email,
        phone=nurse.phone,
        password_hash=bcrypt.hash(nurse.password),
        role="nurse"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Tworzenie pielęgniarki powiązanej z użytkownikiem
    db_nurse = Nurse(user_id=db_user.user_id)
    db.add(db_nurse)
    db.commit()
    db.refresh(db_nurse)

    return db_nurse