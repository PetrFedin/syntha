# Syntha Wholesale V2 Architecture

## Current vertical slice

The foundation package implements an executable vertical slice from organisation registration to confirmed wholesale deal. Application logic depends on a transactional store contract; the supplied memory adapter is used for tests and local execution.

## Layers

- `src/core`: shared errors and immutable event envelope.
- `src/modules/*/public.mjs`: public module contracts, including organisation-scoped RBAC.
- `src/application`: asynchronous cross-module use cases and transactional store port.
- `src/infrastructure`: adapters, currently the deterministic memory store.
- `scripts`: architecture verification.
- `tests`: domain and integration tests.

## Module boundary

Private files may be added inside modules later, but consumers must import only the module's `public.mjs`. The validator fails CI when a module reaches into another module's private path.

## Transaction semantics

`confirmAndOpenDeal` is one application transaction: it validates the order, advances confirmation, opens DealSpace, creates both shared calendar milestones and emits events. The next persistence adapter must preserve this atomicity with a database transaction and an outbox table.

## Next persistence contract

The PostgreSQL adapter must implement the existing transaction contract for organisations, memberships, counterparty relationships, showroom invitations, campaigns, collections, commercial cycles, deals, calendar milestones, durable commands and outbox events. Versioned saves already require optimistic concurrency.

## Access control

Every business mutation records `actorId`. The actor must hold an active membership in Brand or Shop participating in the trade and the role must grant the required capability. The system actor is reserved for organisation registration and first-owner bootstrap.

## Persistence guarantees

Commands and emitted events are stored in the same transaction as aggregate changes. Failed use cases roll back all writes. Durable command fingerprints provide idempotency across application instances. The outbox separates transaction commit from external event publication.

## Counterparty relationships and showroom invitations

A Brand and Shop must have one active, mutually accepted counterparty relationship before a commercial cycle can start. Either party may request a relationship, but the requesting organisation cannot accept or reject its own request. Either party may revoke an active relationship; revocation immediately blocks new cycles and new showroom selections.

Showroom visibility is granted per Shop through a versioned invitation. The invitation requires an active counterparty relationship, belongs to one exact showroom and shop, has an expiry date, and may be accepted or declined only by the invited Shop. The Brand may revoke it. A selection can be created only while both the relationship and an accepted, unexpired showroom invitation remain valid.

Relationship and invitation mutations are idempotent commands, use optimistic concurrency and emit immutable outbox events in the same transaction as their state changes.

## Showroom and selection

A published collection can expose one or more scheduled showrooms. A shop buyer creates the cycle selection only while the cycle is at `showroom`; creation advances it to `selection`. Submitting a non-empty selection advances the same cycle to `order-builder` in the same transaction.

## Order builder and bilateral terms

An order draft is derived only from a submitted selection. Quantity, unit price and total are copied and recalculated from immutable selection lines; the caller cannot supply a total. Incoterm, payment structure and delivery window are validated as a commercial terms snapshot. Brand and Shop accept the same order version independently. Only a dual-approved order can be attached to the commercial cycle and advanced from `order-builder` to `order`; confirmation then opens DealSpace through the existing atomic transaction.

## Notification projection

Notification Center consumes the transactional outbox through an independent idempotent projection checkpoint. Selection submission notifies Brand, an order-term acceptance notifies the counterparty, and DealSpace opening notifies both organisations. Notification projection deliberately does not mark the external outbox record as published; delivery to external brokers remains a separate responsibility.
