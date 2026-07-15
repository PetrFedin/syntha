# 05 — Cursor Implementation Roadmap

## 1. Правила выполнения

- Cursor выполняет задачи строго по ID.
- Одновременно активна одна vertical-slice задача, если явно не указано иное.
- Нельзя переходить к следующей фазе при незакрытых P0 defects предыдущей.
- Каждая задача завершается кодом, тестами, документацией и demonstrable route.
- Нельзя создавать demo-only UI без реального read/write path.

Статусы задач:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`

---

# Phase 0 — Repository and Product Boundary

## V2-0001 — Create isolated application boundary

**Status:** TODO

**Goal:** создать независимый application boundary внутри `apps/syntha-wholesale-v2`.

Deliverables:

- локальный package/app configuration;
- route prefix `/wholesale-v2`;
- отдельный source tree;
- отдельные tests;
- запрет прямых legacy imports;
- development command;
- build/typecheck command.

Acceptance criteria:

- приложение запускается независимо от legacy routes;
- `/wholesale-v2` возвращает 200;
- build не требует запуска production/workshop modules;
- boundary guard ловит запрещённый import.

## V2-0002 — Create documentation guard

**Status:** TODO

Deliverables:

- script validates required Product Bible files;
- CI fails if roadmap task references missing specification;
- pull request template includes task ID and acceptance criteria.

## V2-0003 — Create architecture decision log

**Status:** TODO

Create:

```text
docs/adr/
  0001-application-boundary.md
  0002-data-access.md
  0003-ui-system.md
