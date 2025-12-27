from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core import get_db, verify_token
from models.user_settings_model import UserSettings
from schemas.user_settings_schema import UserSettingsUpdate, UserSettingsResponse

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/", response_model=UserSettingsResponse)
async def get_my_settings(
        current_user: dict = Depends(verify_token),
        db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == current_user["user_id"])
    )
    settings = result.scalar_one_or_none()

    if not settings:
        return {"user_id": current_user["user_id"], "theme": "light", "background_url": None}

    return settings


@router.patch("/", response_model=UserSettingsResponse)
async def update_settings(
        update_data: UserSettingsUpdate,
        current_user: dict = Depends(verify_token),
        db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == current_user["user_id"])
    )
    settings = result.scalar_one_or_none()

    if not settings:
        settings = UserSettings(user_id=current_user["user_id"], **update_data.model_dump())
        db.add(settings)
    else:
        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(settings, key, value)

    await db.commit()
    await db.refresh(settings)
    return settings