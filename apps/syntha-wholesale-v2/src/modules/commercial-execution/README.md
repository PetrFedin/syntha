# Commercial Execution

This module owns durable storage and controlled delivery for commercial decision workflows.

## Responsibilities

- persist idempotency, approvals, execution journals, outbox records and integration circuits as one versioned workflow aggregate;
- enforce optimistic concurrency on every write;
- convert approved automatic actions into durable integration commands;
- lease and dispatch commands to ERP, OMS and supplier transports;
- apply retry and circuit-breaker policies without creating duplicate external operations.

## Boundaries

- application code depends on repository and transport ports;
- infrastructure adapters implement those ports;
- PostgreSQL is the default transactional implementation;
- domain calculations remain outside this module and are referenced through explicit contracts.
