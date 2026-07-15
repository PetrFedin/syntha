# 14 — Responsive Visual System

## 1. Назначение

Этот документ является обязательным визуальным стандартом Syntha Wholesale V2 для:

- iPhone;
- iPad portrait;
- iPad landscape;
- MacBook / desktop window;
- MacBook / desktop full-screen.

Он определяет единый язык интерфейса для всех разделов Brand и Shop.

Цель: интерфейс должен быть лаконичным, аккуратным, сдержанным и коммерчески зрелым. Визуально он сочетает:

- чистоту и строгость B2B-интерфейсов JOOR;
- сильную визуальную подачу коллекций и buying flow, характерную для NuORDER;
- более современную плотность, навигацию и рабочие паттерны уровня Linear, Stripe Dashboard и Notion;
- собственный единый язык Syntha без копирования чужих экранов.

Важно: административная часть и Showroom используют одну дизайн-систему, но разную степень визуальной выразительности. Showroom может быть более editorial. Все операционные разделы остаются нейтральными и функциональными.

---

# 2. Основные визуальные принципы

## 2.1 Спокойствие

- Никаких ярких фоновых заливок больших областей.
- Никаких декоративных градиентов в операционном UI.
- Никаких тяжёлых теней.
- Никаких чрезмерно округлых карточек.
- Цвет используется для действия, состояния и ориентации, а не украшения.

## 2.2 Единообразие

Все разделы используют одинаковые:

- AppShell;
- PageHeader;
- EntityHeader;
- FilterBar;
- DataTable;
- ProductCard;
- EmptyState;
- Drawer;
- Modal;
- Button;
- StatusBadge;
- Tabs;
- Inspector;
- spacing tokens;
- typography tokens;
- radius tokens;
- icon sizes.

Запрещено создавать локальный визуальный стиль для отдельного раздела.

## 2.3 Контент важнее chrome

- Навигация не должна визуально конкурировать с коллекцией, заказом или данными.
- Основной фон нейтральный.
- Карточки отделяются границей и небольшим перепадом поверхности, а не сильной тенью.
- Визуальная иерархия строится размером, весом шрифта, отступами и структурой.

## 2.4 Один экран — одна главная задача

- На экране одна primary action.
- Второстепенные действия не равны главному по весу.
- Основная информация видна без прокрутки, если это возможно.
- Пользователь всегда видит контекст: организация, роль, кампания, коллекция или заказ.

---

# 3. Поддерживаемые размеры экранов

## 3.1 Breakpoints

```text
xs      0–479 px      iPhone compact
sm      480–767 px    iPhone large / narrow tablet
md      768–1023 px   iPad portrait
lg      1024–1279 px  iPad landscape / small MacBook window
xl      1280–1535 px  MacBook standard
2xl     1536–1919 px  MacBook full-screen / desktop
3xl     1920 px+      large desktop
```

CSS tokens:

```text
--bp-sm: 480px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;
--bp-3xl: 1920px;
```

## 3.2 Контрольные viewport для обязательного тестирования

```text
iPhone compact:      375 × 812
iPhone standard:     390 × 844
iPhone large:        430 × 932
iPad portrait:       768 × 1024
iPad portrait large: 834 × 1194
iPad landscape:      1024 × 768
iPad landscape large:1194 × 834
MacBook Air:         1280 × 832
MacBook Pro:         1440 × 900
Desktop full-screen: 1728 × 1117
Large desktop:       1920 × 1080
```

Каждый P0-экран обязан быть проверен минимум на:

- 390 px;
- 768 px;
- 1024 px;
- 1440 px;
- 1728 px.

---

# 4. Базовая цветовая система

## 4.1 Светлая тема — основная

Светлая тема является обязательной для MVP.

