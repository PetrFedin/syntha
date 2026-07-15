# 04 — UX Constitution

## 1. Цель

Платформа должна быть мощной, но не выглядеть сложной. Пользователь изучает один набор паттернов и применяет его ко всем разделам.

Главный критерий: за 5 секунд пользователь понимает:

- где он находится;
- с какой сущностью работает;
- что изменилось;
- что требует внимания;
- какое действие главное.

---

# 2. Три разрешённых типа экранов

## 2.1 Workspace

Для реестров и ежедневной работы.

```text
Workspace Header
Saved Views / Filters
Table or Gallery
Inspector / Drawer
```

Примеры: Campaigns, Collections, Buyers, Orders, Documents.

## 2.2 Entity Page

Для конкретной сущности.

```text
Breadcrumb
Entity Header + Status + Primary CTA
Tabs
Main content
Context rail (only when useful)
```

Примеры: Campaign, Collection, Order, Appointment, DealSpace.

## 2.3 Builder

Для сложного создания результата.

```text
Source rail
Working canvas
Result / totals inspector
Sticky action layer
```

Примеры: Showroom Composer, Selection Builder, Order Builder.

Другие базовые layout-паттерны запрещены без ADR.

---

# 3. Глобальный chrome

## 3.1 Desktop

- Persistent left navigation.
- Compact top bar.
- Main content uses full available width with sensible max-width per screen type.
- No nested full application shells.
- No duplicate page headers.

## 3.2 iPad landscape

- Left navigation can collapse to icons.
- Builder remains three-pane where space permits; source rail may become drawer.
- Primary action and totals remain visible.

## 3.3 Mobile

- Review, communication, quick selection and light quantity editing are supported.
- Complex full-size matrix is not squeezed into unreadable layout.
- Builder panels become sequential steps/drawers.
- Bottom navigation has maximum five destinations.

---

# 4. Navigation rules

- Global menu: maximum 9 visible items.
- Entity tabs: maximum 8 visible items; secondary tabs go into `More`.
- Breadcrumb depth: maximum 4.
- Back navigation must preserve filters, scroll and draft state.
- No navigation link may target a legacy Syntha screen.
- Cross-context links must show destination context.
- Current organisation, role and campaign context are always visible.

---

# 5. Action hierarchy

## 5.1 Primary

- Exactly one per screen.
- Represents the next most important business action.
- Examples: Publish Showroom, Start Order, Submit Order, Confirm Order.

## 5.2 Secondary

- Maximum 2–3 visible near Primary.
- Examples: Preview, Share, Export.

## 5.3 Tertiary

- Text/ghost actions for navigation or low-risk utility.

## 5.4 Destructive

- Never visually competes with Primary.
- Lives in overflow or dedicated danger zone.
- Requires confirmation and reason when business-relevant.

Button rules:

- No arbitrary heights.
- No full-width desktop button unless used in a narrow inspector.
- Labels use verbs: `Publish`, `Submit order`, `Invite shops`.
- Never use vague labels such as `Continue` when the result is known.

---

# 6. Density and spacing

The product is an operational B2B tool, not a marketing website.

- Default density: compact-comfortable.
- Large hero spacing is allowed only in showroom presentation, not administration.
- Tables and matrices prioritise data visibility.
- Cards are used only when grouping adds meaning.
- Avoid card-inside-card nesting.
- Empty whitespace must clarify hierarchy, not waste screen area.

Suggested spacing scale:

```text
2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48
```

Allowed layout gaps:

- controls: 4–8;
- section internals: 8–12;
- section separation: 16–24;
- page regions: 24–32.

---

# 7. Typography

Canonical roles:

- Display: rare, showroom/campaign presentation only.
- Page title.
- Entity title.
- Section title.
- Body.
- Compact body/table.
- Caption/meta.
- Numeric/tabular.

Rules:

- No arbitrary `text-[Npx]` in feature code.
- Numeric totals use tabular numerals.
- Status text cannot rely on colour alone.
- Product names and identifiers have distinct hierarchy.
- Long labels truncate only when full value is available via tooltip/details.

---

# 8. Colour and tokens

Semantic token groups:

```text
background.page
background.surface
background.subtle
text.primary
text.secondary
text.muted
border.default
border.strong
accent.primary
status.success
status.warning
status.danger
status.info
focus.ring
```

Rules:

- Feature code never uses `slate-*`, `gray-*`, raw hex or arbitrary opacity for core UI.
- Showroom content may use brand-controlled presentation palettes inside isolated canvas.
- Operational chrome always uses platform tokens.
- Status colours are consistent across all modules.

---

# 9. Status language

Statuses must be business-readable.

Bad:

- `processing_2`
- `ready_flag`
- `pending_state`

Good:

- Draft
- Ready to publish
- Published
- Awaiting shop review
- Submitted
- Changes requested
- Confirmed

Every status has:

- label;
- explanation;
- allowed next actions;
- semantic tone;
- timestamp where relevant.

---

# 10. Data tables

One canonical `DataTable` component.

Mandatory capabilities:

- column definitions;
- sorting;
- filtering;
- search integration;
- saved views;
- row selection;
- bulk actions;
- sticky header;
- optional sticky identity column;
- density modes;
- loading rows;
- empty/no-results/error states;
- keyboard focus;
- responsive column priorities;
- export where permitted.

Rules:

- No ad-hoc HTML tables in features.
- Row click and row actions must not conflict.
- Primary identity is leftmost.
- Status and next action are visible without horizontal scrolling when possible.

