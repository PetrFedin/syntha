# 07 — Integration & Synchronisation Blueprint

## 1. Назначение

Syntha Wholesale V2 — API-first wholesale workspace. Она может получать product, price, inventory и fulfilment data из внешних систем, но сохраняет собственное владение showroom presentation, buyer access, selection, collaboration и wholesale order negotiation.

Integration code находится только в `infrastructure/adapters` и application ports. Feature UI не знает конкретный ERP/PIM/PLM.

---

# 2. Source-of-truth matrix

| Data domain | Canonical source P0/P1 | Syntha responsibility | External responsibility |
|---|---|---|---|
| User/membership | Syntha/identity provider | session, role, permission | SSO later |
| Brand/Shop profile | Syntha | B2B profile/context | optional CRM sync later |
| Product master | Syntha P0 import; PIM/PLM optional P1 | commercial buyer projection | technical master may live externally |
| Product media | Syntha DAM/storage or external URLs | presentation derivatives/access | original DAM optional |
| Collection membership/story | Syntha | definitive | external may suggest/import only |
| Price lists | Syntha P0; ERP optional P1 | buyer-resolved snapshot | ERP may own master price |
| Availability/ATS | ERP/inventory system P1 | cache/display/warnings | external authoritative quantity |
| Delivery windows/MOQ/pack | Syntha P0; ERP configurable | commercial selling terms | external can sync when authoritative |
| Buyer access/audience | Syntha | definitive | no external bypass |
| Showroom release | Syntha | definitive immutable release | none |
| Selection/budget | Syntha Shop domain | definitive | optional export only |
| Draft/submitted order | Syntha | negotiation/versioning source | ERP receives confirmed/submitted according policy |
| Fulfilment/invoice status | ERP/payment systems P1/P2 | projection for users | external authoritative |
| DealSpace messages/tasks | Syntha | definitive | no ERP ownership |
| Calendar appointment | Syntha + external calendar sync | business context definitive | external calendar copy |
| Analytics events | Syntha | definitive product telemetry | BI export optional |

---

# 3. Integration types

## 3.1 Structured file import/export — P0

Supported:

- CSV;
- XLSX;
- UTF-8 JSON export/import for technical use;
- downloadable error report.

Use cases:

- products/variants;
- prices;
- buyers/contacts;
- availability snapshots;
- order export;
- analytics export.

Required flow:

```text
Upload → Parse → Map → Preview diff → Validate → Execute → Report
```

No direct import on upload.

## 3.2 REST API — P1

- OAuth2/client credentials or signed API keys;
- scoped credentials;
- pagination/cursors;
- idempotent writes;
- webhook subscriptions;
- rate limits;
- versioned contracts.

## 3.3 SFTP scheduled exchange — P1

For legacy ERP environments:

- encrypted transport;
- per-connection directory;
- filename convention;
- checksum;
- processed/error/archive folders;
- replay protection;
- schedule/timezone.

## 3.4 Native connectors — P1+

Candidate adapters:

- Shopify;
- NetSuite;
- SAP;
- Microsoft Dynamics;
- ApparelMagic;
- AIMS360;
- Full Circle;
- Zedonk;
- generic PIM/PLM;
- Google Calendar;
- Microsoft Outlook;
- email provider.

A connector enters scope only through an explicit task and mapping contract.

---

# 4. Canonical ports

```ts
interface ProductSourcePort {
  listChanges(cursor?: string): Promise<ProductSourceBatch>;
  getProduct(externalId: string): Promise<ExternalProduct>;
}

interface PriceSourcePort {
  listPriceLists(cursor?: string): Promise<ExternalPriceBatch>;
}

interface InventorySourcePort {
  listAvailability(cursor?: string): Promise<ExternalAvailabilityBatch>;
}

interface OrderDestinationPort {
  exportOrder(snapshot: ConfirmedOrderExport): Promise<ExternalOrderReceipt>;
  getOrderStatus(externalOrderId: string): Promise<ExternalOrderStatus>;
}

interface CalendarSyncPort {
  upsertExternalEvent(event: CalendarSyncEvent): Promise<ExternalCalendarRef>;
  deleteExternalEvent(ref: ExternalCalendarRef): Promise<void>;
}
```

