# 09 — Canonical Component Library

## Цель

У Syntha Wholesale V2 не должно быть локальных версий кнопок, таблиц, карточек, фильтров и заголовков. Cursor обязан использовать этот реестр и не создавать новый визуальный паттерн без изменения данного документа.

## 1. Layout components

### AppShell

- единый shell для Brand и Shop;
- левая глобальная навигация;
- top bar с organization, search, notifications, profile;
- одинаковая ширина и плотность во всех разделах;
- responsive: desktop и iPad landscape;
- mobile не является основным режимом order writing, но базовые сценарии должны быть доступны.

### WorkspaceShell

- title/description;
- breadcrumbs;
- one primary action;
- optional secondary actions;
- content area;
- optional inspector rail;
- states: loading, empty, error, forbidden.

### EntityShell

- entity identity;
- status;
- owner/team;
- contextual metadata;
- tabs;
- activity entry point;
- one primary action.

### BuilderShell

- left source pane;
- center work pane;
- right result/summary pane;
- pane resize rules;
- keyboard navigation;
- sticky totals/actions;
- iPad collapse rules.

### CollaborationSplit

- entity/thread navigation;
- active conversation/content;
- attachments/tasks/activity inspector;
- persistent context header.

## 2. Navigation components

### GlobalSidebar

- Brand menu and Shop menu use the same component;
- icons from one icon set;
- active state through tokens;
- collapsed mode is allowed only for narrow desktop;
- no nested navigation deeper than two levels.

### WorkspaceTabs

- horizontal tabs;
- no more than seven visible tabs;
- extra tabs move to `More`;
- active tab persists in URL;
- tabs must not be used for actions.

### Breadcrumbs

- maximum four levels;
- long entities are truncated;
- every segment except current is navigable.

### EntitySwitcher

- used for Campaign / Collection / Order contexts;
- preserves applicable filters and buyer context;
- never silently resets draft data.

## 3. Action components

### PrimaryButton

- one per screen or focus area;
- height 36px desktop/iPad;
- full width only on narrow layouts;
- loading and success states required;
- destructive actions cannot be primary by default.

### SecondaryButton

- visible supporting actions;
- neutral outline or subtle surface;
- no more than three next to primary.

### GhostButton

- tertiary navigation or low-priority command;
- must not compete with primary action.

### DestructiveButton

- deletion/cancellation only;
- requires confirm dialog when effect is irreversible.

### ActionMenu

- contains rare actions;
- labels are verbs;
- actions ordered by frequency, destructive at bottom.

### StickyActionBar

- used in Order Builder and approval screens;
- shows validation state, totals and primary action;
- must not cover content.

## 4. Data display

### DataTable

Mandatory capabilities:

- sortable columns;
- filters;
- saved views P1;
- row selection;
- bulk action bar;
- sticky header;
- keyboard row navigation;
- empty/loading/error states;
- server pagination or cursor pagination;
- responsive column priority;
- column visibility settings P1.

Forbidden:

- hand-written `<table>` per feature;
- different row heights per module;
- action buttons in every column without an overflow menu.

### MetricCard

- one metric, one comparison, optional sparkline;
- no decorative dashboard cards without action or interpretation.

### StatusBadge

Canonical status tones:

- neutral;
- info;
- progress;
- success;
- warning;
- danger.

Status color is determined centrally, not inside a feature.

### Timeline

- chronological events;
- actor, action, object, timestamp;
- compact default;
- expandable event detail;
- filters by messages/documents/orders/appointments.

### ProductCard

- image ratio controlled by presentation mode;
- product identity;
- wholesale price;
- delivery/MOQ summary;
- color count;
- favorite/selection action;
- quick view entry;
- no more than two visible actions.

### LookCard

- editorial image;
- linked products count;
- add look to selection/order;
- open look detail.

## 5. Forms

### FormField

- label;
- help text;
- validation;
- required indicator;
- consistent spacing;
- no placeholder as the only label.

### MoneyField

