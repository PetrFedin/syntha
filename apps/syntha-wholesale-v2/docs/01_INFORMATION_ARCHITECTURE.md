# 01 — Information Architecture

## 1. Главный принцип

Пользователь не должен выбирать между десятками технических модулей. Навигация строится вокруг работы, которую он выполняет.

В продукте используются четыре уровня:

1. **Organisation** — Brand или Shop.
2. **Workspace** — крупный раздел продукта.
3. **Entity** — Campaign, Collection, Order, Buyer, Appointment, DealSpace.
4. **Context layer** — Chat, Tasks, Files, Notes, Activity.

Context layer не дублируется как отдельные несвязанные приложения. Он открывается внутри сущности или DealSpace.

## 2. Глобальный shell

### Desktop / iPad landscape

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Global top bar: organisation · season · search · calendar · alerts │
├───────────────┬──────────────────────────────────────────────────────┤
│ Primary nav   │ Workspace                                            │
│               │                                                      │
│ Dashboard     │ Entity header                                        │
│ Campaigns     │ Tabs / filters / main content / contextual inspector │
│ Collections   │                                                      │
│ Orders        │                                                      │
│ DealSpace     │                                                      │
│ Calendar      │                                                      │
│ Analytics     │                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
```

### Mobile

- Bottom navigation содержит максимум пять пунктов.
- Сложный Order Builder доступен в review/quick-edit режиме.
- Полноценная работа с size matrix оптимизирована прежде всего для tablet/desktop.

## 3. Канонические шаблоны экранов

### 3.1 Workspace

Используется для списков и операционного обзора.

Структура:

- Workspace Header;
- primary action;
- saved views;
- filter/search bar;
- KPI strip при необходимости;
- canonical Data Table или Gallery;
- contextual inspector/drawer.

Примеры:

- Campaigns;
- Collections;
- Orders;
- Buyers;
- Appointments;
- Documents.

### 3.2 Entity Page

Используется для конкретной сущности.

Структура:

- breadcrumb;
- Entity Header;
- status and ownership;
- one Primary CTA;
- tabs;
- main content;
- right contextual rail только при реальной пользе;
- activity and collaboration доступны без ухода из сущности.

Примеры:

- Campaign;
- Collection;
- Order;
- Buyer;
- Appointment;
- DealSpace.

### 3.3 Builder

Используется для создания результата из источника.

```text
┌──────────────┬──────────────────────────────┬────────────────────┐
│ Source rail  │ Working canvas               │ Result inspector   │
│ filters      │ products / matrix / looks    │ budget / totals    │
│ categories   │ selection                    │ validation / CTA   │
└──────────────┴──────────────────────────────┴────────────────────┘
```

Примеры:

- Showroom Composer;
- Order Builder;
- Assortment/Selection Builder;
- Invite Builder;
- Appointment agenda builder.

## 4. Brand navigation

### 4.1 Dashboard

- Today;
- campaign performance;
- appointments;
- orders requiring action;
- buyer activity;
- tasks;
- alerts.

### 4.2 Campaigns

- All Campaigns;
- active;
- upcoming;
- archived;
- Campaign workspace.

### 4.3 Collections

- all collections;
- drafts;
- ready to publish;
- published;
- buyer-specific versions;
- Collection workspace;
- Showroom Composer.

### 4.4 Buyers

- companies;
- contacts;
- access requests;
- segments;
- invitations;
- engagement;
- Buyer account page.

### 4.5 Appointments

- calendar/list;
- upcoming;
- completed;
- follow-ups;
- appointment room.

### 4.6 Orders

- drafts shared by buyers;
- submitted;
- changes requested;
- awaiting confirmation;
- confirmed;
- cancelled;
- Order workspace.

### 4.7 DealSpace

- all active relationships;
- unread;
- requires response;
- linked campaign/order;
- DealSpace workspace.

### 4.8 Calendar

- personal;
- team;
- campaign;
- shared appointments;
- sales events;
- external calendar sync.

### 4.9 Documents

- campaign assets;
- collection assets;
- commercial documents;
- order documents;
- shared files.

### 4.10 Analytics

- campaign performance;
- buyer funnel;
- collection engagement;
- product interest;
- order performance;
- team performance.

### 4.11 Settings

- organisation;
- users and roles;
- brands/labels;
- price lists;
- currencies;
- languages;
- integrations;
- notifications;
- security.

## 5. Shop navigation

### 5.1 Dashboard

- today;
- appointments;
- new invitations;
- campaigns closing soon;
- draft orders;
- approvals;
- tasks;
- deliveries shown only as informational data in MVP.

### 5.2 Brands

- connected brands;
- invitations;
- access requests;
- favourites;
- brand profile.

### 5.3 Campaigns

- active buying campaigns;
- upcoming;
- closing soon;
- completed;
- campaign workspace.

### 5.4 Collections

- showroom feed;
- saved collections;
- recently viewed;
- shared with me;
- Collection buyer view.

### 5.5 Buying Workspace

- saved products;
- shortlist;
- comparison;
- category plan;
- budget;
- store allocation draft;
- team notes;
- selections by campaign.

### 5.6 Orders

- drafts;
- internal review;
- submitted;
- changes requested;
- confirmed;
- cancelled;
- Order workspace.

### 5.7 DealSpace

- relationships with brands;
- conversations requiring response;
- linked appointments;
- order negotiations;
- shared files and tasks.

### 5.8 Calendar

- buying appointments;
- campaign deadlines;
- internal review meetings;
- industry events;
- shared brand meetings.

### 5.9 Documents

- linesheets;
- price lists;
- order exports;
- shared commercial files;
- meeting attachments.

### 5.10 Analytics

- buying budget usage;
- category mix;
- brand mix;
- order history;
- decision timeline;
- team activity.

### 5.11 Settings

- organisation;
- users and roles;
- stores;
- budgets;
- currencies;
- approval rules;
- integrations;
- notifications;
- security.

## 6. Entity navigation

### Campaign

Tabs:

- Overview
- Collections
- Buyers
- Appointments
- Orders
- Calendar
- Documents
- Activity
- Analytics
- Settings

### Collection

Tabs:

- Overview
- Products
- Looks
- Story
- Showroom
- Commercial Terms
- Buyer Access
- Documents
- Activity
- Analytics
- Settings

### Order

Tabs:

- Overview
- Lines
- Deliveries
- Commercial Summary
- Approvals
- Documents
- DealSpace
- Activity
- History

### Buyer / Brand account

Tabs:

- Overview
- Contacts
- Campaigns
- Appointments
- Orders
- DealSpace
- Documents
- Activity
- Analytics

### Appointment

Tabs:

- Overview
- Agenda
- Live Room
- Selection
- Notes
- Tasks
- Files
- Summary
- Activity

### DealSpace

Tabs:

- Conversation
- Meetings
- Tasks
- Files
- Notes
- Activity
- Linked Orders

## 7. Global search

Global search должен находить:

- campaigns;
- collections;
- products;
- looks;
- brands;
- shops;
- buyers;
- appointments;
- orders;
- DealSpaces;
- documents;
- messages when permitted.

Результаты группируются по entity type. Поиск никогда не отправляет пользователя в legacy Syntha.

## 8. URL-канон

Предлагаемый route space:

```text
/wholesale-v2
/wholesale-v2/brand/dashboard
/wholesale-v2/brand/campaigns
/wholesale-v2/brand/campaigns/:campaignId
/wholesale-v2/brand/collections/:collectionId
/wholesale-v2/brand/collections/:collectionId/showroom
/wholesale-v2/brand/orders/:orderId
/wholesale-v2/shop/dashboard
/wholesale-v2/shop/campaigns/:campaignId
/wholesale-v2/shop/collections/:collectionId
/wholesale-v2/shop/buying/:campaignId
/wholesale-v2/shop/orders/:orderId
/wholesale-v2/dealspaces/:dealSpaceId
```

Routes отражают сущности, а не технические реализации.

## 9. Связь контекстов

Любая сущность должна показывать:

- parent context;
- linked entities;
- status;
- owner;
- latest activity;
- next action.

Примеры:

```text
Campaign → Collection → Showroom → Selection → Order
Campaign → Appointment → Selection → Order
Brand + Shop + Campaign → DealSpace
Order → DealSpace → Messages / Tasks / Files
```

## 10. Правило отсутствия перегрузки

- В глобальном меню не более 9 основных пунктов.
- В Entity Page не более 8 видимых вкладок; второстепенные объединяются в `More`.
- На экране одна Primary CTA.
- Редкие настройки скрываются в Settings/Inspector.
- Пользователь видит только действия, доступные в текущем статусе и по его правам.
- Технические статусы переводятся в понятный бизнес-язык.