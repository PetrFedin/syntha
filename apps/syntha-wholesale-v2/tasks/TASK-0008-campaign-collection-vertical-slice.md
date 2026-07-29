---
task_id: TASK-0008
status: IN_PROGRESS
priority: P0
product_area: commercial-lifecycle
capability_ids:
  - WSC-017
  - WSC-018
workflow_ids:
  - WF-003
screen_ids:
  - campaigns
  - collections
permissions:
  - identity.session.use
  - collection.manage
commands:
  - CreateCampaign
  - UpdateCampaign
  - CreateCollection
  - UpdateCollection
domain_events: []
dependencies:
  - TASK-0006
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Campaign and Collection authoritative vertical slice

## Outcome

Create the first server-backed wholesale lifecycle path so Campaign and Collection are authoritative organisation-scoped records instead of structural workspace fixtures.

## Scope

- Campaign aggregate with selling window, season reference, lifecycle status, owner and optimistic version;
- Collection aggregate owned by one Campaign with currency, publication readiness and optimistic version;
- PostgreSQL repositories and checksum-protected schema migrations;
- organisation-scoped create, list, read and update API routes;
- exact authenticated credential identity on every lifecycle audit record;
- transactional entity write and audit append;
- duplicate-code, parent-state and stale-version protection;
- unit coverage for tenant isolation, lifecycle rules, audit attribution and concurrency conflicts.

## Acceptance criteria

- Campaign and Collection persistence is always scoped by active organisation;
- an identifier from another organisation resolves as unavailable rather than leaking a record;
- Campaign dates and lifecycle transitions are validated by the domain;
- Collection currency and lifecycle transitions are validated by the domain;
- Collection creation requires an existing Campaign in the same organisation;
- closed and archived Campaigns reject new Collections;
- Campaign code is unique per organisation and Collection code is unique per Campaign;
- every update requires an expected version and returns a conflict on stale state;
- entity changes and immutable audit evidence commit in the same database transaction;
- audit evidence records the exact scoped credential, expected version and resulting version;
- API reads require `read`, writes require `operate`, and all responses disable caching;
- all cross-module imports use module-root `index.ts` APIs;
- preflight, typecheck, lint, unit tests, production build and affected browser tests pass before completion.

## Implementation checkpoint

Implemented in `agent/v2-commercial-core`:

- Campaign and Collection domain aggregates and public module APIs;
- application use cases for create, list, read and optimistic update;
- PostgreSQL repositories with organisation predicates on every query;
- one versioned migration package for Campaign, Collection and lifecycle audit tables;
- transactional audit append for create and update operations;
- scoped bearer authorization and exact credential identification;
- App Router APIs for Campaign and nested Collection operations;
- regression tests for organisation isolation, audit actor, parent state and stale writes.

## Remaining before QA

- validate `seasonId` against an authoritative persisted Season source in the same organisation;
- add replay-safe idempotency for create commands;
- add PostgreSQL integration tests for unique constraints, rollback and concurrent optimistic updates;
- replace Campaign and Collection workspace fixtures with server-backed projections and mutation surfaces;
- define and publish domain events only after their consumers and transactional outbox contract are explicit;
- pass the complete repository workflow on the final task head.
