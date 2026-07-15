# 13 — Best-of-Breed Product Blueprint

Last verified research update: 2026-07-15

## 1. Purpose

This document translates the strongest proven patterns from JOOR, NuORDER, Le New Black, Brandboom, RepSpark and Faire into explicit product decisions for Syntha Wholesale V2.

It is not a request to copy competitor screens. It defines:

- which problem each competitor solves well;
- which pattern Syntha should adopt;
- how Syntha must improve the pattern;
- what should be postponed;
- what must not be copied because it would overload the product;
- the acceptance standard Cursor must meet.

The product remains focused on two user roles only:

- Brand;
- Shop.

The core job is:

```text
Brand presents a collection exceptionally well
→ Shop understands and selects the right assortment
→ Shop writes a correct wholesale order quickly
→ Brand and Shop agree and confirm the order in one shared workspace
```

Production, PLM, BOM, QC and supply-chain execution are later modules. They must not distort the first product.

---

## 2. Decision framework

Every competitor pattern is classified as one of four decisions.

| Decision | Meaning |
|---|---|
| ADOPT | Proven pattern required in Syntha MVP |
| IMPROVE | Proven pattern required, but Syntha must remove known friction or add a stronger workflow |
| LATER | Valuable, but not allowed to delay the core showroom/order-writing product |
| REJECT | Pattern creates complexity without improving collection selling or order writing |

A feature is accepted only when it has:

- a clear role and user job;
- one canonical location in the information architecture;
- a complete read and write path;
- responsive behavior for desktop and iPad;
- permissions and audit behavior;
- loading, empty, error and conflict states;
- acceptance tests;
- no redirect into legacy Syntha.

---

# 3. What to take from each platform

## 3.1 JOOR

### Verified strengths

JOOR officially positions its product around:

- virtual showrooms;
- digital linesheets;
- centralized order management;
- buyer-specific assortments, pricing and discounts;
- visual assortment planning;
- retailer/brand discovery network;
- embedded wholesale payments;
- extensive ERP/PLM/POS integrations;
- digital trade-show experiences.

Official references:

- https://www.joor.com/
- https://www.joor.com/wholesale-management
- https://www.joor.com/visual-assortment-planning

### ADOPT

- Reliable digital linesheet as a canonical commercial view.
- Buyer-specific assortment visibility.
- Buyer-specific pricing and discount context.
- Centralized order review and approval.
- Visual assortment board.
- Filters by brand/category/color/delivery.
- Clear product/order financial rollups.
- Integration-ready product, inventory and order boundaries.

### IMPROVE

JOOR's strongest ideas become more powerful when Syntha connects them into one continuous flow:

```text
Showroom → Selection → Visual Assortment → Order Builder → Review → DealSpace
```

Syntha improvements:

- the buyer should never rebuild a showroom shortlist inside a separate order tool;
- visual assortment and quantitative order data must remain synchronized;
- every product/line/order discussion must stay attached to the relevant entity;
- appointment notes and actions must continue into the order;
- the Brand must preview the exact buyer-specific experience before publication;
- a change after publication must produce a visible version and change summary.

### LATER

- Large open discovery network.
- Embedded payment processing.
- Digital trade-show marketplace.
- Very broad ERP connector catalogue.

### REJECT

- Building network scale before the core private Brand ↔ Shop workflow is excellent.
- Adding payments before order writing and confirmation are complete.

---

## 3.2 NuORDER

### Verified strengths

NuORDER officially presents:

- fully branded B2B ecommerce sites;
- account-specific pricing, discounts and product selections;
- virtual showrooms and rich media;
- advanced sales tools and suggested orders;
- centralized order management;
- visual assortment planning;
- real-time team assortment collaboration;
- duplicate-buy detection;
- localized size curves and allocation;
- product, inventory and order integrations.

Official references:

- https://www.nuorder.com/
- https://www.nuorder.com/wholesale/ecommerce/
- https://www.nuorder.com/wholesale/advanced-sales-tools/
- https://www.nuorder.com/wholesale/order-management/
- https://www.nuorder.com/assortments/retailers/

