from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from core.database import get_db
from models.examination_model import Examination
from schemas.examination_schema import ExaminationBase, ExaminationModel

router = APIRouter(
    prefix="/examinations",
    tags=["Examinations"]
)

@router.post("/", response_model=ExaminationModel)
async def create_examination(
    examination: ExaminationBase,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new medical examination entry.
    """
    new_examination = Examination(
        name=examination.name,
        description=examination.description,
        type=examination.type
    )

    db.add(new_examination)
    await db.commit()
    await db.refresh(new_examination)

    return new_examination


@router.get("/", response_model=list[ExaminationModel])
async def get_all_examinations(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all available medical examinations.
    """
    result = await db.execute(select(Examination))
    examinations = result.scalars().all()
    return examinations


@router.get("/{examination_id}", response_model=ExaminationModel)
async def get_examination_by_id(examination_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve specific examination details by ID.
    """
    result = await db.execute(select(Examination).where(Examination.examination_id == examination_id))
    examination = result.scalar_one_or_none()

    if not examination:
        raise HTTPException(status_code=404, detail="Examination not found")

    return examination


@router.put("/{examination_id}", response_model=ExaminationModel)
async def update_examination(
    examination_id: int,
    updated_data: ExaminationBase,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing examination record.
    """
    result = await db.execute(select(Examination).where(Examination.examination_id == examination_id))
    examination = result.scalar_one_or_none()

    if not examination:
        raise HTTPException(status_code=404, detail="Examination not found")

    examination.name = updated_data.name
    examination.description = updated_data.description
    examination.type = updated_data.type

    await db.commit()
    await db.refresh(examination)

    return examination


@router.delete("/{examination_id}")
async def delete_examination(examination_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete an examination entry.
    """
    result = await db.execute(select(Examination).where(Examination.examination_id == examination_id))
    examination = result.scalar_one_or_none()

    if not examination:
        raise HTTPException(status_code=404, detail="Examination not found")

    await db.delete(examination)
    await db.commit()

    return {"status": "Examination deleted successfully", "id": examination_id}
