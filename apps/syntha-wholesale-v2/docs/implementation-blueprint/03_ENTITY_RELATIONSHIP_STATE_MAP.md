# 03 — Entity Relationship & State Map

## 1. Назначение

Документ определяет:

- канонические сущности;
- владельца данных;
- cardinality;
- lifecycle;
- immutable snapshots;
- source lineage;
- правила удаления/архивирования;
- связи между Brand и Shop.

Cursor не создаёт отдельную сущность только потому, что нужен новый экран. Экран использует существующий aggregate/read model.

---

# 2. Верхнеуровневый граф

```text
User
 └─ Membership ── Organisation (Brand | Shop)

Brand Organisation
 ├─ SalesCampaign
 │   ├─ Collection
 │   │   ├─ CollectionVersion
 │   │   ├─ CollectionProduct ── Product ── ProductVariant
 │   │   ├─ Look
 │   │   ├─ StoryBlock
 │   │   └─ Showroom
 │   │       ├─ ShowroomRelease
 │   │       └─ ShowroomSession
 │   ├─ CampaignAccessGrant ── Shop Organisation
 │   ├─ CampaignInvitation
 │   ├─ Appointment
 │   ├─ CalendarEvent
 │   └─ CampaignTarget
 ├─ PriceList ── PriceListItem
 ├─ DeliveryWindow
 ├─ PackRule
 └─ BuyerRelationship ── Shop Organisation

Shop Organisation
 ├─ BuyingWorkspace
 │   ├─ Selection
 │   │   └─ SelectionItem
 │   ├─ ComparisonSet
 │   └─ BudgetPlan ── BudgetAllocation
 ├─ Store
 └─ Order
     ├─ OrderVersion
     │   ├─ OrderLine
     │   └─ OrderDeliverySplit
     ├─ OrderSuggestion
     └─ OrderApproval

Brand + Shop
 └─ DealSpace
     ├─ ConversationThread
     │   └─ Message
     ├─ Task
     ├─ DocumentLink
     └─ ActivityEvent
```

---

# 3. Ownership model

| Entity | Owning organisation | Shared with counterparty | Mutable after final state |
|---|---|---|---|
| Organisation | self | public/profile fields only | yes by policy |
| TradingRelationship | Brand+Shop logical pair | both | status-limited |
| SalesCampaign | Brand | only through grant | archived read-only |
| CampaignAccessGrant | Brand, references Shop | Shop reads effective grant | yes until revoked/expired |
| Collection | Brand | published release only | draft mutable |
| CollectionVersion | Brand | published snapshot | published immutable |
| Product | Brand | resolved buyer view | yes; snapshots preserve history |
| PriceList | Brand | resolved assigned prices only | versioned/active rules |
| Showroom | Brand | granted Shop | draft mutable |
| ShowroomRelease | Brand | granted Shop | immutable |
| ShowroomSession | Shop/user context | Brand sees permitted analytics only | append/update session state |
| BuyingWorkspace | Shop | not shared by default | yes |
| Selection | Shop | not shared until explicit action/policy | yes until converted/archive |
| PrivateNote | creator organisation | no | retention policy |
| Order | Brand+Shop parties | both after shared/submitted | state-limited |
| OrderVersion | creating party, shared by order state | both when submitted/shared | immutable when submitted/confirmed |
| DealSpace | relationship pair | both participants | status-limited |
| InternalThread | one organisation | no | retention policy |
| CalendarEvent | creating organisation | by visibility | state-limited |
| Appointment | Brand+Shop pair | both | proposals/versioned changes |

---

# 4. Identity and relationship invariants

## 4.1 Organisation

```text
Organisation.type = brand | shop
```

- type immutable;
- organisation cannot act simultaneously as Brand and Shop in same membership context;
- every request has one active organisation;
- all owned entities carry `ownerOrganisationId` or explicit party IDs.

## 4.2 TradingRelationship

```text
BrandOrganisation 1 ── 0..* TradingRelationship 0..* ── 1 ShopOrganisation
```

Invariants:

- one active relationship per Brand+Shop pair;
- relationship status: `pending | active | suspended | ended`;
- `active` relationship does not automatically expose all campaigns;
- showroom access additionally requires explicit Campaign/Collection grant;
- suspension blocks new shared actions but preserves audit/history;
- ended relationship keeps confirmed order history readable according to retention policy.