```

---

# Phase 1 — Design System and Application Shell

## V2-0101 — Design tokens

**Status:** TODO

Implement semantic tokens for:

- backgrounds;
- text;
- borders;
- accent;
- statuses;
- spacing;
- typography;
- radius;
- shadows;
- motion;
- breakpoints.

Acceptance criteria:

- no raw slate/gray palette in V2 feature code;
- token documentation exists;
- dark mode is not required for MVP but tokens do not block it.

## V2-0102 — Core UI primitives

**Status:** TODO

Implement:

- Button;
- IconButton;
- Input;
- Select;
- Checkbox;
- Radio;
- Tooltip;
- Popover;
- Dropdown;
- StatusBadge;
- Avatar;
- Tabs;
- Breadcrumbs;
- EmptyState;
- ErrorState;
- Skeleton;
- Toast;
- ConfirmDialog;
- Drawer;
- Modal.

Acceptance criteria:

- Storybook or equivalent component catalogue;
- keyboard and focus states;
- component tests;
- no duplicate primitive implementation.

## V2-0103 — AppShell

**Status:** TODO

Implement unified shell for Brand and Shop:

- desktop sidebar;
- tablet collapsed sidebar;
- top bar;
- organisation context;
- global search placeholder with real command interface;
- notifications entry;
- quick create;
- responsive mobile navigation.

Acceptance criteria:

- same chrome for all V2 routes;
- role-specific nav configuration without separate shells;
- 1440, 1280 and iPad landscape screenshots/tests.

## V2-0104 — Workspace and Entity layouts

**Status:** TODO

Implement:

- WorkspaceLayout;
- EntityPageLayout;
- BuilderLayout;
- WorkspaceHeader;
- EntityHeader;
- ActionLayer;
- FilterBar;
- Inspector.

## V2-0105 — Canonical DataTable

**Status:** TODO

Implement sorting, filters, selection, bulk actions, saved view contract, sticky header, responsive columns and all universal states.

## V2-0106 — Canonical ProductCard and Gallery

**Status:** TODO

Variants:

- grid;
- editorial;
- selection;
- order-source.

---

# Phase 2 — Identity, Organisations and Permissions

## V2-0201 — Authentication boundary

**Status:** TODO

Implement authentication adapter with local development user fixtures.

## V2-0202 — Organisations

**Status:** TODO

Implement Brand and Shop organisation profiles.

## V2-0203 — Memberships and RBAC

**Status:** TODO

Implement baseline roles and permissions from Domain Model.

## V2-0204 — User invitations

**Status:** TODO

Implement invite, accept, resend, revoke, deactivate.

## V2-0205 — Organisation switcher

**Status:** TODO

Required for users with multiple memberships.

---

# Phase 3 — Campaign Foundation

## V2-0301 — Campaign domain and persistence

**Status:** TODO

Implement SalesCampaign aggregate, lifecycle policy, repository port and adapter.

## V2-0302 — Brand Campaign registry

**Status:** TODO

Route:

```text
/wholesale-v2/brand/campaigns
```

Features:

- table;
- filters;
- create;
- duplicate;
- archive;
- saved views foundation.

## V2-0303 — Campaign create/edit flow

**Status:** TODO

Implement identity, dates, currency, team, price list defaults and access model.

## V2-0304 — Campaign entity page

**Status:** TODO

Tabs:

- Overview;
- Collections;
- Buyers;
- Appointments;
- Orders;
- Calendar;
- Documents;
- Activity;
- Analytics;
- Settings.

Initially only Overview and Settings require complete write paths; remaining tabs may render linked empty states tied to scheduled tasks, never fake data.

## V2-0305 — Campaign lifecycle actions

**Status:** TODO

Implement schedule, activate, close, complete, archive with policy reasons.

---

# Phase 4 — Collections and Commercial Catalogue

## V2-0401 — Product commercial model

**Status:** TODO

Implement Product, ProductVariant, SizeScale, PriceList, DeliveryWindow, PackRule.

## V2-0402 — Product import

**Status:** TODO

MVP supports structured CSV/XLSX import with mapping preview and validation.

## V2-0403 — Collection domain and persistence

**Status:** TODO

Implement Collection, CollectionVersion, CollectionProduct, Look and StoryBlock.

## V2-0404 — Collection registry

**Status:** TODO

Implement gallery/table views, filters and create/duplicate/archive.

## V2-0405 — Collection product management

**Status:** TODO

Implement product add/import, ordering, categories, drops, commercial data and bulk edit.

## V2-0406 — Looks editor

**Status:** TODO

Implement create look, media, product anchors/list and ordering.

## V2-0407 — Collection story editor

**Status:** TODO

Implement limited block editor with canonical StoryBlock types.

## V2-0408 — Commercial terms editor

**Status:** TODO

Implement price list, currency, delivery windows, MOQ, packs, deadline and payment-term display.

## V2-0409 — Collection readiness

**Status:** TODO

Implement blocking/warning readiness engine and checklist UI.

## V2-0410 — Collection versioning

**Status:** TODO

Implement immutable published version and draft changes.

---

# Phase 5 — Digital Showroom

## V2-0501 — Showroom Composer shell

**Status:** TODO

Builder layout:

- blocks/source rail;
- preview canvas;
- settings/readiness inspector.

## V2-0502 — Editorial presentation

**Status:** TODO

Render hero, rich text, image, video, gallery, look grid and product grid.

## V2-0503 — Buyer product grid

**Status:** TODO

Implement filters, product cards, quick view and selection tray.

## V2-0504 — Linesheet mode

**Status:** TODO

Implement compact table/list view with commercial data and quick selection.

## V2-0505 — Looks mode

**Status:** TODO

Implement look navigation and add whole/partial look to selection.

## V2-0506 — Product viewer

**Status:** TODO

Implement media, colour switch, price, sizes, delivery, MOQ, note and add-to-selection.

## V2-0507 — Showroom access grants

**Status:** TODO

Implement buyer-specific access, currency and price list.

## V2-0508 — Preview and publish

**Status:** TODO

Implement buyer-context preview, publish, schedule, unpublish and version notification.

## V2-0509 — Showroom session persistence

**Status:** TODO

Implement resume position and buyer interaction events respecting privacy.

---

# Phase 6 — Relationships, Buyers and Invitations

## V2-0601 — TradingRelationship

**Status:** TODO

Implement relationship aggregate and permission boundary.

## V2-0602 — Brand Buyer registry

**Status:** TODO

Implement companies, contacts, segments, assignments and activity.

## V2-0603 — Shop Brand registry

**Status:** TODO

Implement connected brands, invitations and access requests.

## V2-0604 — Campaign invitations

**Status:** TODO

Implement individual/segment invitations, status, resend and revoke.

## V2-0605 — Buyer-specific access and commercial context

**Status:** TODO

Implement price list, currency, collections, deadline and assigned sales manager.

---

# Phase 7 — Shop Buying Workspace

## V2-0701 — BuyingWorkspace domain

**Status:** TODO

Implement BuyingWorkspace, Selection, SelectionItem, BudgetPlan, BudgetAllocation.

## V2-0702 — Selection tray to workspace

**Status:** TODO

Selections from Showroom persist and appear in Buying Workspace.

## V2-0703 — Selection review

**Status:** TODO

Implement undecided/shortlisted/approved/excluded states, notes and filters.

## V2-0704 — Product comparison

**Status:** TODO

Implement side-by-side commercial comparison.

## V2-0705 — Budget panel

**Status:** TODO

Implement total/category/brand budget and selection comparison.

## V2-0706 — Team buying

**Status:** TODO

Implement collaborators, internal comments, assignments and approval readiness.

## V2-0707 — Convert selection to draft order

**Status:** TODO

Creates Order draft while preserving source links.

---

# Phase 8 — Order Builder

## V2-0801 — Order aggregate and versioning

**Status:** TODO

Implement Order, OrderVersion, OrderLine, DeliverySplit, validations and repository.

## V2-0802 — Builder shell and draft autosave

**Status:** TODO

Implement source rail, matrix canvas, totals inspector, autosave and save state.

## V2-0803 — Matrix editor

**Status:** TODO

Implement size/colour quantity grid, keyboard navigation, paste and totals.

Performance acceptance:

- no perceptible typing lag on large realistic matrix fixture;
- edits update totals immediately;
- virtualisation where required.

## V2-0804 — Undo/redo and conflict handling

**Status:** TODO

Implement command history and version conflict UI.

## V2-0805 — MOQ and pack validation

**Status:** TODO

Implement inline issues and explainable fixes.

## V2-0806 — Delivery splits

**Status:** TODO

Implement assignment/split across delivery windows and totals.

## V2-0807 — Commercial totals and budget

**Status:** TODO

Implement units, wholesale, retail, margin when permitted, order minimum and budget comparison.

## V2-0808 — Order collaboration

**Status:** TODO

Implement comments, mentions, presence foundation and change log.

## V2-0809 — Review and submit

**Status:** TODO

Implement review, validations, addresses/reference, terms acknowledgement and idempotent submit.

## V2-0810 — Order exports

**Status:** TODO

Implement PDF, XLSX and CSV from immutable submitted version.

---

# Phase 9 — Brand Order Review and Confirmation

## V2-0901 — Brand order inbox

**Status:** TODO

Implement submitted/review/changes requested/confirmed saved views.

## V2-0902 — Brand order review

**Status:** TODO

Implement line review, comments and commercial summary.

## V2-0903 — Order suggestions

**Status:** TODO

Implement non-destructive suggested changes.

## V2-0904 — Shop response to suggestions

**Status:** TODO

Implement accept/reject/edit/resubmit.

## V2-0905 — Confirm and cancel

**Status:** TODO

Implement idempotent confirmation, immutable confirmed version and cancellation policy.

---

# Phase 10 — DealSpace, Chat and Tasks

## V2-1001 — DealSpace aggregate

**Status:** TODO

Automatically link Brand, Shop, Campaign, Collection, Appointment and Order.

## V2-1002 — Conversation threads

**Status:** TODO

Implement contextual threads, messages, replies, mentions, reactions and unread.

## V2-1003 — Contextual comments

**Status:** TODO

Implement product, variant, order-line, document and appointment contexts.

## V2-1004 — Attachment panel

**Status:** TODO

Implement upload, preview, visibility and entity links.

## V2-1005 — Tasks from messages

**Status:** TODO

Implement create, assign, due date, complete and source-message link.

## V2-1006 — Shared/private notes

**Status:** TODO

Implement visibility-safe notes.

## V2-1007 — Activity timeline

**Status:** TODO

Combine important messages, meetings, files, tasks, selection and order events.

## V2-1008 — DealSpace search

**Status:** TODO

Search messages/files/tasks within permissions.

---

# Phase 11 — Calendar and Appointments

## V2-1101 — Calendar foundation

**Status:** TODO

Implement CalendarEvent, month/week/day/agenda and filters.

## V2-1102 — Appointment scheduling

**Status:** TODO

Implement propose, accept, decline, reschedule and cancel with time zones.

## V2-1103 — Appointment workspace

**Status:** TODO

Implement overview, agenda, files, notes, tasks and linked entities.

## V2-1104 — Live appointment room

**Status:** TODO

Implement shared showroom position, selection, chat, notes and follow-ups.

Native video can remain P1 if external meeting URL is complete and usable.

## V2-1105 — Meeting summary

**Status:** TODO

Implement manual summary and next actions. AI summary is a later task.

## V2-1106 — Calendar integrations

**Status:** TODO / P1

Google, Microsoft and ICS.

---

# Phase 12 — Documents and Analytics

## V2-1201 — Document library

**Status:** TODO

Implement canonical registry, filters, preview, access and entity links.

## V2-1202 — Linesheet PDF

**Status:** TODO

Generate from published collection version.

## V2-1203 — Order documents

**Status:** TODO

Generate immutable order PDF/XLSX/CSV.

## V2-1204 — Analytics event foundation

**Status:** TODO

Implement privacy-aware events and metric definitions.

## V2-1205 — Brand campaign analytics

**Status:** TODO

Invitation, showroom, selection, appointment and order funnel.

## V2-1206 — Shop buying analytics

**Status:** TODO

Budget, brand/category mix, order history and delivery mix.

---

# Phase 13 — Hardening and Commercial Readiness

## V2-1301 — Full permissions review

**Status:** TODO

Test all role/visibility boundaries.

## V2-1302 — Accessibility sign-off

**Status:** TODO

WCAG 2.2 AA on critical paths.

## V2-1303 — Performance sign-off

**Status:** TODO

Showroom media, large collections and large Order Builder matrices.

## V2-1304 — Responsive sign-off

**Status:** TODO

1440, 1280, iPad landscape and mobile review mode.

## V2-1305 — Security and audit sign-off

**Status:** TODO

Auth, file access, idempotency, audit and rate limits.

## V2-1306 — Golden path e2e

**Status:** TODO

```text
Brand creates campaign
→ collection
→ showroom
→ invites shop
→ appointment
→ shop selection
→ order builder
→ submit
→ brand changes/confirm
→ DealSpace history
```

## V2-1307 — Remove all demo/stub/dead-end surfaces

**Status:** TODO

Acceptance criteria:

- no `TODO`, `Coming soon`, non-working action or legacy mandatory route in launch scope.

---

# Phase 14 — Controlled Reuse from Current Syntha

This phase begins only after the V2 wholesale MVP works end-to-end.

## V2-1401 — Reuse assessment

**Status:** TODO

Evaluate current Syntha modules against `06_REUSE_FROM_SYNTHA.md`.

## V2-1402 — Optional product master adapter

**Status:** TODO / P1

Import commercial product data without importing old UI.

## V2-1403 — Optional production status extension

**Status:** TODO / future

Informational order status only; no production workspace until separate product scope is approved.

---

# Cursor task output template

For every task Cursor must produce:

```text
Task ID:
Status:
Files changed:
Domain changes:
API changes:
UI states implemented:
Tests added:
Commands run:
Known limitations:
Documentation updated:
```

# Release gates

## Foundation Gate

Phases 0–2 complete.

## Showroom Gate

Phases 3–6 complete; Brand can publish and Shop can review/select.

## Order Gate

Phases 7–9 complete; submitted and confirmed Order works end-to-end.

## Collaboration Gate

Phases 10–11 complete; DealSpace and appointments work.

## Commercial MVP Gate

Phases 12–13 complete; no launch-scope stubs or dead ends.