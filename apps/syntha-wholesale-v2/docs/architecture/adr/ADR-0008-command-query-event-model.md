# ADR-0008 — Command, query and event model

Status: PROPOSED
Date: 2026-07-17

## Decision

Use explicit application commands for writes, query handlers/read models for reads, domain events for business facts, audit events for traceability, analytics events for product measurement and realtime events for UI updates.

## Rules

- React components do not emit domain events directly.
- Retryable commands require idempotency keys.
- Concurrent writes use expected versions.
- Durable events are persisted through an outbox-compatible mechanism.
- Notification consumers own delivery and deduplication.

## Consequences

Write behavior, auditing and integrations become observable and testable, but each task must define applicable event classes and failure handling.
