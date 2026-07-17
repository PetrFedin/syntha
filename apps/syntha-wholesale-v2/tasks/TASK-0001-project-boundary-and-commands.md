---
task_id: TASK-0001
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
  - AGENTS.md
  - CURSOR_START_HERE.md
  - docs/architecture/context-map.json
  - docs/architecture/CODE_STRUCTURE.md
---

# Project boundary and commands

## Outcome

Create an isolated executable workspace for Syntha Wholesale V2 without importing legacy runtime code.

## Scope

- establish the V2 package/runtime boundary;
- define install, dev, typecheck, lint, test and verify commands;
- define environment variable validation without committing secrets;
- keep the existing Platform Core runtime unaffected.

## Acceptance criteria

- `apps/syntha-wholesale-v2/package.json` owns V2 commands;
- a clean install can run the documented verification command;
- V2 does not import legacy UI or use legacy routes as fallback;
- commands fail with actionable errors;
- README and status documents match the actual commands.

## Non-goals

- business modules;
- production deployment;
- database schema;
- visual implementation.
