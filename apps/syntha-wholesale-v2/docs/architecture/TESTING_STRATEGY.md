# Testing Strategy

## Principles

Tests protect business rules, organisation isolation, immutable commercial snapshots and critical wholesale workflows. Test depth follows risk.

## Layers

- Unit: value objects, calculations, policies and state transitions.
- Integration: repositories, APIs, adapters, outbox delivery, idempotency, concurrency and tenant isolation.
- Component: loading, empty, error, forbidden, saving, success and conflict states; accessibility; keyboard/touch; responsive behaviour.
- End-to-end: Campaign → Collection → Showroom → Publish → Buyer access → Selection → Order → Submit → Review/Revise → Confirm.

Every security- or money-sensitive flow includes a denial or failure path.

## Mandatory checks

- Documentation-only: links, JSON validity, IDs and architecture consistency.
- Domain/application: typecheck, lint, unit and affected integration tests.
- Write path: idempotency, concurrency, audit/event and negative authorization tests.
- UI: component states, accessibility, keyboard/touch and viewport evidence.
- Critical workflow: affected end-to-end path.
- Boundary change: import-boundary guard.

Required viewports: 390×844, 768×1024, 1024×768, 1440×900 and 1728×1117.

Completion evidence records the exact command, result and any skipped check with reason. An unrun check is never reported as passed.
