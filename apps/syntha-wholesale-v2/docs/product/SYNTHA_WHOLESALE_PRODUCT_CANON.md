# Syntha Wholesale V2 — Product Canon

Status: QA
Version: 1.0
Updated: 2026-07-22

## Product boundary

Syntha Wholesale V2 is an independent B2B wholesale operating environment for brands and retail organisations. It owns the commercial lifecycle from collection publication to confirmed order and collaborative execution. It does not reuse Legacy UI, routes, services or mutable business state.

Production planning, BOM, technical design, quality control and supply-chain execution are outside the MVP. They may connect later through explicit integration contracts.

## Canonical lifecycle

`Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace`

Calendar, availability, account policy, analytics and integrations support this lifecycle rather than replacing it.

## Organisation model

- `BRAND` and `SHOP` are organisation types.
- Users may belong to multiple organisations and always act through an active organisation.
- Permissions are evaluated server-side from membership, organisation type, relationship, assignment and entity state.
- Brand-private and Shop-private data are never included in the other party's projection.

## MVP module ownership

| Module | Primary responsibility | Capabilities |
|---|---|---|
| `identity-access` | authentication, membership, active organisation, permissions | WSC-018 |
| `organisations` | Brand and Shop identity, legal/commercial profile | foundation |
| `accounts` | buyer account CRM, contacts, notes and relationship status | WSC-008 |
| `commercial-policy` | assortments, price lists, terms, currency, tax and regional policy | WSC-002, WSC-017 |
| `catalog` | products, variants, media, enrichment and data quality | WSC-012 |
| `campaigns` | selling periods and commercial milestones | lifecycle foundation |
| `collections` | seasonal product grouping and publication state | lifecycle foundation |
| `showroom` | digital showroom, linesheets and buyer presentation | WSC-001 |
| `selection` | visual planning, budget, shortlist and size-curve intent | WSC-003 |
| `availability` | ATS, preorder, delivery windows and allocation projection | WSC-005 |
| `order-builder` | size curves, packs, quantities, bulk actions and validation | WSC-004 |
| `orders` | submit, approve, amend, confirm, snapshot and audit | WSC-006 |
| `reorder` | immediate and repeat-order flows | WSC-014 |
| `dealspace` | comments, files, decisions and shared execution history | WSC-016 |
| `calendar` | appointments, deadlines and trade-show mode | WSC-015 |
| `analytics` | sell-in, conversion, assortment and order performance | WSC-013 |
| `integrations` | ERP, PIM, PLM, accounting and ecommerce ports/adapters | WSC-011 |
| `notifications` | deduplicated delivery of product and business notifications | cross-cutting |

## Core workflows

### WF-001 — Access and organisation context

Screens: sign-in, organisation chooser, access denied, membership administration.
Commands: `AuthenticateUser`, `SwitchActiveOrganisation`, `InviteMember`, `ChangeMembershipPermissions`.
Events: `UserAuthenticated`, `ActiveOrganisationChanged`, `MemberInvited`, `MembershipPermissionsChanged`.
Permissions: `identity.session.use`, `organisation.members.read`, `organisation.members.manage`.

### WF-002 — Account and commercial onboarding

Screens: accounts list, account workspace, contacts, policy editor, price-list assignment.
Commands: `CreateAccount`, `AddAccountContact`, `AssignCommercialPolicy`, `ApproveAccountAccess`.
Events: `AccountCreated`, `AccountContactAdded`, `CommercialPolicyAssigned`, `AccountAccessApproved`.
Permissions: `accounts.read`, `accounts.manage`, `commercial-policy.read`, `commercial-policy.manage`.

### WF-003 — Catalog, collection and showroom publication

Screens: catalog, product editor, collection workspace, showroom editor, publication preview.
Commands: `CreateProduct`, `PublishProduct`, `CreateCollection`, `PublishCollection`, `PublishShowroom`.
Events: `ProductCreated`, `ProductPublished`, `CollectionPublished`, `ShowroomPublished`.
Permissions: `catalog.read`, `catalog.manage`, `collection.manage`, `showroom.publish`.

### WF-004 — Buyer access and selection planning

Screens: showroom browser, product detail, visual board, budget panel, size-curve planner.
Commands: `GrantShowroomAccess`, `AddSelectionItem`, `SetSelectionBudget`, `SetSelectionSizeCurve`.
Events: `ShowroomAccessGranted`, `SelectionItemAdded`, `SelectionBudgetChanged`, `SelectionSizeCurveChanged`.
Permissions: `showroom.view`, `selection.read`, `selection.manage`.

### WF-005 — Order build, submission and confirmation

