# manufacturer extended UI — batch 6

**Date:** 2026-07

## Оставлено в `src/app/factory/production/`

`core`, `dossier`, `messages`, `orders`, `materials`

## Перенесено → `_extended/manufacturer/src/app/factory/`

**Root legacy (дубли production tree):** auctions, brands, calendar, catalog, customization, documents, finance, inventory, iot-monitoring, materials, messages, orders, settings, staff

**Production extended:** auctions, brands, calendar, catalog, customization, documents, finance, inventory, iot-monitoring, settings, shop-floor, staff

## Поведение

- Extended role UI доступен при `NEXT_PUBLIC_PC_EXTENDED_ROLES=1` через hub rows (`platform-core-hub-matrix-rows-extended.ts`)
- Физические legacy routes `/factory/auctions` и т.д. → **404** (перенесены)
- Канон extended cabinet: `/factory/production/core`
