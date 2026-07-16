# File and Naming Rules

## 1. Goal

Files should be easy to locate, read, change and review without loading unrelated context.

## 2. One primary responsibility

A file should normally contain one of:

- one domain entity or policy;
- one command/query handler;
- one adapter;
- one screen;
- one focused UI component family;
- one test scenario group;
- one architecture decision.

Do not mix domain rules, API handling and UI rendering in one file.

## 3. Size thresholds

These are review triggers, not mechanical split rules.

| File type | Preferred | Review required |
|---|---:|---:|
| Domain policy/entity | ≤200 lines | >300 |
| Command/query handler | ≤180 lines | >250 |
| UI component | ≤220 lines | >320 |
| Screen composition | ≤280 lines | >400 |
| Test file | ≤300 lines | >450 |
| README/rule | ≤120 lines | >180 |
| Detailed specification | ≤250 lines | split by sub-flow when larger |

A split is useful only when new files have clear names and responsibilities.

## 4. Naming

- Directories and non-component files: `kebab-case`.
- React components/types: `PascalCase` exports.
- Use cases: `verb-noun`.
- Commands: `create-campaign.command.ts`.
- Command handlers: `create-campaign.handler.ts`.
- Queries: `get-campaign-overview.query.ts`.
- Policies: `can-publish-collection.policy.ts`.
- Ports: `campaign-repository.port.ts`.
- Adapters: `campaign-repository.pg.adapter.ts`.
- Domain events: `campaign-created.event.ts`.
- Read models: `campaign-overview.read-model.ts`.
- Components: `campaign-status-badge.tsx` or folder with `index.ts` when a family is needed.
- Tests: same base name plus `.test.ts`, `.integration.test.ts` or `.e2e.ts`.

Avoid generic names:

```text
utils.ts
helpers.ts
common.ts
manager.ts
service.ts
handler.ts
index2.ts
new-component.tsx
```

## 5. Barrel files

Use `index.ts` only as a deliberate public API.

Do not create barrels inside every folder. They hide dependency direction and increase accidental imports.

## 6. Co-location

Keep implementation and focused tests close when they change together.

Example:

```text
application/commands/create-campaign/
  create-campaign.command.ts
  create-campaign.handler.ts
  create-campaign.handler.test.ts
```

Use module-level `tests/integration` for scenarios spanning several files or adapters.

## 7. Screen files

A screen folder may contain:

```text
campaign-registry/
  campaign-registry.screen.tsx
  campaign-registry.loader.ts
  campaign-registry.actions.ts
  campaign-registry.mapper.ts
  campaign-registry.test.tsx
  index.ts
```

Do not split into files that only wrap one trivial function.

## 8. Documentation files

- Index files contain navigation and decisions only.
- Detailed behaviour belongs in the owning screen/module/workflow file.
- Never duplicate the same requirement in three documents.
- Link to the source of truth instead of copying paragraphs.
- Historical or replaced documents move to `docs/archive` and are excluded from normal context.

## 9. Comments

Comments explain why, invariants or external constraints.

Do not narrate obvious code.

Business decisions should link to a Capability, Workflow, Screen or ADR ID.

## 10. Exports

Exports should reveal intent:

```ts
export type { CampaignId, CampaignSummary };
export { createCampaign };
```

Avoid broad wildcard exports from internal folders.

## 11. Refactor trigger

Refactor when at least one is true:

- a file has more than one reason to change;
- tests require excessive setup for unrelated behaviour;
- the same section is frequently edited by different tasks;
- Cursor repeatedly needs to load the whole file for a small change;
- imports reveal mixed domain ownership;
- the file exceeds a threshold and has natural semantic boundaries.
