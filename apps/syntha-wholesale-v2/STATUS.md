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
| Responsive visual system | DRAFT COMPLETE | Detailed iPhone, iPad, MacBook and fullscreen specification written |
| Machine design tokens | DRAFT COMPLETE | `design-system/tokens.json` aligned with visual system |
| Responsive contract | DRAFT COMPLETE | `design-system/responsive-contract.json` aligned with visual system |
| Component library | DRAFT COMPLETE | Implementation not started |
| API bible | DRAFT COMPLETE | Runtime/framework choice pending |
| Security/data | DRAFT COMPLETE | Legal/retention decisions pending |
| Competitive matrix | IN PROGRESS | Framework ready; WFX Virtual Showroom verified from official source |
| WFX adaptation | VERIFIED DRAFT | Buyer showroom functions mapped; PLM/ERP/MES excluded from wholesale core |
| Screen Bible index | UPDATED | First slice screens marked DESIGNED |
| First vertical-slice specs | DESIGNED | Eight detailed screen files completed |
| Implementation roadmap | DRAFT COMPLETE | Cursor tasks must be generated from designed screens |
| Code | NOT STARTED | New V2 code must remain isolated |

## Product freeze gates

Implementation must not start before the relevant gates are accepted.

### Gate G0 — Scope freeze

- [ ] Confirm only Brand and Shop are user roles.
- [ ] Confirm production/PLM/QC are outside MVP.
- [ ] Confirm core flow: Campaign → Collection → Showroom → Selection → Order → Confirmation.
- [ ] Confirm Calendar and DealSpace are core, not optional add-ons.
- [ ] Confirm WFX is a functional Virtual Showroom reference, not a reason to add PLM/ERP/MES into MVP.

### Gate G1 — Navigation freeze

- [ ] Approve Brand navigation.
- [ ] Approve Shop navigation.
- [ ] Approve Registry / Entity / Builder / Showroom / Split Communication templates.
- [ ] Approve iPhone, iPad and MacBook support model.
- [ ] Approve first vertical-slice routes and transitions.

### Gate G2 — Domain freeze

- [ ] Confirm entity IDs and naming.
- [ ] Confirm order/version/revision lifecycle.
- [ ] Confirm collection release immutability.
- [ ] Confirm price and currency snapshot rules.
- [ ] Confirm tenant and audience access model.
- [ ] Confirm Buyer Preview and Shop Showroom use the same access/pricing resolver.
- [ ] Confirm Selection → Order mapping preserves source references.

### Gate G3 — UX foundation freeze

- [ ] Approve warm neutral palette and restrained dark green accent.
- [ ] Approve Inter as operational font.
- [ ] Approve optional Source Serif 4 only for buyer-facing editorial hero.
- [ ] Approve typography scales for MacBook, iPad and iPhone.
- [ ] Approve AppShell dimensions.
- [ ] Approve button/input/table dimensions.
- [ ] Approve card radii and elevation limits.
- [ ] Approve mandatory 390/768/1024/1440/1728 viewport review.
- [ ] Approve mobile Order Builder as guided flow, not compressed matrix.
- [ ] Approve `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` as canonical visual narrative.
- [ ] Approve both machine-readable design-system contracts.

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

### Gate G5 — First Screen Bible slice

Completed specifications:

- [x] BR-002 Campaign Registry;
- [x] BR-003 Campaign Overview;
- [x] BR-009 Collection Overview;
- [x] BR-013 Showroom Composer;
- [x] BR-014 Buyer Preview;
- [x] SH-006 Collection Showroom;
- [x] SH-008 Selection;
- [x] SH-012 Order Builder.

Before implementation tasks are marked ready:

- [ ] owner review of all eight specs;
- [ ] route/data contract consistency check against Domain Model and API Bible;
- [ ] component dependency map;
- [ ] task decomposition and estimates;
- [ ] wireframe/screenshot reference for each canonical layout at 1440 and 390 widths.

