# SH-013 — Order Validation & Submit

## 1. Identity

- **Role:** Shop
- **Route:** `/wholesale-v2/shop/orders/:orderId/review`
- **Template:** Entity Review
- **Priority:** P0
- **Capabilities:** CAP-ORD-017–019; CAP-BUY-011; CAP-DOC-008
- **Primary action:** `Submit order`

## 2. User goal

Review the complete commercial order, resolve blocking issues, confirm addresses/terms/approvals and submit one explicit immutable version to Brand.

## 3. Entry points

- Order Builder `Review order`;
- internal approval queue;
- Shop Order Detail draft;
- notification about returned/fixed draft;
- direct deep link with valid order access.

## 4. Exit points

- back to exact Builder issue/product context;
- submit success → Shop Order Detail / DealSpace;
- approval request → approval waiting state;
- save and close.

## 5. Page structure

Desktop:

```text
EntityHeader: order, Brand, status, version
Validation status and issue navigator
Order summary
Products/quantities review
Delivery/store split review
Commercial terms/pricing
Addresses and buyer reference
Internal approvals
Notes/documents
Sticky totals + Submit action
```

Mobile:

- step/accordion review;
- persistent units/value/blocker count;
- issue deep links reopen mobile quantity editor;
- Submit sticky after all required sections complete.

## 6. Validation groups

### 6.1 Product and quantities

- at least one non-zero line;
- integer positive quantities;
- valid size/variant;
- no duplicate conflicting lines;
- unavailable/discontinued policy;
- source release/product snapshot exists.

### 6.2 MOQ and packs

- product MOQ;
- minimum packs;
- ratio/fixed pack conformance;
- order minimum;
- category/brand minimum P1.

### 6.3 Pricing

- price list still valid;
- currency consistent;
- price snapshot generated;
- discounts authorised;
- tax mode known;
- suggested retail/margin informational only where permitted.

### 6.4 Delivery and allocation

- each line has delivery window;
- delivery window available to buyer;
- split totals consistent;
- store/address assignment complete when enabled;
- deadline not expired.

### 6.5 Parties and addresses

- valid Brand/Shop active relationship;
- billing address;
- shipping address;
- contact;
- buyer reference if required.

### 6.6 Terms and approvals

- payment/incoterm/terms acknowledged;
- internal approval complete if policy;
- finance approval complete if threshold;
- submitter has permission.

## 7. Severity

```text
blocking   submission impossible
warning    acknowledgement or informed submission
info       contextual recommendation
```

Issue object:

```ts
type ValidationIssue = {
  code: string;
  severity: 'blocking' | 'warning' | 'info';
  group: string;
  message: string;
  entityRef?: EntityRef;
  fieldPath?: string;
  resolution?: string;
  actionTarget?: DeepLinkTarget;
  acknowledgementRequired?: boolean;
};
```

## 8. Data contract

```ts
type OrderReviewVM = {
  order: OrderReviewSummary;
  version: OrderVersionSummary;
  lines: OrderReviewLine[];
  totals: OrderTotals;
  deliverySplits: DeliverySplitSummary[];
  addresses: AddressReview;
  terms: CommercialTermsSnapshot;
  validation: OrderValidationResult;
  approvals: OrderApprovalSummary[];
  documents: DocumentSummary[];
  permissions: OrderReviewPermissions;
};
```

## 9. Queries and commands

```text
GET  order review projection
POST /orders/:id/validate
POST /orders/:id/request-approval
POST /orders/:id/submit
```

Commands:

```text
ValidateOrderVersion
RequestOrderApproval
ApproveOrderInternally
SubmitOrder
```

Submit payload:

```ts
type SubmitOrderCommand = {
  orderId: string;
  expectedVersionId: string;
  expectedVersion: string;
  validationFingerprint: string;
  acknowledgedWarningCodes: string[];
  acceptedTermsVersion: string;
  idempotencyKey: string;
};
```

## 10. Issue navigation

Every fixable issue includes a target:

- product line/size cell;
- delivery selector;
- terms section;
- address editor;
- approval request.

Back to Builder preserves issue focus and scroll/product state.

## 11. Internal approval

Optional policy:

```text
amount threshold
currency
brand/category
buyer role
store/market
```

States:

```text
not_required
pending
approved
rejected
expired_due_to_change
```

Any material order edit after approval can invalidate approval via fingerprint/version rule.

## 12. Submit transaction

Atomic steps:

1. authorize submitter and scope;
2. verify draft/order state;
3. verify expected version;
4. rerun/verify validation fingerprint;
5. verify approvals and terms version;
6. create immutable submitted OrderVersion snapshot;
7. transition Order to submitted;
8. create/link Brand action item and DealSpace activity;
9. emit domain/audit/outbox events;
10. enqueue notifications;
11. return submitted version and route.

No partial submitted status without immutable snapshot/event.

## 13. Success state

Show:

- submitted order number/version;
- timestamp;
- Brand recipient/assigned manager;
- value/units;
- next expected step;
- link to Order Detail and DealSpace;
- export/download option according permission;
- confirmation email status optional.

## 14. Error/conflict states

### Validation changed

Prices, availability, terms or draft changed since review:

- invalidate submit;
- show new/changed issues;
- actions Refresh review / Return to Builder.

### Version conflict

- identify newer editor/version if available;
- compare/reload;
- never submit stale version.

### Notification/export failure

Order remains submitted if transaction committed. Show that notification/export is pending/failed separately; do not roll back commercial submission unless policy explicitly requires external acceptance.

### Permission/relationship failure

- relationship suspended;
- grant expired;
- submit permission removed;
- show safe recovery/contact action.

## 15. Permissions

- read `order.read`;
- validate `order.update` or explicit review permission;
- request/approve `order.approve`;
- submit `order.submit` and policy scope;
- export `order.export`.

Finance approver may approve but not change quantities unless separate permission.

## 16. Events and notifications

```text
order.validation_completed
order.internal_approval_requested
order.internal_approved|rejected
order.submitted
order.version_frozen
brand.order_action_required
```

Notifications:

- Brand assigned sales users;
- Shop order owner/approvers;
- email + in-app according mandatory policy.

## 17. Analytics

```text
order_review_opened
order_validation_failed
order_issue_fix_opened
order_approval_requested
order_submitted
```

No raw order lines/prices in general analytics payload.

## 18. Acceptance criteria

- [ ] Validation runs server-side and groups issues correctly.
- [ ] Every fixable blocker deep-links to exact edit context.
- [ ] Submit is disabled for blockers or missing approval.
- [ ] Warning acknowledgements are explicit and audited.
- [ ] Stale version/fingerprint cannot submit.
- [ ] Successful submit creates immutable snapshot atomically.
- [ ] Brand is notified and sees exact submitted version.
- [ ] Subsequent catalogue price change does not rewrite submitted totals.
- [ ] Repeated submit request is idempotent.
- [ ] Mobile review is complete and does not expose compressed matrix.
- [ ] Permission and relationship denial have negative tests.

## 19. Non-goals

- Brand revision editing;
- payment collection;
- fulfilment tracking;
- confirmed-order amendment;
- returns/claims.
