# BR-009 — Collection Overview

## 1. Screen identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/collections/:collectionId`
- **Template:** Entity Workspace
- **Priority:** P0
- **Primary job:** prepare one collection for buyer presentation and ordering.
- **Dynamic primary action:** based on readiness and publication state.

## 2. User goal

The Brand user must understand:

- what the collection contains;
- whether product and commercial data are complete;
- how the collection will appear to a buyer;
- which buyers can access it;
- whether it can be previewed or published;
- what must be fixed next.

## 3. Entry points

- Campaign Overview → collection;
- Collection Registry;
- global search;
- product/preview/publish back-navigation;
- notification about readiness or publication change;
- direct link.

## 4. Exit points

- open product table;
- add/import products;
- edit commercial terms;
- open Showroom Composer;
- open Buyer Preview;
- open Publish Review;
- open campaign;
- view release history.

## 5. Data contract

```ts
type CollectionOverviewVM = {
  collection: Collection;
  campaign: CampaignSummary;
  currentDraftVersion: CollectionVersionSummary;
  publishedVersion?: CollectionVersionSummary;
  productSummary: {
    total: number;
    active: number;
    unavailable: number;
    missingMedia: number;
    missingPrice: number;
    missingDelivery: number;
    missingSizeScale: number;
  };
  presentationSummary: {
    storyBlockCount: number;
    lookCount: number;
    productGridCount: number;
    videoCount: number;
    isConfigured: boolean;
  };
  commercialSummary: {
    priceListIds: string[];
    currencies: string[];
    deliveryWindowIds: string[];
    orderDeadline?: string;
    minimumOrder?: Money;
    productsWithMOQ: number;
    productsWithPackRules: number;
  };
  accessSummary: {
    eligibleShops: number;
    activeGrants: number;
    excludedShops: number;
    audienceSegments: string[];
  };
  readiness: CollectionReadinessResult;
  recentActivity: ActivityEvent[];
  permissions: CollectionPermissionFlags;
};
```

## 6. Entity header

Contains:

- Campaign breadcrumb;
- collection name/code;
- season/drop;
- status;
- product count;
- owner;
- published version when applicable;
- last saved state;
- one primary action;
- Preview secondary action;
- More menu.

### Primary action resolution

```text
No products                        → Add products
Products incomplete               → Resolve product issues
Products ready, presentation empty→ Build showroom
Presentation incomplete           → Continue showroom
Ready, not published              → Review and publish
Published with no draft changes   → Preview buyer view
Published with draft changes      → Review changes
Closed                            → View published version
Archived                          → Restore, if permitted
```

## 7. Tabs

P0 visible:

1. Overview;
2. Products;
3. Presentation;
4. Commercial;
5. Access;
6. Activity;
7. More.

`More` includes Looks, Documents, Versions and Settings when not visible.

## 8. Desktop layout

```text
EntityHeader
Tabs

Main area
├── Readiness summary
├── Product readiness
├── Presentation readiness
├── Commercial context
├── Buyer access
└── Version/change summary

Context rail
├── Publish checklist
├── Campaign facts
├── Last activity
└── Quick links
```

The screen is not a collection editor itself. Each summary section routes to its focused editing surface.

## 9. Overview section order

### 9.1 Buyer readiness

First and visually dominant operational section.

Shows:

- overall state: Incomplete / Ready / Published / Changes pending;
- completed required checks;
- blocking issues;
- warnings;
- exact next action.

Issue examples:

- product missing wholesale price;
- no buyer-visible image;
- invalid size scale;
- no delivery window;
- product unavailable in every colour;
- missing default price list;
- presentation has no shoppable product surface;
- no access audience configured;
- unpublished material changes after prior release.

### 9.2 Products

Summary card/section:

- total products;
- active colourways;
- missing commercial fields;
- unavailable items;
- category distribution compact list;
- `Open products`;
- `Add products` when permitted.

Do not show a decorative category chart when a sortable count list is clearer.

### 9.3 Presentation

Shows:

- cover thumbnail;
- story blocks;
- looks;
- product grids;
- linesheet enabled;
- video count;
- last edited by/time;
- `Open Showroom Composer`.

WFX-influenced capability:

- high-resolution media readiness;
- video readiness;
- shoppable look/story coverage;
- buyer-facing specification completeness;
- future 3D slot compatibility indicator, not required for P0.

### 9.4 Commercial terms

Shows:

- price list(s);
- currency;
- order deadline;
- delivery windows;
- MOQ/pack coverage;
- minimum order;
- payment terms display;
- tax display mode.

No prices are edited inline on Overview.

### 9.5 Buyer access

Shows:

- campaign audience;
- buyer-specific exclusions/overrides;
- active access grants;
- missing price-list assignments;
- access expiry;
- language/market variants if enabled.

Action: `Configure access`.

### 9.6 Version and publication

If unpublished:

- draft version;
- readiness state;
- no release history.

If published:

- current published version;
- published by/at;
- draft changes count;
- material vs non-material changes;
- affected buyer count;
- `Preview published`;
- `Review changes`.

## 10. Product readiness rules

A product is buyer-ready when required fields exist:

- style code;
- buyer-facing name;
- category;
- at least one buyer-visible image;
- at least one active colourway;
- size scale;
- wholesale price for applicable buyer price list;
- delivery window;
- availability status;
- MOQ/pack validity when configured.

The Overview displays aggregate issues; the Product Table owns bulk correction.

## 11. Presentation readiness rules

The collection presentation must have:

- collection cover;
- at least one buyer navigation mode: editorial, product grid or linesheet;
- at least one shoppable surface;
- no broken product references;
- no hidden-only products referenced in public blocks;
- accessible alt/title metadata for essential media;
- video with poster/fallback;
- no empty story block.

## 12. Access preview shortcut

The header Preview action opens Buyer Preview.

If no buyer context exists:

- open buyer-context selector;
- allow generic market preview only when clearly labelled;
- do not silently preview using a random buyer.

## 13. Empty states

### No products

Title: `Add products to build this collection`

Primary: `Add products`

Options inside flow:

- select existing products;
- import CSV/XLSX;
- future integration source.

### No presentation

Title: `Turn the product list into a buyer-ready showroom`

Primary: `Build showroom`

### No access audience

Title: `Choose which shops can see this collection`

Primary: `Configure access`

## 14. Loading state

- identity/header first;
- readiness and product summary may load in parallel;
- cover preserves aspect ratio;
- no layout shift when counts arrive;
- refetch after product edit keeps previous summary visible.

## 15. Error and conflict states

- missing/deleted collection → recovery screen;
- inaccessible campaign → permission state;
- draft version conflict → compare/refresh;
- readiness calculation failure → show last successful timestamp and retry;
- broken published snapshot → critical operational error, never fall back to draft silently.

## 16. Permissions

- `collection.read` — open;
- `collection.write` — products/presentation/commercial editing;
- `collection.publish` — publish/unpublish/schedule;
- `buyer.manage` — access configuration;
- `campaign.read` — breadcrumb/context;
- `analytics.read` — engagement summary later.

## 17. Keyboard behaviour

- tabs keyboard navigable;
- Enter opens focused issue/section;
- Preview keyboard accessible;
- no shortcut publishes directly;
- Escape closes context drawers;
- return from sub-editor restores scroll and active tab.

## 18. Responsive behaviour

### MacBook / desktop

- main + readiness rail;
- sections use structured rows/cards, not an all-card dashboard;
- preview and primary action remain visible in header;
- product/presentation summaries may sit in two columns.

### iPad landscape

- two-column summary where each region remains at least 320 px;
- readiness rail becomes drawer when needed;
- touch actions 44 px.

### iPad portrait

- single-column;
- readiness first;
- preview in header;
- commercial and access summaries collapse into expandable sections.

### iPhone

Order:

1. compact header;
2. readiness;
3. sticky primary action;
4. products;
5. presentation;
6. commercial;
7. access;
8. version/activity.

- no side rail;
- cover thumbnail full width but not hero-sized;
- issue list limited to three with `View all`;
- tabs become section selector/horizontal navigation.

## 19. Analytics events

- `collection_overview_viewed`;
- `collection_primary_action_clicked`;
- `collection_readiness_opened`;
- `collection_issue_opened`;
- `collection_products_opened`;
- `collection_showroom_composer_opened`;
- `collection_buyer_preview_opened`;
- `collection_publish_review_opened`;
- `collection_access_opened`.

## 20. Acceptance criteria

1. Overview accurately aggregates products, presentation, commercial terms and access.
2. Each blocking issue routes to a fix location.
3. Primary action follows readiness rules.
4. Preview always uses an explicit buyer or labelled generic context.
5. Published and draft versions are never visually confused.
6. Material draft changes are visible.
7. All universal states are implemented.
8. Responsive behaviour works at required widths.
9. No production, BOM or tech-pack controls appear.
10. WFX-inspired media/personalisation readiness is represented without adding PLM ownership.

## 21. Non-goals

- deep product editing;
- StoryBlock editing;
- size/colour matrix entry;
- buyer invitation list management;
- analytics dashboard;
- PLM/ERP product development workflow.
