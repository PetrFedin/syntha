# Syntha Wholesale V2 — Status

Last structured update: 2026-07-15

## 1. Current state

| Area | Status | Notes |
|---|---|---|
| Product scope | DEFINED | Brand + Shop; Campaign, Showroom, Buying, Orders, DealSpace, Calendar |
| Product canon | DRAFT COMPLETE | Requires owner freeze |
| Information architecture | DRAFT COMPLETE | Navigation/routes require owner sign-off |
| Functional map | DRAFT COMPLETE | P0/P1/P2 catalogue exists |
| Master Capability Map | DRAFT COMPLETE | Capability IDs, owners, roles, entities, permissions, dependencies and references defined |
| Domain model | DRAFT COMPLETE | Requires schema/ID/Money/runtime ADR decisions |
| Entity/State map | DRAFT COMPLETE | Ownership, cardinality, lifecycle and lineage defined |
| Role & Permission Matrix | DRAFT COMPLETE | Presets, scopes, state and field-level restrictions defined |
| Workflow Catalog | DRAFT COMPLETE | WF-001–WF-022 defined |
| Screen/Function/API Matrix | DRAFT COMPLETE | Key screens mapped to queries, commands, events and components |
| Event/Notification Catalog | DRAFT COMPLETE | Domain/Audit/Analytics/Realtime separation and taxonomy defined |
| Integration Blueprint | DRAFT COMPLETE | Source-of-truth, adapters, sync, conflicts and observability defined |
| UX constitution | DRAFT COMPLETE | Core interaction rules defined |
| Responsive visual system | DRAFT COMPLETE | iPhone, iPad, MacBook and fullscreen rules written |
| Machine design tokens | DRAFT COMPLETE | `design-system/tokens.json` aligned |
| Responsive contract | DRAFT COMPLETE | `design-system/responsive-contract.json` aligned |
| Component library | DRAFT COMPLETE | Runtime implementation not started |
| API Bible | DRAFT COMPLETE | Requires consistency pass and runtime decision |
| Security/data | DRAFT COMPLETE | Legal/retention decisions pending |
| Competitor reference cards | IN PROGRESS / VERIFIED BY SOURCE | JOOR, NuORDER, WFX, Brandboom, RepSpark, Faire; Le New Black detailed verification pending |
| WFX adaptation | VERIFIED DRAFT | Showroom capabilities mapped; PLM/ERP/MES excluded from wholesale core |
| First vertical-slice core screens | DESIGNED | 8 detailed screen files |
| First vertical-slice companion screens | DESIGNED | 6 detailed dependency files |
| Machine traceability | CREATED | 14 first-slice screens mapped in JSON |
| Implementation roadmap | DRAFT COMPLETE | Must be normalized to capability/workflow task model |
| Cursor task queue | INDEX ONLY | Atomic files not generated yet |
| Runtime code | NOT STARTED | V2 remains documentation/design stage |

## 2. Product freeze gates

Implementation starts only after relevant gates are accepted.

### Gate G0 — Scope freeze

- [ ] Confirm only Brand and Shop are product sides.
- [ ] Confirm Production/PLM/BOM/QC/MES/accounting are outside wholesale MVP.
- [ ] Confirm core flow: Campaign → Collection → Showroom → Selection → Order → Confirmation.
- [ ] Confirm Calendar, Appointments and DealSpace are core.
- [ ] Confirm competitor features enter only through ADOPT/IMPROVE/LATER/EXCLUDE decision.
- [ ] Confirm WFX is a Virtual Showroom reference, not a reason to add its full enterprise suite.

### Gate G1 — Navigation and route freeze

- [ ] Approve Brand navigation.
- [ ] Approve Shop navigation.
- [ ] Approve Registry / Entity / Builder / Showroom / Split / Focus templates.
- [ ] Approve first-slice routes and transitions.
- [ ] Approve contextual DealSpace instead of detached generic messenger.
- [ ] Approve iPhone, iPad and MacBook support model.

### Gate G2 — Domain and state freeze

