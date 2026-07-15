# BR-015 — Collection Publish Review

## 1. Identity

- **Role:** Brand.
- **Route:** `/wholesale-v2/brand/collections/:collectionId/publish`.
- **Template:** Entity Review / Focused Confirmation.
- **Priority:** P0.
- **Capabilities:** CAP-COL-011–015, CAP-COL-018, CAP-SHO-008–011.
- **Workflow:** WF-008.
- **Primary action:** `Publish collection` or `Schedule publish`.

## 2. User goal

Confirm that the exact buyer-facing release is complete, commercially valid, correctly personalised and assigned to the intended Shops before creating an immutable published version.

## 3. Preconditions

- draft CollectionVersion exists;
- Showroom draft exists;
- user has `collection.publish`;
- readiness belongs to current version;
- at least one valid buyer context or approved publish-without-invite policy;
- no unresolved blocker.

## 4. Entry and exit

Entry:

- Collection Overview primary CTA;
- Buyer Preview `Continue to Publish Review`;
- Showroom Composer readiness action.

Exit:

- deep link to fix blocker;
- Buyer Preview;
- successful release page/Collection Overview;
- Campaign Buyers to fix audience;
- return to Composer.

## 5. Layout

Desktop:

```text
Back + title + draft version
Readiness summary
Release content summary
Commercial coverage
Audience/access impact
Buyer preview contexts
Version/change summary
Timing and notification options
Right sticky action rail 320–380 px
```

Main content max 960 px.

Mobile:

- sequential review sections;
- persistent blocker count;
- preview opens full screen;
- audience details open sheet;
- sticky publish action only when eligible.

## 6. Review sections

### 6.1 Readiness

- blockers;
- warnings;
- last calculation;
- version/fingerprint;
- issue groups;
- fix deep links.

### 6.2 Release content

- Collection identity/cover;
- product and variant count;
- looks/story blocks;
- presentation modes;
- media completeness;
- languages/markets.

### 6.3 Commercial coverage

- Campaign/Collection defaults;
- price coverage for each distinct buyer context;
- currency coverage;
- order deadlines;
- delivery windows;
- MOQ, packs and order minimum;
- payment/tax display.

### 6.4 Audience and access

- Shops included;
- invitation/grant states;
- visible Collections/products;
- product visibility rules;
- invalid or empty buyer assortments;
- expired/revoked grants;
- access timing.

### 6.5 Buyer Preview contexts

Show representative contexts for each unique combination:

```text
price list
currency
market/language
visibility rule
commercial override
```

Any warning context is listed separately. Preview uses BR-014 and the production resolver.

### 6.6 Version/change summary

- first release or update;
- current live release;
- content/price/terms/assortment differences;
- material-change classification;
- release note;
- supersede behavior.

### 6.7 Timing

- publish now;
- scheduled date/time/timezone P1;
- access start/end;
- optional Campaign activation transition.

### 6.8 Notifications

- all affected Shops;
- only new audience;
- only material-change audience;
- no notification with explicit reason/permission;
- invitation/reminder template.

## 7. Data contract

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

## 8. Queries and commands

Queries:

```text
GetPublishReview
GetCollectionReadiness
GetAudienceImpact
GetReleaseChangeSummary
ResolveBuyerPreviewContext
```

Commands:

```text
RecalculateCollectionReadiness
PublishCollectionRelease
ScheduleCollectionRelease P1
CloseShowroomRelease
NotifyReleaseAudience
```

Publish payload:

```ts
type PublishCollectionCommand = {
  collectionId: string;
  expectedDraftVersion: string;
  readinessFingerprint: string;
  accessGrantIds: string[];
  effectiveAt?: string;
  accessEndsAt?: string;
  releaseNote?: string;
  acknowledgedWarningCodes: string[];
  notificationPolicy: ReleaseNotificationPolicy;
  idempotencyKey: string;
};
```

## 9. Blocking issues

- stale draft/readiness;
- no product or no buyer-visible product;
- missing buyer price;
- invalid currency;
- missing mandatory media/spec;
- invalid size/colour matrix;
- invalid delivery window;
- empty/expired/revoked audience;
- required deadline/terms absent;
- inaccessible StoryBlock reference;
- publisher lacks scope;
- conflicting live release/version.

## 10. Warnings and acknowledgement

Examples:

- some Shops not invited;
- limited assortment;
- missing optional media/captions;
- changed terms after prior open;
- no notification selected;
- Campaign date mismatch.

Warnings that require acknowledgement are identified by stable code and stored in audit.

## 11. Publish transaction

Atomic steps:

1. authorize user/scope;
2. verify expected draft version;
3. verify readiness fingerprint;
4. resolve all audience contexts;
5. create immutable CollectionVersion snapshot;
6. create immutable ShowroomRelease snapshot;
7. update Collection published reference/status;
8. supersede prior release when applicable;
9. create domain/audit/outbox events;
10. enqueue notifications;
11. return release identity.

No partial live release is allowed.

## 12. Success state

Show:

- release number/status;
- live/scheduled time;
- audience count;
- notification status;
- open preview/live link by permission;
- next actions: Invite missing Shops, View Collection, View Campaign, later Analytics.

## 13. Conflict/error states

### Draft changed

- disable publish;
- show changed by/when if known;
- Refresh, Compare or Return to editor;
- preserve notification/release-note choices where safe.

### Audience/pricing became invalid

- list exact Shop contexts;
- deep link to Campaign Buyers;
- no publish.

### Notification failure after commit

Release remains published. Notification status is separately queued/failed with retry; commercial transaction is not falsely rolled back.

## 14. Permissions

- read: `collection.read`;
- preview: `collection.preview`;
- publish/schedule/close: `collection.publish`;
- notifications: `campaign.communicate`;
- audience editing remains in BR-004 unless explicit limited selection is part of publish command.

## 15. Events and audit

```text
collection.published
collection.release_superseded
showroom.release_created
showroom.release_scheduled
showroom.release_live
campaign.audience_notified
```

Audit includes actor, release/version, audience, warnings acknowledged, release note, timing and notification policy.

## 16. Analytics

```text
publish_review_opened
publish_blocker_opened
buyer_preview_context_opened
collection_publish_attempted
collection_published
collection_publish_failed
```

No confidential price rows in general analytics payload.

## 17. States

- loading;
- readiness calculating;
- eligible;
- blockers;
- warnings requiring acknowledgement;
- publishing;
- success;
- stale conflict;
- forbidden;
- audience resolver failure;
- notification pending/partial failure.

## 18. Accessibility

- blockers grouped with headings;
- fix links keyboard-accessible;
- warnings announced;
- confirmation not colour-only;
- focus moves to first unresolved blocker;
- success announcement uses aria-live.

## 19. Acceptance criteria

- [ ] Publish is impossible with blockers.
- [ ] Commercial coverage is evaluated per buyer context.
- [ ] Buyer Preview uses the same resolver as Shop Showroom.
- [ ] Stale version/fingerprint blocks publish.
- [ ] Release and CollectionVersion are created atomically and immutable.
- [ ] Previous release remains historically readable.
- [ ] Warning acknowledgements are persisted.
- [ ] Notifications are deduplicated and follow policy.
- [ ] Success displays release identity and next actions.
- [ ] Mobile review supports the complete decision.

## 20. Non-goals

- editing products/presentation inline;
- general CRM editing;
- analytics dashboard;
- payment/fulfilment;
- production release management.
