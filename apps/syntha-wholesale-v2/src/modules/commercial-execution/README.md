# Commercial Execution

This module owns durable storage and controlled delivery for commercial decision workflows.

## Responsibilities

- persist idempotency, approvals, execution journals, outbox records and integration circuits as one versioned workflow aggregate;
- enforce optimistic concurrency on every write;
- execute aggregate changes through a PostgreSQL transaction unit-of-work;
- convert approved automatic actions into durable integration commands;
- lease and dispatch commands to ERP, OMS and supplier transports;
- run bounded worker cycles without infinite retries;
- expose an authorized internal worker endpoint;
- apply retry and circuit-breaker policies without creating duplicate external operations;
- deduplicate and reconcile asynchronous external callbacks;
- parse and verify signed callback HTTP requests before opening a transaction;
- verify webhook signatures, replay windows and signing-key rotation before any state change;
- expose an authorized operations read model without returning command payloads or secrets.

## Boundaries

- application code depends on repository, transaction, transport, authorization and verification ports;
- infrastructure adapters implement those ports;
- PostgreSQL is the default transactional implementation;
- the concrete database driver is injected through `TransactionalSqlPool`;
- signing keys, worker identity and operations tokens are server-only runtime configuration;
- domain calculations remain outside this module and are referenced through explicit contracts.
