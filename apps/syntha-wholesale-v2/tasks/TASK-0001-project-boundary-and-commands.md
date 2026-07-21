---
task_id: TASK-0001
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
  - AGENTS.md
  - CURSOR_START_HERE.md
  - docs/architecture/context-map.json
  - docs/architecture/CODE_STRUCTURE.md
  - docs/architecture/RUNTIME_BOUNDARY.md
---

# Project boundary and commands

## Outcome

Create an isolated executable foundation workspace for Syntha Wholesale V2 without importing legacy runtime code or pretending that the business runtime already exists.

## Delivered

- isolated package root at `apps/syntha-wholesale-v2`;
- dedicated `package.json` and `package-lock.json`;
- Node 24 baseline in `.nvmrc` and package engines;
- `preflight`, `verify`, architecture validation and explicit runtime-blocked commands;
- environment contract in `.env.example`;
- dedicated GitHub Actions installation and verification flow;
- documented V2/legacy runtime boundary.

## Acceptance evidence

- `npm ci --ignore-scripts` runs in the dedicated GitHub Actions job;
- `npm run verify` passes on Node 24;
- V2 foundation commands do not invoke or mutate Platform Core runtime;
- runtime commands fail with actionable messages until TASK-0004 installs the accepted toolchain;
- no runtime dependency on Legacy exists.

## Review record

Reviewed by product owner Petr Fedin on 2026-07-22. Decision: accepted.
