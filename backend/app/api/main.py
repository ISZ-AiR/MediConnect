from fastapi import APIRouter

from .routers import (health_router, doctor_router, nurse_router,
                      referral_router, visit_router, prescription_router,
                      login_router, receptionist_router, register_router,
                      reservation_router)

api_router = APIRouter()

api_router.include_router(health_router.router)
api_router.include_router(doctor_router.router)
api_router.include_router(nurse_router.router)

api_router.include_router(referral_router.router)

api_router.include_router(visit_router.router)

api_router.include_router(prescription_router.router)

api_router.include_router(login_router.router)

api_router.include_router(receptionist_router.router)

api_router.include_router(register_router.router)

api_router.include_router(reservation_router.router)
