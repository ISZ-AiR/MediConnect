from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload, aliased
from core.database import get_db
from models.visit_model import Visit
from models.reservation_model import Reservation
from models.user_model import User
from models.patient_model import Patient
from models.doctor_model import Doctor
from models.nurse_model import Nurse
from schemas.visit_schema import VisitBase, VisitModel, VisitUpdate
from core import require_role_with_user, require_role


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
        raise HTTPException(
            status_code=400, detail="Visit for this reservation already exists")

    # Create visit entry
    db_visit = Visit(
        reservation_id=reservation_id,
        visit_note=visit.visit_note,
        visit_date=visit.visit_date,
        visit_time=visit.visit_time,
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


async def _get_detailed_visits(db: AsyncSession, doctor_id: int | None = None,
                               nurse_id: int | None = None, visit_id: int | None = None):
    doctor_user = aliased(User)
    nurse_user = aliased(User)
    patient_user = aliased(User)

    stmt = (
        select(
            Visit,
            Reservation,
            Doctor,
            doctor_user,
            Nurse,
            nurse_user,
            Patient,
            patient_user
        )
        .join(Reservation, Visit.reservation_id == Reservation.reservation_id)
        .join(Doctor, Doctor.doctor_id == Reservation.doctor_id)
        .join(doctor_user, doctor_user.user_id == Doctor.user_id)
        .join(Nurse, Nurse.nurse_id == Visit.nurse_id)
        .join(nurse_user, nurse_user.user_id == Nurse.user_id)
        .join(Patient, Patient.patient_id == Reservation.patient_id)
        .join(patient_user, patient_user.user_id == Patient.user_id)
    )

    if doctor_id is not None:
        stmt = stmt.where(Doctor.doctor_id == doctor_id)

    if nurse_id is not None:
        stmt = stmt.where(Nurse.nurse_id == nurse_id)

    if visit_id is not None:
        stmt = stmt.where(Visit.visit_id == visit_id)

    result = await db.execute(stmt)
    rows = result.all()

    output = []
    for v, r, d, d_u, n, n_u, p, p_u in rows:
        output.append({
            "visit_id": v.visit_id,
            "visit_date": v.visit_date,
            "visit_time": v.visit_time,
            "visit_note": v.visit_note,
            "doctor": {
                "doctor_id": d.doctor_id,
                "first_name": d_u.first_name,
                "last_name": d_u.last_name
            },
            "nurse": {
                "nurse_id": n.nurse_id,
                "first_name": n_u.first_name,
                "last_name": n_u.last_name
            },
            "patient": {
                "patient_id": p.patient_id,
                "first_name": p_u.first_name,
                "last_name": p_u.last_name
            },
            "reservation": {
                "reservation_id": r.reservation_id,
                "reservation_time": r.reservation_time
            }
        })
    if visit_id is not None:
        return output[0] if output else None
    else:
        return output


@router.get("/detailed/{visit_id}", description="Get a specific visit with full details", dependencies=[Depends(require_role_with_user(["admin", "receptionist", "doctor"]))])
async def get_all_detailed_visits(visit_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_detailed_visits(db, doctor_id=None, visit_id=visit_id)


@router.get("/detailed", description="Get all visits with full details", dependencies=[Depends(require_role_with_user(["admin", "receptionist"]))])
async def get_all_detailed_visits(db: AsyncSession = Depends(get_db)):
    return await _get_detailed_visits(db)


@router.get("/detailed/doctor/{doctor_id}", description="Get all visits with full details - per doctor", dependencies=[Depends(require_role_with_user(["doctor"]))])
async def get_doctor_detailed_visits(doctor_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_detailed_visits(db, doctor_id=doctor_id, visit_id=None)


@router.get(
    "/detailed/nurse/{nurse_id}",
    description="Get all visits with full details - per nurse",
    dependencies=[Depends(require_role_with_user(["nurse"]))]
)
async def get_nurse_detailed_visits(nurse_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_detailed_visits(db, nurse_id=nurse_id)


@router.get("/me", response_model=List[VisitModel])
async def get_my_visits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["patient"]))
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


@router.get("/me/{visit_id}", response_model=VisitModel, description="Get a specific visit for the logged-in patient", dependencies=[Depends(require_role_with_user(["patient"]))])
async def get_my_visit(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role_with_user(["patient"]))
):
    """
    Get a specific visit for the logged-in patient via reservation
    """
    result = await db.execute(
        select(Visit)
        .options(joinedload(Visit.reservation))
        .join(Reservation, Visit.reservation_id == Reservation.reservation_id)
        .join(Patient, Reservation.patient_id == Patient.patient_id)
        .where(
            Patient.user_id == current_user.user_id,
            Visit.visit_id == visit_id
        )
    )
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit


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
    current_user: User = Depends(
        require_role_with_user(["nurse", "receptionist", "doctor"]))
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
    current_user: User = Depends(require_role_with_user(
        ["admin"]))  # Only admin can delete
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
