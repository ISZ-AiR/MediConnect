from fastapi import APIRouter

from .routers import (health_router, doctor_router, nurse_router)

api_router = APIRouter()

api_router.include_router(health_router.router)
api_router.include_router(doctor_router.router)
api_router.include_router(nurse_router.router)
