# 12 — Cursor Task Template

Каждая задача для Cursor создаётся отдельным Markdown-файлом в `tasks/` и использует этот шаблон.

---

# TASK-[NNN] — [Короткое название]

## Status

`READY | IN_PROGRESS | BLOCKED | QA | DONE`

## Priority

`P0 | P1 | P2`

## Product area

`Foundation | Campaign | Collection | Showroom | Buying | Order | DealSpace | Calendar | Analytics | Settings`

## User role

`Brand | Shop | Shared`

## User problem

Одно проверяемое описание проблемы пользователя.

## Outcome

Какое изменение пользователь увидит после завершения задачи.

## Scope

### Included

- ...

### Excluded

- ...

## Dependencies

- TASK-...
- API/schema/component decisions.

## Source documents

- `docs/00_PRODUCT_CANON.md`
- `docs/02_FUNCTIONAL_MAP.md`
- relevant screen spec;
- relevant API/domain/component docs.

## Routes

```text
/v2/...
```

## Data contract

### Read model

```ts
// exact type or link to schema
```

### Commands

```ts
// exact command types
```

### Events

```text
entity.updated
```

## UI specification

### Layout

- workspace/entity/builder/split/focus;
- desktop dimensions;
- iPad behavior;
- inspector/drawer behavior.

### Components

Only canonical components from `docs/09_COMPONENT_LIBRARY.md`:

- ...

### Primary action

Exactly one primary action:

`[Label]`

### Secondary actions

- ...

### States

- loading;
- empty;
- error;
- forbidden;
- validation;
- success;
- conflict/version mismatch.

## Business rules

1. ...
2. ...

## Permissions

| Permission | Required for |
|---|---|
| `...` | ... |

## Analytics events

| Event | Trigger | Required properties |
|---|---|---|
| `...` | ... | ... |

## Accessibility

- keyboard path;
- focus order;
- labels;
- aria-live behavior;
- contrast/touch target requirements.

## Responsive

### Desktop 1440+

- ...

### Desktop 1280

- ...

### iPad landscape

- ...

### Narrow/mobile fallback

- ...

## Acceptance criteria

- [ ] User can ...
- [ ] Primary action ...
- [ ] No legacy route is opened.
- [ ] Loading/empty/error states implemented.
- [ ] Permission denied is handled server-side and in UI.
- [ ] URL state is stable and shareable where appropriate.
- [ ] Desktop and iPad reviewed.
- [ ] Tests pass.

## Tests

### Unit

- ...

### Integration

- ...

### E2E

```text
Given ...
When ...
Then ...
```

## Definition of done

- [ ] implementation complete;
- [ ] types and schemas complete;
- [ ] unit/integration/e2e tests complete;
- [ ] no direct legacy imports;
- [ ] no arbitrary visual values;
- [ ] no duplicate component;
- [ ] docs updated;
- [ ] UX review passed;
- [ ] security/permissions reviewed;
- [ ] task status set to DONE.

## Forbidden

- direct imports from `_ai-share/synth-1-full` legacy UI;
- links to legacy `/brand`, `/shop`, `/platform` flows;
- local button/table/empty-state implementations;
- demo-only hardcoded IDs;
- fake successful mutation without persistence;
- silent fallback to sample data;
- changing product scope without updating Product Canon.

## Implementation notes

Cursor records significant choices and deviations here.

## Completion report

When done, Cursor must report:

- files changed;
- tests run and results;
- acceptance criteria result;
- remaining known limitations;
- screenshots/visual verification references where available.
