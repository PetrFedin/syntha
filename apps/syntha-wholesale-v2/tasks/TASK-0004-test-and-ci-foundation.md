---
task_id: TASK-0004
status: DONE
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

## Delivered

- independent Next.js 16 App Router runtime;
- strict TypeScript configuration and path alias;
- ESLint flat configuration with Next.js Core Web Vitals and TypeScript rules;
- Vitest, Testing Library and deterministic setup;
- Playwright configuration and browser smoke flow;
- production build, health endpoint and responsive foundation screen;
- complete committed dependency lock and deterministic `npm ci` install;
- independently observable governance, typecheck, lint, unit, build and browser gates;
- organisation-isolation and permission-denial testkit fixtures;
- explicit V2/Legacy isolation with no fallback or runtime dependency.

## Verification evidence

GitHub Actions workflow run `29914277388` completed successfully after generating the complete lockfile and executing every foundation gate, including Playwright. The generated lock was subsequently committed to the feature branch.
