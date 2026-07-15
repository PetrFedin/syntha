# 05 — Screen / Function / API Matrix

## 1. Назначение

Этот документ связывает:

```text
Screen ID
→ Capabilities
→ Read Model
→ Queries
→ Commands
→ Permissions
→ Domain Events
→ Realtime Events
→ Canonical Components
```

Screen не имеет права обращаться к базе или собирать buyer price context на клиенте.

---

# 2. Foundation screens

## SY-001 — Sign in

| Поле | Контракт |
|---|---|
| Capabilities | CAP-PLT-001 |
| Query | `GET /api/v2/session` |
| Commands | `POST /api/v2/auth/sign-in`, `POST /api/v2/auth/sign-out` |
| Permission | public/authentication policy |
| Entities | User, Session |
| Events | `session.started`, `session.ended`, audit login result |
| Components | FocusLayout, FormField, PasswordField, Button, ErrorState |
| Restrictions | no active organisation IDs accepted from untrusted client |

## SY-003 — Invitation Acceptance

| Поле | Контракт |
|---|---|
| Capabilities | CAP-PLT-002, CAP-REL-004 |
| Query | invitation token inspection endpoint |
| Commands | `POST /api/v2/invitations/:token/accept` |
| Entities | Invitation, User, Membership, TradingRelationship, AccessGrant |
| Events | `invitation.accepted`, `membership.activated`, optional `relationship.activated` |
| States | valid, expired, revoked, wrong organisation, already accepted |

---

# 3. Brand Campaign screens

## BR-002 — Campaign Registry

| Поле | Контракт |
|---|---|
| Capabilities | CAP-CAM-001,002,003,020; CAP-PLT-014 |
| Route | `/wholesale-v2/brand/campaigns` |
| Read model | `CampaignRegistryRow[]`, pagination, filter facets |
| Query | `GET /api/v2/brand/campaigns` |
| Commands | create, duplicate P1, archive, restore P1, bulk archive |
| Permissions | `campaign.read`; actions require create/archive |
| Events listened | `campaign.created`, `campaign.updated`, `campaign.archived` |
| Components | WorkspaceHeader, FilterBar, SavedViewSelector, DataTable, MobileListCard, StatusBadge |
| URL state | q, status, owner, dates, sort, view, cursor |
| Mobile | table transforms to list cards; create CTA sticky |

### Registry row fields

```text
campaign identity
season/type
status
dates/timezone
owner/team
collection count
invited/opened Shop count
submitted/confirmed value
readiness/next action
updatedAt
```

### Commands

```text
CreateSalesCampaign
DuplicateSalesCampaign
ArchiveSalesCampaign
RestoreSalesCampaign
```

## BR-003 — Campaign Overview

| Поле | Контракт |
|---|---|
| Capabilities | CAP-CAM-004–018 |
| Route | `/wholesale-v2/brand/campaigns/:campaignId` |
| Read model | `CampaignOverviewVM` |
| Queries | campaign detail, readiness, activity, summary metrics |
| Commands | update identity, assign owner, lifecycle transition, create collection, invite Shops |
| Permissions | `campaign.read`; scoped action permissions |
| Realtime | activity/order/invitation/appointment projection updates |
| Components | EntityHeader, Tabs, MetricStrip, ActionQueue, CollectionSummaryList, ActivityTimeline, ContextRail |

### Primary CTA resolver

```text
no collection       → Create collection
collection incomplete → Continue collection
ready not published → Review and publish
active no audience  → Invite Shops
active audience     → View buyer activity
closing             → Review open orders
```

The server/read model returns recommended action code; UI maps it to canonical CTA.

## BR-004 — Campaign Buyers

| Поле | Контракт |
|---|---|
| Capabilities | CAP-CAM-008–012,019; CAP-REL-002,006,008 |
| Read model | `CampaignBuyerRow[]` |
| Queries | campaign buyers, segments, price lists, collections, invitation states |
| Commands | create/update/revoke access grant; send/resend invitation; assign manager |
| Permissions | `buyer.manage`, `pricing.assign`, `campaign.communicate` |
| Components | DataTable, AccessGrantDrawer, SegmentPicker, PriceListSelector, ConfirmDialog |
| Sensitive fields | resolved price context; no cross-Shop data |

