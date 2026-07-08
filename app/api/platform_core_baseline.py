"""
Platform Core v1 · baseline API router.

Golden path: Article → Sample → Collection → Wholesale Order → Fulfillment → Communication.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai_routes,
    auth,
    brand,
    collaboration,
    collections,
    dam,
    ingestion,
    inventory,
    orders,
    organization,
    platform_stack,
    plm,
    pricing,
    product,
    seasons,
    showrooms,
    tasks,
    wholesale,
)

baseline_router = APIRouter()

baseline_router.include_router(auth.router, prefix="/auth", tags=["platform-core", "auth"])
baseline_router.include_router(
    organization.router, prefix="/organization", tags=["platform-core", "organization"]
)
baseline_router.include_router(brand.router, prefix="/brand", tags=["platform-core", "brand"])
baseline_router.include_router(product.router, prefix="/product", tags=["platform-core", "product"])
baseline_router.include_router(
    collections.router, prefix="/collections", tags=["platform-core", "collections"]
)
baseline_router.include_router(seasons.router, prefix="/seasons", tags=["platform-core", "seasons"])
baseline_router.include_router(
    showrooms.router, prefix="/showrooms", tags=["platform-core", "showrooms"]
)
baseline_router.include_router(
    wholesale.router, prefix="/wholesale", tags=["platform-core", "wholesale"]
)
baseline_router.include_router(orders.router, prefix="/orders", tags=["platform-core", "orders"])
baseline_router.include_router(dam.router, prefix="/dam", tags=["platform-core", "dam"])
baseline_router.include_router(
    ingestion.router, prefix="/ingestion", tags=["platform-core", "ingestion"]
)
baseline_router.include_router(plm.router, prefix="/plm", tags=["platform-core", "plm"])
baseline_router.include_router(pricing.router, prefix="/pricing", tags=["platform-core", "pricing"])
baseline_router.include_router(
    inventory.router, prefix="/inventory", tags=["platform-core", "inventory"]
)
baseline_router.include_router(
    collaboration.router, prefix="/collaboration", tags=["platform-core", "comms"]
)
baseline_router.include_router(tasks.router, prefix="/tasks", tags=["platform-core", "calendar"])
baseline_router.include_router(
    platform_stack.router, prefix="/platform/stack", tags=["platform-core", "stack"]
)
baseline_router.include_router(ai_routes.router, prefix="/ai", tags=["platform-core", "ai"])


@baseline_router.get("/")
async def platform_core_baseline_root():
    return {
        "message": "Synth-1 Platform Core baseline API",
        "scope": "brand + shop × 5 pillars",
        "mode": "baseline",
    }
