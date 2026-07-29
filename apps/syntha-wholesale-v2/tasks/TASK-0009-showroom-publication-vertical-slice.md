---
task_id: TASK-0009
status: IN_PROGRESS
priority: P0
product_area: showroom
capability_ids:
  - WSC-001
  - WSC-018
workflow_ids:
  - WF-003
  - WF-004
screen_ids:
  - showroom
  - showroom-editor
  - showroom-preview
permissions:
  - showroom.view
  - showroom.publish
commands:
  - CreateShowroom
  - UpdateShowroom
  - PublishShowroom
  - ArchiveShowroom
domain_events:
  - ShowroomPublished
dependencies:
  - TASK-0008
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Authoritative Showroom publication vertical slice

## Outcome

Create the first authoritative digital Showroom path so a Brand can prepare a buyer-facing presentation for one published Collection, publish an immutable snapshot and expose a controlled read projection without relying on structural fixtures.

## Scope

- Showroom aggregate owned by one Collection and active organisation;
- draft editing with title, code, description, presentation window and optimistic version;
- publication allowed only for an eligible Collection in the same organisation;
- immutable publication snapshot with published version, actor and timestamp;
- replay-safe create and publish commands;
- PostgreSQL repository, migrations, tenant foreign key and transactional audit/outbox behavior;
- organisation-scoped create, list, read, update, publish and archive APIs;
- server-backed Showroom workspace with controlled access states;
- unit, PostgreSQL and authenticated browser coverage.

## Acceptance criteria

- every Showroom query includes active organisation scope;
- Collection identifiers from another organisation resolve as unavailable;
- Showroom code is unique within a Collection;
- presentation start precedes presentation end;
- draft edits require expected version and reject stale writes;
- publication requires an eligible Collection and a complete Showroom draft;
- a published snapshot is immutable and records exact actor, aggregate version and publication time;
- publish replay returns the original snapshot and changed payload conflicts;
- entity, audit, snapshot and outbox facts commit atomically;
- archived Showrooms reject further edits and publication;
- read projections never expose Brand-private fields outside the authorised organisation;
- the Showroom workspace uses authoritative server projections and mutations;
- all static, unit, PostgreSQL, build and browser gates pass before QA.

## Implementation checkpoint

TASK-0009 is opened after TASK-0007 and TASK-0008 reached QA on workflow run `30474774287`.

The first implementation priority is the Showroom aggregate, publication snapshot contract and PostgreSQL schema. Buyer account grants and Selection integration follow only after the publication source of truth is stable.
