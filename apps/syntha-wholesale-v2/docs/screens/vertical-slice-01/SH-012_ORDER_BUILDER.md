# SH-012 — Order Builder

## 1. Screen identity

- **Role:** Shop
- **Route:** `/wholesale-v2/shop/orders/:orderId/edit`
- **Template:** Builder Workspace
- **Priority:** P0
- **Primary job:** convert an approved selection into a valid wholesale order draft quickly and accurately.
- **Primary action:** `Review order`
- **Save model:** continuous autosave with version and conflict handling.

## 2. Product promise

Order Builder must be faster and clearer than spreadsheet-based ordering and stronger than conventional B2B wholesale order forms.

The buyer must be able to:

- add/remove products without leaving the order;
- enter quantities by colour and size;
- use keyboard and paste;
- apply size curves;
- split by delivery;
- see totals instantly;
- understand MOQ/pack/order-minimum rules;
- see budget impact;
- collaborate without silent overwrites;
- preserve source selection and product context;
- reach a clear Review step.

## 3. Entry points

- Selection → Create order draft;
- Selection → Open order draft;
- Shop Order Registry → Draft order;
- Shop Dashboard action queue;
- DealSpace deep link;
- notification about saved draft/conflict;
- return from Order Validation.

## 4. Exit points

- Review Order / Order Validation;
- return to Selection;
- open Product Quick View;
- open DealSpace order thread;
- save and close;
- duplicate scenario P1;
- export draft P1/P0 according to permission.

## 5. Data contract

```ts
type OrderBuilderVM = {
  order: {
    id: string;
    orderNumber: string;
    status: 'draft' | 'internal_review' | 'changes_requested';
    versionId: string;
    versionNumber: number;
    brandOrganisationId: string;
    shopOrganisationId: string;
    campaignId: string;
    collectionIds: string[];
    currency: string;
    priceListId: string;
    owner: UserSummary;
    collaborators: UserSummary[];
    buyerReference?: string;
    updatedAt: string;
  };
  source: {
    selectionId?: string;
    availableProducts: OrderSourceProduct[];
    sourceVersionIds: string[];
  };
  lines: OrderLineEditorVM[];
  deliveryWindows: DeliveryWindowSummary[];
  commercialTerms: CommercialTermsSnapshot;
  budget?: BudgetComparison;
  totals: OrderTotals;
  validation: OrderValidationResult;
  saveState: OrderSaveState;
  permissions: OrderBuilderPermissions;
};
```

### Line editor model

```ts
type OrderLineEditorVM = {
  lineId: string;
  collectionProductId: string;
  productId: string;
  productVariantId: string;
  styleCode: string;
  name: string;
  imageUrl?: string;
  category: string;
  colourCode: string;
  colourName: string;
  sizeScale: string[];
  sizeQuantities: Record<string, number>;
  deliveryWindowId: string;
  unitWholesalePrice: Money;
  suggestedRetailPrice?: Money;
  discountPercent?: number;
  minimumOrderQuantity?: number;
  packRule?: PackRuleSummary;
  availability: 'available' | 'limited' | 'unavailable';
  totalUnits: number;
  lineTotal: Money;
  buyerComment?: string;
  validationIssues: ValidationIssue[];
  sourceSelectionItemId?: string;
  sourceLookId?: string;
};
```

## 6. Canonical desktop layout

```text
BuilderHeader 56 px
├── Back / order identity
├── Draft version
├── Autosave state
├── Collaborators
├── Undo / Redo
├── Validation count
└── Review order

Source rail 240–280 px
├── Search
├── Selection products
├── Collection products
├── Looks/categories
└── Filters

Matrix workspace flexible, min 640 px
├── Product groups
├── Colour rows
├── Size columns
├── Quantity cells
├── Delivery assignment
└── Line totals

Summary inspector 320–380 px
├── Units/value
├── Budget
├── Delivery mix
├── MOQ/order minimum
├── Validation
└── Terms

Bottom status/validation bar 40 px when needed
```

At narrower widths, Source and Summary become drawers/modes. The matrix always receives priority.

## 7. Builder header

### Left

- back to Selection/Order detail;
- order number or `Draft order`;
- Brand and campaign;
- version number;
- status.

### Centre

- save state: Saved / Saving / Failed / Conflict;
- collaborator presence;
- undo/redo;
- optional compact units/value.

### Right

- Messages;
- More;
- primary `Review order`.

No `Submit order` directly from Builder. Submission occurs only after Review/Validation.

## 8. Source rail

### Sources

- Selected products;
- All buyer-visible collection products;
- Looks;
- Categories;
- Recently removed;
- Issues/missing items.

### Search and filters

- style/name/code;
- category;
- colour;
- drop;
- delivery;
- availability;
- in order/not in order;
- decision from Selection;
- MOQ/pack type.

### Source card

Shows:

- image;
- style/name;
- colour count;
- price;
- delivery;
- availability;
- selection decision;
- in-order quantity;
- `Add` or `Open`.

Adding a product:

- creates line seed using current buyer price list;
- defaults to appropriate variant/delivery only when unambiguous;
- otherwise opens a compact chooser;
- preserves source references;
- is undoable.

