---
task_id: TASK-0014
status: IN_PROGRESS
priority: P0
product_area: orders
capability_ids:
  - WSC-006
  - WSC-018
workflow_ids:
  - WF-005
screen_ids:
  - approval-queue
  - amendment-comparison
  - order-detail
permissions:
  - order.read
  - order.approve
  - order.confirm
commands:
  - ApproveRevisedOrder
  - RequestRevisedOrderAmendment
  - ConfirmRevisedOrder
domain_events:
  - RevisedOrderApproved
  - RevisedOrderAmendmentRequested
  - RevisedOrderConfirmed
dependencies:
  - TASK-0013
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Revised Order seller re-review and confirmation vertical slice

## Outcome

Let the seller review one immutable Revised Order version, either request another explicit revision or approve it, and create one immutable confirmed commercial version without mutating the Submitted Order, prior seller request, buyer response or Revised Order source.

## Scope

- one seller-owned Revised Order Review per immutable Revised Order version;
- source lineage to buyer response, seller amendment request and original Submitted Order;
- decisions `PENDING → AMENDMENT_REQUESTED | APPROVED → CONFIRMED`;
- structured second amendment request restricted to Revised Order line and size identities;
- exact seller actor and timestamp attribution;
- confirmation only from an approved Revised Order Review;
- one immutable confirmed-revised Order version;
- buyer and seller scoped review and confirmation projections;
- optimistic review concurrency;
- replay-safe approve, request-amendment and confirm commands;
- atomic review, confirmed version, audit, outbox and idempotency persistence;
- authoritative seller re-review controls inside `/confirmation`;
- unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria

- only the seller organisation named by the Revised Order may review it;
- one Revised Order Review exists per immutable Revised Order version;
- original Submitted Order, first seller review, buyer response and Revised Order remain byte-equivalent;
- approval and another amendment request are mutually exclusive for one review version;
- another amendment request requires a non-empty reason and at least one valid line change;
- proposed lines and sizes must exist in the Revised Order source;
- confirmation requires `APPROVED` and creates one immutable confirmed-revised Order version;
- every mutation requires the expected review version;
- exact replay returns the original review or confirmed version;
- changed-payload idempotency reuse returns a conflict;
- review, confirmation, audit, outbox and idempotency facts commit atomically;
- buyer and seller reads remain organisation-scoped;
- production handoff cannot use an unconfirmed Revised Order;
- every protected positive path has a negative cross-organisation test;
- governance, typecheck, lint, unit, PostgreSQL, build and browser gates pass before QA.

## Implementation checkpoint

TASK-0014 starts from final TASK-0013 evidence head `dbb44ebdf07f0a3be94fd6e1d261a0f3658a8a12`, `Syntha V2 Foundation` run `30533036607`.
