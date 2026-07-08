# Platform Core v1 — Two-Role Baseline

**Status:** canon v1 · **Updated:** 2026-07

Краткий контракт «что считается готовым ядром» после физического рефакторинга (партии 1–10).

## Роли

| Роль | UI | Флаг |
|------|-----|------|
| `brand` | active | always |
| `shop` | active | always |
| `manufacturer` | extended | `NEXT_PUBLIC_PC_EXTENDED_ROLES=1` |
| `supplier` | extended | `NEXT_PUBLIC_PC_EXTENDED_ROLES=1` |
| `distributor` | archived | — |

## Столпы × активные ячейки (9)

| Столп | brand | shop |
|-------|-------|------|
| `development` | active | empty (read-only) |
| `sample_collection` | active | active |
| `collection_order` | active | active |
| `order_production` | active | active |
| `comms` | active | active |

Источник: `PLATFORM_CORE_BASELINE_ROWS` + readiness audit.

## Golden path (12 stops, embedded `/…/core`)

Порядок из `buildPlatformCoreGoldenCrossRoleStopsForUi()`:

1. brand · development · `brand-dev-w2-hub`
2. brand · development · `brand-dev-dossier`
3. brand · sample_collection · `brand-sc-linesheets`
4. brand · sample_collection · `brand-sc-showroom`
5. shop · sample_collection · `shop-sc-showroom`
6. shop · collection_order · `shop-co-matrix`
7. shop · collection_order · `shop-co-checkout`
8. shop · collection_order · `shop-co-registry`
9. shop · collection_order · `shop-co-detail`
10. brand · collection_order · `brand-co-registry`
11. brand · collection_order · `brand-co-detail`
12. brand · order_production · `brand-op-handoff`

+3 stops (mfr/sup) при extended roles — см. `core-249-extended-roles-golden.spec.ts`.

E2E: `npm run test:e2e:core:golden-cross-role`

## Канонические маршруты (UI)

### Brand (оставлено в `src/app/brand/`)

`core`, `b2b-orders`, `messages`, `calendar`, `linesheets`, `showroom`,
`range-planner`, `retailers`, `materials`, `production`, `collections`,
`documents`, `logistics`, `suppliers`, `factories`, `tasks`, `process`,
`pre-orders`, `merch`

### Shop (оставлено в `src/app/shop/`)

`core`, `b2b/{orders,checkout,matrix,tracking,showroom,partners,working-order}`,
`messages`, `calendar`

### Platform

`/platform` — hub matrix + readiness

### Strict allowlist (`platform-core-strict-routes.ts`)

- `/platform`
- `/brand/core`, `/brand/b2b-orders/*`, `/brand/messages`
- `/shop/core`, `/shop/b2b/orders/*`, `/shop/messages`

## Архивы (физический перенос)

| Папка | Содержимое |
|-------|------------|
| `_archive/client-b2c/` | B2C client UI + API |
| `_archive/b2b-advanced/` | advanced B2B brand + shop |
| `_archive/experiments/` | admin, academy, auctions, vendor, … |
| `_archive/brand-longtail/` | 62 папки brand cabinet |
| `_archive/shop-longtail/` | 16 папок shop cabinet |
| `_archive/brand-public/` | `/b/[brandId]` marketing profiles |
| `_extended/` | manufacturer / supplier / distributor UI |

Карта: `PLATFORM_CORE_ARCHIVE_MAP.md`

## Phase 11–12 — routes / imports cleanup (2026-07)

| Модуль | Назначение |
|--------|------------|
| `src/lib/platform-core-routes.ts` | **baseline only** — `ROUTES.brand` + `ROUTES.shop` + golden-path helpers |
| `src/lib/platform-core-extended-routes.ts` | factory/supplier `ROUTES.factory.*` + extended helpers |
| `src/lib/platform-core-legacy-routes.ts` | `LEGACY_ROUTES` — advanced/archived paths (redirects, middleware) |
| `/brand/core`, `/shop/core` | `fallbackHref="/platform"` — **без** `@/lib/routes` |

Baseline hub (`platform-core-hub-matrix-rows.ts`) импортирует только `platform-core-routes`.
Extended rows — `platform-core-extended-routes`. Boundary test: `platform-core-boundaries.test.ts`.

**Backend scope (следующий этап):** `docs/BACKEND_PLATFORM_CORE_BASELINE.md`.

## Phase 18 — backend baseline + dependency audit (2026-07)

- Backend: `app/api/platform_core_baseline.py` + `PLATFORM_CORE_BASELINE=true`
- Import bridge: `platform-core-readiness-routes.ts` (audits без `@/lib/routes`)
- Docs: `PLATFORM_CORE_DEPENDENCY_GRAPH.md`, `FULL_ARCHITECTURE_AUDIT.md`, `PLATFORM_CORE_READINESS.md`

## Критерий готовности v1

> Brand creates and publishes. Shop selects and orders. Brand fulfills. Shop tracks. Both communicate.

## Запуск и верификация

```bash
npm run dev:core          # :3001
npm run typecheck:ci
npm run build
npm test -- --testPathPattern='platform-core-(strict-routes|hub-matrix|readiness-audit|golden-cross-role|boundaries)'
npm run test:e2e:core:golden-cross-role   # нужен dev:core на :3001; PG :5433 для полного 12-stop прогона
```

**Без PG** (`demoSeeded: false`): e2e пропускает `shop-sc-showroom` и `*-detail` stops.