```text
color.canvas            #F5F5F3
color.page               #F8F8F7
color.surface            #FFFFFF
color.surface.subtle     #F2F2F0
color.surface.raised     #FFFFFF
color.surface.inverse    #1D1D1B

color.text.primary       #1D1D1B
color.text.secondary     #5F5F5A
color.text.muted         #8A8A84
color.text.inverse       #FFFFFF
color.text.link          #274C77

color.border.subtle      #E8E8E4
color.border.default     #DADAD5
color.border.strong      #BDBDB6

color.accent.primary     #1F3A5F
color.accent.hover       #18304F
color.accent.pressed     #12263F
color.accent.soft        #E9EFF6

color.success.text       #25613B
color.success.surface    #EAF4ED
color.success.border     #BFD8C6

color.warning.text       #785A12
color.warning.surface    #FAF3DE
color.warning.border     #E6D49A

color.danger.text        #9A2B2B
color.danger.surface     #FBECEC
color.danger.border      #E9B9B9

color.info.text          #265A73
color.info.surface       #EAF3F7
color.info.border        #BCD5E0

color.focus              #315E8A
color.overlay            rgba(18, 18, 16, 0.42)
```

## 4.2 Цветовой характер

Основной accent — тёмный холодный синий. Он должен восприниматься как:

- профессиональный;
- спокойный;
- премиальный;
- нейтральный к брендовому контенту;
- хорошо читаемый рядом с fashion-фотографией.

Недопустимы:

- насыщенный фиолетовый как основной цвет;
- ярко-синий SaaS-цвет;
- неоновые акценты;
- множество цветных карточек;
- цветные боковые панели для каждого раздела.

## 4.3 Brand-controlled Showroom palette

Внутри canvas Showroom бренд может задавать:

- background;
- foreground;
- accent;
- font pairing из разрешённого списка;
- cover style.

Но системные элементы остаются платформенными:

- навигация;
- selection tray;
- pricing;
- filters;
- quantity controls;
- status;
- order summary;
- accessibility controls.

Бренд не может изменять системные цвета состояний, ошибок и primary action.

## 4.4 Тёмная тема

Не входит в P0. Архитектура токенов должна позволять добавить её позже без изменения feature code.

---

# 5. Типографика

## 5.1 Основной шрифт

Приоритет:

```text
Inter Variable
```

Fallback:

```text
-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Почему:

- высокая читаемость в таблицах;
- хорошая поддержка кириллицы и латиницы;
- tabular numerals;
- variable weights;
- стабильность на iPhone, iPad и MacBook.

Для editorial Showroom позднее допускается второй display-font из строго ограниченного набора, но административный интерфейс всегда использует Inter.

## 5.2 Font weights

```text
400 Regular
450 Text Medium, если поддерживается variable font
500 Medium
600 Semibold
700 Bold — редко
```

Запрещено использовать 800/900 в интерфейсе.

## 5.3 Типографическая шкала

### Desktop / MacBook

| Token | Size | Line-height | Weight | Использование |
|---|---:|---:|---:|---|
| display-xl | 48 | 56 | 500 | Campaign/Showroom hero, редко |
| display-lg | 40 | 48 | 500 | Editorial collection intro |
| page-title | 28 | 36 | 600 | Заголовок страницы |
| entity-title | 24 | 32 | 600 | Название заказа, коллекции, кампании |
| section-title | 18 | 26 | 600 | Заголовок секции |
| card-title | 15 | 22 | 600 | Карточки и компактные панели |
| body-lg | 16 | 24 | 400 | Важный описательный текст |
| body | 14 | 20 | 400 | Основной UI-текст |
| body-medium | 14 | 20 | 500 | Labels / actions |
| compact | 13 | 18 | 400 | Таблицы, metadata |
| compact-medium | 13 | 18 | 500 | Table headers |
| caption | 12 | 16 | 400 | Подписи, вторичные данные |
| overline | 11 | 14 | 600 | Категория / служебный label |
| numeric-lg | 24 | 30 | 600 | KPI и totals |
| numeric-md | 18 | 24 | 600 | Compact totals |

### iPad

- page-title: 26/34;
- entity-title: 22/30;
- section-title: 17/24;
- body: 14/20;
- compact: 13/18;
- numeric-lg: 22/28.

### iPhone

| Token | Size | Line-height | Weight |
|---|---:|---:|---:|
| mobile-page-title | 24 | 30 | 600 |
| mobile-entity-title | 20 | 26 | 600 |
| mobile-section-title | 17 | 24 | 600 |
| mobile-body | 15 | 22 | 400 |
| mobile-body-medium | 15 | 22 | 500 |
| mobile-compact | 13 | 18 | 400 |
| mobile-caption | 12 | 16 | 400 |
| mobile-numeric | 20 | 26 | 600 |

На iPhone body не должен быть меньше 15 px для основных сценариев.

## 5.4 Правила заголовков

- Page title занимает максимум две строки на iPhone и одну строку на MacBook.
- Entity title может занимать две строки, но status и primary action не должны ломать layout.
- Заголовки не пишутся ALL CAPS.
- Overline допускается в верхнем регистре с letter-spacing 0.04em.
- Не использовать тонкий вес для заголовков.
- Не использовать декоративную типографику в операционных экранах.

## 5.5 Числа

Для цен, quantities, budgets и totals:

```css
font-variant-numeric: tabular-nums;
```

Деньги всегда показывают:

- валюту;
- формат локали;
- единый decimal policy;
- полное значение в tooltip, если отображение сокращено.

---

# 6. Сетка и контейнеры

## 6.1 Базовая сетка

### MacBook / desktop

- 12 колонок;
- gutter 24 px;
- page padding 24–32 px;
- рабочая область использует всю ширину после sidebar;
- контентный max-width зависит от типа экрана.

### iPad landscape

- 12 колонок;
- gutter 20 px;
- page padding 20–24 px.

### iPad portrait

- 8 колонок;
- gutter 16 px;
- page padding 20 px.

### iPhone

- 4 колонки;
- gutter 12 px;
- horizontal page padding 16 px;
- safe-area учитывается обязательно.

## 6.2 Max-width контейнеров

```text
Reading / settings form:       720 px
Standard entity content:       1120 px
Dashboard content:             1280 px
Registry/table workspace:      none; full available width
Showroom editorial content:    1440 px
Order Builder:                 none; full available width
Calendar:                      none; full available width
DealSpace split view:          none; full available width
```

Нельзя помещать DataTable или Order Builder в узкий центрированный контейнер.

## 6.3 Page padding

```text
iPhone:             16 px

