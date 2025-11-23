from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, and_
from datetime import date
from core.database import get_db
from models import Doctor, Visit, Reservation, Referral, Prescription, User, Schedule
from .user_router import require_role
from pydantic import BaseModel
from sqlalchemy import cast, Date
from datetime import datetime, timedelta

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
    date: date
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

@router.get("/reservations-summary", response_model=list[ReservationSummary])
async def reservations_summary_daily(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["manager"]))
):
    """Daily summary of reservations in a date range."""

    res_date = cast(Reservation.reservation_time, Date).label("res_date")

    # Rezerwacje całkowite i anulowane
    reservations_stmt = (
        select(
            res_date,
            func.count(Reservation.reservation_id),
            func.sum(case((Reservation.is_cancelled == True, 1), else_=0))
        )
        .where(Reservation.reservation_time >= start_date, Reservation.reservation_time <= end_date)
        .group_by(res_date)
    )

    reservations_rows = (await db.execute(reservations_stmt)).all()

    # Wizyty zakończone
    visits_stmt = (
        select(
            Visit.visit_date,
            func.count(Visit.visit_id)
        )
        .join(Reservation, Reservation.reservation_id == Visit.reservation_id)
        .where(Visit.visit_date >= start_date, Visit.visit_date <= end_date)
        .group_by(Visit.visit_date)
    )

    visits_rows = (await db.execute(visits_stmt)).all()
    visits_map = {v[0]: v[1] for v in visits_rows}

    # Mapowanie danych
    rows_map = {r[0]: {"total_reservations": r[1], "cancelled_reservations": r[2]} for r in reservations_rows}

    # Generowanie pełnego zakresu dat
    results = []
    current_date = start_date
    while current_date <= end_date:
        day_data = rows_map.get(current_date, {"total_reservations": 0, "cancelled_reservations": 0})
        completed = visits_map.get(current_date, 0)
        results.append(
            ReservationSummary(
                date=current_date,
                total_reservations=day_data["total_reservations"],
                cancelled_reservations=day_data["cancelled_reservations"],
                completed_visits=completed
            )
        )
        current_date += timedelta(days=1)

    return results


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


@router.get("/doctor-availability")
async def doctor_availability_report(
    start_date: str,
    end_date: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(["admin", "manager"]))
):

    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    if start > end:
        raise HTTPException(status_code=400, detail="Start date must be before end date")

    # Pobierz grafiki w zakresie dat
    result = await db.execute(
        select(Schedule, Doctor, User)
        .join(Doctor, Schedule.doctor_id == Doctor.doctor_id)
        .join(User, Doctor.user_id == User.user_id)
        .where(
            and_(
                Schedule.schedule_date >= start,
                Schedule.schedule_date <= end
            )
        )
        .order_by(Schedule.schedule_date.asc())
    )

    rows = result.all()
    if not rows:
        return []

    # Grupowanie po lekarzach
    report = {}
    for schedule, doctor, user in rows:

        # Unikalny wpis dla lekarza
        if doctor.doctor_id not in report:
            report[doctor.doctor_id] = {
                "doctor_id": doctor.doctor_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "specialization": doctor.specialization,
                "total_days": 0,
                "total_hours": 0.0,
                "slots": []
            }

        # Oblicz godziny pracy
        duration = (
            datetime.combine(schedule.schedule_date, schedule.end_time)
            - datetime.combine(schedule.schedule_date, schedule.start_time)
        ) / timedelta(hours=1)

        report[doctor.doctor_id]["slots"].append({
            "date": str(schedule.schedule_date),
            "start_time": str(schedule.start_time),
            "end_time": str(schedule.end_time),
            "hours": round(duration, 2),
            "is_available": schedule.is_available,
            "location": schedule.location
        })

        report[doctor.doctor_id]["total_hours"] += duration
        report[doctor.doctor_id]["total_days"] += 1

    # Zamiana dict na listę
    return list(report.values())


@router.get("/summary")
async def visits_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns summary of visits: this month's total and today's scheduled.
    """
    today = date.today()
    first_day_of_month = today.replace(day=1)

    # Visits this month
    monthly_stmt = select(func.count(Visit.visit_id)).where(
        Visit.visit_date >= first_day_of_month,
        Visit.visit_date <= today
    )
    monthly_result = await db.execute(monthly_stmt)
    monthly_visits = monthly_result.scalar() or 0

    # Visits scheduled today
    today_stmt = select(func.count(Visit.visit_id)).where(
        Visit.visit_date == today
    )
    today_result = await db.execute(today_stmt)
    today_visits = today_result.scalar() or 0

    return {
        "monthlyVisits": monthly_visits,
        "todayVisits": today_visits
    }
