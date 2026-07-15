# BR-004 — Campaign Buyers & Access Grants

## 1. Identity

- **Role:** Brand.
- **Route:** `/wholesale-v2/brand/campaigns/:campaignId/buyers`.
- **Template:** Entity Registry + Inspector.
- **Priority:** P0.
- **Capabilities:** CAP-CAM-008–012, CAP-CAM-019, CAP-REL-002, CAP-REL-006, CAP-REL-008.
- **Workflow:** WF-002.
- **Primary action:** `Invite Shops`.

## 2. User goal

Define exactly which Shops can access the Campaign, which Collections/products they see, which price list, currency, terms and deadline apply, who owns the relationship and what stage the buyer has reached.

## 3. Domain object

The screen manages `CampaignAccessGrant`, not a loose mailing list.

Each grant resolves:

```text
Shop identity
relationship status
access/invitation status
visible collections/products
price list and currency
commercial terms and deadline
access timing
assigned sales manager
invitation/open/activity/order state
```

## 4. Entry and exit

Entry:

- Campaign Overview `Invite Shops`;
- Campaign Buyers tab;
- Buyer Detail `Add to campaign`;
- duplicated Campaign audience setup.

Exit:

- Buyer Preview for selected Shop;
- Shop/Buyer Detail;
- Campaign Overview;
- send/review invitation result;
- related Selection/Order if one exists.

## 5. Desktop layout

```text
EntityHeader + Campaign tabs
Summary strip: total / invited / opened / active / selection / order
FilterBar
CampaignBuyer DataTable
Right AccessGrant Inspector 420–560 px
BulkActionBar when selected
```

Mobile/iPad portrait:

- compact summary;
- list cards instead of compressed table;
- filters in sheet;
- grant editor full-screen sheet;
- bulk actions in bottom bar.

## 6. Table columns

Required:

- Shop/logo/name;
- country/market;
- relationship status;
- invitation/access status;
- visible collection count;
- price list/currency;
- order deadline;
- assigned manager;
- last activity;
- selection/order state;
- action menu.

P1:

- segments/tags;
- engagement score;
- submitted/confirmed value;
- recommended follow-up.

## 7. Filters and saved views

- Shop/contact search;
- relationship status;
- invitation/access status;
- opened/not opened;
- collection access;
- price list/currency;
- manager/team;
- country/market;
- deadline risk;
- has selection/draft/submitted order;
- inactivity window.

URL stores q, status, manager, collection, priceList, currency, activity, sort and view.

## 8. Invite Shops flow

### Step 1 — Audience

- active relationships;
- pending relationship contacts;
- individual Shops;
- segments P1;
- CSV import;
- external invited contact.

### Step 2 — Access scope

- all current Campaign Collections;
- selected Collections;
- product visibility rules;
- auto-include future Collections yes/no.

### Step 3 — Commercial context

- price list;
- currency;
- deadline;
- delivery/term overrides;
- assigned manager;
- market/language.

### Step 4 — Timing and communication

- send now;
- schedule P1;
- access starts/expires;
- invitation subject/message;
- reminder policy.

### Step 5 — Review

Show:

- recipient count;
- missing email/contact;
- duplicate/existing grants;
- invalid prices;
- empty buyer assortment;
- impact on existing open access/order.

## 9. Access Grant Inspector

Sections:

1. Shop and TradingRelationship.
2. Recipient contacts.
3. Visible Collections/products.
4. Price list/currency.
5. Terms/deadline/access timing.
6. Assigned manager.
7. Invitation timeline.
8. Activity/Selection/Order summary.
9. Resend, revoke, expire and Preview actions.

## 10. Data contract

```ts
type CampaignBuyerAccessVM = {
  campaign: CampaignSummary;
  summary: CampaignAudienceSummary;
  rows: CursorPage<CampaignBuyerRow>;
  facets: CampaignBuyerFacets;
  collections: CollectionAccessOption[];
  priceLists: PriceListOption[];
  managers: AssignableUser[];
  permissions: CampaignBuyerPermissions;
};

type CampaignBuyerRow = {
  accessGrantId: string;
  version: string;
  shop: ShopSummary;
  relationshipStatus: 'pending' | 'active' | 'suspended' | 'ended';
  accessStatus: 'draft' | 'invited' | 'opened' | 'active' | 'revoked' | 'expired';
  visibleCollectionCount: number;
  priceList: PriceListSummary;
  currency: string;
  orderDeadline?: string;
  assignedManager?: UserSummary;
  invitedAt?: string;
  openedAt?: string;
  lastActivityAt?: string;
  selectionStatus?: string;
  orderStatus?: string;
};
```