## 4.3 CampaignAccessGrant

Grant is the effective commercial access contract.

Fields resolve:

```text
shopOrganisationId
campaignId
visibleCollectionIds | all
productVisibilityRules
priceListId
currency
commercialTermOverrides
orderDeadline
language
market
accessStartsAt
accessExpiresAt
assignedSalesUserId
status
```

Invariants:

- no grant → no buyer showroom access;
- revoked/expired grant invalidates session access immediately;
- price list resolved server-side;
- one Shop never receives another Shop’s resolved price context;
- preview and real showroom use the same resolver.

---

# 5. Sales Campaign aggregate

## 5.1 Cardinality

```text
Brand 1 ── * SalesCampaign
SalesCampaign 1 ── * Collection
SalesCampaign 1 ── * CampaignAccessGrant
SalesCampaign 1 ── * Appointment
SalesCampaign 1 ── * CalendarEvent
```

## 5.2 State machine

```text
DRAFT
  ├─ schedule → SCHEDULED
  ├─ activate → ACTIVE
  └─ archive → ARCHIVED

SCHEDULED
  ├─ activate automatically/manually → ACTIVE
  ├─ return_to_draft → DRAFT
  └─ archive → ARCHIVED

ACTIVE
  ├─ begin_closing → CLOSING
  ├─ complete → COMPLETED
  └─ emergency_archive → ARCHIVED (admin + reason)

CLOSING
  ├─ reactivate → ACTIVE
  └─ complete → COMPLETED

COMPLETED
  └─ archive → ARCHIVED

ARCHIVED
  └─ restore → previous eligible state (admin policy)
```

Rules:

- active campaign must have at least one published showroom/collection release;
- end date cannot precede start date;
- campaign default currency is not allowed to silently change submitted order currency;
- deadline changes after invitation generate notification/audit;
- archive never deletes collections/orders.

---

# 6. Collection aggregate

## 6.1 Cardinality

```text
Campaign 1 ── * Collection
Collection 1 ── * CollectionVersion
Collection 1 ── * CollectionProduct
Collection 1 ── * Look
Collection 1 ── * StoryBlock
Collection 1 ── 1 Showroom draft
Collection 1 ── * ShowroomRelease
```

## 6.2 Collection states

```text
draft → incomplete → ready → published → closed → archived
```

State meaning:

- `draft`: initial editable state;
- `incomplete`: readiness contains blocking issues;
- `ready`: all blockers resolved, publish allowed;
- `published`: at least one live immutable release;
- `closed`: no new selection/order initiation, existing orders remain;
- `archived`: read-only historical state.

Collection status is a summary; versions carry their own state.

## 6.3 CollectionVersion

```text
draft → published → superseded
```

- exactly one current draft may be editable per collection unless explicit branch/scenario feature is introduced;
- published version immutable;
- new edits after publish create/update draft based on published snapshot;
- publish creates a new immutable snapshot and marks previous published version `superseded` when replaced;
- existing orders retain references to original product/price/release snapshots.

## 6.4 Readiness result

```ts
type ReadinessResult = {
  collectionId: string;
  versionId: string;
  blockingIssues: ReadinessIssue[];
  warnings: ReadinessIssue[];
  calculatedAt: string;
  fingerprint: string;
};
```

Readiness fingerprint must match expected publish version.

---

# 7. Product, variant and commercial snapshot

## 7.1 Product hierarchy

```text
Product
 ├─ ProductVariant (colourway)
 │   ├─ media
 │   ├─ availability
 │   └─ PriceListItem
 └─ SizeScale reference through CollectionProduct/Variant policy
```

`Product` is a reusable Brand catalogue entity.

`CollectionProduct` is contextual:

- display order;
- buyer description;
- delivery windows;
- size scale;
- MOQ/pack;
- availability state;
- drop/capsule;
- highlight flags.

## 7.2 Snapshot rule

When creating:

- published release;
- submitted order version;
- confirmed order version;

system stores a reproducible commercial snapshot:

```text
product identity
variant/colour
size scale
buyer-facing description
unit wholesale price
currency
suggested retail price when permitted
MOQ/pack
commercial terms
delivery window
media references required for history
```

Later catalogue changes do not rewrite historical snapshots.

---

# 8. Showroom aggregate

## 8.1 Draft and release