## 9. Matrix structure

### Hierarchy

```text
Product group
  Colour row
    Size quantity cells
    Delivery
    Units
    Value
    Issues
```

### Sticky areas

- product identity column;
- size header;
- optional right totals;
- current product group header during vertical scroll.

### Quantity cell

Requirements:

- minimum 44 × 40 px desktop; 44 × 44 touch interaction target;
- empty means no quantity;
- zero semantics explicit;
- positive integers only;
- visual focus ring;
- invalid state with reason, not red-only;
- supports direct typing;
- commits on Enter/Tab/blur safely;
- does not move focus unexpectedly after autosave.

## 10. Keyboard-first editing

Required:

- Tab / Shift+Tab moves cells;
- arrows move within matrix;
- Enter confirms and moves according to configured direction;
- typing replaces selected cell;
- Delete clears;
- Cmd/Ctrl+C and V support rectangular paste where valid;
- Cmd/Ctrl+Z / Shift+Cmd/Ctrl+Z undo/redo;
- Home/End optional within row;
- keyboard shortcut help accessible.

Paste workflow:

1. parse clipboard grid;
2. preview affected cells if shape/values ambiguous;
3. validate integers and size mapping;
4. apply as one undoable command;
5. show summary of skipped/invalid cells.

## 11. Size curve tools

P0:

- fill same quantity across sizes;
- apply saved/manual ratio curve;
- multiply curve by pack count;
- clear row;
- copy quantities from another colour;
- duplicate across delivery split when valid.

P1:

- historical curve;
- AI suggested curve;
- store-specific curve.

Every bulk operation previews or clearly states the result and is undoable.

## 12. Pack and MOQ handling

### Fixed pack

Display size composition and number of packs. Buyer edits pack count or, if permitted, units consistent with pack.

### Ratio pack

Display ratio and multiplier.

### Free units

Buyer edits individual sizes with minimum constraints.

### Validation

- product MOQ;
- colour MOQ;
- pack minimum;
- order minimum;
- delivery minimum if configured;
- incompatible size/pack quantity.

Each issue explains:

- current amount;
- required amount;
- affected line;
- suggested fix;
- whether blocking or warning.

Example:

`12 units selected. Minimum is 18. Add 6 units or remove the colour.`

No cryptic rule codes in primary UI.

## 13. Delivery handling

P0:

- delivery window per line/colour;
- change delivery through row selector;
- split line across two or more windows;
- delivery totals;
- invalid/closed delivery warning;
- delivery date range and market context.

Split editor:

- opens drawer/modal;
- shows total quantities to allocate;
- quantity per size per delivery if supported;
- totals must reconcile;
- cannot silently duplicate quantities.

P1:

- split by store/location;
- delivery scenario comparison.

## 14. Summary inspector

### Sections

1. Order totals;
2. Budget;
3. Delivery mix;
4. Minimums and packs;
5. Validation;
6. Commercial terms;
7. Notes/collaboration.

### Order totals

- total units;
- wholesale value;
- suggested retail value if permitted;
- expected margin if permitted;
- product count;
- colour count;
- delivery count;
- currency.

Totals update immediately from local command state, then reconcile with server-calculated totals.

### Budget

- total budget;
- current order;
- remaining/over;
- category/brand allocation flags;
- advisory or blocking policy label.

### Commercial terms

Read-only snapshot:

- price list;
- currency;
- tax display;
- payment terms;
- order deadline;
- minimum order;
- delivery terms.

Terms cannot change silently while order draft is open.

## 15. Validation model

### Inline

Line/cell issues near the affected data.

### Inspector summary

Grouped by:

- blocking;
- warnings;
- acknowledged informational notices.

### Bottom bar

Appears when:

- blocking issues exist;
- save failed;
- version conflict;
- material source change;
- offline/retry state.

Clicking issue focuses affected row/cell and opens explanation.

## 16. Autosave

### Behaviour

- local command updates immediately;
- debounce network save;
- ordered mutation queue;
- idempotency keys;
- optimistic concurrency version;
- visible save state;
- retry without losing edits;
- route exit protection when unsynced.

### Offline/intermittent connection

- P0 can be retry-safe without full offline mode;
- retain local pending edits in memory/local recovery where approved;
- show `Changes not synced`;
- Review disabled until server reconciliation.

## 17. Undo/redo

Command history includes:

- quantity edits;
- paste;
- curve application;
- add/remove product;
- delivery change/split;
- bulk clear;
- comment edit when local and safe.

Server save does not erase local undo history within the active session unless version reload occurs.

## 18. Conflict handling

When another user edits the same draft:

- presence is visible;
- P0 may use optimistic concurrency rather than real-time co-editing;
- conflict banner stops further autosave;
- show changed lines and actor/time;
- actions: Reload latest, Compare and reapply, Save recovery copy;
- no last-write-wins silent overwrite.

P1 real-time co-editing can be added later.

## 19. Material source changes

If Brand publishes changes to product/price/delivery while order is open:

