# Code Structure

## 1. Architectural style

Syntha Wholesale V2 uses a modular monolith with vertical business modules.

The application may later split services, but P0 keeps one deployable application and explicit internal boundaries.

## 2. Root structure

```text
src/
  app/                 route composition and runtime bootstrap
  modules/             business capabilities
  shared/              stable cross-cutting building blocks
  testkit/             test-only factories and adapters
  generated/           generated code; never edited manually
```

## 3. `src/app`

```text
app/
  routes/              framework route entry points
  layouts/             AppShell and route composition
  providers/           auth, query, i18n, telemetry providers
  middleware/          request/session composition only
  config/              runtime-safe application configuration
```

Rules:

- route files are thin;
- no domain calculations;
- no direct persistence access;
- no module-internal deep imports;
- routes call a module public API or render a module screen export.

## 4. `src/modules`

Initial modules:

```text
modules/
  identity/
  organisations/
  relationships/
  campaigns/
  catalogue/
  collections/
  showroom/
  buying/
  orders/
  dealspace/
  calendar/
  documents/
  analytics/
  integrations/
```

Each module follows the same internal pattern:

```text
modules/campaigns/
  README.md
  index.ts
  domain/
    entities/
    value-objects/
    policies/
    events/
    errors/
  application/
    commands/
    queries/
    ports/
    services/
    dto/
  infrastructure/
    persistence/
    api/
    mappers/
    adapters/
  ui/
    screens/
    components/
    hooks/
    state/
    mappers/
  tests/
    fixtures/
    integration/
```

Folders are created only when used. Empty ceremonial folders are forbidden.

## 5. Public module API

`index.ts` is the only supported cross-module import surface.

It may export:

- stable domain IDs and value objects;
- command/query interfaces;
- public read models;
- module events;
- route-level screens;
- explicit integration ports.

It must not export:

- persistence models;
- private UI helpers;
- internal repositories;
- ORM records;
- implementation-specific adapters.

Example:

```ts
import {
  CreateCampaign,
  CampaignId,
  CampaignCreated,
} from '@/modules/campaigns';
```

Forbidden:

```ts
import { CampaignRepositoryPg } from '@/modules/campaigns/infrastructure/persistence';
```

## 6. `src/shared`

```text
shared/
  domain/              Money, Currency, DateRange, EntityId
  application/         Result, Clock, IdGenerator, Transaction
  ui/                  canonical primitives and layouts
  infrastructure/      logging, telemetry, storage clients
  config/              validated configuration schema
  utils/               narrow pure utilities only
```

A file enters `shared` only when:

1. at least two modules need it;
2. it has no business-module ownership;
3. its API is stable enough to share;
4. moving it does not create a generic dumping ground.

Business rules such as MOQ validation remain in the owning module even when another module consumes the result.

## 7. `src/testkit`

```text
testkit/
  builders/
  fixtures/
  fakes/
  matchers/
  scenarios/
```

Production code cannot import from `testkit`.

Shared test fixtures model realistic Brand/Shop scenarios and use stable IDs from one source.

## 8. `src/generated`

Contains generated types, API clients or schemas.

Rules:

- generation source is committed;
- generated output is marked clearly;
- feature code imports through a small adapter when generated types are unstable;
- manual edits are rejected by CI.

## 9. Module interaction

Preferred order:

```text
public query/command contract
→ application service
→ domain policy
→ port
→ adapter
→ event/outbox
```

Cross-module interaction uses one of:

- public command/query;
- immutable public read model;
- domain/integration event;
- explicitly declared port.

Direct access to another module database table or repository is forbidden.

## 10. Data ownership examples

| Data | Owner |
|---|---|
| Campaign lifecycle | `campaigns` |
| Product master and variants | `catalogue` |
| Collection membership and release preparation | `collections` |
| Buyer-facing release and session | `showroom` |
| Private selection and buying decisions | `buying` |
| Order draft, version, revision and confirmation | `orders` |
| Brand-Shop relationship and grants | `relationships` |
| Messages, tasks and shared attachments | `dealspace` |

## 11. Avoid premature packages

Do not create separate workspace packages for every module during P0.

Split a package or service only when an ADR proves one of:

- independent deployment need;
- materially different scaling profile;
- security boundary;
- ownership by a separate team;
- dependency isolation impossible inside the modular monolith.
