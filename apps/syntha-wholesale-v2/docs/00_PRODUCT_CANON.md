# 00 — Product Canon

## 1. Название и назначение

**Syntha Wholesale V2** — B2B wholesale selling platform для fashion-брендов и магазинов.

Продукт должен лучше существующих решений решать две основные задачи:

1. Бренд эффектно, быстро и управляемо показывает коллекцию.
2. Магазин удобно, обоснованно и без Excel пишет оптовый заказ.

Календарь, встречи, чат, документы, задачи и аналитика существуют не отдельно, а обслуживают этот общий процесс.

## 2. Пользовательские роли

### Brand

Бренд и его внутренняя sales-команда:

- Head of Sales;
- Wholesale Manager;
- Key Account Manager;
- Showroom Manager;
- Sales Representative;
- Brand Admin;
- Finance/Operations reviewer с ограниченными правами.

### Shop

Магазин или сеть магазинов:

- Buyer;
- Senior Buyer;
- Buying Director;
- Merchandiser;
- Store Manager;
- Finance Approver;
- Shop Admin.

Пользовательских ролей Manufacturer и Supplier в V2 нет. Они могут появиться позднее как участники расширенного production-модуля, но не влияют на MVP-архитектуру.

## 3. Главный пользовательский поток

```text
Brand creates Sales Campaign
→ creates one or more Collections
→ configures prices, deliveries and buyer access
→ publishes Digital Showroom
→ invites Shops and schedules Appointments
→ Shop reviews Collection
→ Shop saves products, looks and notes
→ Shop builds Selection
→ Shop writes Order in Order Builder
→ Brand and Shop negotiate in DealSpace
→ Shop submits Order
→ Brand reviews and confirms Order
→ both sides retain shared timeline, documents and communication
```

## 4. Продуктовые ядра

### 4.1 Showroom

Цель: превратить коллекцию в максимально сильную B2B-презентацию.

Showroom должен сочетать:

- editorial storytelling;
- lookbook;
- linesheet;
- product grid;
- looks and outfits;
- video and rich media;
- коммерческие данные;
- quick selection;
- buyer-specific access;
- live appointment mode.

### 4.2 Buying Workspace

Цель: дать закупщику единое рабочее место для оценки коллекции до оформления заказа.

В Buying Workspace живут:

- favorites;
- shortlist;
- comparison;
- buyer notes;
- team comments;
- category plan;
- budget;
- delivery plan;
- store allocation draft;
- saved views;
- incomplete decisions.

### 4.3 Order Builder

Цель: сделать написание заказа быстрее, нагляднее и безопаснее, чем в JOOR, NuORDER, Excel или PDF order forms.

Order Builder обязан поддерживать:

- product/colour/size matrix;
- quick quantities;
- packs and MOQ;
- delivery splits;
- currencies and price lists;
- budgets and thresholds;
- margin calculations;
- order validation;
- scenario comparison;
- autosave;
- collaboration;
- submit and approval workflow.

### 4.4 DealSpace

Цель: сохранить весь контекст сделки в одном месте.

DealSpace автоматически создаётся для пары Brand ↔ Shop в контексте Campaign/Collection/Order и объединяет:

- chat;
- appointments;
- shared calendar;
- files;
- tasks;
- notes;
- order changes;
- approvals;
- activity timeline.

## 5. Обязательные модули MVP

### Brand

- Dashboard
- Sales Campaigns
- Collections
- Showrooms
- Buyers
- Appointments
- Orders
- DealSpace
- Calendar
- Documents
- Analytics
- Settings

### Shop

- Dashboard
- Brands
- Campaigns
- Collections
- Buying Workspace
- Orders
- DealSpace
- Calendar
- Documents
- Analytics
- Settings

## 6. Не входит в MVP

- PLM;
- tech pack authoring;
- BOM;
- sourcing;
- factory management;
- production planning;
- QC execution;
- warehouse management;
- supply-chain orchestration;
- B2C storefront;
- consumer marketplace;
- manufacturing/supplier user portals;
- complex ERP replacement.

Эти функции могут быть подключены позднее как отдельные products/extensions после завершения wholesale ядра.

## 7. Ключевые конкурентные преимущества

### 7.1 Presentation-first showroom

Коллекция представляется не только таблицей или каталогом, а через story, looks, editorial, videos, drops и buying views.

### 7.2 Buyer-first order writing

Order Builder проектируется вокруг реальной работы закупщика: бюджет, категории, магазины, поставки, размеры, сравнение сценариев и согласование.

### 7.3 One transaction context

Showroom, meeting, selection, order, chat, tasks and documents связаны одним DealSpace и одной Activity Timeline.

### 7.4 Live selling

Во время встречи Brand и Shop могут одновременно:

- смотреть коллекцию;
- отмечать товары;
- обсуждать позиции;
- менять quantities;
- видеть budget impact;
- фиксировать следующие действия.

### 7.5 Explainable assistance

AI-функции допускаются только там, где они объясняют рекомендацию и не подменяют решение пользователя.

## 8. Принципы продукта

1. **Focus over breadth.** Сначала идеальный showroom и order writing, затем расширения.
2. **Context over modules.** Пользователь работает со сделкой, а не прыгает между несвязанными сервисами.
3. **One source of truth.** Campaign, Collection, Order and DealSpace имеют канонические модели.
4. **No dead ends.** Любой экран даёт понятное следующее действие.
5. **One primary action.** На экране всегда один главный шаг.
6. **Progressive disclosure.** Сложность открывается по мере необходимости.
7. **Buyer and brand parity.** Обе стороны видят общий контекст, но только разрешённые данные.
8. **Auditability.** Изменения заказа, цен, сроков и решений прослеживаются.
9. **Desktop excellence.** Сложные заказы должны быть великолепны на desktop/iPad.
10. **No decorative functionality.** Неработающие кнопки и фиктивные данные запрещены.

## 9. Продуктовые метрики

### Brand metrics

- время от создания Campaign до публикации Showroom;
- доля приглашённых Shops, открывших Showroom;
- conversion Showroom → Selection;
- conversion Appointment → Submitted Order;
- среднее время подтверждения Order;
- average wholesale order value;
- количество активных buyers;
- доля repeat orders.

### Shop metrics

- время от первого просмотра до submitted order;
- количество ручных выгрузок в Excel;
- количество validation errors до submit;
- процент заказа, сформированный через quick actions;
- время внутреннего approval;
- доля сохранённых selections, ставших orders.

### Experience metrics

- task completion rate;
- error recovery rate;
- dead-end rate;
- support requests per active organisation;
- accessibility and performance scores.

## 10. Definition of product success

MVP успешен, когда Brand и Shop могут полностью пройти путь от опубликованной коллекции до подтверждённого оптового заказа, не используя Excel, email, WhatsApp, PDF order form или старый кабинет Syntha как обязательный шаг.