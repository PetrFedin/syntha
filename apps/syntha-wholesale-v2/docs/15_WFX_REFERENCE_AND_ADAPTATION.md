# 15 — World Fashion Exchange Reference and Adaptation

## 1. Purpose

World Fashion Exchange (WFX) is added to the reference set for Syntha Wholesale V2.

WFX is not used as a complete product architecture template. Its public product suite combines Fashion PLM, Apparel ERP, MES, traceability and Virtual Showroom. Syntha Wholesale V2 remains focused on Brand ↔ Shop wholesale selling. Production, PLM, ERP and factory management stay outside the first product core.

What we take from WFX is the strongest buyer-facing and sales-facing functionality of its Virtual Showroom, then adapt it into a simpler and more coherent Syntha flow.

## 2. Verified official source

Primary source checked: 2026-07-15.

- WFX product suite: `https://www.worldfashionexchange.com/`
- WFX Virtual Showroom: `https://www.worldfashionexchange.com/virtual-fashion-showroom-software.html`

Officially described WFX capabilities used in this analysis:

- private buyer invitations;
- handpicked and buyer-specific assortments;
- buyer-specific product information, pricing and promotions;
- high-resolution imagery;
- HD video;
- 3D prototypes and 360-degree-ready presentation;
- detailed product specifications;
- integration with PLM and ERP;
- buyer feedback;
- integrated chat and video call functionality;
- targeted email campaigns with secure showroom links;
- showroom analytics including click-through, browse-through and inquiry/sample hit indicators;
- shoppable lookbooks;
- shoppable digital line sheets;
- interactive styleboards/digital whiteboards;
- tracking visitor behaviour and preferences.

## 3. Product boundary decision

### Included in Syntha Wholesale V2 core

1. Buyer-specific showroom access.
2. Buyer-specific assortment, price list, currency and commercial terms.
3. Secure invitation and access links.
4. High-resolution imagery and HD video.
5. Detailed buyer-facing product specifications.
6. Shoppable story, lookbook, looks, grid and linesheet modes.
7. Persistent selection and quick order entry.
8. Contextual feedback and DealSpace messages.
9. Campaign invitation and reminder communication.
10. Showroom engagement analytics.
11. Integration ports for PIM/PLM/ERP product and order data.

### Planned after P0

1. 360-degree media.
2. Interactive 3D product viewer.
3. Native video calls.
4. Digital whiteboard during live appointment.
5. Sample request workflow.
6. Buyer engagement scoring.
7. Campaign recommendation automation.

### Explicitly excluded from wholesale MVP

1. Deep product lifecycle management.
2. Technical packs and BOM ownership.
3. Sourcing and costing workflows.
4. Factory production planning.
5. MES/shop-floor management.
6. Traceability and compliance execution.
7. Accounting and full ERP.

These can later connect through adapters or become optional Syntha modules, but cannot reshape the wholesale navigation or domain model.

## 4. WFX capability → Syntha adaptation

| WFX capability | Syntha adaptation | Priority | Screen ownership |
|---|---|---:|---|
| Private digital showroom | Campaign/collection access grant with buyer identity and expiry | P0 | Campaign, Buyer Preview, Shop Showroom |
| Handpicked assortment | Buyer-specific collection and product visibility rules | P0 | Campaign, Collection, Buyer Preview |
| Buyer-specific prices | Price-list and currency context locked to access grant | P0 | Buyer Preview, Shop Showroom, Order Builder |
| High-resolution media | Responsive image pipeline, zoom and original asset access | P0 | Composer, Preview, Showroom |
| HD video | Video story block and product video with muted autoplay rules | P0 | Composer, Preview, Showroom |
| 3D prototypes | Standard media slot and viewer adapter contract | P1 | Product Viewer / Showroom |
| Detailed specifications | Structured commercial specification panel | P0 | Shop Showroom, Product Quick View |
| PLM/ERP integration | Import/sync ports; Syntha remains source of truth for presentation and order state | P1 | Integration layer |
| Instant buyer feedback | Private shop notes, internal team comments, shared Brand ↔ Shop product comments | P0 | Showroom, Selection, DealSpace |
| Chat | Contextual DealSpace threads, not a detached generic messenger | P0 | Showroom, Selection, Order Builder |
| Video calls | Appointment room linked to campaign/collection/order | P1 | Live Showroom |
| Targeted email campaigns | Invitation, reminder and follow-up templates tied to campaign audience | P0 | Campaign |
| Secure links | Signed, expiring, revocable access grants | P0 | Campaign / access system |
| Showroom analytics | View, browse, favourite, selection, return and order-conversion funnel | P1 foundation/P0 events | Showroom / Analytics |
| Shoppable lookbook | Story and look blocks with direct selection actions | P0 | Composer / Showroom |
| Digital linesheet | Dense commercial view with quick selection and quantity intent | P0 | Showroom |
| Styleboards/whiteboards | Moodboard and look canvas in composer; live whiteboard later | P0/P1 | Composer / Live Appointment |

## 5. What Syntha must do better than WFX

### 5.1 One continuous transaction state

WFX-style presentation capabilities are valuable, but Syntha must connect them into one persistent flow:

```text
Showroom interaction
→ Selection item
→ Buying decision
→ Order line
→ Submitted order version
```

No export/import or manual duplication may be required between these stages.

### 5.2 Better order-writing experience

The buyer must be able to move from a visual product story to a high-density size/colour quantity matrix without changing applications or losing filters, notes, buyer context or price context.

### 5.3 Better collaboration model

Every communication has an explicit context:

- campaign;
- collection;
- product;
- colourway;
- selection item;
- order;
- order line;
- appointment.

Private Shop notes are never visible to Brand. Shared comments clearly display visibility before sending.

### 5.4 Better buyer preview

Brand must preview the exact experience of a selected Shop, including:

- visible collection/products;
- price list;
- currency;
- delivery windows;
- MOQ/pack rules;
- order deadline;
- promotional/story content;
- access expiry;
- language and market.

Preview cannot use generic demo data when a buyer context is selected.

### 5.5 Better analytics semantics

Syntha does not expose vanity metrics without action. Each metric must answer a sales question.

Examples:

- `showroom_opened` → did the invited buyer enter?
- `collection_browse_depth` → how much of the assortment was reviewed?
- `product_shortlisted` → what reached active consideration?
- `selection_created` → did interest become buying intent?
- `order_draft_created` → did selection enter commercial work?
- `order_submitted` → did the opportunity convert?

## 6. First vertical-slice requirements influenced by WFX

The first slice must already support:

- secure buyer context;
- personalised assortment and pricing;
- editorial + grid + linesheet presentation;
- high-resolution images and video;
- detailed product commercial information;
- shoppable looks/story blocks;
- persistent buyer selection;
- private and shared notes with visibility labels;
- engagement event capture;
- campaign invitation-ready data contract;
- an integration boundary for future PLM/ERP product feeds.

The first slice does not require 3D, native video calls, sample requests, PLM or ERP implementation.

## 7. Design rule

WFX is a functional reference, not a visual template. Syntha continues to use the canonical visual system in `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` and machine-readable contracts in `design-system/`.

## 8. Source verification rule

Any additional WFX feature can enter the Product Bible only when:

1. confirmed on an official WFX page, current brochure, help material or product demonstration;
2. recorded with source and check date;
3. mapped to a Syntha user job;
4. assigned P0/P1/P2;
5. checked against the Brand/Shop-only product boundary.
