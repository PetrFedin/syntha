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
  - docs/architecture/adr/README.md
  - docs/architecture/adr/ADR-0001-vertical-modular-monolith.md
  - docs/architecture/adr/ADR-0002-module-public-api.md
  - docs/architecture/adr/ADR-0003-v2-legacy-boundary.md
  - docs/architecture/CODE_STRUCTURE.md
  - docs/architecture/DEPENDENCY_RULES.md
---

# Architecture ADR package

## Outcome

Approve the minimum architecture decisions required before runtime implementation and identify the remaining runtime decisions that depend on `TASK-0001`.

## Proposed now

- vertical modular monolith;
- root `index.ts` as the only module public API;
- explicit V2/legacy isolation boundary.

## Required after TASK-0001

- application framework and package boundary;
- server/client rendering boundary;
- persistence and repository ports;
- command/query and event delivery model;
- authentication and active organisation context;
- runtime test stack and CI gates.

## Acceptance criteria

- every ADR follows `docs/architecture/ADR_PROCESS.md`;
- alternatives and consequences are explicit;
- no ADR changes Product Canon silently;
- migration or reversal cost is stated where material;
- accepted ADRs are linked from `docs/architecture/adr/README.md`;
- dependent task status is updated in the same change;
- no runtime business implementation starts while required ADRs remain proposed or missing.

## Ready condition

Keep this task `DRAFT` until `TASK-0001` defines the executable workspace and commands. It may move to `READY` only when the initial ADRs have reviewers and the remaining runtime ADR inputs are known.
