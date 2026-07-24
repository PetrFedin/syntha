---
task_id: TASK-0007
status: IN_PROGRESS
priority: P0
product_area: adaptive-workspace
capability_ids:
  - WSC-001
  - WSC-003
  - WSC-004
  - WSC-006
  - WSC-013
  - WSC-015
  - WSC-016
  - WSC-018
workflow_ids:
  - WF-001
  - WF-003
  - WF-004
  - WF-005
  - WF-006
  - WF-008
screen_ids:
  - workspace-home
  - global-navigation
  - device-navigation
permissions:
  - identity.session.use
commands: []
domain_events: []
dependencies:
  - TASK-0004
  - TASK-0005
  - TASK-0006
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/TESTING_STRATEGY.md
---

# Adaptive workspace foundation

## Outcome

Replace the isolated foundation landing page with the first coherent Syntha workspace shell that adapts its information density and navigation model for iPhone, iPad, MacBook and wide desktop displays.

## Scope

- shared design tokens for colour, type, spacing, radius, elevation and motion;
- reusable icon, button, badge and metric primitives;
- one canonical navigation definition rendered as desktop sidebar and tablet/mobile bottom navigation;
- top workspace bar with organisation context, search and notification access;
- responsive dashboard content with metrics, lifecycle, active work, calendar and system status;
- safe links only: implemented routes and the health endpoint, with no dead product routes;
- visible Legacy-isolation statement;
- reduced-motion, keyboard focus, safe-area and touch-target support;
- browser coverage for desktop, iPad and iPhone layouts.

## Acceptance criteria

- no Legacy component, route, style or runtime import;
- all visual primitives are exported through `src/shared/ui/index.tsx`;
- the home page consumes shared primitives instead of duplicating button, icon, badge or metric markup;
- desktop and wide desktop expose persistent side navigation;
- tablet and iPhone expose bottom navigation and hide the persistent sidebar;
- minimum interactive target height is 44px;
- layout supports mobile safe-area insets and does not produce horizontal page overflow;
- product lifecycle remains visible and ordered from Campaign through DealSpace;
- all rendered links resolve to implemented App Router routes or `/api/health`;
- unit tests cover core workspace landmarks and isolation messaging;
- Playwright runs desktop, iPad and iPhone projects and validates the correct navigation mode;
- governance, typecheck, lint, unit tests, build and browser tests pass before task completion.

## Implementation checkpoint

The adaptive workspace architecture is implemented and locally verified:

- `WorkspaceShell` is owned only by the root layout;
- 15 section routes and the eight-stage lifecycle derive from one validated registry;
- unknown sections return 404 and known sections are statically generated;
- Workspace Context and Commercial Context use explicit identifiers and dependency clearing;
- URL helpers preserve compatible context across dashboard, shell and lifecycle transitions;
- shared page states replace route-specific placeholder markup;
- messages, notifications, calendar and search expose typed source-entity link contracts;
- structural demo records are isolated in `src/shared/connected-services/fixtures.ts`;
- 36 unit tests and 80 Playwright scenarios pass; four device-inapplicable checks skip by design.

TASK-0007 remains `IN_PROGRESS` because commercial modules still need server-backed read/write slices.
The current section pages intentionally expose architectural context and honest empty states rather
than fabricated production data.
