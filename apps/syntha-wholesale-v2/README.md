# Syntha Wholesale V2

Новый изолированный продукт внутри репозитория Syntha.

## Цель

Создать лучшую B2B wholesale-платформу для показа fashion-коллекций и написания оптовых заказов — сильнее JOOR, NuORDER и аналогов по удобству, визуальной презентации, совместной работе бренда и магазина и качеству Order Builder.

## Продуктовый фокус первой версии

Только две пользовательские роли:

- Brand;
- Shop.

Первая версия решает четыре главные задачи:

1. Бренд создаёт и публикует digital showroom коллекции.
2. Магазин изучает коллекцию и формирует оптимальный заказ.
3. Бренд и магазин совместно работают над заказом через DealSpace.
4. Встречи, календари, чат, документы и задачи синхронизированы с кампанией, коллекцией и заказом.

Производство, PLM, BOM, QC и supply-chain не входят в базовое ядро. Они могут быть подключены позднее как расширения из текущей Syntha.

## Функциональные референсы

Платформа использует сильные идеи JOOR, NuORDER, Le New Black, Brandboom, RepSpark, Faire и World Fashion Exchange, но не копирует их экраны.

Из World Fashion Exchange в wholesale-контур включаются:

- private buyer showrooms;
- buyer-specific assortments, pricing and content;
- secure invitation access;
- high-resolution media and HD video;
- shoppable lookbooks and digital linesheets;
- buyer feedback and contextual collaboration;
- showroom engagement analytics;
- integration ports for PLM/ERP data.

PLM, ERP, MES и factory execution WFX не входят в MVP. Подробное решение находится в `docs/15_WFX_REFERENCE_AND_ADAPTATION.md`.

## Структура нового проекта

```text
apps/syntha-wholesale-v2/
├── README.md
├── STATUS.md
├── CURSOR_MASTER_RULES.md
├── docs/
│   ├── 00_PRODUCT_CANON.md
│   ├── 01_INFORMATION_ARCHITECTURE.md
│   ├── 02_FUNCTIONAL_MAP.md
│   ├── 03_DOMAIN_MODEL.md
│   ├── 04_UX_CONSTITUTION.md
│   ├── 05_IMPLEMENTATION_ROADMAP.md
│   ├── 06_REUSE_FROM_SYNTHA.md
│   ├── 07_COMPETITIVE_MATRIX.md
│   ├── 08_SCREEN_BIBLE_INDEX.md
│   ├── 09_COMPONENT_LIBRARY.md
│   ├── 10_API_BIBLE.md
│   ├── 11_SECURITY_AND_DATA.md
│   ├── 12_CURSOR_TASK_TEMPLATE.md
│   ├── 13_PRODUCT_PRINCIPLES.md
│   ├── 14_ADAPTIVE_UI_VISUAL_SYSTEM.md
│   ├── 15_WFX_REFERENCE_AND_ADAPTATION.md
│   └── screens/
│       └── vertical-slice-01/
│           ├── README.md
│           ├── BR-002_CAMPAIGN_REGISTRY.md
│           ├── BR-003_CAMPAIGN_OVERVIEW.md
│           ├── BR-009_COLLECTION_OVERVIEW.md
│           ├── BR-013_SHOWROOM_COMPOSER.md
│           ├── BR-014_BUYER_PREVIEW.md
│           ├── SH-006_COLLECTION_SHOWROOM.md
│           ├── SH-008_SELECTION.md
│           └── SH-012_ORDER_BUILDER.md
├── design-system/
│   ├── README.md
│   ├── tokens.json
│   └── responsive-contract.json
├── tasks/
│   └── README.md
└── src/
    └── README.md
```

## Порядок чтения

