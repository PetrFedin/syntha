# BR-002A — Campaign Create / Edit

## 1. Identity

- **Role:** Brand.
- **Routes:**
  - create: `/wholesale-v2/brand/campaigns/new`;
  - edit: `/wholesale-v2/brand/campaigns/:campaignId/settings`.
- **Template:** Focused Form / Entity Settings.
- **Priority:** P0.
- **Capabilities:** CAP-CAM-002, CAP-CAM-004, CAP-CAM-013, CAP-ORG-009, CAP-ORG-010.
- **Workflows:** WF-001.
- **Primary action:** `Create campaign` or `Save changes`.

## 2. User goal

Create a valid commercial sales campaign with dates, defaults, ownership and access policy that downstream collections, invitations, appointments and orders can inherit safely.

## 3. Entry and exit

Entry:

- Campaign Registry `Create campaign`;
- Campaign Overview `Edit settings`;
- duplicate campaign flow;
- onboarding quick create.

Exit:

- successful create → Campaign Overview;
- successful edit → previous Campaign context;
- cancel → previous route with unsaved-change protection.

## 4. Form sections

### 4.1 Identity

- campaign name;
- unique campaign code inside Brand organisation;
- season label;
- type: `main | pre | capsule | carry_over | immediate`;
- internal description;
- optional cover media.

### 4.2 Selling period

- startsAt;
- endsAt;
- timezone;
- optional showroom opening date;
- default order deadline;
- default reminder offsets.

### 4.3 Commercial defaults

- default currency;
- default price list;
- default delivery windows;
- payment terms display;
- tax display mode;
- default order minimum;
- selling markets.

### 4.4 Ownership

- owner;
- sales team;
- optional territory/market assignment;
- fallback manager for unassigned Shops.

### 4.5 Access defaults

- invitation-only access P0;
- active relationship requirement;
- all collections or explicit collection grants;
- default access duration;
- whether future collections inherit audience;
- whether material changes notify opened buyers.

### 4.6 Targets P1

- sales target;
- target currency;
- market/manager targets.

## 5. Data contract

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

## 6. Queries and commands

Queries:

```text
GetCampaignFormContext
GetSalesCampaign
```

Commands:

```text
CreateSalesCampaign
UpdateSalesCampaign
AssignCampaignTeam
DuplicateSalesCampaign P1
```

Create requires idempotency key. Edit requires expected version.

## 7. Validation

Blocking:

- empty name/code/season;
- duplicate code;
- end date not after start date;
- invalid timezone;
- inactive or currency-incompatible default price list;
- invalid delivery window policy;
- inactive/unauthorised owner;
- manager outside assignment scope;
- deadline outside campaign policy.

Warnings:

- no cover;
- no delivery window;
- no target;
- unusually short/long selling period;
- active campaign change affects grants or open orders.

## 8. Edit restrictions by state

| Field group | Draft | Scheduled | Active | Closing | Completed/Archived |
|---|---:|---:|---:|---:|---:|
| name/description | yes | yes | yes + audit | limited | no |
| code | yes | conditional | no | no | no |
| dates | yes | yes | impact confirmation | limited | no |
| default currency | yes | conditional | no for historical orders | no | no |
| default price list | yes | yes | new grants by default | limited | no |
| team | yes | yes | yes | yes | limited |
| access defaults | yes | yes | future/new grants | limited | no |

Generic Save never performs lifecycle transitions such as activate/complete/archive.

## 9. Layout

Desktop:

```text
Back + title + save state
Left section navigation 220 px
Main form max 760 px
Optional context panel 280–320 px
Sticky footer: Cancel / Primary action
```

Context panel shows inherited defaults, restrictions, impact and validation summary.

Mobile:

- one column;
- section navigation as progress/accordion;
- selectors in full-screen sheets;
- sticky primary action;
- timezone/date summary before save.

## 10. Permissions

- create: `campaign.create`;
- edit: `campaign.update` + entity scope;
- owner/team: `campaign.assign`;
- price default: `pricing.assign` when separated;
- active-state changes require specific lifecycle command/permission.

Server validates all permissions independently of UI.

## 11. Events and audit

```text
campaign.created
campaign.updated
campaign.team_assigned
campaign.commercial_defaults_changed
```

Audit records actor, campaign, version and changed field groups.

## 12. States

- loading;
- create empty;
- edit loaded;
- validation error;
- saving;
- saved;
- conflict/version mismatch;
- forbidden;
- referenced default inactive;
- active-campaign impact confirmation;
- server error with preserved fields.

## 13. Keyboard and accessibility

- logical tab order;
- labels always visible;
- date fields keyboard operable;
- errors linked to fields and summary;
- focus moves to first blocking error on submit;
- Escape does not discard unsaved form without confirmation.

## 14. Analytics

```text
campaign_create_opened
campaign_created
campaign_edit_opened
campaign_changes_saved
campaign_validation_failed
```

Do not send sensitive commercial values to general analytics.

## 15. Acceptance criteria

- [ ] Required campaign can be created and opened.
- [ ] Duplicate code is rejected server-side.
- [ ] Dates, timezone and defaults validate correctly.
- [ ] Owner/team assignment respects scope.
- [ ] Active campaign edits show impact and create audit/events.
- [ ] Expected-version conflict never overwrites newer data.
- [ ] Organisation defaults can be inherited without changing historical snapshots.
- [ ] Cancel protects unsaved changes.
- [ ] Desktop, iPad and iPhone use canonical components/tokens.
- [ ] Generic save does not perform hidden lifecycle transition.

## 16. Non-goals

- buyer invitations;
- detailed collection creation;
- analytics dashboard;
- ERP campaign sync;
- production calendar.
