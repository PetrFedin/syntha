# Syntha Wholesale V2 — Source Architecture

Код нового продукта должен находиться только в этой директории.

## Planned structure

```text
src/
  app/
    routes/
    layouts/
    providers/
  components/
    primitives/
    patterns/
    data-display/
    feedback/
  features/
    dashboard/
    campaigns/
    collections/
    showroom/
    buyers/
    appointments/
    buying/
    orders/
    dealspace/
    calendar/
    documents/
    analytics/
    settings/
  domain/
    identity/
    relationships/
    campaigns/
    collections/
    showroom/
    buying/
    orders/
    appointments/
    collaboration/
    documents/
    analytics/
  application/
    ports/
    use-cases/
    policies/
  infrastructure/
    persistence/
    api/
    storage/
    email/
    realtime/
    integrations/
  adapters/
    legacy-syntha/
  lib/
  tests/
```

## Dependency direction

```text
UI/features
    ↓
application/use-cases
    ↓
domain + ports
    ↑
infrastructure/adapters
```

Rules:

- `domain` imports nothing from React/Next/infrastructure.
- `application` depends on domain and port interfaces.
- `infrastructure` implements ports.
- `features` call use cases; they do not query persistence directly.
- `adapters/legacy-syntha` is the only allowed boundary for controlled legacy reuse.
- Shared UI is allowed only in `components`; features cannot create duplicate primitives.

## Feature module template

```text
features/campaigns/
  components/
  screens/
  hooks/
  mappers/
  tests/
  index.ts
```

Domain template:

```text
domain/campaigns/
  campaign.entity.ts
  campaign.types.ts
  campaign.policy.ts
  campaign.events.ts
  campaign.errors.ts
  campaign.test.ts
```

Application template:

```text
application/use-cases/campaigns/
  create-campaign.ts
  publish-campaign.ts
  invite-shop.ts
```

## Naming

- Components: PascalCase.
- Files: kebab-case except framework-required names.
- Use cases: verb-noun.
- Domain entities: singular.
- Ports: `*.port.ts`.
- Adapters: `*.adapter.ts`.
- Policies: `can-*.policy.ts` or explicit business name.
- Tests colocated or under feature `tests`, consistently chosen in foundation phase.

## Public imports

Every feature/domain package exposes an `index.ts`. Deep imports across feature boundaries are forbidden.

## State ownership

- Server state: query/data layer selected in ADR.
- Draft builder state: feature-local state machine/store with server version.
- UI ephemeral state: local component state.
- Global UI state: shell-only concerns.
- Domain state is never stored only in presentation components.

## Required checks before merge

- typecheck;
- lint;
- unit tests;
- component tests for changed complex UI;
- integration tests for write path;
- affected e2e flow;
- import-boundary guard;
- accessibility check;
- responsive screenshots for major screens.

## First implementation target

Start only with roadmap tasks:

1. `V2-0001`
2. `V2-0002`
3. `V2-0003`
4. `V2-0101`
5. `V2-0102`
6. `V2-0103`

Do not implement business modules before foundation gate.