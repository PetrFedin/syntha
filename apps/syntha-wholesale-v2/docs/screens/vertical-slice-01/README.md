# Vertical Slice 01 — Campaign to Order Builder

## 1. Purpose

This package is the implementation contract for the first end-to-end wholesale flow in Syntha Wholesale V2:

```text
Brand Campaign Registry
→ Campaign Overview
→ Collection Overview
→ Showroom Composer
→ Buyer Preview
→ Shop Collection Showroom
→ Shop Selection
→ Order Builder
```

The slice proves the main product promise:

1. A Brand can prepare a sales campaign and a buyer-ready collection.
2. A Brand can compose and preview a personalised digital showroom.
3. A Shop can browse the showroom without losing context or selections.
4. A Shop can turn the selection into a structured wholesale order draft.

## 2. Screen files

```text
BR-002_CAMPAIGN_REGISTRY.md
BR-003_CAMPAIGN_OVERVIEW.md
BR-009_COLLECTION_OVERVIEW.md
BR-013_SHOWROOM_COMPOSER.md
BR-014_BUYER_PREVIEW.md
SH-006_COLLECTION_SHOWROOM.md
SH-008_SELECTION.md
SH-012_ORDER_BUILDER.md
```

Each screen file owns its route, view model, layout, states, permissions, responsive behaviour, analytics and acceptance criteria.

## 3. Canonical route chain

```text
/wholesale-v2/brand/campaigns
/wholesale-v2/brand/campaigns/:campaignId
/wholesale-v2/brand/collections/:collectionId
/wholesale-v2/brand/collections/:collectionId/presentation
/wholesale-v2/brand/collections/:collectionId/preview
/wholesale-v2/shop/campaigns/:campaignId/collections/:collectionId
/wholesale-v2/shop/campaigns/:campaignId/selections/:selectionId
/wholesale-v2/shop/orders/:orderId/edit
```

Routes may be nested differently by the chosen framework, but these canonical URLs and entity IDs must remain stable and shareable.

## 4. Cross-screen identity chain

The same durable IDs travel through the flow:

```text
brandOrganisationId
campaignId
collectionId
collectionVersionId
showroomId
campaignAccessGrantId
shopOrganisationId
showroomSessionId
buyingWorkspaceId
selectionId
selectionItemId
orderId
orderVersionId
orderLineId
```

Screens must not pass copied product/order JSON as the source of truth. Each route resolves current authorised data through the application layer.

## 5. Shared context

### Brand context

- active organisation;
- campaign;
- collection;
- draft/published version;
- owner/team;
- permissions;
- save/readiness state.

### Shop context

- active organisation;
- trading relationship/access grant;
- campaign;
- collection version;
- price list;
- currency;
- market/locale;
- delivery windows;
- order deadline;
- selection/order state.

### Context safety

- buyer-specific pricing must never fall back silently;
- internal Brand data must not enter Shop view models;
- private/internal Shop notes must not enter Brand view models or analytics;
- preview simulation never creates real Shop records;
- published versions remain immutable.

## 6. Shared state transition

```text
Campaign draft
→ Collection draft
→ Presentation draft
→ Buyer preview
→ Published version through companion Publish Review
→ Shop showroom session
→ Selection draft
→ Order draft
→ Review through companion Order Validation
```

The requested Screen Bible ends at Order Builder. Publication, access acceptance and Order Validation are companion dependencies and must be specified before full e2e implementation.

## 7. Navigation state preservation

Required:

- Campaign Registry preserves search, filters, view, pagination and scroll after opening a campaign.
- Campaign Overview preserves active tab and scroll after opening a collection.
- Collection Overview restores active section after Composer/Preview.
- Composer restores selected block, canvas scroll and buyer context after Preview.
- Shop Showroom preserves mode, filters, story position and last product.
- Selection preserves filters, sort, decision grouping and scroll after product view/Order Builder.
- Order Builder preserves focused line/cell after returning from Review.

Browser refresh and shareable URL must restore entity context without relying only on in-memory state.

## 8. Shared autosave contract

Autosaved drafts:

- Showroom presentation draft;
- Selection decisions/notes;
- Order draft.

Every autosave implementation requires:

- visible state: saved, saving, unsaved, failed, conflict;
- optimistic concurrency version;
- ordered mutation queue or equivalent;
- retry without losing user input;
- explicit conflict resolution;
- route-exit protection when unsynced;
- audit event for business-relevant changes.

## 9. Shared commercial context

The buyer commercial context is resolved from:

```text
CampaignAccessGrant
+ TradingRelationship
+ CollectionVersion
+ PriceList
+ market/locale
+ delivery rules
```

