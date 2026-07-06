# DEEP-AUDIT — прогресс (compact, ~120 строк)

Полный аудит **не открывать** — `_platform-core-split/platform-core/DEEP-AUDIT-2026-06-21.md` (~14k строк, `.cursorignore`).

Источник: §11–12 DEEP-AUDIT · обновлено 2026-06-26.

## Golden path (§11)

`showroom → matrix → checkout → brand registry → confirm → handoff → mfr PO → supplier materials → tracking → comms → /platform trace`

Критерий: один `orderId`, `poId`, `threadId`; e2e через 4 роли.

---

## P0 — integrity (§12)

| # | Задача | Статус | Где |
|---|--------|--------|-----|
| 1 | `/platform` hub | ✅ | `app/platform/` |
| 2 | `platform-core-hub-matrix` | ✅ | `lib/platform-core-hub-matrix.ts` |
| 3 | `platform-core-readiness-audit` | ✅ | `readiness-sections/` + `index.ts` |
| 4 | Core cabinet route constants | ✅ | `lib/platform-core-routes.ts` |
| 5 | Platform Core strict typecheck | 🟡 | `dev:platform-core` STRICT; full build still soft |
| 6 | Cross-role golden e2e | 🟡 | `core-249` + `platform-core-golden-cross-role-path.ts` |
| 7 | SoT badges на ячейках | 🟡 | readpath badge; PG-off banners убраны → silent demo |

---

## P1 — product risks (§12)

| # | Задача | Статус | Следующий шаг |
|---|--------|--------|---------------|
| 1 | Shop B2B nav 76→6–8 | 🟡 | middleware coerce + strict |
| 2 | Brand order cockpit | 🟡 | wave 3 `BrandCollectionOrderCabinetWorkspace` |
| 3 | Shop tracking cockpit | 🟡 | wave 3 `ShopCollectionOrderCabinetWorkspace` |
| 4 | Manufacturer PO cockpit | ✅ | `workspaces/ManufacturerOrderProductionCabinetWorkspace` |
| 5 | Supplier procurement cockpit | ✅ | `workspaces/Supplier*CabinetWorkspace` |
| 6 | Post-handoff reserve | ⏳ | ports + B2B API |
| 7 | Delivery acknowledge batch | ⏳ | spine |
| 8 | Notification center | ⏳ | comms wave 5 |
| 9 | Poll → SSE critical | 🟡 | chain-status SSE есть; не везде |

---

## Cross-cutting (§3) — в работе

| Проблема | Статус | Действие |
|----------|--------|----------|
| Навигационный шум | 🟡 | STRICT + garbage register |
| mini/full дубли | 🟡 | embedded workspaces; insight → отдельный файл |
| Demo/fallback | ✅ | silent offline: readPath LS + pillar-snapshot resilient |
| Ссылки vs действия | ⏳ | ACTION-CONTRACTS |
| Poll-only | 🟡 | SSE на chain-status |

---

## Token / file budget (§14.2)

| Файл | Строк | Правило |
|------|------:|---------|
| `RoleCoreCabinetHub.tsx` | ~640 | shell + nav; insight вынесен |
| `RoleCorePillarInsightCards.tsx` | ~150 | overview cards only |
| `platform-core-hub-matrix.ts` | ~720 | grep символ, не read целиком |
| `*-audit.ts` | 400–1100 | **один** role file за задачу |
| `workspaces/*` | <200 each | один section = один файл (wave 4+) |

**Не читать:** DEEP-AUDIT целиком · `lib/routes.ts` · `brand/production/` · e2e без запроса.

---

## Волны миграции (см. MIGRATION-CHECKLIST)

| Wave | Фокус | Статус |
|------|-------|--------|
| 1 | brand×dev embedded | 🟡 W2 wrapper |
| 4 | mfr/sup embedded | ✅ op + comms + sup dev |
| 2–3 | brand/shop SC/CO | 🟡 | CO embedded (brand registry + shop matrix/checkout/registry) |
| 5 | golden e2e | 🟡 | `core-249-wave-5-golden-cross-role-embedded.spec.ts` |
| 6 | archive long-tail | ⏳ |

---

## Следующие 3 задачи (рекомендация)

1. **Golden e2e** — `core-249` 7/7 smoke (без PG: без `-detail`; с `db:core:bootstrap` — полный spine).
2. **Shop CO** — inspector/prepack tabs в embedded matrix (extract из matrix page).
3. **Brand CO** — pricelist/wssi sections → dedicated panels (не только pillar card fallback).

Команды: `npm run test:e2e:core:golden-cross-role` (wave 5) · `npm run dev:platform-core` · `validate:platform-core-boundary` · `npm test -- platform-core-cabinet-workspace`.