1. `docs/00_PRODUCT_CANON.md` — что строим и что сознательно не строим.
2. `docs/13_PRODUCT_PRINCIPLES.md` — принципы принятия продуктовых решений.
3. `docs/01_INFORMATION_ARCHITECTURE.md` — разделы, навигация и шаблоны экранов.
4. `docs/02_FUNCTIONAL_MAP.md` — полный каталог функций P0/P1/P2.
5. `docs/03_DOMAIN_MODEL.md` — сущности, статусы, связи и инварианты.
6. `docs/04_UX_CONSTITUTION.md` — обязательные правила интерфейса.
7. `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` — визуальное оформление iPhone, iPad, MacBook и fullscreen desktop.
8. `design-system/tokens.json` — машинно-читаемые цвета, typography, spacing, controls и dimensions.
9. `design-system/responsive-contract.json` — breakpoints, grids и responsive behaviour.
10. `docs/15_WFX_REFERENCE_AND_ADAPTATION.md` — какие функции WFX берём и какие исключаем.
11. `docs/08_SCREEN_BIBLE_INDEX.md` — реестр экранов Brand/Shop.
12. соответствующий файл в `docs/screens/` — обязательная screen-spec.
13. `docs/09_COMPONENT_LIBRARY.md` — единственные разрешённые UI-паттерны.
14. `docs/10_API_BIBLE.md` — API-контракты и endpoint map.
15. `docs/11_SECURITY_AND_DATA.md` — tenant isolation, permissions, audit и data policy.
16. `docs/05_IMPLEMENTATION_ROADMAP.md` — фазы реализации.
17. `docs/12_CURSOR_TASK_TEMPLATE.md` — формат атомарной задачи Cursor.
18. `STATUS.md` — фактический статус и gates перед кодом.

## Первый детально описанный вертикальный срез

```text
Campaign Registry
→ Campaign Overview
→ Collection Overview
→ Showroom Composer
→ Buyer Preview
→ Shop Collection Showroom
→ Selection
→ Order Builder
```

Все восемь экранов имеют отдельные спецификации с:

- user goal;
- route and entry/exit points;
- data contract;
- layout;
- actions;
- filters and tables/cards;
- empty/loading/error/conflict states;
- permissions;
- keyboard/touch behaviour;
- iPhone/iPad/MacBook adaptation;
- analytics events;
- acceptance criteria;
- non-goals.

## Канонический визуальный язык

В операционной части платформа использует:

- тёплые нейтральные поверхности;
- графитовый основной текст;
- один сдержанный тёмно-зелёный accent;
- Inter для рабочего интерфейса;
- optional Source Serif 4 только для buyer-facing editorial hero;
- минимальные тени;
- радиусы 6–12 px для рабочего UI;
- один App Shell и один набор компонентов для Brand и Shop;
- адаптацию layout, а не уменьшенную desktop-копию на iPhone.

Showroom может быть более editorial, но pricing, selection, order controls, statuses и системная навигация всегда остаются частью единой платформенной системы.

## Канонические модули

### Brand

- Dashboard;
- Sales Campaigns;
- Collections;
- Showrooms;
- Buyers;
- Appointments;
- Orders;
- DealSpace;
- Calendar;
- Communications;
- Documents;
- Analytics;
- Settings.

### Shop

- Dashboard;
- Brands;
- Campaigns;
- Collections;
- Buying Workspace;
- Orders;
- DealSpace;
- Calendar;
- Communications;
- Documents;
- Analytics;
- Settings.

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

Cursor должен:

- соблюдать `CURSOR_MASTER_RULES.md`;
- брать задачи только из `tasks/`;
- использовать шаблон `docs/12_CURSOR_TASK_TEMPLATE.md`;
- прочитать соответствующую screen-spec до изменения UI;
- соблюдать `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` без локальных визуальных исключений;
- генерировать runtime tokens только из `design-system/tokens.json`;
- реализовывать responsive behaviour по `design-system/responsive-contract.json`;
- не импортировать legacy UI напрямую;
- не открывать legacy routes из V2;
- не создавать локальные версии canonical components;
- не скрывать незавершённые write-paths demo-заглушками.

Если документы расходятся, реализация останавливается до исправления спецификации. Cursor не выбирает вариант самостоятельно.

## Текущий статус

- Product scope: draft complete;
- Information architecture: draft complete;
- Functional map: draft complete;
- Domain model: draft complete;
- UX constitution: draft complete;
- Responsive UI and visual system: draft complete;
- Machine-readable visual tokens: draft complete;
- Responsive implementation contract: draft complete;
- WFX adaptation map: verified draft complete;
- First vertical-slice Screen Bible: designed;
- Component/API/security foundations: draft complete;
- Implementation: not started.

Точные gates и следующие шаги находятся в `STATUS.md`.
