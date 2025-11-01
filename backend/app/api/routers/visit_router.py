from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from models.visit_model import Visit
from schemas.visit_schema import VisitBase, VisitModel

router = APIRouter(
    prefix="/visits",
    tags=["Visits"]
)


@router.post("/", response_model=VisitModel)
async def create_visit(visit: VisitBase, reservation_id: int, db: AsyncSession = Depends(get_db)):
    """
    Create a new medical visit entry.
    """

    # 🔹 Sprawdź, czy wizyta dla tej rezerwacji już istnieje
    result = await db.execute(select(Visit).where(Visit.reservation_id == reservation_id))
    existing_visit = result.scalar_one_or_none()
    if existing_visit:
        raise HTTPException(status_code=400, detail="Visit for this reservation already exists")

    # 🔹 Utwórz nową wizytę
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


@router.get("/", response_model=list[VisitModel])
async def get_all_visits(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all recorded medical visits.
    """
    result = await db.execute(select(Visit))
    visits = result.scalars().all()
    return visits


@router.get("/{visit_id}", response_model=VisitModel)
async def get_visit_by_id(visit_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific visit by its ID.
    """
    result = await db.execute(select(Visit).where(Visit.visit_id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit
