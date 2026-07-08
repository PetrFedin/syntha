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


---

## Phase 22.5 — Final inventory (2026-07-08)

**Branch:** `platform-core-v1-routes-cleanup`

### Ring classification

| Ring | Definition | Count (approx) |
|------|------------|----------------|
| **Core (Ring A)** | brand + shop × 5 pillars, baseline bundle | 274 UI tsx |
| **Supporting** | gateways, ports, readiness, BFF, chrome | 113 lib files, 21 BFF routes, 35 server modules |
| **Extended (Ring B)** | manufacturer/supplier pillar cards, factory dossier chrome | `pillars/*Manufacturer*`, `*Extended*`, `FactoryDossierCoreChrome`, `extended/*` |
| **Archive** | `_archive/platform-core-legacy/*` | consumed only via `shared/legacy-peer-strips/` wrappers |
| **Dead code** | see `docs/DEAD_CODE_REPORT.md` | tracked, not auto-deleted |

### Horizontal services (pillar-agnostic)

Import via `src/lib/platform-core-services.ts`:

| Service | Gateway / module |
|---------|------------------|
| Documents | `platform-core-gateways/documents-gateway.ts` |
| Dossier | workshop2 phase1 + `platform-core-ports/dossier-store` |
| Messages / Threads | `entity-comms-gateway.ts`, `/api/messages/contextual` |
| Calendar | `platform_core_user_calendar_tasks`, calendar BFF |
| Notifications | `platform-core-comms/*`, notification-events |
| Timeline / History | entity threads + dossier revisions (no unified timeline yet) |
| Files | documents-gateway + dossier visuals |
| Tasks | `/api/brand/tasks`, calendar strip |
| AI | planner dev API, task strips (env-gated) |

### Canonical UI primitives (Phase 22.5)

| Primitive | Path |
|-----------|------|
| EmptyState | `src/lib/platform-core-empty-state.ts` → design-system |
| DataTable shell | `src/components/platform/shared/PlatformCoreDataTable.tsx` |
| PeerStrip layout | `src/components/platform/shared/PlatformCoreSpinePeerStripShell.tsx` (6/70 PeerStrips migrated) |
| Cabinet chrome | `src/lib/platform-core-cabinet-chrome.ts` |
| Hub gadgets | `src/components/platform/platform-core-hub-gadget-styles.ts` |

### Baseline import rules (enforced)

`src/lib/__tests__/platform-core-boundaries-final.test.ts` blocks: `_archive`, `@/components/factory`, `@/lib/marketing`, `@/lib/academy`, `@/lib/routes`, etc. in Ring A.

**Known debt:** ≤12 baseline UI files still import `platform-core-extended-routes` for factory dossier deep-links (cap enforced by test).

### Extended-only (not in baseline bundle)

- `platform-core-extended-routes.ts`, `platform-core-hub-matrix-rows-extended.ts`
- `components/platform/pillars/*Manufacturer*`, `*Extended*`
- `components/factory/*` imports (isolated to extended UI files)
