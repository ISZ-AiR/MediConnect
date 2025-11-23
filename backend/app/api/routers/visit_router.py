from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from core.database import get_db
from models.visit_model import Visit
from models.reservation_model import Reservation
from models.user_model import User
from models.patient_model import Patient
from schemas.visit_schema import VisitBase, VisitModel, VisitUpdate
from .user_router import require_role


router = APIRouter(prefix="/visits", tags=["Visits"])


@router.post("/{reservation_id}", response_model=VisitModel)
async def create_visit(reservation_id: int, visit: VisitBase, db: AsyncSession = Depends(get_db)):
    """
    Create a new medical visit entry for a given reservation.
    """

    # Check if reservation exists
    result = await db.execute(select(Reservation).where(Reservation.reservation_id == reservation_id))
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Check if visit already exists for this reservation
    result = await db.execute(select(Visit).where(Visit.reservation_id == reservation_id))
    existing_visit = result.scalar_one_or_none()
    if existing_visit:
        raise HTTPException(status_code=400, detail="Visit for this reservation already exists")

    # Create visit entry
    db_visit = Visit(
        reservation_id=reservation_id,
        visit_note=visit.visit_note,
        visit_date=visit.visit_date,
        nurse_id=visit.nurse_id
    )

    db.add(db_visit)
    await db.commit()
    await db.refresh(db_visit)

    return db_visit


@router.get("/", response_model=List[VisitModel], description="Get all visits by reservation")
async def get_all_visits(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all visits in the system.
    """
    result = await db.execute(select(Visit))
    visits = result.scalars().all()
    return visits

@router.get("/me", response_model=List[VisitModel])
async def get_my_visits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("patient"))
    ):
    """
    Get all visits for the logged-in patient via reservation
    """
    result = await db.execute(
        select(Visit)
        .options(joinedload(Visit.reservation))
        .join(Reservation, Visit.reservation_id == Reservation.reservation_id)
        .join(Patient, Reservation.patient_id == Patient.patient_id)
        .where(Patient.user_id == current_user.user_id)
    )
    visits = result.scalars().all()
    return visits


@router.get("/{visit_id}", response_model=VisitModel)
async def get_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific visit by ID.
    """
    result = await db.execute(select(Visit).where(Visit.visit_id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit


@router.put("/{visit_id}", response_model=VisitModel)
async def update_visit(
    visit_id: int,
    visit_data: VisitUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["nurse", "receptionist"]))
):
    """
    Update an existing visit. Only the nurse who created it or admin can update.
    """
    result = await db.execute(select(Visit).where(Visit.visit_id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    # Update fields
    visit.visit_note = visit_data.visit_note
    visit.visit_date = visit_data.visit_date
    visit.nurse_id = visit_data.nurse_id or visit.nurse_id

    db.add(visit)
    await db.commit()
    await db.refresh(visit)
    return visit


# ----------------------------
# DELETE a visit
# ----------------------------
@router.delete("/{visit_id}")
async def delete_visit(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin"))  # Only admin can delete
):
    """
    Delete a visit entry. Only admin is allowed.
    """
    result = await db.execute(select(Visit).where(Visit.visit_id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    await db.delete(visit)
    await db.commit()
    return {"status": "Visit deleted successfully"}


