---
task_id: TASK-0004
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
  - TASK-0002
  - TASK-0003
source_documents:
  - docs/architecture/TESTING_STRATEGY.md
  - docs/architecture/CHANGE_WORKFLOW.md
  - CURSOR_MASTER_RULES.md
---

# Test and CI foundation

## Outcome

Establish the executable test pyramid and protected CI gates required before business modules are implemented.

## Scope

- select and configure unit, component, integration and e2e test tools through accepted ADRs;
- define deterministic test environment and fixtures;
- add typecheck, lint, unit and architecture checks;
- define changed-scope integration and e2e execution;
- publish actionable failure output and retained evidence where applicable.

## Acceptance criteria

- one verification command runs all mandatory foundation checks;
- CI uses supported runtime versions and pinned major actions;
- failed checks block merge;
- tests do not depend on production credentials or mutable external services;
- tenant isolation and authorization test helpers are available before identity work;
- required checks and local commands are documented.

## Ready condition

Move to `READY` after TASK-0001 commands and TASK-0002 test-stack ADRs are accepted.
