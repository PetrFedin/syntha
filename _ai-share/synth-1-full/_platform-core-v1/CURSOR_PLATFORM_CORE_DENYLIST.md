# Platform Core v1 — DENYLIST

Зоны **вне ядра**. Не показывать в Platform Core навигации, не импортировать
в baseline-коде, не индексировать без явного запроса. Реестр путей —
`src/lib/platform-core-legacy-routes.ts` (`PLATFORM_CORE_DENYLIST_PATH_PREFIXES`).

## client-b2c → `_archive/client-b2c`

`/client/**`, wardrobe, try-before-you-buy, gift registry, wishlist, visual search,
style quiz, outfit builder, capsules, fit advisor, sewing patterns, B2C scanner,
B2C personalization.

Пути (уже `.cursorignore`): `src/app/client/`, `src/app/wardrobe/`,
`src/components/client/`, `src/components/wardrobe/`.

## b2b-advanced → `_archive/b2b-advanced`

trade shows, B2B passport, private invites, linesheet campaigns, engagement
analytics, content syndication, lookbook projects, partner map, advanced price
lists, customer groups, company accounts, RFQ, tenders, sales rep portal,
gamification, social feed, video consultation, VIP room, whiteboard, Shopify sync,
collaborative order, custom assortments.

Ключи `ROUTES.*`: см. `PLATFORM_CORE_LEGACY_BRAND_ROUTE_KEYS` /
`PLATFORM_CORE_LEGACY_SHOP_ROUTE_KEYS` в `platform-core-legacy-routes.ts`.

## experiments → `_archive/experiments`

auctions, smart contracts, academy, loyalty standalone, circular standalone,
marketplace standalone, global compliance standalone, ESG standalone,
investor/monetization demos.

Пути (уже `.cursorignore`): `src/app/academy/`, `src/components/academy/`.
Investor/monetization strips → `src/_archive/platform-core-legacy/` (Wave 9).

## extended роли → `_extended`

manufacturer standalone UI, supplier standalone UI, distributor standalone UI,
factory role dashboards, supplier role dashboards.

**НЕ переносить** production/material/logistics логику, если она работает внутри
Brand `order_production`. Переносится только standalone-кабинет/дашборд.

## Broad-домены (не в core nav)

broad marketing, broad finance, broad analytics, broad ESG, marketplace,
gamification, social feed, VIP, whiteboard.

## Правило импорта

Baseline-файлы (`platform-core-hub-matrix-rows.ts`, `src/app/brand/core`,
`src/app/shop/core`) импортируют **только** `platform-core-routes.ts`. Extended —
через `platform-core-extended-routes.ts`. Denylist-пути — нигде в baseline.
