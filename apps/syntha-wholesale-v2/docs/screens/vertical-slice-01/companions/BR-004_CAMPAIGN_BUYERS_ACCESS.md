# BR-004 — Campaign Buyers & Access Grants

## 1. Identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/campaigns/:campaignId/buyers`
- **Template:** Entity Registry + Inspector
- **Priority:** P0
- **Capabilities:** CAP-CAM-008–012,019; CAP-REL-002,006,008
- **Primary action:** `Invite Shops`

## 2. User goal

Define exactly which Shops can access the campaign, which collections/products they see, which prices/currency/terms apply, who owns the relationship and whether the invitation has been opened or acted upon.

## 3. Core concepts

The screen manages `CampaignAccessGrant`, not a loose email list.

Each row resolves:

```text
Shop identity
relationship status
access status
visible collections/products
price list
currency
terms/deadline
time window
assigned sales manager
invitation/open/activity/order state
```

## 4. Entry points

- Campaign Overview `Invite Shops`;
- Campaign Buyers tab;
- Buyer Detail `Add to campaign`;
- duplicated campaign audience setup.

## 5. Layout

Desktop:

```text
EntityHeader + Campaign tabs
Summary strip: total / invited / opened / active / selection / order
FilterBar
CampaignBuyer DataTable
Right AccessGrant Inspector 420–560 px
Bulk action bar when rows selected
```

Mobile/iPad portrait:

- summary compact;
- table becomes buyer list cards;
- filters in sheet;
- access grant editor full-screen sheet;
- bulk actions in bottom bar.

## 6. Table columns

Required:

- Shop/logo/name;
- country/market;
- relationship status;
- access/invitation status;
- visible collection count;
- price list/currency;
- deadline;
- assigned manager;
- last activity;
- selection/order state;
- action menu.

Optional P1:

- segment/tags;
- engagement score;
- total submitted/confirmed value;
- next recommended follow-up.

## 7. Filters

- search Shop/contact;
- relationship status;
- invitation/access status;
- opened/not opened;
- collection access;
- price list;
- currency;
- manager/team;
- country/market;
- deadline risk;
- has selection/draft/submitted order;
- no recent activity.

## 8. Invite Shops flow

### Step 1 — Select audience

- existing active relationships;
- pending relationships;
- buyer segments P1;
- CSV import;
- create external invitation contact.

### Step 2 — Access scope

- all currently published campaign collections;
- selected collections;
- product visibility rules P0/P1;
- auto-include future collections yes/no.

### Step 3 — Commercial context

- price list;
- currency;
- order deadline;
- delivery/term overrides;
- assigned sales manager;
- market/language.

### Step 4 — Timing and message

- send now;
- schedule;
- access starts/expires;
- invitation subject/message template;
- reminder policy.

### Step 5 — Review

- recipient count;
- missing contact emails;
- invalid price contexts;
- empty assortment;
- duplicates/existing grants;
- impact summary.

## 9. Access inspector

Sections:

1. Shop and relationship.
2. Contact recipients.
3. Visible collections/products.
4. Pricing/currency.
5. Commercial terms/deadline.
6. Assigned manager.
7. Invitation timeline.
8. Activity summary.
9. Access controls: resend, revoke, expire, copy link where allowed.

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
  permission: CampaignBuyerPermissions;
};

type CampaignBuyerRow = {
  accessGrantId: string;
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

## 11. Commands

```text
CreateCampaignAccessGrant
UpdateCampaignAccessGrant
BulkCreateCampaignAccessGrants
SendCampaignInvitation
ScheduleCampaignInvitation
ResendCampaignInvitation
RevokeCampaignAccessGrant
ExpireCampaignAccessGrant
AssignCampaignSalesManager
```

All bulk commands return per-Shop result.

## 12. Validation

Blocking:

- Shop missing valid relationship/invitation target;
- no recipient contact for email send;
- invalid/inactive price list;
- price list currency mismatch;
- zero visible collection/products;
- grant expiry before start;
- order deadline outside allowed campaign policy;
- duplicate active grant for same Campaign+Shop;
- manager not authorised/active.

Warnings:

- Shop has not ordered in prior seasons;
- relationship pending;
- future collections not included;
- deadline unusually short;
- access changes after buyer opened Showroom;
- price context changed while draft order exists.

## 13. Material change policy

Material changes:

- price list/currency;
- visible assortment;
- deadline;
- commercial terms;
- access expiry;
- revoke/reactivate.

For opened access or existing selection/order:

1. show impact confirmation;
2. require reason for price/assortment revoke where configured;
3. create audit event;
4. notify affected Shop when necessary;
5. preserve existing submitted order snapshot.

## 14. Invitation states

```text
draft
→ invited
→ opened
→ active
→ expired | revoked
```

`opened` means secure invitation was resolved, not necessarily relationship accepted where separate approval is required.

## 15. Permissions

- read: `campaign.read` + buyer scope;
- create/update grant: `buyer.manage`;
- assign price: `pricing.assign`;
- send communications: `campaign.communicate`;
- assign manager: `buyer.assign` or `campaign.assign`;
- revoke: explicit `buyer.manage` and campaign scope.

## 16. Events/notifications

Events:

```text
campaign.access_grant_created
campaign.access_grant_updated
campaign.access_grant_revoked
campaign.invitation_sent
campaign.invitation_opened
campaign.invitation_accepted
campaign.invitation_declined
```

Notifications use dedupe and current audience validation.

## 17. Empty/error states

- no buyers: explain access model + Invite Shops CTA;
- no results: preserve filters + Clear filters;
- partial bulk failure: result table with retry;
- price resolver error: block send and deep link to fix;
- permission denied;
- stale grant version conflict;
- external email provider failure: invitation remains queued/failed, not falsely sent.

## 18. Acceptance criteria

- [ ] Brand can create buyer-specific access with exact collection and price context.
- [ ] Duplicate grants are prevented server-side.
- [ ] Preview and Shop Showroom use same grant ID/resolver.
- [ ] Bulk invitation reports each recipient result.
- [ ] Revocation blocks access immediately.
- [ ] Material changes create audit and required notifications.
- [ ] Shop A cannot see Shop B pricing/access.
- [ ] Existing submitted order snapshot is not changed by grant update.
- [ ] Filters and row state are URL-stable.
- [ ] Mobile supports full access editing without compressed table.

## 19. Non-goals

- global CRM pipeline;
- commission calculation;
- marketing automation beyond campaign invitation/reminders;
- public marketplace audience.