iPad portrait:      20 px

iPad landscape:     24 px

MacBook <1440:       24 px

MacBook >=1440:      32 px

Large desktop:       40 px maximum
```

## 6.4 Вертикальные интервалы

```text
Page header → first section:     24 px
Section → section:               24 px desktop / 20 px tablet / 16 px mobile
Title → supporting text:         6–8 px
Form field → form field:         16 px
Card internal spacing:           16 px standard
Compact card internal spacing:   12 px
Table toolbar → table:           12 px
```

---

# 7. AppShell

## 7.1 MacBook / full-screen

Структура:

```text
┌──────────────────────────────────────────────────────────┐
│ Sidebar 248 │ Top Context Bar 48                         │
│             ├────────────────────────────────────────────┤
│             │ Page / Workspace                           │
│             │                                            │
└──────────────────────────────────────────────────────────┘
```

Размеры:

```text
Sidebar expanded:       248 px
Sidebar compact:        72 px
Top context bar:        48 px
Minimum app height:     100dvh
```

Sidebar:

- background `color.surface`;
- right border 1 px;
- logo zone 56 px height;
- navigation item height 40 px;
- icon 18 px;
- label 14/20 medium;
- horizontal padding 12 px;
- active item: subtle accent surface, no thick left bar;
- section gap 20 px;
- footer account area 56 px minimum.

Top context bar:

- organisation switcher;
- current campaign context;
- global search;
- notifications;
- help;
- avatar.

Он не повторяет page title.

## 7.2 MacBook windowed

При ширине 1024–1279 px:

- sidebar может быть 72 px icon-only;
- labels доступны через tooltip;
- глобальный поиск сворачивается до icon + shortcut;
- inspector открывается поверх контента, если постоянная правая панель делает рабочую область слишком узкой.

## 7.3 iPad landscape

- sidebar 72 px icon-only по умолчанию;
- по нажатию раскрывается overlay-панель 280 px;
- top bar 52 px;
- drag gestures не должны конфликтовать с системным back gesture;
- primary action закреплена в header или нижней action bar.

## 7.4 iPad portrait

- persistent sidebar отсутствует;
- top app bar 56 px;
- navigation открывается через menu button;
- допускается bottom navigation только для 4–5 главных разделов роли;
- вторичные разделы находятся в More;
- entity tabs горизонтально прокручиваются.

## 7.5 iPhone

Структура:

```text
Top App Bar 52 px
Scrollable Content
Sticky Bottom Action / Bottom Navigation 56–64 px
```

Правила:

- App bar использует safe-area inset top;
- back action слева;
- title по центру только для простых drill-down экранов;
- для workspace title выравнивается слева;
- справа максимум две icon actions;
- глобальная primary action размещается в sticky bottom action bar;
- bottom navigation не показывается внутри full-screen builder/editor flow.

---

# 8. Header patterns

## 8.1 WorkspaceHeader

Desktop:

```text
Title + supporting summary                 Primary action
Saved view / count                         Secondary actions
```

Размеры:

- min-height 72 px;
- title 28/36;
- summary 13/18;
- action group gap 8 px;
- bottom margin 20–24 px.

Mobile:

- title 24/30;
- supporting summary ниже;
- primary action переносится в sticky bottom bar;
- secondary actions — overflow menu.

## 8.2 EntityHeader

Содержит:

- breadcrumb;
- title;
- status;
- owner/team;
- key metadata;
- primary action;
- secondary actions;
- tabs ниже.

Desktop layout:

```text
Breadcrumb
Title + Status                         Actions
Metadata row
Tabs
```

Mobile layout:

```text
Back
Overline
Title
Status + metadata
Compact tabs / segmented control
```

## 8.3 BuilderHeader

Высота:

```text
Desktop: 56 px
Tablet:  56 px
Mobile:  52 px
```

Показывает:

- back/close;
- builder title;
- save state;
- validation count;
- current totals;
- primary action.

На iPhone totals открываются в bottom sheet, а не пытаются уместиться в header.

---

# 9. Кнопки

## 9.1 Размеры

| Size | Height | Horizontal padding | Font | Icon |
|---|---:|---:|---:|---:|
| xs | 28 | 10 | 12/16 medium | 14 |
| sm | 32 | 12 | 13/18 medium | 16 |
| md | 36 | 14 | 14/20 medium | 16 |
| lg | 40 | 16 | 14/20 medium | 18 |
| touch | 44 | 16 | 15/22 medium | 18 |

Default:

- MacBook: `md`;
- iPad: `lg` или `touch`;
- iPhone: `touch`.

## 9.2 Radius

```text
Button radius: 8 px
Icon button radius: 8 px
Pill button разрешён только для segmented controls/chips
```

## 9.3 Primary button

- dark blue surface;
- white label;
- no gradient;
- subtle 1 px border same/near surface;
- hover меняет тон, а не добавляет сильную тень;
- disabled сохраняет читаемость;
- loading не меняет ширину кнопки.

## 9.4 Secondary button

- white surface;
- default border;
- primary text;
- hover subtle surface.

## 9.5 Ghost button

- transparent;
- используется для toolbar utility;
- не может быть основной action.

## 9.6 Destructive button

- red text/outline по умолчанию;
- solid red только в подтверждающем danger-dialog;
- не размещается рядом с primary без визуального разделения.

## 9.7 Icon button

```text
Desktop visual size: 32–36 px
Touch target:        minimum 44 × 44 px on iPad/iPhone
Icon:                16–18 px
```

Каждая icon-only кнопка имеет tooltip на desktop и accessibility label на всех устройствах.

---

# 10. Inputs, selectors and forms

## 10.1 Высоты

```text
Desktop input: 36 px
Tablet input:  40 px
Mobile input:  44 px
Textarea min:  96 px
Search field:  36 / 40 / 44 px
```

## 10.2 Form field structure

```text
Label 13/18 medium
4–6 px gap
Input
6 px gap
Helper or error 12/16
```

## 10.3 Radius and border

- radius 8 px;
- border 1 px;
- focus ring 2 px external;
- error state меняет border и показывает текст;
- placeholder secondary/muted, но не заменяет label.

## 10.4 Form layout

Desktop:

- 2-column form только для логически связанных коротких полей;
- длинный текст, search и selectors занимают полную ширину;
- form max-width 720 px;
- sticky section navigation для длинных settings.

Mobile:

- одна колонка;
- no side-by-side fields, кроме очень коротких paired values;
- action bar sticky bottom;
- клавиатура не должна закрывать активное поле и submit.

---

# 11. Cards

## 11.1 Базовая карточка

```text
Background: color.surface
Border: 1 px color.border.subtle
Radius: 10 px
Shadow: none by default
Padding: 16 px
```

Raised card допускает:

```text
0 1px 2px rgba(20,20,18,0.04)
```

## 11.2 Запреты

- card inside card без сильной необходимости;
- radius > 14 px в операционном UI;
- цветной фон для обычной информации;
- floating cards everywhere;
- одинаковый визуальный вес у primary и secondary cards.

## 11.3 MetricCard

Desktop:

- min-height 104 px;
- padding 16 px;
- label 12/16;
- value 24/30 semibold;
- delta 12/16;
- максимум 6 карточек в одном ряду.

Mobile:

- 2 колонки;
- min-height 96 px;
- value 20/26;
- допускается горизонтальный scroll только для secondary metrics.

## 11.4 ProductCard

Canonical aspect ratios:

```text
Primary product image:  3:4
Look image:             4:5 or 2:3
Campaign cover:         16:9 or 3:2
Avatar/logo:            1:1
```

Grid widths:

```text
iPhone:           2 columns, 8–12 px gap

