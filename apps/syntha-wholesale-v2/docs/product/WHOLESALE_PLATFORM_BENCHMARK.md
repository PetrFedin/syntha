# Wholesale Platform Benchmark

Updated: 2026-07-17

## Verdict

The current Syntha V2 canon covers the core lifecycle `Campaign -> Collection -> Showroom -> Selection -> Order Builder -> Order -> confirmation -> DealSpace`, Brand/Shop organisation contexts, Calendar and DealSpace.

It does **not** yet explicitly cover the full capability set expected from a modern fashion wholesale platform. The largest gaps are account-specific commercial policy, assortment planning, inventory and delivery logic, reorders, payments, retailer CRM, integrations, analytics and global trade settings.

The benchmark is not a licence to copy competitors. Each pattern must be classified as `ADOPT`, `ADAPT`, `DEFER` or `EXCLUDE`, translated into Syntha language and assigned to one owning module.

## Platforms considered

Primary references:

- JOOR: wholesale network, virtual showrooms, order management, payments, reporting, retailer discovery, hybrid selling and ERP/PLM/POS integrations.
- NuORDER by Lightspeed: digital catalogs, visual assortment planning, doors, deliveries, size curves, marketplace, global commerce and ERP/PLM/POS integrations.
- Brandboom: linesheets, order capture, buyer-facing B2B commerce and payment-oriented workflows.
- Le New Black: wholesale ecommerce, showroom/order operations, account management and connected back-office workflows.

The machine-readable decisions are stored in `wholesale-capability-benchmark.json`.

## Coverage summary

| Area | Current coverage | Required decision |
|---|---|---|
| Campaign, collection and showroom lifecycle | Canonical | Keep and refine |
| Digital linesheets and rich media | Partial | Adopt |
| Buyer selection and collaborative decision history | Canonical | Keep through Selection and DealSpace |
| Visual assortment planning | Partial | Adapt for budgets, doors, delivery windows and duplication control |
| Account-specific assortments and pricing | Missing | Add to MVP canon |
| Order writing and size curves | Partial | Add packs, bulk actions, size curves and validation |
| Inventory, ATS and delivery windows | Missing | Add to MVP canon |
| Order amendment, approval and confirmation | Partial | Add explicit state machine and audit trail |
| Reorders and at-once availability | Missing | Add to MVP canon |
| Payments, deposits, invoices and credit | Missing | Design boundary now; implementation may be post-MVP |
| Retailer/account CRM | Partial | Add contacts, notes, activity, terms and relationship history |
| Sales-rep and territory operations | Missing | Defer unless launch model requires field sales |
| Marketplace and connection requests | Partial | Defer full network effects; preserve compatible boundary |
| Integrations | Missing | Add contracts to MVP foundation |
| Wholesale analytics | Missing | Add metric definitions and event inputs before feature work |
| Multi-currency, tax and locale | Missing | Add to MVP commercial policy |
| Fine-grained permissions | Partial | Add organisation, account and field-level rules |
| Returns and claims | Missing | Post-MVP, but order lifecycle must not prevent it |
| Production, BOM, QC and supply-chain execution | Explicitly excluded | Keep out of MVP |

## Capability decisions

### 1. Digital showroom and linesheets — ADOPT

Syntha already has Showroom in the canonical lifecycle. It must support curated stories, collections, products, high-resolution media, video, product attributes, downloadable/shareable linesheets and buyer-specific visibility.

### 2. Account-specific commerce — ADAPT, MVP gap

A brand must be able to expose different assortments, price lists, currencies, discounts, minimums, payment terms, delivery windows and product availability to different Shop organisations or accounts. These rules must be server-enforced and auditable.

### 3. Visual assortment planning — ADAPT, MVP gap

Selection must evolve beyond a saved product list. Required concepts include budgets, units, value, category and brand rollups, duplicate-buy warnings, notes of intent, doors or locations, delivery periods and localized size curves.

### 4. Order builder — ADOPT, partial

Order Builder must support matrix entry, size curves, pre-packs, bulk edits, copy/paste, minimum quantities, order multiples, delivery splits, currency-aware totals, validation and a clear distinction between draft selection and commercial order.

### 5. Inventory, ATS and delivery — ADAPT, MVP gap

The platform needs a normalized availability contract for preorder, immediate/at-once, ATS, delivery windows, cancellation dates, inventory freshness and source-system authority. Syntha should not become the inventory system of record.

