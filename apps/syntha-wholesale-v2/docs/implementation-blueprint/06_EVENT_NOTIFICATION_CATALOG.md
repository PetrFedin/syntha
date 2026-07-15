# 06 — Event & Notification Catalog

## 1. Назначение

Syntha использует четыре разных класса событий. Их нельзя смешивать.

```text
Domain Event       бизнес-факт после успешного изменения
Audit Event        неизменяемая запись кто/что/когда изменил
Analytics Event    продуктовая телеметрия и funnel measurement
Realtime Event     минимальный сигнал клиентам для обновления UI
```

Одно действие может породить несколько классов событий, но каждый имеет собственный payload и retention.

---

# 2. Общий envelope

```ts
type EventEnvelope<T> = {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: string;
  actorUserId?: string;
  actorOrganisationId?: string;
  ownerOrganisationId?: string;
  correlationId: string;
  causationId?: string;
  entityType: string;
  entityId: string;
  tenantScope: string;
  payload: T;
};
```

Rules:

- event IDs globally unique;
- consumer idempotency mandatory;
- payload versioned;
- sensitive data minimized;
- realtime event never used as authorization proof;
- notification worker re-checks current audience where required.

---

# 3. Campaign events

| Event | Producer | Main consumers | Notification |
|---|---|---|---|
| `campaign.created` | CreateSalesCampaign | registry projection, audit | no |
| `campaign.updated` | UpdateSalesCampaign | overview/registry | assigned owner optional |
| `campaign.team_assigned` | AssignCampaignTeam | permissions/action queue | assigned user |
| `campaign.status_changed` | lifecycle policy | registry, calendar, analytics | team/audience conditionally |
| `campaign.deadline_changed` | update terms | grants, reminders | affected Shops if invited/opened |
| `campaign.archived` | archive command | registry, access policy | internal team |
| `campaign.target_updated` | target command | analytics projection | no |
| `campaign.access_grant_created` | audience command | buyer projection | no until invitation |
| `campaign.access_grant_updated` | audience command | resolver/cache | affected Shop if material |
| `campaign.access_grant_revoked` | revoke command | access/realtime invalidation | affected Shop |
| `campaign.invitation_sent` | notification campaign | invitation status | email + in-app when user exists |
| `campaign.invitation_opened` | invitation endpoint | analytics/follow-up | Brand sales optional |
| `campaign.invitation_accepted` | accept command | relationship/access | Brand assigned manager |
| `campaign.invitation_declined` | decline command | buyer list | Brand assigned manager |
| `campaign.invitation_expired` | scheduler | access/follow-up | Brand sales optional |

---

# 4. Collection and product events

| Event | Producer | Consumers | Notification |
|---|---|---|---|
| `collection.created` | create command | registry, audit | owner |
| `collection.updated` | update command | overview/readiness | collaborators optional |
| `collection.products_changed` | add/import/bulk | readiness, search, composer | no |
| `collection.looks_changed` | look commands | composer/showroom draft | no |
| `collection.presentation_changed` | composer commands | autosave/readiness | collaborators P1 |
| `collection.readiness_changed` | readiness engine | overview/publish CTA | owner when blockers introduced |
| `collection.preview_failed` | preview resolver | support/telemetry | requesting user inline only |
| `collection.published` | publish command | release/access/analytics | audience according to publish plan |
| `collection.release_superseded` | new publish | session/read model | affected Shops if material |
| `collection.closed` | lifecycle | access/order initiation | audience optional |
| `product.created` | catalogue command | product index | no |
| `product.updated` | catalogue command/sync | collection readiness/cache | affected editors if conflict |
| `product.import_completed` | import job | registry/collection | initiating user |
| `product.import_failed` | import job | import UI/action queue | initiating user |
| `price_list.updated` | pricing command | resolver/readiness | affected Brand team |
| `price_assignment_changed` | audience command | resolver/order validation | affected Shop if already invited |
| `availability.updated` | ERP sync | showroom/order warning | active draft users only if relevant |

---

# 5. Showroom events

