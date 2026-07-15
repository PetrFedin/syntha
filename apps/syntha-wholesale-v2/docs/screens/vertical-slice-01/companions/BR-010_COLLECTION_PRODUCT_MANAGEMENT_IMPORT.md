# BR-010 — Collection Product Management & Import

## 1. Identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/collections/:collectionId/products`
- **Template:** Entity Registry / Dense Data Workspace
- **Priority:** P0
- **Capabilities:** CAP-COL-004–006,010–011; CAP-CAT-001–019
- **Primary action:** `Add products`

## 2. User goal

Build a commercially complete, buyer-ready collection catalogue with products, colourways, sizes, media, prices, delivery, MOQ/pack and presentation ordering without deep PLM complexity.

## 3. Modes

- table — default operational mode;
- gallery — visual merchandising/review;
- import — structured onboarding flow;
- bulk edit — multi-product commercial updates;
- reorder — presentation ordering.

Mode is URL-stable.

## 4. Desktop layout

```text
EntityHeader + Collection tabs
Readiness issue strip
FilterBar + view switcher + Add products
Canonical DataTable / ProductGallery
BulkActionBar after selection
Right Product Quick Editor 480–560 px
Import flow as full workspace or large drawer
```

## 5. Required table columns

- drag/order handle when reorder mode;
- checkbox;
- image thumbnail;
- style code;
- product name;
- category/subcategory;
- colourway count;
- size scale;
- wholesale price state;
- suggested retail state;
- delivery windows;
- MOQ/pack;
- availability;
- drop/capsule;
- media completeness;
- buyer description completeness;
- readiness issues;
- action menu.

Columns can be configured, but identity, price status, delivery and issues remain high priority.

## 6. Search and filters

- style code/name;
- category/subcategory;
- drop/capsule;
- colour;
- size scale;
- price missing/complete;
- media missing/complete;
- delivery window;
- MOQ/pack type;
- availability;
- readiness severity;
- highlighted/not highlighted;
- recently imported/updated.

## 7. Add products options

1. Add existing Brand catalogue products.
2. Create new product.
3. Import CSV/XLSX.
4. Import from configured PIM/ERP P1.
5. Duplicate from another Collection.

## 8. Quick editor sections

### Identity

- name;
- category;
- buyer description;
- drop/capsule;
- highlight.

### Variants

- colour code/name;
- variant media;
- status.

### Sizes

- size scale;
- size availability metadata;
- pack/curve.

### Commercial

- price list values;
- suggested retail;
- delivery windows;
- MOQ;
- availability state.

### Media

- primary image;
- gallery;
- video;
- alt text/crop.

### Notes

- Brand internal note;
- buyer-facing specification.

## 9. Import workflow

### Upload

- CSV/XLSX;
- file size/type validation;
- encoding/locale detection;
- template download.

### Mapping

- source headers;
- canonical targets;
- reusable mapping profile;
- transforms/defaults;
- enum/category lookup;
- required field indication.

### Preview

Every row classified:

```text
CREATE
UPDATE
UNCHANGED
SKIP
ERROR
CONFLICT
```

Preview shows before/after for updates and total counts.

### Validation

- style/variant identity;
- duplicate external/internal identifiers;
- currency/price format;
- size scale existence;
- colour code;
- date/delivery validity;
- media URL/type;
- category mapping;
- price-list mapping;
- pack JSON/columns.

### Execute

- idempotency key;
- batch processing;
- progress;
- cancel before committed phase where possible;
- partial failure report;
- retry failed rows;
- download error file.

## 10. Data contracts

```ts
type CollectionProductsVM = {
  collection: CollectionSummary;
  readiness: ProductReadinessSummary;
  page: CursorPage<CollectionProductRow>;
  facets: ProductFacets;
  priceLists: PriceListSummary[];
  deliveryWindows: DeliveryWindowSummary[];
  sizeScales: SizeScaleSummary[];
  packRules: PackRuleSummary[];
  permissions: ProductManagementPermissions;
};

type CollectionProductRow = {
  collectionProductId: string;
  productId: string;
  displayOrder: number;
  styleCode: string;
  name: string;
  primaryMedia?: MediaSummary;
  category: CategorySummary;
  variants: VariantSummary[];
  sizeScale?: SizeScaleSummary;
  priceState: 'complete' | 'partial' | 'missing';
  deliveryWindows: DeliveryWindowSummary[];
  minimumOrderQuantity?: number;
  packRule?: PackRuleSummary;
  availability: string;
  drop?: DropSummary;
  readinessIssues: ReadinessIssueSummary[];
  version: string;
};
```

## 11. Commands

```text
AddExistingProductsToCollection
CreateProductAndAddToCollection
UpdateCollectionProduct
BulkUpdateCollectionProducts
RemoveProductFromCollection
ReorderCollectionProducts
CreateImportJob
ValidateImportJob
ExecuteImportJob
RetryImportRows
```

## 12. Bulk actions

P0:

- assign category/drop;
- assign delivery window;
- assign size scale;
- assign MOQ/pack;
- set availability state;
- highlight/unhighlight;
- remove from collection;
- export selected.

P1:

- price update by rule;
- media operations;
- buyer visibility rules.

Every bulk command provides preview and per-row result for risky changes.

## 13. Readiness integration

After relevant changes, readiness recalculates incrementally.

Issue deep links focus:

- specific row;
- specific field/tab;
- import error;
- price list assignment.

Blocking examples:

- no active colourway;
- missing price for required buyer context;
- missing size scale;
- invalid delivery window;
- no primary image where required;
- duplicate style/colour identity;
- referenced archived product.

## 14. Version/concurrency

- each row has version token;
- bulk command uses expected versions or snapshot fingerprint;
- stale quick editor shows compare/reload;
- reorder sends ordered IDs + expected collection version;
- published release unaffected by draft edits.

## 15. Permissions

- read `collection.read/product.read`;
- add/update `collection.update/product.update`;
- import `product.import`;
- bulk `product.bulk_update`;
- pricing fields require `pricing.manage` where separated;
- internal notes require `product.internal_note`;
- media requires `media.manage`.

## 16. Mobile/iPad

### iPad landscape

- reduced columns;
- quick editor right drawer;
- horizontal scroll only for genuinely dense table;
- gallery option preferred for visual review.

### iPhone

- product list cards;
- search/filter sheets;
- individual product editor full-screen;
- bulk edit limited to safe actions;
- import mapping/execution is desktop/iPad-primary; phone can monitor result and fix simple rows.

## 17. Analytics/audit

Track operational events:

```text
collection_product_added
collection_product_updated
collection_product_removed
product_import_started
product_import_completed
product_import_failed
bulk_update_completed
```

Audit sensitive commercial changes and imports.

## 18. Acceptance criteria

- [ ] Products can be added via existing catalogue and structured import.
- [ ] Import preview accurately classifies create/update/error.
- [ ] Re-running same import does not duplicate records.
- [ ] Table supports filters, selection, bulk actions and all universal states.
- [ ] Quick editor updates contextual CollectionProduct and master Product intentionally.
- [ ] Readiness reflects changes and links to exact issue.
- [ ] Published release is unchanged by draft edits.
- [ ] Permission boundaries apply at field/action level.
- [ ] Partial import failure is visible and recoverable.
- [ ] Mobile does not render compressed desktop table.

## 19. Non-goals

- BOM/tech packs;
- supplier/costing workflow;
- raw material data;
- production SKU planning;
- factory inventory.
