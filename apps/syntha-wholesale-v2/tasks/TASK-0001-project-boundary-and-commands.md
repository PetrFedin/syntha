---
task_id: TASK-0001
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
- `dev`, `typecheck`, `lint` and `test` fail with actionable messages until their ADR/toolchain is accepted;
- no runtime dependencies or business modules were introduced.

## Remaining QA

- review the command contract and Node baseline;
- confirm that explicit command blocking is preferred until runtime ADR acceptance;
- accept or request changes to the runtime boundary document.

## Non-goals

- business modules;
- production deployment;
- database schema;
- visual implementation;
- selection of framework, persistence or test libraries.
