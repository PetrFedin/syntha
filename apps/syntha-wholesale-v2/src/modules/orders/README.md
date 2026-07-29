# Orders module

The Orders module owns buyer Draft Orders and immutable submitted commercial-contract snapshots created from READY Selections.

## Source-of-truth boundary

- `selection` owns buyer assortment intent, budget, notes and size curves.
- `orders` copies one READY Selection into one versioned Draft Order.
- product, variant and allowed size identities originate from the Selection and cannot be replaced inside the Order.
- buyer Draft Orders remain private to the buyer organisation.
- seller projections expose only immutable submitted-order snapshots.
- price, discount, tax and total amounts use deterministic integer minor-unit calculations.

## Aggregate rules

- one Order exists per buyer organisation and Selection;
- draft creation and submission are replay-safe;
- mutations require expected version and an active Showroom access grant;
- quantities are non-negative safe integers;
- unit prices are minor-unit integers;
- discount and tax rates are integer basis points from 0 through 10,000;
- submission requires positive quantity and positive price for every submitted line;
- submission atomically persists Order state, immutable snapshot, audit, outbox and idempotency completion.

## Public API

Use only `@/modules/orders`. Internal domain, application and infrastructure paths are not public module APIs.
