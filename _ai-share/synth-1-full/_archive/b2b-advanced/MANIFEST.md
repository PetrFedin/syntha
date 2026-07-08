# b2b-advanced archive — batch 3 (physical move)

**Date:** 2026-07 · **Status:** moved

## Оставлено в baseline (`src/app/shop/b2b/`)

| Route | Столп | Зачем |
|-------|-------|-------|
| `orders/` | collection_order | реестр, деталь, PG |
| `checkout/` | collection_order | оформление опта |
| `matrix/` | collection_order | матрица заказа |
| `tracking/` | order_production | buyer tracking |
| `showroom/` | sample_collection | витрина коллекций |
| `partners/` | sample_collection | каталог партнёров |
| `working-order/` | collection_order | workspace embed |

Корневые guards: `layout.tsx`, `page.tsx`, `shop-b2b-core-*.tsx`.

## Перенесено в архив

- **75** route-папок `src/app/shop/b2b/*` → `_archive/b2b-advanced/src/app/shop/b2b/*`
  (gamification, rfq, tenders, vip, whiteboard, shopify-sync, collaborative-order, …)
- **75** файлов `src/components/shop/b2b/**` → `_archive/b2b-advanced/src/components/shop/b2b/**`

## Path alias (tsconfig)

`@/components/shop/b2b/*` → `_archive/b2b-advanced/src/components/shop/b2b/*`

Baseline workspace (`ShopCoMatrixEmbeddedPanel`, `checkout-core`) продолжает импортировать matrix/checkout UI через alias.

## Поведение

- `/shop/b2b/gamification` и прочие advanced → **404** (физически нет route)
- Platform Core strict → middleware редирект на `/platform?archived=1` (уже было)
- Native href в core mode → `/shop/core?pillar=…` (без long-tail)

## Возврат

Восстановить папку из git + снять alias / вернуть route tree.

---

## Batch 4 (2026-07) — brand b2b-advanced

| From | To | Files |
|------|-----|-------|
| `src/app/brand/b2b/**` (весь tree) | `_archive/b2b-advanced/src/app/brand/b2b/**` | 23 |
| `src/components/b2b/**` | `_archive/b2b-advanced/src/components/b2b/**` | 65 |
| `src/components/brand/b2b/**` | `_archive/b2b-advanced/src/components/brand/b2b/**` | 23 |

**Baseline brand CO** — `/brand/b2b-orders/` + `/brand/core` (не `/brand/b2b/*`).

Aliases: `@/components/b2b/*`, `@/components/brand/b2b/*` → архив.
