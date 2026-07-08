# Platform Core Manifest — Official Core Inventory

**Version:** Phase 20 — 2026-07-08  
**Rule:** Anything not listed here is **extension** or **archive** until promoted via ADR.

---

## Core pages

| Path | Role |
|------|------|
| `/platform` | Hub |
| `/platform/b2b`, `/platform/b2b/partners`, `/platform/b2b/marketroom` | B2B surfaces |
| `/brand/core` | Brand cabinet |
| `/shop/core` | Shop cabinet |
| `/brand/b2b-orders/[orderId]`, `/shop/b2b/orders/[orderId]` | Order detail split |
| `/factory/production/core`, `/factory/supplier/core` | Extended cabinets |

---

## Core routes (code)

- `src/lib/platform-core-routes.ts` — baseline ROUTES
- `src/lib/platform-core-native-href.ts`
- `src/lib/platform-core-strict-routes.ts`
- `src/lib/platform-core-ui-href.ts`
- `src/lib/platform-core-baseline-peer-hrefs.ts`

Extended (not baseline bundle): `platform-core-extended-routes.ts`, `platform-core-legacy-routes.ts`

---

## Core API

### Next BFF
- `src/app/api/platform-core/**` (21 route handlers)
- `src/app/api/workshop2/platform-core/**`
- `src/app/api/dev/platform-core/planner/**` (dev only)

### FastAPI baseline
- `app/api/platform_core_baseline.py`
- Flag: `PLATFORM_CORE_BASELINE=true`

---

## Core components (~278 tsx in platform/)

**Hub:** RoleCoreCabinetHub, PlatformCoreCabinetPage, PlatformHubPageClient, PlatformCoreContextBar

**Pillars (baseline chunks):**
- pillars/DevelopmentPillarCardBrand
- pillars/CommsPillarCardBaseline
- pillars/OrderProductionPillarCardBrand
- CollectionOrderPillarCard, BrandSampleCollectionMini, ShopShowroomMini, ShopOrderProductionPillarCard

**Pillars (extended chunks):** pillars/*Manufacturer*, *Extended*, SupplierProcurementPillarCard

**Orchestrators:** RoleCorePillarInsightCards, PlatformCoreRolePillarWorkspace

**Shell:** PillarCabinetHeader, PillarCabinetActionRail, PillarInsightPrimitives, PlatformCorePillarInsightSkeleton

**Extended bridge:** components/platform/extended/*

---

## Core lib (~105 platform-core*.ts)

- `platform-core-hub-matrix.ts`, `platform-core-demo-context.ts`, `platform-core-article-spine.ts`
- `platform-core-gateways/*`
- `platform-core-ports/*` (facade to server + archive)
- `platform-core-readiness-sections/*-audit.ts`
- `platform-core-readiness-audit.ts`

---

## Core server (~35 files)

- `src/lib/server/platform-core-*.ts`
- `src/lib/server/workshop2-*-repository.ts` (spine repos)

---

## Core hooks (21)

All `src/hooks/use-platform-core*.ts` — see STATE_AUDIT for active vs unused

---

## Core stores

No zustand/jotai — state via React Context (3) + hooks + BFF caches

---

## Core types

- `platform-core-demo-context.ts`
- `platform-core-pillar-snapshot.types.ts`
- `platform-core-hub-matrix.ts` (CoreChainRoleId, CoreHubPillarId)
- Gateway result types in `platform-core-gateways/`

---

## Core tests (~87 files matching platform-core)

Key:
- `platform-core-boundaries.test.ts`
- `platform-core-native-href*.test.ts`
- `platform-core-strict-routes.test.ts`
- `platform-core-readiness-audit.test.ts`

---

## Core docs

| Document |
|----------|
| PLATFORM_CORE_CONTRACT.md |
| PLATFORM_CORE_MANIFEST.md (this file) |
| ROUTE_AUDIT.md, DATA_MODEL_AUDIT.md, API_AUDIT.md |
| COMPONENT_AUDIT.md, STATE_AUDIT.md, IMPORT_GRAPH.md |
| PERFORMANCE_AUDIT.md, TYPESCRIPT_AUDIT.md |
| BACKEND_PLATFORM_CORE_BASELINE.md |
| PLATFORM_CORE_DEPENDENCY_GRAPH.md |
| docs/adr/ADR-001…005 |
| _platform-core-split/platform-core/* (planning canon) |

---

## Promotion process

To add to manifest: ADR + update boundaries test + readiness audit entry + manifest row.
