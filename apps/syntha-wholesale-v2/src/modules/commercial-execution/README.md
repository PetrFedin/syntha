# Commercial Execution

This module owns durable storage and controlled delivery for commercial decision workflows.

## Responsibilities

- persist idempotency, approvals, execution journals, outbox records and integration circuits as one versioned workflow aggregate;
- enforce optimistic concurrency on every write;
- execute aggregate changes through a PostgreSQL transaction unit-of-work;
- bootstrap a deployment runtime from server-only configuration;
- load a concrete `pg` Pool lazily at runtime and verify connectivity before registration;
- convert approved automatic actions into durable integration commands;
- send commands through HTTPS transports with stable idempotency headers and bounded timeouts;
- lease and dispatch commands to ERP, OMS and supplier transports;
- run bounded worker cycles without infinite retries;
- apply retry and circuit-breaker policies without creating duplicate external operations;
- deduplicate and reconcile asynchronous external callbacks;
- automatically retry only unambiguous orphaned/conflicting callbacks and retain dangerous contradictions for review;
- verify webhook signatures, replay windows and signing-key rotation before any state change;
- expose authorized operations and reconciliation APIs without returning command payloads or secrets.

## Deployment

Set `SYNTHA_COMMERCIAL_EXECUTION_ENABLED=true` to bootstrap from `src/instrumentation.ts`.
The deployment image must provide the `pg` package; it is loaded lazily so browser bundles and disabled environments do not import it.
Transport and signing secrets must be stored in the deployment secret manager and passed through server-only environment variables.

## Boundaries

- application code depends on repository, transaction, transport, authorization and verification ports;
- infrastructure adapters implement those ports;
- PostgreSQL is the default transactional implementation;
- signing keys, transport tokens and operations tokens are server-only configuration;
- domain calculations remain outside this module and are referenced through explicit contracts.
