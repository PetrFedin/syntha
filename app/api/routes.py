"""API v1 router composition — baseline vs full Fashion OS."""

from fastapi import APIRouter

from app.api.platform_core_baseline import baseline_router
from app.api.platform_core_extended import extended_router
from app.core.config import settings

router = APIRouter()

if settings.PLATFORM_CORE_BASELINE:
    router.include_router(baseline_router)
else:
    router.include_router(baseline_router)
    router.include_router(extended_router)


@router.get("/")
async def root():
    mode = "baseline" if settings.PLATFORM_CORE_BASELINE else "full"
    return {"message": "Welcome to Synth-1 API v1", "platform_core_mode": mode}
