# shop-longtail archive — batch 9

**Date:** 2026-07 · **Status:** moved

## Оставлено в `src/app/shop/` (baseline Platform Core v1)

| Route | Столп |
|-------|-------|
| `core` | hub |
| `b2b/` (baseline 7: orders, checkout, matrix, tracking, showroom, partners, working-order) | SC / CO / OP |
| `messages` | comms |
| `calendar` | comms |

## Перенесено (16 route-папок, ~24 файла)

`analytics`, `b2b-orders` (legacy list), `bnpl`, `bopis`, `career`, `clienteling`,
`endless-aisle`, `fitting-room`, `inventory`, `local-inventory-ads`, `orders` (B2C retail),
`promotions`, `settings`, `ship-from-store`, `staff`, `stylist-tablet`

→ `_archive/shop-longtail/src/app/shop/`

## Alias

`tsconfig`: `@/app/shop/*` → `src` first, затем `_archive/shop-longtail`.

## Связь с batch 3

Advanced `shop/b2b/*` long-tail уже в `_archive/b2b-advanced/`. Batch 9 — retail/ops
зоны вне wholesale spine.

## Возврат

`git mv` обратно + убрать fallback в `tsconfig` paths.
