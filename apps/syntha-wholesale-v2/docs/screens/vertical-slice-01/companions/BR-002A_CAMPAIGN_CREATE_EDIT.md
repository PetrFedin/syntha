# BR-002A — Campaign Create / Edit

## 1. Identity

- **Role:** Brand
- **Routes:**
  - create: `/wholesale-v2/brand/campaigns/new`
  - edit: `/wholesale-v2/brand/campaigns/:campaignId/settings`
- **Template:** Focused Form / Entity Settings
- **Priority:** P0
- **Capabilities:** CAP-CAM-002,004,013; CAP-ORG-009,010
- **Primary action:** `Create campaign` or `Save changes`

## 2. User goal

Create a valid commercial sales campaign with dates, defaults, ownership and access policy that all downstream collections, invitations, appointments and orders can inherit safely.

## 3. Entry points

- Campaign Registry `Create campaign`;
- Campaign Overview `Edit settings`;
- duplicate campaign flow with prefilled values;
- onboarding quick create.

## 4. Exit points

- successful create → Campaign Overview;
- successful edit → previous Campaign tab/settings;
- cancel → previous route with unsaved-change guard.

## 5. Form sections

### 5.1 Identity

- campaign name;
- campaign code;
- season label;
- campaign type: main, pre, capsule, carry-over, immediate;
- short internal description;
- cover media optional.

### 5.2 Selling period

- startsAt;
- endsAt;
- timezone;
- optional showroom opening date;
- default order deadline;
- closing reminder offsets.

### 5.3 Commercial defaults

- default currency;
- default price list;
- default delivery windows;
- payment terms display;
- tax mode display;
- default order minimum;
- default market codes.

### 5.4 Ownership

- campaign owner;
- sales team;
- optional territory/market assignment;
- fallback manager for unassigned Shops.

### 5.5 Access model

- invitation only P0;
- active relationship required;
- all collections or explicit collection grants;
- default access duration;
- whether new collections inherit audience automatically;
- whether material changes notify opened buyers.

### 5.6 Targets P1

- total sales target;
- currency;
- market/manager targets.

## 6. Data contract

```ts
type CampaignFormVM = {
  mode: 'create' | 'edit' | 'duplicate';
  campaign?: CampaignEditableSnapshot;
  defaults: OrganisationCommercialDefaults;
  priceLists: PriceListOption[];
  deliveryWindows: DeliveryWindowOption[];
  users: AssignableUser[];
  teams: TeamOption[];
  markets: MarketOption[];
  permissions: {
    create: boolean;
    update: boolean;
    assign: boolean;
    managePricing: boolean;
  };
  version?: string;
};
```

## 7. Commands

```text
CreateSalesCampaign
UpdateSalesCampaign
AssignCampaignTeam
DuplicateSalesCampaign P1
```

Create command includes client idempotency key.

Edit command includes expected version.

## 8. Validation

Blocking:

- empty name/code/season;
- duplicate code in Brand organisation;
- end <= start;
- invalid timezone;
- default price list not active or currency mismatch;
- delivery window outside acceptable campaign policy where configured;
- owner not active Brand member;
- user lacks permission for selected team/market;
- deadline after campaign end unless explicit immediate/reorder policy.

Warnings:

- no cover;
- no target;
- no delivery window;
- very short/long selling period;
- changing dates/defaults on active campaign affects buyers.

## 9. Edit restrictions by state

| Field group | Draft | Scheduled | Active | Closing | Completed/Archived |
|---|---:|---:|---:|---:|---:|
| name/description | yes | yes | yes + audit | limited | no |
| code | yes | conditional | no | no | no |
| dates | yes | yes | yes + impact confirm | limited | no |
| currency | yes | conditional | no for existing orders | no | no |
| price list default | yes | yes | affects new grants only unless explicit | limited | no |
| team | yes | yes | yes | yes | limited |
| access defaults | yes | yes | yes for future/new grants | limited | no |

## 10. Layout

Desktop:

```text
Back + title + save state
Left section navigation 220 px
Main form max 760 px
Right context panel 280–320 px optional
Sticky footer: Cancel / Primary action
```

Context panel shows:

- inherited organisation defaults;
- state restrictions;
- affected active grants/orders on edit;
- validation summary.

Mobile:

- single column;
- section accordion or progress navigation;
- sticky bottom primary action;
- selectors use full-screen sheets;
- date/timezone review before save.

## 11. Permissions

- create requires `campaign.create`;
- edit requires `campaign.update` and scope;
- owner/team changes require `campaign.assign`;
- price defaults require `pricing.assign` when restricted;
- active-state lifecycle changes are not performed by generic Save.

## 12. Events

```text
campaign.created
campaign.updated
campaign.team_assigned
campaign.commercial_defaults_changed
```

Audit stores changed field groups, not secrets/full media.

## 13. States

- initial loading;
- create empty form;
- edit loaded;
- validation errors;
- saving;
- saved;
- conflict with newer version;
- forbidden;
- referenced default removed/inactive;
- active campaign impact confirmation.

## 14. Acceptance criteria

- [ ] Campaign can be created with required values.
- [ ] Duplicate code is rejected server-side.
- [ ] Owner/team assignment respects scope.
- [ ] Defaults are inherited by new Collection/Access flows, not copied blindly into historical snapshots.
- [ ] Active campaign edits show affected context and create audit/events.
- [ ] Version conflict never overwrites newer changes.
- [ ] Mobile and desktop use canonical forms/tokens.
- [ ] Cancel protects unsaved changes.
- [ ] No lifecycle action is hidden inside generic save.

## 15. Non-goals

- buyer invitations;
- collection creation inside the form beyond optional post-create CTA;
- order target analytics implementation;
- ERP campaign sync.