```text
ShowroomDraft
 ├─ presentationConfig
 ├─ ordered blocks
 ├─ allowed modes
 └─ theme references

publish
 ↓

ShowroomRelease (immutable)
 ├─ collectionVersionId
 ├─ presentation snapshot
 ├─ audience rules reference
 ├─ release number
 └─ effective dates
```

## 8.2 State machine

```text
draft → scheduled → live → closed
```

- `scheduled` release can be cancelled before activation;
- `live` content is immutable;
- `closed` removes new access but preserves session/order history;
- unpublish does not delete release; it closes access and records event.

## 8.3 ShowroomSession

One session belongs to:

```text
showroomReleaseId
shopOrganisationId
userId
accessGrantId
```

Session persists:

- last position;
- selected presentation mode;
- filters/sort where safe;
- last active time;
- source (invitation/appointment/direct);
- completion state.

Private notes live outside Brand-visible session analytics.

---

# 9. Product interaction lineage

```text
ProductInteraction
  source: showroomSession
  target: collectionProduct/variant
  type: view | favourite | shortlist | skip | compare | add_to_selection | note
```

Lineage:

```text
ShowroomRelease
→ ShowroomSession
→ ProductInteraction
→ SelectionItem
→ OrderLine
→ OrderVersion
```

Each conversion preserves IDs:

```text
sourceShowroomReleaseId
sourceSessionId
sourceInteractionId?
sourceSelectionId
sourceSelectionItemId
sourceCollectionProductId
sourceProductSnapshotId
```

No manual rematching by style code is allowed inside normal flow.

---

# 10. BuyingWorkspace and Selection

## 10.1 Cardinality

```text
Shop 1 ── * BuyingWorkspace
BuyingWorkspace 1 ── * Selection
Selection 1 ── * SelectionItem
BuyingWorkspace 1 ── 0..1 BudgetPlan
```

A workspace may span one campaign and multiple Brand collections according to future scope. P0 selection is collection/brand-contextual.

## 10.2 Selection states

```text
draft → review → approved → converted_to_order → archived
```

- `draft`: editable decisions;
- `review`: internal team review;
- `approved`: eligible to create order;
- `converted_to_order`: source remains readable; order contains lineage;
- `archived`: historical.

## 10.3 SelectionItem decision

```text
undecided | shortlisted | approved | excluded
```

Rules:

- decision is Shop internal unless explicitly shared;
- `excluded` reason private by default;
- quantity intent is not an order quantity until conversion;
- removing an item after conversion does not mutate existing order lines;
- selection can be copied to a new scenario only in P1.

---

# 11. Order aggregate

## 11.1 Parties and references

```text
Order
 ├─ brandOrganisationId
 ├─ shopOrganisationId
 ├─ tradingRelationshipId
 ├─ campaignId
 ├─ collectionIds[]
 ├─ priceListId
 ├─ currency
 ├─ currentVersionId
 └─ dealSpaceId
```

## 11.2 State machine

```text
DRAFT
  ├─ request_internal_review → INTERNAL_REVIEW
  ├─ submit → SUBMITTED
  └─ cancel → CANCELLED

INTERNAL_REVIEW
  ├─ approve → DRAFT/ready-to-submit marker
  ├─ return → DRAFT
  └─ submit_by_authorised → SUBMITTED

SUBMITTED
  ├─ begin_brand_review → BRAND_REVIEW
  ├─ propose_revision → CHANGES_REQUESTED
  ├─ confirm → CONFIRMED
  └─ withdraw (policy) → DRAFT/withdrawn version

BRAND_REVIEW
  ├─ propose_revision → CHANGES_REQUESTED
  └─ confirm → CONFIRMED

CHANGES_REQUESTED
  ├─ shop_creates_draft_version → CHANGES_REQUESTED
  └─ resubmit → RESUBMITTED

RESUBMITTED
  ├─ propose_revision → CHANGES_REQUESTED
  └─ confirm → CONFIRMED

CONFIRMED
  ├─ close → CLOSED
  └─ amendment later → separate amendment flow

CANCELLED/CLOSED
  read-only
```

## 11.3 OrderVersion

States:

```text
draft | submitted | superseded | confirmed
```

Rules:

- one editable draft version at a time per active editing branch;
- submitted version immutable;
- revision proposal is a patch against explicit `baseVersionId`;
- accepted revision creates a new draft/submitted version, never overwrites base;
- totals calculated by server/domain service;
- currency and price snapshot immutable after submit.

