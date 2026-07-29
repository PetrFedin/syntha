---
task_id: TASK-0013
status: IN_PROGRESS
priority: P0
product_area: orders
capability_ids:
  - WSC-006
  - WSC-017
  - WSC-018
workflow_ids:
  - WF-005
screen_ids:
  - amendment-comparison
  - order-detail
  - validation-summary
permissions:
  - order.read
  - order.draft.manage
  - order.submit
commands:
  - AcceptOrderAmendment
  - CounterOrderAmendment
  - RejectOrderAmendment
domain_events:
  - OrderAmendmentAccepted
  - OrderAmendmentCountered
  - OrderAmendmentRejected
dependencies:
  - TASK-0012
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Buyer amendment response and immutable revision vertical slice

## Outcome

Let the buyer respond once to a seller amendment request by accepting it, submitting an explicit counterproposal or rejecting it, while preserving the original Submitted Order and seller request and creating a new immutable revised commercial version whenever terms change.

## Scope

- one buyer-owned amendment response per `AMENDMENT_REQUESTED` Order Review;
- response decisions `ACCEPTED | COUNTERED | REJECTED`;
- mandatory buyer reason for counter and rejection;
- accepted response applies the seller's proposed line changes to a new immutable revision;
- counter response applies buyer-proposed line changes to a new immutable revision;
- rejection records a final response without creating a revision;
- revised lines may reference only submitted line and size identities;
- deterministic integer-only recalculation of quantities and commercial totals;
- exact source lineage to Submitted Order snapshot, seller review and buyer response;
- optimistic response version and one-response uniqueness;
- replay-safe accept, counter and reject commands;
- buyer and seller scoped response/revision projections;
- atomic response, revision, audit, outbox and idempotency persistence;
- authoritative amendment-comparison workflow inside `/confirmation`;
- unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria

- a response can be created only by the buyer organisation named in the seller review;
- the source review must be `AMENDMENT_REQUESTED` and contain a valid immutable amendment request;
- one response exists per seller review;
- accepted revision exactly applies seller-proposed values and preserves all unchanged fields;
- counter revision applies only validated buyer-proposed line and size values;
- rejection creates no revised commercial version;
- original Submitted Order snapshot and seller amendment request remain byte-equivalent;
- all quantities and commercial amounts are safe integers and basis points stay within 0–10,000;
- revised totals use the same deterministic half-up calculation rules as Order Builder;
- exact replay returns the original response or revision;
- changed-payload idempotency reuse returns a conflict;
- response, revision, audit, outbox and idempotency facts commit atomically;
- buyer and seller reads remain organisation-scoped;
- every positive path has a negative cross-organisation test;
- governance, typecheck, lint, unit, PostgreSQL, build and browser gates pass before QA.

## Implementation checkpoint

TASK-0013 starts from final TASK-0012 evidence head `07d01f5b630633ac729325d89ec55f50e8d5c076`, `Syntha V2 Foundation` run `30497845937`.
