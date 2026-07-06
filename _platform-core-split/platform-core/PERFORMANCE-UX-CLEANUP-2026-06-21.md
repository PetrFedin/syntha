# Platform Core Performance + UX Cleanup - 2026-06-21

Цель: Platform Core должен быть быстрым для разработки, легким для Cursor и спокойным для пользователя. Внутри `/platform` не должно быть лишнего текста, разных визуальных языков, длинных описаний, demo-шума и страниц, которые не ведут к действию или финальному результату.

## 1. Главный вывод

Platform Core перегружает не один конкретный файл, а три слоя:

1. Огромный Brand Production / Workshop2 слой.
2. Слишком широкий Shop B2B хвост.
3. Большие generated/data файлы, которые Cursor не должен индексировать постоянно.

Текущий core может стать быстрым и понятным только если `/platform` станет тонким входом:

```text
Platform matrix -> Role -> Pillar -> Section -> Action -> Result
```

Никаких длинных описаний. Никаких декоративных блоков. Никаких разношерстных layouts. Только контекст, состояние, действие и следующий шаг.

## 2. Тяжелые зоны по фактическим метрикам

| Зона | Файлов | Строк | Размер | Проблема |
| --- | ---: | ---: | ---: | --- |
| `src/components/brand/production` | 460 | 98,948 | 3.9 MB | Самая тяжелая зона. Нельзя импортировать целиком в Platform Core. |
| `src/app/brand/production` | 211 | 18,936 | 718 KB | Много страниц и demo/local state. Нужны wrappers и archive. |
| `src/app/shop/b2b` | 86 | 16,726 | 669 KB | Слишком много route pages для core. |
| `src/lib/platform-core-readiness-sections` | 7 | 2,103 | 90 KB | Нормально как audit-data, но не должно разрастаться дальше. |
| `src/app/factory/production` | 20 | 2,979 | 122 KB | Умеренно, но long-tail страницы надо отделить. |
| `src/components/factory` | 5 | 1,343 | 53 KB | Нормально, но dashboard надо дробить. |
| `src/app/factory/supplier` | 4 | 863 | 35 KB | Нормально, кроме demo circular hub. |

## 3. Самые тяжелые файлы, которые не должны постоянно попадать в Cursor context

| Файл | Строк | Размер | Решение |
| --- | ---: | ---: | --- |
| `package-lock.json` | 29,441 | 1.0 MB | Игнорировать в Cursor. |
| `src/lib/production/data/attribute-catalog.instance.json` | 20,750 | 692 KB | Игнорировать; читать через API/loader. |
| `src/lib/production/generated/category-handbook.snapshot.json` | 11,990 | 418 KB | Игнорировать; generated snapshot. |
| `src/data/world-topo.json` | 10,685 | 191 KB | Игнорировать; карта не core. |
| `src/lib/product-attributes.ts` | 5,729 | 240 KB | Разбито/архивировать из core context. |
| `src/lib/data/category-handbook.ts` | 3,362 | 139 KB | Не импортировать в `/platform` напрямую. |
| `src/lib/production/workshop2-live-integration-probes.ts` | 3,119 | 108 KB | Вынести в lazy/server-only diagnostics. |
| `public/data/feature-registry.json` | 2,930 | 170 KB | Не core. |
| `src/components/brand/production/Workshop2Phase1DossierPanel.tsx` | 2,930 | 110 KB | Срочно дробить. |
| `src/components/brand/production/Workshop2ArticleWorkspace.tsx` | 2,598 | 104 KB | Дробить на workspace shell + tabs lazy. |
| `src/app/brand/production/tech-pack/[id]/page.tsx` | 2,072 | 110 KB | Вынести в advanced/archive wrapper. |
| `src/components/brand/production/Workshop2TabContent.tsx` | 1,893 | 77 KB | Дробить по секциям. |
| `src/components/brand/production/CategorySketchAnnotator.tsx` | 1,787 | 67 KB | Lazy-load only inside development section. |
| `src/providers/b2b-state.tsx` | 1,559 | 50 KB | Разделить state на core/session/cart/orders. |
| `src/app/shop/b2b/orders/[orderId]/page.tsx` | 1,034 | 46 KB | Сделать тонкий wrapper над core buyer order cockpit. |

## 4. Что я уже добавил в `.cursorignore`

В `_ai-share/synth-1-full/.cursorignore` добавлен блок `PLATFORM CORE / WORKSHOP2 HEAVY FILES`.

Он исключает из постоянной индексации Cursor:

- lock/generated/data snapshots;
- большие product attributes;
- тяжелые Workshop2 / Brand Production files;
- тяжелые Shop B2B pages;
- большие integration probes.

Это не удаляет файлы и не ломает проект. Это только снижает шум и расход контекста в Cursor. Если надо работать с конкретным файлом, его можно открыть вручную.

## 5. Файлы, которые нарушают правило размера

Для Platform Core нужны жесткие лимиты:

| Тип файла | Лимит | Почему |
| --- | ---: | --- |
| UI component | 250 строк | Компонент должен быть читаемым и маленьким. |
| Page wrapper | 120 строк | Страница должна только собрать данные и подключить cockpit. |
| Role cockpit | 350 строк | Больше - дробить на panels. |
| Section panel | 220 строк | Один section = одна задача. |
| Data fixture | 200 строк | Больше - JSON/loader/seed. |
| Audit data per role | 500 строк | Больше - дробить по pillars. |
| Server repository | 450 строк | Больше - разделять read/write/policy. |

Текущие нарушители:

- `Workshop2Phase1DossierPanel.tsx`
- `Workshop2ArticleWorkspace.tsx`
- `Workshop2TabContent.tsx`
- `CategorySketchAnnotator.tsx`
- `Workshop2SampleBaseSizeBlock.tsx`
- `SkuProcessDetailPanel.tsx`
- `src/app/brand/production/tech-pack/[id]/page.tsx`
- `src/app/shop/b2b/orders/[orderId]/page.tsx`
- `src/providers/b2b-state.tsx`

## 6. Как разгрузить Platform Core технически

### 6.1. `/platform` должен быть matrix-first

Первый экран `/platform` не должен импортировать тяжелые рабочие экраны.

Разрешено:

- role/pillar metadata;
- scores;
- statuses;
- source badges;
- counters;
- lightweight links;
- lazy drawers.

Запрещено на первом экране:

- Workshop2 full workspace;
- full B2B order page;
- full production dossier;
- full category handbook;
- generated snapshots;
- charts with huge data;
- long descriptions.

### 6.2. Cell details must lazy-load

При клике на ячейку:

```text
open drawer -> load role/pillar/section summary -> show primary action
```

Только кнопка действия ведет на тяжелый workspace, если он действительно нужен.

### 6.3. Old pages should become wrappers

Большие старые страницы должны стать тонкими:

```tsx
export default function Page() {
  return <BrandOrderCockpit />;
}
```

Вся логика должна жить в `src/features/platform-core`.

### 6.4. Advanced screens must not be core imports

Archive/advanced страницы могут существовать, но Platform Core не должен импортировать их напрямую.

## 7. Единый UX-стандарт `/platform`

Нужен спокойный, консервативный, единый стиль. Не маркетинговая витрина, не разноцветный demo-dashboard, не "простыня возможностей".

### 7.1. Визуальный тон

| Параметр | Правило |
| --- | --- |
| Цвет | Нейтральный фон, 1 основной акцент, осторожные статусы. |
| Типографика | Компактная, без hero-size внутри рабочих панелей. |
| Карточки | Только для повторяемых ячеек/строк. Не вкладывать card в card. |
| Скругления | До 8px. |
| Тени | Минимальные или без теней. |
| Иконки | Только для действий/status, не как декор. |
| Текст | Коротко. 1-2 строки. Без объяснений "как пользоваться". |
| Данные | Источник данных виден маленьким badge. |

### 7.2. Layout на устройствах

#### iPhone

- Один столбец.
- Сначала роль, потом столпы как compact tabs.
- В ячейке: статус, 1 primary action, 1 secondary action.
- Без больших таблиц.
- Drawer вместо многоуровневой страницы.

#### iPad

- Две зоны: matrix/list слева, detail справа.
- Pillars как tabs.
- Section actions видны без прокрутки.
- Таблицы только compact.

#### MacBook

- Matrix 4×5.
- Правый detail panel.
- Нижняя timeline или trace strip.
- Не больше 3 уровней визуальной иерархии.

### 7.3. Единый шаблон каждой ячейки

Каждая ячейка Platform Core должна выглядеть одинаково:

```text
[Role] [Pillar]
Status: Live / Demo / Read-only / Blocked
Score: 7.4
Source: PG / API / Seed / Local

Main action
Secondary action
Last event
Next required action
```

Запрещено:

- длинное описание;
- 5-8 кнопок;
- разные стили карточек по ролям;
- графики без действия;
- "инвесторские" фразы без операционного смысла.

