# Backend Platform Core Baseline (v1)

**Status:** implemented · **Updated:** 2026-07-08

## Feature flag

```bash
PLATFORM_CORE_BASELINE=true   # only baseline routers mounted at /api/v1
PLATFORM_CORE_BASELINE=false  # baseline + extended (default, full Fashion OS)
```

## Modules

| File | Role |
|------|------|
| `app/api/platform_core_baseline.py` | Golden-path API only |
| `app/api/platform_core_extended.py` | All other endpoints |
| `app/api/routes.py` | Composes baseline ± extended |

## Baseline endpoints (mounted always; extended added when flag false)

- `/auth`, `/organization`, `/brand`, `/product`, `/collections`, `/seasons`, `/showrooms`
- `/wholesale`, `/orders`, `/dam`, `/ingestion`, `/plm`, `/pricing`, `/inventory`
- `/collaboration` (comms/messages), `/tasks` (calendar/tasks)
- `/platform/stack`, `/ai` (minimal pillar usage)

## Extended (not in baseline-only mode)

retail, marketing, staff, academy, wardrobe, marketplace, auctions, loyalty, ESG,
smart_contracts, global_compliance, factory, client, analytics, finance (fintech), …

See `app/api/platform_core_extended.py` for full list.

## Verification

```bash
PLATFORM_CORE_BASELINE=true poetry run uvicorn app.main:app --port 8000
curl -s localhost:8000/api/v1/ | jq
curl -s localhost:8000/api/v1/platform/stack/health | jq
# factory routes should 404 in baseline-only mode
curl -s -o /dev/null -w "%{http_code}" localhost:8000/api/v1/factory/
```
