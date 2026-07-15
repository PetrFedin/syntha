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
| UX constitution | DRAFT COMPLETE | Core interaction rules defined |
| Responsive visual system | DRAFT COMPLETE | Detailed iPhone, iPad, MacBook and fullscreen specification written in `docs/14_RESPONSIVE_VISUAL_SYSTEM.md` |
| Machine design tokens | DRAFT COMPLETE | `design-system/tokens.json` aligned with visual system |
| Responsive contract | DRAFT COMPLETE | `design-system/responsive-contract.json` aligned with visual system |
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
- [ ] Approve Registry / Entity / Builder / Showroom / Split Communication templates.
- [ ] Approve iPhone, iPad and MacBook support model.

### Gate G2 — Domain freeze

- [ ] Confirm entity IDs and naming.
- [ ] Confirm order/version/revision lifecycle.
- [ ] Confirm collection release immutability.
- [ ] Confirm price and currency snapshot rules.
- [ ] Confirm tenant and audience access model.

### Gate G3 — UX foundation freeze

- [ ] Approve warm neutral palette and deep navy accent.
- [ ] Approve Inter Variable as operational font.
- [ ] Approve optional Source Serif 4 only for buyer-facing editorial hero.
- [ ] Approve typography scales for MacBook, iPad and iPhone.
- [ ] Approve AppShell dimensions.
- [ ] Approve button/input/table dimensions.
- [ ] Approve card radii and elevation limits.
- [ ] Approve mandatory 390/768/1024/1440/1728 viewport review.
- [ ] Approve mobile Order Builder as guided flow, not compressed matrix.
- [ ] Approve `docs/14_RESPONSIVE_VISUAL_SYSTEM.md` as canonical visual narrative.
- [ ] Approve `design-system/tokens.json` as runtime token source.
- [ ] Approve `design-system/responsive-contract.json` as responsive source.
- [ ] Confirm Markdown and both JSON contracts contain no unresolved conflicts.

### Gate G4 — Canonical component freeze

- [ ] Approve AppShell.
- [ ] Approve WorkspaceHeader and EntityHeader.
- [ ] Approve DataTable and mobile list transformation.
- [ ] Approve ProductCard and product media ratios.
- [ ] Approve BuilderShell and Order Matrix.
- [ ] Approve Showroom shell and selection tray.
- [ ] Approve DealSpace split layout.
- [ ] Approve Calendar structure.
- [ ] Approve Empty/Loading/No-results/Error/Conflict states.

## Visual system decisions currently proposed

```text
Theme:                    light in MVP
Canvas:                   warm neutral #F5F5F3
Page:                     warm off-white #F8F8F7
Operational surface:     white #FFFFFF
Text:                     restrained graphite #1D1D1B
Accent:                   deep navy #1F3A5F
Operational font:         Inter Variable
Editorial font:           Source Serif 4, hero only
Desktop sidebar:          248 px expanded / 72 px collapsed
Desktop top bar:          48 px
iPad landscape top bar:   52 px
iPhone top bar:           52 px
iPhone bottom nav:        56–64 px + safe area
Minimum touch:            44 × 44 px
Operational card radius:  10 px default / 14 px maximum
Mobile sheet radius:      16 px top corners
Accessibility:            WCAG 2.2 AA
```

## Recommended next work

1. Review and freeze `00_PRODUCT_CANON.md`.
2. Review and freeze `14_RESPONSIVE_VISUAL_SYSTEM.md`.
3. Approve `design-system/tokens.json` and `design-system/responsive-contract.json`.
4. Write individual screen specs for first vertical slice:
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
5. Generate Cursor tasks from `12_CURSOR_TASK_TEMPLATE.md`.
6. Only then scaffold the new application runtime and implement design-system foundations before feature screens.

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
- Competitive claims are not yet fully verified.
- Individual screen specs are not yet complete.
- No approved screenshot/wireframe reference set is stored yet.
- Design tokens are specified but not implemented in runtime code.

## Rule

Status can move to `IMPLEMENTING` only when the relevant gate and screen specification are complete. Speed without frozen requirements recreates the same fragmentation this V2 project is intended to eliminate.