### 6. Order state and audit — ADOPT, partial

Orders need an explicit state machine covering draft, submitted, amendment requested, pending approval, approved, confirmed, rejected, cancelled and closed. Every commercial change must preserve actor, timestamp, reason and before/after values.

### 7. Payments and credit — ADAPT, post-MVP implementation

The product canon should define deposits, payment links, invoices, due dates, credit terms, payment status, refunds and reconciliation boundaries. Payment processing itself can be integrated later and must not be embedded inside the Order domain.

### 8. Retailer/account CRM — ADAPT, MVP gap

Account records need organisations, locations, contacts, buyer roles, territories, commercial terms, notes, activities, relationship history, documents and linked orders. DealSpace should provide collaboration, not replace the account master.

### 9. Sales operations and offline mode — DEFER

Territories, targets, commissions, rep books and offline iPad selling are valuable for enterprise brands but should remain post-MVP unless the launch operating model explicitly requires them.

### 10. Marketplace discovery — ADAPT, post-MVP

Syntha may later support discovery, invitations, connection requests and trade-show spaces. MVP architecture should avoid assumptions that every Brand-Shop relationship already exists, but network growth mechanics are not the first implementation priority.

### 11. Integrations — ADOPT, MVP foundation gap

Define inbound and outbound contracts for products, media, inventory, prices, accounts, orders, confirmations and payment status. Adapters may connect ERP, PIM, PLM, POS, accounting and ecommerce systems. External schemas must not leak into business modules.

### 12. Catalog data quality — ADOPT, partial

Catalog needs import, validation, enrichment, deduplication, variant and size normalization, media completeness, publication readiness, versioning and error reporting.

### 13. Analytics — ADAPT, MVP gap

Define metrics before dashboards: sell-in, order value, units, average wholesale price, category mix, buyer conversion, showroom engagement, reorder rate, top styles, account performance, territory/region performance and order-cycle time. Analytics should consume events and read models rather than own transactional state.

### 14. Reorders — ADOPT, MVP gap

Support self-service reorder from confirmed orders or immediate inventory, with current price, availability, terms and delivery validation. Reorder must create a new order and never silently mutate historical orders.

### 15. Appointments and trade shows — ADAPT, covered

Calendar is already core. It should support appointments linked to Brand, Shop, Campaign, Showroom, Selection and DealSpace. A future trade-show mode can compose the same primitives.

### 16. Collaboration — ADAPT, covered

DealSpace should hold comments, files, mentions, decisions, tasks and linked commercial objects with permissions and audit history. It must not become an unstructured replacement for order states or account data.

### 17. Global commercial policy — ADOPT, MVP gap

Support multiple currencies, localized price lists, tax treatment, Incoterms or delivery terms where required, languages, time zones, number/date formats and market-specific commercial constraints.

### 18. Identity and permissions — ADOPT, partial

Required levels include organisation membership, Brand/Shop context, account access, role permissions, object-level access and sensitive field protection. Authorization must be enforced server-side.

### 19. Returns and claims — DEFER

The first release may exclude operational returns and claims, but order and document models must allow later links to claims, credit notes and replacement orders.

### 20. Production and supply-chain execution — EXCLUDE

BOM, production planning, factory execution, QC and supply-chain control remain outside Syntha Wholesale V2 MVP. Integrations may expose status or reference data without moving those workflows into Syntha.

## Critical missing MVP decisions

Before the first business implementation task becomes `READY`, `TASK-0005` must resolve:

1. commercial-policy ownership and precedence;
2. definition of account, door/location and buyer contact;
3. Selection versus Assortment versus Order Builder boundaries;
4. inventory/ATS authority and freshness rules;
5. delivery-window and cancellation-date model;
6. order state machine and amendment rules;
7. reorder semantics;
8. integration contracts and idempotency;
9. analytics event and metric dictionary;
10. multi-currency, tax and permission rules.

## Product boundary

Syntha should combine the strongest patterns of wholesale commerce, assortment planning and buyer-brand collaboration while avoiding a monolithic copy of JOOR or NuORDER. The target differentiation remains:

- one coherent lifecycle instead of disconnected tools;
- explicit Brand and Shop contexts;
- decision history through Selection and DealSpace;
- modular integration boundaries;
- analytics-ready commands and events;
- strict separation between wholesale commerce and PLM/production execution.