### ADOPT

- Flexible branded showroom composition.
- Rich media: images, video and interactive content.
- Account-specific product visibility and commercial terms.
- 24/7 self-service ordering.
- Prebook and available-to-sell context.
- Suggested-order foundation based on explainable data.
- Visual multi-store/multi-brand assortment rollups.
- Real-time collaboration with controlled permissions.
- Size-curve and allocation support as a later buying enhancement.

### IMPROVE

Syntha must remove the split between merchandising and order entry.

Required improvements:

- one persistent selection across editorial, grid, looks, linesheet and builder views;
- a three-panel Order Builder that keeps source, matrix and totals visible;
- an explanation for every suggested product or quantity;
- scenario comparison without duplicating unrelated records;
- buyer-side and brand-side collaboration without silent overwrites;
- order revisions as explicit proposals with accept/reject behavior;
- a shared campaign calendar and DealSpace, not separate disconnected tools.

### LATER

- Enterprise allocation at scale.
- Advanced historical size-curve recommendation.
- Integrated payments.
- Very broad marketplace/discovery functionality.

### REJECT

- Recreating enterprise assortment complexity in the initial independent-boutique workflow.
- Hiding core order logic behind opaque automation.

---

## 3.3 Le New Black

### Verified high-level strengths

Available public reporting confirms that Le New Black is used for:

- digital collection presentation;
- digital order management;
- online recreation of physical showroom experiences;
- fashion-focused visual presentation.

References:

- https://www.lenewblack.com/
- https://www.vogue.com/article/shanghai-fashion-week-spring-summer-21
- https://www.vogue.com/article/digital-showrooms-china-virtual-reality-joor-ordre

Detailed feature-level claims remain `VERIFY` until official product documentation or a confirmed demo is reviewed.

### ADOPT

- Fashion-first visual restraint.
- A showroom that feels curated rather than like a generic ecommerce catalogue.
- Strong separation between editorial story and dense commercial data.
- Hybrid physical/digital showroom support.

### IMPROVE

- editorial presentation must remain fully shoppable;
- switching from story to linesheet must preserve position and selection;
- commercial data must be visible without destroying the visual experience;
- the buyer should be able to continue later from the exact point reached during a meeting;
- accessibility and keyboard support must not be sacrificed for visual effect.

### LATER

- Highly immersive 3D/virtual-room recreation.

### REJECT

- Decorative immersion that slows product comparison or quantity entry.
- Visual layouts that cannot scale to hundreds of products.

---

## 3.4 Brandboom

### Verified strengths

Brandboom officially presents:

- product and inventory management;
- order management from cart to delivery;
- line sheets and presentations;
- rich media in presentations;
- shareable links and PDF presentations;
- current availability synchronization;
- direct ordering from shared presentations;
- payments and fulfilment tools;
- showroom/rep management;
- order exports and ERP synchronization.

Official references:

- https://www.brandboom.com/
- https://www.brandboom.com/product-management
- https://www.brandboom.com/order-management
- https://www.brandboom.com/presentations

### ADOPT

- Very fast presentation creation.
- Shareable presentation links.
- PDF/print fallback.
- Rich media blocks.
- Instant propagation of product/availability updates.
- Visible open carts and stalled-buyer follow-up.
- Collaborative order adjustment.
- Complete order change log.
- Simple reorder from previous orders.
- Clear ship-window support.

### IMPROVE

- replace a presentation link plus separate order cart with a persistent buyer workspace;
- connect buyer behavior to an ethical, permission-aware follow-up queue;
- make every brand change versioned and explainable to the buyer;
- prevent a sales representative from changing a buyer's order silently;
- integrate appointment, chat, tasks and order revision into DealSpace;
- make export a consequence of a clean domain model, not the main workflow.

### LATER

- Payments and fulfilment.
- Rep commission management.
- Broad ERP mapping UI.

### REJECT

- Treating PDF as the primary presentation format.
- Letting the share-link experience diverge from the authenticated showroom experience.

---

## 3.5 RepSpark

### Verified strengths

