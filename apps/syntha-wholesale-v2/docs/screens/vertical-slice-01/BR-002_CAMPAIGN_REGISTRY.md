# BR-002 — Campaign Registry

## 1. Screen identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/campaigns`
- **Template:** Registry Workspace
- **Priority:** P0
- **Primary job:** find, create and manage sales campaigns without opening multiple tools.
- **Primary action:** `Create campaign`

## 2. User goal

A Brand user must understand within five seconds:

- which campaigns exist;
- which are active or require attention;
- their selling dates and progress;
- who owns each campaign;
- what the next action is.

## 3. Entry points

- Brand sidebar → Campaigns;
- Brand Dashboard → active campaign card;
- global search result;
- notification about campaign deadline;
- duplicated campaign success redirect;
- browser deep link.

## 4. Exit points

- open Campaign Overview;
- create campaign;
- duplicate campaign;
- archive campaign;
- open campaign calendar;
- open linked collection;
- open filters/saved view settings.

## 5. Required data contract

```ts
type CampaignRegistryRow = {
  id: string;
  code: string;
  name: string;
  seasonLabel: string;
  type: 'main' | 'pre' | 'capsule' | 'carry_over' | 'immediate';
  status: 'draft' | 'scheduled' | 'active' | 'closing' | 'completed' | 'archived';
  startsAt: string;
  endsAt: string;
  timeZone: string;
  owner: UserSummary;
  teamCount: number;
  collectionCount: number;
  publishedCollectionCount: number;
  invitedShopCount: number;
  openedShopCount: number;
  draftOrderCount: number;
  submittedOrderCount: number;
  confirmedOrderCount: number;
  submittedOrderValue?: Money;
  confirmedOrderValue?: Money;
  targetAmount?: Money;
  readiness: 'not_started' | 'in_progress' | 'ready' | 'blocked';
  nextDeadline?: {
    label: string;
    at: string;
    severity: 'normal' | 'warning' | 'overdue';
  };
  updatedAt: string;
};
```

Server response must include:

- rows;
- pagination/cursor;
- total result count;
- aggregate status counts;
- applied filter echo;
- permission flags for create, duplicate, archive and export.

## 6. Desktop layout

```text
AppShell
└── WorkspaceHeader
    ├── Title: Sales campaigns
    ├── Supporting summary
    ├── Secondary: Export
    └── Primary: Create campaign

FilterBar
├── Search
├── Status
├── Season
├── Type
├── Owner
├── Selling dates
├── Attention required
├── Saved view
└── Table / cards switch

Optional MetricStrip
├── Active campaigns
├── Closing soon
├── Submitted value
└── Confirmed value

DataTable / CampaignCardGrid
```

### Dimensions

- page padding from visual system;
- header minimum 88 px;
- FilterBar 40 px;
- default table row 52 px because row includes campaign identity and progress;
- sticky table header;
- full available workspace width;
- no narrow centred container.

## 7. Workspace header

### Title

`Sales campaigns`

### Supporting text

Dynamic summary:

`3 active · 1 closing this week · €1.24M submitted`

Do not show zero-value fragments.

### Primary action

`Create campaign`

Opens a focused creation flow with:

1. name and code;
2. season and campaign type;
3. start/end dates and timezone;
4. default currency;
5. owner and team;
6. optional template/duplicate source.

Minimum creation should allow saving a valid Draft after step 2. Commercial defaults can be completed inside Campaign Settings.

## 8. Filters and search

### Search

Searches:

- campaign name;
- code;
- season;
- owner name.

Debounce: 250–350 ms.

### Quick filters

- `Active`;
- `Closing soon`;
- `Drafts`;
- `Requires attention`;
- `My campaigns`.

### Advanced filters

- status multi-select;
- season multi-select;
- campaign type;
- owner/team;
- starts between;
- ends between;
- has published collection;
- has submitted orders;
- blocked readiness;
- archived state.

### Saved views

P1 UI contract may exist in P0, but save/share functionality is enabled only when implemented. No fake save button.

## 9. Canonical table columns

| Column | Required | Behaviour |
|---|---:|---|
| Campaign | yes | name + code + season; sticky identity column |
| Status | yes | canonical StatusBadge |
| Selling dates | yes | localised range + timezone tooltip |
| Progress | yes | collections published / invited / submitted summary |
| Orders | yes | submitted and confirmed count |
| Value | yes | submitted value, confirmed value secondary |
| Owner | yes | avatar + name |
| Next deadline | yes | label + relative date; warning/overdue semantics |
| Updated | optional | relative time + full timestamp tooltip |
| Actions | yes | overflow menu |

### Progress cell

Compact three-stage representation:

```text
Collections 2/3 · Buyers 18/25 · Orders 9
```

It must not become a decorative progress chart.

### Value cell

- tabular numerals;
- currency always visible;
- if target exists, show `confirmed / target` in secondary line;
- mixed currencies cannot be summed without explicit conversion context.

## 10. Card view

Card view is useful for visual campaign covers, not the default for high-volume teams.

Card includes:

- cover media 16:9;
- campaign name/code/season;
- status;
- dates;
- owner;
- published collection count;
- invited shops;
- submitted/confirmed values;
- next deadline;
- one visible action: `Open`;
- overflow for duplicate/archive.

Cards use the canonical operational card. Campaign cover cannot force a custom page palette.

## 11. Row actions

Allowed:

- Open;
- Duplicate;
- Open calendar;
- Export campaign summary;
- Archive.

Conditions:

- active/closing campaign cannot be archived without confirmation and policy validation;
- archived campaign shows Restore when permitted;
- duplicate opens create flow prefilled, never silently creates a copy;
- destructive action always records audit event.

## 12. Empty state

### No campaigns exist

Title: `Create your first sales campaign`

Text: `A campaign brings together collections, buyers, appointments, showroom access and orders for one selling period.`

Primary: `Create campaign`

Secondary supporting link: `Learn what a campaign contains`

### No filter results

Title: `No campaigns match these filters`

Primary: `Clear filters`

Do not offer Create unless search state is genuinely empty and creation is relevant.

## 13. Loading state

- header skeleton remains stable;
- FilterBar interactive only after filter metadata loads;
- table skeleton matches selected density and columns;
- no page-wide spinner;
- preserve previous results during non-destructive refetch with subtle loading indicator.

## 14. Error state

### Registry load failed

- inline page ErrorState;
- `Retry`;
- request/correlation ID in details;
- sidebar and header remain usable.

### Action failed

- preserve selection and filters;
- toast plus contextual row error;
- do not optimistically remove archived row unless rollback is implemented.

## 15. Permissions

- `campaign.read` — view registry;
- `campaign.write` — create/edit/duplicate;
- `campaign.publish` — not used directly here;
- `campaign.archive` — archive/restore;
- `analytics.read` — monetary/target metrics if policy requires.

A user without create permission does not see a disabled primary button. Header uses no primary action and explains role limitations only when relevant.

## 16. Keyboard behaviour

- `/` focuses search;
- arrow keys move focused table row;
- Enter opens focused campaign;
- Space toggles row selection when checkbox focused;
- Escape closes menus/drawers;
- `C` shortcut is not enabled by default to avoid accidental creation;
- all overflow actions are keyboard accessible.

## 17. Responsive behaviour

### MacBook / desktop

- full DataTable default;
- optional card view;
- sidebar persistent;
- metric strip maximum four metrics;
- monetary and deadline columns remain visible at 1280+.

### iPad landscape

- collapsed navigation allowed;
- table hides Updated and Team Count;
- row inspector may open as drawer;
- touch row height 52 px;
- filters in popover/sheet depending available width.

### iPad portrait

- campaign rows become structured list cards;
- search full width;
- filters open sheet;
- summary metrics in two-column grid;
- primary action remains header or floating/sticky contextual action.

### iPhone

- list-card registry only;
- each card shows name, status, dates, owner, next deadline, submitted value;
- search then Filter/Sort row;
- primary action via header plus or sticky create action depending scroll context;
- no horizontal table scroll;
- bottom navigation visible at root level.

## 18. Analytics events

- `campaign_registry_viewed`;
- `campaign_registry_searched`;
- `campaign_registry_filter_applied`;
- `campaign_registry_view_changed`;
- `campaign_create_started`;
- `campaign_created`;
- `campaign_duplicate_started`;
- `campaign_archived`;
- `campaign_opened`.

Events include organisation, role, result count and source, but never buyer-sensitive commercial details unless authorised.

## 19. Acceptance criteria

1. User can create a valid Draft campaign.
2. Search and all P0 filters are server-backed or based on a documented bounded dataset.
3. Status, dates, owner, progress, order counts and values are accurate.
4. Filters, selected view and scroll restore after returning from Campaign Overview.
5. No action navigates to legacy Syntha.
6. Empty/loading/error/no-results/forbidden states exist.
7. Works at 390, 768, 1024, 1440 and 1728 widths.
8. Registry table becomes a purpose-built mobile list.
9. Create, duplicate and archive write paths have integration tests.
10. Route can be opened directly and restores query-state from URL.

## 20. Non-goals

- campaign analytics dashboard detail;
- appointment scheduling;
- buyer invitation editing;
- collection composition;
- payment or invoicing;
- production planning;
- PLM/ERP UI.