It controls:

- visible collections/products/blocks;
- price list and currency;
- suggested retail/margin visibility;
- delivery windows;
- MOQ/pack rules;
- order deadline;
- access expiry;
- language/market content.

Buyer Preview and real Shop Showroom use the same resolver and presentation renderer.

## 10. Shared product lineage

```text
CollectionProduct
→ ProductInteraction
→ SelectionItem
→ OrderLine
```

Every downstream record retains source references:

- collection product;
- variant/colour;
- source story block/look/mode when relevant;
- selection item;
- collection version;
- price/commercial snapshot reference.

No manual re-entry is required between Showroom, Selection and Order Builder.

## 11. Shared collaboration rules

Visibility values:

- Private to me;
- Internal to my organisation;
- Shared with Brand/Shop.

Rules:

- default Shop note visibility is Internal to Shop;
- shared product/order comments create or link a DealSpace context thread;
- internal content never appears in counterparty view models;
- mentions respect permissions;
- comments link durable entity IDs;
- message contents are not copied into analytics events.

## 12. Shared analytics funnel

```text
campaign_opened
showroom_opened
collection_browse_depth
product_viewed
product_shortlisted
selection_opened
selection_approved
order_draft_created
order_builder_opened
order_review_started
```

Preview events include `isPreview: true` and are excluded from buyer engagement/conversion metrics.

## 13. Shared universal states

Every screen implements:

- loading;
- empty;
- no results when applicable;
- permission denied;
- access expired/revoked when applicable;
- validation warning;
- blocking validation;
- server error;
- retry;
- stale/version conflict;
- success confirmation;
- offline/unsynced state where drafts exist.

No screen may display a successful mutation if persistence failed.

## 14. Shared responsive contract

Required review viewports:

```text
390 × 844
768 × 1024
1024 × 768
1440 × 900
1728 × 1117
```

Adaptation order:

1. hide low-priority metadata;
2. move secondary actions to overflow;
3. move inspector/context rail to drawer or sheet;
4. turn registry tables into mobile list cards;
5. turn complex builders into sequential modes/steps.

A desktop table or three-pane Builder must never be proportionally squeezed into iPhone width.

## 15. Shared accessibility contract

- WCAG 2.2 AA target;
- touch targets at least 44 × 44 px;
- visible keyboard focus;
- complete keyboard paths for desktop and iPad hardware keyboard;
- semantic headings/landmarks;
- screen-reader labels for icon actions;
- no colour-only state;
- accessible alternatives for drag-and-drop;
- reduced motion support;
- iPhone input font at least 16 px.

## 16. Shared security contract

- all reads/writes scoped by active organisation and permission;
- buyer access resolved server-side;
- no trusting buyer/shop IDs supplied only by client;
- signed/expiring access links exchange into authenticated access context;
- price/access errors fail closed;
- audit events for publish, access, archive, selection-to-order and order version changes;
- restricted media access follows the same grant boundary.

## 17. WFX-influenced requirements

The first slice includes these verified Virtual Showroom concepts adapted from World Fashion Exchange:

- private buyer showroom;
- buyer-specific assortment, price and content;
- secure invitation-ready access;
- high-resolution imagery and HD video;
- detailed product specifications;
- shoppable lookbook/story and digital linesheet;
- contextual feedback;
- engagement event capture;
- future PLM/ERP integration ports.

3D/360, native video calls, digital whiteboard and sample requests are P1. PLM/ERP/MES execution remains excluded.

## 18. Cross-screen e2e acceptance

The slice passes when a realistic fixture demonstrates:

1. Brand opens/creates a campaign.
2. Brand opens a collection with valid products/commercial data.
3. Brand composes a showroom and autosave succeeds.
4. Brand previews a specific Shop context with exact price/access.
5. Published companion flow exposes that version to the Shop.
6. Shop opens Story, Products, Looks and Linesheet modes.
7. Shop selections persist across modes and sessions.
8. Shop reviews decisions in Selection.
9. Shop creates one idempotent Order draft.
10. Order Builder receives correct source lines and commercial snapshot.
11. Buyer enters quantities, delivery and resolves validations.
12. No private data leakage, legacy route, fake save or silent context fallback occurs.

## 19. Non-goals of this package

- detailed Campaign Create screen;
- Product Import/Product Table specs;
- Publish Review implementation spec;
- invitation acceptance/authentication spec;
- Order Validation/Submit spec;
- Brand review/confirmation;
- payments/invoicing;
- production/PLM/ERP/MES execution.

Those are companion packages and cannot be improvised inside these eight screens.
