# SH-006 — Collection Showroom

## 1. Screen identity

- **Role:** Shop
- **Route:** `/wholesale-v2/shop/campaigns/:campaignId/collections/:collectionId`
- **Template:** Showroom / Focus Mode
- **Priority:** P0
- **Primary job:** understand the collection and build a buying selection efficiently.
- **Primary action:** `Open selection`
- **Persistent action:** add/remove product or look from selection.

## 2. Product promise

The Shop must be able to experience the collection visually without sacrificing commercial clarity.

The screen combines:

- editorial story;
- product grid;
- looks;
- linesheet;
- detailed product viewer;
- persistent selection;
- private/internal/shared notes;
- buyer-specific prices and terms;
- resume state;
- direct transition to Selection and Order Builder.

## 3. Entry points

- Available Campaigns;
- Campaign Detail;
- invitation/secure link after authentication;
- appointment/live showroom;
- saved brand/collection;
- DealSpace deep link;
- resume notification;
- direct route with valid access grant.

## 4. Exit points

- Open Selection;
- open Product Quick View;
- open Buying Workspace;
- open DealSpace context;
- open campaign/brand context;
- request meeting/contact Brand;
- create order from selection when eligible.

## 5. Access resolution

Before rendering, server resolves:

```ts
type ShowroomAccessContext = {
  userId: string;
  shopOrganisationId: string;
  brandOrganisationId: string;
  tradingRelationshipId?: string;
  campaignAccessGrantId: string;
  campaignId: string;
  collectionId: string;
  collectionVersionId: string;
  showroomId: string;
  locale: string;
  marketCode: string;
  currency: string;
  priceListId: string;
  visibleProductIds: string[];
  visibleBlockIds: string[];
  deliveryWindowIds: string[];
  orderDeadline?: string;
  accessExpiresAt?: string;
  permissions: ShowroomPermissionFlags;
};
```

Access, price and collection version are immutable for the session unless the user explicitly refreshes after a material Brand update.

## 6. View model

```ts
type ShopShowroomVM = {
  brand: BrandSummary;
  campaign: CampaignSummary;
  collection: CollectionSummary;
  showroom: ShowroomPresentationSnapshot;
  context: ShowroomAccessContext;
  products: BuyerVisibleProduct[];
  looks: BuyerVisibleLook[];
  activeSelection: SelectionSummary;
  session: {
    id: string;
    startedAt: string;
    lastPosition?: ShowroomPosition;
    lastActiveAt: string;
  };
  notices: ShowroomNotice[];
};
```

## 7. Desktop layout

```text
Minimal Showroom Bar 64 px
├── Brand / Campaign / Collection
├── Story / Products / Looks / Linesheet
├── Search
├── Contact / DealSpace
└── Selection count + value

Presentation Canvas flexible

Optional Product Inspector 400–420 px
Optional Selection Tray 320–380 px
```

Operational controls remain platform-styled. Brand customisation applies only inside the approved showroom canvas.

## 8. Showroom bar

### Left

- Brand logo/name;
- collection name;
- campaign/season context;
- back to campaign.

### Centre

Mode navigation:

- Story;
- Products;
- Looks;
- Linesheet.

Maximum six primary sections. Chapters/drops use a secondary section menu.

### Right

- search;
- filters entry;
- `Message brand`;
- selection icon with item count, units intent if available and value;
- `Open selection`.

On smaller widths, search and messaging move to overflow/drawer; selection remains visible.

## 9. Story mode

Renders approved StoryBlocks:

- Hero;
- text;
- image/video/gallery;
- moodboard;
- look grid;
- featured product;
- product grid;
- quote/sales note;
- chapter navigation.

Rules:

- shoppable products open quick view or add to selection;
- visual blocks never hide price/delivery access from product detail;
- video never autoplays with sound;
- media loads progressively;
- buyer can skip directly to Products/Linesheet;
- current story position persists.

## 10. Product grid mode

### Toolbar

- search;
- category;
- drop/capsule;
- colour;
- delivery window;
- availability;
- selection state;
- sort;
- card density within approved modes.

### Product card

Shows:

- 3:4 image;
- name/style code;
- colour count;
- wholesale price;
- optional retail/margin when permitted;
- delivery;
- MOQ/pack indicator;
- availability;
- favourite/selection state;
- note/comment indicator.

Visible actions:

- Add/remove selection;
- Quick view.

No more than two overlay actions.

## 11. Looks mode

Look card shows:

- editorial image/video;
- look name;
- included product count;
- total wholesale value for visible/available products when calculable;
- `View look`;
- `Add look`.

Look detail allows:

- add all available products;
- select individual products;
- choose colourways;
- see unavailable/excluded items;
- add private or shared note.

Adding a look creates individual SelectionItems with a shared source reference to the Look.

## 12. Linesheet mode

Dense commercial view for experienced buyers.

Columns:

- image;
- style code/name;
- category;
- colourways;
- wholesale price;
- suggested retail/margin when allowed;
- size range;
- delivery;
- MOQ/pack;
- availability;
- selection state;
- quick quantity intent P1/P0 optional.

Features:

- sticky header;
- sticky product identity;
- filters shared with grid;
- row selection;
- quick add/remove;
- open quick view;
- export only when Brand permissions allow.

On iPhone, linesheet becomes product list; no squeezed desktop table.

## 13. Product Quick View

### Desktop

Right inspector 400–420 px or large modal when media requires.

### Content order

1. media gallery;
2. product identity;
3. colourways;
4. wholesale price/currency;
5. suggested retail and expected margin if permitted;
6. delivery windows;
7. size range;
8. MOQ and pack explanation;
9. availability;
10. detailed specification;
11. notes/comments;
12. selection action.

