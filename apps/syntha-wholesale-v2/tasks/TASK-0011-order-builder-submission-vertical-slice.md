---
task_id: TASK-0011
status: QA
priority: P0
product_area: orders
capability_ids:
  - WSC-004
  - WSC-006
  - WSC-017
  - WSC-018
workflow_ids:
  - WF-005
screen_ids:
  - order-builder
  - validation-summary
  - order-detail
permissions:
  - order.read
  - order.draft.manage
  - order.submit
commands:
  - CreateOrderDraft
  - SetOrderLineQuantity
  - SetOrderLineCommercialTerms
  - SubmitOrder
domain_events:
  - OrderDraftCreated
  - OrderLineQuantityChanged
  - OrderLineCommercialTermsChanged
  - OrderSubmitted
dependencies:
  - TASK-0010
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0006-persistence-and-repositories.md
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Order Builder and submission vertical slice

## Outcome

Convert one buyer-owned READY Selection into a versioned Draft Order, calculate deterministic commercial totals in minor currency units and submit an immutable commercial-contract snapshot that becomes readable to the seller organisation.

## Scope

- one Draft Order per buyer organisation and READY Selection;
- seller, buyer, Showroom snapshot and Selection lineage copied into the Order;
- Order lines seeded only from Selection items and size-curve intent;
- editable size quantities without changing product or variant identity;
- unit price, discount basis points and tax basis points per line;
- deterministic integer-only gross, discount, net, tax and total calculations;
- optimistic concurrency for every Draft Order mutation;
- replay-safe draft creation and submission;
- immutable submitted-order snapshot with exact actor, version and timestamp;
- buyer-private Draft Order projections;
- seller projections expose only submitted immutable commercial contracts;
- atomic Order, snapshot, audit, outbox and idempotency persistence;
- authoritative `/order-builder` and `/orders` workspaces;
- unit, PostgreSQL and authenticated browser coverage.

## Acceptance criteria

- an Order Draft can be created only from a READY Selection owned by the active buyer organisation;
- Selection access grant must remain ACTIVE at draft creation and submission;
- one Draft Order exists per Selection;
- line product and variant references originate from the Selection and cannot be replaced;
- initial size quantities match the Selection size curve, or use one `UNSIZED` quantity when no curve exists;
- quantities are non-negative safe integers and submission requires a positive total quantity;
- unit prices are non-negative safe integers and submission requires positive pricing for every ordered line;
- discounts and taxes are integers from 0 through 10,000 basis points;
- all totals use deterministic half-up integer rounding and reject unsafe overflow;
- all mutable commands require the expected Order version;
- submitted Orders cannot be edited or resubmitted with a changed payload;
- submission creates one immutable snapshot and one seller-visible submitted projection;
- seller reads cannot access buyer Draft Orders;
- exact command replay returns the original Draft or submitted snapshot;
- changed-payload idempotency reuse returns a conflict;
- Order, audit, snapshot, outbox and idempotency facts commit atomically;
- every protected positive path has a negative cross-organisation test;
- governance, typecheck, lint, unit, PostgreSQL, build and browser gates pass before QA.

## Implementation checkpoint

TASK-0011 started from the fully verified TASK-0010 checkpoint at evidence head `848136756bfba189a7c6ded1ac5c4586324af89c`, `Syntha V2 Foundation` run `30481584812`.

The implemented Order Builder now uses the canonical `@/modules/orders` boundary and contains no temporary export shims, marker files or push probes. The full seller-to-buyer lifecycle, PostgreSQL transaction behavior and browser projections were verified at code head `83a0c361bf9bdac6758cd6d228a7aafcb13175b1`.

## Verification checkpoint

`Syntha V2 Foundation` run `30495432689` passed governance, typecheck, lint, unit tests, real PostgreSQL integration tests, production build and Playwright. The browser result was 95 passed and 16 skipped, with one Showroom test succeeding on retry. Completion evidence is recorded in `tasks/completions/TASK-0011-completion.md`.
