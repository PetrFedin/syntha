# 09 — Cursor Implementation Contract

## 1. Purpose

This document defines how Cursor converts the Product Bible and Implementation Blueprint into code.

Cursor does not design product scope while implementing. It executes an approved capability through a traceable chain:

```text
Capability
→ Workflow
→ Screen
→ Domain entity/state
→ Permission
→ Query/Command
→ Event/Notification
→ Integration effect
→ Tests
```

---

# 2. Mandatory task inputs

Every implementation task must declare:

```yaml
task_id: TASK-...
capability_ids: [CAP-...]
workflow_ids: [WF-...]
screen_ids: [BR-..., SH-..., SY-...]
priority: P0|P1|P2
role: Brand|Shop|Shared|System
routes: []
entities: []
permissions: []
queries: []
commands: []
domain_events: []
notifications: []
integrations: []
source_documents: []
dependencies: []
```

Missing required mapping means task status must be `BLOCKED`.

---

# 3. Required reading order

Before code change:

1. `README.md`.
2. `CURSOR_MASTER_RULES.md`.
3. `docs/00_PRODUCT_CANON.md`.
4. `docs/03_DOMAIN_MODEL.md`.
5. `docs/11_SECURITY_AND_DATA.md`.
6. `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md`.
7. `design-system/tokens.json`.
8. `design-system/responsive-contract.json`.
9. relevant `docs/screens/**`.
10. `docs/implementation-blueprint/01_MASTER_CAPABILITY_MAP.md`.
11. relevant role, entity, workflow, API, event and integration sections.
12. the task file.

Cursor reports contradictions before editing code.

---

# 4. Task decomposition rules

A task must produce a vertical business outcome, but remain reviewable.

Good examples:

```text
Campaign domain + create command + repository port
Campaign registry read model + route + table states
Campaign archive command + permission + audit + UI action
Showroom block reorder command + autosave + conflict UI
Order size quantity command + totals delta + matrix component tests
```

Bad examples:

```text
Build Campaigns
Build entire platform
Create all API endpoints
Make UI better
Add competitor features
```

One task must not introduce unrelated domains.

---

# 5. Implementation sequence

## Layer 1 — Contract

- types/value objects;
- domain invariants/state policy;
- application ports;
- command/query contracts;
- permission policy;
- event schemas.

## Layer 2 — Infrastructure

- repository/adapter;
- transaction/idempotency;
- integration boundary;
- event publication;
- observability.

## Layer 3 — API

- route/controller;
- authentication/context;
- validation;
- authorization;
- response mapping;
- error codes.

## Layer 4 — UI read path

- route composition;
- query hook/client;
- canonical layout/components;
- loading/empty/error/forbidden states;
- responsive adaptation.

## Layer 5 — UI write path

- command invocation;
- optimistic behavior only if rollback exists;
- save state;
- validation/conflict/success;
- event-driven cache update.

## Layer 6 — Tests and documentation

- unit;
- policy/authorization;
- integration;
- component;
- e2e;
- responsive/accessibility;
- task completion report.

---

# 6. Domain implementation rules

Cursor must:

- use value objects for Money, Currency, DateRange, VersionToken, VisibilityScope;
- centralize state transitions in policy/domain methods;
- keep totals calculated, not manually supplied as authoritative values;
- create immutable snapshots for publish/submit/confirm;
- preserve source lineage IDs;
- distinguish aggregate/entity/value object/snapshot/read model;
- avoid business strings embedded directly in JSX;
- never allow infrastructure type in domain.

Forbidden:

- generic `status: string` when enum/state policy exists;
- updating published release or submitted version in place;
- using style code as database relationship instead of IDs;
- calculating final buyer prices only in client;
- trusting client organisation/role.

---

# 7. API implementation rules

Every write endpoint requires:

- authenticated active organisation;
- permission and scope check;
- input schema;
- idempotency key when retryable;
- expected version when concurrent;
- stable error code;
- domain event;
- audit event when required;
- request/correlation ID;
- negative authorization tests.

Response does not expose:

- internal notes to counterparty;
- another buyer’s prices;
- secrets;
- raw integration credentials;
- hidden products;
- private messages.

---

# 8. UI implementation rules

## Canonical layouts only

```text
Registry
Entity
Builder
Showroom
Split Communication
Focus
```

## Canonical components only

Cursor searches `docs/09_COMPONENT_LIBRARY.md` and existing code before creating a component.

## Action hierarchy

- one primary action per screen/focus region;
- secondary actions maximum according visual system;
- destructive actions separated and confirmed;
- action label describes result.

## State completeness

Every screen/feature includes:

```text
loading
empty
no results
error
forbidden
disabled
saving
success
conflict/version mismatch
```

where applicable.

## Responsive

Mandatory viewports:

```text
390 × 844
768 × 1024
1024 × 768
1440 × 900
1728 × 1117
```

Mobile is transformed workflow, not compressed desktop.

---

# 9. Permission implementation rules

For every action Cursor documents:

```text
permission
scope
entity state
relationship requirement
field redaction
audit requirement
```

Both UI and server behavior required:

- UI hides or disables appropriately;
- server denies independently;
- error code maps to Forbidden state;
- negative test proves denial.

---

# 10. Event and notification rules

Every successful command task lists:

- domain event;
- realtime event;
- audit event;
- analytics event if behavior measured;
- notifications and recipients;
- dedupe key.

Do not send notification directly from component/controller. Publish event and use notification application service/consumer.

---

# 11. Data fetching and cache rules

- server is source of truth;
- cache keys include organisation and entity context;
- access revoke invalidates sensitive cache immediately;
- command result returns enough version/totals delta for focused update;
- route navigation preserves supported filters/context;
- no full-page reload after normal mutation;
- no hidden fallback to fixture data in production path.

---

# 12. Autosave and concurrency contract

For Showroom Composer and Order Builder:

```text
local command
→ optimistic local projection
→ queued command with clientCommandId
→ server validates expectedVersion
→ applied/rejected response
→ newVersion
→ event broadcast
```

UI states:

```text
Saved
Saving
Offline/Queued P1
Failed — Retry
Conflict — Compare/Refresh/Reapply
```

Never display `Saved` before server acknowledgment unless explicitly marked local-only.

---

# 13. Integration implementation rules

- use port/adapter;
- define source of truth;
- external IDs mapped, never internal primary IDs;
- sync runs observable;
- retries bounded;
- partial errors reported;
- historical snapshots protected;
- secrets externalized;
- UI cannot call vendor API directly.

---

# 14. Test matrix per task

## Unit

- state transitions;
- value objects/calculations;
- permission scope;
- resolver/mapping;
- validation.

## Integration

- repository transaction;
- API auth/authorization;
- idempotency;
- events/outbox;
- tenant isolation;
- error response.

## Component

- all states;
- keyboard/focus;
- touch target;
- action availability;
- responsive transformation.

## E2E

At least one business path and one denial/error path.

Example:

```text
Given Brand Sales Manager assigned to Campaign
When they publish a ready Collection with expected version
Then immutable release is created and invited Shop can resolve correct prices

Given unassigned Sales Manager
When they request same publish command
Then server returns FORBIDDEN and no release/event is created
```

---

# 15. Performance budgets

P0 goals measured with realistic fixtures:

- registries paginate/virtualize where needed;
- Showroom media lazy/responsive;
- filter interaction does not block main thread;
- Order Builder quantity typing has no perceptible lag;
- totals delta updates immediately;
- autosave does not block editing;
- large matrix uses virtualization/memoized cells;
- realtime updates do not refetch unrelated app data.

Exact numeric budgets to be recorded in performance ADR before implementation milestone sign-off.

---

# 16. Accessibility contract

- WCAG 2.2 AA target;
- semantic headings/landmarks;
- labels and descriptions;
- visible focus;
- keyboard path for tables/builders;
- accessible drag/reorder alternative;
- no colour-only status;
- media alt/captions policy;
- reduced motion;
- 44×44 touch targets;
- validation announced and navigable.

---

# 17. Completion report format

```markdown
## Completion Report

Task: TASK-...
Capabilities: ...
Workflows: ...
Screens: ...

### Files changed
- ...

### Commands/events added
- ...

### Permissions/security
- ...

### Tests run
- command — result

### Responsive/accessibility
- viewports checked
- screenshots/notes

### Acceptance criteria
- [x] ...

### Known limitations
- ...

### Documentation updates
- ...
```

---

# 18. Stop conditions

Cursor must stop and report before coding when:

- capability not defined;
- screen specification missing;
- role/permission ambiguous;
- entity ownership unclear;
- state transition conflicts;
- API and Screen Bible disagree;
- visual token conflict;
- competitor feature would expand scope beyond Product Canon;
- integration source of truth unclear;
- data migration/destructive effect not approved.

---

# 19. Definition of Done

A task is `DONE` only when:

1. business outcome works end-to-end;
2. no fake CTA/dead end;
3. domain policy implemented;
4. API read/write path real;
5. permissions server-tested;
6. events/audit/notifications implemented;
7. all UI states implemented;
8. responsive/accessibility reviewed;
9. tests pass;
10. docs/task status updated;
11. no legacy UI import;
12. no unapproved scope expansion.
