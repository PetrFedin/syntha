"""Platform Core v1 · extended/archive API (full Fashion OS minus baseline)."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    academy,
    admin,
    alerts,
    analytics,
    assets,
    auctions,
    audit,
    buyer,
    circular,
    client,
    compliance,
    creative,
    custom,
    dashboard,
    distributor,
    esg,
    expansion,
    factory,
    fintech,
    forecasting,
    global_compliance,
    intelligence,
    logistics,
    loyalty,
    marketing,
    marketing_crm,
    marketplace,
    product_testing,
    profile,
    quota,
    retail,
    risk,
    search,
    size_curves,
    smart_contracts,
    staff,
    supply_chain,
    sustainability,
    wardrobe,
)

extended_router = APIRouter()

extended_router.include_router(dashboard.router, prefix="/dashboard", tags=["extended"])
extended_router.include_router(profile.router, prefix="/profile", tags=["extended"])
extended_router.include_router(compliance.router, prefix="/compliance", tags=["extended"])
extended_router.include_router(fintech.router, prefix="/fintech", tags=["extended"])
extended_router.include_router(academy.router, prefix="/academy", tags=["archive"])
extended_router.include_router(marketing.router, prefix="/marketing", tags=["archive"])
extended_router.include_router(buyer.router, prefix="/buyer", tags=["extended"])
extended_router.include_router(intelligence.router, prefix="/intelligence", tags=["extended"])
extended_router.include_router(alerts.router, prefix="/alerts", tags=["extended"])
extended_router.include_router(search.router, prefix="/search", tags=["archive"])
extended_router.include_router(quota.router, prefix="/quota", tags=["extended"])
extended_router.include_router(retail.router, prefix="/retail", tags=["archive"])
extended_router.include_router(logistics.router, prefix="/logistics", tags=["extended"])
extended_router.include_router(
    product_testing.router, prefix="/product-testing", tags=["extended"]
)
extended_router.include_router(factory.router, prefix="/factory", tags=["extended"])
extended_router.include_router(client.router, prefix="/client", tags=["archive"])
extended_router.include_router(distributor.router, prefix="/distributor", tags=["extended"])
extended_router.include_router(
    marketing_crm.router, prefix="/marketing-crm", tags=["archive"]
)
extended_router.include_router(
    supply_chain.router, prefix="/supply-chain", tags=["extended"]
)
extended_router.include_router(staff.router, prefix="/staff", tags=["archive"])
extended_router.include_router(analytics.router, prefix="/analytics", tags=["archive"])
extended_router.include_router(risk.router, prefix="/risk", tags=["extended"])
extended_router.include_router(creative.router, prefix="/creative", tags=["archive"])
extended_router.include_router(circular.router, prefix="/circular", tags=["archive"])
extended_router.include_router(custom.router, prefix="/custom", tags=["archive"])
extended_router.include_router(wardrobe.router, prefix="/wardrobe", tags=["archive"])
extended_router.include_router(expansion.router, prefix="/expansion", tags=["archive"])
extended_router.include_router(audit.router, prefix="/audit", tags=["archive"])
extended_router.include_router(esg.router, prefix="/esg", tags=["archive"])
extended_router.include_router(loyalty.router, prefix="/loyalty", tags=["archive"])
extended_router.include_router(assets.router, prefix="/assets", tags=["extended"])
extended_router.include_router(admin.router, prefix="/admin", tags=["archive"])
extended_router.include_router(auctions.router, prefix="/auctions", tags=["archive"])
extended_router.include_router(marketplace.router, prefix="/marketplace", tags=["archive"])
extended_router.include_router(forecasting.router, prefix="/forecasting", tags=["extended"])
extended_router.include_router(size_curves.router, prefix="/size-curves", tags=["extended"])
extended_router.include_router(
    global_compliance.router, prefix="/global-compliance", tags=["archive"]
)
extended_router.include_router(
    sustainability.router, prefix="/sustainability", tags=["archive"]
)
extended_router.include_router(
    smart_contracts.router, prefix="/smart-contracts", tags=["archive"]
)
