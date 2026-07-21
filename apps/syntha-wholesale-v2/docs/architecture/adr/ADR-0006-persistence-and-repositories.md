# ADR-0006 — Persistence and repository ports

Status: ACCEPTED
Date: 2026-07-17
Accepted: 2026-07-22
Reviewer: Product owner — Petr Fedin

## Decision

Domain and application code depend on repository ports owned by their module. Infrastructure implements those ports. PostgreSQL is the default transactional store once persistence work begins.

## Rules

- UI and route files never query the database directly.
- External IDs are mappings, not internal primary keys.
- Writes use expected versions where concurrent editing matters.
- Retryable writes are idempotent.
- Published, submitted and confirmed snapshots are immutable.

## Consequences

Persistence can evolve without leaking database concerns into business rules, at the cost of explicit mapping and integration tests.