RepSpark officially presents:

- 24/7 retailer ordering;
- digital catalogues and line sheets;
- pre-book ordering;
- custom assortments;
- event microsites;
- always-on cart;
- product customization/licensing workflows;
- multi-brand and multi-warehouse operations;
- ERP and open API integrations;
- retailer community/discovery;
- accounts receivable and invoicing;
- AI-powered order insights.

Official references:

- https://www.repspark.com/
- https://www.repspark.com/branded-selling-tools
- https://www.repspark.com/event-microsites

### ADOPT

- Always-on cart that survives across sessions.
- Prebook ordering and delivery context.
- Curated event/showroom microsites.
- Custom assortments per account or event.
- Strong retailer self-service reorder.
- Multi-warehouse/availability architecture as a later data source.
- Clear integration boundary.

### IMPROVE

- event microsites become first-class Sales Events inside the Campaign Calendar;
- every event must connect to appointments, attendance, selections and orders;
- the always-on cart becomes a versioned Selection/Order Draft, not an ambiguous basket;
- AI order insights must be explainable and never write quantities automatically;
- custom product workflows remain an extension, not a distraction from fashion wholesale order writing.

### LATER

- Product customization and licensed-product approvals.
- Accounts receivable/invoicing.
- Multi-warehouse availability.
- Event commerce outside the core wholesale campaign.

### REJECT

- Vertical-specific golf/event complexity in the initial fashion MVP.
- AI claims without a measurable decision-support workflow.

---

## 3.6 Faire

### Research status

Faire's public site is dynamic and detailed row-level verification is incomplete. Current product claims must remain `VERIFY` until official help-center pages or a confirmed demo are reviewed.

High-level public reporting associates Faire with:

- retailer discovery of brands/products;
- marketplace search and recommendation;
- low-friction retailer onboarding;
- consolidated wholesale purchasing;
- commercial mechanisms designed to reduce perceived first-order risk.

References:

- https://www.faire.com/
- official help-center pages to be added during verification;
- independent source register in `15_COMPETITOR_SOURCE_REGISTER.md`.

### ADOPT

- Low-friction Shop onboarding.
- Excellent product and brand search.
- Discovery filters that match how independent retailers buy.
- Clear trust signals on Brand profiles.
- Fast request-access/invitation acceptance.
- Recommended brands/products as an optional future discovery layer.

### IMPROVE

Syntha is not a marketplace-first product. Discovery must lead into a high-quality private Brand ↔ Shop relationship:

```text
Discover / Invite
→ Access approved
→ Campaign and Showroom
→ Selection
→ Appointment / DealSpace
→ Order
```

Syntha must preserve:

- brand control over audience, prices and assortments;
- relationship history;
- private negotiated terms;
- explicit data ownership;
- transparent recommendation logic.

### LATER

- Open marketplace.
- Payment terms/credit products.
- Promotions subsidized by the platform.
- Marketplace logistics.

### REJECT

- Marketplace incentives that distort the Brand's commercial policy.
- Turning the core showroom into a commodity product grid.

---

# 4. Syntha canonical product decisions

## 4.1 Collection Presentation System

Syntha combines:

- JOOR reliability and commercial completeness;
- NuORDER flexible branded presentation;
- Le New Black fashion-first visual quality;
- Brandboom speed and shareability;
- RepSpark event-specific merchandising.

Canonical views:

1. **Story** — campaign narrative, media and chapters.
2. **Looks** — shoppable outfits/capsules.
3. **Grid** — visual product discovery.
4. **Linesheet** — dense commercial review.
5. **Presentation** — fullscreen guided appointment mode.
6. **Buyer Preview** — exact account-specific rendering before publish.

All views share one selection state.

There must never be separate carts per presentation mode.

## 4.2 Buying Workspace

Syntha combines:

- JOOR visual assortment planning;
- NuORDER multi-dimensional assortment collaboration;
- Faire-style discovery simplicity;
- Brandboom persistent cart behavior.

Canonical buyer states:

- undecided;
- favorite;
- shortlisted;
- approved for order;
- excluded privately.

