# BR-003 — Campaign Overview

## 1. Screen identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/campaigns/:campaignId`
- **Template:** Entity Workspace
- **Priority:** P0
- **Primary job:** understand campaign readiness and move the selling process forward.
- **Dynamic primary action:** the most important next valid action.

## 2. User goal

A Brand user opens the campaign and immediately understands:

- campaign status and selling dates;
- whether the campaign can start or continue;
- which collections are ready/published;
- whether buyers have access;
- what requires attention today;
- current order progress;
- the exact next action.

## 3. Entry points

- Campaign Registry row/card;
- Brand Dashboard;
- global search;
- notification;
- direct link;
- linked campaign from collection/order/appointment.

## 4. Exit points

- open Collection Overview;
- create collection;
- invite shops;
- open appointments/calendar;
- open campaign settings;
- activate/schedule/close campaign;
- open orders;
- open DealSpace.

## 5. Data contract

```ts
type CampaignOverviewVM = {
  campaign: SalesCampaign;
  permissions: {
    canEdit: boolean;
    canManageCollections: boolean;
    canManageBuyers: boolean;
    canSchedule: boolean;
    canActivate: boolean;
    canClose: boolean;
    canArchive: boolean;
  };
  readiness: {
    state: 'not_started' | 'in_progress' | 'ready' | 'blocked';
    blockingIssues: ReadinessIssue[];
    warnings: ReadinessIssue[];
    completedChecks: number;
    totalChecks: number;
  };
  collections: CampaignCollectionSummary[];
  buyerAccess: {
    invited: number;
    opened: number;
    active: number;
    expired: number;
    revoked: number;
    withoutPriceList: number;
  };
  appointments: {
    today: AppointmentSummary[];
    upcomingCount: number;
  };
  orders: {
    draftCount: number;
    submittedCount: number;
    confirmedCount: number;
    submittedValue?: Money;
    confirmedValue?: Money;
  };
  deadlines: CampaignDeadline[];
  tasks: TaskSummary[];
  recentActivity: ActivityEvent[];
};
```

All monetary values must carry currency. Cross-currency aggregation requires a labelled reporting currency and rate timestamp.

## 6. Entity header

### Required content

- breadcrumb: Campaigns / current campaign;
- campaign name;
- code and season;
- StatusBadge;
- selling date range and timezone;
- owner/team avatars;
- buyer market/currency summary;
- last update;
- one primary action;
- secondary actions: Edit, Share/Invite, More.

### Primary action resolution

```text
Draft + no collection          → Create collection
Draft + incomplete collection  → Continue collection
Draft + ready collection       → Review readiness
Scheduled                      → Open calendar / Preview campaign
Active                         → Invite buyers or Review activity
Closing                        → Review open orders
Completed                      → View results
Archived                       → Restore (when permitted)
```

The screen must not show a generic `Continue` label.

## 7. Tabs

Visible P0 tabs:

1. Overview;
2. Collections;
3. Buyers;
4. Appointments;
5. Orders;
6. Calendar;
7. Activity;
8. More.

`More` contains Documents, Analytics and Settings if they do not fit.

Tabs may route to linked empty states only when the future implementation task is explicit. No fake populated data.

## 8. Desktop layout

```text
EntityHeader
Tabs

Main 8–9 columns
├── Readiness / attention panel
├── Collections section
├── Buyer access funnel
├── Order progress
└── Recent activity

Context rail 3–4 columns
├── Next deadlines
├── Today appointments
├── Assigned tasks
└── Campaign facts
```

The context rail appears only when it has actionable information. It must not repeat header metadata.

## 9. Overview content order

### 9.1 Readiness and attention

Top section.

States:

- Ready;
- In progress;
- Blocked;
- Attention required.

Content:

- completion count;
- up to three highest-priority issues;
- `View all checks`;
- direct fix action for each issue.

Example issues:

- no published collection;
- missing default price list;
- invalid campaign date;
- collection without delivery window;
- invited shop without commercial context;
- campaign active but access not sent.

Blocking and warning issues must look different and contain plain-language fixes.

### 9.2 Collections

Show maximum six collection cards/rows, then `View all`.

Each item:

- cover thumbnail;
- name/code/drop;
- status;
- product count;
- readiness state;
- buyer access count;
- published version;
- primary next action.

Section actions:

- `Create collection`;
- `View all collections`.

### 9.3 Buyer access

Compact funnel:

```text
Invited → Opened → Active → Selection started → Order draft
```

For M1 only first three and selection-started may be populated. Unknown stages must not display synthetic values.

Actions:

- Invite shops;
- Resolve missing access setup;
- View buyers.

### 9.4 Order progress

Cards/rows:

- Draft;
- Submitted;
- Confirmed;
- Submitted value;
- Confirmed value.

When no orders exist, show an explanatory neutral state, not a zero-heavy chart.

### 9.5 Recent activity

Only business-relevant events:

- collection created/published;
- shop invited/opened;
- selection started;
- appointment confirmed;
- order draft/submitted/confirmed;
- campaign status changed.

Technical sync events stay hidden.

## 10. Campaign lifecycle controls

### Draft → Scheduled

Requires:

- valid dates;
- minimum one collection ready for publish or published depending schedule policy;
- default currency;
- owner;
- no unresolved blocking issue.

### Scheduled → Active

Requires:

- current date or explicit early activation permission;
- at least one published collection;
- valid access configuration.

### Active → Closing

Requires explicit confirmation and displays effects on new invitations/orders.

### Closing → Completed

Shows unresolved draft/submitted orders before confirmation.

### Archive

Located in More / danger zone and blocked while active unless policy allows forced close first.

## 11. Campaign facts panel

Read-only concise facts:

- type;
- season;
- markets;
- currencies;
- default price list;
- order deadline;
- delivery windows;
- owner;
- team;
- campaign timezone.

`Edit settings` is one action, not an edit icon on every row.

## 12. Empty states

### Campaign has no collection

Title: `Build the first collection for this campaign`

Primary: `Create collection`

Text explains that the collection contains products, presentation and commercial terms.

### No buyers invited

Title: `No shops have access yet`

Primary: `Invite shops`

Only enabled after a buyer-ready published collection exists; otherwise primary directs to `Prepare collection`.

### No activity

Compact neutral text; no large illustration.

## 13. Loading and refresh

- EntityHeader skeleton uses actual layout;
- main panels load independently when safe;
- campaign identity/status load first;
- mutation refetch does not blank the page;
- stale data warning appears if version changed elsewhere.

## 14. Error and conflict states

### Campaign not found

Dedicated recovery screen with back to Campaign Registry.

### Permission denied

Show campaign identity only if metadata access is permitted; otherwise generic forbidden state.

### Version conflict

When editing lifecycle/settings:

- explain who changed it and when;
- show current server state;
- allow refresh/compare;
- never silently overwrite.

## 15. Permissions

- `campaign.read` — access page;
- `campaign.write` — edit identity/settings;
- `campaign.publish` — lifecycle schedule/activate/close where configured;
- `collection.write` — create/open collection editing;
- `buyer.manage` — invitations;
- `analytics.read` — detailed funnel/value cards.

Actions are omitted when unavailable. Read-only users retain navigation and export where permitted.

## 16. Keyboard behaviour

- tabs keyboard-navigable;
- `G then C` optional later, not P0;
- focus order: header → primary action → tabs → readiness → content → rail;
- Enter opens selected collection/activity item;
- Escape closes drawers/menus;
- no keyboard shortcut may trigger lifecycle transition directly.

## 17. Responsive behaviour

### MacBook / full-screen

- main + context rail;
- maximum content width from visual system;
- six collection cards maximum in overview;
- sticky entity tabs when page scroll is long.

### iPad landscape

- rail may remain 300–320 px if main content stays readable;
- otherwise rail opens as drawer;
- collection cards in two columns;
- lifecycle action uses touch-size control.

### iPad portrait

- single-column main flow;
- facts/deadlines/tasks become collapsible sections;
- tabs horizontally scroll;
- readiness remains first.

### iPhone

Order:

1. compact entity header;
2. readiness;
3. primary action sticky bottom when critical;
4. collections;
5. deadlines;
6. buyer/order summaries;
7. activity.

- no desktop dashboard grid;
- metrics use compact rows or two-column cards;
- More actions in overflow;
- bottom global navigation hidden if sticky critical action occupies the flow and a clear back path exists.

## 18. Analytics events

- `campaign_overview_viewed`;
- `campaign_primary_action_clicked`;
- `campaign_readiness_opened`;
- `campaign_readiness_issue_opened`;
- `campaign_collection_opened`;
- `campaign_collection_create_started`;
- `campaign_buyers_opened`;
- `campaign_invite_started`;
- `campaign_lifecycle_change_started`;
- `campaign_lifecycle_changed`.

## 19. Acceptance criteria

1. Header reflects exact campaign state and permissions.
2. Primary action always maps to a valid next job.
3. Readiness issues deep-link to the screen/field that fixes them.
4. Collections, buyer access and order values match server state.
5. Campaign lifecycle transitions are policy-backed and audited.
6. No overview card duplicates the same information without a different action.
7. Works at required five viewports.
8. iPhone content order prioritises action and readiness.
9. Direct route and browser refresh preserve entity context.
10. Campaign page has no legacy navigation and no production/PLM modules.

## 20. Non-goals

- full campaign analytics;
- full buyer invitation editor on Overview;
- appointment scheduling UI;
- collection product editing inline;
- order review inline;
- production calendar.
