# FastAPI × Platform Core — write-path registry

**Phase 21 · split-brain documentation**

## Roles

| Contour | Role in Platform Core |
|---------|------------------------|
| **W2 Platform Core (Next.js BFF + PG :5433)** | **Single write-path** for spine entities: Article, Sample, Collection, Order, Communication |
| **FastAPI (`app/api/platform_core_baseline.py`)** | **Read-only** for spine in PC mode; auth, DAM, organization, legacy integrations, AI probes |

## Spine entities — MUST NOT write via FastAPI in PC mode

| Entity | FastAPI module | Write endpoints (marked legacy for PC) | Canonical write |
|--------|----------------|----------------------------------------|-----------------|
| Article / Product | `product.py` | `POST /samples`, `POST /drops` | `/api/workshop2/*`, `/api/platform-core/*` BFF |
| Collection | `collections.py` | `POST /drops`, `POST /color-stories`, `POST /merchandise-grid/{season}` | W2 BFF + PG |
| Sample (PLM) | `plm/routes.py` | `POST /samples` | W2 BFF |
| Order | `orders.py`, `wholesale.py` | `POST /draft`, `POST /{id}/submit`, `POST /orders/draft-from-selection`, … | `/api/shop/b2b/orders`, workshop2 order repos |
| Communication | `plm/routes.py`, `collaboration.py` | `POST /messages` | `/api/platform-core/comms/*`, W2 message stores |

## Allowed FastAPI writes (horizontal, not spine SoT)

- `auth.py` — JWT session
- `organization.py` — org profile
- `dam.py`, `ingestion.py` — assets / bulk ingest
- `ai_routes.py` — inference (no domain SoT)
- `platform_stack.py` — probes / matrix metadata

## Enforcement

1. Frontend Platform Core clients use `@/lib/platform-core-ports/*` and `/api/platform-core/*` — not raw FastAPI spine POST.
2. `PLATFORM_CORE_BASELINE=1` backend router exposes read endpoints for catalog/orders; new spine writes belong in W2 BFF migrations.
3. Future: optional `X-Platform-Core-Mode: 1` middleware on FastAPI to return `405` on spine POST (not implemented in Phase 21 — documented only).

## Audit date

2026-07-08 · Phase 21 stabilization
