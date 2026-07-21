# ADR-0001 — Vertical Modular Monolith

Status: ACCEPTED
Date: 2026-07-17
Accepted: 2026-07-22
Reviewer: Product owner — Petr Fedin
Owners: Architecture

## Context

Syntha Wholesale V2 covers a connected lifecycle from Campaign through DealSpace. Splitting domain, application, infrastructure and UI into global horizontal trees makes a single business change span many unrelated directories and increases Cursor context, coupling and ownership ambiguity.

## Decision

Use a modular monolith organized vertically by business capability:

```text
src/
  app/
  modules/
    <module>/
      domain/
      application/
      infrastructure/
      ui/
      tests/
      README.md
      index.ts
  shared/
  testkit/
  generated/
```

Each module owns its business rules, use cases, adapters, UI and tests. `src/app` composes routes and modules but contains no business rules.

## Consequences

- A vertical slice can be understood and changed in one module.
- Module ownership and deletion are clearer.
- Shared code must remain business-neutral.
- Cross-module dependencies need explicit public contracts.
- Future service extraction remains possible at module boundaries.

## Rejected alternatives

- Global `features/domain/application/infrastructure` trees: rejected due to context spread and weak ownership.
- Microservices from the start: rejected due to operational cost and premature distributed boundaries.

## Validation

- Architecture validator rejects forbidden horizontal root directories.
- Every module must contain `README.md` and `index.ts`.
- Boundary changes require a new ADR.