## 11.4 OrderLine

Identity key is not only product ID. A distinct line is determined by:

```text
productVariantId
+ deliveryWindowId
+ optional store/allocation context
+ commercial price snapshot
```

Size quantities belong to line.

---

# 12. DealSpace aggregate

## 12.1 Cardinality

```text
TradingRelationship 1 ── * DealSpace
Campaign 0..1 ── * DealSpace
Order 1 ── 1 primary Order DealSpace
```

P0 recommendation:

- one relationship DealSpace;
- contextual threads for campaign, collection, product, appointment and order;
- order automatically links to same relationship workspace and dedicated order thread.

## 12.2 Visibility

Thread types:

```text
shared_partner
brand_internal
shop_internal
```

A message cannot change thread visibility after send. To share internal content, user creates a new shared message/action.

## 12.3 State

```text
active | quiet | closed | archived
```

Closed relationship/order preserves thread history. New messages depend on policy.

---

# 13. Calendar and Appointment

## 13.1 CalendarEvent

Visibility:

```text
private | organisation | shared | public_event
```

Types:

```text
appointment
campaign_milestone
order_deadline
internal_meeting
industry_event
reminder
showroom_period
```

## 13.2 Appointment state machine

```text
proposed
 ├─ accept → confirmed
 ├─ decline → declined
 ├─ propose_new_time → reschedule_requested
 └─ cancel → cancelled

confirmed
 ├─ start → live
 ├─ reschedule → reschedule_requested
 └─ cancel → cancelled

reschedule_requested
 ├─ accept proposal → confirmed
 ├─ decline → previous confirmed/proposed state
 └─ supersede → reschedule_requested

live
 └─ complete → completed
```

A reschedule is never silent PATCH of time. It creates AppointmentProposal and participant notifications.

---

# 14. Document and attachment model

```text
Document
 ├─ ownerOrganisationId
 ├─ classification
 ├─ currentVersionId
 ├─ storageObject
 └─ accessPolicy

EntityDocumentLink
 ├─ entityType
 ├─ entityId
 ├─ documentId
 └─ visibility
```

One file can be linked to multiple entities only if access policies are compatible. A shared DealSpace attachment cannot accidentally expose Brand-internal source document.

---

# 15. Archive/delete rules

| Entity | Delete allowed | Default operation |
|---|---|---|
| User membership | no hard delete | disable |
| Campaign | no after business activity | archive |
| Collection | only empty draft by policy | archive |
| Product | only unused draft by policy | archive/inactivate |
| Published release | never | close/supersede |
| Selection | no after order conversion | archive |
| Order | never after number/audit created | cancel/close |
| Message | retention-policy tombstone | delete marker |
| Document | delete only if unshared/unreferenced | archive/revoke |
| Appointment | never after participant notification | cancel |
| AuditEvent | never | retention-controlled storage |

---

# 16. Read models versus aggregates

Cursor may create read models such as:

```text
CampaignRegistryRow
CampaignOverviewVM
CollectionReadinessVM
ShopShowroomVM
SelectionWorkspaceVM
OrderBuilderVM
```

These are projections, not new persisted business entities.

Read model naming must end in:

```text
VM | View | Projection | Summary | Row
```

Commands mutate aggregates through application use cases.

---

# 17. Required consistency tests

1. Buyer Preview and Shop Showroom resolve identical visible products/prices for same grant/release.
2. Published release remains unchanged after draft edits.
3. Selection conversion preserves every source reference.
4. Submitted order version cannot be PATCHed.
5. Revision patch references exact base version.
6. Revoked grant blocks new showroom reads and realtime events.
7. Private Shop notes never appear in Brand projection.
8. Campaign archive does not delete orders/releases.
9. Catalogue price update does not rewrite submitted order totals.
10. Appointment reschedule preserves proposal history.
11. DealSpace internal thread cannot be read by counterparty.
12. Document link cannot widen source document visibility.

---

# 18. Cursor rule

Before adding a table/entity/schema, Cursor must answer:

- Is this a domain aggregate, child entity, value object, snapshot or read model?
- Who owns it?
- Who may see it?
- What is its lifecycle?
- Does it require versioning?
- What existing entity does it reference?
- What happens after archive/revoke/confirm?

No answer — no schema change.
