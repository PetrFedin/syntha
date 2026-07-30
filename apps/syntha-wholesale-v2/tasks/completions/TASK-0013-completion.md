# TASK-0013 completion evidence

Status: QA
Date: 2026-07-30
Branch: `agent/v2-commercial-core`
Draft PR: `#8`

## Delivered outcome

The buyer can respond exactly once to a seller `AMENDMENT_REQUESTED` Order Review by accepting, countering or rejecting it. Accept and counter create a new immutable Revised Order version. Reject records an immutable response without creating a revised version.

The original Submitted Order snapshot and seller Order Review are not modified by any buyer response.

## Source-of-truth and isolation

- `OrderReview` remains the seller-owned amendment request source.
- `OrderAmendmentResponse` is a separate buyer-owned immutable decision fact.
- `RevisedOrderVersion` is created only for accepted or countered terms.
- product, variant, line and size identities remain constrained to the Submitted Order.
- buyer and seller reads are organisation-scoped independently.
- a seller organisation cannot execute the buyer response command.
- one response is allowed per seller review.

## Durability

PostgreSQL persistence includes:

- composite buyer and seller lineage foreign keys;
- immutable response and revised-version rows;
- exact actor audit;
- transactional outbox;
- lifecycle idempotency completion;
- atomic rollback of response, revision, audit and idempotency when outbox insertion fails.

## Interfaces

- `POST /api/order-reviews/{reviewId}/response`;
- buyer/seller response list and detail APIs;
- buyer/seller Revised Order list and detail APIs;
- authoritative amendment-response panel inside `/confirmation`;
- buyer accept, counter and reject server actions;
- buyer and seller response/revision history projections.

## Verification

Code head: `f244a79839689d86ec54759a4b5e8671deb9f5a0`.

`Syntha V2 Foundation` run `30532143257` passed:

- governance and architecture validation;
- TypeScript typecheck;
- ESLint;
- unit tests;
- real PostgreSQL integration tests;
- production build;
- authenticated Playwright browser suite.

Coverage includes deterministic minor-unit recalculation, exact replay, changed-payload conflicts, one-response uniqueness, reject-without-revision behavior, source immutability, transaction rollback and tenant foreign keys.

## Rollback

Revert TASK-0013 domain, repository, persistence, API, workspace and evidence files while preserving TASK-0012 Submitted Order review and Confirmed Order behavior.
