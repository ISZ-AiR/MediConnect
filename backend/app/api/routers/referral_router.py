from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.referral_model import Referral
from schemas.referral_schema import ReferralCreate, ReferralModel
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