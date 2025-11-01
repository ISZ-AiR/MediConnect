from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.prescription_model import Prescription
from models.visit_model import Visit
from schemas.prescription_schema import PrescriptionBase, PrescriptionModel

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)


@router.post("/", response_model=PrescriptionModel)
async def create_prescription(
    prescription: PrescriptionBase,
    visit_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new prescription for a given visit.
    """
    # Check if the visit exists
    result = await db.execute(select(Visit).where(Visit.visit_id == visit_id))
    visit = result.scalars().first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    # Check if the visit already has a prescription
    result = await db.execute(select(Prescription).where(Prescription.visit_id == visit_id))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="This visit already has a prescription")

    # Create new prescription
    db_prescription = Prescription(
        visit_id=visit_id,
        medication=prescription.medication,
        dosage=prescription.dosage,
        instruction=prescription.instruction,
    )

    db.add(db_prescription)
    await db.commit()
    await db.refresh(db_prescription)

    return db_prescription


@router.get("/", response_model=list[PrescriptionModel])
async def get_all_prescriptions(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all prescriptions.
    """
    result = await db.execute(select(Prescription))
    prescriptions = result.scalars().all()
    return prescriptions


@router.get("/{prescription_id}", response_model=PrescriptionModel)
async def get_prescription_by_id(prescription_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific prescription by its ID.
    """
    result = await db.execute(select(Prescription).where(Prescription.prescription_id == prescription_id))
    prescription = result.scalars().first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription
