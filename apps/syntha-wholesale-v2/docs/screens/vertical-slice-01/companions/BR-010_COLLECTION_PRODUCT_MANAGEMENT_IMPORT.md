# BR-010 — Collection Product Management & Import

## 1. Identity

- **Role:** Brand.
- **Route:** `/wholesale-v2/brand/collections/:collectionId/products`.
- **Template:** Entity Registry / Dense Data Workspace.
- **Priority:** P0.
- **Capabilities:** CAP-COL-004–006, CAP-COL-010–011, CAP-CAT-001–019.
- **Workflows:** WF-004, WF-005.
- **Primary action:** `Add products`.

## 2. User goal

Build a commercially complete buyer-ready Collection with products, colourways, sizes, media, prices, delivery, MOQ/pack and merchandising order without adding deep PLM complexity.

## 3. Modes

- `table` — default operational mode;
- `gallery` — visual review and merchandising;
- `import` — CSV/XLSX structured onboarding;
- `bulk_edit` — multi-product commercial changes;
- `reorder` — presentation sequence.

Mode, filters, sort and visible columns persist in URL/user view.

## 4. Layout

Desktop:

```text
EntityHeader + Collection tabs
Readiness issue strip
FilterBar + View switcher + Add products
Canonical DataTable or ProductGallery
BulkActionBar when rows selected
Right Product Quick Editor 480–560 px
Import flow as dedicated workspace or large drawer
```

Mobile/iPad:

- iPad keeps reduced columns and right drawer;
- iPhone uses product list cards and full-screen editor;
- import mapping/execution is desktop/iPad-primary;
- phone can monitor jobs and fix simple row errors;
- no compressed desktop table.

## 5. Table columns

Required:

- reorder handle in reorder mode;
- selection checkbox;
- image;
- style code;
- product name;
- category/subcategory;
- colourway count;
- size scale;
- wholesale price status;
- suggested retail status;
- delivery windows;
- MOQ/pack;
- availability;
- drop/capsule;
- media completeness;
- description/spec completeness;
- readiness issues;
- actions.

Identity, price state, delivery and issues cannot all be hidden.

## 6. Search and filters

- style/name/code;
- category/subcategory;
- drop/capsule;
- colour;
- size scale;
- price complete/partial/missing;
- media complete/missing;
- delivery;
- MOQ/pack type;
- availability;
- readiness severity;
- highlighted;
- recent import/update;
- master product state.

## 7. Add product options

1. Add existing Brand catalogue product.
2. Create new commercial product.
3. Import CSV/XLSX.
4. Import from configured PIM/ERP P1.
5. Duplicate from another Collection.

Each option produces `CollectionProduct` references; no copied disconnected product JSON.

## 8. Quick Editor

### Identity

- name;
- category/subcategory;
- buyer-facing description;
- drop/capsule;
- highlighted flag.

### Variants

- colour code/name;
- status;
- primary and additional variant media.

### Sizes

- size scale;
- available size metadata;
- pack/curve rule.

### Commercial

- price list values;
- suggested retail;
- delivery windows;
- MOQ;
- order/pack constraints;
- availability state.

### Media

- primary image;
- gallery;
- video;
- alt text;
- crop/focal point.

### Notes/specifications

- buyer-facing structured specs;
- Brand-internal note with explicit visibility.

## 9. Import workflow

### 9.1 Upload

- CSV/XLSX;
- file type/size check;
- encoding/locale detection;
- template download;
- presigned secure upload and malware validation.

### 9.2 Mapping

- source column/path;
- canonical target;
- required marker;
- transform/default;
- enum/category lookup;
- reference lookup;
- reusable versioned mapping profile.

### 9.3 Preview

Every row classified:

```text
CREATE | UPDATE | UNCHANGED | SKIP | ERROR | CONFLICT
```

Preview shows before/after for updates and total counts.

### 9.4 Validation

- style/variant identity;
- duplicate identifiers;
- currency/price format;
- size scale;
- colour code;
- delivery date/window;
- media URL/type;
- category mapping;
- price-list mapping;
- pack data;
- referenced product/variant state.

### 9.5 Execute

