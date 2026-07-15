# 04 — Workflow Catalog

## 1. Назначение

Workflow — законченный бизнес-процесс, проходящий через несколько экранов, сущностей и ролей.

Каждый workflow содержит:

- ID;
- цель;
- роли;
- preconditions;
- happy path;
- команды;
- события;
- уведомления;
- ошибки/компенсации;
- audit;
- acceptance outcome.

---

# WF-001 — Создание Sales Campaign

**Инициатор:** Brand Admin / Head of Sales / authorised Sales Manager  
**Capabilities:** CAP-CAM-002, 004, 013  
**Screens:** Campaign Registry → Campaign Create/Edit → Campaign Overview

## Preconditions

- active Brand organisation;
- `campaign.create`;
- organisation defaults configured or user supplies required values.

## Steps

1. User selects `Create campaign`.
2. Enters name, code, season, type, dates and timezone.
3. Selects default currency, price list, delivery windows and access model.
4. Assigns owner/team.
5. Saves draft.
6. System creates Campaign and default milestones.
7. Redirect to Campaign Overview.

## Commands

```text
CreateSalesCampaign
AssignCampaignTeam
CreateDefaultCampaignMilestones
```

## Events

```text
campaign.created
campaign.team_assigned
calendar.milestones_created
```

## Errors

- duplicate code;
- invalid date range;
- unavailable price list;
- user lacks assignment scope;
- idempotency replay.

## Outcome

Campaign exists in `draft`, appears in registry, has owner and version.

---

# WF-002 — Настройка Campaign audience

**Инициатор:** Brand sales  
**Capabilities:** CAP-CAM-008–012, CAP-REL-002  
**Screens:** Campaign Buyers

## Steps

1. Add Shop individually, by segment or import.
2. Resolver validates TradingRelationship or creates invitation candidate.
3. Configure visible collections/products.
4. Assign price list, currency, deadline and sales manager.
5. Save grant as `draft/invited`.
6. Send invitation now or later.

## Commands

```text
CreateCampaignAccessGrant
UpdateCampaignAccessGrant
SendCampaignInvitation
RevokeCampaignInvitation
```

## Events

```text
campaign.access_grant_created
campaign.invitation_sent
campaign.invitation_revoked
campaign.commercial_context_changed
```

## Notifications

- invitation email/in-app;
- reminder near deadline;
- material change notice.

## Rules

- no price context leak;
- invitation can exist before Shop user account;
- revoked grant blocks access immediately;
- changes after Shop opened showroom are audited and optionally notified.

---

# WF-003 — Создание Collection

**Инициатор:** Brand editor  
**Capabilities:** CAP-COL-002,003  
**Screens:** Collection Registry → Collection Overview

## Steps

1. Create from blank, duplicate or campaign template.
2. Set identity, season/drop, cover and owner.
3. Link campaign.
4. Create draft CollectionVersion and ShowroomDraft.
5. Open Collection Overview.

## Events

```text
collection.created
collection.version_created
showroom.draft_created
```

## Outcome

Collection status `draft/incomplete`, readiness calculated.

---

# WF-004 — Import products into Collection

**Инициатор:** Brand operations/showroom manager  
**Capabilities:** CAP-CAT-008–010, CAP-COL-004  
**Screens:** Import flow → Collection Product Table

## Steps

1. Upload CSV/XLSX or select external integration source.
2. Parse headers and sample rows.
3. Map fields to canonical schema.
4. Validate required identifiers, variants, sizes, prices and media URLs.
5. Show preview: create/update/skip/error.
6. User confirms import.
7. Execute idempotent batch.
8. Recalculate readiness.

## Commands

```text
CreateImportJob
SaveImportMapping
ValidateProductImport
ExecuteProductImport
AttachProductsToCollection
```

## Events

```text
import.created
import.validated
import.completed
collection.products_changed
collection.readiness_changed
```

## Failure handling

- row-level errors do not silently drop rows;
- execution is resumable;
- partial completion report required;
- original file and mapping fingerprint retained;
- re-upload with same idempotency key does not duplicate products.

---

# WF-005 — Настройка коммерческих условий Collection

**Инициатор:** Brand sales/operations  
**Capabilities:** CAP-COL-010, CAP-CAT-011–016