| Event | Producer | Consumers | Notification |
|---|---|---|---|
| `showroom.draft_created` | collection creation | composer | no |
| `showroom.release_created` | publish | access/read model | internal/audience |
| `showroom.release_scheduled` | publish scheduler | calendar | Brand team |
| `showroom.release_live` | scheduler/manual | Shop campaign list | invited Shops |
| `showroom.release_closed` | close/unpublish | session access | active Shop users |
| `showroom.session_started` | Shop open | analytics, recent activity | Brand only aggregated/action policy |
| `showroom.session_resumed` | Shop open | analytics | no |
| `showroom.mode_changed` | client telemetry | analytics | no |
| `showroom.product_viewed` | interaction service | analytics | no immediate notification |
| `showroom.product_favourited` | interaction service | selection/analytics | no by default |
| `showroom.product_shortlisted` | interaction service | selection/analytics | Brand signal only if policy |
| `showroom.product_added_to_selection` | selection command | tray/workspace/analytics | no |
| `showroom.shared_comment_added` | DealSpace | conversation | mentioned/participants |
| `showroom.access_revoked` | grant revoke | realtime disconnect | affected Shop immediately |

Analytics events may be sampled/aggregated; business selection mutations are not telemetry-only.

---

# 6. Selection and buying events

| Event | Producer | Consumers | Notification |
|---|---|---|---|
| `selection.created` | add first item/create command | workspace/funnel | no |
| `selection.item_added` | selection command | tray/workspace | collaborators P1 |
| `selection.item_removed` | selection command | workspace | collaborators P1 |
| `selection.decision_changed` | buying command | workspace/analytics | assigned teammate optional |
| `selection.comment_added` | internal comment | conversation/activity | mentioned Shop users |
| `selection.approval_requested` | approval command | approval queue | approver |
| `selection.approved` | approval command | CTA/order conversion | owner/buying team |
| `selection.converted_to_order` | create order | lineage/analytics | buying team optional |
| `budget.updated` | budget command | buying projection | assigned team optional |
| `budget.threshold_exceeded` | calculation | action queue | buyer/director |

---

# 7. Order events

| Event | Producer | Consumers | Notification |
|---|---|---|---|
| `order.created` | CreateOrder | registry, DealSpace, analytics | owner |
| `order.version_created` | draft/revision | builder/history | collaborators |
| `order.line_added` | builder command | totals/validation | realtime collaborators |
| `order.line_updated` | builder command | totals/validation | realtime collaborators |
| `order.line_removed` | builder command | totals/validation | realtime collaborators |
| `order.autosave_failed` | application adapter | UI/support telemetry | current user inline |
| `order.version_conflict_detected` | concurrency policy | builder | current user/collaborators |
| `order.validation_completed` | validation service | review UI | no external |
| `order.internal_approval_requested` | approval command | approval queue | assigned approver |
| `order.internal_approved` | approval command | review CTA | owner/buying team |
| `order.submitted` | submit command | Brand inbox, analytics, audit | Brand assigned users + Shop owner |
| `order.withdrawn` | withdraw command | Brand inbox/history | Brand reviewers |
| `order.brand_review_started` | review command | status/history | Shop owner optional |
| `order.revision_proposed` | Brand revision | comparison/history | Shop owner/approvers |
| `order.revision_accepted` | Shop decision | version/history | Brand reviewer |
| `order.revision_rejected` | Shop decision | history/DealSpace | Brand reviewer |
| `order.resubmitted` | submit command | Brand inbox | Brand assigned users |
| `order.confirmed` | confirm command | history, ERP export, analytics | both parties |
| `order.cancelled` | cancel policy | history/integration | both parties |
| `order.export_requested` | export command | export worker | requester when ready |
| `order.erp_export_failed` | integration | action queue | Integration Admin + owner |

---

# 8. DealSpace events

| Event | Producer | Consumers | Notification |
|---|---|---|---|
| `dealspace.created` | relationship/order command | list projection | participants optional |
| `dealspace.participant_added` | manage command | access/realtime | added participant |
| `dealspace.participant_removed` | manage command | access/realtime revoke | removed participant |
| `message.sent` | message command | thread/read state | mentioned users + thread subscribers |
| `message.edited` | edit command | thread/audit | no push by default |
| `message.deleted` | delete command | tombstone | no push by default |
| `message.read` | read command | unread projection | realtime only |
| `attachment.added` | document link | thread | participants/mentions |
| `task.created` | task command | task queue | assignee |
| `task.updated` | task command | task queue | assignee/creator conditionally |
| `task.completed` | task command | activity | creator/participants optional |
| `thread.resolved` | thread command | list/activity | participants optional |

---

# 9. Calendar and appointment events