## Campaign Create/Edit companion

| Поле | Контракт |
|---|---|
| Capabilities | CAP-CAM-002,004,013 |
| Read model | organisation defaults, price lists, delivery windows, team |
| Command | `CreateSalesCampaign`, `UpdateSalesCampaign` |
| Validation | unique code, dates, timezone, currency, owner permission |
| Components | Wizard/Entity form, DateRangeField, CurrencySelect, TeamPicker |

---

# 4. Brand Collection screens

## BR-008 — Collection Registry

| Поле | Контракт |
|---|---|
| Capabilities | CAP-COL-001,002,019 |
| Query | `GET /api/v2/brand/collections` |
| Commands | create, duplicate, archive |
| Components | DataTable/Gallery switch, ProductMedia, StatusBadge |
| Filters | campaign, season, status, owner, publish state |

## BR-009 — Collection Overview

| Поле | Контракт |
|---|---|
| Capabilities | CAP-COL-003–019 |
| Route | `/wholesale-v2/brand/collections/:collectionId` |
| Read model | `CollectionOverviewVM` |
| Queries | collection detail, product summary, readiness, current release, activity |
| Commands | update identity, add products, open composer, lifecycle actions |
| Permissions | `collection.read/update/readiness/preview/publish` |
| Realtime | readiness, import, release status |
| Components | EntityHeader, ReadinessPanel, MetricStrip, ProductSummary, ReleaseCard, ActivityTimeline |

### Readiness sections

```text
Identity
Products and variants
Media
Pricing
Sizes
Delivery
MOQ/pack
Presentation
Buyer access
Publish configuration
```

## BR-010 — Collection Product Table

| Поле | Контракт |
|---|---|
| Capabilities | CAP-COL-004–006,010; CAP-CAT-003–018 |
| Query | `GET /api/v2/brand/collections/:id/products` |
| Commands | add/import/update/remove/bulk/reorder |
| Components | DataTable, BulkActionBar, ProductQuickEditor, ImportDrawer, ColumnChooser |
| Rows | collection product contextual fields, not only master Product |
| Realtime | import progress, bulk update result, readiness |

## Product Import companion

| Поле | Контракт |
|---|---|
| Capabilities | CAP-CAT-008,009 |
| Queries | mapping profiles, import job status |
| Commands | create upload, parse, map, validate, execute, cancel |
| Components | FileDrop, MappingTable, ValidationSummary, ImportProgress |
| Required states | parsing, mapping, ready, executing, partial, failed, completed |

## BR-013 — Showroom Composer

| Поле | Контракт |
|---|---|
| Capabilities | CAP-SHO-001–007; CAP-COL-007–011 |
| Route | `/wholesale-v2/brand/collections/:id/presentation` |
| Read model | `ShowroomComposerVM` |
| Queries | draft presentation, block library, products, looks, readiness |
| Commands | block add/update/delete/reorder; config update; autosave |
| Permissions | `showroom.update`, `collection.update` |
| Realtime | collaborator/presence P1; save/version/readiness |
| Components | BuilderHeader, BlockSourceRail, PresentationCanvas, Inspector, ReadinessPanel, MediaPicker |
| Versioning | expected draft version required on every write batch |

### Block command payload rule

Client sends canonical block command, not whole document replacement unless explicit atomic replace API is selected.

## BR-014 — Buyer Preview

| Поле | Контракт |
|---|---|
| Capabilities | CAP-COL-012, CAP-SHO-008–011 |
| Route | `/wholesale-v2/brand/collections/:id/preview?shop=:shopId` |
| Read model | same resolved `ShopShowroomVM` plus `previewMeta` |
| Query | buyer preview resolver endpoint |
| Commands | no commercial writes; simulated selection isolated |
| Permissions | `collection.preview`, access to selected Shop context |
| Components | ShowroomShell, PreviewContextBanner, ModeSwitcher, ProductViewer, SelectionTraySimulation |
| Blocking | no grant, invalid price list, empty assortment, expired effective window |

## BR-015 — Publish Review

| Поле | Контракт |
|---|---|
| Capabilities | CAP-COL-011–015,018 |
| Query | readiness + audience impact + version diff |
| Command | publish/schedule/unpublish |
| Permission | `collection.publish` |
| Components | PublishChecklist, AudienceSummary, WarningAcknowledge, VersionSummary |
| Concurrency | expected version + readiness fingerprint |

