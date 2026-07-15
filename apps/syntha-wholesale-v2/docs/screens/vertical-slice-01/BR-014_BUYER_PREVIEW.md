# BR-014 — Buyer Preview

## 1. Screen identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/collections/:collectionId/preview`
- **Template:** Focus / Showroom Preview
- **Priority:** P0
- **Primary job:** verify the exact buyer-facing experience before publication.
- **Primary action:** `Return to editor`
- **Secondary action:** `Open publish review` when readiness permits.

## 2. Product intent

Buyer Preview is not a generic device preview. It resolves a complete buyer context and renders the same presentation engine used by the Shop Showroom.

The Brand must be able to verify:

- visible products and blocks;
- buyer-specific assortment;
- price list and currency;
- delivery windows;
- MOQ and pack rules;
- order deadline;
- language/market content;
- access expiry and security context;
- mobile/tablet/desktop presentation;
- selection and order entry affordances.

## 3. Entry points

- Showroom Composer → Preview as buyer;
- Collection Overview → Preview;
- Publish Review issue resolution;
- published version view;
- release history comparison.

## 4. Exit points

- return to Composer at same block/scroll context;
- open Publish Review;
- switch buyer context;
- switch viewport;
- compare draft vs published version;
- open product/access/commercial issue fix.

## 5. Preview context contract

```ts
type BuyerPreviewContext = {
  mode: 'specific_shop' | 'buyer_segment' | 'market_generic';
  shopOrganisationId?: string;
  segmentId?: string;
  marketCode: string;
  locale: string;
  currency: string;
  priceListId: string;
  collectionAccess: 'allowed' | 'partial' | 'denied';
  visibleCollectionProductIds: string[];
  visibleStoryBlockIds: string[];
  deliveryWindowIds: string[];
  orderDeadline?: string;
  accessExpiresAt?: string;
  commercialTermsLabel?: string;
  sourceGrantId?: string;
};
```

## 6. Preview data contract

```ts
type BuyerPreviewVM = {
  collection: CollectionSummary;
  version: CollectionVersionSnapshot;
  showroom: ShowroomPresentationSnapshot;
  context: BuyerPreviewContext;
  contextWarnings: PreviewContextWarning[];
  products: BuyerVisibleProduct[];
  looks: BuyerVisibleLook[];
  readiness: {
    canPublish: boolean;
    blockingIssues: ReadinessIssue[];
    warnings: ReadinessIssue[];
  };
  permissions: {
    canReturnToEdit: boolean;
    canOpenPublishReview: boolean;
    canViewCommercialData: boolean;
  };
};
```

The preview request must resolve the same access and pricing services as the real buyer route. No separate mock pricing logic.

## 7. Preview top bar

Height follows the minimal showroom/focus bar.

Contains:

- close/back to editor;
- `Preview` badge;
- collection/version;
- buyer context selector;
- viewport selector;
- draft/published selector when both exist;
- readiness indicator;
- secondary `Publish review`;
- primary `Return to editor`.

The bar must remain visually distinct from the buyer-facing showroom so the Brand cannot mistake preview for live publication.

## 8. Buyer context selector

### Context modes

1. Specific Shop — preferred and required before final publication review when invited buyers exist.
2. Buyer segment — useful for bulk audience rules.
3. Generic market — allowed only with a persistent warning that it is not an exact buyer grant.

### Search fields

- shop name;
- buyer account code;
- country/market;
- segment;
- assigned sales manager.

### Context summary

After selection show:

- Shop name/logo;
- market;
- language;
- currency;
- price list;
- number of visible products;
- order deadline;
- access expiry;
- special overrides.

## 9. Context warnings

Examples:

- buyer has no active access grant;
- price list missing;
- price list currency differs from campaign default;
- zero visible products;
- collection partially visible;
- buyer-specific block references hidden products;
- expired access;
- no delivery window applicable to buyer market;
- missing localised text uses default locale;
- draft differs materially from published version.

Blocking warnings prevent entering Publish Review until resolved.

## 10. Preview modes

### Presentation modes

- Story;
- Products grid;
- Looks;
- Linesheet;
- Fullscreen media.

Switching modes preserves:

- buyer context;
- current product;
- selection simulation;
- filters;
- scroll/section position where applicable.

### Viewport modes

- Desktop;
- iPad landscape;
- iPad portrait;
- iPhone.

Viewport preview uses real responsive CSS/container behaviour. It must not scale a desktop screenshot.

## 11. Interaction simulation

Preview allows the Brand to test:

- open product;
- switch colour;
- filter/search;
- add/remove simulated selection;
- open selection tray;
- add whole look;
- add note visibility choices;
- start order action visibility;
- navigate story anchors.

