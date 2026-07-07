# Platform Core v1 — ALLOWLIST

Что **входит** в ядро v1 и открыто для индексации/правок Platform Core.

## Роли × столпы (активны)

- `brand`: development, sample_collection, collection_order, order_production, comms
- `shop`: sample_collection, collection_order, order_production, comms
  (development — read-only витрина бренда)

## Канонический код

```
src/app/platform/**
src/app/brand/core/**
src/app/shop/core/**
src/app/brand/messages/**            # comms
src/app/shop/messages/**             # comms
src/app/brand/b2b-orders/**          # collection_order / order_production
src/app/shop/b2b/orders/**           # collection_order / tracking
src/app/api/platform-core/**
src/app/api/dev/platform-core/**
src/app/api/workshop2/platform-core/**

src/lib/platform-core-routes.ts             # baseline routes
src/lib/platform-core-extended-routes.ts    # extended facade (flag)
src/lib/platform-core-legacy-routes.ts      # реестр «вне ядра»
src/lib/platform-core-hub-matrix-rows.ts        # baseline rows
src/lib/platform-core-hub-matrix-rows-extended.ts
src/lib/platform-core-hub-matrix-rows-all.ts
src/lib/platform-core-*.ts
src/lib/platform-core-readiness-sections/**
src/lib/server/platform-core-*.ts
src/components/platform/**
```

## Поддерживающая логика (остаётся, обслуживает столпы)

Производство, материалы, справочники, документы, логистика, цены, остатки —
через `platform-core-ports` / `platform-core-gateways`, если используются в
Brand `order_production` или Shop tracking. Прямой standalone UICODE — нет.

## Extended (только флаг `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`)

```
src/lib/platform-core-hub-matrix-rows-extended.ts
src/lib/platform-core-extended-routes.ts
src/app/factory/production/core/**
src/app/factory/supplier/core/**
```
