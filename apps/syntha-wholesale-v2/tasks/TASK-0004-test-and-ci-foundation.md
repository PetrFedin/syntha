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

## Implemented in this increment

- independent Next.js 16 App Router runtime;
- strict TypeScript configuration and path alias;
- ESLint flat configuration with Next.js Core Web Vitals and TypeScript rules;
- Vitest, Testing Library and deterministic setup;
- Playwright configuration and foundation smoke flow;
- production build, health endpoint and responsive foundation screen;
- CI sequence for install, verification, browser installation and e2e execution;
- no Legacy import, fallback or runtime dependency.

## Local verification

The following checks passed in an isolated local assembly:

```text
npm run typecheck
npm run lint
npm run test
npm run build
```

Playwright Chromium download could not run in the execution environment because `cdn.playwright.dev` DNS resolution failed. Browser installation and e2e execution remain assigned to GitHub Actions.

## Remaining work before QA

- confirm the GitHub Actions run passes with Chromium installation;
- replace the bootstrap-only lock metadata with the complete generated dependency lock;
- add reusable tenant-isolation and authorization test builders;
- record CI evidence in the completion report.
