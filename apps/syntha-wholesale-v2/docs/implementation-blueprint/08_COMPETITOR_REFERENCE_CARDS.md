# 08 — Competitor Reference Cards

## 1. Методология

Статусы источников:

```text
OFFICIAL_VERIFIED    подтверждено текущей официальной страницей/help center
SECONDARY_VERIFIED   подтверждено авторитетным отраслевым источником
VERIFY               требует demo/help-center проверки
```

Решения Syntha:

```text
ADOPT       взять принцип/функцию в P0/P1
IMPROVE     взять и сделать связнее/удобнее
LATER       предусмотреть, не задерживать MVP
EXCLUDE     не входит в продуктовый фокус
```

Дата проверки: `2026-07-15`.

---

# 2. JOOR

## Source status

`OFFICIAL_VERIFIED`

Sources:

- https://www.joor.com/
- linked official product/help/API/integration pages from JOOR navigation.

## Verified capability groups

- all-in-one wholesale platform for Brands and Retailers;
- virtual showrooms;
- digital linesheets;
- B2B order management;
- reporting;
- embedded wholesale payment product;
- retailer discovery/network;
- retailer assortment visualisation;
- ordering and payment in one platform;
- digital trade show portal/Passport;
- large set of ERP/PLM/POS integrations and Brand API.

## What Syntha adopts

| JOOR pattern | Syntha decision | Capability |
|---|---|---|
| End-to-end Brand/Shop wholesale network | ADOPT | REL, Campaign, Order |
| Virtual showroom + linesheet | ADOPT/IMPROVE | CAP-SHO-002–005 |
| Strong order management | ADOPT/IMPROVE | CAP-ORD |
| Brand discovery | P1 | CAP-MKT-001–003 |
| Visual retailer assortment | P1 | CAP-BUY-009 |
| Digital trade show portal | P2 | CAP-MKT-005 |
| ERP/POS integrations | P1 adapters | CAP-INT |
| Embedded payments | P2 | CAP-ORD-029 |

## What Syntha must improve

1. Showroom interaction must flow directly into Selection and OrderLine without export/import.
2. Buyer Preview must reproduce exact Shop pricing/access context.
3. DealSpace must provide campaign/product/order-level context, not detached communication.
4. Order Builder must expose autosave, undo/redo, validation, source lineage and mobile guided mode.
5. Campaign should become the operational sales workspace, not only catalogue/order grouping.

## Excluded from first core

- payment underwriting/risk infrastructure;
- global discovery marketplace as P0;
- full trade show portal before core order flow.

---

# 3. NuORDER by Lightspeed

## Source status

`OFFICIAL_VERIFIED`

Source:

- https://www.nuorder.com/

## Verified capability groups

Wholesale:

- branded B2B ecommerce;
- 24/7 order acceptance;
- account-specific pricing, discounts and product selections;
- advanced sales tools;
- order management;
- configurable workflows;
- integrated payments;
- reporting/actionable insights.

Assortments:

- enterprise buying platform;
- visual roll-ups to identify duplicate buys;
- localized size-curve allocation;
- real-time team assortment collaboration.

Marketplace/integration:

- brand marketplace/catalog discovery;
- centralised order management and fulfilment tracking;
- API/FTP integrations with ERP/PLM/POS;
- real-time product, inventory and order data.

## What Syntha adopts

| NuORDER pattern | Decision | Capability |
|---|---|---|
| Account-specific pricing/selection | ADOPT | CAM-010/011, SHO-010/011 |
| Visual assortment roll-up | P1 | BUY-009 |
| Duplicate-buy detection | P1 | BUY-010 |
| Size-curve allocation | P0 pack rules/P1 store allocation | CAT-016, BUY-014 |
| Real-time team collaboration | IMPROVE | Selection/Order versioning |
| Branded B2B ecommerce experience | ADOPT for Showroom | SHO |
| Reporting/insights | P1 | ANA |
| API/FTP integrations | P1 | INT |
| Integrated payments | P2 | ORD-029 |

## What Syntha must improve

1. Merge visual assortment and wholesale order writing into one continuous context.
2. Preserve private Shop decisions separately from Brand-visible signals.
3. Make Selection a formal domain object with lineage to Order.
4. Provide a simpler role/navigation model for fashion Brand↔Shop collaboration.
5. Provide explicit version conflict and revision comparison.

## Avoid

- building enterprise assortment planning depth before the core showroom/order experience;
- allowing broad configuration to create inconsistent UI patterns.

---

# 4. World Fashion Exchange (WFX)

## Source status

`OFFICIAL_VERIFIED`

