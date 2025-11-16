from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date
from core.database import get_db
from models import Doctor, Visit, Reservation, Referral, Prescription, User
from .user_router import require_role
from pydantic import BaseModel
from sqlalchemy import cast, Date

router = APIRouter(
    prefix="/reports",
    tags=["Manager Reports"]
)

# -------------------
# Pydantic Models
# -------------------

class DailyData(BaseModel):
    date: date
    reservations: int
    visits: int

class DoctorWorkload(BaseModel):
    doctor_id: int
    first_name: str
    last_name: str
    daily: list[DailyData]

class ReservationSummary(BaseModel):
    total_reservations: int
    cancelled_reservations: int
    completed_visits: int

class ExaminationStat(BaseModel):
    examination_id: int
    count: int

class MedicationStat(BaseModel):
    medication: str
    count: int


# -----------------------
# DOCTOR WORKLOAD REPORT
# -----------------------

from datetime import timedelta

@router.get("/doctor-workload", response_model=list[DoctorWorkload])
async def doctor_workload_report_daily(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["manager"]))
):
    """
    Workload report for all doctors, aggregated per day, in a date range.
    Returns a list of dicts with doctor info and daily reservations & visits.
    """

    res_date = cast(Reservation.reservation_time, Date).label("res_date")

    reservations_stmt = (
        select(
            Reservation.doctor_id,
            res_date,
            func.count(Reservation.reservation_id)
        )
        .where(
            Reservation.reservation_time >= start_date,
            Reservation.reservation_time <= end_date,
            Reservation.is_cancelled == False
        )
        .group_by(Reservation.doctor_id, res_date)
    )
    visits_stmt = (
        select(
            Reservation.doctor_id,
            Visit.visit_date,
            func.count(Visit.visit_id)
        )
        .join(Reservation, Reservation.reservation_id == Visit.reservation_id)
        .where(
            Visit.visit_date >= start_date,
            Visit.visit_date <= end_date
        )
        .group_by(Reservation.doctor_id, Visit.visit_date)
    )

    reservations_rows = (await db.execute(reservations_stmt)).all()
    visits_rows = (await db.execute(visits_stmt)).all()

    daily_map = {}
    for doctor_id, date_, count in reservations_rows:
        daily_map.setdefault(doctor_id, {}).setdefault(date_, {"reservations": 0, "visits": 0})
        daily_map[doctor_id][date_]["reservations"] = count

    for doctor_id, date_, count in visits_rows:
        daily_map.setdefault(doctor_id, {}).setdefault(date_, {"reservations": 0, "visits": 0})
        daily_map[doctor_id][date_]["visits"] = count

    doctor_ids = list(daily_map.keys())
    doctors_stmt = (
        select(Doctor.doctor_id, User.first_name, User.last_name)
        .join(User, User.user_id == Doctor.user_id)
        .where(Doctor.doctor_id.in_(doctor_ids))
    )
    doctor_rows = (await db.execute(doctors_stmt)).all()
    doctor_map = {row[0]: {"first_name": row[1], "last_name": row[2]} for row in doctor_rows}

    results = []
    for doctor_id, days in daily_map.items():
        doctor_info = doctor_map.get(doctor_id, {"first_name": "", "last_name": ""})
        daily_list = []
        # Generujemy pełen zakres dat
        current_date = start_date
        while current_date <= end_date:
            day_data = days.get(current_date, {"reservations": 0, "visits": 0})
            daily_list.append({
                "date": current_date.isoformat(),
                "reservations": day_data["reservations"],
                "visits": day_data["visits"]
            })
            current_date += timedelta(days=1)
        results.append({
            "doctor_id": doctor_id,
            "first_name": doctor_info["first_name"],
            "last_name": doctor_info["last_name"],
            "daily": daily_list
        })

    return results


# -----------------------
# ALL VISITS
# -----------------------

@router.get("/visits")
async def all_visits_report(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["manager"]))
):
    """Returns all visits."""
    result = await db.execute(select(Visit))
    return result.scalars().all()


# -----------------------
# RESERVATION SUMMARY
# -----------------------

@router.get("/reservations-summary", response_model=ReservationSummary)
async def reservations_summary(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["manager"]))
):
    """Summary of reservations in a date range."""

    total = (
        await db.execute(
            select(func.count(Reservation.reservation_id)).where(
                Reservation.reservation_time >= start_date,
                Reservation.reservation_time <= end_date
            )
        )
    ).scalar()

    cancelled = (
        await db.execute(
            select(func.count(Reservation.reservation_id)).where(
                Reservation.is_cancelled == True,
                Reservation.reservation_time >= start_date,
                Reservation.reservation_time <= end_date
            )
        )
    ).scalar()

    completed = (
        await db.execute(
            select(func.count(Visit.visit_id))
            .join(Reservation, Reservation.reservation_id == Visit.reservation_id)
            .where(
                Reservation.reservation_time >= start_date,
                Reservation.reservation_time <= end_date
            )
        )
    ).scalar()

    return ReservationSummary(
        total_reservations=total,
        cancelled_reservations=cancelled,
        completed_visits=completed
    )


# -----------------------
# EXAMINATION STATS
# -----------------------

@router.get("/examinations", response_model=list[ExaminationStat])
async def examinations_report(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["manager"]))
):
    """Returns statistics about examinations."""

    stmt = (
        select(
            Referral.examination_id,
            func.count(Referral.referral_id)
        )
        .group_by(Referral.examination_id)
        .order_by(func.count(Referral.referral_id).desc())
    )

    rows = (await db.execute(stmt)).all()

    return [ExaminationStat(examination_id=r[0], count=r[1]) for r in rows]


# -----------------------
# PRESCRIPTION STATS
# -----------------------

@router.get("/prescriptions")
async def prescriptions_report(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["manager"]))
):
    """Statistics on prescriptions."""

    total_prescriptions = (
        await db.execute(select(func.count(Prescription.prescription_id)))
    ).scalar()

    medications_stmt = (
        select(
            Prescription.medication,
            func.count(Prescription.prescription_id)
        )
        .group_by(Prescription.medication)
        .order_by(func.count(Prescription.prescription_id).desc())
    )

    medication_rows = (await db.execute(medications_stmt)).all()

    return {
        "total_prescriptions": total_prescriptions,
        "most_common_medications": [
            {"medication": r[0], "count": r[1]}
            for r in medication_rows
        ]
    }

