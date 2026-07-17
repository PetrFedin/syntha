---
task_id: TASK-0002
status: DRAFT
priority: P0
product_area: foundation
capability_ids: []
workflow_ids: []
screen_ids: []
permissions: []
commands: []
domain_events: []
dependencies:
  - TASK-0001
source_documents:
  - docs/architecture/ADR_PROCESS.md
  - docs/architecture/CODE_STRUCTURE.md
  - docs/architecture/DEPENDENCY_RULES.md
---

# Architecture ADR package

## Outcome

Approve the minimum architecture decisions required before runtime implementation.

## Required ADRs

- application framework and package boundary;
- server/client rendering boundary;
- persistence and repository ports;
- command/query and event delivery model;
- authentication and active organisation context;
- test stack and CI gates;
- module import-boundary enforcement.

## Acceptance criteria

- every ADR follows `docs/architecture/ADR_PROCESS.md`;
- alternatives and consequences are explicit;
- no ADR changes Product Canon silently;
- decisions identify migration/reversal cost;
- accepted ADRs are linked from the architecture index.

## Ready condition

Move to `READY` only after TASK-0001 has defined the executable workspace and commands.