## Steps

1. Select default price list/currency inheritance.
2. Configure delivery windows.
3. Configure order minimum, product MOQ and pack rules.
4. Define deadline/payment/tax display.
5. Resolve conflicts with campaign defaults.
6. Save and recalculate readiness.

## Rule hierarchy

```text
Campaign default
→ Collection override
→ Buyer AccessGrant override
→ immutable resolved snapshot at release/order
```

No UI may calculate final buyer terms independently from server resolver.

---

# WF-006 — Создание Showroom presentation

**Инициатор:** Showroom Manager / Brand editor  
**Capabilities:** CAP-SHO-001–007  
**Screen:** BR-013 Showroom Composer

## Steps

1. Open draft presentation.
2. Add canonical blocks: hero, rich text, image, video, gallery, looks, product grid, quote, divider.
3. Configure modes: editorial, grid, linesheet, looks.
4. Reorder blocks.
5. Configure visual theme within allowed tokens.
6. Preview current canvas.
7. Autosave draft/version.
8. Recalculate presentation readiness.

## Commands

```text
AddPresentationBlock
UpdatePresentationBlock
ReorderPresentationBlocks
DeletePresentationBlock
UpdatePresentationConfig
```

## Constraints

- live release never mutated;
- product block references CollectionProduct IDs, not copied product JSON;
- missing product/media becomes readiness issue;
- brand theme cannot override system commercial controls/accessibility.

---

# WF-007 — Buyer Preview

**Инициатор:** Brand sales/showroom  
**Capabilities:** CAP-COL-012, CAP-SHO-008  
**Screen:** BR-014

## Steps

1. Select Shop/access grant.
2. Server resolves release candidate, visible assortment, price list, currency, terms, language and expiry.
3. Render exact Shop Showroom read model.
4. Display preview banner with selected buyer context.
5. User tests modes/products/selection simulation.
6. Return to editor or Publish Review.

## Invariant

```text
PreviewResolver(input) === ShopShowroomResolver(input)
```

except preview-only UI chrome and write suppression.

## Blocking errors

- missing grant;
- invalid price list;
- empty visible assortment;
- expired effective dates;
- hidden mandatory commercial terms.

---

# WF-008 — Publish Collection/Showroom release

**Инициатор:** Brand publisher  
**Capabilities:** CAP-COL-011–015  
**Screens:** Publish Review

## Steps

1. Load readiness using expected draft version.
2. Review blocking issues/warnings.
3. Define audience/effective date/release note.
4. Confirm warning acknowledgement.
5. Execute publish command.
6. Create immutable CollectionVersion + ShowroomRelease snapshots.
7. Activate/schedule access grants.
8. Notify invited Shops if configured.

## Commands

```text
ValidateCollectionForPublish
PublishCollectionRelease
ScheduleShowroomRelease
NotifyReleaseAudience
```

## Events

```text
collection.published
showroom.release_created
showroom.release_scheduled|live
campaign.audience_notified
```

## Concurrency

Expected version mismatch returns conflict; never publishes stale draft.

---

# WF-009 — Shop accepts invitation and accesses Showroom

**Initiator:** Shop Admin/Buyer  
**Capabilities:** CAP-PLT-002, CAP-REL-004, CAP-SHO-009–011

## Steps

1. Open signed invitation link.
2. Authenticate or create account.
3. Validate token, organisation and expiry.
4. Accept relationship/grant.
5. Resolve buyer context.
6. Create/resume ShowroomSession.
7. Open Shop Showroom.

## Errors

- token invalid/expired/revoked;
- wrong Shop organisation;
- release not live;
- relationship suspended;
- grant has no visible products/pricing.

## Security

Token is one-time or bounded; URL alone never grants persistent access without validated Shop context.

---

# WF-010 — Shop browses and selects products

**Initiator:** Buyer/Merchandiser  
**Capabilities:** CAP-SHO-012–022, CAP-BUY-001–005

## Steps

1. Browse editorial/grid/looks/linesheet.
2. Search/filter/sort.
3. Open product viewer.
4. Favourite, shortlist, exclude or add to selection.
5. Add private note or shared comment.
6. Selection tray updates without route loss.
7. Session position and interactions persist.
8. Open Selection workspace.

