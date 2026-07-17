---
task_id: TASK-0003
status: READY
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

## Scope

- validate JSON documents;
- validate local Markdown links;
- enforce `TASK-0000` identifiers and filename consistency;
- reject `public.ts`, old `V2-*` IDs and old horizontal source architecture in canonical documents;
- require module `README.md` and root `index.ts` once modules exist;
- reject deep imports across module boundaries;
- run automatically in GitHub Actions for V2 changes.

## Acceptance criteria

- `npm run verify` runs without external dependencies;
- the V2 architecture workflow is path-scoped;
- a deliberate broken link or invalid JSON makes CI fail;
- a cross-module deep import makes CI fail;
- successful validation is visible on the pull request.

## Evidence

Record the workflow run and any known validation exclusions in the completion report.
