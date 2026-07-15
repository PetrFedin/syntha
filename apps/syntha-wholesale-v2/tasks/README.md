# Cursor Task Queue

Эта папка содержит атомарные задачи реализации Syntha Wholesale V2.

## 1. Правила

- Один Markdown-файл — одна проверяемая задача.
- Имя: `TASK-0001-short-name.md`.
- Формат: `../docs/12_CURSOR_TASK_TEMPLATE.md` + требования Implementation Blueprint.
- Cursor выполняет только задачи со статусом `READY`.
- Одновременно один независимый кодовый контур имеет не более одной задачи `IN_PROGRESS`.
- Задача не переходит в `DONE`, пока не выполнены business outcome, permissions, events, tests, responsive and documentation.
- Новая функция сначала получает Capability ID, Workflow/Screen mapping и только затем task.
- Task не может менять Product Canon, Domain Model или Visual System молча.

## 2. Mandatory task metadata

```yaml
task_id: TASK-....
status: DRAFT|BLOCKED|READY|IN_PROGRESS|QA|DONE
priority: P0|P1|P2
product_area: ...
roles: []
capability_ids: []
workflow_ids: []
screen_ids: []
routes: []
entities: []
permissions: []
queries: []
commands: []
domain_events: []
notifications: []
integrations: []
dependencies: []
source_documents: []
```

Missing metadata keeps task `BLOCKED`.

## 3. Required source documents

Every task links to:

- Product Canon;
- Domain/Security documents;
- relevant screen-spec;
- Implementation Blueprint sections;
- API/Event/Integration contracts;
- visual/component contracts for UI tasks.

First-slice task mapping is also available in:

```text
../docs/implementation-blueprint/traceability-first-slice.json
```

## 4. Status lifecycle

```text
DRAFT
→ BLOCKED       prerequisites unresolved
→ READY         specification and dependencies approved
→ IN_PROGRESS   Cursor implementing
→ QA            code complete, tests/review active
→ DONE          all Definition of Done conditions passed
```

A task cannot be marked `READY` solely because a file exists.

## 5. Planned implementation sequence

### Phase A — Architecture and repository boundary

```text
TASK-0001 project boundary and commands
TASK-0002 architecture ADR package
TASK-0003 documentation/traceability guard
TASK-0004 test and CI foundation
```

### Phase B — Design System and AppShell

```text
TASK-0101 runtime design tokens
TASK-0102 UI primitives
TASK-0103 overlay and feedback components
TASK-0104 AppShell and responsive navigation
TASK-0105 Registry/Entity/Builder/Showroom/Split layouts
TASK-0106 DataTable and mobile list
TASK-0107 ProductCard/Gallery/Media
TASK-0108 MatrixEditor foundation
```

### Phase C — Identity, organisations and permissions

```text
TASK-0201 authentication/session
TASK-0202 organisation context and switcher
TASK-0203 membership/role/permission policies
TASK-0204 invitation security foundation
TASK-0205 team and assignment foundation
```

### Phase D — Campaign

```text
TASK-0301 Campaign aggregate/repository/events
TASK-0302 Campaign create/edit commands and screen
TASK-0303 Campaign registry projection and screen
TASK-0304 Campaign overview projection and screen
TASK-0305 Campaign lifecycle and readiness
TASK-0306 Campaign buyer access grants
TASK-0307 Campaign invitations and communication
```

### Phase E — Product catalogue and Collection

```text
TASK-0401 Product/Variant/SizeScale domain
TASK-0402 Price/Delivery/MOQ/Pack domain
TASK-0403 import mapping and job engine
TASK-0404 Collection aggregate/versioning
TASK-0405 Collection product management screen
TASK-0406 Collection overview/readiness
TASK-0407 Looks and StoryBlock domain
```

### Phase F — Showroom and publish

```text
TASK-0501 Showroom draft/release domain
TASK-0502 Showroom Composer shell/autosave
TASK-0503 canonical presentation renderers
TASK-0504 buyer access/pricing/visibility resolver
TASK-0505 Buyer Preview
TASK-0506 Publish Review and immutable release
TASK-0507 invitation acceptance onboarding
TASK-0508 Shop Showroom and session persistence
```

### Phase G — Selection and Order

```text
TASK-0601 BuyingWorkspace/Selection domain
TASK-0602 Selection tray and Showroom interactions
TASK-0603 Selection workspace
TASK-0604 Selection-to-Order conversion/lineage
TASK-0701 Order aggregate/versioning/totals
TASK-0702 Order Builder shell/autosave
TASK-0703 size-colour matrix and keyboard/paste
TASK-0704 delivery/pack/MOQ validation
TASK-0705 Order Validation/approval/submit
TASK-0706 Brand order inbox/detail
TASK-0707 revision comparison and resolution
TASK-0708 confirm/export/integration event
```

### Phase H — Collaboration and calendar

```text
TASK-0801 DealSpace domain and permissions
TASK-0802 contextual threads/messages/files/tasks
TASK-0803 Order DealSpace integration
TASK-0901 Calendar/Event/Appointment domain
TASK-0902 shared scheduling/reschedule flow
TASK-0903 live appointment/showroom context
```

### Phase I — Analytics and integrations

```text
TASK-1001 event/analytics ingestion
TASK-1002 campaign/showroom/order projections
TASK-1003 action queues and follow-ups
TASK-1101 integration registry and SyncRun
TASK-1102 CSV/XLSX import/export adapters
TASK-1103 ERP/PIM product-price-inventory ports
TASK-1104 confirmed order export adapter
```

## 6. Task readiness checklist

Before `READY`:

- [ ] Capability IDs exist.
- [ ] Workflow IDs exist.
- [ ] Screen spec status is DESIGNED or higher.
- [ ] Domain ownership/state is clear.
- [ ] Permissions and negative tests are clear.
- [ ] API queries/commands are clear.
- [ ] Events/notifications are clear.
- [ ] Integration source of truth is clear where relevant.
- [ ] UI components and responsive rules are known.
- [ ] ADR dependencies are approved.
- [ ] Acceptance criteria are testable.

## 7. Completion report

Every completed task reports:

- files changed;
- capabilities/workflows/screens completed;
- commands/events/permissions added;
- tests and results;
- responsive/accessibility evidence;
- known limitations;
- documentation/status updates.

## 8. Prohibited

- giant tasks such as `Build Showroom` or `Build Platform`;
- task without Capability ID;
- fake/demo-only mutation;
- hidden fallback to legacy/sample data;
- direct UI access to DB or vendor API;
- unapproved visual component;
- silent state-machine or permission changes;
- proceeding past a failed task dependency.

Machine task dependency graph:

```text
task-manifest.json
```
