# Orders module

The Orders module owns buyer Draft Orders, immutable submitted commercial-contract snapshots, seller decisions and immutable confirmed Order versions.

## Source-of-truth boundary

- `selection` owns buyer assortment intent, budget, notes and size curves.
- `orders` copies one READY Selection into one versioned Draft Order.
- product, variant and allowed size identities originate from the Selection and cannot be replaced inside the Order.
- buyer Draft Orders remain private to the buyer organisation.
- seller projections expose only immutable submitted-order snapshots.
- seller approval and amendment requests always reference one submitted snapshot and never mutate it.
- confirmation creates one immutable confirmed version copied from the approved submitted snapshot.
- price, discount, tax and total amounts use deterministic integer minor-unit calculations.

## Aggregate rules

- one Order exists per buyer organisation and Selection;
- draft creation and submission are replay-safe;
- Order mutations require expected version and an active Showroom access grant;
- quantities are non-negative safe integers;
- unit prices are minor-unit integers;
- discount and tax rates are integer basis points from 0 through 10,000;
- submission requires positive quantity and positive price for every submitted line;
- submission atomically persists Order state, immutable snapshot, audit, outbox and idempotency completion;
- one seller-owned review exists per submitted snapshot;
- a pending review becomes either `APPROVED` or `AMENDMENT_REQUESTED`;
- amendments require an explicit reason and may reference only submitted line and size identities;
- confirmation requires `APPROVED`, advances the review to `CONFIRMED` and creates one immutable confirmed version;
- seller decisions and confirmation use replay-safe commands and optimistic expected versions;
- review, confirmed version, audit, outbox and idempotency facts commit atomically;
- buyer and seller reads are always scoped to their own organisation identifiers.

## Runtime surfaces

- `/order-builder` owns buyer-private draft construction;
- `/orders` exposes submitted immutable commercial contracts;
- `/confirmation` exposes seller approval, amendment and confirmation plus buyer decision visibility;
- `/api/submitted-orders/{snapshotId}/review` records the first seller decision;
- `/api/order-reviews` and `/api/order-reviews/{reviewId}` expose scoped review projections;
- `/api/order-reviews/{reviewId}/confirm` creates a confirmed version;
- `/api/confirmed-orders` and `/api/confirmed-orders/{versionId}` expose scoped immutable versions.

## Public API

Use only `@/modules/orders`. Internal domain, application and infrastructure paths are not public module APIs.
