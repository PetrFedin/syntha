# Connections That Remain

> **Projects truth (2026-06-26):** `src/features/platform-core/` **нет**.  
> Карта док→код: [PLATFORM-CORE-DOC-INDEX.md](./PLATFORM-CORE-DOC-INDEX.md).  
> Ports/gateways: `src/lib/platform-core-ports/`, `src/lib/platform-core-gateways/`.

Platform Core работает через узкий UI + domain layer + API routes.

Активный default-контекст:

```text
_ai-share/synth-1-full/src/app/platform
_ai-share/synth-1-full/src/components/platform
_ai-share/synth-1-full/src/lib/platform-core-*
_ai-share/synth-1-full/src/lib/platform-core-ports
_ai-share/synth-1-full/src/app/api/platform-core
_platform-core-split/platform-core
```

## What Was Cut From Default Scope

Из активных `source-links` убраны широкие live-links:

```text
api-b2b
api-workshop2
api-processes
api-ops-domain-events
app-brand-production
app-brand-b2b-orders
app-shop-b2b
app-factory-production
app-factory-supplier
app-factory-calendar
components-*
lib-production
lib-b2b
lib-order
old e2e specs
```

Эти зоны остаются в runtime/архиве, но не являются Platform Core source of truth и не должны открываться Cursor по умолчанию.

## Server Ports That Remain

Platform Core gateways читают server repositories только через ports:

```text
src/lib/platform-core-ports/*          # UI/API import отсюда
src/lib/platform-core-gateways/*       # read layer
src/lib/server/platform-core-*.ts      # hub repositories
```

(В старых доках путь `features/platform-core/server/ports/*` — целевое имя, см. AUTONOMY-ROADMAP фаза M.)

Правило границы: `components/platform/**` не импортирует `components/shop/b2b` (без исключений). API B2B (`/api/shop/b2b/*`) — кольцо B, допустимо из platform через fetch.

## Domain layer (не «только wrappers»)

```text
src/lib/platform-core-*.ts
src/lib/platform-core-readiness-sections/*
```

Новая логика — сюда + `components/platform/`. Опциональная физическая папка `features/platform-core/` — см. [AUTONOMY-ROADMAP.md](./PLATFORM-CORE-AUTONOMY-ROADMAP.md) фаза M.

## Current Truth

Все 10 adapter-контуров имеют Platform Core read gateway/API:

```text
BOM/costing
RFQ
capacity
QC/AQL
DPP/passport
shipment/ASN
entity chat
calendar deadlines
document packet
exception/SLA
```

Оставшиеся задачи автономности:

```text
acceptance tests for golden path;
write-back contracts for actions that mutate state;
thin Platform Core UI panels over gateway payloads;
separate platform-core-app after tests and contracts stabilize.
```