Canonical capabilities:

- compare products and colorways;
- visualize category/color/delivery mix;
- detect obvious duplicates;
- monitor budget;
- collaborate privately inside the Shop team;
- convert selection to an Order Draft without losing notes or context.

## 4.3 Order Builder

The Order Builder is the product's primary competitive battlefield.

Canonical layout:

```text
Left: product/selection source
Center: order lines and size × color matrix
Right: totals, budget, MOQ, deliveries, validation and submit
```

Required behaviors:

- autosave;
- keyboard-first quantity entry;
- copy/paste from spreadsheets;
- undo/redo;
- size curves;
- color grouping;
- pack and MOQ explanation;
- delivery split;
- store split later;
- persistent totals;
- explicit blocking errors and warnings;
- shared comments;
- versioned submission;
- brand-proposed revision;
- buyer accept/reject per proposal;
- immutable confirmed version.

## 4.4 Sales Campaign and Events

Campaign is the main planning container.

It includes:

- dates and market/time-zone context;
- collections;
- buyer audience;
- appointments;
- showroom periods;
- sales events and trade shows;
- order deadlines;
- reminders;
- sales team ownership;
- campaign funnel and order value.

RepSpark-style microsites become a P1 **Sales Event Page** tied to the same Campaign, not a separate product.

## 4.5 DealSpace

DealSpace is Syntha's strongest intentional differentiation.

It unifies:

- chat;
- collection/order/product context;
- meetings;
- calendar events;
- tasks;
- files;
- shared and private notes;
- mentions;
- activity timeline;
- order revision discussion.

It must not become a generic Slack clone. Every thread and action is attached to a commercial entity.

## 4.6 Discovery

Discovery is P2 and starts only after private wholesale workflows are excellent.

The first version supports:

- invite by Brand;
- request access by Shop;
- verified Brand and Shop profiles;
- relationship approval;
- campaign-specific access.

Open marketplace, recommendation and paid placement are later.

## 4.7 Payments, AR and fulfilment

These are later modules.

The MVP shows commercial/payment terms but does not attempt to become a financial platform.

Architecture must preserve extension points for:

- payment request;
- invoice;
- credit terms;
- accounts receivable;
- fulfilment/tracking.

---

# 5. Adopt / Improve / Later / Reject master table

| Area | Competitor pattern | Decision | Syntha implementation |
|---|---|---|---|
| Showroom | Virtual showroom | IMPROVE | Six synchronized presentation modes with one selection |
| Linesheet | Shoppable digital linesheet | ADOPT | Canonical dense commercial view |
| Storytelling | Branded drag/drop pages | IMPROVE | Structured blocks; no arbitrary broken layouts |
| Rich media | Video/360/editorial assets | ADOPT | Media blocks with performance budgets |
| Buyer pricing | Account-specific price/discount | ADOPT | Audience + price-list snapshot per release |
| Access | Share/invite buyer | IMPROVE | Relationship access, expiry, revoke and audit |
| Buyer preview | Preview before publication | IMPROVE | Exact Shop identity simulation |
| Publish | Live catalog updates | IMPROVE | Versioned release plus material-change notice |
| Selection | Favorite/shortlist/cart | IMPROVE | Explicit buyer decision states and persistent selection |
| Visual assortment | Board/rollup | ADOPT | Category/color/delivery mix and duplicate warnings |
| Budget | Financial targets | ADOPT | Budget guardrails in Selection and Builder |
| Order entry | Size/color quantity matrix | ADOPT | Keyboard-first matrix with paste, fill, undo |
| Packs/MOQ | Validation | IMPROVE | Explain reason and offer valid correction |
| Delivery | Prebook/ship windows | ADOPT | Line-level split and rollup |
| Collaboration | Shared order editing | IMPROVE | Presence, proposals, versioning, no silent overwrite |
| Revision | Edit/approve order | IMPROVE | Formal proposal and buyer response |
| Reorder | Repeat previous order | ADOPT | Duplicate with current-price/availability review |
| Analytics | Click/order analytics | IMPROVE | Actionable funnel, not vanity metrics |
| Events | Event microsite | LATER | Campaign-linked Sales Event Page |
| Network | Brand/retailer discovery | LATER | Verified profiles and access requests first |
| Payments | Embedded wholesale payment | LATER | Extension after order confirmation maturity |
| ERP | Broad integration ecosystem | LATER | Stable API/webhooks/import-export foundation first |
| AI | Suggested orders/order insights | LATER | Explainable suggestions only after clean data |
| Production | PLM/QC/supply chain | LATER | Optional Syntha Production module |

