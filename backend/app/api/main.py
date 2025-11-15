from fastapi import APIRouter

from .routers import (health_router, doctor_router, nurse_router,
                      referral_router, visit_router, prescription_router,
                      login_router, receptionist_router, patient_router,
                      reservation_router, user_router, schedule_router,
                      examination_router, admin_router, manager_router,
                      manager_report_router)

api_router = APIRouter()

api_router.include_router(health_router.router)
api_router.include_router(login_router.router)
api_router.include_router(user_router.router)
api_router.include_router(admin_router.router)
api_router.include_router(doctor_router.router)
api_router.include_router(nurse_router.router)
api_router.include_router(receptionist_router.router)
api_router.include_router(patient_router.router)
api_router.include_router(referral_router.router)
api_router.include_router(visit_router.router)
api_router.include_router(prescription_router.router)
api_router.include_router(reservation_router.router)
api_router.include_router(schedule_router.router)
api_router.include_router(examination_router.router)
api_router.include_router(manager_router.router)
api_router.include_router(manager_report_router.router)