### 7.4. Единый шаблон section drawer

```text
Title
1 sentence meaning

State
Primary action
Secondary action

Evidence
- last event
- owner
- source

Problems
- one short issue
- one next fix
```

Если нет primary action, section должен быть marked read-only или archive.

## 8. Что убрать из UI Platform Core

Убрать или спрятать в advanced:

- длинные описания фич;
- большие hero-блоки;
- декоративные графики;
- marketing copy;
- повторяющиеся context strips;
- "все возможности" на одном экране;
- неактивные demo buttons;
- страницы, которые не ведут к заказу/PO/materials/tracking/comms;
- разные стили табов и карточек между ролями.

Оставить:

- статус;
- источник данных;
- действие;
- ответственный;
- следующий шаг;
- результат;
- короткую связь с другой ролью.

## 9. Конкретный refactor по тяжелым файлам

### 9.1. `Workshop2Phase1DossierPanel.tsx`

Проблема: 2930 строк. Слишком большой для Cursor и поддержки.

Разделить:

- `DossierPanelShell`
- `DossierPassportSection`
- `DossierBomSection`
- `DossierCompositionSection`
- `DossierConstructionSection`
- `DossierAssignmentSection`
- `DossierExportActions`
- `DossierReadinessSummary`

### 9.2. `Workshop2ArticleWorkspace.tsx`

Проблема: 2598 строк. Workspace смешивает shell, tabs, state, actions.

Разделить:

- `ArticleWorkspaceShell`
- `ArticleWorkspaceHeader`
- `ArticleWorkspaceTabs`
- `ArticleWorkspacePrimaryAction`
- lazy tabs by section.

### 9.3. `Workshop2TabContent.tsx`

Проблема: 1893 строк. Tab renderer стал монолитом.

Разделить по Platform Core pillars:

- development;
- sample collection;
- collection order;
- order production;
- comms.

### 9.4. `CategorySketchAnnotator.tsx`

Проблема: тяжелый interactive tool. Не должен грузиться в `/platform`.

Решение:

- lazy-load only from development section;
- show small preview in Platform Core;
- full tool in advanced drawer/page.

### 9.5. `src/app/shop/b2b/orders/[orderId]/page.tsx`

Проблема: 1034 строки для page route.

Решение:

- page wrapper до 80-120 строк;
- логика в `ShopBuyerOrderCockpit`;
- status/tracking/comms sections lazy.

### 9.6. `src/providers/b2b-state.tsx`

Проблема: 1559 строк provider state.

Решение:

- `b2b-cart-state`;
- `b2b-order-state`;
- `b2b-buyer-session-state`;
- `b2b-ui-state`;
- Platform Core импортирует только нужный slice.

## 10. Правило: каждое действие должно вести к следующему действию

В Platform Core не должно быть "тупиковых" кнопок.

Каждая кнопка должна иметь один из типов:

- create;
- confirm;
- handoff;
- acknowledge;
- assign;
- message;
- schedule;
- export;
- view evidence;
- resolve issue.

Если кнопка не попадает в эти типы - она не core.

## 11. Правило: каждая роль получает свой cockpit

Вместо десятков страниц:

- Brand Order Cockpit;
- Shop Buyer Tracking Cockpit;
- Manufacturer PO Cockpit;
- Supplier Procurement Cockpit.

Каждый cockpit должен быть:

- один экран;
- 3-5 panels;
- 1 primary action;
- 1 timeline;
- 1 comms entry;
- responsive for iPhone/iPad/MacBook.

## 12. Следующий практический порядок работ

1. Утвердить UI standard из этого документа.
2. Восстановить `/platform`.
3. Сделать `/platform` легким matrix-first экраном.
4. Добавить data-source badges.
5. Добавить lazy section drawer.
6. Спрятать long-tail routes из core nav.
7. Начать дробить тяжелые файлы по списку.
8. Старые тяжелые pages превратить в wrappers.
9. Создать import boundary check.
10. Создать Platform Core design tokens.

## 13. Definition of Done для спокойного Platform Core

Готово только когда:

- `/platform` на iPhone не требует горизонтальной прокрутки;
- `/platform` на iPad имеет понятную master-detail структуру;
- `/platform` на MacBook показывает 4×5 без визуального шума;
- каждая ячейка имеет один главный следующий шаг;
- нет длинных описаний;
- нет разных оформлений для разных ролей;
- тяжелые workspaces не грузятся до клика;
- demo/fallback всегда помечен;
- archive/advanced не виден как core;
- Platform Core можно понять за 30 секунд.