Vendor-specific SDK/types cannot leak into domain/application layers.

---

# 5. External identity mapping

```ts
type ExternalMapping = {
  id: string;
  connectionId: string;
  entityType: 'product' | 'variant' | 'price_list' | 'buyer' | 'order' | 'store';
  externalId: string;
  internalId: string;
  externalVersion?: string;
  fingerprint?: string;
  lastSyncedAt?: string;
  status: 'active' | 'conflict' | 'orphaned';
};
```

Rules:

- never use external ID as internal primary key;
- mapping unique by connection + entity type + external ID;
- external ID reuse conflict requires manual attention;
- deleting external record does not hard-delete Syntha business history;
- aliases/merges require explicit mapping operation.

---

# 6. Sync modes

## 6.1 Full snapshot

Use for initial onboarding or small catalogues.

```text
fetch all
→ normalize
→ compute diff
→ preview/approve when manual
→ apply
```

## 6.2 Incremental cursor

Preferred scheduled mode.

- external cursor stored only after successful committed batch;
- batch application transactional where possible;
- failed batch does not skip cursor;
- poison record isolated after retry threshold.

## 6.3 Webhook-triggered

Webhook signals change; worker refetches authoritative detail. Do not trust webhook payload as complete source by default.

## 6.4 Manual on-demand

Integration Admin can run sync, but cannot bypass mapping/validation/security policies.

---

# 7. Import mapping system

Mapping supports:

- source column/path;
- target canonical field;
- required/optional;
- transforms;
- enum mapping;
- locale number/date parsing;
- default value;
- concatenation/splitting;
- reference lookup;
- validation rule.

Example:

```text
Style No.       → product.styleCode
Colour Code     → variant.colourCode
Wholesale EUR   → priceListItem.wholesalePriceMinor
Delivery Start  → deliveryWindow.startsOn
Sizes           → sizeScale.sizes
```

Mapping profile is versioned and reusable.

---

# 8. Product sync policy

Field ownership can be configured per connection.

Example:

| Field | Owner | Behaviour |
|---|---|---|
| styleCode | PIM | external updates allowed before snapshots |
| name | PIM/Syntha override | configured precedence |
| technical description | PIM | sync |
| buyerDescription | Syntha | never overwritten by generic PIM |
| internal notes | Syntha | never exported/shared |
| media | DAM/PIM | links imported; Syntha derivatives |
| collection order | Syntha | external cannot reorder |
| story blocks | Syntha | external cannot overwrite |
| category | PIM or Syntha | mapping required |
| availability | ERP | external authoritative cache |

Conflict UI must show field-level owner and proposed change.

---

# 9. Price sync policy

- amount stored in minor units;
- currency explicit;
- taxIncluded explicit;
- validity dates explicit;
- price list status active/draft/archived;
- no currency conversion without explicit FX service/policy;
- buyer access resolves assigned list at request time;
- published release and submitted order store snapshots;
- external price update never rewrites historical snapshot;
- missing buyer price blocks publish/access/order according policy.

---

# 10. Inventory/availability sync

P1 data model:

```ts
type AvailabilitySnapshot = {
  variantId: string;
  warehouseId?: string;
  availableToSell?: number;
  availabilityState: 'available' | 'limited' | 'unavailable' | 'unknown';
  expectedRestockAt?: string;
  sourceConnectionId: string;
  sourceTimestamp: string;
  syncedAt: string;
};
```

Rules:

- stale threshold displayed;
- state can be shown without exact quantity depending commercial policy;
- availability warning does not silently remove draft line;
- unavailable state blocks or warns based campaign/order policy;
- order confirmation can trigger final availability check if enabled.

---

# 11. Order export policy

Recommended P0/P1 boundary:

```text
Draft order        Syntha only
Submitted order    optional preliminary export, configurable
Confirmed order    canonical ERP export trigger
```

Export payload contains immutable snapshot:

- parties and external account IDs;
- order number/version;
- buyer reference;
- currency;
- terms;
- addresses;
- line product/variant external IDs;
- size quantities;
- delivery windows;
- prices/discounts/totals;
- source campaign/collection;
- comments allowed by export policy.

Never export private Shop notes or DealSpace message bodies by default.

## Status import

External statuses map to projection:

```text
accepted
processing
partially_fulfilled
fulfilled
invoiced
cancelled_external
```

They do not mutate confirmed commercial version.

---

# 12. Calendar sync

Syntha Appointment is business source. External calendar is a projection.

Sync fields:

- title with safe commercial context;
- start/end/timezone;
- participants;
- location/meeting URL;
- description with links;
- external event ID/etag.

External edits policy:

- time/participant change creates Syntha proposal/update after conflict validation;
- external deletion does not silently delete Appointment; creates cancellation review or configured action;
- private Syntha context not copied to external description.

---

# 13. Webhooks

Outbound webhook subscription:

```ts
type WebhookSubscription = {
  id: string;
  organisationId: string;
  endpointUrl: string;
  eventTypes: string[];
  secretRef: string;
  status: 'active' | 'paused' | 'failed';
};
```

Delivery:

- signed timestamped request;
- event ID for dedupe;
- exponential retry;
- maximum attempts;
- dead-letter status;
- delivery log without secret;
- replay action by admin;
- SSRF-safe endpoint validation.

---

# 14. SyncRun model

```ts
type SyncRun = {
  id: string;
  connectionId: string;
  direction: 'inbound' | 'outbound';
  entityType: string;
  mode: 'full' | 'incremental' | 'webhook' | 'manual';
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  cursorBefore?: string;
  cursorAfter?: string;
  counts: { read: number; created: number; updated: number; skipped: number; failed: number };
  errorSummary?: SyncErrorSummary;
  correlationId: string;
};
```

UI must show item-level error export for partial/failed runs.

---

# 15. Retry and idempotency

- transient network/5xx: exponential backoff + jitter;
- rate limit: respect Retry-After;
- authentication error: pause connection, require admin;
- validation error: no automatic infinite retry;
- idempotency key per exported order/version;
- inbound fingerprint prevents duplicate apply;
- exactly-once business outcome achieved through idempotent consumer, not assumed transport.

---

# 16. Conflict classes

```text
FIELD_OWNERSHIP_CONFLICT
EXTERNAL_ID_COLLISION
VERSION_CONFLICT
MISSING_REFERENCE
INVALID_ENUM_MAPPING
CURRENCY_MISMATCH
PRICE_VALIDITY_GAP
STALE_INVENTORY
EXTERNAL_DELETION
ORDER_EXPORT_REJECTED
```

Every conflict has:

- human explanation;
- affected entity;
- source value;
- current value;
- recommended resolution;
- retry/ignore/map action;
- audit trail.

---

# 17. Security

- credentials in secret store, never DB plaintext/logs/client;
- least-privilege scopes;
- connection owned by organisation;
- admin-only setup;
- outgoing IP/domain allowlist where needed;
- file scanning;
- SFTP host key verification;
- OAuth token rotation/revocation;
- audit connect/disconnect/export;
- PII minimisation;
- data residency review per connector.

---

# 18. Observability

Metrics:

```text
sync_run_duration
sync_records_processed
sync_failure_rate
sync_retry_count
mapping_conflict_count
webhook_delivery_latency
webhook_failure_rate
order_export_latency
inventory_staleness
```

Logs include connection/run/correlation IDs, never secrets/full sensitive payloads.

Alerts:

- repeated authentication failure;
- order export failure;
- inventory sync stale beyond threshold;
- error rate spike;
- dead-letter webhook backlog;
- missing price reference blocking active campaign.

---

# 19. Connector implementation checklist

1. Define owned data domains.
2. Define authentication.
3. Define external IDs/version semantics.
4. Create normalizer and mapping schema.
5. Define full/incremental/webhook modes.
6. Define conflict policy.
7. Implement idempotency.
8. Implement retry/dead-letter.
9. Add security review.
10. Add fixture/sandbox tests.
11. Add negative tenant tests.
12. Add run UI and error export.
13. Document source-of-truth.
14. Add operational runbook.

---

# 20. Cursor prohibition

Forbidden:

- calling ERP/PIM directly from React component;
- storing vendor SDK type in domain entity;
- overwriting Syntha buyer story/internal notes from generic sync;
- changing submitted order from external status import;
- importing without preview/validation in manual flow;
- logging credentials or raw payment data;
- hardcoding one ERP's fields into canonical Product/Order model.