## 11. Queries and commands

Queries:

```text
ListCampaignBuyerAccess
GetCampaignBuyerFacets
GetCampaignAccessGrant
ResolveBuyerPreviewContext
```

Commands:

```text
CreateCampaignAccessGrant
UpdateCampaignAccessGrant
BulkCreateCampaignAccessGrants
SendCampaignInvitation
ScheduleCampaignInvitation P1
ResendCampaignInvitation
RevokeCampaignAccessGrant
ExpireCampaignAccessGrant
AssignCampaignSalesManager
```

Bulk result is per Shop: created, updated, skipped, failed, conflict.

## 12. Validation

Blocking:

- missing relationship/invitation target;
- recipient without valid email for send;
- inactive price list;
- currency mismatch;
- no visible Collection/product;
- expiry before start;
- invalid deadline;
- duplicate active grant;
- inactive/unauthorised manager.

Warnings:

- relationship pending;
- Shop has not ordered previously;
- future Collections excluded;
- deadline unusually short;
- access changed after open;
- price/assortment change while Selection or draft Order exists.

## 13. Material change policy

Material:

- price list/currency;
- visible assortment;
- deadline;
- terms;
- expiry;
- revoke/reactivate.

For opened access or existing Selection/Order:

1. show impact confirmation;
2. require reason where configured;
3. audit change;
4. notify affected Shop when required;
5. invalidate access cache/session if revoked;
6. preserve submitted Order snapshots.

## 14. State model

```text
draft → invited → opened → active → expired | revoked
```

`opened` means the invitation was securely resolved. `active` means the Shop can use the grant in authenticated context.

## 15. Permissions

- read: `campaign.read` + buyer scope;
- grant create/update/revoke: `buyer.manage`;
- price assignment: `pricing.assign`;
- send: `campaign.communicate`;
- manager assignment: `buyer.assign` or `campaign.assign`.

Brand user can only manage Shops within effective assignment scope.

## 16. Events and notifications

```text
campaign.access_grant_created
campaign.access_grant_updated
campaign.access_grant_revoked
campaign.invitation_sent
campaign.invitation_opened
campaign.invitation_accepted
campaign.invitation_declined
campaign.commercial_context_changed
```

Notifications use event consumers and dedupe keys, not direct component calls.

## 17. States

- initial loading;
- no buyers;
- no filter results;
- inspector loading;
- bulk executing;
- partial bulk failure;
- invitation provider queued/failed;
- price resolver error;
- forbidden;
- stale grant conflict;
- revoked/expired success state.

No buyer empty state includes one action: `Invite Shops`.

## 18. Security and privacy

- Shop A never receives Shop B grant/price data;
- grant IDs checked against Campaign and Brand tenant;
- revocation removes realtime/read access immediately;
- invitation link is signed, expiring and revocable;
- raw token is not stored in analytics;
- internal buyer strategy notes are not shared;
- submitted Order snapshot is independent of later grant changes.

## 19. Analytics

```text
campaign_buyers_opened
campaign_access_created
campaign_invitation_sent
campaign_invitation_resend_requested
campaign_access_revoked
buyer_preview_opened
```

## 20. Acceptance criteria

- [ ] Brand creates exact buyer access with Collection/product/pricing context.
- [ ] Duplicate active grant is prevented server-side.
- [ ] Bulk invite returns a result for every row.
- [ ] Preview and Shop Showroom use the same grant/resolver.
- [ ] Revocation blocks access and realtime subscriptions immediately.
- [ ] Material changes create audit and appropriate notification.
- [ ] Shop A cannot read Shop B context.
- [ ] Submitted Order values are not rewritten by grant updates.
- [ ] Filters and inspector state are stable.
- [ ] Mobile supports complete grant editing.

## 21. Non-goals

- general-purpose CRM pipeline;
- commission calculations;
- public marketplace audience;
- broad marketing automation;
- production customer management.