### Media

- high-resolution images;
- zoom;
- HD video;
- 360/3D adapter slot P1;
- colour-specific assets;
- accessible alt/captions.

### Notes visibility

Before saving:

- Private to me;
- Internal to Shop;
- Shared with Brand.

Default is `Internal to Shop`, not shared.

## 14. Persistent selection

Selection is created lazily on first add.

Adding a product stores:

- product and chosen colourway if selected;
- source mode/block/look;
- decision `shortlisted` by default;
- price snapshot reference, not duplicated mutable amount;
- initial quantity intent if entered;
- selected delivery if chosen;
- buyer note visibility.

Selection tray shows:

- item count;
- current indicative value;
- missing colour/decision indicators;
- recently added items;
- remove/undo;
- `Open selection`.

## 15. Session persistence

Persist:

- mode;
- story position;
- scroll position by mode;
- filters;
- last opened product;
- selection state;
- comparison state where applicable.

On return:

- offer `Continue where you left off`;
- user can choose `Start from beginning` without losing selection.

## 16. Brand communication

`Message brand` opens or creates the collection-context DealSpace thread.

From a product:

- `Ask about this product` deep-links product context;
- attachment of product reference is automatic;
- Shop chooses internal/private/shared visibility correctly;
- Brand never sees private Shop notes.

Native video call is P1 through Appointment/Live Showroom, not embedded ad hoc in P0.

## 17. WFX-inspired requirements

P0 includes:

- private invitation-based access;
- personalised collection and price context;
- high-resolution imagery;
- HD video;
- detailed product specifications;
- shoppable lookbook/story;
- digital linesheet;
- real-time contextual feedback via DealSpace;
- buyer engagement event capture.

P1 includes:

- 360/3D;
- live video appointment;
- digital whiteboard;
- sample request.

## 18. Notices and material updates

Show notice when:

- Brand published a new version;
- price/delivery/availability changed;
- order deadline approaches;
- access expires soon;
- one or more selected items are no longer available.

Material update flow:

- preserve current selection;
- show affected items;
- require explicit refresh to new version when commercial context changes;
- never silently change an active order draft.

## 19. Empty states

### No products visible

Explain access/availability issue and provide `Contact brand`.

### Filter no results

Keep filters visible; `Clear filters`.

### Selection empty

Compact tray state explaining how to shortlist products.

### Access expired/revoked

Dedicated access state with Brand contact/request action; do not show cached restricted product data.

## 20. Loading and performance

- presentation shell and text first;
- responsive/lazy media;
- prefetch next product media cautiously;
- grid virtualisation where needed;
- selection actions feel immediate with rollback;
- no full page reload between modes;
- route state and filters in URL/session contract.

## 21. Error states

- access resolution failed;
- price list unavailable;
- collection version unavailable;
- product media failed;
- selection write failed;
- stale session/material update conflict;
- message thread creation failed.

Selection write failure must restore prior visual state and retain intent for retry.

## 22. Permissions

- active access grant required;
- Shop user must belong to permitted organisation;
- internal price visibility follows membership role;
- shared notes require DealSpace write permission;
- export may be disabled by Brand;
- selected products cannot exceed visibility/access scope.

## 23. Keyboard behaviour

- `/` search;
- arrow navigation in product grid/linesheet;
- Enter opens quick view;
- Space toggles selection when card/row action focused;
- Escape closes quick view/tray;
- left/right media navigation;
- focus preserved after add/remove;
- keyboard access to all filters and mode tabs.

## 24. Responsive behaviour

### MacBook / fullscreen

- minimal bar;
- editorial canvas up to canonical width;
- optional persistent tray/inspector;
- grid 4–6 columns;
- linesheet full workspace width.

### iPad landscape

- ideal guided buying device;
- content + collapsible selection rail;
- product inspector drawer;
- touch targets 44 px;
- grid four columns where width allows.

### iPad portrait

- navigation compact;
- grid three columns;
- inspector full-height drawer;
- tray bottom panel;
- linesheet simplified.

### iPhone

- single-column story;
- two-column product grid when card width ≥156 px;
- product detail full-screen;
- filters bottom sheet;
- selection bottom bar;
- quantity/detail editing in sheets;
- linesheet transformed to mobile list;
- bottom navigation hidden in full-screen product detail.

## 25. Analytics events

Buyer funnel events:

- `showroom_opened`;
- `showroom_resumed`;
- `showroom_mode_changed`;
- `showroom_section_viewed`;
- `showroom_search_used`;
- `showroom_filter_applied`;
- `product_viewed`;
- `product_colour_viewed`;
- `look_viewed`;
- `product_shortlisted`;
- `product_removed_from_selection`;
- `look_added_to_selection`;
- `selection_opened_from_showroom`;
- `brand_message_started`.

Privacy:

- private note contents never enter Brand analytics;
- Brand receives aggregate engagement per policy;
- preview traffic excluded.

## 26. Acceptance criteria

1. Access is secure and buyer-specific.
2. Exact buyer price/currency/assortment/terms render consistently.
3. Story, grid, looks and linesheet share one selection state.
4. Switching modes preserves state.
5. Product media/specification meets WFX-inspired P0 requirements.
6. Selection writes are persistent and recoverable.
7. Private/internal/shared notes are unambiguous.
8. Resume session works.
9. Material updates never silently alter order state.
10. Required device layouts and universal states pass review.
11. Engagement events are captured without leaking private content.
12. No legacy route or production module is exposed.

## 27. Non-goals

- consumer checkout;
- payment processing;
- public anonymous storefront;
- production status;
- factory/sample workflow;
- native 3D editor;
- native video call in P0.
