---
task_id: TASK-0012
status: QA
priority: P0
product_area: orders
capability_ids:
  - WSC-006
  - WSC-018
workflow_ids:
  - WF-005
screen_ids:
  - approval-queue
  - order-detail
  - amendment-comparison
permissions:
  - order.read
  - order.approve
  - order.confirm
commands:
  - ApproveOrder
  - RequestOrderAmendment
  - ConfirmOrder
domain_events:
  - OrderApproved
  - OrderAmendmentRequested
  - OrderConfirmed
dependencies:
  - TASK-0011
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Order approval, amendment request and confirmation vertical slice

## Outcome

Let the seller review one immutable submitted-order snapshot, either request an explicit immutable amendment or approve it, and create one immutable confirmed-order version without mutating the buyer's submitted commercial contract.

## Scope

- one seller-owned review aggregate per submitted-order snapshot;
- review source copied from the immutable submitted snapshot, never from mutable Order state;
- seller decision state `PENDING → AMENDMENT_REQUESTED | APPROVED → CONFIRMED`;
- amendment reason and structured proposed line changes;
- proposed changes may reference only source line, size and commercial-term identities;
- seller approval records exact actor and source snapshot;
- confirmation requires an approved review and creates one immutable confirmed-order version;
- buyer and seller projections for decisions and confirmed versions;
- optimistic concurrency for every review mutation;
- replay-safe approval, amendment-request and confirmation commands;
- atomic review, confirmed version, audit, outbox and idempotency persistence;
- authoritative `/confirmation` queue and order-detail actions;
- unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria

- a review can be created only for a submitted snapshot owned by the active seller organisation;
- one review aggregate exists per submitted snapshot;
- the original submitted snapshot remains byte-equivalent after every seller decision;
- amendment requests require a non-empty reason;
- every proposed line change references an existing submitted line;
- every proposed size change references an existing submitted size;
- proposed quantities and commercial values are validated safe integers;
- approval and amendment request are mutually exclusive for one review version;
- confirmation requires `APPROVED` state and cannot follow `AMENDMENT_REQUESTED`;
- every mutation requires the expected review version;
- exact command replay returns the original decision or confirmed version;
- changed-payload idempotency reuse returns a conflict;
- seller drafts and internal review fields do not leak outside permitted projections;
- confirmed version is immutable and readable by both buyer and seller organisations;
- review, confirmation, audit, outbox and idempotency facts commit atomically;
- every protected positive path has a negative cross-organisation test;
- governance, typecheck, lint, unit, PostgreSQL, build and browser gates pass before QA.

## Implementation checkpoint

TASK-0012 started from final TASK-0011 evidence head `3daa912145510a2fa3cf3c4bbf29fb652c096b43`, `Syntha V2 Foundation` run `30495865626`.

The implemented slice uses one immutable submitted-order snapshot as the only decision source, one seller-owned review aggregate, replay-safe approval/amendment/confirmation commands, PostgreSQL transaction boundaries and the authoritative `/confirmation` workspace.

## Verification checkpoint

Code head `b887f8f203a6c13c773b829f9b28a2b85a62e79b` passed `Syntha V2 Foundation` run `30497410958`: governance, typecheck, lint, unit, real PostgreSQL integration, production build and Playwright. Browser result: 97 passed, 22 skipped and one pre-existing Selection flow passed on retry. Completion evidence is recorded in `tasks/completions/TASK-0012-completion.md`.