- active order remains tied to its commercial snapshot;
- show update notice;
- list affected lines;
- buyer chooses whether to refresh/rebase if policy allows;
- confirmed/submitted snapshots remain immutable;
- unavailable product may become blocking according to Brand policy, but is not removed silently.

## 20. Collaboration

### Comments

- order-level comment;
- product/line comment;
- Shop internal comment;
- shared Brand comment;
- mentions;
- linked DealSpace thread.

### Brand suggestions

Not applied silently. They create OrderSuggestion records for later Brand review flows.

P0 Shop Builder may display existing shared comments but Brand direct line editing is outside this screen.

## 21. Review order action

Enabled when:

- server save is current;
- no unresolved version conflict;
- order contains at least one positive-quantity line;
- required commercial context exists.

On action:

1. flush pending saves;
2. server recalculates totals and validation;
3. if blocking issues: remain in Builder and focus issue summary;
4. if valid: navigate to `SH-013 Order Validation` with current version ID;
5. preserve Builder scroll/focus state for return.

## 22. Empty states

### Draft has no lines

- Source rail remains usable;
- central state: `Add products from your selection or collection`;
- primary inside canvas: `Add selected products` if source selection exists.

### No source products available

Explain access/collection issue and link to Brand contact/Selection.

### Filter no results

Clear filters.

## 23. Loading states

- builder shell/header first;
- matrix skeleton with sticky dimensions;
- source and summary load independently after order identity;
- order is read-only until version lock/context is loaded;
- no global spinner after initial route.

## 24. Error states

- order not found/access denied;
- price context failed;
- draft load failed;
- autosave failed;
- validation failed;
- source product unavailable;
- delivery rules unavailable;
- conflict;
- review transition failed.

Entered quantities are preserved whenever technically possible.

## 25. Permissions

- `order.read`;
- `order.write`;
- `order.submit` used only on next screen;
- `selection.read`;
- price visibility;
- DealSpace write;
- budget read;
- export permission.

Read-only mode supports inspection/export but hides editing cells and Review action.

## 26. Responsive behaviour

### MacBook / full-screen

- full three-pane layout;
- source 240–280 px;
- matrix priority;
- summary 320–380 px;
- panels collapsible;
- keyboard-first;
- full-screen route may hide global sidebar while keeping clear exit/context.

### 1180–1279 px

- one side pane collapses;
- summary may be drawer;
- matrix retains minimum width;
- no proportional squeezing of every pane.

### iPad landscape

- source drawer;
- matrix primary surface;
- summary compact rail/drawer;
- sticky totals bar;
- touch quantity editor;
- hardware keyboard navigation.

### iPad portrait

Segmented modes:

1. Products;
2. Quantities;
3. Delivery;
4. Summary.

Persistent compact header shows units, value, validation and save state.

### iPhone

No full desktop matrix.

Guided flow:

1. Product list;
2. Product/colour quantity editor;
3. Delivery assignment;
4. Budget and issues;
5. Review.

Per-product editor:

- product header/image;
- colour tabs;
- size quantity grid 2–4 columns;
- delivery selector;
- line total;
- previous/next product.

Sticky bottom summary:

`Units · Value · Issues · Review`

Mobile input font minimum 16 px.

## 27. Performance requirements

Realistic fixture target must include:

- at least 250 products available in source;
- at least 80 lines in order;
- multiple colourways and 8–15 sizes;
- multiple deliveries;
- validations.

Acceptance:

- no perceptible typing lag;
- totals update within one animation frame/local calculation budget;
- network save does not block typing;
- virtualisation where required;
- focus does not jump during row render;
- paste of a realistic matrix completes with feedback.

Exact numeric performance budgets must be fixed in implementation ADR based on runtime measurements.

## 28. Analytics events

- `order_builder_opened`;
- `order_line_added`;
- `order_line_removed`;
- `order_quantity_changed` aggregated, not every keystroke;
- `order_matrix_pasted`;
- `order_size_curve_applied`;
- `order_delivery_changed`;
- `order_delivery_split_created`;
- `order_validation_issue_opened`;
- `order_autosave_failed`;
- `order_conflict_detected`;
- `order_review_started`;
- `order_review_blocked`.

Do not log sensitive comments or raw clipboard values.

## 29. Acceptance criteria

1. Selection converts into correct order-line seeds.
2. Buyer can add/remove products without leaving Builder.
3. Size/colour quantity entry works with keyboard and touch.
4. Paste, fill, curve, clear and undo work as atomic commands.
5. Totals update immediately and reconcile with server.
6. MOQ/pack/order minimum explanations are actionable.
7. Delivery assignment and splitting reconcile exactly.
8. Autosave is idempotent and conflict-safe.
9. Review cannot use stale/unsaved version.
10. Source commercial changes never silently rewrite draft.
11. Full desktop, iPad and guided iPhone modes pass responsive review.
12. Large realistic matrix remains usable.
13. No spreadsheet export/import is required for the main flow.
14. No consumer checkout/payment/production controls appear.

## 30. Non-goals

- final submission from Builder;
- Brand confirmation;
- payment;
- invoice;
- production allocation;
- warehouse availability allocation;
- native real-time co-editing P0;
- AI recommendations P0;
- full offline mode P0.
