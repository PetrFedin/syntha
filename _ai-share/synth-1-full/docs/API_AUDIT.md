# API Audit — Platform Core Phase 20

**Backend:** `app/api/routes.py` + `PLATFORM_CORE_BASELINE` flag  
**BFF:** `src/app/api/platform-core/`, `src/app/api/workshop2/platform-core/`

## FastAPI `/api/v1`

| Tier | Examples | ~Routes |
|------|----------|--------:|
| **Core** | auth, organization, brand, seasons, showrooms, wholesale, orders, dam, ingestion, platform/stack | ~210 baseline |
| **Extended** | factory, fintech, ai, plm, collaboration, inventory | ~90 |
| **Archive** | analytics, marketing-crm, wardrobe, academy, retail, admin | ~88 |

Baseline launch: `PLATFORM_CORE_BASELINE=true poetry run uvicorn app.main:app --port 8000`

## Next BFF (Core)

- `/api/platform-core/articles/*` — gateways (bom, comms, documents, qc, rfq)
- `/api/platform-core/orders/*` — capacity, comms, exceptions, shipment
- `/api/platform-core/comms/*` — inbox, prefs, threads
- `/api/workshop2/platform-core/*` — chain-overview, pillar-snapshot, calendar, health

## Duplicates (P0)

- `/api/platform-core/b2b-message-templates` vs `/b2b/message-templates` — merge
- FastAPI `/orders` POST vs W2 — document read-only for PC

См. `docs/BACKEND_PLATFORM_CORE_BASELINE.md`
