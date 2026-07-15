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
│   └── 14_ADAPTIVE_UI_VISUAL_SYSTEM.md
├── design-system/
│   ├── tokens.json
│   └── responsive-contract.json
├── tasks/
│   └── README.md
└── src/
    └── README.md
```

## Порядок чтения

1. `00_PRODUCT_CANON.md` — что строим и что сознательно не строим.
2. `13_PRODUCT_PRINCIPLES.md` — принципы принятия продуктовых решений.
3. `01_INFORMATION_ARCHITECTURE.md` — разделы, навигация и шаблоны экранов.
4. `02_FUNCTIONAL_MAP.md` — полный каталог функций P0/P1/P2.
5. `03_DOMAIN_MODEL.md` — сущности, статусы, связи и инварианты.
6. `04_UX_CONSTITUTION.md` — обязательные правила интерфейса.
7. `14_ADAPTIVE_UI_VISUAL_SYSTEM.md` — каноническое визуальное оформление iPhone, iPad, MacBook и fullscreen desktop.
8. `design-system/tokens.json` — машинно-читаемые цвета, typography, spacing, controls и dimensions.
9. `design-system/responsive-contract.json` — машинно-читаемые breakpoints, grids и responsive behaviour.
10. `08_SCREEN_BIBLE_INDEX.md` — реестр экранов Brand/Shop.
11. `09_COMPONENT_LIBRARY.md` — единственные разрешённые UI-паттерны.
12. `10_API_BIBLE.md` — API-контракты и endpoint map.
13. `11_SECURITY_AND_DATA.md` — tenant isolation, permissions, audit и data policy.
14. `05_IMPLEMENTATION_ROADMAP.md` — фазы реализации.
15. `12_CURSOR_TASK_TEMPLATE.md` — формат атомарной задачи Cursor.
16. `STATUS.md` — фактический статус и gates перед кодом.

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
- соблюдать `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` без локальных визуальных исключений;
- генерировать runtime tokens только из `design-system/tokens.json`;
- реализовывать responsive behaviour по `design-system/responsive-contract.json`;
- не импортировать legacy UI напрямую;
- не открывать legacy routes из V2;
- не создавать локальные версии canonical components;
- не скрывать незавершённые write-paths demo-заглушками.

Если Markdown и machine-readable tokens расходятся, реализация останавливается до исправления спецификации. Cursor не выбирает вариант самостоятельно.

## Текущий статус

- Product scope: draft complete;
- Information architecture: draft complete;
- Functional map: draft complete;
- Domain model: draft complete;
- UX constitution: draft complete;
- Adaptive UI and visual system: draft complete;
- Machine-readable visual tokens: draft complete;
- Responsive implementation contract: draft complete;
- Component/API/security foundations: draft complete;
- Competitive matrix: framework ready, facts require verification;
- Screen Bible: index ready, individual specs pending;
- Implementation: not started.

Точные gates и следующие шаги находятся в `STATUS.md`.