- idempotency key;
- batches;
- progress;
- resumable worker;
- partial result;
- retry failed rows;
- downloadable error file;
- source file/mapping fingerprint retained.

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
  availability: 'available' | 'limited' | 'unavailable' | 'unknown';
  drop?: DropSummary;
  readinessIssues: ReadinessIssueSummary[];
  version: string;
};
```

Import:

```ts
type ImportJobVM = {
  id: string;
  status: 'uploaded' | 'parsing' | 'mapping' | 'validated' | 'executing' | 'partial' | 'failed' | 'completed';
  mappingProfile?: MappingProfileSummary;
  counts: { total: number; create: number; update: number; skip: number; error: number; conflict: number };
  rows: CursorPage<ImportPreviewRow>;
  version: string;
};
```

## 11. Queries and commands

Queries:

```text
ListCollectionProducts
GetProductFacets
GetCollectionProductEditor
GetImportJob
GetImportMappingProfiles
```

Commands:

```text
AddExistingProductsToCollection
CreateProductAndAddToCollection
UpdateCollectionProduct
BulkUpdateCollectionProducts
RemoveProductFromCollection
ReorderCollectionProducts
CreateImportJob
SaveImportMapping
ValidateImportJob
ExecuteImportJob
RetryImportRows
CancelImportJob
```

## 12. Bulk actions

P0:

- assign category/drop;
- assign delivery window;
- assign size scale;
- assign MOQ/pack;
- set availability;
- highlight/unhighlight;
- remove from Collection;
- export selected.

Risky bulk changes show preview and per-row result.

P1:

- rule-based price update;
- media operations;
- buyer visibility assignment.

## 13. Readiness integration

Relevant changes trigger incremental readiness recalculation.

Issue deep links target exact:

- row;
- field/tab;
- import error;
- price-list assignment.

Blocking examples:

- no active colourway;
- missing required price;
- missing size scale;
- invalid delivery;
- missing primary media where required;
- duplicate style/colour identity;
- archived product;
- invalid pack rule.

## 14. Concurrency and versioning

- row version token;
- collection version for reorder/bulk context;
- stale quick editor shows reload/compare;
- import execution uses fingerprint/idempotency;
- published release remains unchanged;
- submitted Order snapshots remain unchanged.

## 15. Permissions

- read: `collection.read`, `product.read`;
- add/update: `collection.update`, `product.update`;
- import: `product.import`;
- bulk: `product.bulk_update`;
- pricing fields: `pricing.manage`;
- media: `media.manage`;
- internal notes: `product.internal_note`.

Fields/actions are server-redacted when permission is absent.

## 16. States

- loading table/gallery;
- empty Collection;
- no filter results;
- editor loading/saving/saved/error/conflict;
- import uploading/parsing/mapping/validating/executing/partial/failed/completed;
- bulk preview/executing/partial;
- forbidden;
- product archived externally;
- price/reference unavailable.

## 17. Events and audit

```text
collection.products_changed
product.created
product.updated
product.import_started
product.import_completed
product.import_failed
collection.readiness_changed
```

Audit import source, mapping profile, actor, counts and commercial bulk changes.

## 18. Performance

- cursor pagination or virtualization;
- image lazy loading;
- bulk operations execute server-side;
- filter/search debounced;
- large imports handled asynchronously;
- row update does not refetch unrelated app data.

## 19. Accessibility

- semantic table headers;
- keyboard row navigation;
- accessible reorder alternative;
- status not colour-only;
- validation summary and row links;
- 44×44 touch targets on tablet/mobile.

## 20. Acceptance criteria

- [ ] Existing and new products can be added.
- [ ] Import preview accurately classifies every row.
- [ ] Repeated import does not duplicate records.
- [ ] Partial failure is visible, downloadable and recoverable.
- [ ] Quick editor intentionally updates Product vs CollectionProduct fields.
- [ ] Bulk actions report per-row result.
- [ ] Readiness updates and links to exact problem.
- [ ] Published release is not mutated.
- [ ] Field/action permissions are enforced server-side.
- [ ] Desktop/iPad/iPhone layouts comply with visual system.

## 21. Non-goals

- BOM/tech packs;
- supplier/costing;
- raw materials;
- factory inventory;
- production planning;
- PLM lifecycle execution.
