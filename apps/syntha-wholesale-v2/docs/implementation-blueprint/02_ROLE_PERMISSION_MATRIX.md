# 02 — Role & Permission Matrix

## 1. Цель

Этот документ определяет, кто и при каких условиях может читать, создавать, изменять, публиковать, подтверждать, экспортировать и администрировать данные Syntha Wholesale V2.

UI скрывает недоступные действия, но окончательное решение всегда принимает server-side authorization policy.

Авторизация рассчитывается как:

```text
Authenticated User
+ Active Organisation Membership
+ Organisation Type
+ Role Preset / Custom Permission Set
+ Assignment Scope
+ Entity Relationship
+ Entity State
+ Data Visibility
= Effective Permission
```

---

# 2. Организационные роли

## 2.1 Brand roles

### `brand_admin`

Полный доступ в пределах Brand-организации, включая пользователей, интеграции и настройки. Не обходит tenant isolation и не получает доступ к данным другого Brand.

### `head_of_sales`

Управляет всеми кампаниями, buyers, appointments, orders, DealSpace и аналитикой. Может назначать sales managers. Не управляет security credentials, billing или системными интеграциями без дополнительного permission.

### `sales_manager`

Работает с назначенными кампаниями, buyers, appointments, orders и DealSpace. По умолчанию не видит внутренние стратегии чужих sales teams, если scope ограничен `assigned`.

### `showroom_manager`

Управляет коллекциями, презентациями, media, preview и showroom readiness. Не подтверждает коммерческие заказы и не назначает price lists без дополнительного permission.

### `brand_finance_reviewer`

Читает заказы, суммы, payment terms и exports. Может подтверждать финансовый approval, но не редактирует коллекцию и buyer-facing presentation.

### `brand_viewer`

Read-only доступ к разрешённым campaigns, collections, orders и analytics. Не видит restricted integration/security data.

## 2.2 Shop roles

### `shop_admin`

Полный доступ в Shop-организации, включая пользователей, настройки и связи с брендами.

### `buying_director`

Управляет buying workspaces, budgets, approvals, orders и analytics по всем назначенным брендам/рынкам.

### `buyer`

Просматривает доступные showrooms, формирует selections и draft orders, общается с Brand. Submit доступ определяется организационной политикой.

### `merchandiser`

Работает с selection, assortment, internal notes, comparisons, store allocation и budget analysis. По умолчанию не submit order.

### `shop_finance_approver`

Читает order totals, terms и exports; выполняет financial approval. Не меняет product selection и quantity matrix по умолчанию.

### `shop_viewer`

Read-only доступ к разрешённым brands, campaigns, showrooms, orders и documents.

---

# 3. Assignment scopes

Каждый permission может иметь scope:

```text
all              все сущности организации
team             сущности назначенной команды
assigned         только явно назначенные сущности
created          созданные пользователем сущности
participant      сущности, где пользователь участник
relationship     сущности активной Brand↔Shop связи
self             собственный профиль/настройки
none             доступ отсутствует
```

Пример:

```text
sales_manager
campaign.read: assigned
buyer.read: assigned
order.review: assigned
analytics.read: team
```

`all` не означает доступ к другим tenants.

---

# 4. Permission namespace

## 4.1 Platform and organisation

```text
session.read
organisation.read
organisation.update
organisation.switch
team.read
team.manage
role.read
role.assign
role.manage
settings.read
settings.manage
integration.read
integration.manage
audit.read
```

## 4.2 Relationship and buyers

```text
relationship.read
relationship.request
relationship.accept
relationship.manage
buyer.read
buyer.manage
buyer.assign
buyer.internal_note
contact.read
contact.manage
```

## 4.3 Campaign

```text
campaign.read
campaign.create
campaign.update
campaign.assign
campaign.lifecycle
campaign.archive
campaign.communicate
campaign.analytics
campaign.export
```

## 4.4 Product, pricing and collection

```text
product.read
product.create
product.update
product.bulk_update
product.import
product.archive
product.internal_note
media.read
media.manage
pricing.read
pricing.manage
pricing.assign
terms.read
terms.manage
collection.read
collection.create
collection.update
collection.readiness
collection.preview
collection.publish
collection.lifecycle
collection.export
showroom.read
showroom.update
showroom.preview
```

## 4.5 Buying and order

```text
selection.read
selection.create
selection.update
selection.comment
selection.approve
budget.read
budget.manage
buying.read
order.read
order.create
order.update
order.approve
order.submit
order.withdraw
order.review
order.revise
order.revision.resolve
order.confirm
order.cancel
order.export
payment.read
payment.manage
```

## 4.6 Collaboration and calendar