iPad portrait:    3 columns, 16 px gap

iPad landscape:   4 columns, 16 px gap

MacBook 1280:     4–5 columns, 20 px gap

MacBook 1440+:    5–6 columns, 20–24 px gap
```

Product card content order:

1. Image.
2. Status/favourite overlay only when needed.
3. Brand or collection overline.
4. Product name.
5. Style code / colour count.
6. Wholesale price.
7. Delivery / availability.
8. Selection state or quantity summary.

Правила:

- actions appear on hover desktop, but remain reachable on touch;
- no more than two overlay controls;
- image background neutral;
- image uses object-fit appropriate to source;
- product name maximum two lines;
- prices use tabular numerals;
- cards retain the same data hierarchy across showroom, selection and order source variants.

---

# 12. Tables and dense data

## 12.1 Row heights

```text
Compact:      36 px
Default:      44 px
Comfortable:  52 px
Touch/iPad:   48–52 px
```

Header:

```text
36–40 px desktop
44 px tablet
```

## 12.2 Cell typography

- table header: 12/16 semibold;
- primary cell: 13/18 medium or regular;
- secondary metadata: 12/16;
- totals: 13/18 semibold tabular.

## 12.3 Desktop layout

- sticky header;
- sticky identity column when horizontally scrollable;
- row actions right aligned;
- row click opens detail;
- checkbox selection has separate target;
- status and amount visible before low-priority columns.

## 12.4 iPad

- low-priority columns hidden;
- column chooser available;
- horizontal scroll allowed for order matrices, not for simple registries;
- identity column sticky;
- row detail can open inspector/drawer.

## 12.5 iPhone

Simple registries transform into list rows/cards.

Do not render a desktop table compressed to 390 px.

Mobile list row:

```text
Primary identity
Status
2–3 key fields
Amount / next action
Chevron or contextual menu
```

Order matrix on iPhone becomes sequential product editor:

1. Product.
2. Colour.
3. Sizes.
4. Quantities.
5. Delivery.
6. Review.

---

# 13. Icons

## 13.1 Icon library

Use one icon library only. Recommended:

```text
Lucide Icons
```

No mixing with Heroicons, Material Icons or custom random SVGs.

## 13.2 Sizes

```text
Inline metadata: 14 px
Standard UI:     16 px
Navigation:      18 px
Primary feature: 20 px
Empty state:     24–32 px
```

## 13.3 Stroke

- standard stroke width 1.75–2;
- no filled icons except status/selection where meaning benefits;
- icons never replace text for unfamiliar business actions;
- active navigation icon may use stronger colour, not larger size.

## 13.4 Placement

- icon before button label;
- chevron after label for navigation;
- status icon before status text;
- destructive icon only where it improves recognition;
- no decorative icon in every section title.

---

# 14. Tabs, chips and filters

## 14.1 Tabs

Desktop:

- height 40 px;
- label 13/18 medium;
- active state uses text + 2 px underline or subtle selected surface;
- no pill tabs for primary entity navigation.

Mobile:

- 40–44 px touch height;
- horizontally scrollable;
- selected item remains visible after navigation;
- maximum 4 items in segmented control.

## 14.2 FilterBar

Desktop order:

```text
Search | primary filters | saved view | result count | view switcher | clear
```

- height 40 px minimum;
- chips 28–32 px;
- more filters opens popover/drawer;
- active filters visually distinct but calm.

Mobile:

```text
Search full width
Filter button + Sort + View
Active filter chips horizontal scroll
```

Filters open bottom sheet.

## 14.3 StatusBadge

```text
Height: 22–24 px
Padding: 6–8 px horizontal
Font: 12/16 medium
Radius: 6 px
```

Badge must contain text, not colour alone.

---

# 15. Drawers, modals and bottom sheets

## 15.1 Desktop Drawer

```text
Standard: 420 px
Wide:     560 px
Inspector:360–400 px
```

- slides from right;
- header 56 px;
- body scrolls independently;
- footer actions sticky;
- overlay only when drawer blocks workflow;
- persistent inspector may have no overlay.

## 15.2 iPad Drawer

```text
Portrait:  min(88vw, 560 px)
Landscape: 480–560 px
```

## 15.3 iPhone Bottom Sheet

- preferred over side drawer;
- width 100%;
- top radius 16 px;
- drag handle 32 × 4 px;
- max-height 92dvh;
- supports half and full states only when useful;
- sticky footer actions;
- safe-area bottom padding.

## 15.4 Modal

Desktop widths:

```text
Small confirm:  400 px
Standard:       520 px
Large form:     720 px
```

Full-screen modal запрещён на desktop, кроме complex media preview.

На iPhone complex modal становится full-screen sheet.

---

# 16. Responsive patterns by product area

## 16.1 Dashboard

MacBook:

- 12-column grid;
- first row: 4–6 metrics;
- second row: action queue + appointments;
- third row: funnel/analytics + activity;
- no more than 3 visual chart types per page.

iPad:

- 2-column sections;
- metric cards 2–3 per row;
- action queue first.

िPhone:

- today/action queue first;
- metrics in 2-column grid;
- charts simplified;
- tables become ranked lists;
- no dashboard horizontal overflow.

## 16.2 Campaign and Collection workspace

MacBook:

```text
EntityHeader
Tabs
Main content 8–9 columns | Context rail 3–4 columns
```

Context rail appears only when it contains actionable content:

- readiness;
- deadlines;
- team;
- latest activity;
- publish status.

iPad portrait:

- context rail becomes collapsible section or drawer.

फोन:

- header stacked;
- tabs horizontal;
- context information appears as summary cards after main status;
- primary action sticky bottom.

## 16.3 Digital Showroom

MacBook full-screen:

```text
Top minimal showroom bar 48 px
Presentation canvas
Persistent or collapsible selection tray 320–380 px
```

Modes:

- editorial;
- grid;
- looks;
- linesheet;
- fullscreen.

iPad landscape:

- ideal guided appointment device;
- content canvas + collapsible selection rail;
- touch controls 44 px;
- presenter navigation visible but unobtrusive.

फोन:

- single-column story/grid;
- bottom selection tray;
- product detail full-screen;
- quantities edited in sheet;
- no tiny side inspector.

## 16.4 Order Builder

### MacBook full-screen

Canonical layout:

```text
Source rail 280–320 px
Matrix workspace flexible min 640 px
Totals inspector 320–360 px
Builder header 56 px
```

Rules:

- source and totals panels independently collapsible;
- matrix gets priority width;
- minimum usable full layout 1280 px;
- under 1280 px one side panel becomes drawer;
- keyboard focus clearly visible;
- sticky product identity and size headers;
- action footer only where needed.

### iPad landscape

```text
Source drawer
Matrix main surface
Totals compact rail 280 px or drawer
```

- quantities editable with touch;
- numeric keyboard;
- row controls minimum 44 px target;
- matrix can horizontally scroll with sticky identity.

### iPad portrait

Step layout:

```text
Products → Quantities → Deliveries → Review
```

Persistent top summary:

- units;
- value;
- validation count;
- save state.

### iPhone

Order Builder is a guided flow, not a compressed matrix:

```text
1. Product list
2. Product quantity editor
3. Delivery assignment
4. Budget and validation
5. Review and submit
```

Sticky bottom bar:

```text
Units · Value                      Review / Next
```

## 16.5 DealSpace

MacBook:

```text
Conversation list 280 px
Active conversation flexible
Context inspector 320 px optional
```

Внутри active conversation:

- entity context header;
- messages;
- attachments/tasks links;
- composer sticky bottom.

iPad landscape:

- list + conversation;
- context inspector drawer.

फोन:

- conversation list screen;
- conversation detail screen;
- entity context compact header;
- composer respects keyboard and safe area;
- tasks/files open bottom sheets.

## 16.6 Calendar

MacBook:

- month/week/day/agenda;
- left mini-calendar and filters optional 240 px;
- right appointment inspector 360 px optional;
- week/day columns minimum readable width.

­iPad:

- week/day/agenda primary;
- month simplified;
- event editor sheet.

फोन:

- agenda default;
- day timeline secondary;
- month only for navigation;
- create appointment full-screen sheet;
- timezone displayed explicitly.

## 16.7 Product detail

MacBook:

```text
Media 7 columns | Product/commercial panel 5 columns
```

- image rail or gallery;
- sticky commercial panel;
- selection/order action visible.

­iPad portrait:

- media first;
- commercial panel below;
- sticky action bar.

फोन:

- full-width media carousel;
- title, price, delivery, sizes;
- expandable details;
- sticky Add to selection / Edit quantities.

---

# 17. Density modes

## 17.1 Default density

`compact-comfortable`

Used for:

- registries;
- order lists;
- buyer lists;
- documents;
- analytics tables.

## 17.2 Comfortable density

Used for:

- touch-heavy iPad workflows;
- settings;
- appointments;
- DealSpace;
- product browsing.

## 17.3 Editorial density

Used only inside Showroom presentation:

- larger images;
- larger whitespace;
- restrained text;
- still preserves quick access to commercial data.

Пользователь может менять table density, но не глобально ломать layout.

---

# 18. Motion

## 18.1 Duration tokens

```text
motion.fast:    120 ms
motion.base:    180 ms
motion.slow:    240 ms
```

## 18.2 Easing

```text
standard: cubic-bezier(0.2, 0, 0, 1)
exit:     cubic-bezier(0.4, 0, 1, 1)
```

## 18.3 Разрешённая анимация

- hover/focus transitions;
- drawer/sheet entrance;
- subtle reorder movement;
- selection state;
- loading progress;
- toast entrance.

Запрещено:

- bouncing;
- parallax в операционном UI;
- excessive fade between routes;
- animated gradients;
- motion that delays data entry.

`prefers-reduced-motion` обязателен.

---

# 19. Shadows, radius and elevation

## 19.1 Radius scale

```text
radius-xs: 4 px
radius-sm: 6 px
radius-md: 8 px
radius-lg: 10 px
radius-xl: 14 px
radius-sheet: 16 px
radius-round: 999 px
```

Usage:

- badges: 6 px;
- inputs/buttons: 8 px;
- cards: 10 px;
- modal/drawer surfaces: 12–14 px only where visible;
- mobile bottom sheets: 16 px top corners;
- avatars: round.

## 19.2 Shadow scale

```text
shadow-none: none
shadow-xs: 0 1px 2px rgba(20,20,18,0.04)
shadow-sm: 0 4px 16px rgba(20,20,18,0.08)
shadow-md: 0 12px 32px rgba(20,20,18,0.12)
```

Usage:

- cards: none/xs;
- dropdown/popover: sm;
- modal/drawer: md;
- sidebar: border, not shadow.

---

# 20. Responsive behaviour rules

## 20.1 Hide, move, transform

При уменьшении экрана применяется порядок:

1. Скрыть low-priority metadata.
2. Перенести secondary actions в overflow.
3. Превратить context rail в drawer/sheet.
4. Превратить table в mobile list.
5. Разделить complex builder на последовательные шаги.

Запрещено первым действием просто уменьшать шрифты и controls.

## 20.2 Touch targets

- minimum 44 × 44 px on iPhone/iPad;
- distance between destructive and common actions minimum 8 px;
- swipe actions optional, never sole access path;
- hover-only information must have touch alternative.

## 20.3 Safe areas

Обязательно использовать:

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

Для:

- app bars;
- sticky bottom actions;
- chat composer;
- bottom sheets;
- full-screen media.

## 20.4 Keyboard and focus

- desktop keyboard navigation mandatory;
- iPad hardware keyboard supported;
- focus ring visible;
- Escape closes temporary layer;
- Enter confirms only safe expected action;
- Cmd/Ctrl+K opens command/search palette later;
- Order Builder arrows/Tab/Enter optimized for quantity entry.

---

# 21. Layout templates

## 21.1 Registry Workspace

```text
AppShell
WorkspaceHeader
FilterBar
DataTable or Gallery
Optional Inspector
```

Use for:

- Campaigns;
- Collections;
- Buyers/Brands;
- Orders;
- Documents.

## 21.2 Entity Workspace

```text
AppShell
Breadcrumb
EntityHeader
Tabs
Main content
Optional Context Rail
```

Use for:

- Campaign;
- Collection;
- Order;
- Appointment;
- Buyer/Brand relationship.

## 21.3 Builder Workspace

```text
BuilderHeader
Source
Canvas/Matrix
Result Inspector
Sticky Validation/Action
```

Use for:

- Showroom Composer;
- Selection;
- Order Builder.

## 21.4 Split Workspace

```text
List Rail
Primary Detail
Optional Context Inspector
```

Use for:

- DealSpace;
- Calendar + appointment detail;
- notifications;
- task inbox.

Новый layout запрещён без фиксации в UX Constitution и Component Library.

---

# 22. Unified page composition

Каждый экран строится в таком порядке:

```text
1. Global navigation/context
2. Location/context header
3. Primary task and status
4. Filters or tabs
5. Main working surface
6. Contextual supporting information
7. Sticky actions only where justified
8. Feedback: save, validation, success, error
```

Нельзя:

- начинать страницу с набора не связанных карточек;
- дублировать одинаковую информацию в header и first card;
- использовать dashboard-style cards внутри каждого entity screen;
- смешивать gallery, table и cards без view control;
- размещать primary action в разных местах между похожими экранами.

---

# 23. Accessibility and contrast

Минимум WCAG 2.2 AA.

- text contrast 4.5:1;
- large text 3:1;
- interactive boundaries 3:1 where required;
- status does not rely on colour;
- focus ring visible on all surfaces;
- product media has alt text;
- chart data has table/list alternative;
- drag-and-drop has keyboard alternative;
- tooltips are not required to understand critical action;
- font scaling to 200% does not destroy core flow.

---

# 24. Cursor implementation contract

Cursor обязан:

1. Создать semantic design tokens before feature UI.
2. Реализовать responsive primitives before screens.
3. Не использовать raw hex в feature components.
4. Не использовать arbitrary pixel typography classes.
5. Не создавать новый card/button/table variant без обновления Component Library.
6. Проверять 390, 768, 1024, 1440 и 1728 px.
7. Прикладывать screenshots для каждого breakpoint в задаче UI review.
8. Поддерживать keyboard и touch paths.
9. Не считать экран завершённым, если mobile — только уменьшенный desktop.
10. Не копировать визуально JOOR/NuORDER; использовать только их сильные принципы в оригинальной системе Syntha.

---

# 25. Definition of Done для визуального экрана

Экран считается визуально готовым, когда:

- использует только canonical tokens;
- соответствует одному разрешённому layout template;
- имеет loading/empty/error/no-results states;
- имеет корректную primary action hierarchy;
- работает на 390/768/1024/1440/1728 px;
- не имеет horizontal overflow, кроме разрешённой matrix/table области;
- touch targets корректны;
- keyboard focus корректен;
- текст не обрезан без способа увидеть полное значение;
- status и validation понятны без цвета;
- layout не меняет логику между Brand и Shop без причины;
- визуальный review подтверждает спокойный, единый, зрелый B2B-стиль.

---

# 26. Краткая визуальная формула Syntha V2

```text
JOOR:      структурность, коммерческая строгость, wholesale focus
NuORDER:   визуальность коллекций, buying orientation, presentation quality
Syntha V2: единый спокойный shell + лучший showroom + лучший order builder + встроенный DealSpace
```

Итоговый интерфейс должен выглядеть не как набор модулей, а как одна цельная профессиональная система, одинаково узнаваемая на iPhone, iPad и MacBook.