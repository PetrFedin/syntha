# Platform Core v1 — Scope

**Status:** canon v1 · **Owner:** Platform Core · **Updated:** 2026-07

> Канонические doc-файлы Platform Core v1 лежат в `_platform-core-v1/`
> (папка `docs/` в этом воркспейсе `.cursorignore`-ограничена на любом уровне).

## Что такое Platform Core v1

Чистое ядро для **2 публичных ролей** и **5 столпов**. Всё, что не обслуживает
главную цепочку, отключено от навигации/routes/imports и лежит в `_archive/` или
`_extended/` (см. `PLATFORM_CORE_ARCHIVE_MAP.md`).

### Главная цепочка

```
Article → Sample → Collection → Wholesale Order → Fulfillment → Communication
```

### Критерий готовности

> Brand creates and publishes. Shop selects and orders. Brand fulfills. Shop tracks. Both communicate.

## Роли

| Роль | Статус | Источник |
|------|--------|----------|
| `brand` | baseline | `PLATFORM_CORE_BASELINE_ROWS` |
| `shop` | baseline | `PLATFORM_CORE_BASELINE_ROWS` |
| `manufacturer` | extended (флаг) | `PLATFORM_CORE_EXTENDED_ROWS` |
| `supplier` | extended (флаг) | `PLATFORM_CORE_EXTENDED_ROWS` |
| `distributor` | archived | — |

`manufacturer` / `supplier` — backend-акторы. UI показывается только при
`NEXT_PUBLIC_PC_EXTENDED_ROLES=1`. По умолчанию `getPlatformCoreHubRowsForUi()`
возвращает только baseline.

## Столпы (5) × роли

| Столп | brand | shop |
|-------|-------|------|
| `development` | active | empty (read-only, витрина бренда) |
| `sample_collection` | active | active |
| `collection_order` | active | active |
| `order_production` | active | **active** (tracking, документы, отгрузка, задержки) |
| `comms` | active | active |

Активных ячеек baseline: **9** (brand 5 + shop 4).

См. также **`TWO_ROLE_BASELINE.md`** — golden path (12 stops), strict routes, архивы.

## Источники правды (SoT)

- Роли/строки hub: `src/lib/platform-core-hub-matrix-rows.ts` (baseline),
  `src/lib/platform-core-hub-matrix-rows-extended.ts` (extended),
  `src/lib/platform-core-hub-matrix-rows-all.ts` (комбинированный).
- Флаги/фильтры: `src/lib/platform-core-article-spine.ts`
  (`PLATFORM_CORE_BASELINE_ROLE_IDS`, `isPlatformCoreExtendedRolesEnabled`,
  `filterPlatformCoreHubRowsForBaseline`).
- Routes: `src/lib/platform-core-routes.ts` (baseline) ·
  `src/lib/platform-core-extended-routes.ts` (factory/supplier) ·
  `src/lib/platform-core-legacy-routes.ts` (реестр вне ядра).
- Столпы: `src/lib/platform-core-hub-matrix-pillars.ts` (`PLATFORM_CORE_PILLARS` = 5).
- Audit: `src/lib/platform-core-readiness-audit.ts` +
  `src/lib/platform-core-readiness-sections/*-audit.ts`.

## Границы

- Что внутри ядра: `CURSOR_PLATFORM_CORE_ALLOWLIST.md`
- Что вне ядра: `CURSOR_PLATFORM_CORE_DENYLIST.md`
- Что перенесено/отключено: `PLATFORM_CORE_ARCHIVE_MAP.md`

## Что НЕ выносим (обслуживает ядро)

Производство, материалы, справочники, документы, логистика, цены, остатки —
остаются, если работают внутри Brand `order_production` / Shop tracking.
