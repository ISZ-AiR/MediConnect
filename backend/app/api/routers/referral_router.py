from datetime import date

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.doctor_model import Doctor
from models.patient_model import Patient
from models.referral_model import Referral
from schemas.referral_schema import (ReferralCreate, ReferralModel,
                                     ReferralUpdate)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

router = APIRouter(
    prefix="/referrals",
    tags=["Referrals"]
)


@router.post("/", response_model=ReferralModel)
async def create_referral(referral: ReferralCreate, db: AsyncSession = Depends(get_db)):
    """
    Creates new referral in the database.
    """

    # Check for duplicates
    result = await db.execute(
        select(Referral).filter(
            Referral.visit_id == referral.visit_id,
            Referral.examination_id == referral.examination_id
        )
    )
    existing_referral = result.scalars().first()

    if existing_referral:
        raise HTTPException(
            status_code=400,
            detail="Referral for this visit and examination already exists.."
        )

    new_referral = Referral(
        visit_id=referral.visit_id,
        patient_id=referral.patient_id,
        examination_id=referral.examination_id,
        doctor_id=referral.doctor_id,
        referral_date=referral.referral_date or date.today(),
        notes=referral.notes,
        is_completed=referral.is_completed
    )

    db.add(new_referral)
    await db.commit()
    await db.refresh(new_referral)

    return new_referral


@router.get("/", response_model=list[ReferralModel])
async def get_all_referrals(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all referrals from the database.
    """
    result = await db.execute(
        select(Referral)
        .options(
            joinedload(Referral.patient)
            .joinedload(Patient.user),  # patient.user
            joinedload(Referral.doctor)
            .joinedload(Doctor.user)    # doctor.user
        )
    )
    referrals = result.scalars().all()

    for r in referrals:
        r.doctor_name = (f"{r.doctor.user.first_name} "
                         f"{r.doctor.user.last_name}")
        r.patient_name = (f"{r.patient.user.first_name} "
                          f"{r.patient.user.last_name}")
        r.patient_pesel = f"{r.patient.pesel}"
        r.doctor_user_id = r.doctor.user.user_id

    return referrals

@router.get("/visit/{visit_id}", response_model=ReferralModel)
async def get_referral_by_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a referral assigned to a specific visit.
    """
    result = await db.execute(
        select(Referral).where(Referral.visit_id == visit_id)
    )
    referral = result.scalars().first()

    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found for this visit")

    return referral


@router.get("/{referral_id}", response_model=ReferralModel)
async def get_referral(referral_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific referral by its ID.
    """
    result = await db.execute(
        select(Referral)
        .where(Referral.referral_id == referral_id)
        .options(
            joinedload(Referral.patient)
            .joinedload(Patient.user),  # patient.user
            joinedload(Referral.doctor)
            .joinedload(Doctor.user)  # doctor.user
        )
    )
    referral = result.scalars().first()

    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    referral.doctor_name = f"{referral.doctor.user.first_name} {referral.doctor.user.last_name}"
    referral.patient_name = f"{referral.patient.user.first_name} {referral.patient.user.last_name}"
    referral.patient_pesel = referral.patient.pesel
    referral.doctor_user_id = referral.doctor.user.user_id

    return referral


@router.put("/{referral_id}", response_model=ReferralModel)
async def update_referral(referral_id: int, referral_update: ReferralUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update an existing referral.
    """
    result = await db.execute(select(Referral).where(Referral.referral_id == referral_id))
    referral = result.scalars().first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    # Update fields
    for key, value in referral_update.model_dump(exclude_unset=True).items():
        setattr(referral, key, value)

    db.add(referral)
    await db.commit()
    await db.refresh(referral)

    return referral


@router.delete("/{referral_id}", response_model=dict)
async def delete_referral(referral_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete a referral from the database.
    """
    result = await db.execute(select(Referral).where(Referral.referral_id == referral_id))
    referral = result.scalars().first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    await db.delete(referral)
    await db.commit()

    return {"detail": "Referral deleted successfully."}