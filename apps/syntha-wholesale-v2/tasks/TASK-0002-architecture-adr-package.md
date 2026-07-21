---
task_id: TASK-0002
status: DONE
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
  - docs/architecture/adr/ADR-0004-runtime-framework.md
  - docs/architecture/adr/ADR-0005-rendering-boundary.md
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/adr/ADR-0009-test-stack-and-ci.md
  - docs/architecture/RUNTIME_BOUNDARY.md
---

# Architecture ADR package

## Outcome

Approve the minimum architecture, runtime, security, persistence and testing decisions required before runtime implementation.

## Delivered

ADR-0001 through ADR-0009 are accepted as one controlled package. Each ADR records the reviewer and acceptance date, and the index reflects binding status.

## Acceptance criteria

- every ADR follows the ADR process;
- alternatives and consequences are explicit;
- V2/Legacy isolation is mandatory;
- reviewer and acceptance date are recorded;
- task and status documentation are updated in the same controlled change.

## Review record

Reviewed by product owner Petr Fedin on 2026-07-22. Decision: accepted.
