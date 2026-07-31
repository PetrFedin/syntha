# Syntha Wholesale V2 Architecture

## Current vertical slice

The V2 package implements the executable wholesale transaction route:

`Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace`.

The same domain and application services run against the deterministic memory adapter and the PostgreSQL adapter. Storage concerns do not enter module rules.

## Layers

- `src/core` — shared domain errors and immutable event envelopes.
- `src/modules/*/public.mjs` — public domain contracts.
- `src/application` — asynchronous cross-module use cases and transaction boundaries.
- `src/infrastructure` — memory and PostgreSQL adapters.
- `db/migrations` — PostgreSQL schema.
- `scripts` — architecture and persistence contract verification.
- `tests` — domain, application and real-database integration tests.

## Module boundary

Consumers import another domain only through its `public.mjs`. The architecture validator rejects private cross-module imports.

## Transaction guarantees

Every mutation:

1. requires a durable `commandId`;
2. executes in one store transaction;
3. records the actor and immutable domain events;
4. stores command result and outbox events atomically with aggregate changes;
5. uses optimistic concurrency for versioned aggregates.

`confirmAndOpenDeal` validates and confirms the order, advances the cycle, opens DealSpace and creates both shared calendar milestones in one transaction.

## Access control

Users act through active organisation memberships. Roles grant explicit capabilities; the system actor is restricted to organisation registration and first-owner bootstrap.

A Brand and Shop need an active, mutually accepted counterparty relationship before starting a commercial cycle. The requester cannot accept its own relationship request. Either party may revoke an active relationship.

Showroom access is granted per Shop through a versioned invitation. Selection creation requires both an active relationship and an accepted, unexpired invitation for the exact Showroom and Shop. Revocation immediately blocks new access.

## PostgreSQL persistence

`db/migrations/001_wholesale_v2.sql` defines the write model, durable commands, transactional outbox and notification projection tables with foreign keys, unique trade/access constraints, optimistic versions and working-route indexes.

`createPostgresWholesaleStore` implements the same asynchronous transaction port as the memory adapter using `BEGIN`, `COMMIT` and `ROLLBACK`. Versioned updates use `UPDATE … WHERE id = ? AND version = ?`; a zero-row update is a concurrency conflict.

The specialised GitHub Actions workflow starts PostgreSQL 17, applies the migration and runs the complete route from organisation bootstrap through relationship, invitation, Selection, bilateral Order approval and DealSpace. Repeating the same command against another application instance must return the stored result without duplicating aggregates or outbox events.

The memory adapter remains an obligatory regression guard. PostgreSQL success may not hide a broken domain contract, and memory success may not substitute for the real database integration test.

## Deliberate scope boundary

PLM, production, BOM, QC, logistics and landed cost remain outside V2 until the wholesale transaction core, partner access and PostgreSQL persistence are stable. These operational domains must be built on accepted organisations, orders and immutable commercial terms rather than parallel models.
