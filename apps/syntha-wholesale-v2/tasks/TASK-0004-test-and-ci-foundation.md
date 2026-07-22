---
task_id: TASK-0004
status: IN_PROGRESS
priority: P0
product_area: foundation
capability_ids: []
workflow_ids: []
screen_ids:
  - foundation-home
  - runtime-health
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
  - docs/architecture/adr/ADR-0004-runtime-framework.md
  - docs/architecture/adr/ADR-0009-test-stack-and-ci.md
  - CURSOR_MASTER_RULES.md
---

# Test and CI foundation

## Outcome

Establish the executable Next.js/TypeScript runtime, test pyramid and protected CI gates required before business modules are implemented.

## Implemented

- independent Next.js 16 App Router runtime;
- strict TypeScript configuration and path alias;
- ESLint flat configuration with Next.js Core Web Vitals and TypeScript rules;
- Vitest, Testing Library and deterministic setup;
- Playwright configuration and foundation smoke flow;
- production build, health endpoint and responsive foundation screen;
- CI sequence for install, governance validation, typecheck, lint, unit tests, build, browser installation and e2e execution;
- organisation-isolation and permission-denial testkit fixtures;
- architecture validation excludes dependencies and generated runtime output;
- change ledger distinguishes V2-owned files from repository-level workflow files;
- no Legacy import, fallback or runtime dependency.

## Verification history

The isolated local assembly passed:

```text
npm run typecheck
npm run lint
npm run test
npm run build
```

The first GitHub Actions run exposed that the architecture validator traversed `node_modules` after dependency installation. The second run exposed that repository-level workflow evidence had been recorded as though it lived inside the V2 package. Both defects were in governance boundaries rather than product runtime code and are now fixed explicitly.

## Remaining work before QA

- confirm the corrected GitHub Actions governance step passes;
- confirm typecheck, lint, unit, build and Playwright steps pass independently;
- replace bootstrap lock metadata with a complete generated dependency lock;
- record successful CI evidence in the completion report.
