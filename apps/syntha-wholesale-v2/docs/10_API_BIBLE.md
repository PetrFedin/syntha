# 10 — API Bible

## 1. API principles

- API-first: UI не обращается напрямую к базе данных.
- Версионирование: `/api/v2/...`.
- Tenant isolation обязательна для каждого запроса.
- Все write-операции поддерживают idempotency key.
- Optimistic concurrency используется для Campaign, Collection, Order и DealSpace-sensitive mutations.
- Ошибки имеют стабильный machine code и понятный `message`.
- Все даты передаются в ISO 8601 UTC; пользовательская timezone хранится отдельно.
- Денежные суммы передаются в minor units либо decimal string по единому контракту; формат выбирается до реализации.
- Никаких legacy route redirects внутри V2 API.

## 2. Response envelope

Успех:

```json
{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

Ошибка:

```json
{
  "error": {
    "code": "ORDER_VALIDATION_FAILED",
    "message": "Заказ содержит блокирующие ошибки.",
    "fieldErrors": [],
    "details": {}
  },
  "meta": {
    "requestId": "..."
  }
}
```

## 3. Pagination

- Для реестров используется cursor pagination.
- `limit` по умолчанию 50, максимум 200.
- Ответ содержит `nextCursor` и `hasMore`.
- Offset pagination запрещена для больших реестров заказов, событий и сообщений.

## 4. Filtering and sorting

Пример:

```text
GET /api/v2/brand/orders?status=draft,submitted&buyerId=...&sort=-updatedAt
```

Правила:

- фильтры имеют стабильные имена;
- multi-select передаётся через comma-separated values или повторяющиеся параметры — выбрать один стандарт;
- сортировка: `sort=field` и `sort=-field`;
- текстовый поиск: `q=`;
- saved views хранят нормализованный filter model.

## 5. Authentication and context

Каждый запрос определяется через:

- authenticated user;
- active organization;
- active role (`brand` или `shop`);
- permissions;
- optional campaign/collection/order context.

Запрещено принимать organization ID от клиента без server-side membership validation.

## 6. Core endpoint map

### Authentication / Session

```text
GET    /api/v2/session
POST   /api/v2/auth/sign-in
POST   /api/v2/auth/sign-out
POST   /api/v2/invitations/:token/accept
```

### Organizations and users

```text
GET    /api/v2/organizations/current
PATCH  /api/v2/organizations/current
GET    /api/v2/organizations/current/users
POST   /api/v2/organizations/current/invitations
PATCH  /api/v2/organizations/current/users/:userId
DELETE /api/v2/organizations/current/users/:userId
GET    /api/v2/permissions
```

### Brand campaigns

```text
GET    /api/v2/brand/campaigns
POST   /api/v2/brand/campaigns
GET    /api/v2/brand/campaigns/:campaignId
PATCH  /api/v2/brand/campaigns/:campaignId
POST   /api/v2/brand/campaigns/:campaignId/archive
GET    /api/v2/brand/campaigns/:campaignId/readiness
GET    /api/v2/brand/campaigns/:campaignId/activity
```

### Campaign buyers and invitations

```text
GET    /api/v2/brand/campaigns/:campaignId/buyers
POST   /api/v2/brand/campaigns/:campaignId/buyers/invite
PATCH  /api/v2/brand/campaigns/:campaignId/buyers/:buyerId
DELETE /api/v2/brand/campaigns/:campaignId/buyers/:buyerId
GET    /api/v2/shop/campaign-invitations
POST   /api/v2/shop/campaign-invitations/:invitationId/accept
POST   /api/v2/shop/campaign-invitations/:invitationId/decline
```

### Collections

```text
GET    /api/v2/brand/collections
POST   /api/v2/brand/collections
GET    /api/v2/brand/collections/:collectionId
PATCH  /api/v2/brand/collections/:collectionId
POST   /api/v2/brand/collections/:collectionId/archive
GET    /api/v2/brand/collections/:collectionId/readiness
GET    /api/v2/brand/collections/:collectionId/activity
```

### Collection products

```text
GET    /api/v2/brand/collections/:collectionId/products
POST   /api/v2/brand/collections/:collectionId/products
PATCH  /api/v2/brand/collections/:collectionId/products/:productId
DELETE /api/v2/brand/collections/:collectionId/products/:productId
POST   /api/v2/brand/collections/:collectionId/products/bulk
POST   /api/v2/brand/collections/:collectionId/products/reorder
```

### Looks, chapters and presentation

```text
GET    /api/v2/brand/collections/:collectionId/looks
POST   /api/v2/brand/collections/:collectionId/looks
PATCH  /api/v2/brand/collections/:collectionId/looks/:lookId
DELETE /api/v2/brand/collections/:collectionId/looks/:lookId
GET    /api/v2/brand/collections/:collectionId/chapters
POST   /api/v2/brand/collections/:collectionId/chapters
PATCH  /api/v2/brand/collections/:collectionId/chapters/:chapterId
POST   /api/v2/brand/collections/:collectionId/presentation/reorder
```

### Publish and buyer preview

```text
GET    /api/v2/brand/collections/:collectionId/preview
POST   /api/v2/brand/collections/:collectionId/publish
POST   /api/v2/brand/collections/:collectionId/unpublish
GET    /api/v2/brand/collections/:collectionId/releases
GET    /api/v2/brand/collections/:collectionId/releases/:releaseId
```

Publish command requires:

- idempotency key;
- expected version;
- audience;
- effective dates;
- release note;
- explicit readiness acknowledgement when warnings exist.

### Shop showroom

```text
GET    /api/v2/shop/campaigns
GET    /api/v2/shop/campaigns/:campaignId
GET    /api/v2/shop/collections/:collectionId/showroom
GET    /api/v2/shop/collections/:collectionId/products/:productId
POST   /api/v2/shop/collections/:collectionId/favorites/:productId
DELETE /api/v2/shop/collections/:collectionId/favorites/:productId
POST   /api/v2/shop/collections/:collectionId/selection
GET    /api/v2/shop/collections/:collectionId/selection
```

### Price lists

```text
GET    /api/v2/brand/price-lists
POST   /api/v2/brand/price-lists
GET    /api/v2/brand/price-lists/:priceListId
PATCH  /api/v2/brand/price-lists/:priceListId
POST   /api/v2/brand/price-lists/:priceListId/assign
GET    /api/v2/shop/collections/:collectionId/pricing
```

### Buying workspace

```text
GET    /api/v2/shop/buying-workspaces
POST   /api/v2/shop/buying-workspaces
GET    /api/v2/shop/buying-workspaces/:workspaceId
PATCH  /api/v2/shop/buying-workspaces/:workspaceId
POST   /api/v2/shop/buying-workspaces/:workspaceId/items
PATCH  /api/v2/shop/buying-workspaces/:workspaceId/items/:itemId
DELETE /api/v2/shop/buying-workspaces/:workspaceId/items/:itemId
POST   /api/v2/shop/buying-workspaces/:workspaceId/create-order
```

### Orders

```text
GET    /api/v2/shop/orders
POST   /api/v2/shop/orders
GET    /api/v2/shop/orders/:orderId
PATCH  /api/v2/shop/orders/:orderId
POST   /api/v2/shop/orders/:orderId/validate
POST   /api/v2/shop/orders/:orderId/submit
POST   /api/v2/shop/orders/:orderId/withdraw
GET    /api/v2/brand/orders
GET    /api/v2/brand/orders/:orderId
POST   /api/v2/brand/orders/:orderId/confirm
POST   /api/v2/brand/orders/:orderId/propose-revision
POST   /api/v2/shop/orders/:orderId/accept-revision
POST   /api/v2/shop/orders/:orderId/reject-revision
GET    /api/v2/orders/:orderId/history
```

### Order lines and matrix

```text
GET    /api/v2/orders/:orderId/lines
POST   /api/v2/orders/:orderId/lines
PATCH  /api/v2/orders/:orderId/lines/:lineId
DELETE /api/v2/orders/:orderId/lines/:lineId
POST   /api/v2/orders/:orderId/lines/bulk
POST   /api/v2/orders/:orderId/apply-look
POST   /api/v2/orders/:orderId/split-delivery
POST   /api/v2/orders/:orderId/split-store
```

### DealSpace

```text
GET    /api/v2/dealspaces
GET    /api/v2/dealspaces/:dealSpaceId
GET    /api/v2/dealspaces/:dealSpaceId/activity
GET    /api/v2/dealspaces/:dealSpaceId/messages
POST   /api/v2/dealspaces/:dealSpaceId/messages
PATCH  /api/v2/dealspaces/:dealSpaceId/messages/:messageId
DELETE /api/v2/dealspaces/:dealSpaceId/messages/:messageId
POST   /api/v2/dealspaces/:dealSpaceId/messages/:messageId/task
GET    /api/v2/dealspaces/:dealSpaceId/attachments
POST   /api/v2/dealspaces/:dealSpaceId/attachments
GET    /api/v2/dealspaces/:dealSpaceId/tasks
POST   /api/v2/dealspaces/:dealSpaceId/tasks
PATCH  /api/v2/dealspaces/:dealSpaceId/tasks/:taskId
```

### Calendar and appointments

```text
GET    /api/v2/calendar/events
POST   /api/v2/calendar/events
GET    /api/v2/calendar/events/:eventId
PATCH  /api/v2/calendar/events/:eventId
DELETE /api/v2/calendar/events/:eventId
POST   /api/v2/appointments
GET    /api/v2/appointments/:appointmentId
PATCH  /api/v2/appointments/:appointmentId
POST   /api/v2/appointments/:appointmentId/accept
POST   /api/v2/appointments/:appointmentId/decline
POST   /api/v2/appointments/:appointmentId/reschedule
POST   /api/v2/appointments/:appointmentId/start
POST   /api/v2/appointments/:appointmentId/complete
GET    /api/v2/appointments/:appointmentId/summary
```

### Documents

```text
POST   /api/v2/uploads/presign
POST   /api/v2/documents
GET    /api/v2/documents/:documentId
PATCH  /api/v2/documents/:documentId
DELETE /api/v2/documents/:documentId
GET    /api/v2/entities/:entityType/:entityId/documents
```

### Notifications

```text
GET    /api/v2/notifications
POST   /api/v2/notifications/:notificationId/read
POST   /api/v2/notifications/read-all
GET    /api/v2/notification-preferences
PATCH  /api/v2/notification-preferences
```

### Analytics

```text
POST   /api/v2/analytics/events
GET    /api/v2/brand/analytics/campaigns/:campaignId
GET    /api/v2/brand/analytics/collections/:collectionId
GET    /api/v2/brand/analytics/buyers/:buyerId
GET    /api/v2/shop/analytics/orders
GET    /api/v2/shop/analytics/budgets
```

## 7. Order validation contract

Validation response:

```json
{
  "data": {
    "valid": false,
    "issues": [
      {
        "code": "MOQ_NOT_MET",
        "severity": "blocking",
        "entityType": "orderLine",
        "entityId": "...",
        "message": "Минимальное количество — 12.",
        "resolution": "Увеличьте количество или удалите позицию."
      }
    ],
    "totals": {
      "units": 120,
      "amount": "25000.00",
      "currency": "EUR"
    }
  }
}
```

## 8. Realtime events

Transport can be WebSocket or SSE; event contract is transport-independent.

```text
campaign.updated
collection.updated
collection.published
collection.unpublished
selection.updated
order.updated
order.submitted
order.revision_proposed
order.confirmed
dealspace.message_created
dealspace.task_created
document.uploaded
appointment.created
appointment.updated
notification.created
```

Event envelope:

```json
{
  "id": "evt_...",
  "type": "order.updated",
  "organizationId": "org_...",
  "entityId": "ord_...",
  "occurredAt": "2026-07-15T10:00:00.000Z",
  "version": 7,
  "payload": {}
}
```

## 9. Idempotency

Required for:

- publish collection;
- submit order;
- confirm order;
- propose/accept revision;
- create appointment;
- upload finalization;
- invitations;
- payment-related commands when added later.

Header:

```text
Idempotency-Key: <uuid>
```

## 10. API definition of done

Endpoint is complete only when:

- schema is typed and documented;
- authorization and tenant isolation are tested;
- validation codes are stable;
- idempotency is implemented for commands;
- audit event is emitted where required;
- optimistic concurrency is handled;
- unit/integration tests exist;
- UI handles success, validation, conflict and server failure;
- no legacy endpoint is called from V2 code.
