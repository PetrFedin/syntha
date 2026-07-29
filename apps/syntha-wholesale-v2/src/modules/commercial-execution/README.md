# Commercial Execution

This module owns durable storage and controlled delivery for commercial decision workflows.

## Responsibilities

- persist idempotency, approvals, execution journals, outbox records and integration circuits as one versioned workflow aggregate;
- enforce optimistic concurrency on every write;
- convert approved automatic actions into durable integration commands;
- lease and dispatch commands to ERP, OMS and supplier transports;
- apply retry and circuit-breaker policies without creating duplicate external operations;
- deduplicate and reconcile asynchronous external callbacks;
- verify webhook signatures, replay windows and signing-key rotation before any state change.

## Boundaries

- application code depends on repository, transport and verification ports;
- infrastructure adapters implement those ports;
- PostgreSQL is the default transactional implementation;
- domain calculations remain outside this module and are referenced through explicit contracts.