- [ ] Confirm entity IDs and naming.
- [ ] Confirm aggregate/read-model classification.
- [ ] Confirm Campaign state machine.
- [ ] Confirm CollectionVersion/ShowroomRelease immutability.
- [ ] Confirm OrderVersion/revision/confirmation state machine.
- [ ] Confirm Money/currency snapshot rules.
- [ ] Confirm tenant and audience access model.
- [ ] Confirm Buyer Preview and Shop Showroom use one resolver.
- [ ] Confirm Showroom → Selection → Order source lineage.
- [ ] Confirm archive/delete rules.

### Gate G3 — Roles and security freeze

- [ ] Approve Brand role presets.
- [ ] Approve Shop role presets.
- [ ] Approve assignment scopes: all/team/assigned/participant/relationship/self.
- [ ] Approve field-level internal/shared visibility.
- [ ] Approve server authorization algorithm.
- [ ] Approve audit requirements.
- [ ] Approve invitation/access grant security.
- [ ] Approve private Shop notes never visible to Brand.

### Gate G4 — UX and visual foundation freeze

- [ ] Approve warm neutral palette and dark green accent.
- [ ] Approve Inter and optional Source Serif 4 hero use.
- [ ] Approve typography and component dimensions.
- [ ] Approve AppShell and responsive navigation.
- [ ] Approve DataTable/mobile-list transformation.
- [ ] Approve ProductCard/media ratios.
- [ ] Approve BuilderShell and Order Matrix.
- [ ] Approve Showroom shell and SelectionTray.
- [ ] Approve DealSpace split layout.
- [ ] Approve Calendar structure.
- [ ] Approve all universal states.
- [ ] Approve mandatory 390/768/1024/1440/1728 review.

### Gate G5 — Implementation Blueprint freeze

- [ ] Review Master Capability Map.
- [ ] Review Role & Permission Matrix.
- [ ] Review Entity/State Map.
- [ ] Review Workflow Catalog.
- [ ] Review Screen/Function/API Matrix.
- [ ] Review Event/Notification Catalog.
- [ ] Review Integration Blueprint.
- [ ] Review Competitor Reference Cards.
- [ ] Approve Cursor Implementation Contract.
- [ ] Confirm every P0 capability has owner, permission, entity, workflow and priority.

### Gate G6 — First Screen Bible slice

Core specifications completed:

- [x] BR-002 Campaign Registry.
- [x] BR-003 Campaign Overview.
- [x] BR-009 Collection Overview.
- [x] BR-013 Showroom Composer.
- [x] BR-014 Buyer Preview.
- [x] SH-006 Collection Showroom.
- [x] SH-008 Selection.
- [x] SH-012 Order Builder.

Companion specifications completed:

- [x] BR-002A Campaign Create/Edit.
- [x] BR-004 Campaign Buyers & Access Grants.
- [x] BR-010 Collection Product Management & Import.
- [x] BR-015 Publish Review.
- [x] SY-003 Invitation Acceptance.
- [x] SH-013 Order Validation & Submit.

Before screen tasks become `READY`:

- [ ] owner review of all 14 specs;
- [ ] traceability consistency check;
- [ ] route/data contract consistency against Domain/API Bible;
- [ ] component dependency map;
- [ ] runtime/persistence ADRs;
- [ ] wireframe/reference screenshots at 1440 and 390;
- [ ] atomic task files and estimates.

## 3. First vertical-slice package

Location:

```text
docs/screens/vertical-slice-01/
```

Full chain:

```text
Campaign Registry
→ Campaign Create/Edit
→ Campaign Overview
→ Collection Product Management/Import
→ Collection Overview
→ Showroom Composer
→ Campaign Buyers & Access
→ Buyer Preview
→ Publish Review
→ Invitation Acceptance
→ Shop Collection Showroom
→ Selection
→ Order Builder
→ Order Validation & Submit
```

Machine mapping:

```text
docs/implementation-blueprint/traceability-first-slice.json
```

Every screen specification includes:

- Capability and Workflow IDs;
- role/route/user goal;
- view model and commands;
- entities/states;
- permissions/visibility;
- layout/components;
- responsive/keyboard/touch;
- events/analytics/audit;
- states/errors/conflicts;
- acceptance criteria/non-goals.

## 4. Implementation Blueprint

Location:

```text
docs/implementation-blueprint/
```

Canonical chain:

```text
Capability
→ Role / Permission
→ Entity / State
→ Workflow
→ Screen
→ Query / Command / API
→ Event / Notification
→ Integration effect
→ Cursor Task
```

A function without Capability ID cannot be implemented.

## 5. Competitor direction

### Included direction

- JOOR: network, linesheets, ordering, integration architecture.
- NuORDER: account-specific selling, visual assortment and team buying.
- WFX: personalised secure showroom, rich media, feedback and analytics.
- Brandboom: fast linesheet creation, seller activity/action signals.
- RepSpark: persistent ordering, custom assortment, size-run and retailer access.
- Le New Black: restrained fashion-native presentation direction.
- Faire: discovery and contextual retailer-brand communication; transaction operator functions excluded from P0.

### Explicit exclusions from initial core

- marketplace credit underwriting;
- platform-owned fulfilment/returns/claims;
- commissions and royalty management;
- licensing workflows;
- production PLM/MES;
- accounting ledger;
- deep 3D/VR before core order flow.

## 6. Canonical technical/product decisions proposed

```text
Sides:                     Brand + Shop
Theme:                     light MVP
Canvas:                    #F6F5F2
Surface:                   #FFFFFF
Text:                      #171716
Accent:                    #263F3A
Operational font:          Inter
Editorial font:            Source Serif 4 hero only
Minimum touch:             44 × 44 px
Accessibility:             WCAG 2.2 AA
Published release:         immutable
Submitted order version:   immutable
Confirmed order version:   immutable
Buyer pricing/access:      server resolver
UI data access:            application/API only
External systems:          ports/adapters only
```

Exact visual values are owned by design-system contracts.

## 7. Immediate next work

1. Run an automated/manual consistency pass across:
   - Capability Map;
   - traceability JSON;
   - Screen Bible;
   - Domain Model;
   - API Bible;
   - Security and Event Catalog.
2. Create ADRs:
   - runtime/framework;
   - database/persistence;
   - authentication/session;
   - event/outbox/realtime;
   - frontend data/query state;
   - test infrastructure;
   - file/media storage.
3. Build component dependency graph.
4. Create first atomic Cursor task files with full metadata.
5. Create wireframe reference package for Registry, Entity, Builder, Showroom and Review layouts.
6. Only then start code with Foundation and Design System tasks.

## 8. Recommended task execution sequence

```text
Foundation / repository boundary
→ Runtime and ADR decisions
→ Design tokens
→ UI primitives
→ AppShell and layouts
→ Authentication / organisation context
→ Permissions foundation
→ Campaign domain/create/registry/overview
→ Product/import/collection domain
→ Showroom composer/preview/publish
→ Invitation/access resolver
→ Shop showroom/selection
→ Order domain/builder/validation/submit
→ Brand order review/revision/confirm
→ DealSpace
→ Calendar/Appointments
→ Analytics/Integrations
```

## 9. Blockers that must remain visible

- Runtime/framework ADR not approved.
- Database schema/migration not created.
- Authentication provider/session model not approved.
- Event/outbox/realtime architecture not approved.
- First-slice contracts have not completed owner consistency review.
- Atomic Cursor task files do not yet exist.
- Wireframe/screenshot reference set is not stored.
- Design tokens/components are specified but not implemented.
- Le New Black detailed current capability verification remains incomplete.
- Legal/retention/payment decisions remain open for later modules.

## 10. Rule

Status moves to `IMPLEMENTING` only when:

```text
relevant gate accepted
+ capability/workflow/screen traceability complete
+ screen status READY
+ ADR dependencies approved
+ atomic Cursor task READY
```

Speed without these conditions recreates the fragmentation V2 is intended to eliminate.