---

# 11. Gallery and product cards

One canonical product card with presentation variants:

- compact grid;
- showroom editorial;
- selection card;
- order source card.

Shared data contract:

- media;
- style code;
- name;
- colour count;
- wholesale price;
- delivery;
- availability;
- selection state;
- note/comment indicator.

Card actions are contextual and never duplicated in multiple corners.

---

# 12. Forms

- Labels are always visible; placeholder is not a label.
- Required fields are explicit.
- Validation occurs on blur and submit, not on every keystroke when distracting.
- Error message explains correction.
- Long forms use sections and sticky progress/navigation.
- Autosave state is visible for drafts.
- Unsaved changes are protected.
- Server errors are rendered near affected scope and in summary when needed.

---

# 13. Builders

## 13.1 Persistent context

Builder always shows:

- current campaign/collection/order;
- current totals;
- validation state;
- save state;
- primary action.

## 13.2 Order Builder

- Quantity editing must be faster with keyboard than with mouse.
- User can paste tabular quantities.
- Invalid MOQ/pack is explained inline.
- Totals update immediately.
- Selection, budget and delivery effects are visible.
- Undo/redo is mandatory.
- Autosave is mandatory.
- Full-screen mode is allowed.

## 13.3 Showroom Composer

- Canvas preview and configuration are separated.
- Drag/reorder is accessible through keyboard alternative.
- Preview supports buyer context.
- Publish readiness is always visible.

---

# 14. Showroom presentation

Showroom is the only area allowed to feel editorial and immersive.

Rules:

- Brand story never hides commercial information for buyers.
- Selection tray remains accessible.
- Product navigation is predictable.
- Buyer can switch between editorial, grid and linesheet without losing state.
- Media loads progressively.
- Video never autoplays with sound.
- All presentation blocks have accessible alternatives.

---

# 15. Collaboration

## 15.1 Shared vs private

Every note/comment/file clearly displays visibility:

- Private to me;
- Internal to my organisation;
- Shared with Brand/Shop.

Default must be safe and predictable.

## 15.2 Mentions

- Mention suggestions respect permissions.
- Mentioned user receives notification.
- Mention works in chat, comments and task descriptions.

## 15.3 Activity

Activity Timeline combines events without becoming noise.

- Important business events are prominent.
- Low-level technical events are hidden.
- Filters by messages, meetings, files, tasks and order changes.

---

# 16. Calendar and appointments

- Time zone is always explicit when participants differ.
- Reschedule is a proposal, not a silent overwrite.
- Appointment card shows campaign, collection, participants and status.
- Live room has one surface for showroom, selection, notes and chat.
- After completion, summary and next actions are visible.

---

# 17. Empty, loading and error states

## 17.1 Empty state

Must include:

- what is empty;
- why it is empty;
- exactly one next action;
- optional short supporting link.

No decorative illustration is required in dense workspaces.

## 17.2 No results

- Keeps active filters visible.
- Offers `Clear filters`.
- Does not suggest creating data unless relevant.

## 17.3 Loading

- Skeleton matches final layout.
- Long-running actions show progress when possible.
- Buttons cannot be clicked twice.

## 17.4 Error

- Human-readable message.
- Retry when safe.
- Preserve entered data.
- Correlation/request ID available in details for support.

## 17.5 Conflict

For version conflicts:

- explain that data changed;
- show who/when if known;
- allow refresh/compare/reapply;
- never silently overwrite.

---

# 18. Accessibility

Minimum target: WCAG 2.2 AA.

- Full keyboard operation for navigation and Order Builder.
- Visible focus.
- Screen-reader labels.
- Semantic headings.
- Colour contrast.
- No colour-only status.
- Reduced motion support.
- Touch targets suitable for iPad.
- Accessible drag-and-drop alternative.
- Tables expose headers and row relationships.

---

# 19. Performance UX

Targets for production-like data:

- initial shell interaction fast enough to feel immediate;
- lists virtualised when needed;
- product media responsive and lazy-loaded;
- Order Builder handles large matrices without typing lag;
- autosave does not block editing;
- route transitions preserve state;
- no shared `.next` runtime between unrelated development modes.

---

# 20. Canonical components

Cursor may use only approved primitives:

- AppShell
- PrimaryNav
- WorkspaceHeader
- EntityHeader
- ActionLayer
- Breadcrumbs
- Tabs
- FilterBar
- SavedViewPicker
- DataTable
- ProductCard
- ProductGallery
- StatusBadge
- MetricStrip
- EmptyState
- ErrorState
- Drawer
- Modal
- ConfirmDialog
- Inspector
- ActivityTimeline
- Conversation
- AttachmentPanel
- TaskPanel
- Calendar
- AppointmentCard
- SelectionTray
- MatrixEditor
- TotalsInspector
- ValidationSummary

Any new shared component requires documentation before implementation.

---

# 21. Final UI review checklist

A screen is not ready until reviewers can answer `yes`:

- Is the user role/context obvious?
- Is the entity obvious?
- Is the primary action obvious?
- Is there only one Primary CTA?
- Are all visible buttons working?
- Are loading/empty/error states present?
- Does it use canonical components?
- Does it use semantic tokens only?
- Does it work at 1440, 1280 and iPad landscape?
- Can it be operated by keyboard?
- Is shared/private information clear?
- Does it avoid legacy navigation?
- Is the next step understandable without training?