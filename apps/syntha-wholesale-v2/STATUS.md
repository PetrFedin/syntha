# Syntha Wholesale V2 — Status

Last structured update: 2026-07-15

## Current state

| Area | Status | Notes |
|---|---|---|
| Product scope | DEFINED | Brand + Shop; showroom, buying, order writing, DealSpace |
| Product canon | DRAFT COMPLETE | Requires owner review and freeze |
| Information architecture | DRAFT COMPLETE | Requires route and navigation sign-off |
| Functional map | DRAFT COMPLETE | P0/P1/P2 priorities defined |
| Domain model | DRAFT COMPLETE | Requires schema/ID/money decisions |
| UX constitution | DRAFT COMPLETE | Requires visual design sign-off |
| Component library | DRAFT COMPLETE | Implementation not started |
| API bible | DRAFT COMPLETE | Runtime/framework choice pending |
| Security/data | DRAFT COMPLETE | Legal/retention decisions pending |
| Competitive matrix | FRAMEWORK READY | Competitor facts require official-source verification |
| Screen bible | INDEX READY | Individual screen specs not yet written |
| Implementation roadmap | DRAFT COMPLETE | Cursor tasks must be generated from roadmap |
| Code | NOT STARTED | New V2 code must remain isolated |

## Product freeze gates

Implementation must not start before these gates are accepted.

### Gate G0 — Scope freeze

- [ ] Confirm only Brand and Shop are user roles.
- [ ] Confirm production/PLM/QC are outside MVP.
- [ ] Confirm core flow: Campaign → Collection → Showroom → Selection → Order → Confirmation.
- [ ] Confirm Calendar and DealSpace are core, not optional add-ons.

### Gate G1 — Navigation freeze

- [ ] Approve Brand navigation.
- [ ] Approve Shop navigation.
- [ ] Approve universal Workspace / Entity / Builder / Split templates.
- [ ] Approve desktop and iPad as primary targets.

### Gate G2 — Domain freeze

- [ ] Confirm entity IDs and naming.
- [ ] Confirm order/version/revision lifecycle.
- [ ] Confirm collection release immutability.
- [ ] Confirm price and currency snapshot rules.
- [ ] Confirm tenant and audience access model.

### Gate G3 — UX foundation freeze

- [ ] Approve tokens.
- [ ] Approve AppShell.
- [ ] Approve DataTable.
- [ ] Approve EntityHeader.
- [ ] Approve BuilderShell.
- [ ] Approve Empty/Loading/Error states.

## Recommended next work

1. Review and freeze `00_PRODUCT_CANON.md`.
2. Review `01_INFORMATION_ARCHITECTURE.md` with screenshots/wireframes.
3. Write individual screen specs for first vertical slice:
   - BR-002 Campaign Registry;
   - BR-003 Campaign Overview;
   - BR-008 Collection Registry;
   - BR-009 Collection Overview;
   - BR-013 Presentation Editor;
   - BR-014 Buyer Preview;
   - BR-015 Publish Review;
   - SH-004 Available Campaigns;
   - SH-006 Collection Showroom;
   - SH-008 Selection;
   - SH-012 Order Builder;
   - SH-013 Order Validation;
   - BR-027 Incoming Orders;
   - BR-028 Brand Order Detail.
4. Generate Cursor tasks from `12_CURSOR_TASK_TEMPLATE.md`.
5. Only then scaffold the new application runtime.

## First implementation milestone

**Milestone M1 — Publishable Collection Vertical Slice**

A Brand user can:

- create campaign;
- create collection;
- add products;
- configure buyer-specific pricing/access;
- arrange presentation;
- preview exact buyer experience;
- publish a versioned release.

A Shop user can:

- accept access/invitation;
- open the published showroom;
- browse/filter products;
- favorite/select products;
- see correct price/currency/delivery information.

No order submission is required in M1.

## Second implementation milestone

**Milestone M2 — Best-in-class Order Writing**

A Shop user can:

- convert selection into order;
- enter size/color quantities;
- split by delivery/store;
- see real-time totals;
- resolve MOQ/pack conflicts;
- validate and submit.

A Brand user can:

- review order;
- propose revision;
- confirm order.

Both parties can work in one order DealSpace.

## Blockers that must not be hidden

- No runtime/framework decision has been committed for V2.
- No database schema or migration exists for V2.
- Competitive claims are not yet verified.
- Individual screen specs are not yet complete.
- No design assets or approved visual reference are stored in this folder yet.

## Rule

Status can move to `IMPLEMENTING` only when the relevant gate and screen specification are complete. Speed without frozen requirements recreates the same fragmentation this V2 project is intended to eliminate.