Simulation rules:

- does not create real Shop selection/order records;
- uses an isolated preview session;
- visually labelled `Simulation` in selection tray;
- reset action available;
- analytics are not counted as buyer engagement.

## 12. Exact commercial rendering

Each product must show only fields allowed by context:

- wholesale price;
- suggested retail price, if permitted;
- expected margin, if permitted;
- currency;
- delivery windows;
- MOQ;
- pack rule;
- availability;
- product specifications;
- colourways/sizes visible to buyer.

Internal Brand notes, cost data and restricted analytics never appear.

## 13. Draft vs published comparison

When a published version exists:

- switch `Draft preview` / `Live version`;
- display version number and timestamp;
- highlight summary of material differences outside buyer canvas;
- do not overlay editing diff markers inside the buyer experience;
- provide `Compare changes` drawer.

Material differences include:

- product added/removed;
- price/availability/delivery change;
- visibility change;
- content block change affecting a buyer;
- MOQ/pack change;
- order deadline change.

## 14. Product quick view in preview

Uses the same canonical buyer Product Quick View contract as Shop Showroom.

Brand-only preview overlay may add one narrow diagnostic area:

- source price list;
- source visibility rule;
- readiness issue link.

This diagnostic overlay is hidden by default and clearly outside the buyer surface.

## 15. Empty states

### No buyer context

Display context selection panel before rendering commercial preview.

Primary: `Choose buyer context`

### Buyer sees no products

Render the actual buyer empty state inside preview plus a Brand diagnostic banner explaining why.

Primary diagnostic action: `Fix access rules`

### Presentation empty

Render buyer empty experience and link `Return to editor`.

## 16. Loading state

- preview bar first;
- context resolution loading indicator;
- showroom skeleton preserves final layout;
- changing buyer context cancels/stales prior request safely;
- media loads progressively;
- prices/products cannot flash from previous buyer context.

## 17. Error states

- buyer context resolution failed;
- inaccessible buyer/relationship;
- price service failed;
- draft snapshot unavailable;
- published snapshot unavailable;
- presentation renderer failed;
- media unavailable.

Critical rule: never fall back from specific buyer pricing to campaign default without an explicit visible warning and user action.

## 18. Permissions

- `collection.read` — view presentation;
- `collection.write` — return to edit;
- `collection.publish` — open Publish Review;
- `buyer.read` — choose specific Shop;
- `buyer.manage` — access diagnostic/fix actions;
- price visibility permission.

Users without buyer-read permission may use only approved generic market contexts.

## 19. Keyboard behaviour

- Escape returns/closes active preview layer with unsaved simulation confirmation only if needed;
- left/right moves product/media where appropriate;
- `/` focuses product search in grid/linesheet;
- viewport/context controls keyboard accessible;
- `P` does not publish;
- focus does not escape the preview frame unexpectedly.

## 20. Responsive behaviour

### Desktop / MacBook

- minimal top bar;
- full showroom canvas;
- selection tray 320–380 px collapsible;
- context diagnostics in drawer;
- viewport emulation centred when narrower than window.

### iPad

- preview can run directly at device width;
- top controls collapse into context menu;
- selection tray bottom/right according to canonical showroom rules.

### iPhone

- when opened on iPhone, device mode fixed to actual viewport by default;
- context selector in full-screen sheet;
- product detail full-screen;
- selection simulation bottom bar;
- Return to editor sticky or top back depending navigation depth.

## 21. Analytics events

Preview-internal events are separated from buyer analytics:

- `buyer_preview_opened`;
- `buyer_preview_context_selected`;
- `buyer_preview_viewport_changed`;
- `buyer_preview_mode_changed`;
- `buyer_preview_simulation_action`;
- `buyer_preview_issue_opened`;
- `buyer_preview_publish_review_opened`;
- `buyer_preview_returned_to_editor`.

All include `isPreview: true` and are excluded from showroom buyer funnel.

## 22. Acceptance criteria

1. Specific buyer preview uses the production access/pricing resolver.
2. Brand sees exact visible products, prices, currency, delivery and terms.
3. Generic preview is clearly labelled and cannot masquerade as exact buyer context.
4. Simulation never writes Shop business records.
5. Draft/live versions are distinguishable.
6. Viewport modes use real responsive layout.
7. Internal Brand data never leaks into buyer surface.
8. Blocking context issues prevent publication review.
9. Return to editor restores selected block and scroll.
10. Preview works at all required actual viewports.

## 23. Non-goals

- editing content inside preview;
- real Shop selection/order creation;
- sending invitation;
- native video meeting;
- public anonymous link;
- production/PLM data inspection.
