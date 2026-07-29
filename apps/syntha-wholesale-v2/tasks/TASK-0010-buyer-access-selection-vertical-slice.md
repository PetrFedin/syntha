---
task_id: TASK-0010
status: IN_PROGRESS
priority: P0
product_area: selection
capability_ids:
  - WSC-003
  - WSC-018
workflow_ids:
  - WF-004
screen_ids:
  - showroom-browser
  - selection-board
  - selection-budget
  - selection-size-curve
permissions:
  - showroom.view
  - selection.read
  - selection.manage
commands:
  - GrantShowroomAccess
  - RevokeShowroomAccess
  - CreateSelection
  - AddSelectionItem
  - SetSelectionBudget
  - SetSelectionSizeCurve
domain_events:
  - ShowroomAccessGranted
  - ShowroomAccessRevoked
  - SelectionCreated
  - SelectionItemAdded
  - SelectionBudgetChanged
  - SelectionSizeCurveChanged
dependencies:
  - TASK-0009
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Buyer access and Selection planning vertical slice

## Outcome

Create the first authoritative buyer-planning path after Showroom publication. A Brand grants one Shop access to an immutable published Showroom snapshot, and the Shop creates and maintains a private Selection with budget, product shortlist and size-curve intent.

## Scope

- explicit Showroom access grant from seller organisation to buyer organisation;
- grants bind to one immutable Showroom publication snapshot;
- active and revoked access states with exact actor, version and audit evidence;
- Shop-private Selection aggregate linked to one active grant;
- budget stored in minor currency units with ISO currency code;
- shortlist items identified by stable product reference until Catalog becomes authoritative;
- per-item quantity intent, note and size-curve intent;
- optimistic concurrency for all mutable Selection commands;
- organisation-scoped Brand grant APIs and Shop Selection APIs;
- authoritative `/selection` workspace with controlled access states;
- unit, PostgreSQL and authenticated browser coverage.

## Acceptance criteria

- access can be granted only for a published Showroom with an immutable snapshot;
- seller organisation in the grant must own the Showroom;
- buyer organisation must differ from seller organisation;
- only one active grant exists per Showroom and buyer organisation;
- revoked grants cannot create or mutate Selections;
- Selection read and write projections are scoped to the buyer organisation;
- seller projections never expose buyer-private budget, notes or size curves;
- budget is non-negative and currency is a valid three-letter uppercase code;
- duplicate product references within one Selection are rejected;
- size labels are unique and quantities are non-negative integers;
- stale writes reject with an explicit version conflict;
- grant, Selection, audit and event facts commit atomically;
- every protected positive path has a negative cross-organisation test;
- all static, unit, PostgreSQL, build and browser gates pass before QA.

## Implementation checkpoint

TASK-0010 starts only after the Showroom source of truth is implemented. TASK-0009 remains the dependency and must reach QA on a fully green workflow before TASK-0010 can be promoted to QA.

The first implementation priority is the domain contract for snapshot-bound access grants and Shop-private Selection planning. PostgreSQL, APIs and workspace projections follow in the same vertical slice.