## Events

```text
showroom.session_started
showroom.mode_changed
product.viewed
product.favourited
product.shortlisted
product.added_to_selection
selection.updated
```

## Privacy

Brand receives only permitted engagement projection. Private Shop note/skip reason never shared.

---

# WF-011 — Shop team reviews Selection

**Initiator:** Shop buying team  
**Capabilities:** CAP-BUY-001–011  
**Screen:** SH-008

## Steps

1. Review selected items.
2. Set decision states.
3. Add internal notes/assign team member.
4. Compare products/colourways.
5. Review budget and delivery mix when enabled.
6. Resolve missing commercial information.
7. Mark selection approved or directly create order according to policy.

## Commands

```text
UpdateSelectionDecision
AddSelectionComment
AssignSelectionItem
ApproveSelection
```

## Rules

- decision changes are reversible before conversion;
- Brand does not see internal decisions unless shared;
- approval policy can require Buying Director.

---

# WF-012 — Convert Selection to draft Order

**Initiator:** Buyer  
**Capabilities:** CAP-BUY-012–013, CAP-ORD-001

## Steps

1. User selects `Create order`.
2. Validate active grant, release, price context and selected items.
3. Create Order and draft OrderVersion.
4. Seed lines from approved/selected items.
5. Store source lineage.
6. Create/link Order DealSpace thread.
7. Open Order Builder.

## Events

```text
order.created
order.version_created
order.lines_seeded
order.dealspace_linked
selection.converted_to_order
```

## Idempotency

Repeated conversion request returns existing draft order unless user explicitly creates a scenario/second order.

---

# WF-013 — Edit Order in Order Builder

**Initiator:** Buyer/Merchandiser  
**Capabilities:** CAP-ORD-002–016  
**Screen:** SH-012

## Steps

1. Load OrderBuilderVM and version token.
2. Add/remove products.
3. Enter quantities by size/colour.
4. Apply pack/size curve.
5. Assign delivery/store split.
6. See totals and validations update.
7. Autosave commands.
8. Use undo/redo.
9. Resolve conflicts or refresh/reapply.
10. Open Review Order.

## Save model

- local command queue;
- optimistic update where safe;
- server acknowledgement with new version;
- retry with idempotency key;
- visible `Saved/Saving/Failed/Conflict` state;
- failed command remains recoverable.

---

# WF-014 — Validate and submit Order

**Initiator:** Buyer/Buying Director  
**Capabilities:** CAP-ORD-017–019

## Steps

1. Run full server validation.
2. Display blocking issues and warnings grouped by product/delivery/terms.
3. Navigate user to fix targets.
4. Complete internal approvals if configured.
5. Confirm billing/shipping/reference/terms.
6. Submit expected draft version.
7. Freeze immutable submitted snapshot.
8. Notify Brand and update DealSpace.

## Blocking examples

- MOQ/pack violation;
- zero line quantities;
- expired price list/grant;
- unavailable mandatory variant;
- missing delivery assignment;
- order minimum not met;
- missing required approval/address.

## Events

```text
order.validated
order.submitted
order.version_frozen
brand.order_action_required
```

---

# WF-015 — Brand reviews and confirms Order

**Initiator:** Brand sales/finance  
**Capabilities:** CAP-ORD-021,022,025

## Steps

1. Open incoming order.
2. Review lines, totals, terms, source release and issues.
3. Discuss through Order DealSpace if needed.
4. Complete Brand approvals.
5. Confirm exact submitted version.
6. Create immutable confirmed snapshot.
7. Notify Shop and trigger ERP export if enabled.

## Rule

Brand cannot silently change Shop quantities during confirmation.

---

# WF-016 — Brand proposes Order revision

**Initiator:** Brand sales  
**Capabilities:** CAP-ORD-023,024

## Steps

1. Start revision against explicit submitted version.
2. Propose line/quantity/delivery/commercial patches.
3. Provide mandatory reason.
4. Validate suggestion.
5. Send to Shop.
6. Shop compares base vs proposed.
7. Shop accepts/rejects individual or whole suggestion according to design.
8. Accepted result creates new version and resubmission path.