---

# 5. Shop Showroom and Buying screens

## SH-004 — Available Campaigns

| Поле | Контракт |
|---|---|
| Capabilities | CAP-REL-001–004, CAP-SHO-009 |
| Query | `GET /api/v2/shop/campaigns` |
| Commands | accept/decline invite, request access P1 |
| Components | CampaignCard/List, InvitationStatus, FilterBar |
| Visibility | only active or pending grants for active Shop |

## SH-006 — Collection Showroom

| Поле | Контракт |
|---|---|
| Capabilities | CAP-SHO-002–022 |
| Route | `/wholesale-v2/shop/collections/:collectionId/showroom` |
| Read model | `ShopShowroomVM` resolved server-side |
| Queries | showroom, product quick view, current selection, session state |
| Commands | session resume, favourite, decision, add/remove selection, note, shared message |
| Permissions | valid grant + `showroom.read`, `selection.update` |
| Components | ShowroomShell, ModeSwitcher, StoryRenderer, ProductGallery, Linesheet, ProductViewer, SelectionTray |
| Realtime | grant revoked, release changed, shared comment, appointment state |
| Analytics | session/view/mode/filter/product/selection events |

### `ShopShowroomVM` must include

```text
release identity
Brand/Collection identity
resolved audience context
resolved prices and currency
visible products only
commercial terms
presentation blocks/modes
selection summary
session resume state
permissions
```

## SH-007 — Product Quick View

| Поле | Контракт |
|---|---|
| Capabilities | CAP-SHO-012–020 |
| Query | buyer-resolved product view |
| Commands | favourite, selection, private note, shared comment |
| Components | MediaGallery, CommercialPanel, VariantSwitcher, StickyActionBar |

## SH-008 — Selection

| Поле | Контракт |
|---|---|
| Capabilities | CAP-BUY-001–013 |
| Route | `/wholesale-v2/shop/selections/:selectionId` |
| Read model | `SelectionWorkspaceVM` |
| Queries | selection, comments, budget summary, validation/readiness |
| Commands | decision, note, assignment, reorder/remove, approve, create order |
| Permissions | selection scopes + order.create for CTA |
| Components | WorkspaceHeader, FilterBar, SelectionTable/Gallery, DecisionControl, BudgetStrip, InternalCommentPanel |
| Realtime | collaborator updates/conflict P1 |

## SH-010 — Buying Workspace

| Поле | Контракт |
|---|---|
| Capabilities | CAP-BUY-006–015 |
| Read model | multi-selection/assortment projection |
| Commands | comparison set, budget allocation, store allocation, team assignment |
| Priority | P1/P2 after first slice |

---

# 6. Order screens

## SH-012 — Order Builder

| Поле | Контракт |
|---|---|
| Capabilities | CAP-ORD-001–016 |
| Route | `/wholesale-v2/shop/orders/:orderId/edit` |
| Read model | `OrderBuilderVM` |
| Queries | order draft, lines, source products, terms, budget, validation, presence |
| Commands | line add/remove/update/bulk, apply pack, delivery/store split, undo command, autosave batch |
| Permissions | `order.update`, scoped to Shop/order state |
| Components | BuilderHeader, OrderSourceRail, MatrixEditor, TotalsInspector, ValidationBar, ProductQuickView |
| Realtime | version changed, collaborator presence, availability/terms alert |
| Performance | virtualisation and no typing lag on realistic fixture |

### Command examples

```text
AddOrderLine
RemoveOrderLine
SetSizeQuantity
PasteQuantityMatrix
ApplyPackRule
AssignDeliveryWindow
SplitOrderByStore
UpdateBuyerComment
```

### Server response

```text
newVersion
appliedCommandIds
rejectedCommands
updatedTotals
validationDelta
```

## SH-013 — Order Validation

| Поле | Контракт |
|---|---|
| Capabilities | CAP-ORD-017–019 |
| Query/Command | validate then submit |
| Read model | grouped blocking/warnings, addresses, terms, approvals, totals |
| Components | EntityHeader, ValidationSummary, IssueNavigator, TermsReview, SubmitConfirm |
| Rule | Submit never exists directly in Builder |

