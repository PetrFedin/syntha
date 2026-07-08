# _archive — вне ядра Platform Core v1

Отдельные продукты и второстепенные advanced-фичи, отключённые от Platform Core.
Не показывать в core-навигации, не импортировать в baseline. Карта —
`_platform-core-v1/PLATFORM_CORE_ARCHIVE_MAP.md`, границы —
`_platform-core-v1/CURSOR_PLATFORM_CORE_DENYLIST.md`.

```
_archive/
  client-b2c/          # /client, wardrobe, wishlist, visual search, style quiz, ...
  b2b-advanced/        # trade shows, passport, RFQ, tenders, gamification, VIP, ...
  marketplace/
  academy/
  auctions/
  smart-contracts/
  marketing/
  finance-advanced/
  analytics-advanced/
  retail-advanced/
  esg-advanced/
  loyalty/
  experiments/         # auctions, smart contracts, academy, circular, investor demos
```

Многие зоны уже исключены из индексации в корневом `.cursorignore`
(`src/app/client`, `src/app/academy`, `src/app/wardrobe`, `src/app/shop/b2b`, ...).
Ранее отключённые strips — в `src/_archive/platform-core-legacy/` (Wave 7/9).

Физический перенос файлов сюда — по `_platform-core-v1/migration-notes/README.md`
(партиями, после green typecheck+build). Сейчас — логическая изоляция.

## Когда можно вернуть

Только если зона напрямую обслуживает один из 5 столпов для brand/shop и проходит
критерий 9 (PG live + audit без bad + сквозной переход). Иначе остаётся в архиве.
