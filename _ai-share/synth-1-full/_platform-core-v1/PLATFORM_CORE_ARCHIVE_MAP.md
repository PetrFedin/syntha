# Platform Core v1 — Archive Map

Что перенесено / отключено, откуда, куда, почему и когда можно вернуть.

**Стратегия (rule #9):** сначала логическая изоляция (routes/rows/nav/imports),
физический перенос файлов — отдельным шагом после стабилизации сборки, чтобы не
ломать импорты. Ниже `изоляция` = сделано в этом рефакторинге; `перенос` = план.

## Сделано в партии №1 (физический перенос client-b2c)

| Что | Откуда | Куда | Почему | Как вернуть |
|-----|--------|------|--------|-------------|
| UI `/client/**` (67 файлов) | `src/app/client/` | `_archive/client-b2c/src/app/client/` | B2C отдельный продукт, не wholesale spine | stub catch-all + git restore |
| lib client (8) | `src/lib/client/` | `_archive/client-b2c/src/lib/client/` | TBYB, wardrobe, sewing intent API types | tsconfig alias `@/lib/client/*` |
| components client (7) | `src/components/client/` | `_archive/client-b2c/src/components/client/` | sewing patterns UI | tsconfig alias |
| components wardrobe (2) | `src/components/wardrobe/` | `_archive/client-b2c/src/components/wardrobe/` | digital wardrobe B2C | tsconfig alias |
| strict allowlist `/client` | `platform-core-strict-routes.ts` | удалён из CORE_PAGE_PREFIXES | client вне core nav | — |

Stub: `src/app/client/[[...path]]/page.tsx` → `/platform?archived=client-b2c`. Детали — `_archive/client-b2c/MANIFEST.md`.

## Сделано в партии №2 (client-b2c API + shell)

| Что | Откуда | Куда |
|-----|--------|------|
| API sewing-pattern intent/preview | `src/app/api/client/` | `_archive/client-b2c/src/app/api/client/` |
| ClientCabinetShell | `src/components/layout/client-cabinet-shell.tsx` | `_archive/client-b2c/src/components/layout/` |

Stubs: API → 410 в Platform Core, legacy dynamic import; shell → re-export.

## Сделано в партии №3 (b2b-advanced shop long-tail)

| Что | Откуда | Куда |
|-----|--------|------|
| 68 route-папок shop/b2b | `src/app/shop/b2b/*` (кроме baseline 7) | `_archive/b2b-advanced/src/app/shop/b2b/` |
| components shop/b2b (75) | `src/components/shop/b2b/` | `_archive/b2b-advanced/src/components/shop/b2b/` |

**Baseline оставлен:** `orders`, `checkout`, `matrix`, `tracking`, `showroom`, `partners`, `working-order`. Alias `@/components/shop/b2b/*`. См. `_archive/b2b-advanced/MANIFEST.md`.

## Сделано в партии №4 (brand b2b-advanced)

| Что | Откуда | Куда |
|-----|--------|------|
| brand `/brand/b2b/**` (весь tree, 23 pages) | `src/app/brand/b2b/` | `_archive/b2b-advanced/src/app/brand/b2b/` |
| `components/b2b` (65) | `src/components/b2b/` | `_archive/b2b-advanced/src/components/b2b/` |
| `components/brand/b2b` (23) | `src/components/brand/b2b/` | `_archive/b2b-advanced/src/components/brand/b2b/` |

Aliases: `@/components/b2b/*`, `@/components/brand/b2b/*`. Brand CO baseline — `/brand/b2b-orders/`, не `/brand/b2b/*`.

## Сделано в партии №5 (experiments)

| Зона | Куда |
|------|------|
| academy, auctions, runway, community, wallet, loyalty, marketroom | `_archive/experiments/src/app/` |
| components/academy | `_archive/experiments/src/components/academy` |

См. `_archive/experiments/MANIFEST.md`.

## Сделано в партии №6 (extended roles UI)

| Зона | Куда |
|------|------|
| factory root legacy + production extended subdirs | `_extended/manufacturer/` |
| factory/supplier/circular-hub | `_extended/supplier/` |
| distributor app + components | `_extended/distributor/` |

**Оставлено:** `factory/production/{core,dossier,messages,orders,materials}`, `factory/supplier/{core,messages,rfq-inbox}`. См. `_extended/README.md`.

## Сделано в партии №7 (admin + experiment long-tail)

| Зона | Куда |
|------|------|
| admin (+ stub gate), vendor, kickstarter, metaverse, look-builder, try-on, store-locator, outlet, quiz, looks, project-info, embed, qc-terminal, search | `_archive/experiments/src/app/` |
| components/admin, components/vendor | `_archive/experiments/src/components/` |
| `src/app/u` (client alias) | `_archive/client-b2c/src/app/u` |
| `src/app/supplier` (root circular-hub) | `_extended/supplier/src/app/supplier-root` |

Denylist: `platform-core-legacy-routes.ts` — `/admin`, `/vendor`, … `/u`, `/supplier`. Stub: `src/app/admin/[[...path]]/page.tsx`.

## Сделано в партии №8 (brand cabinet long-tail)

| Зона | Куда |
|------|------|
| 62 папки `src/app/brand/*` (кроме baseline KEEP) | `_archive/brand-longtail/src/app/brand/` |

**KEEP:** `core`, `b2b-orders`, `messages`, `calendar`, `linesheets`, `showroom`,
`range-planner`, `retailers`, `materials`, `production`, `collections`, `documents`,
`logistics`, `suppliers`, `factories`, `tasks`, `process`, `pre-orders`, `merch`.

Alias: `@/app/brand/*` → src + archive fallback. См. `_archive/brand-longtail/MANIFEST.md`.

## Сделано в партии №9 (shop cabinet long-tail)

| Зона | Куда |
|------|------|
| 16 папок `src/app/shop/*` (кроме baseline KEEP) | `_archive/shop-longtail/src/app/shop/` |

**KEEP:** `core`, `b2b/` (baseline 7), `messages`, `calendar`.

Alias: `@/app/shop/*` → src + archive fallback. См. `_archive/shop-longtail/MANIFEST.md`.

## Сделано в партии №10 (brand public `/b/*` + baseline doc)

| Зона | Куда |
|------|------|
| `src/app/b/**` (marketing profiles) | `_archive/brand-public/src/app/b/` |

Stub: `src/app/b/[brandId]/page.tsx` → showroom (core) / platform gate.

Док: `_platform-core-v1/TWO_ROLE_BASELINE.md` — контракт v1, 12 golden stops, verify commands.

E2E: `core-249-wave-5-golden-cross-role-embedded.spec.ts` — counts 12/15 синхронизированы с кодом.

## Сделано в этом рефакторинге (изоляция)

| Что | Откуда | Куда | Почему | Как вернуть |
|-----|--------|------|--------|-------------|
| manufacturer + supplier hub rows | `platform-core-hub-matrix-rows.ts` | `platform-core-hub-matrix-rows-extended.ts` | не baseline; backend-акторы | `NEXT_PUBLIC_PC_EXTENDED_ROLES=1` |
| factory/supplier route helpers | прямой импорт из `platform-core-routes.ts` | фасад `platform-core-extended-routes.ts` | baseline не тянет factory | импорт из extended-модуля |
| advanced/legacy route keys | смешаны в `ROUTES` | реестр `platform-core-legacy-routes.ts` | denylist навигации | снять из денилиста |

## Отключено ранее (Wave 7/9, до этого рефакторинга)

| Что | Куда | Возврат |
|-----|------|---------|
| investor / monetization / B2B peer strips | `src/_archive/platform-core-legacy/components/platform/monetization-mfr/` | `NEXT_PUBLIC_PC_ARTICLE_SPINE_OFF=1` / deep-link |

## Уже вне индексации (`.cursorignore`, не ядро)

| Зона | Путь | Категория |
|------|------|-----------|
| client B2C | `src/app/client/`, `src/components/client/` | client-b2c |
| wardrobe | `src/app/wardrobe/`, `src/components/wardrobe/` | client-b2c |
| academy | `src/app/academy/`, `src/components/academy/` | experiments |
| runway / home / community | `src/app/{runway,home,community}/` | experiments |
| distributor | `src/app/distributor/`, `src/components/distributor/` | extended |
| shop b2b advanced | `src/app/shop/b2b/` (кроме `orders/`) | b2b-advanced |
| components/b2b | `src/components/b2b/` | b2b-advanced |

## План физического переноса (перенос — TODO)

Целевые папки: `_archive/{client-b2c,b2b-advanced,marketplace,academy,auctions,`
`smart-contracts,marketing,finance-advanced,analytics-advanced,retail-advanced,`
`esg-advanced,loyalty,experiments}`, `_extended/{manufacturer,supplier,distributor}`.

Порядок безопасного переноса — `migration-notes/README.md`. Перенос делать только
после `typecheck:ci` + `build` green, партиями по зоне, с обновлением алиасов.

## Критерий возврата зоны в ядро

Зону можно вернуть, только если она напрямую обслуживает один из 5 столпов для
`brand`/`shop` и проходит: PG live + audit без `bad` + сквозной переход без
dead-link. Иначе остаётся в `_archive`/`_extended`.

## Сделано в партии №11 (routes cleanup + import boundaries)

| Что | Откуда | Куда / результат |
|-----|--------|------------------|
| Baseline `ROUTES` | monolith `platform-core-routes.ts` | только brand/shop keys |
| Factory routes + helpers | `platform-core-routes.ts` | `platform-core-extended-routes.ts` |
| Advanced B2B paths | `ROUTES.brand/shop.*` | `LEGACY_ROUTES` в `platform-core-legacy-routes.ts` |
| `/brand/core`, `/shop/core` | `@/lib/routes` fallback | `fallbackHref="/platform"` |
| Import guard | — | `src/lib/__tests__/platform-core-boundaries.test.ts` |
| RoleCoreCabinetHub supplier nav | direct `@/components/factory` | `components/platform/extended/*` (dynamic) |
| Backend plan | — | `docs/BACKEND_PLATFORM_CORE_BASELINE.md` |

**Правило:** baseline Platform Core не импортирует `@/lib/routes`, `_archive`, `_extended`,
`platform-core-extended-routes`, `platform-core-legacy-routes`, factory/supplier components.

## Сделано в партии №12 (Phase 18 — architectural separation)

| Что | Результат |
|-----|-----------|
| Backend baseline router | `app/api/platform_core_baseline.py` + flag `PLATFORM_CORE_BASELINE` |
| Backend extended router | `app/api/platform_core_extended.py` |
| Readiness routes bridge | `platform-core-readiness-routes.ts` — audits без `@/lib/routes` |
| Dependency graph | `docs/PLATFORM_CORE_DEPENDENCY_GRAPH.md` |
| Full architecture audit | `docs/FULL_ARCHITECTURE_AUDIT.md` |
| Readiness report | `docs/PLATFORM_CORE_READINESS.md` |
| Cabinet workspace | extended paths as literals — no `extended-routes` import |
| Handoff notification server | `platform-core-extended-routes` instead of `@/lib/routes` |
