from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from core.database import get_db
from models import Doctor, Visit, Reservation, Referral, Prescription
from .user_router import require_role

router = APIRouter(
    prefix="/reports",
    tags=["Manager Reports"]
)


@router.get("/doctor-workload")
async def doctor_workload_report(
    start_date: str,
    end_date: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role(["manager"]))
):
    """
    Workload report for all doctors in a specified date range.
    Includes number of reservations and visits per doctor.
    """

    # Count reservations per doctor
    reservations_stmt = (
        select(
            Reservation.doctor_id,
            func.count(Reservation.reservation_id)
        )
        .where(
            Reservation.reservation_time >= start_date,
            Reservation.reservation_time <= end_date,
            Reservation.is_cancelled == False
        )
        .group_by(Reservation.doctor_id)
    )

    # Count visits per doctor
    visits_stmt = (
        select(
            Doctor.doctor_id,
            func.count(Visit.visit_id)
        )
        .join(Reservation, Reservation.reservation_id == Visit.reservation_id)
        .join(Doctor, Doctor.doctor_id == Reservation.doctor_id)
        .where(
            Visit.visit_date >= start_date,
            Visit.visit_date <= end_date
        )
        .group_by(Doctor.doctor_id)
    )

    reservations_result = (await db.execute(reservations_stmt)).all()
    visits_result = (await db.execute(visits_stmt)).all()

    return {
        "reservations": reservations_result,
        "visits": visits_result
    }


@router.get("/visits")
async def all_visits_report(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role(["manager"]))
):
    """
    Returns all visits in the system.
    """
    result = await db.execute(select(Visit))
    return result.scalars().all()


@router.get("/reservations-summary")
async def reservations_summary(
    start_date: str,
    end_date: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role(["manager"]))
):
    """
    Summary of reservations for a date range:
    - total
    - cancelled
    - completed (those that turned into a visit)
    """

    total_stmt = select(func.count(Reservation.reservation_id)).where(
        Reservation.reservation_time >= start_date,
        Reservation.reservation_time <= end_date
    )

    cancelled_stmt = select(func.count(Reservation.reservation_id)).where(
        Reservation.is_cancelled == True,
        Reservation.reservation_time >= start_date,
        Reservation.reservation_time <= end_date
    )

    completed_stmt = (
        select(func.count(Visit.visit_id))
        .join(Reservation, Reservation.reservation_id == Visit.reservation_id)
        .where(
            Reservation.reservation_time >= start_date,
            Reservation.reservation_time <= end_date
        )
    )

    total = (await db.execute(total_stmt)).scalar()
    cancelled = (await db.execute(cancelled_stmt)).scalar()
    completed = (await db.execute(completed_stmt)).scalar()

    return {
        "total_reservations": total,
        "cancelled_reservations": cancelled,
        "completed_visits": completed
    }


@router.get("/examinations")
async def examinations_report(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role(["manager"]))
):
    """
    Returns statistics about examinations:
    number of referrals per examination.
    """

    stmt = (
        select(
            Referral.examination_id,
            func.count(Referral.referral_id).label("count")
        )
        .group_by(Referral.examination_id)
        .order_by(func.count(Referral.referral_id).desc())
    )

    result = (await db.execute(stmt)).all()
    return result


@router.get("/prescriptions")
async def prescriptions_report(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role(["manager"]))
):
    """
    Returns statistics on prescriptions:
    - total prescriptions
    - most common medications
    """

    total = (await db.execute(
        select(func.count(Prescription.prescription_id))
    )).scalar()

    common_medications = (
        await db.execute(
            select(
                Prescription.medication,
                func.count(Prescription.prescription_id)
            )
            .group_by(Prescription.medication)
            .order_by(func.count().desc())
        )
    ).all()

    return {
        "total_prescriptions": total,
        "most_common_medications": common_medications
    }