- amount + currency;
- locale-aware formatting;
- numeric keyboard behavior;
- precision rules from currency config.

### QuantityField

- keyboard-first;
- integer validation;
- zero/empty semantics explicit;
- optional increment controls.

### DateRangeField

- campaign dates;
- delivery windows;
- appointment scheduling;
- timezone displayed when relevant.

### SizeColorMatrix

- sticky size and color axes;
- keyboard traversal;
- paste from spreadsheet P1;
- row/column totals;
- validation and conflict highlighting;
- responsive iPad zoom/scroll behavior.

## 6. Filters and search

### FilterBar

- query/search;
- most-used quick filters;
- advanced filter drawer;
- active filter chips;
- clear all;
- result count.

### SearchInput

- debounced server search;
- clear command;
- keyboard shortcut `/`;
- optional scoped search selector.

### SavedViewSelector

P1:

- personal views;
- team views;
- default view;
- share and duplicate.

## 7. Feedback and states

### EmptyState

Exactly:

- title;
- reason/context;
- one next action;
- optional compact help link.

No large decorative illustration in operator workspaces.

### LoadingState

- skeleton matches final geometry;
- no full-page spinner for table/entity pages;
- button-level loading for mutations.

### ErrorState

- human-readable cause;
- retry action;
- reference ID for support when server error;
- user data must not be lost.

### Toast

- mutation confirmation only;
- never replaces validation or blocking error;
- auto-dismiss except errors requiring action.

### ConfirmDialog

- states consequence;
- requires explicit destructive label;
- no generic `Are you sure?`.

## 8. Collaboration components

### ChatThread

- context header;
- messages;
- replies/threads P1;
- mentions;
- attachments;
- create task from message P1;
- link to entity;
- read state.

### MessageComposer

- text;
- mention picker;
- attachment upload;
- link entity;
- send shortcut;
- draft persistence.

### AttachmentPanel

- files grouped by context;
- type, owner, timestamp, status;
- preview/download;
- permission-aware actions.

### TaskPanel

- title;
- assignee;
- due date;
- status;
- linked entity/message;
- compact list and detail drawer.

### ActivityFeed

- messages;
- files;
- appointments;
- order changes;
- publication events;
- filters and pagination.

## 9. Calendar components

### CalendarView

- month/week/agenda;
- campaign, appointment and deadline events;
- timezone-aware;
- role-based color categories;
- drag rescheduling P1.

### AppointmentCard

- brand/shop participants;
- campaign/collection;
- time and timezone;
- location/video link;
- status;
- prepare/start/reschedule actions.

### AvailabilityPicker

- mutual availability;
- timezone conversion;
- propose multiple slots;
- accept/decline/suggest another time.

## 10. Showroom components

### PresentationCanvas

- grid/look/editorial modes;
- chapter navigation;
- presenter mode;
- buyer interaction state;
- full screen;
- product quick view.

### BuyerPreviewFrame

- renders exact buyer-visible experience;
- buyer/price-list selector;
- locale/currency selector;
- no edit controls.

### PublishReviewPanel

- readiness checklist;
- visibility audience;
- price list coverage;
- missing media/data;
- release note;
- single Publish action.

## 11. Order Builder components

### ProductSourcePane

- collection search/filter;
- categories/chapters/looks;
- selected state;
- quick add.

### OrderWorkPane

- lines grouped by product/look/delivery;
- size-color matrix;
- inline notes;
- validation badges.

### OrderSummaryPane

- quantities;
- value;
- budget;
- currency;
- delivery split;
- MOQ/pack conflicts;
- review action.

### ValidationPanel

- blocking vs warning issues;
- link to affected line;
- explain resolution;
- no hidden validation after submit.

## 12. Component definition of done

A component is canonical only when it has:

- documented props and states;
- Storybook or equivalent isolated examples;
- keyboard behavior;
- accessibility attributes;
- responsive examples;
- tests for core states;
- no imports from legacy Syntha UI;
- design token usage only;
- ownership in `docs/09_COMPONENT_LIBRARY.md`.