## Events

```text
order.revision_proposed
order.revision_accepted|rejected
order.version_created
order.resubmitted
```

No direct mutation of submitted version.

---

# WF-017 — Schedule sales appointment

**Initiator:** Brand or Shop  
**Capabilities:** CAP-CAL-004–008

## Steps

1. Select relationship/campaign/collections.
2. Propose one or more slots with timezone.
3. Add participants, format, location/link and agenda.
4. Send proposal.
5. Recipient accepts, declines or proposes new time.
6. Confirmed event appears in both calendars.
7. Reminders created.

## Rules

- reschedule creates proposal history;
- participant timezone explicit;
- access to linked showroom is validated separately.

---

# WF-018 — Conduct live appointment

**Initiator:** Appointment host  
**Capabilities:** CAP-SHO-023, CAP-CAL-009–011, CAP-DSP

## Steps

1. Open preparation context.
2. Start appointment.
3. Share current collection/look/product state.
4. Participants add shared selection/comments.
5. Chat/files/tasks stay linked to appointment.
6. End meeting.
7. Create summary and follow-up tasks.

P0 may integrate external meeting URL. Native call is later.

---

# WF-019 — Contextual message and task

**Initiator:** DealSpace participant  
**Capabilities:** CAP-DSP-002–010

## Steps

1. Open context thread from campaign/product/order.
2. Select visibility: shared or organisation-internal.
3. Compose message, mention, attach file.
4. Server validates audience.
5. Send message and notifications.
6. Optionally convert message to task.
7. Task maintains source message link.

## Safety

Visibility cannot be inferred from current UI colour only; explicit label required.

---

# WF-020 — External product/inventory/order sync

**Initiator:** scheduled system / Integration Admin  
**Capabilities:** CAP-INT-003–009

## Steps

1. Fetch/receive external change.
2. Authenticate connection.
3. Normalize external payload.
4. Resolve mapping.
5. Validate source-of-truth policy.
6. Create sync plan/diff.
7. Apply idempotent changes.
8. Emit domain events.
9. Store run status/errors/cursor.
10. Retry transient failures.

## Conflict policy examples

- external PIM owns product master fields;
- Syntha owns showroom story/order collaboration;
- ERP owns ATS/inventory;
- submitted/confirmed order snapshots never rewritten by later sync;
- order export status can update fulfilment projection, not commercial version.

---

# WF-021 — Showroom analytics and follow-up

**Initiator:** system + Brand sales  
**Capabilities:** CAP-ANA-001–008

## Steps

1. Capture privacy-safe events.
2. Aggregate session/product/funnel projections.
3. Display actionable queues: unopened invite, high engagement/no order, abandoned selection, deadline risk.
4. Sales user opens buyer context.
5. Creates message, appointment or reminder.
6. Follow-up outcome joins funnel.

Vanity metrics without next action are secondary.

---

# WF-022 — Reorder from confirmed Order

**Initiator:** Shop Buyer  
**Capabilities:** CAP-ORD-030

## Steps

1. Open confirmed order.
2. Select `Create reorder`.
3. Resolve current product availability/pricing/terms.
4. Show differences from source order.
5. Create new draft with source order lineage.
6. User reviews quantities before save/submit.

Never copy obsolete prices silently.

---

# 23. Global workflow requirements

Every workflow must support:

- permission denial;
- loading/error/retry;
- idempotency for writes;
- optimistic concurrency where relevant;
- audit event;
- notification deduplication;
- mobile/iPad adaptation;
- deep-link recovery;
- no legacy route fallback;
- observability with request/correlation ID.

---

# 24. E2E critical chain

```text
WF-001 Create Campaign
→ WF-003 Create Collection
→ WF-004 Import Products
→ WF-005 Configure Terms
→ WF-006 Compose Showroom
→ WF-007 Buyer Preview
→ WF-008 Publish
→ WF-002 Invite Shop
→ WF-009 Accept Access
→ WF-010 Browse/Select
→ WF-011 Review Selection
→ WF-012 Create Order
→ WF-013 Edit Order
→ WF-014 Submit
→ WF-015 Confirm OR WF-016 Revise
```

This chain is the primary product acceptance test.