Sources:

- https://www.worldfashionexchange.com/
- https://www.worldfashionexchange.com/virtual-fashion-showroom-software.html

Detailed mapping lives in `docs/15_WFX_REFERENCE_AND_ADAPTATION.md`.

## Verified buyer-facing capabilities

- private buyer invitations;
- buyer-specific assortment, prices and promotions;
- high-resolution imagery, HD video, 3D/360-ready presentation;
- detailed product information;
- PLM/ERP integration;
- feedback, chat and video calls;
- targeted email campaigns with secure links;
- engagement/showroom analytics;
- shoppable lookbooks and digital line sheets;
- interactive styleboards/digital whiteboards.

## Syntha decisions

| WFX pattern | Decision |
|---|---|
| Secure personalised showroom | P0 ADOPT |
| Buyer Preview | P0 IMPROVE with same resolver as Shop |
| Shoppable story/lookbook/linesheet | P0 ADOPT |
| Feedback/chat | P0 IMPROVE through contextual DealSpace |
| Engagement analytics | event foundation P0, dashboards P1 |
| Video | P0 content, native calls P2 |
| 360/3D | P1 adapter |
| Whiteboard | P2 |
| PLM/ERP suite | EXCLUDE execution; integration ports only |
| MES/production/traceability | EXCLUDE from wholesale core |

## Key Syntha improvement

WFX-style showroom presentation becomes a transaction chain:

```text
Showroom → Selection → Buying decision → Order Builder → Versioned Order
```

---

# 5. Brandboom

## Source status

`OFFICIAL_VERIFIED`

Source:

- https://www.brandboom.com/

## Verified capability groups

- line sheets and product presentations;
- links and PDF sharing;
- video, lifestyle imagery and rich media;
- instant catalogue updates/current availability;
- direct ordering from presentation link;
- product/inventory/order sync and ERP integrations;
- real-time inventory updates;
- clean order exports;
- buyer activity and click tracking;
- abandoned cart and upsell opportunity visibility;
- rep/team performance;
- order tracking and unified reports;
- payment integrations;
- sales rep/showroom team collaboration and commission tracking;
- buyer network/discovery;
- AI-oriented buyer/sales assistance claims.

## What Syntha adopts

| Brandboom pattern | Decision | Capability |
|---|---|---|
| Fast beautiful linesheets | P0 | SHO-004 |
| Shareable presentation link | P0 secure invitation, public link P1 | SHO-009 |
| Rich media | P0 | SHO-013/014 |
| Current availability | P1 | CAT-017 |
| Buyer behaviour/action queues | P1 | ANA-002–008 |
| Abandoned selection follow-up | P1 | ANA-008 |
| Sales manager/rep visibility | P1 | ANA-007 |
| Order/export/integration | P0/P1 | ORD/INT |
| Payments | P2 | ORD-029 |
| Commission management | EXCLUDE from P0/P1 |

## What Syntha must improve

- distinguish private Shop intent from Brand sales analytics;
- connect activity directly to Campaign/DealSpace actions;
- keep presentation and dense Order Builder equally strong;
- avoid rep/commission complexity in core navigation;
- implement AI only after reliable event/order data exists.

---

# 6. RepSpark

## Source status

`OFFICIAL_VERIFIED`

Source:

- https://www.repspark.com/

## Verified capability groups

- 24/7 retailer ordering;
- always-on cart;
- custom assortments and digital catalogues;
- branded microsites/event selling;
- product customisation/licensing workflows;
- live/allotted inventory views;
- retailer discovery/access requests;
- invoices and payments;
- ERP integrations/Open API;
- pre-book ordering and size-run apparel flows;
- AI order insights;
- event microsites;
- account-specific pricing and retailer adoption focus.

## Syntha decisions

| RepSpark pattern | Decision | Capability |
|---|---|---|
| Persistent/always-on selection cart | P0 IMPROVE as Selection | SHO-017, BUY-001 |
| Custom assortments | P0 | CAM-011 |
| Pre-book/size-run ordering | P0 | ORD-004/007 |
| Live inventory | P1 | CAT-017 |
| Discovery/access request | P1 | REL-003, MKT |
| AI reorder/upsell/risk signals | P2 | ANA-011 |
| Event microsites | P2 | MKT-006 |
| Payments/invoices | P2 | ORD-029 |
| Product logo/customisation | LATER optional vertical module |
| Licensing/royalty workflows | EXCLUDE from core |

## What Syntha must improve

- fashion-season Campaign and editorial showroom quality;
- buyer-specific preview and release versioning;
- order negotiation/revision between Brand and Shop;
- contextual communication and appointment integration;
- keep vertical-specific customisation outside universal core.

