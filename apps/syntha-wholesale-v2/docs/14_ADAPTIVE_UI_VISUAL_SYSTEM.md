# 14 — Adaptive UI & Visual System Bible

## 0. Назначение

Этот документ является канонической спецификацией визуального языка Syntha Wholesale V2 для iPhone, iPad, MacBook и полноэкранного desktop.

Цель: единый спокойный, премиальный и функциональный B2B-интерфейс, одинаково понятный во всех разделах.

Визуальная формула:

- editorial polish цифрового showroom;
- строгая структура wholesale workspace;
- высокая плотность информации без визуального шума;
- одинаковые компоненты во всех разделах;
- адаптивность без создания отдельных продуктов для каждого устройства.

Нельзя копировать JOOR или NuORDER буквально. Разрешено использовать только общие сильные паттерны: визуальная презентация коллекций, быстрый просмотр ассортимента, понятные linesheet/order flows и спокойный enterprise UI.

---

# 1. Базовые принципы

## 1.1. Один визуальный язык

Все разделы используют:

- один App Shell;
- один набор цветов;
- одну типографическую шкалу;
- один набор кнопок;
- один тип карточек;
- один Data Table;
- один Entity Header;
- один набор статусов;
- один набор modal/drawer/sheet;
- один набор empty/loading/error states.

Локальные стили разделов запрещены.

## 1.2. Контент важнее chrome

Интерфейс не конкурирует с коллекцией.

Изображения, товары, цены, размеры, даты поставки и заказ должны быть визуально важнее рамок, градиентов и декоративных элементов.

## 1.3. Премиальность через пропорции

Премиальность достигается:

- воздухом;
- крупной качественной фотографией;
- строгой сеткой;
- спокойной типографикой;
- ограниченной палитрой;
- минимальным количеством декоративных эффектов.

Не использовать:

- тяжёлые тени;
- яркие градиенты;
- glassmorphism;
- excessive blur;
- oversized rounded cards;
- цветные панели без смысловой причины;
- более одной dominant accent colour.

## 1.4. Рабочая плотность

Showroom может быть визуально свободным.
Order Builder, таблицы и аналитика должны быть компактнее.

Разрешены три density mode:

- `comfortable` — showroom, collection story, dashboard;
- `standard` — entity pages, registry, buyers, calendar;
- `compact` — order matrix, linesheet, dense tables.

Пользователь не переключает density вручную в MVP. Режим задаётся шаблоном экрана.

---

# 2. Поддерживаемые viewport-классы

## 2.1. Breakpoints

```text
xs:   0–479 px      iPhone compact
sm:   480–767 px    iPhone large / mobile landscape
md:   768–1023 px   iPad portrait
lg:   1024–1279 px  iPad landscape / small MacBook split view
xl:   1280–1599 px  MacBook / desktop
2xl:  1600–1919 px  large desktop
3xl:  1920 px+      fullscreen desktop / external display
```

CSS token names:

```css
--bp-xs: 0px;
--bp-sm: 480px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1600px;
--bp-3xl: 1920px;
```

## 2.2. Primary support target

P0:

- iPhone portrait;
- iPad portrait;
- iPad landscape;
- MacBook 1280–1512 px;
- desktop 1440–1920 px.

P1:

- iPhone landscape;
- desktop >1920 px;
- browser split view.

## 2.3. Minimum widths

```text
Application hard minimum: 320 px
Desktop shell minimum: 1024 px
Order Builder full mode: 1180 px
Dense size matrix optimal: 1366 px+
```

Below 1180 px Order Builder automatically enters tablet mode.

---

# 3. Цветовая система

## 3.1. Основная палитра

Цветовой характер: neutral warm grey + restrained ink + one muted accent.

```text
Canvas / page background        #F6F5F2
Surface primary                 #FFFFFF
Surface secondary               #F1F0EC
Surface elevated                #FFFFFF
Surface selected                #ECEAE4
Border subtle                   #E5E2DC
Border default                  #D8D4CC
Border strong                   #B9B4AA

Text primary                    #171716
Text secondary                  #5F5D58
Text tertiary                   #858179
Text disabled                   #AAA59C
Text inverse                    #FFFFFF

Accent primary                  #263F3A
Accent hover                    #1E332F
Accent soft                     #E4ECE9
Accent border                   #BACBC6

Focus ring                      #54756D
Overlay                         rgba(17,17,16,0.46)
```

