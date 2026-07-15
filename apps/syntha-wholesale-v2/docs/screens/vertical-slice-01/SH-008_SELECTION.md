# SH-008 — Selection

## 1. Screen identity

- **Role:** Shop
- **Route:** `/wholesale-v2/shop/campaigns/:campaignId/selections/:selectionId`
- **Template:** Registry / Buying Workspace
- **Priority:** P0
- **Primary job:** turn showroom interest into an approved set of products ready for quantity entry.
- **Primary action:** `Create order draft`

## 2. Product intent

Selection is the decision layer between browsing and ordering.

It must help a buyer answer:

- What have we selected?
- What is still undecided?
- What should be excluded?
- Are key categories/deliveries missing?
- Are prices, MOQ and availability acceptable?
- Is the team ready to start quantity entry?

Selection is not a cart and not yet the final order matrix.

## 3. Entry points

- Collection Showroom → Open selection;
- Buying Workspace;
- Campaign Detail;
- Shop Dashboard;
- internal notification/comment;
- direct link;
- return from Order Builder.

## 4. Exit points

- return to Showroom with state preserved;
- open Product Quick View;
- compare products;
- open comments/DealSpace;
- create Order draft;
- open existing linked Order draft;
- export review list when permitted.

## 5. Data contract

```ts
type SelectionScreenVM = {
  selection: {
    id: string;
    status: 'draft' | 'review' | 'approved' | 'converted_to_order' | 'archived';
    owner: UserSummary;
    collaborators: UserSummary[];
    currency: string;
    updatedAt: string;
    sourceCollectionIds: string[];
    linkedOrderId?: string;
  };
  campaign: CampaignSummary;
  brand: BrandSummary;
  items: SelectionItemVM[];
  summary: {
    totalItems: number;
    undecided: number;
    shortlisted: number;
    approved: number;
    excluded: number;
    indicativeUnits?: number;
    indicativeWholesale: Money;
    suggestedRetail?: Money;
    expectedMarginPercent?: number;
    categoryMix: DimensionSummary[];
    deliveryMix: DimensionSummary[];
  };
  budget?: BudgetComparison;
  readiness: SelectionReadinessResult;
  permissions: SelectionPermissionFlags;
};
```

### Selection item view model

```ts
type SelectionItemVM = {
  id: string;
  collectionProductId: string;
  productId: string;
  variantId?: string;
  styleCode: string;
  name: string;
  imageUrl: string;
  category: string;
  colourName?: string;
  colourCount: number;
  wholesalePrice: Money;
  suggestedRetailPrice?: Money;
  expectedMarginPercent?: number;
  deliveryWindows: DeliveryWindowSummary[];
  selectedDeliveryWindowId?: string;
  sizeScale: string[];
  availability: 'available' | 'limited' | 'unavailable';
  minimumOrderQuantity?: number;
  packRule?: PackRuleSummary;
  decision: 'undecided' | 'shortlisted' | 'approved' | 'excluded';
  quantityIntent?: number;
  buyerNote?: NoteSummary;
  internalCommentCount: number;
  sharedCommentCount: number;
  source: {
    mode: 'story' | 'grid' | 'look' | 'linesheet' | 'manual';
    lookId?: string;
    blockId?: string;
  };
  changedSinceSelected?: ChangeNotice[];
};
```

## 6. Desktop layout

```text
Workspace / Entity Header
├── Brand + Campaign + Collection context
├── Selection status
├── Collaborators
├── Last saved
├── Secondary: Return to showroom / Compare
└── Primary: Create order draft

Summary strip
FilterBar
Main product table or review cards
Optional decision/budget inspector 320–380 px
Sticky action/status bar when selection is multi-selected
```

The default view is a structured product table/list, not a decorative card wall. A gallery mode is available for visually driven review.

## 7. Header

### Identity

`Selection — Brand / Campaign`

Supporting line:

`42 products · 18 approved · €64,800 indicative value`

### Primary action states

```text
No selected items                → disabled/omitted with explanation
Undecided items remain           → Create order draft allowed with warning or blocked by Shop policy
Blocking commercial issues       → Review issues
Already converted                → Open order draft
Read-only role                   → no primary write action
```

Do not label the action `Checkout` or `Buy`.

## 8. Summary strip

Maximum six concise metrics:

- Products;
- Approved;
- Undecided;
- Indicative wholesale value;
- Budget usage if configured;
- Blocking issues.

Metrics are clickable filters where useful.

## 9. Filters and views

### Search

- style code;
- product name;
- category;
- colour.

### Quick filters

- Undecided;
- Shortlisted;
- Approved;
- Excluded;
- Changed since selected;
- Issues;
- Notes/comments.

### Advanced filters

- category/subcategory;
- drop/capsule;
- colour;
- delivery window;
- availability;
- price range;
- margin range when permitted;
- MOQ/pack;
- source look/block;
- assigned reviewer;
- decision.

### Views

- Review table — default;
- Gallery;
- By category;
- By delivery;
- By look source.

## 10. Review table columns

| Column | Behaviour |
|---|---|
| Product | thumbnail + name + style; sticky |
| Colour | chosen colour or unresolved indicator |
| Decision | segmented/status control |
| Price | wholesale; retail/margin secondary when allowed |
| Delivery | selected/default + alternatives |
| MOQ/Pack | concise rule + issue indicator |
| Quantity intent | optional indicative units, not order quantity matrix |
| Notes | private/internal/shared counts |
| Changed | material change indicator |
| Actions | quick view / remove / more |

### Decision control

Allowed states:

- Undecided;
- Shortlisted;
- Approved;
- Excluded.

Bulk decision update is supported with undo.

Excluded products remain available under filter and can be restored. They are not physically deleted by default.

## 11. Gallery view

Uses canonical Selection ProductCard.

Shows:

- image;
- style/name;
- colour;
- price;
- delivery;
- decision;
- issue/note indicators;
- quick view.

Decision control must remain touch-accessible and not rely on hover.

## 12. Selection decision workflow

Recommended flow:

```text
Undecided
→ Shortlisted
→ Approved
→ Order draft
```

Alternative:

```text
Undecided / Shortlisted
→ Excluded
```

Rules:

- Brand cannot silently change Shop decisions;
- Shop users with review permission can update decisions;
- internal approval policy may require all included items Approved;
- creating an order snapshots included items but keeps Selection history;
- future changes in Selection do not silently mutate an existing Order draft unless user explicitly syncs.

## 13. Commercial change notices

When Brand publishes a material change after selection:

- affected item gets `Changed` badge;
- old and new values available in comparison drawer;
- changes may include price, availability, delivery, MOQ, pack, visibility;
- unavailable/hidden item becomes blocking for order conversion;
- buyer explicitly accepts/reviews change;
- private decision history is retained.

## 14. Notes and collaboration

### Note types

- Private to me;
- Internal to Shop;
- Shared with Brand.

### Product comments

- open contextual thread;
- mention Shop teammates;
- message Brand only in Shared mode;
- link product and colour automatically;
- task conversion P1.

The screen must never expose private/internal Shop content to Brand analytics or DealSpace.

## 15. Comparison

P0 entry point available for up to four products.

Comparison dimensions:

- image;
- category;
- colourways;
- wholesale price;
- retail/margin;
- delivery;
- size range;
- MOQ/pack;
- availability;
- notes/decision.

Full `SH-009 Compare Products` may be P1, but the selection contract reserves comparison IDs and actions.

## 16. Budget context

When BudgetPlan exists:

- total budget;
- current selection value;
- over/under amount;
- category allocation;
- brand allocation;
- delivery allocation P1.

Budget is advisory unless Shop policy marks it blocking.

No budget means the panel is omitted, not filled with zeros.

## 17. Readiness to create order

Blocking issues may include:

- no included products;
- selected product unavailable;
- missing price;
- missing colour/variant;
- incompatible currency;
- invalid access/collection version;
- no delivery window;
- unresolved material change;
- user lacks order permission.

