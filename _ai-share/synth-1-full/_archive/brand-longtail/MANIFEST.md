# brand-longtail archive — batch 8

**Date:** 2026-07 · **Status:** moved

## Оставлено в `src/app/brand/` (baseline + обслуживание столпов)

`core`, `b2b-orders`, `messages`, `calendar`, `linesheets`, `showroom`,
`range-planner`, `retailers`, `materials`, `production`, `collections`,
`documents`, `logistics`, `suppliers`, `factories`, `tasks`, `process`,
`pre-orders`, `merch`

## Перенесено (62 route-папки, ~183 файла)

Все остальные top-level `src/app/brand/*` → `_archive/brand-longtail/src/app/brand/`.

Примеры: `analytics`, `marketing`, `finance`, `dashboard`, `products`,
`settings`, `promotions`, `academy`, `auctions`, `distributor`, …

## Alias

`tsconfig`: `@/app/brand/*` → `src` first, затем `_archive/brand-longtail`.

Legacy dynamic imports (напр. `retailers-legacy`) продолжают резолвиться через alias.

## Возврат

`git mv` обратно в `src/app/brand/` + убрать fallback в `tsconfig` paths.
