from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.referral_model import Referral
from schemas.referral_schema import ReferralCreate, ReferralModel, ReferralUpdate
from datetime import date

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
    result = await db.execute(select(Referral))
    referrals = result.scalars().all()
    return referrals


@router.get("/{referral_id}", response_model=ReferralModel)
async def get_referral(referral_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific referral by its ID.
    """
    result = await db.execute(select(Referral).where(Referral.referral_id == referral_id))
    referral = result.scalars().first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
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