| Event | Producer | Consumers | Notification |
|---|---|---|---|
| `calendar.event_created` | event command | calendar projection | participants if shared |
| `calendar.event_updated` | update command | projection | affected participants |
| `calendar.event_cancelled` | cancel command | projection | participants |
| `appointment.proposed` | create command | calendars | invited participants |
| `appointment.accepted` | response | calendars | host/participants |
| `appointment.declined` | response | calendars | host |
| `appointment.reschedule_requested` | proposal | calendars | participants |
| `appointment.rescheduled` | accept proposal | calendars | participants |
| `appointment.reminder_due` | scheduler | notification service | participants according preferences |
| `appointment.started` | host | live room/status | participants |
| `appointment.completed` | host | summary/tasks | participants |
| `appointment.summary_created` | summary command | DealSpace/activity | participants |

---

# 10. Integration events

| Event | Producer | Consumers | Notification |
|---|---|---|---|
| `integration.connected` | setup | registry/audit | Integration Admin |
| `integration.disconnected` | revoke | registry/audit | Integration Admin |
| `sync.started` | scheduler/manual | run projection | no |
| `sync.progressed` | sync worker | realtime run UI | no external |
| `sync.completed` | sync worker | projections | initiating/admin optional |
| `sync.completed_with_errors` | sync worker | action queue | Integration Admin |
| `sync.failed` | sync worker | retry/alert | Integration Admin |
| `webhook.delivery_failed` | webhook worker | retry/dead-letter | Integration Admin after threshold |
| `mapping.requires_attention` | normalizer | action queue | Integration Admin |

---

# 11. Notification model

```ts
type Notification = {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  body: string;
  entityRef?: { type: string; id: string };
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: ('in_app' | 'email' | 'push')[];
  dedupeKey?: string;
  readAt?: string;
  deliveredAt?: Record<string, string>;
  expiresAt?: string;
};
```

## Channel rules

### In-app P0

- mentions;
- assignments;
- invitation/status changes;
- order action required;
- appointment changes;
- sync failures for admins;
- access revoked.

### Email P0

- invitation;
- order submitted/revision/confirmed;
- appointment proposal/reschedule/cancel;
- password/security flows;
- major release/deadline changes according preferences.

### Push P1

- urgent action required;
- imminent appointment;
- mention/message where enabled.

---

# 12. Notification deduplication

Examples:

```text
mention:{messageId}:{userId}
order-submitted:{orderId}:{versionId}:{userId}
appointment-update:{appointmentId}:{proposalVersion}:{userId}
sync-failure:{connectionId}:{runId}:{userId}
```

Retrying event consumption must not create duplicate notifications.

---

# 13. Preference hierarchy

```text
mandatory security/business-critical policy
→ organisation policy
→ user channel preference
→ per-entity mute/subscription
→ quiet hours/timezone
```

Users cannot disable legally/security-required messages.

---

# 14. Analytics taxonomy

## Naming

```text
object_action_past_tense
```

Examples:

```text
campaign_created
showroom_opened
showroom_mode_changed
product_viewed
product_shortlisted
selection_created
order_draft_created
order_submitted
order_confirmed
```

## Required properties

```text
event_id
occurred_at
user_id pseudonymous where required
organisation_id
role
campaign_id?
collection_id?
showroom_release_id?
shop_organisation_id?
product_id?
selection_id?
order_id?
device_class
source
```

No message body, private note or raw sensitive price list is sent to general analytics.

---

# 15. Audit catalog

Always audit:

- authentication/security changes;
- membership/role changes;
- invitation/access grant changes;
- price list assignment;
- publish/unpublish;
- submitted/confirmed order lifecycle;
- revision decisions;
- sensitive exports;
- document sharing/deletion;
- appointment reschedule/cancel;
- integration credential changes.

Audit payload may include before/after metadata diff but must not log secrets or full sensitive documents.

---

# 16. Realtime subscription topics

```text
organisation:{organisationId}
campaign:{campaignId}
collection:{collectionId}
showroom-session:{sessionId}
selection:{selectionId}
order:{orderId}
dealspace:{dealSpaceId}
appointment:{appointmentId}
integration-run:{runId}
user:{userId}
```

Every subscribe and every delivered event requires authorization. Topic name is not a capability token.

---

# 17. Cursor requirements

For every write command task specify:

1. domain event(s);
2. audit event requirement;
3. realtime signal;
4. notification recipients/channels;
5. analytics event if user behaviour is measured;
6. idempotency and dedupe keys;
7. sensitive payload redaction;
8. consumer tests.

A successful mutation without required event propagation is incomplete.
