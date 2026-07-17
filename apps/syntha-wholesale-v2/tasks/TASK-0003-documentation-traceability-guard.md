---
task_id: TASK-0003
status: QA
priority: P0
product_area: foundation
capability_ids: []
workflow_ids: []
screen_ids: []
permissions: []
commands: []
domain_events: []
dependencies: []
source_documents:
  - CURSOR_MASTER_RULES.md
  - docs/architecture/context-map.json
  - docs/architecture/CHANGE_WORKFLOW.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Documentation and traceability guard

## Outcome

Prevent architecture, task and documentation drift before runtime implementation begins.

## Implemented scope

- JSON and local Markdown-link validation;
- `TASK-0000` filename, metadata and status validation;
- machine-readable task manifest and dependency graph validation;
- ADR index, file and status consistency validation;
- rejection of `public.ts`, old `V2-*` IDs and horizontal root architecture;
- module `README.md` and root `index.ts` requirements;
- cross-module deep-import rejection;
- path-scoped GitHub Actions execution for V2 changes.

## Acceptance evidence

- `npm ci --ignore-scripts` and `npm run verify` run in the V2 workflow;
- architecture and task-manifest validators are dependency-free Node scripts;
- failed validator runs were observed and corrected before this task entered QA;
- workflow run 40 completed successfully with both validators enabled;
- no runtime or business implementation was introduced.

## QA checks

- review failure messages for actionability;
- confirm task and ADR status changes fail when their machine-readable indexes are not updated;
- confirm module checks activate when `src/modules` is introduced.