## BR-027 — Incoming Order Registry

| Поле | Контракт |
|---|---|
| Capabilities | CAP-ORD-021 |
| Query | `GET /api/v2/brand/orders` |
| Filters | status, buyer, campaign, manager, date, value, action required |
| Commands | assignment, export, bulk status action only if policy |
| Components | DataTable, ActionRequiredBadge, SavedViews |

## BR-028 — Brand Order Detail

| Поле | Контракт |
|---|---|
| Capabilities | CAP-ORD-022,025,027 |
| Queries | current version, history, approvals, DealSpace, source release |
| Commands | begin review, confirm, propose revision, export |
| Components | EntityHeader, OrderLinesTable, TotalsInspector, VersionHistory, DealSpacePanel |

## BR-029 / SH-016 — Revision flow

| Поле | Контракт |
|---|---|
| Capabilities | CAP-ORD-023,024 |
| Read model | base version + proposed patch + comparison |
| Commands | propose, accept, reject, resubmit |
| Components | DiffMatrix, ReasonPanel, VersionCompare, DecisionBar |
| Invariant | base immutable; accepted patch creates version |

---

# 7. DealSpace screens

## DSP Campaign/Collection/Order

| Поле | Контракт |
|---|---|
| Capabilities | CAP-DSP-001–013 |
| Queries | dealspace, threads, messages, attachments, tasks, activity |
| Commands | send/edit/delete message, upload/link file, create/update task, mark read |
| Permissions | relationship membership + context audience + visibility channel |
| Components | CollaborationSplit, ThreadList, Conversation, Composer, VisibilitySelector, ContextInspector |
| Realtime | message, read state, task, participant/access changes |

### Message command must include

```text
threadId
visibility
body/structured references
attachmentIds
mentionUserIds
clientMessageId
```

Server validates every mention and attachment audience.

---

# 8. Calendar and appointment screens

## Brand/Shop Calendar

| Поле | Контракт |
|---|---|
| Capabilities | CAP-CAL-001–015 |
| Queries | event range, layers, filters, timezone |
| Commands | create/update/cancel event, appointment proposal/response |
| Components | Calendar, LayerFilter, EventCard, EventEditor, AppointmentInspector |
| Mobile | agenda default |

## Appointment Detail/Preparation/Live

| Поле | Контракт |
|---|---|
| Queries | appointment, participants, linked entities, agenda, access |
| Commands | accept/decline/reschedule/start/complete |
| Realtime | participant response, live state, shared presentation state |
| Components | EntityHeader, ParticipantList, Agenda, LinkedEntityCards, LiveShowroomShell |

---

# 9. Integration screens

## Integration Registry

| Поле | Контракт |
|---|---|
| Capabilities | CAP-INT-001–009 |
| Queries | connections, sync status, mappings, runs |
| Commands | connect, verify, map, run, pause, retry, revoke |
| Permission | `integration.manage` |
| Components | IntegrationCard, MappingTable, SyncRunTable, SecretInput |
| Security | secret values never returned after creation |

---

# 10. Cross-screen state rules

## URL state

Persist in URL where shareable:

- registry filters/sort/view;
- current entity tab;
- Showroom presentation mode and optional product deep link;
- Calendar range/view;
- DealSpace thread ID.

Never put in URL:

- raw access tokens;
- price payloads;
- internal notes;
- unsaved order matrix state;
- sensitive invitation secrets after exchange.

## Back navigation

Must restore:

- filters;
- scroll position;
- selected rows where safe;
- Showroom position;
- draft state;
- open inspector context where useful.

## Cache invalidation

Use domain events/query keys. Avoid global refetch of entire app after local command.

---

# 11. Screen Definition of Done

A screen is not complete until:

1. all referenced Capability IDs exist;
2. exact read model type exists;
3. queries and commands use application/API layer;
4. permission policy has positive and negative tests;
5. state transitions conform to Domain Map;
6. analytics/audit events exist where required;
7. loading/empty/no-results/error/forbidden/conflict states exist;
8. responsive contract passes;
9. canonical components only;
10. deep links and back state work;
11. no fake data after successful mutation;
12. screen task links to this matrix and detailed screen spec.