Screens: order builder, validation summary, approval queue, order detail, amendment comparison.
Commands: `CreateOrderDraft`, `SetOrderLineQuantity`, `SubmitOrder`, `ApproveOrder`, `RequestOrderAmendment`, `ConfirmOrder`.
Events: `OrderDraftCreated`, `OrderLineQuantityChanged`, `OrderSubmitted`, `OrderApproved`, `OrderAmendmentRequested`, `OrderConfirmed`.
Permissions: `order.read`, `order.draft.manage`, `order.submit`, `order.approve`, `order.confirm`.

### WF-006 — DealSpace collaboration

Screens: DealSpace timeline, comments, files, decisions and activity history.
Commands: `PostDealMessage`, `AttachDealFile`, `RecordDealDecision`, `ResolveDealAction`.
Events: `DealMessagePosted`, `DealFileAttached`, `DealDecisionRecorded`, `DealActionResolved`.
Permissions: `dealspace.read`, `dealspace.collaborate`, `dealspace.manage`.

### WF-007 — Availability and reorder

Screens: availability view, delivery windows, reorder builder and allocation warnings.
Commands: `PublishAvailabilitySnapshot`, `CreateReorderDraft`, `SubmitReorder`.
Events: `AvailabilitySnapshotPublished`, `ReorderDraftCreated`, `ReorderSubmitted`.
Permissions: `availability.read`, `availability.publish`, `reorder.manage`.

### WF-008 — Calendar, analytics and integrations

Screens: calendar, appointment detail, wholesale dashboard, integration status.
Commands: `CreateAppointment`, `RescheduleAppointment`, `RegisterIntegrationConnection`, `RequestIntegrationSync`.
Events: `AppointmentCreated`, `AppointmentRescheduled`, `IntegrationConnectionRegistered`, `IntegrationSyncRequested`.
Permissions: `calendar.read`, `calendar.manage`, `analytics.read`, `integration.manage`.

## Capability decisions

| ID | Decision | Phase | Syntha interpretation |
|---|---|---|---|
| WSC-001 | ADOPT | MVP | Native digital showrooms and linesheets. |
| WSC-002 | ADAPT | MVP | Account-specific policy is separated from catalog data. |
| WSC-003 | ADAPT | MVP | Selection combines visual planning, budget and size intent. |
| WSC-004 | ADOPT | MVP | Matrix order writing, packs and bulk quantity operations. |
| WSC-005 | ADAPT | MVP | Availability is a projection with source ownership and timestamps. |
| WSC-006 | ADOPT | MVP | Versioned amendments, approvals, confirmations and immutable snapshots. |
| WSC-007 | ADAPT | POST-MVP | Payment orchestration follows confirmed commercial scope. |
| WSC-008 | ADAPT | MVP | Account CRM stays wholesale-specific, not a generic CRM suite. |
| WSC-009 | DEFER | POST-MVP | Territories, commissions and offline selling after core order adoption. |
| WSC-010 | ADAPT | POST-MVP | Network discovery only after bilateral account controls are stable. |
| WSC-011 | ADOPT | MVP foundation | Ports and contracts first; no external internals in business modules. |
| WSC-012 | ADOPT | MVP | Product/variant/media quality with explicit publication readiness. |
| WSC-013 | ADAPT | MVP | Decision-grade sell-in and workflow performance metrics. |
| WSC-014 | ADOPT | MVP | Reorder is distinct from seasonal preorder but shares order contracts. |
| WSC-015 | ADAPT | MVP | Calendar is tied to campaigns, showrooms, accounts and orders. |
| WSC-016 | ADAPT | MVP | DealSpace is the shared history and decision layer around an order. |
| WSC-017 | ADOPT | MVP | Currency, tax, locale and regional terms belong to commercial policy. |
| WSC-018 | ADOPT | MVP foundation | Server-side organisation and field-level authorization. |
| WSC-019 | DEFER | POST-MVP | Returns and claims after confirmed-order operations are stable. |
| WSC-020 | EXCLUDE | out of scope | Production, BOM, QC and supply-chain execution remain external. |

## Quality and acceptance rules

- Published showrooms, submitted orders and confirmed orders use immutable snapshots.
- Every write command defines permission, expected version, idempotency and audit behavior where applicable.
- Every protected use case has positive and negative authorization tests.
- Analytics events never replace domain facts or audit history.
- External integration failure never silently changes the source of truth.
- No competitor workflow is copied verbatim; Syntha terminology and lifecycle remain canonical.

## Deferred revisit conditions

Payments, sales operations, marketplace/network and after-sales modules may enter scope only after the core order lifecycle has production usage metrics, tenant-isolation evidence and named product ownership.