## 3.2. Semantic colours

```text
Success text                    #216348
Success surface                 #E8F4ED
Success border                  #BDDCC9

Warning text                    #7A5518
Warning surface                 #FBF3DF
Warning border                  #E8D39C

Danger text                     #8A302C
Danger surface                  #FBEAE8
Danger border                   #E7BCB8

Info text                       #315C78
Info surface                    #EAF2F7
Info border                     #BCD2DF
```

## 3.3. Status usage

Статус нельзя передавать только цветом. Всегда:

- label;
- optional icon/dot;
- consistent semantic colour.

Палитра статусов:

```text
Draft / Neutral                 grey
Active / Published              green
Scheduled / Pending             blue
Attention / Closing             amber
Blocked / Error                 red
Archived / Closed               muted grey
```

## 3.4. Brand customisation

Бренд может загружать:

- logo;
- cover image/video;
- optional campaign accent;
- optional showroom typography for editorial hero only.

Бренд не может менять:

- application navigation colour;
- button system;
- table styles;
- status colours;
- text colours;
- spacing;
- interaction patterns.

Campaign accent используется только в buyer-facing showroom:

- progress indicator;
- active story marker;
- subtle links;
- cover overlays.

Если custom accent не соответствует contrast requirements, применяется системный accent.

## 3.5. Dark mode

Не входит в MVP.

Архитектура token-based должна позволять добавить dark mode позднее, но Cursor не должен реализовывать локальные `dark:` классы до отдельной задачи.

---

# 4. Типографика

## 4.1. Основной шрифт

Приоритет:

```text
Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Для buyer-facing editorial hero допускается optional serif:

```text
"Source Serif 4", Georgia, serif
```

Serif нельзя использовать в рабочих таблицах, формах, navigation или Order Builder.

## 4.2. Font weights

```text
Regular       400
Medium        500
Semibold      600
Bold          700 — только для числовых KPI или критического акцента
```

В интерфейсе не использовать font-weight 800/900.

## 4.3. Desktop type scale

| Token | Size | Line height | Weight | Use |
|---|---:|---:|---:|---|
| Display XL | 48 | 54 | 500 | showroom hero only |
| Display L | 40 | 46 | 500 | collection campaign hero |
| H1 | 32 | 38 | 600 | top-level page title |
| H2 | 24 | 30 | 600 | entity section title |
| H3 | 20 | 26 | 600 | card/section title |
| H4 | 17 | 23 | 600 | compact panel title |
| Body L | 16 | 24 | 400 | intro, long content |
| Body M | 14 | 20 | 400 | default interface text |
| Body S | 13 | 18 | 400 | table and compact UI |
| Label M | 13 | 16 | 500 | buttons, fields, filters |
| Label S | 12 | 15 | 500 | metadata, badges |
| Caption | 11 | 14 | 500 | secondary technical metadata |
| Numeric XL | 32 | 36 | 600 | KPI |
| Numeric M | 16 | 20 | 600 | totals |

## 4.4. Tablet scale

- H1: 28/34;
- H2: 22/28;
- H3: 18/24;
- Body M: 14/20;
- Body S: 13/18;
- Button/label: 13/16.

## 4.5. iPhone scale

| Token | Size / line-height |
|---|---|
| Display | 32/38 |
| H1 | 26/32 |
| H2 | 21/27 |
| H3 | 18/24 |
| Body L | 16/23 |
| Body M | 15/21 |
| Body S | 13/18 |
| Label | 13/16 |
| Caption | 11/14 |

Input font on iPhone must be at least 16 px to prevent browser auto-zoom.

## 4.6. Type rules

- max readable prose width: 680 px;
- headings use sentence case;
- no all caps except tiny category labels up to 11 px;
- numeric values use tabular numbers;
- price and order totals use `font-variant-numeric: tabular-nums`;
- long names truncate to one line only in registries;
- entity pages allow two-line titles;
- helper text never smaller than 12 px desktop or 13 px mobile.

---

# 5. Spacing, grid and dimensions

## 5.1. Base spacing scale

4 px base unit.

```text
0     0
1     4
2     8
3     12
4     16
5     20
6     24
8     32
10    40
12    48
16    64
20    80
24    96
```

Использовать только эту шкалу.

## 5.2. Page gutters

```text
iPhone               16 px
iPhone landscape     20 px
iPad portrait        24 px
iPad landscape       28 px
MacBook              32 px
Desktop 1600+        40 px
Fullscreen 1920+     48 px
```

## 5.3. Content max widths

```text
Default entity content          1440 px
Editorial content               1600 px
Form content                    760 px
Readable prose                  680 px
Settings content                960 px
Dashboard grid                  1600 px
Order Builder                   no fixed max; fills available width
```

At widths above max, content is centred. App navigation remains aligned to viewport.

## 5.4. Grid columns

```text
iPhone:              4 columns, 12 px gutter
iPad portrait:       8 columns, 16 px gutter
iPad landscape:      12 columns, 20 px gutter
Desktop:             12 columns, 24 px gutter
Desktop 1920+:       16 columns, 24 px gutter
```

## 5.5. Vertical rhythm

- page header to content: 24 px desktop, 20 px tablet, 16 px mobile;
- major section gap: 40 px desktop, 32 px tablet, 28 px mobile;
- card group gap: 16 px;
- dense table group gap: 12 px;
- form field gap: 16 px;
- label to input: 6 px;
- section title to description: 6–8 px.

---

# 6. Corners, borders and elevation

## 6.1. Radius

```text
xs      4 px   checkbox, tiny indicator
sm      6 px   input, compact button, badge
md      8 px   default button, table container
lg      12 px  cards, panel, drawer content
xl      16 px  editorial cards, mobile sheet
round   999 px avatar, pill only
```

Do not use 20–32 px rounded enterprise cards.

## 6.2. Borders

Default borders are 1 px.

- cards: subtle border;
- tables: row dividers, not boxes around every cell;
- selected: strong border + soft surface;
- focus: 2 px focus ring outside component;
- destructive: red border only after validation or explicit destructive context.

## 6.3. Shadows

```text
Elevation 0: none
Elevation 1: 0 1px 2px rgba(17,17,16,.05)
Elevation 2: 0 8px 24px rgba(17,17,16,.08)
Elevation 3: 0 16px 40px rgba(17,17,16,.12)
```

Usage:

- cards: elevation 0 or 1;
- sticky bars: elevation 1;
- dropdown/popover: elevation 2;
- modal/drawer: elevation 3.

---

# 7. App Shell by device

## 7.1. MacBook / desktop shell

Viewport 1280 px+:

```text
┌─────────────────────────────────────────────────────┐
│ Left navigation │ Top context bar                   │
│ 240 px          ├───────────────────────────────────┤
│                 │ Page / workspace content          │
│                 │                                   │
└─────────────────────────────────────────────────────┘
```

Dimensions:

- sidebar expanded: 240 px;
- sidebar collapsed: 72 px;
- top context bar: 56 px;
- page header: 72–104 px depending on template;
- sidebar item height: 40 px;
- sidebar horizontal padding: 12 px;
- icon size: 18 px;
- navigation text: 13/18 medium;
- nested item indent: 28 px.

Sidebar groups:

1. organisation switcher;
2. primary navigation;
3. recent/pinned context where relevant;
4. bottom utilities: help, settings, profile.

No more than 8 primary navigation items visible at once. Secondary areas are grouped.

## 7.2. Fullscreen desktop 1600–2560 px

Sidebar remains 240 px. It must not grow.

Content behaviour:

- registries max 1600 px and centre;
- showroom may fill width;
- Order Builder fills all available width;
- dashboard may use 16-column grid;
- right inspector can be 360–420 px;
- no giant empty margins between sidebar and content.

## 7.3. iPad landscape

- sidebar: 224 px when persistent;
- at 1024 px, sidebar can collapse to 64 px;
- top bar: 56 px;
- split view preferred;
- inspector width: 320 px;
- minimum touch target: 44 × 44 px;
- table density remains standard, not desktop compact.

## 7.4. iPad portrait

Navigation becomes icon rail + overlay menu or a modal navigation sheet.

Canonical structure:

```text
Top bar 56 px
Context breadcrumb / title
Main content
Optional right panel as overlay drawer
Bottom contextual action bar where needed
```

- no persistent 240 px sidebar;
- filters open in left sheet;
- details open in right sheet;
- two-column cards only where card min width ≥280 px;
- Order Builder uses step/split mode.

## 7.5. iPhone

Navigation:

- top app bar: 52 px;
- no desktop sidebar;
- bottom navigation: 56 px + safe area;
- maximum 5 bottom destinations;
- role-specific destinations;
- secondary pages through `More` or entity navigation;
- back button always visible for nested context.

Recommended Brand bottom navigation:

```text
Home / Campaigns / Collections / Orders / More
```

Recommended Shop bottom navigation:

```text
Home / Brands / Buying / Orders / More
```

Calendar, messages, documents and settings live in More unless they have unread/urgent state.

Mobile header:

- title max 2 lines;
- one primary icon action in header;
- additional actions in overflow menu;
- sticky bottom CTA for critical create/submit flows.

---

# 8. Universal screen templates

Only these top-level templates are allowed.

## 8.1. Registry Template

Used for campaigns, collections, buyers, brands, orders, documents.

Desktop:

```text
Page header
Toolbar: search / filters / view / primary action
Optional summary strip
Table or card grid
Pagination / infinite loading
```

Mobile:

```text
Compact header
Search field
Filter chips / filter sheet
List cards
Sticky create button when permitted
```

Rules:

- one primary action;
- search always leftmost;
- filters between search and view controls;
- bulk action bar replaces toolbar after selection;
- table/grid preference persists per user.

## 8.2. Entity Template

Used for Campaign, Collection, Order, Buyer, Brand, Appointment.

Desktop:

```text
Breadcrumb
Entity header: title, status, metadata, primary action
Tabs / section navigation
Main content + optional 320–380 px inspector
```

Entity Header dimensions:

- min height: 88 px;
- title: H1;
- metadata: 13/18;
- actions aligned right;
- status near title, not floating elsewhere.

Mobile:

- breadcrumb becomes back button;
- actions collapse to primary + overflow;
- tabs become horizontal scroll or section picker;
- inspector becomes bottom sheet.

## 8.3. Builder Template

Used for Order Builder, Presentation Editor and complex setup.

Desktop Order Builder:

```text
Source rail      Work canvas / matrix             Summary inspector
240–280 px       min 640 px                       320–380 px
```

At 1180–1365 px:

- source rail collapsible 64/240 px;
- inspector 320 px;
- central matrix remains priority.

Tablet:

```text
Top segmented mode: Products / Order / Summary
One primary work area at a time
Persistent compact totals bar
```

Mobile:

```text
Step 1 Select products
Step 2 Enter quantities
Step 3 Delivery and terms
Step 4 Review
```

Mobile must never display a squeezed desktop matrix.

## 8.4. Showroom Template

Buyer-facing.

Desktop:

- minimal chrome;
- brand/collection header 64 px;
- editorial hero can use 60–75vh;
- persistent selection tray on right or bottom;
- quick product details in 420 px inspector;
- fullscreen image view.

Tablet:

- image-first;
- inspector as right drawer;
- selection tray as bottom panel.

Mobile:

- one-column story;
- two-column product grid where image width ≥156 px;
- product detail fullscreen;
- sticky `Add to selection` button;
- selection total visible in bottom bar.

## 8.5. Split Communication Template

Used for DealSpace and Messages.

Desktop:

```text
Conversation list 280 px
Thread flexible
Context inspector 320 px optional
```

Tablet portrait:

- conversation list → thread drill-in;
- context inspector as sheet.

Mobile:

- full-screen list;
- full-screen thread;
- attachments/context via secondary screen.

---

# 9. Buttons

## 9.1. Button sizes

| Size | Height | Horizontal padding | Icon | Text |
|---|---:|---:|---:|---|
| XS | 28 | 10 | 14 | 12/15 |
| S | 32 | 12 | 16 | 13/16 |
| M | 40 | 16 | 18 | 13/16 |
| L | 48 | 20 | 20 | 14/18 |

Default desktop button: M.
Default mobile button: L for forms/CTA, M for toolbar.

Minimum touch target is 44 px even when visual button is 32–40 px.

## 9.2. Button variants

Allowed:

- Primary;
- Secondary;
- Tertiary;
- Quiet/Icon;
- Destructive;
- Link.

Primary:

- dark accent background;
- white text;
- one per screen region;
- cannot be used for low-frequency action.

Secondary:

- white/neutral surface;
- default border;
- primary text.

Tertiary:

- transparent;
- no border;
- used in toolbars.

Destructive:

- neutral by default in overflow;
- red only in confirmation or destructive action area.

## 9.3. Button layout

- action group gap: 8 px;
- primary action rightmost desktop;
- primary action bottom/full-width on mobile only when critical;
- icon precedes label except forward/proceed arrow;
- icon-only buttons require tooltip desktop and accessible label.

---

# 10. Inputs and forms

## 10.1. Input sizes

```text
Desktop standard        40 px
Desktop compact         32 px
Mobile                   48 px
Textarea min             96 px
Search field desktop     40 px
Search field mobile      44–48 px
```

## 10.2. Form widths

- short field: 160–240 px;
- medium field: 280–360 px;
- long field: 480–640 px;
- full form max: 760 px;
- mobile: 100% width.

## 10.3. Form layout

Desktop:

- simple settings: 2-column label/content layout;
- creation wizard: 1-column content max 760 px;
- related short fields can share row;
- no more than 3 fields per row.

Mobile:

- one field per row;
- labels above inputs;
- sticky next/save only for multi-step flows.

## 10.4. Validation

- inline message below field;
- error icon optional;
- invalid field border red;
- summary at top only when 3+ errors or submission blocked;
- preserve entered values;
- validation language explains how to fix.

---

# 11. Cards

## 11.1. Default card

- background white;
- 1 px subtle border;
- radius 12 px;
- padding 16 px compact / 20 px standard / 24 px editorial;
- shadow none or elevation 1;
- title H3/H4;
- action menu top-right.

## 11.2. Product card

Aspect ratios:

- fashion product: 3:4 default;
- look/editorial: 4:5 or 2:3;
- campaign cover: 16:9 or 3:2.

Desktop product grid:

```text
1280 px: 4 columns
1440 px: 5 columns
1600 px: 5–6 columns
1920 px: 6 columns
```

Minimum product card width: 208 px desktop, 156 px mobile.

Card content:

1. image;
2. badges overlay top-left;
3. favourite/select action top-right;
4. style name/code;
5. category/colour metadata;
6. wholesale price;
7. delivery/MOQ concise row;
8. selected quantity/value if applicable.

Do not display more than 3 badges simultaneously.

## 11.3. KPI card

- min width 220 px;
- value 28–32 px;
- label 13 px;
- comparison 12 px;
- no oversized illustrations;
- one metric per card.

## 11.4. Mobile list card

Height depends on content, minimum 80 px.

- thumbnail 64–80 px;
- primary text max 2 lines;
- metadata 1–2 lines;
- right-side status/action;
- entire card tappable.

---

# 12. Tables and linesheets

## 12.1. Table dimensions

```text
Header height standard      40 px
Row height compact          36 px
Row height standard         44 px
Row height comfortable      52 px
Cell horizontal padding     12 px
First/last cell padding     16 px
```

## 12.2. Table behaviour

- sticky header;
- first identity column sticky in wide tables;
- columns resize desktop P1;
- column visibility control;
- density determined by screen template;
- selected row uses soft accent surface;
- hover only desktop;
- sorting indicator always visible when active;
- numeric columns right-aligned;
- status and dates centre/left consistently;
- no zebra striping by default.

## 12.3. iPhone table adaptation

Tables do not scroll horizontally unless the data is genuinely matrix-like.

Convert registry table to list cards.

For size matrix:

- horizontal scroll is allowed;
- product identity column sticky;
- current cell highlighted;
- zoom not required;
- quantity input at least 44 × 44 px.

---

# 13. Icons and imagery

## 13.1. Icon family

Use one icon library only. Recommended: Lucide.

Sizes:

```text
14 px metadata
16 px compact control
18 px default navigation/action
20 px mobile action
24 px empty state / prominent action
32–40 px empty state illustration icon
```

Stroke width: 1.75–2 px.

Do not mix filled and outline families except semantic status icons.

## 13.2. Icon placement

- navigation icon before label;
- input icon left;
- chevron right for drill-in;
- close icon top-right modal/sheet;
- status icon before label;
- icon-only action always 40/44 px interaction box.

## 13.3. Product media

- preserve original crop option;
- default object fit contain for clean packshot;
- cover for editorial images;
- neutral image background #F2F1ED when source has transparency;
- skeleton preserves exact aspect ratio;
- thumbnails never stretch.

---

# 14. Navigation and location awareness

Every screen must answer:

1. Which organisation am I in?
2. Which role/context am I using?
3. Which campaign/collection/order am I in?
4. What is the current status?
5. What is the next primary action?

Desktop:

- breadcrumbs only for 2+ nested levels;
- sidebar item active state;
- entity tabs local to entity;
- campaign context visible in top bar where relevant.

Mobile:

- back label may show parent name;
- no more than one row of tabs;
- more tabs in selector sheet;
- current entity status under title.

---

# 15. Modals, drawers and sheets

## 15.1. Modal

Use for:

- confirmation;
- short focused create/edit;
- destructive confirmation.

Sizes:

```text
S  400 px
M  560 px
L  720 px
XL 960 px
```

Modal max height: 88vh.

## 15.2. Right drawer

Used for quick preview, filters, product details, context.

```text
Desktop default  400 px
Wide              520 px
Tablet            360 px or 70vw
```

## 15.3. Mobile bottom sheet

- radius 16 px top corners;
- max height 92vh;
- drag handle optional;
- sticky header/footer;
- full-screen sheet for long forms.

Do not open modal over modal. Use navigation or replace current sheet.

---

# 16. Calendar visual rules

Desktop:

- left filter rail optional 240 px;
- month/week/day/agenda switcher;
- toolbar 48 px;
- week time column 64 px;
- minimum event height 24 px;
- event colour based on type, not participant;
- selected event opens 360–400 px inspector.

iPad:

- week/day preferred;
- filters in sheet;
- event inspector overlay.

Mobile:

- agenda default;
- day view secondary;
- month shows dots/counts, not squeezed text;
- create appointment via full-screen form.

Event type styling:

```text
Appointment          accent green
Campaign milestone   muted blue
Order deadline       amber
Industry event       violet-grey
Internal task        neutral grey
Blocked/overdue      red
```

---

# 17. Chat and DealSpace visual rules

## 17.1. Message thread

- thread max readable width: 760 px;
- brand and shop messages are not bright opposite colour bubbles;
- use subtle neutral surfaces;
- sender name, role and organisation visible in group contexts;
- message text 14/20 desktop, 15/21 mobile;
- attachments use standard file cards;
- system events use centred timeline rows;
- unread divider is semantic accent line.

## 17.2. Composer

Desktop min height 48 px, mobile 52 px.

Contains:

- attachment;
- message input;
- mention support;
- send;
- contextual entity link;
- task conversion in overflow.

## 17.3. Entity context

Thread header displays:

- counterparty;
- campaign/order context;
- status;
- appointment/order quick links.

No context-free global chat thread for core deal communication.

---

# 18. Order Builder visual specification

Order Builder is the highest-priority functional screen.

## 18.1. Desktop layout

```text
Top bar: order identity, autosave, collaborators, actions — 56 px
Source rail — 256 px
Matrix workspace — flexible
Summary inspector — 352 px
Bottom validation/status bar — 40 px when needed
```

Matrix:

- product group header 48 px;
- colour row 40 px;
- size header 36 px;
- quantity cell 44 × 40 px minimum;
- sticky product identity 240 px;
- sticky totals on right;
- wholesale/value totals use tabular numbers;
- warning icons inline, not full-row red.

## 18.2. Visual hierarchy

1. quantity matrix;
2. line/product totals;
3. delivery and MOQ warnings;
4. order total/budget;
5. secondary product data.

Product imagery in matrix is optional 40–48 px thumbnail, not dominant.

## 18.3. iPad mode

- products/source in slide-over;
- matrix full width;
- summary as bottom/right sheet;
- sticky totals bar;
- keyboard navigation supported with hardware keyboard;
- touch quantity editing opens numeric keypad/editor.

## 18.4. iPhone mode

No full matrix.

Per-product editor:

```text
Product header/image
Colour tabs
Size quantity grid 2–4 columns
Delivery selector
Line total
Previous / Next product
```

Persistent order summary bar:

- units;
- value;
- validation count;
- Review CTA.

---

# 19. Showroom visual specification

## 19.1. Editorial opening

- hero image/video;
- collection title Display L/XL;
- season/drop label;
- concise intro max 3 lines;
- `Explore collection` primary action;
- brand identity visible but not oversized.

## 19.2. Product exploration

Buyer can switch:

- Story;
- Looks;
- Grid;
- Linesheet.

Switch is compact segmented control, not four large tabs.

## 19.3. Product detail

Desktop split:

```text
Media 60–65%
Commercial detail 35–40%
```

Commercial panel includes:

- style name/code;
- category;
- wholesale and suggested retail;
- margin if allowed;
- colour selector;
- size range;
- delivery;
- MOQ/pack;
- notes;
- Add to selection.

Mobile:

- media carousel first;
- detail beneath;
- sticky add action;
- content sections collapse only when long.

---

# 20. Responsive behaviour rules

## 20.1. Reflow before shrink

When width decreases:

1. reduce gutters;
2. reduce columns;
3. collapse secondary rails;
4. move inspector to drawer/sheet;
5. switch table to list;
6. switch builder to step mode.

Never reduce text below tokens or compress controls below touch target.

## 20.2. Priority order

Always preserve:

1. primary content;
2. primary action;
3. status/context;
4. critical totals/validation;
5. navigation.

May collapse:

- secondary metadata;
- tertiary actions;
- optional insights;
- decorative media.

## 20.3. Safe areas

On iPhone/iPad respect:

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

Sticky bottom bars include safe-area padding.

---

# 21. Motion and interaction

## 21.1. Durations

```text
Instant feedback       80–120 ms
Hover/focus            120–160 ms
Dropdown/popover       140–180 ms
Drawer/sheet           220–280 ms
Page transition        180–240 ms
```

Easing:

```css
--ease-standard: cubic-bezier(.2,.8,.2,1);
--ease-exit: cubic-bezier(.4,0,1,1);
```

## 21.2. Motion rules

- no parallax in working screens;
- no bouncing controls;
- no decorative loading animations;
- respect `prefers-reduced-motion`;
- optimistic actions show immediate state plus save status;
- success confirmation is subtle and short.

---

# 22. Accessibility

Minimum:

- WCAG AA contrast;
- text contrast 4.5:1;
- large text 3:1;
- focus visible on all interactive elements;
- keyboard navigation desktop;
- logical tab order;
- no hover-only actions;
- 44 px mobile touch targets;
- semantic headings;
- labels for inputs;
- status not colour-only;
- screen-reader labels for icon buttons;
- reduced motion support.

Product imagery requires alt text or marked decorative.

---

# 23. Canonical design tokens

Initial token structure:

```ts
export const tokens = {
  color: {
    canvas: '#F6F5F2',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F0EC',
    surfaceSelected: '#ECEAE4',
    borderSubtle: '#E5E2DC',
    border: '#D8D4CC',
    borderStrong: '#B9B4AA',
    text: '#171716',
    textSecondary: '#5F5D58',
    textTertiary: '#858179',
    textDisabled: '#AAA59C',
    accent: '#263F3A',
    accentHover: '#1E332F',
    accentSoft: '#E4ECE9',
    focus: '#54756D',
  },
  radius: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, round: 999 },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96 },
  control: { xs: 28, sm: 32, md: 40, lg: 48 },
  shell: { sidebar: 240, sidebarCollapsed: 72, topbar: 56, inspector: 360 },
};
```

Cursor must not hardcode colour or spacing values directly in feature components.

---

# 24. Required component states

Every component must define:

- default;
- hover where supported;
- active/pressed;
- focus-visible;
- selected;
- disabled;
- loading;
- error where applicable.

Every screen must define:

- loading skeleton;
- initial empty;
- no search results;
- permission denied;
- offline/retry;
- server error;
- validation error;
- success feedback;
- stale/conflict state where relevant.

---

# 25. Cursor implementation rules

Cursor must:

1. Create tokens before feature pages.
2. Implement canonical primitives before module-specific UI.
3. Use responsive templates, not per-page custom media queries.
4. Test at 390, 768, 1024, 1280, 1440, 1920 px.
5. Add visual regression stories/screenshots for canonical components.
6. Use semantic tokens only.
7. Keep ProductCard, EntityHeader, DataTable, BuilderShell and AppShell single-source.
8. Never introduce a new radius, spacing or font size without updating this document.
9. Never solve mobile by hiding essential functionality.
10. Never ship a desktop-only matrix for iPhone.

---

# 26. Acceptance criteria for visual foundation

The visual foundation is complete only when:

- all tokens exist in code;
- Storybook or equivalent component catalogue exists;
- AppShell works at all required widths;
- Registry, Entity, Builder, Showroom and Split Communication templates exist;
- buttons, inputs, cards, table, navigation, modal, drawer and sheet are implemented;
- keyboard and focus states work;
- iPhone/iPad safe areas work;
- no feature component contains raw HEX values;
- no feature component contains arbitrary spacing classes outside token map;
- screenshots at 390/768/1024/1440/1920 pass design review;
- visual language remains identical across Brand and Shop.
