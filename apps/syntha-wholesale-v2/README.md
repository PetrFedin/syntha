# Syntha Wholesale V2

Новый изолированный продукт внутри репозитория Syntha.

## Цель

Создать лучшую B2B wholesale-платформу для показа fashion-коллекций и написания оптовых заказов — сильнее JOOR, NuORDER и аналогов по удобству, визуальной презентации, совместной работе бренда и магазина и качеству Order Builder.

## Продуктовый фокус первой версии

Только две пользовательские роли:

- Brand
- Shop

Первая версия решает четыре главные задачи:

1. Бренд создаёт и публикует digital showroom коллекции.
2. Магазин изучает коллекцию и формирует оптимальный заказ.
3. Бренд и магазин совместно работают над заказом через DealSpace.
4. Встречи, календари, чат, документы и задачи синхронизированы с кампанией, коллекцией и заказом.

Производство, PLM, BOM, QC и supply-chain не входят в базовое ядро. Они могут быть подключены позднее как расширения из текущей Syntha.

## Структура проекта

```text
apps/syntha-wholesale-v2/
├── README.md
├── CURSOR_MASTER_RULES.md
├── docs/
│   ├── 00_PRODUCT_CANON.md
│   ├── 01_INFORMATION_ARCHITECTURE.md
│   ├── 02_FUNCTIONAL_MAP.md
│   ├── 03_DOMAIN_MODEL.md
│   ├── 04_UX_CONSTITUTION.md
│   ├── 05_IMPLEMENTATION_ROADMAP.md
│   └── 06_REUSE_FROM_SYNTHA.md
└── src/
    └── README.md
```

## Канонические модули

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
- Communications
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
- Communications
- Documents
- Analytics
- Settings

## Основной бизнес-поток

```text
Campaign
  → Collection
  → Publish Showroom
  → Invite Buyer
  → Appointment / Self-service Review
  → Selection
  → Order Builder
  → Review / Negotiation
  → Submit
  → Brand Confirmation
  → Confirmed Order
```

## Правило реализации

Новые функции нельзя добавлять напрямую в код до их появления в документации проекта.

Cursor должен выполнять задачи только из `docs/05_IMPLEMENTATION_ROADMAP.md` и соблюдать `CURSOR_MASTER_RULES.md`.

## Статус

- Product scope: initiated
- Architecture: to be defined
- UI system: to be defined
- Implementation: not started
