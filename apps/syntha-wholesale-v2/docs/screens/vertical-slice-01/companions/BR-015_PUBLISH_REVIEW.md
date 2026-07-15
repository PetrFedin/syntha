# BR-015 — Collection Publish Review

## 1. Identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/collections/:collectionId/publish`
- **Template:** Entity Review / Focused Confirmation
- **Priority:** P0
- **Capabilities:** CAP-COL-011–015,018; CAP-SHO-008–011
- **Primary action:** `Publish collection` or `Schedule publish`

## 2. User goal

Confirm that the exact buyer-facing release is complete, commercially valid and assigned to the intended audience before creating an immutable published version.

## 3. Preconditions

- draft CollectionVersion exists;
- user has `collection.publish`;
- readiness calculated for current version;
- at least one valid buyer context or explicit publish-without-invite policy;
- Showroom draft exists;
- no unresolved blocking issue.

## 4. Page structure

Desktop:

```text
Back to Collection
Publish Review title + draft version
Readiness summary
Release content summary
Audience and access impact
Commercial context checks
Buyer preview samples
Change/version summary
Notification options
Sticky Publish action panel
```

Main column max 960 px; right action/summary rail 320–380 px.

Mobile:

- sequential review sections;
- blocking issue count persistent;
- sticky primary action;
- buyer preview opens full screen;
- large audience lists open dedicated sheet.

## 5. Review sections

### 5.1 Readiness

- blockers;
- warnings;
- last calculated time;
- draft version/fingerprint;
- deep links to fix.

### 5.2 Release content

- collection identity/cover;
- product/variant count;
- looks/story blocks;
- available modes;
- media completeness;
- languages/markets.

### 5.3 Commercial terms

- campaign/default context;
- price list coverage by Shop;
- currency coverage;
- order deadlines;
- delivery windows;
- MOQ/pack/order minimum;
- payment/tax display.

### 5.4 Audience

- Shops included;
- invitation/access statuses;
- explicit collection grants;
- product visibility rules;
- invalid/empty buyer assortments;
- expired or conflicting grants.

### 5.5 Buyer Preview verification

Show sample contexts:

- default/representative Shop;
- each distinct price-list/currency/visibility combination;
- any context with warning.

User can open exact BR-014 Preview.

### 5.6 Version/change summary

- first release vs update;
- previous live release;
- changed content/terms/assortment;
- material change classification;
- release note required for updates;
- previous release supersede behavior.

### 5.7 Publish timing

- publish now;
- schedule date/time/timezone P1;
- access start/end;
- optional campaign status activation.

### 5.8 Notifications

- notify all affected Shops;
- only new audience;
- only material-change audience;
- no notification with explicit reason/permission;
- invitation template/reminder policy.

## 6. Data contract

```ts
type PublishReviewVM = {
  collection: CollectionSummary;
  draftVersion: CollectionVersionSummary;
  currentLiveRelease?: ShowroomReleaseSummary;
  readiness: ReadinessResult;
  contentSummary: ReleaseContentSummary;
  commercialCoverage: CommercialCoverageSummary;
  audience: AudienceImpactSummary;
  previewContexts: BuyerPreviewContextSummary[];
  changeSummary: ReleaseChangeSummary;
  publishOptions: PublishOptions;
  permissions: PublishPermissions;
};
```

## 7. Commands

```text
RecalculateCollectionReadiness
PublishCollectionRelease
ScheduleCollectionRelease
CloseShowroomRelease
NotifyReleaseAudience
```

Publish command:

```ts
type PublishCollectionCommand = {
  collectionId: string;
  expectedDraftVersion: string;
  readinessFingerprint: string;
  audienceMode: 'existing_grants' | 'selected_grants';
  accessGrantIds: string[];
  effectiveAt?: string;
  accessEndsAt?: string;
  releaseNote?: string;
  acknowledgedWarningCodes: string[];
  notificationPolicy: ReleaseNotificationPolicy;
  idempotencyKey: string;
};
```

## 8. Blocking issues

- stale draft/readiness version;
- no products/visible products;
- missing active price for any included buyer context;
- invalid currency;
- missing mandatory media/specification;
- invalid size/colour matrix;
- invalid delivery window;
- audience grant revoked/expired;
- no order deadline where required;
- inaccessible StoryBlock reference;
- user lacks publish scope;
- current live release conflict.

## 9. Warning acknowledgement

Warnings require explicit checkbox/action and are stored by code, not only UI text.

Examples:

- some Shops have not been invited;
- buyer context has limited assortment;
- video missing captions;
- release changes terms after Shop opened prior release;
- no notification selected;
- campaign start/end mismatch.

## 10. Publish transaction

Atomic outcome:

1. validate expected draft version;
2. validate readiness fingerprint;
3. resolve audience and commercial contexts;
4. create immutable CollectionVersion snapshot;
5. create immutable ShowroomRelease snapshot;
6. update Collection published references/state;
7. supersede prior release when applicable;
8. emit outbox/domain/audit events;
9. enqueue notifications;
10. return release ID/version.

If any transactional step fails, no partial live release exists.

## 11. Success state

Show:

- release number/status;
- live/scheduled timestamp;
- audience count;
- notification status;
- copy/open buyer showroom link only according permission;
- next actions: Invite missing Shops, View analytics, Return to Collection.

## 12. Conflict state

When draft changes during review:

- explain who/when if available;
- disable publish;
- actions: Refresh review, Compare changes, Return to editor;
- preserve entered notification/release-note choices when safe.

## 13. Permissions

- read requires `collection.read`;
- preview requires `collection.preview`;
- publish/schedule/unpublish requires `collection.publish`;
- notification requires `campaign.communicate`;
- audience modification is not performed silently here; deep link to BR-004 unless limited selection is part of publish command.

## 14. Events

```text
collection.published
collection.release_superseded
showroom.release_created
showroom.release_scheduled|live
campaign.audience_notified
```

Audit includes version, audience IDs/count, warning acknowledgements, release note, timing and actor.

## 15. Acceptance criteria

- [ ] Publish is impossible with blockers.
- [ ] Buyer commercial coverage is checked per distinct context.
- [ ] Preview deep links use same resolver as actual Showroom.
- [ ] Stale version/fingerprint blocks publish.
- [ ] Successful publish creates immutable version and release atomically.
- [ ] Previous release remains historically readable.
- [ ] Notifications are deduplicated and based on selected policy.
- [ ] Warning acknowledgements are persisted in audit.
- [ ] Success state exposes release identity and next actions.
- [ ] Mobile review preserves complete decision flow.

## 16. Non-goals

- editing products/presentation inline;
- buyer CRM editing beyond controlled access selection;
- analytics dashboard;
- payment/fulfilment configuration.