```text
dealspace.read
dealspace.message
dealspace.manage
internal.message
task.read
task.create
task.manage
document.read
document.upload
document.manage
calendar.read
calendar.manage
appointment.create
appointment.read
appointment.manage
appointment.respond
appointment.use
appointment.complete
notification.read
notification.manage
analytics.read
analytics.export
```

---

# 5. Brand role matrix

Legend: `A` all, `S` assigned/team scope, `R` read only, `—` denied, `C` conditional by state/policy.

| Capability group | brand_admin | head_of_sales | sales_manager | showroom_manager | finance_reviewer | brand_viewer |
|---|---:|---:|---:|---:|---:|---:|
| Organisation settings | A | R | R | R | R | R |
| Team management | A | C | — | — | — | — |
| Integration management | A | — | — | — | R | — |
| Buyer relationships | A | A | S | R/S | R | R/S |
| Buyer internal notes | A | A | S | S | — | — |
| Campaign read | A | A | S | S | R | R/S |
| Campaign create/update | A | A | S | S/C | — | — |
| Campaign lifecycle | A | A | S/C | — | — | — |
| Campaign audience/invitations | A | A | S | R/S | — | — |
| Product catalogue | A | R/A | R | A/S | R | R |
| Product import/bulk edit | A | C | — | A/S | — | — |
| Pricing manage/assign | A | A | S/C | R | R | — |
| Collection create/update | A | A | S/C | A/S | R | R |
| Collection preview | A | A | S | A/S | R | R |
| Collection publish | A | A | C | C | — | — |
| Showroom composer | A | R/A | S/C | A/S | — | R |
| Orders read | A | A | S | R | A/R | R/S |
| Order review/revision | A | A | S | — | C | — |
| Order confirm | A | A/C | C | — | C | — |
| DealSpace shared message | A | A | S | S | R/C | R/C |
| Internal Brand thread | A | A | S | S | R/C | R/C |
| Calendar/appointments | A | A | S | S | R | R/S |
| Documents | A | A | S | S | R | R |
| Analytics | A | A | S/team | R/S | R | R/S |
| Audit log | A | A/R | — | — | R/C | — |
| Sensitive export | A | C | C | — | A/C | — |

### Publish condition

`collection.publish` разрешён только если:

- пользователь имеет permission;
- collection находится в `draft | incomplete | ready`;
- blocking readiness issues отсутствуют;
- price and audience resolver валиден;
- expected version совпадает;
- пользователь явно подтверждает warnings.

### Order confirmation condition

`order.confirm` разрешён только если:

- order status `submitted | resubmitted | brand_review`;
- current version immutable candidate;
- blocking validation отсутствует;
- commercial terms snapshot существует;
- approval policy выполнена;
- пользователь имеет scope к buyer/order.

---

# 6. Shop role matrix

| Capability group | shop_admin | buying_director | buyer | merchandiser | finance_approver | shop_viewer |
|---|---:|---:|---:|---:|---:|---:|
| Organisation settings | A | R/C | R | R | R | R |
| Team management | A | C | — | — | — | — |
| Brand relationships | A | A | S/C | R/S | R | R |
| Brand access request | A | A | S | — | — | — |
| Showroom read | A | A | S | S | R | R/S |
| Private Shop notes | A | A | S | S | — | — |
| Shared Brand comments | A | A | S | S/C | R/C | R/C |
| Selection create/update | A | A | S | S | R | R |
| Selection approve | A | A | C | C | — | — |
| Budget read | A | A | S | S | R | R |
| Budget manage | A | A | C | S/C | — | — |
| Draft order create | A | A | S | C | — | — |
| Order quantity edit | A | A | S | S/C | — | R |
| Internal order approval | A | A | C | — | A/C | — |
| Order submit | A | A | C | — | C | — |
| Revision accept/reject | A | A | C | — | C | — |
| Order export | A | A | S/C | R/C | A | R/C |
| Payment/invoice | A | R/C | — | — | A | R |
| DealSpace message | A | A | S | S/C | R/C | R/C |
| Calendar/appointments | A | A | S | S/C | R | R/S |
| Analytics | A | A | S | S | R | R/S |
| Audit log | A | R/C | — | — | R/C | — |

---

# 7. Capability-level ownership matrix

## 7.1 Campaign and collection

| Action | Initiator | Approver | Counterparty visibility | Audit |
|---|---|---|---|---|
| Create campaign | Brand editor | optional Head of Sales | none until invited/published | yes |
| Assign campaign owner | Head/Admin | none | internal only | yes |
| Add Shop audience | Brand sales | optional policy | Shop sees invitation only | yes |
| Assign price list | Brand authorised | optional finance | Shop sees resolved prices, not other lists | yes |
| Create collection | Brand editor | optional | none before publish | yes |
| Edit draft presentation | Brand showroom/editor | none | none before publish | versioned |
| Preview as Shop | Brand authorised | none | simulation only | access logged |
| Publish collection | Brand publisher | policy optional | invited Shop | yes |
| Revoke access | Brand authorised | none | Shop access removed | yes |

