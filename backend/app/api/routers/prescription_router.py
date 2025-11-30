from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from core.database import get_db
from models.prescription_model import Prescription
from models.user_model import User
from models.visit_model import Visit
from models.patient_model import Patient
from models.doctor_model import Doctor
from models.reservation_model import Reservation
from schemas.prescription_schema import PrescriptionBase, PrescriptionModel, PrescriptionUpdate
from core import require_role_with_user

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)

@router.post("/", response_model=PrescriptionModel)
async def create_prescription(
    prescription: PrescriptionBase,
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["doctor", "nurse"]))
):
    """
    Create a new prescription for a given visit.
    """

    result = await db.execute(select(Visit).where(Visit.visit_id == visit_id))
    visit = result.scalars().first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

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
async def list_prescriptions(db: AsyncSession = Depends(get_db),
                             current_user: User = Depends(require_role_with_user(["doctor", "nurse"]))):
    result = await db.execute(
        select(Prescription)
        .options(
            joinedload(Prescription.visit)
            .joinedload(Visit.reservation)
            .joinedload(Reservation.patient)
            .joinedload(Patient.user),  # patient.user
            joinedload(Prescription.visit)
            .joinedload(Visit.reservation)
            .joinedload(Reservation.doctor)
            .joinedload(Doctor.user)  # doctor.user
        )
    )
    prescriptions = result.scalars().all()

    for p in prescriptions:
        p.visit_date = f"{p.visit.visit_date}"
        p.doctor_user_id = p.visit.reservation.doctor.user.user_id
        p.doctor_name = (f"{p.visit.reservation.doctor.user.first_name} "
                         f"{p.visit.reservation.doctor.user.last_name}")
        p.patient_name = (f"{p.visit.reservation.patient.user.first_name} "
                          f"{p.visit.reservation.patient.user.last_name}")
        p.patient_pesel = f"{p.visit.reservation.patient.pesel}"

    return prescriptions


@router.get("/{prescription_id}", response_model=PrescriptionModel)
async def get_prescription_by_id(
    prescription_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["doctor", "nurse"]))
):
    """
    Retrieve a specific prescription by its ID, including patient and doctor info.
    """
    result = await db.execute(
        select(Prescription)
        .options(
            joinedload(Prescription.visit)
            .joinedload(Visit.reservation)
            .joinedload(Reservation.patient)
            .joinedload(Patient.user),
            joinedload(Prescription.visit)
            .joinedload(Visit.reservation)
            .joinedload(Reservation.doctor)
            .joinedload(Doctor.user)
        )
        .where(Prescription.prescription_id == prescription_id)
    )

    prescription = result.scalars().first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    prescription.visit_date = f"{prescription.visit.visit_date}"
    prescription.doctor_user_id = prescription.visit.reservation.doctor.user.user_id
    prescription.doctor_name = (
        f"{prescription.visit.reservation.doctor.user.first_name} "
        f"{prescription.visit.reservation.doctor.user.last_name}"
    )
    prescription.patient_name = (
        f"{prescription.visit.reservation.patient.user.first_name} "
        f"{prescription.visit.reservation.patient.user.last_name}"
    )
    prescription.patient_pesel = f"{prescription.visit.reservation.patient.pesel}"

    return prescription


@router.put("/{prescription_id}", response_model=PrescriptionModel)
async def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["doctor", "nurse"]))
):
    result = await db.execute(select(Prescription).where(Prescription.prescription_id == prescription_id))
    db_prescription = result.scalars().first()
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Update only the fields provided
    for field, value in prescription_update.model_dump(exclude_unset=True).items():
        setattr(db_prescription, field, value)

    db.add(db_prescription)
    await db.commit()
    await db.refresh(db_prescription)
    return db_prescription


@router.delete("/{prescription_id}", response_model=dict)
async def delete_prescription(prescription_id: int, db: AsyncSession = Depends(get_db),
                              current_user: User = Depends(require_role_with_user(["admin"]))):
    result = await db.execute(select(Prescription).where(Prescription.prescription_id == prescription_id))
    db_prescription = result.scalars().first()
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    await db.delete(db_prescription)
    await db.commit()
    return {"status": "Prescription deleted"}

@router.get("/visit/{visit_id}", response_model=PrescriptionModel)
async def get_prescription_by_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Prescription).where(Prescription.visit_id == visit_id))
    prescription = result.scalar_one_or_none()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription
