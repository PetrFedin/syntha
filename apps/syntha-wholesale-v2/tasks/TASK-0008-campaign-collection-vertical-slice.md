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
  - seasons
  - campaigns
  - collections
permissions:
  - identity.session.use
  - collection.manage
commands:
  - CreateSeason
  - ChangeSeasonStatus
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

# Season, Campaign and Collection authoritative vertical slice

## Outcome

Create the first server-backed wholesale lifecycle path so Season, Campaign and Collection are authoritative organisation-scoped records instead of structural workspace fixtures.

## Scope

- Season aggregate with commercial window, lifecycle status, owner and optimistic version;
- Campaign aggregate with selling window, authoritative Season reference, lifecycle status, owner and optimistic version;
- Collection aggregate owned by one Campaign with currency, publication readiness and optimistic version;
- PostgreSQL repositories and checksum-protected schema migrations;
- composite tenant foreign keys from Campaign to Season and Collection to Campaign;
- organisation-scoped create, list, read and update API routes;
- replay-safe create commands with canonical payload fingerprints and exact actor scope;
- exact authenticated credential identity on every lifecycle audit record;
- transactional entity write, audit append and idempotency completion;
- duplicate-code, parent-state and stale-version protection;
- unit and real-PostgreSQL coverage for tenant isolation, rollback, constraints and concurrency.

## Acceptance criteria

- Season, Campaign and Collection persistence is always scoped by active organisation;
- an identifier from another organisation resolves as unavailable rather than leaking a record;
- Season and Campaign dates and lifecycle transitions are validated by the domain;
- Collection currency and lifecycle transitions are validated by the domain;
- Campaign creation requires an existing non-closed Season in the same organisation;
- Collection creation requires an existing Campaign in the same organisation;
- closed and archived parents reject new child records;
- Season and Campaign codes are unique per organisation and Collection code is unique per Campaign;
- database foreign keys include `organisation_id` and prevent cross-tenant parent references;
- every update requires an expected version and returns a conflict on stale state;
- every create API requires a bounded `Idempotency-Key`;
- the same key, organisation, actor and payload replay the original entity without a second audit record;
- reuse of a key with a different payload or actor returns a deterministic conflict;
- entity changes, immutable audit evidence and idempotency completion commit in one transaction;
- rollback removes an incomplete entity, audit append and command reservation together;
- audit evidence records the exact scoped credential, expected version and resulting version;
- API reads require `read`, writes require `operate`, and all responses disable caching;
- all cross-module imports use module-root `index.ts` APIs;
- CI provisions PostgreSQL and exercises uniqueness, tenant foreign keys, rollback and concurrent optimistic updates;
- preflight, typecheck, lint, unit tests, PostgreSQL integration tests, production build and affected browser tests pass before completion.

## Implementation checkpoint

Implemented in `agent/v2-commercial-core`:

- authoritative Season, Campaign and Collection domain aggregates and public module APIs;
- application use cases for create, list, read and optimistic lifecycle updates;
- PostgreSQL repositories with organisation predicates on every query;
- independent checksum-protected Season, Campaign and idempotency migration ledgers;
- composite `(organisation_id, season_id)` and `(organisation_id, campaign_id)` foreign keys;
- canonical SHA-256 command fingerprints and replay-safe `Idempotency-Key` handling;
- transactional entity, audit and idempotency writes for all three create commands;
- scoped bearer authorization and exact credential identification;
- App Router APIs for Season, Campaign and nested Collection operations;
- regression tests for organisation isolation, audit actor, parent state, replay conflicts and stale writes;
- real PostgreSQL 16 tests for replay, rollback, unique constraints, tenant foreign keys and concurrent optimistic updates;
- an exact `pg` runtime dependency and a mandatory PostgreSQL service gate in GitHub Actions;
- native Node module loading and multi-statement `pg` result normalization.

Code head `e8a2f666eaf51aa6f1c945df4bd0961b4334f68d` passed the complete `Syntha V2 Foundation` workflow, run `30472074274`, including PostgreSQL integration and Playwright.

## Remaining before QA

- replace Season, Campaign and Collection workspace fixtures with server-backed projections and mutation surfaces;
- define and publish domain events only after their consumers and transactional outbox contract are explicit;
- pass the complete repository workflow on the final task head after the workspace integration.