## 7.2 Selection and order

| Action | Initiator | Approver | Brand visibility | Audit |
|---|---|---|---|---|
| Favourite/shortlist | Shop buying team | none | aggregated signal only if policy allows | analytics |
| Private note | Shop team | none | never | yes, Shop-only |
| Shared product comment | Shop/Brand | none | both parties | yes |
| Create draft order | Buyer | optional | not visible until shared/submitted unless policy says shared draft | yes |
| Edit quantities | Buyer/Merchandiser | optional | draft visibility policy | versioned |
| Internal approve | Shop approver | required by policy | status only after submit | yes |
| Submit order | Buyer/Director | required policy | full submitted snapshot | yes |
| Propose revision | Brand sales | optional policy | Shop sees patch and reason | yes |
| Accept revision | Shop authorised | optional policy | both parties | yes |
| Confirm order | Brand authorised | finance policy optional | both parties | yes |

---

# 8. Field-level visibility

## 8.1 Brand internal only

- buyer strategy notes;
- sales target and margin target not explicitly shared;
- internal campaign tasks;
- internal product notes;
- sales manager performance;
- raw engagement details when privacy policy requires aggregation;
- unpublished collection versions;
- integration errors and credentials.

## 8.2 Shop internal only

- private product notes;
- excluded/skip reason;
- internal budget;
- category/store allocation drafts;
- internal approval comments;
- competitor/brand comparisons;
- draft order scenarios not shared.

## 8.3 Shared partner confidential

- published showroom;
- resolved price list and currency;
- visible commercial terms;
- shared messages;
- submitted/revised/confirmed orders;
- shared documents;
- confirmed appointments;
- shared tasks.

## 8.4 Restricted

- API credentials;
- authentication/session data;
- payment tokens;
- security logs;
- personal data beyond business purpose.

---

# 9. Entity state restrictions

## Campaign

| State | Read | Edit | Audience change | Archive |
|---|---|---|---|---|
| draft | authorised Brand | yes | yes | yes |
| scheduled | authorised Brand | limited | yes | yes |
| active | Brand + granted Shop context | limited/versioned | yes | no direct delete |
| closing | read | deadline/follow-up only | limited | no |
| completed | read | notes only | no | yes |
| archived | read by permission | no | no | restore by admin |

## Collection release

Published release is immutable. `collection.update` modifies a draft version, never the published snapshot.

## Order

| State | Shop edit | Brand edit | Allowed main action |
|---|---:|---:|---|
| draft | yes | no/shared comments only | validate/review |
| internal_review | conditional | no | approve/return |
| submitted | no | review only | confirm/propose revision |
| brand_review | no | suggestion only | confirm/revise |
| changes_requested | yes against new draft version | no | resubmit |
| resubmitted | no | review | confirm/revise |
| confirmed | no | no | export/amendment later |
| cancelled | no | no | view history |

---

# 10. Server authorization pseudocode

```ts
function authorize(input: AuthorizationInput): AuthorizationDecision {
  requireAuthenticated(input.user);
  const membership = requireActiveMembership(input.user, input.activeOrganisation);
  requireOrganisationTypeCompatible(membership, input.action);
  requirePermission(membership.permissionSet, input.action);
  requireScopeMatch(membership, input.entity);
  requireEntityRelationship(input.user, input.entity);
  requireStateAllows(input.action, input.entity.status);
  requireFieldVisibility(input.action, input.requestedFields);
  return allowWithRedaction(input.requestedFields);
}
```

Нельзя авторизовать действие только потому, что кнопка была видна в UI.

---

# 11. Negative authorization tests

Обязательны:

1. Brand A не читает Campaign Brand B.
2. Shop A не читает Showroom без active grant.
3. Revoked Shop теряет access и realtime subscription немедленно.
4. Sales Manager не видит unassigned Buyer при `assigned` scope.
5. Shop private note никогда не входит в Brand API response.
6. Showroom Manager не подтверждает order без permission.
7. Buyer без submit permission может сохранить draft, но не submit.
8. Finance Approver не редактирует quantities без explicit permission.
9. Published release нельзя изменить PATCH-командой.
10. Confirmed order нельзя мутировать без amendment flow.
11. Export требует текущего permission, даже если файл был создан ранее.
12. Mention не может адресовать пользователя вне DealSpace audience.
13. External ID enumeration не обходит relationship policy.

---

# 12. Cursor contract

Каждая task обязана содержать:

- required permissions;
- scope rule;
- state rule;
- field redaction rule;
- server-side policy test;
- UI disabled/hidden state;
- negative authorization tests;
- audit event requirement.

Функция без server-side authorization не считается реализованной.
