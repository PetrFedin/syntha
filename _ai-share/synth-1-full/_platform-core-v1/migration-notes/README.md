# Platform Core v1 — Migration Notes

Порядок безопасного физического переноса зон в `_archive/` / `_extended/`.
Логическая изоляция уже сделана (routes/rows/nav). Физический перенос — отдельно,
чтобы не ломать импорты (rule #9).

## Сделано (логическая изоляция)

1. `PLATFORM_CORE_BASELINE_ROWS` / `PLATFORM_CORE_EXTENDED_ROWS` разделены;
   `getPlatformCoreHubRowsForUi()` отдаёт baseline без флага.
2. factory/supplier route-хелперы — через фасад `platform-core-extended-routes.ts`;
   baseline-строки их не импортируют.
3. Реестр «вне ядра» — `platform-core-legacy-routes.ts`.
4. `shop.order_production` активен (tracking/документы/отгрузка); `shop.development` read-only.

## План физического переноса (по зоне, каждая партия отдельно)

Для каждой зоны:

1. `grep` импортов зоны из baseline-кода (`src/app/{brand,shop}/core`, `components/platform`, `lib/platform-core-*`). Должно быть 0.
2. Переместить файлы в целевую `_archive/<zone>` или `_extended/<role>`.
3. Обновить `tsconfig` paths / алиасы, если зона на них ссылалась.
4. `npm run typecheck:ci` → `npm run build`. Только зелёный merge.

## Очередь (приоритет)

| # | Зона | Источник | Цель |
|---|------|----------|------|
| 1 | client-b2c | `src/app/client`, `src/components/client`, `src/app/wardrobe` | `_archive/client-b2c` |
| 2 | academy | `src/app/academy`, `src/components/academy` | `_archive/experiments` |
| 3 | distributor | `src/app/distributor`, `src/components/distributor` | `_extended/distributor` |
| 4 | shop b2b advanced | `src/app/shop/b2b/*` (кроме `orders/`) | `_archive/b2b-advanced` |
| 5 | components/b2b | `src/components/b2b` | `_archive/b2b-advanced` |
| 6 | factory dashboards | `src/app/factory/*` (кроме `*/core`, `*/messages`, `*/dossier`) | `_extended/{manufacturer,supplier}` |

## Не переносить

Production/material/logistics логику, обслуживающую Brand `order_production` /
Shop tracking — только через `platform-core-ports`, не standalone UI.
