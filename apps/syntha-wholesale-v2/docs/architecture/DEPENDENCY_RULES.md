# Dependency Rules

## 1. Direction

Within a module:

```text
ui
→ application
→ domain

infrastructure
→ application ports
→ domain types
```

Domain never imports UI, framework, database, HTTP or vendor SDK code.

## 2. Allowed dependencies

| From | May import |
|---|---|
| `app` | module public APIs, `shared/ui`, runtime providers |
| module `ui` | same module application/public types, `shared/ui` |
| module `application` | same module domain, public contracts from other modules, shared application abstractions |
| module `domain` | same module domain, small shared domain primitives |
| module `infrastructure` | same module application/domain, external libraries |
| `shared` | only lower-level shared code; never business modules |

## 3. Cross-module rules

A module may not import another module’s internal path.

Allowed:

```ts
import { ResolveBuyerAccess } from '@/modules/relationships';
```

Forbidden:

```ts
import { AccessGrantRepository } from '@/modules/relationships/infrastructure/repository';
```

Cross-module calls must identify:

- contract owner;
- caller;
- transaction boundary;
- failure mode;
- event or response returned.

## 4. Circular dependency prevention

When modules need each other in both directions:

1. identify the real owner of the policy;
2. move only the neutral contract to the owner’s public API;
3. use an application event for asynchronous reaction;
4. never solve the cycle with a broad `shared/business` folder.

Example:

```text
Selection converts to Order
```

`buying` emits/provides a selection snapshot. `orders` creates the order. `buying` does not import order persistence and `orders` does not mutate selection tables directly.

## 5. Transaction boundaries

One module owns the primary transaction.

Cross-module effects use:

- application orchestration when consistency must be immediate;
- outbox events when eventual consistency is acceptable;
- idempotent consumers for repeated delivery.

A UI action cannot coordinate multiple repositories directly.

## 6. Data access

- UI never queries the database.
- Modules do not read other module tables directly.
- Read projections may combine module data through declared query services.
- Every tenant-scoped query validates active organisation and relationship.
- ORM models remain infrastructure-private.

## 7. Framework boundaries

Framework-specific files belong in:

- `app` for routing/runtime composition;
- module `ui` for framework components;
- module `infrastructure/api` for controllers/handlers.

Domain and application layers must be testable without starting Next.js or a database.

## 8. External integrations

Vendor SDKs stay inside `integrations` or a module adapter.

```text
vendor payload
→ adapter DTO
→ canonical application contract
→ domain/use case
```

Vendor types must not spread into product modules.

## 9. Shared UI

`shared/ui` owns primitives and stable patterns only.

Module-specific composites stay local until at least two modules need the same behaviour and API.

Visual similarity alone is not enough to move a component to shared.

## 10. Enforcement

Planned automated checks:

- path alias restrictions;
- no deep imports across modules;
- no `infrastructure` imports from domain/application consumers;
- no `testkit` imports in production;
- no legacy imports outside approved adapters;
- no direct database client usage in UI/application files.

A dependency exception requires an ADR with an expiry or removal plan.
