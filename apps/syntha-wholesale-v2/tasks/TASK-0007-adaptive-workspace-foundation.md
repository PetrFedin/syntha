---
task_id: TASK-0007
status: IN_PROGRESS
priority: P0
product_area: adaptive-workspace
capability_ids:
  - WSC-018
workflow_ids:
  - WF-001
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
- one canonical navigation definition rendered as desktop sidebar, tablet rail and mobile bottom navigation;
- top workspace bar with organisation context, search and notification access;
- responsive dashboard content with metrics, lifecycle, active work, calendar and system status;
- safe links only: implemented anchors and the health endpoint, with no dead product routes;
- visible Legacy-isolation statement;
- reduced-motion, keyboard focus, safe-area and touch-target support;
- browser coverage for desktop, iPad and iPhone layouts.

## Acceptance criteria

- no Legacy component, route, style or runtime import;
- all visual primitives are exported through `src/shared/ui/index.tsx`;
- the home page consumes shared primitives instead of duplicating button, icon, badge or metric markup;
- desktop and large tablet expose persistent side navigation;
- iPhone exposes bottom navigation and hides the persistent sidebar;
- minimum interactive target height is 44px;
- layout supports mobile safe-area insets and does not produce horizontal page overflow;
- product lifecycle remains visible and ordered from Campaign through DealSpace;
- all rendered links resolve to implemented page anchors or `/api/health`;
- unit tests cover core workspace landmarks and isolation messaging;
- Playwright runs desktop, iPad and iPhone projects and validates the correct navigation mode;
- governance, typecheck, lint, unit tests, build and browser tests pass before task completion.

## Implementation checkpoint

Task contract registered. UI primitives exist but remain incomplete until the adaptive workspace, device-specific navigation, tests, status and change-ledger evidence are connected and verified by CI.
