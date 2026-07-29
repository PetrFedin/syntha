# Commercial Execution

This module owns durable storage and controlled delivery for commercial decision workflows.

## Responsibilities

- persist the complete commercial execution aggregate with optimistic concurrency;
- execute aggregate changes through a PostgreSQL transaction unit-of-work;
- bootstrap the runtime from server-only deployment configuration;
- load a concrete `pg` Pool lazily and verify connectivity;
- apply versioned PostgreSQL migrations under an advisory transaction lock;
- reject modified historical migrations through SHA-256 checksum comparison;
- send commands through HTTPS transports with stable idempotency headers and bounded timeouts;
- lease and dispatch commands to ERP, OMS and supplier transports;
- apply retry and circuit-breaker policies without duplicate external operations;
- verify and deduplicate signed callbacks;
- automatically retry only unambiguous orphaned/conflicting callbacks;
- expose authorized operations and reconciliation APIs;
- expose a secret-free readiness report for database and integration configuration.

## Deployment

Set `SYNTHA_COMMERCIAL_EXECUTION_ENABLED=true` to bootstrap from `src/instrumentation.ts`.
The deployment image must provide the `pg` package; it is loaded lazily so browser bundles and disabled environments do not import it.
Migrations run before runtime registration. A checksum mismatch stops startup instead of silently changing an applied schema.
Transport and signing secrets must be stored in the deployment secret manager and passed through server-only environment variables.

## Boundaries

- application code depends on repository, transaction, transport, authorization, health and verification ports;
- infrastructure adapters implement those ports;
- PostgreSQL is the default transactional implementation;
- signing keys, transport tokens and operations tokens are server-only configuration;
- domain calculations remain outside this module and are referenced through explicit contracts.
