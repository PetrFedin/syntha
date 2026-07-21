---
task_id: TASK-0003
status: DONE
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
- task filename, metadata, status and dependency validation;
- machine-readable task manifest and change ledger validation;
- ADR index, file and status consistency validation;
- rejection of `public.ts`, old IDs and horizontal root architecture;
- module `README.md` and root `index.ts` requirements;
- cross-module deep-import rejection;
- path-scoped GitHub Actions execution for V2 changes.

## Review record

Reviewed by product owner Petr Fedin on 2026-07-22. Decision: accepted.
