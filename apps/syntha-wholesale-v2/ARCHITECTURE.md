# Syntha Wholesale V2 Architecture

## Current vertical slice

The foundation package implements an executable in-memory vertical slice from organisation registration to confirmed wholesale deal. It is deliberately storage-agnostic so PostgreSQL, Firestore or another adapter cannot leak into domain rules.

## Layers

- `src/core`: shared errors and immutable event envelope.
- `src/modules/*/public.mjs`: public module contracts, including organisation-scoped RBAC.
- `src/application`: cross-module use cases and transaction boundary.
- `scripts`: architecture verification.
- `tests`: domain and integration tests.

## Module boundary

Private files may be added inside modules later, but consumers must import only the module's `public.mjs`. The validator fails CI when a module reaches into another module's private path.

## Transaction semantics

`confirmAndOpenDeal` is one application transaction: it validates the order, advances confirmation, opens DealSpace, creates both shared calendar milestones and emits events. The next persistence adapter must preserve this atomicity with a database transaction and an outbox table.

## Next persistence contract

The first database implementation should add repositories for organisations, commercial cycles, deals, calendar milestones, commands and outbox events. Optimistic concurrency must use the aggregate `version` field.

## Access control

Every business mutation records `actorId`. The actor must hold an active membership in Brand or Shop participating in the trade and the role must grant the required capability. The system actor is reserved for organisation registration and first-owner bootstrap.