---

# 6. Release scope

## P0 — Commercial core

P0 must include:

- Brand and Shop organizations;
- Sales Campaign;
- Collection setup;
- product import and commercial data;
- Story, Looks, Grid and Linesheet;
- Buyer Preview;
- versioned Publish;
- invite/access control;
- Shop Showroom;
- persistent Selection;
- Buying Workspace;
- three-panel Order Builder;
- size × color matrix;
- MOQ/pack/delivery validation;
- review and submit;
- Brand order review;
- revision proposal;
- buyer response;
- confirmation;
- DealSpace chat/files/tasks;
- shared appointments and calendar;
- PDF/XLSX/CSV exports;
- audit and permissions.

## P1 — Differentiation after core stability

- Live guided appointment.
- Visual assortment board.
- Budget and scenario planning.
- Sales Event Pages.
- Advanced showroom analytics.
- Meeting/conversation summaries.
- Suggested follow-up.
- Google/Microsoft calendar sync.
- Public/private watermarked share links.
- Reorder workflow.

## P2 — Expansion

- Open discovery marketplace.
- AI assortment recommendations.
- Historical size curves.
- Payments/credit/AR.
- Multi-warehouse ATS.
- Product customization/licensing.
- 360/3D immersive showroom.
- Production/PLM/QC module.

---

# 7. Experience targets

The following are product requirements, not aspirations.

## Showroom

- first useful collection content visible in under 2 seconds on a normal business connection;
- switch between Grid, Looks and Linesheet without losing selection or scroll context;
- add a product to Selection in one action;
- exact buyer price/currency/access is never ambiguous;
- a Shop can resume at the last viewed item;
- iPad landscape is a first-class appointment mode.

## Order Builder

- start from Selection in one action;
- quantity cell entry must be keyboard-operable;
- common matrix edits require no modal;
- totals update immediately after an edit;
- every block explains how to resolve it;
- no user-entered quantity is lost during navigation or refresh;
- submit creates an immutable version and receipt;
- concurrent edits produce a visible conflict, never silent overwrite.

## DealSpace

- a message can reference a campaign, collection, product, order or order line;
- a task can be created from a message in one action;
- appointment outcome, files, order events and messages appear in one timeline;
- internal Shop notes are never exposed to Brand;
- unread and mentions are consistent across all contexts.

---

# 8. Forbidden implementation shortcuts

Cursor must not:

- create one UI per competitor feature;
- add a separate cart for each showroom view;
- implement a generic ecommerce checkout instead of wholesale order review;
- store money as floating-point numbers;
- overwrite submitted or confirmed order versions;
- silently change buyer quantities;
- make analytics from demo counters;
- add AI before source data and acceptance metrics exist;
- route V2 users into legacy Syntha;
- import legacy visual components without an explicit reuse decision;
- use PDF as the only way to review a collection;
- place chat, calendar and tasks in unrelated applications.

---

# 9. Definition of "better than the combined alternatives"

Syntha is better only when a real Brand/Shop pair can complete the full workflow faster and with fewer errors:

```text
publish collection
→ invite buyer
→ review collection
→ build selection
→ write order
→ resolve issues
→ agree revision
→ confirm order
```

The claim requires measured evidence:

- task completion time;
- number of clicks/steps;
- order-entry error rate;
- abandoned draft rate;
- appointment-to-order conversion;
- time from first showroom open to confirmed order;
- user-reported confidence;
- zero legacy/dead-end routes.

A long feature list alone is not competitive advantage.