Warnings:

- undecided products remain;
- budget exceeded;
- MOQ likely not met based on quantity intent;
- category imbalance;
- selection contains products from multiple incompatible commercial contexts.

Each issue filters/highlights affected items.

## 18. Create order draft flow

On action:

1. show review dialog/screen summary;
2. choose included decision states (`Approved`, optionally `Shortlisted`);
3. confirm Brand, campaign, collection version, currency and price list;
4. identify excluded/blocking items;
5. create Order + draft OrderVersion;
6. convert each included SelectionItem to OrderLine seed;
7. preserve source references;
8. redirect to Order Builder.

Idempotency key required. Double-click cannot create two drafts.

If linked draft already exists, action becomes `Open order draft`. Creating another requires explicit duplicate/new scenario flow later.

## 19. Empty states

### Selection empty

Title: `Your selection is empty`

Primary: `Return to showroom`

### No filter results

`Clear filters`.

### All items excluded

Explain that no items are eligible for order draft. Offer `Review excluded` or `Return to showroom`.

## 20. Loading state

- header and summary skeleton;
- rows preserve dimensions;
- selection mutation uses optimistic state only with rollback;
- background price/availability refresh does not reorder rows unexpectedly;
- sticky save/sync state when offline or retrying.

## 21. Error and conflict states

- selection load failed;
- decision update failed;
- stale collection version;
- price context changed;
- order draft creation failed;
- concurrent Shop edit conflict.

Conflict handling shows who/when and allows refresh/compare/reapply. Never silently discard a buyer decision.

## 22. Permissions

- selection.read;
- selection.write;
- selection.approve;
- order.create;
- dealspace.write;
- budget.read;
- export permission.

Read-only users can filter, view and export where permitted but cannot change decisions or create order.

## 23. Keyboard behaviour

- `/` search;
- arrow row navigation;
- Enter opens quick view;
- Space toggles row selection;
- decision control keyboard accessible;
- bulk actions accessible after multi-select;
- Cmd/Ctrl+Z undo latest local decision batch when safe;
- Escape closes inspector/dialog.

## 24. Responsive behaviour

### MacBook / desktop

- full table and optional inspector;
- sticky header/identity;
- summary strip;
- bulk action bar;
- gallery optional.

### iPad landscape

- hide lower-priority columns;
- inspector drawer;
- decision touch control;
- list/table hybrid;
- summary remains visible.

### iPad portrait

- product review cards grouped by decision/category;
- filters sheet;
- budget/readiness in collapsible panel;
- sticky Create order action when eligible.

### iPhone

- list cards;
- each row shows product, decision, price, delivery, issue;
- swipe optional but never sole decision path;
- filter/sort bottom sheet;
- product quick view full-screen;
- sticky summary: items · value · issues;
- primary action sticky bottom;
- bulk editing via select mode, not tiny checkboxes always visible.

## 25. Analytics events

- `selection_viewed`;
- `selection_filter_applied`;
- `selection_view_changed`;
- `selection_decision_changed`;
- `selection_bulk_decision_changed`;
- `selection_product_opened`;
- `selection_note_created`;
- `selection_comparison_started`;
- `selection_material_change_reviewed`;
- `order_draft_creation_started`;
- `order_draft_created`;
- `order_draft_creation_failed`.

## 26. Acceptance criteria

1. Showroom selections persist here without duplication.
2. Buyer can make and bulk-edit decisions.
3. Private/internal/shared content remains correctly isolated.
4. Commercial changes are visible and require review.
5. Readiness identifies all blocking conversion issues.
6. Order draft creation is idempotent and preserves source links.
7. Existing linked order opens instead of silently duplicating.
8. Budget appears only when configured.
9. Required responsive states work.
10. Selection remains a decision workspace, not a consumer cart.

## 27. Non-goals

- final size/colour quantities;
- order submission;
- Brand-side editing;
- payment/checkout;
- production allocation;
- multi-brand cross-campaign selection in the first slice.
