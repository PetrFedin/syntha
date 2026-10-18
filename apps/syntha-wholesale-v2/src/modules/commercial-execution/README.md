# Commercial Execution

This module owns durable, tenant-isolated storage and controlled delivery for commercial decision workflows.

## Responsibilities

- isolate workflow state by organization while preserving logical workflow ids;
- namespace outbound idempotency keys by organization;
- pass the signed organization identity to ERP and OMS transports;
- persist the commercial execution aggregate with optimistic concurrency;
- run versioned PostgreSQL migrations with checksum protection;
- register per-organization workflow schedules;
- claim due schedules atomically with PostgreSQL `FOR UPDATE SKIP LOCKED`;
- process several organizations safely across parallel scheduler workers;
- recover expired schedule leases after worker failure;
- dispatch commands through HTTPS with bounded retries and circuit breakers;
- verify signed callbacks whose organization id is part of the signed body;
- reconcile orphaned and conflicting callbacks conservatively;
- expose tenant-scoped operations, worker, schedule and reconciliation APIs.

## Tenant boundary

Operational APIs require `x-syntha-organization-id`. Callback organization identity is read from the signed raw body and an optional header must match it. The scoped repository maps `organizationId + workflowId` to a physical storage key, so equal workflow ids in different organizations cannot collide.

## Scheduler

Register a workflow with `PUT /api/commercial-execution/{workflowId}/schedule`, then invoke `POST /api/commercial-execution/scheduler` from a trusted cron service. The scheduler claims due rows with leases and `SKIP LOCKED`, runs the worker and reconciliation, and records the next run or a bounded retry.

## Deployment

Set `SYNTHA_COMMERCIAL_EXECUTION_ENABLED=true` to bootstrap from `src/instrumentation.ts`. The deployment image must provide the `pg` package; it is loaded lazily. Transport and signing secrets remain server-only.