---

# 7. Le New Black

## Source status

`SECONDARY_VERIFIED` for current analysis; official site content was not reliably retrievable in this research pass.

Sources used:

- Vogue Business coverage of digital wholesale platforms and Shanghai hybrid fashion week;
- public references describing Le New Black as a fashion B2B platform for digital collection presentation and buyer order management.

## Confirmed direction

- fashion-focused digital collection presentation;
- digital order management;
- buyer-specific price list simplification;
- visual/customised showroom emphasis;
- international Brand/Retailer usage.

## Syntha decision

| Pattern | Decision |
|---|---|
| Strong fashion aesthetic and brand presentation | P0 inspiration, not visual copy |
| Simplified price-list distribution | P0 buyer resolver |
| Digital showroom supporting physical selling | P0/P1 hybrid appointment |
| Immersive showroom | editorial mode P0; 3D/VR later |

## Verification backlog

Before marking detailed capability rows `YES`, review:

- current official product pages;
- help centre/demo;
- order lifecycle;
- inventory/integration depth;
- mobile/tablet functionality;
- analytics and collaboration.

---

# 8. Faire

## Source status

`OFFICIAL_VERIFIED` for marketplace/order/payment/returns/messaging flows through Faire Help Center.

Source:

- https://www.faire.com/support

## Verified capability groups relevant to Syntha

- wholesale marketplace connecting independent retailers and brands;
- retailer account verification;
- brand fulfilment and shipment tracking;
- payment terms including net terms;
- invoices/payment handling;
- cancellation/request-cancellation lifecycle;
- opening-order return policy and claims;
- damaged/missing-item workflows;
- Brand↔Retailer Messenger with attachments on supported clients;
- unread/needs-reply conversation management;
- messages linked to brand/order/cart context.

## Syntha decisions

| Faire pattern | Decision | Capability |
|---|---|---|
| Easy brand discovery | P1 | MKT |
| Low-friction account/access verification | P1 | REL/identity |
| Contextual messenger with order/profile links | P0 IMPROVE | DSP |
| Needs-reply queue | P1 | DSP/ANA action queue |
| Payment terms/invoices | P2 | ORD-029 |
| Cancellation proposal lifecycle | P1 state policy | Order |
| Returns/claims/fulfilment operations | EXCLUDE from initial preorder wholesale core; later optional |
| Marketplace-funded returns/credit | EXCLUDE |
| Brand-fulfilled shipment projection | P1 via ERP status |

## What Syntha must not copy

Faire is a marketplace/transaction operator. Syntha P0 is a private B2B selling and buying workspace. It should not take responsibility for:

- credit underwriting;
- marketplace returns;
- central fulfilment;
- claims adjudication;
- marketplace commissions.

---

# 9. Consolidated best-of map

| Product need | Strong reference | Syntha implementation |
|---|---|---|
| End-to-end wholesale network/order | JOOR | Campaign + relationship + order + integrations |
| Enterprise visual assortment planning | NuORDER | Buying Workspace P1, selection P0 |
| Personalised rich virtual showroom | WFX | Buyer-resolved Showroom and Preview |
| Fashion-native visual simplicity | Le New Black | editorial presentation with restrained shell |
| Fast linesheets and seller usability | Brandboom | linesheet + quick actions + activity queue |
| Always-on cart/reorder/vertical adoption | RepSpark | persistent Selection + reorder P1 |
| Discovery, messaging, transaction trust | Faire | discovery P1 + contextual DealSpace; finance later |

---

# 10. Syntha differentiators

1. **Campaign as operating system:** collection, audience, appointments, orders, calendar and activity share one context.
2. **Exact Buyer Preview:** same resolver as production Shop Showroom.
3. **Continuous lineage:** showroom interaction → selection → order line → version.
4. **Order Builder quality:** keyboard/paste, matrix, validation, autosave, undo/redo and mobile guided mode.
5. **Contextual DealSpace:** every conversation belongs to a business object and has explicit visibility.
6. **Versioned negotiation:** Brand revisions never silently overwrite Shop orders.
7. **One coherent visual system:** Brand and Shop use the same canonical components across devices.

---

# 11. Product selection rule

A competitor feature enters Syntha only when:

1. source and current status are recorded;
2. it solves a defined Brand or Shop job;
3. Capability ID exists;
4. role/permission is defined;
5. entity and workflow are defined;
6. it does not violate Product Canon;
7. priority/dependency is assigned;
8. Screen/API/Event contracts are created before code.
