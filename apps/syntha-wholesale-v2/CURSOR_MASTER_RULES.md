# Cursor Master Rules — Syntha Wholesale V2

These rules apply to all work in `apps/syntha-wholesale-v2`.

## Product canon

- Organisation types are `Brand` and `Shop`.
- Core lifecycle: `Campaign → Collection → Showroom → Selection → Order Builder → Order → DealSpace`.
- Calendar, appointments and DealSpace are core.
- Production, PLM, BOM, QC, MES and accounting are outside wholesale MVP.

## Context and traceability

Start with `CURSOR_START_HERE.md` and `docs/architecture/context-map.json`. Read only the exact `TASK-*.md`, its source documents, the affected module README/index, changed files and nearest tests.

Source priority:

```text
Product Canon
→ Domain and Security
→ Screen specification
→ Capability/workflow traceability
→ Architecture and accepted ADRs
→ Task
→ Code
```

Every task uses `TASK-####` and defines capability, workflow, screen, permission, entity, command, event, dependency and source-document mappings. Only `READY` tasks may enter implementation.

## Canonical architecture

```text
src/
  app/
  modules/
  shared/
  testkit/
  generated/
```

Each module owns `README.md`, `index.ts`, `domain/`, `application/`, `infrastructure/`, `ui/` and `tests/`.

- Root `index.ts` is the only supported cross-module import surface.
- Deep imports and legacy UI fallbacks are forbidden.
- Domain imports no React, framework, database SDK or vendor API.
- UI uses read models and application commands, never persistence directly.
- Infrastructure implements ports.
- Routes compose modules and contain no business logic.
- `shared` contains no business workflow.
- Boundary changes require an accepted ADR.

## Domain, security and data

Use explicit policies and enums. Money uses minor units plus ISO currency. Time uses UTC plus source timezone where needed. Published, submitted and confirmed snapshots are immutable; revisions create new versions. Preserve Showroom → Selection → Order lineage and audit history.

Authorization is server-side and combines active organisation membership, organisation type, permissions, assignment scope, relationships, entity state and field visibility. Hiding UI is not authorization. Protected actions require positive, negative and tenant-isolation tests.

## API, events and integrations

Use `/api/v2`, server-side organisation validation, idempotency keys, expected versions, cursor pagination and correlation IDs. Persist before success. Separate domain, audit, analytics and realtime events. Connectors use ports/adapters; external IDs never become internal primary keys. Secrets never reach clients, repositories or logs.

## UI and testing

Use canonical components and tokens. One primary CTA per focus region. Critical actions cannot depend on hover. Required viewports are 390×844, 768×1024, 1024×768, 1440×900 and 1728×1117.

Follow `docs/architecture/TESTING_STRATEGY.md`. Never report an unrun check as passed.

## Definition of Done

A task is done only when the business outcome works end-to-end, traceability is satisfied, real read/write paths exist, permission/event/audit rules are implemented, universal UI states are handled, required checks pass with evidence, documentation and task status are updated, and no deep import, legacy fallback or unapproved scope expansion remains.

Stop when specifications conflict, traceability is missing, ownership or permission is ambiguous, screen readiness is insufficient, integration ownership is unclear or a durable architecture change lacks an ADR.