## First vertical-slice package

Location:

```text
docs/screens/vertical-slice-01/
```

Flow:

```text
Campaign Registry
→ Campaign Overview
→ Collection Overview
→ Showroom Composer
→ Buyer Preview
→ Shop Collection Showroom
→ Selection
→ Order Builder
```

Each screen specification includes:

- user goal and route;
- data/view model contract;
- layout and controls;
- state/permission rules;
- keyboard and touch paths;
- responsive adaptation;
- analytics events;
- acceptance criteria;
- non-goals.

## WFX decisions

Verified source document:

```text
docs/15_WFX_REFERENCE_AND_ADAPTATION.md
```

Included in product direction:

- private buyer showrooms;
- buyer-specific assortment, content, pricing and promotions;
- secure invitation links;
- high-resolution media and HD video;
- shoppable looks/lookbooks and digital linesheets;
- contextual buyer feedback;
- showroom analytics;
- PLM/ERP integration ports.

Excluded from wholesale MVP:

- PLM execution;
- BOM/tech packs;
- sourcing and costing;
- ERP/accounting;
- MES/factory management;
- traceability execution.

## Canonical visual decisions currently proposed

```text
Theme:                    light in MVP
Canvas:                   warm neutral #F6F5F2
Operational surface:     white #FFFFFF
Text:                     restrained graphite #171716
Accent:                   restrained dark green #263F3A
Operational font:         Inter
Editorial font:           Source Serif 4, hero only
Minimum touch:            44 × 44 px
Operational card radius:  6–12 px
Editorial card radius:    16 px maximum
Accessibility:            WCAG 2.2 AA
```

Exact values are owned by `design-system/tokens.json`, not this status summary.

## Recommended next work

1. Review and freeze G0–G3 decisions.
2. Run a consistency pass across the eight screen data contracts, Domain Model and API Bible.
3. Generate atomic Cursor tasks for the first slice from `docs/12_CURSOR_TASK_TEMPLATE.md`.
4. Create component dependency order:
   - design tokens;
   - primitives;
   - AppShell;
   - Registry/Entity/Builder/Showroom layouts;
   - DataTable/ProductCard/SelectionTray/MatrixEditor;
   - screen routes.
5. Write companion implementation specs that the slice depends on but which were not in the requested screen chain:
   - campaign create/edit flow;
   - collection product management/import;
   - publish review/access grant;
   - authentication/invitation acceptance;
   - Order Validation.
6. Decide runtime/framework, persistence and test infrastructure through ADRs.
7. Only then start code.

## First implementation milestone

**Milestone M1 — Buyer-ready collection**

A Brand user can:

- create/open campaign;
- create/open collection;
- add valid commercial products through companion flows;
- compose presentation;
- preview exact buyer experience;
- publish through companion Publish Review.

A Shop user can:

- enter through valid access;
- open the showroom;
- browse story/grid/looks/linesheet;
- create and review a Selection.

## Second implementation milestone

**Milestone M2 — Best-in-class Order Writing**

A Shop user can:

- convert Selection to Order draft;
- enter size/colour quantities;
- use paste and size curves;
- split by delivery;
- see real-time totals and budget;
- resolve MOQ/pack conflicts;
- reach Order Validation.

## Blockers that must not be hidden

- No runtime/framework ADR has been committed for V2.
- No database schema or migration exists for V2.
- JOOR/NuORDER/other competitor matrix is not fully verified yet.
- The eight requested screen specs are complete, but companion create/import/publish/access/validation screens remain to be specified.
- No approved wireframe/screenshot reference set is stored yet.
- Design tokens are specified but not implemented in runtime code.
- No Cursor implementation tasks have been generated from the new Screen Bible yet.

## Rule

Status can move to `IMPLEMENTING` only when the relevant gate, screen specification, companion dependency and Cursor task are complete. Speed without frozen requirements recreates the fragmentation this V2 project is intended to eliminate.
